/* -*- Mode: C -*- */

/* pps.h - Declaration of a generic PPS object structure.
 *
 * $QNXLicenseC:
 * Copyright 2013, QNX Software Systems. All Rights Reserved
 * 
 * This software is QNX Confidential Information subject to 
 * confidentiality restrictions. DISCLOSURE OF THIS SOFTWARE 
 * IS PROHIBITED UNLESS AUTHORIZED BY QNX SOFTWARE SYSTEMS IN 
 * WRITING.
 * 
 * You must obtain a written license from and pay applicable license 
 * fees to QNX Software Systems before you may reproduce, modify or 
 * distribute this software, or any work that includes all or part 
 * of this software. For more information visit 
 * http://licensing.qnx.com or email licensing@qnx.com.
 * 
 * This file may contain contributions from others.  Please review 
 * this entire file for other proprietary rights or license notices, 
 * as well as the QNX Development Suite License Guide at 
 * http://licensing.qnx.com/license-guide/ for other information.
 * $
 */
/**
  * @file pps.h
  *
  * @brief Declaration of a generic PPS object structure.
  */
  
#ifndef __PPS_OBJECT_H__
#define __PPS_OBJECT_H__
     
#include <sys/poll.h>
#include <sys/pps.h>

/* [[file:~/mainline/services/hmi-notification/doc/pps.org][pps_decoder_strerror]] */
/**
 * @brief Get the error message that corresponds to the decoder error code.
 *
 * Use the @e pps_decoder_strerror() function to determine the cause of a failure
 * reported by a PPS @e decoder object.
 *
 * @param code A @c pps_decoder error code for which a matching error message is being requested.
 * @return A string containing an error message that corresponds to the specified error @c code.
 */
const char* pps_decoder_strerror( pps_decoder_error_t code ) ;

/* pps_decoder_strerror ends here */
/* [[file:~/mainline/services/hmi-notification/doc/pps.org][pps_encoder_strerror]] */
/**
 * @brief Get the error message that corresponds to the encoder error code
 *
 * Use the @e pps_encoder_strerror() function to determine the cause of a failure
 * reported by a PPS @e encoder object.
 *
 * @param code A @c pps_encoder error code for which a matching error message is being requested.
 * @return A string containing an error message that corresponds to the specified error @c code.
 */
const char* pps_encoder_strerror( pps_encoder_error_t code ) ;

/* pps_encoder_strerror ends here */
/* [[file:~/mainline/services/hmi-notification/doc/pps.org][pps_Object]] */
/**
* @brief Type representing PPS object IDs.
*/
typedef unsigned pps_ObjectId ;
 
/**
 * @brief Alias for @c pps_object
 *
 * This is an alias for the @c pps_object structure.
 */
 typedef struct pps_object pps_Object ;
/** @def PPS_OBJECT_BASE
 * @c PPS_OBJECT_BASE defines the base structure for PPS objects.
 * 
 * @c PPS_OBJECT_BASE contains the following:
 * - @c type The object ID that identifies the derived object type.
 * - @c fd The file descriptor of the PPS object. This can be passed to a
 * @e poll() system call to wait for input on the associated PPS
 * object. If @c fd is less than zero, then the PPS object is currently closed.
 * - @c path The path of the PPS object. The length of the path can be a
 * maximum of 517 characters. This path is relative to the base
 * PPS URI assigned to the PPS Object subsystem.
 * - @c pollfd A pointer to a @c pollfd list entry used to poll for
 * events on the associated PPS object.
 * - @c object_data A pointer to object-specific data. This mechanism
 * provides some rudimentary polymorphism by associating object-specific 
 * member data with the high-level PPS object.
 * - @c pps_handler A pointer to a handler callback function that's
 * called by the HNM system whenever a PPS message is received
 * from a connecting client.
 * - @c pps_update Callback to push changes to the @c Status object to
 * subscribers of the PPS interface.
 *
 * NOTE: For the functions contained here, see <a href="pps.h_functions_overview.xml">Functions in pps.h</a>.
 */
  
