/*****************************************************************************
 *
 * Filename:    slog2.h
 *
 * Created:     March 6, 2012
 *
 * Description: Public API for slog2
 *
 * Copyright 2012, QNX Software Systems. All Rights Reserved.
 *
 * You must obtain a written license from and pay applicable license fees to QNX
 * Software Systems before you may reproduce, modify or distribute this software,
 * or any work that includes all or part of this software.   Free development
 * licenses are available for evaluation and non-commercial purposes.  For more
 * information visit http://licensing.qnx.com or email licensing@qnx.com.
 *
 * This file may contain contributions from others.  Please review this entire
 * file for other proprietary rights or license notices, as well as the QNX
 * Development Suite License Guide at http://licensing.qnx.com/license-guide/
 * for other information.
 *
 ****************************************************************************/

#ifndef _SLOG2_H_INCLUDED
#define _SLOG2_H_INCLUDED

#include <stdio.h>
#include <string.h>
#include <stdarg.h>

__BEGIN_DECLS

/*--------------------------------------------------------------------------*/

#define SLOG2_MAX_BUFFERS    (4)

/*--------------------------------------------------------------------------*/
/**
  * Severity level definitions
  */
#define SLOG2_SHUTDOWN  0   /* Shut down the system NOW. eg: for OEM use */
#define SLOG2_CRITICAL  1   /* Unexpected unrecoverable error. eg: hard disk error */
#define SLOG2_ERROR     2   /* Unexpected recoverable error. eg: needed to reset a hw controller */
#define SLOG2_WARNING   3   /* Expected error. eg: parity error on a serial port */
#define SLOG2_NOTICE    4   /* Warnings. eg: Out of paper */
#define SLOG2_INFO      5   /* Information. eg: Printing page 3 */
#define SLOG2_DEBUG1    6   /* Debug messages eg: Normal detail */
#define SLOG2_DEBUG2    7   /* Debug messages eg: Fine detail */

/**
  * Indicates an invalid choice of verbosity/serverity
  */
#define SLOG2_INVALID_VERBOSITY ( (_Uint8t) -1 )

/**
  * Dump all logs that this process has permission to access
  */
#define SLOG2_DUMP_LOGS_ALL (1<<0)

/**
  * Flags supported by slog2_register
  */
#define SLOG2_ALLOC_TYPE_SHMEM (1<<0)   /* use an OS-managed shared memory object for the buffer set */

/*--------------------------------------------------------------------------*/
/**
 * Slog2 buffer is an opaque handle
 */
typedef struct slog2_buffer_meta* slog2_buffer_t;

/**
  * Struct containing the configuration data for a slog2 buffer.
  */
typedef struct
{
    /** What we want to name the buffer */
    const char    *buffer_name;
    /** The number of 4K pages this buffer contains */
    int            num_pages;
} slog2_buffer_config_t;

/**
 * Struct containing the configuration data for a slog2 buffer set. Each
 * buffer set contains one or more buffers.  The size of each buffer is
 * specified as a multiple of 4k pages.  The maximum number of buffers
 * is specified by SLOG2_MAX_BUFFERS.
 */
typedef struct
{
    /** Number of buffers to configure */
    int                   num_buffers;
    /** Process name, or other descriptor */
    const char           *buffer_set_name;
    /** The minimum severity to log */
    _Uint8t               verbosity_level;
    /** Buffer configuration for num_buffers */
    slog2_buffer_config_t buffer_config[ SLOG2_MAX_BUFFERS ];
} slog2_buffer_set_config_t;

/**
 * Enum of types for optional slog2fa parameter encoding
 */
typedef enum {
    SLOG2_FA_UNSIGNED = 0,
    SLOG2_FA_SIGNED   = (1<<14),
    SLOG2_FA_STRING   = (2<<14),
    SLOG2_FA_STAR     = (3<<14),
} slog2_fa_t;

/**
 * Helper parameter macros to build slog2fa parameters
 * Note 1: SLOG2_FA_END must be the last parameter
 *
 * Example usage:
 *  int8_t some_number = -1;
 *
 *  slog2fa( ..., ..., ..., "string:%s, some_number:%d, PI:%f",
 *                              SLOG2_FA_STRING( "Hello world" ),
 *                              SLOG2_FA_SIGNED( some_number ),
 *                              SLOG2_FA_DOUBLE( 3.141592 ),
 *                              SLOG2_FA_END );
 *
 * Example usage of the SLOG2_FA_STAR macro:
 *  slog2fa( ..., ..., ..., "%*s", SLOG2_FA_STAR( 20 ),
 *                                 SLOG2_FA_STRING( "Hello world" ),
 *                                 SLOG2_FA_END );
 *
 */
#define SLOG2_FA_SIZE_MASK 0x3fff
#define SLOG2_FA_TYPE_MASK 0xc000
#define SLOG2_FA_VAR_MASK 0xffff0000
#define SLOG2_FA_VAR_STR 0x0
#define SLOG2_FA_VAR_VAL 0x00010000
#define SLOG2_FA_NUMERIC( __x, __type ) ( SLOG2_FA_VAR_VAL | __type | (sizeof(__x) & SLOG2_FA_SIZE_MASK) ), (__x)

/* the helper parameter macros */
#define SLOG2_FA_UNSIGNED( __x )  SLOG2_FA_NUMERIC( (__x), SLOG2_FA_UNSIGNED )
#define SLOG2_FA_SIGNED( __x )    SLOG2_FA_NUMERIC( (__x), SLOG2_FA_SIGNED )
#define SLOG2_FA_CHAR( __x )      SLOG2_FA_UNSIGNED( __x )
#define SLOG2_FA_FLOAT( __x )     SLOG2_FA_UNSIGNED( __x )
#define SLOG2_FA_DOUBLE( __x )    SLOG2_FA_UNSIGNED( __x )
#define SLOG2_FA_STRING( __x )    ( SLOG2_FA_STRING | ((strlen(__x)+1) & SLOG2_FA_SIZE_MASK ) ), ( __x )
#define SLOG2_FA_STAR( __x )      ( SLOG2_FA_VAR_VAL | SLOG2_FA_STAR | sizeof(int) ), (int)( __x )
#define SLOG2_FA_END              0, 0

/*--------------------------------------------------------------------------*/
/**
 * Main slog2 API.  This function implements a printf() style ascii-text
 * print to the specified slog2 buffer.
 *
 * *NOTE* Do not use double or float arguments in an interrupt handler.
 *        Using double or float arguments in an interrupt handler will
 *        work if your code is compiled to use software floating point.
 *
 * @param buffer Handle of the selected buffer to log into, can be NULL only
 *               if slog2_set_default_buffer(...) was previously called
 * @param code User-specified code, not used internally by slog2
 * @param severity The severity level of this log item
 * @param format The printf-formatted char string used to define the log
 * @param ... An argument vector.
 * @return -1 on error, 0 on success
 */
int slog2f( slog2_buffer_t __buffer,
            _Uint16t __code,
            _Uint8t __severity,
            const char* __format,
            ... ) __attribute__ ((__format__(__printf__, 4, 5)));

/*--------------------------------------------------------------------------*/
/**
 * Same as slog2f except that a variable argument list is passed instead of
 * individual arguments.
 *
 * *NOTE* Do not use double or float arguments in an interrupt handler.
 *        Using double or float arguments in an interrupt handler will
 *        work if your code is compiled to use software floating point.
 *
 * @param buffer Handle of the selected buffer to log into, can be NULL only
 *               if slog2_set_default_buffer(...) was previously called
 * @param code User-specified code, not used internally by slog2
 * @param severity The severity level of this log item
 * @param format The printf-formatted char string used to define the log
 * @param arglist a va_list argument
 * @return -1 on error, 0 on success
 */
int vslog2f( slog2_buffer_t __buffer,
             _Uint16t __code,
             _Uint8t __severity,
             const char* __format,
             va_list __arglist ) __attribute__ ((__format__(__printf__, 4, 0)));

/*--------------------------------------------------------------------------*/
/**
 * This function writes to the buffer a printf() style format string along with
 * its arguments specified in the argument vector. The format string is not
 * decoded before writing, it must be decoded during the time of the read.
 *
 * *NOTE* If you are specifing a string with %s the size must include the NULL
 *        char.
 *
 * *NOTE* Do not use double or float arguments in an interrupt handler.
 *        Using double or float arguments in an interrupt handler will
 *        work if your code is compiled to use software floating point.
 *
 * You can use the following macros to build the parameters to slog2fa:
 *
 * SLOG2_FA_UNSIGNED( x )
 * SLOG2_FA_SIGNED( x )
 * SLOG2_FA_CHAR( x )
 * SLOG2_FA_FLOAT( x )
 * SLOG2_FA_DOUBLE( x )
 * SLOG2_FA_STRING( x )
 * SLOG2_FA_STAR( x )
 * SLOG2_FA_END
 *
 * Example usage:
 *  int8_t some_number = -1;
 *
 *  slog2fa( ..., "string:%s, some_number:%d", SLOG2_FA_STRING( "Hello world" ),
 *                                             SLOG2_FA_SIGNED( some_number ),
 *                                             SLOG2_FA_END );
 *
 * @param buffer Handle of the selected buffer to log into, can be NULL only
 *               if slog2_set_default_buffer(...) was previously called
 * @param code User-specified code, not used internally by slog2
 * @param severity The severity level of this log item
 * @param format The printf-formatted char string used to define the log
 * @param ... An argument vector that specifies the arguments for the format string
 *            Required: use the SLOG2_FA_UNSIGNED|SIGNED|STRING|CHAR|DOUBLE|FLOAT|STAR
 *                      helper macros for parameters. Last parameter in vector
 *                      must be SLOG2_FA_END.
 * @return -1 on error, 0 on success
 */