/**
 * @brief PPS Object structure data.
 *
 * The @c pps_object structure provides a uniform interface for 
 * all PPS object definitions. To create a derived @c pps_Object type, declare
 * @c PPS_OBJECT_BASE as the first member and then declare any specialized members. This allows 
 * the specialized object to be processed via the various PPS functions defined here.
 */
 struct pps_object {
#define PPS_OBJECT_BASE                                                 \
        pps_ObjectId    type ;                                          \
        int             fd ;                                            \
        char            path[ 517 ] ;                                   \
        struct pollfd*  pollfd ;                                        \
        void*           object_data ;                                   \
        void            (*pps_handler)( pps_Object* object ) ;          \
        void            (*pps_update)( pps_Object* object ) ;           \
        int             (*open)( pps_Object* self, const char* basename ) ; \
        void            (*close)( pps_Object* self ) ;                  \
        int             (*read)( pps_Object* self, char** buffer ) ;    \
        int             (*write)( pps_Object* self, const char* pps_data, unsigned pps_data_size ) ; \
        int             (*addToPollList)( pps_Object* self, struct pollfd poll_list[], unsigned poll_list_size )
        PPS_OBJECT_BASE ;  /**< Defines the base structure for PPS objects. */
} ;

/* pps_Object ends here */
/* [[file:~/mainline/services/hmi-notification/doc/pps.org::*Functions][pps::Object::open-PROTO]] */
/**
* @brief Open or create the PPS object specified by the provided @c pps_Object instance
* 
* @param pps_object The @c pps_Object structure that represents the PPS object 
* that is being opened by this call.
* @param basename The base path where the PPS object can be found in the 
* filesystem (usually under @c /pps ).
* @return The file descriptor of the opened PPS object file.
*/
int pps_Object_open( pps_Object* pps_object, const char* basename ) ;
/* pps::Object::open-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/pps.org::*Functions][pps::Object::close-PROTO]] */
/**
* @brief Close the specified PPS object.
*
* The @e pps_Object_close() function closes the object that was previously opened 
* by @e pps_Object_open() (or by any other means). If the specified object doesn't correspond 
* to an open PPS object, this function has no effect.
*
* @param pps_object A pointer to the structure that represents the PPS object to be closed by this call. 
* If the object isn't open, this call has no effect.
*
* @return Nothing.
*/
void pps_Object_close( pps_Object* pps_object ) ;
/* pps::Object::close-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/pps.org::*Functions][pps::Object::read-PROTO]] */
/**
* @brief Stream data from the PPS object.
*
* Use the @e pps_Object_read() function to stream data from the PPS object one line at a time. 
* You must call this function consecutively as many times as required to read complete
* PPS messages that may span more than one line.
*
* @param pps_object A pointer to the structure that represents the PPS object to read data from. 
* This object must be open for the read function to complete successfully.
* @param buffer An output argument that provides a pointer to the buffer that was created to hold 
* data read from the PPS object. The ownership of the memory referenced by this argument is 
* transferred to the calling context responsible for deleting it.
* @return The number of bytes read from the PPS object.
*/
int pps_Object_read( pps_Object* pps_object, char** buffer ) ;
/* pps::Object::read-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/pps.org::*Functions][pps::Object::write-PROTO]] */
/**
* @brief Send a stream of PPS data to a PPS object.
*
* @param pps_object A pointer to the structure that represents the PPS object to write data to. 
* This object must be open for the write function to complete successfully.
* @param pps_data A buffer containing the PPS string data to write to the PPS object. 
* This data must be NUL-terminated character data that represents valid PPS messages.
* @param pps_data_size The number of bytes of PPS data contained in the data buffer. 
* The maximum PPS message size is 1024 bytes.
* @return The number of bytes that were actually written to the PPS object.
*/
int pps_Object_write( pps_Object* pps_object, const char* pps_data, unsigned pps_data_size ) ;
/* pps::Object::write-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/pps.org::*Functions][pps::Object::addToPollList-PROTO]] */
/**
* @brief Add an open PPS object to the specified poll list.
*
* The @e pps_Object_addToPollList() function adds an open PPS object to the specified poll list 
* and then updates the PPS object's @c poll_fd member to point to the poll entry that corresponds 
* to the object. This allows the revents mask associated with the PPS object to be accessed directly 
* via the object's structure.
*
* @param pps_object A pointer to the structure that represents the PPS object's file descriptor 
* to be added to the specified poll list.
* @param poll_list An array that represents the list of file descriptors to poll. The specified PPS object 
* will be added to this list if possible.
* @param poll_list_size The size of the provided poll list. This represents the maximum number of 
* file descriptors that can be added to the list.
* @return The index of the current structure in the poll list.
*/
int pps_Object_addToPollList( pps_Object* pps_object, struct pollfd poll_list[], unsigned poll_list_size ) ;
/* pps::Object::addToPollList-PROTO ends here */

#endif  /* __PPS_OBJECT_H__ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/hmi-notification/public/hnm/pps.h $ $Rev: 730777 $")
#endif