int slog2fa( slog2_buffer_t __buffer,
             _Uint16t __code,
             _Uint8t __severity,
             const char* __format,
             ... ) __attribute__ ((__format__(__printf__, 4, 0)));

/*--------------------------------------------------------------------------*/
/**
 * Log a constant string to the slog2 buffer.
 *
 * @param buffer Handle of the selected buffer to log into, can be NULL only
 *               if slog2_set_default_buffer(...) was previously called
 * @param code User-specified code, not used internally by slog2
 * @param severity The severity level of this log item
 * @param data Pointer to a constant string to log to the buffer
 * @return -1 on error, 0 on success
 */
int slog2c( slog2_buffer_t __buffer,
            _Uint16t __code,
            _Uint8t __severity,
            const char* __data );

/*--------------------------------------------------------------------------*/
/**
 * Adjusts the verbosity of the *entire buffer_set* that this buffer belongs
 * to. This value overrides the value set in the PPS object and updates
 * the PPS value.
 *
 * @param buffer Handle to the buffer that belongs to the buffer_set that
 *               will have its verbosity adjusted
 * @param verbosity The new verbosity setting
 * @return -1 on error, 0 on success
 */
int slog2_set_verbosity( slog2_buffer_t __buffer,
                         _Uint8t __verbosity );

/*--------------------------------------------------------------------------*/
/**
 * Returns the verbosity of the *entire buffer_set* that this buffer belongs
 * to.
 *
 * @param buffer Handle to the buffer that belongs to the buffer_set that
 *               will have its verbosity adjusted
 * @return the verbosity of the buffer_set or SLOG2_INVALID_VERBOSITY on error
 */
_Uint8t slog2_get_verbosity( slog2_buffer_t __buffer );

/*--------------------------------------------------------------------------*/
/**
 * Register a new instance of a slog2 buffer set.  Each buffer set contains one or more buffers.
 * The size of each buffer is specified as a multiple of 4k pages.  The maximum number of
 * buffers is specified by SLOG2_MAX_BUFFERS.
 *
 * @param config Pointer to a slog2 buffer configuration object
 * @param handles An array of handles to the buffers allocated
 * @param flags Bit OR of options for buffer management
 * @return -1 on error and handle data not guaranteed, 0 on success
 */
int slog2_register( const slog2_buffer_set_config_t *__config,
                    slog2_buffer_t *__handles,
                    _Uint32t __flags );

/*--------------------------------------------------------------------------*/
/**
 * Writes a snapshot of slog2 logs to a file with the same log
 * line format as slog2info.
 *
 * Example usage: writes only the logs from the current process
 *   FILE *file = fopen( "mylogs", "w" );
 *   slog2_dump_logs_to_file( file, 0 );
 *   fclose( file );
 *
 * Example usage: equivalent behavior to 'slog2info > mylogs'
 *   FILE *file = fopen( "mylogs", "w" );
 *   slog2_dump_logs_to_file( file, SLOG2_DUMP_LOGS_ALL );
 *   fclose( file );
 *
 * @param file FILE pointer
 * @param flags 0 or the following flag: SLOG2_DUMP_LOGS_ALL
 * @param argument list reserved for future use
 * @return -1 on error, 0 on success
 */
int slog2_dump_logs_to_file( FILE *__file, _Uint32t __flags, ... );

/*--------------------------------------------------------------------------*/
/**
 * Sets the default logging buffer. When the slog2 logging APIs are
 * called with a NULL buffer handle the log will be written to the default
 * logging buffer set by this function.
 *
 * @param buffer Handle of the buffer where default logs will go
 *               If buffer is NULL, default logging will be
 *               disabled. If buffer is -1 the default buffer handle is returned.
 * @return previous default buffer handle
 */
slog2_buffer_t slog2_set_default_buffer( slog2_buffer_t __buffer );

/*--------------------------------------------------------------------------*/
/**
 * Resets the state of slogger2 within the process. All resources used by
 * slogger2 within the process are released so any existing buffer
 * handle(s) will be invalid.
 *
 * @return -1 on error, 0 on success
 */
int slog2_reset( void );

__END_DECLS

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION( "$URL: http://svn/product/branches/6.6.0/trunk/lib/slog2/public/sys/slog2.h $ $Rev: 724903 $" )
#endif
