/*
 * $QNXtpLicenseC:
 * Copyright 2007, 2009, QNX Software Systems. All Rights Reserved.
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
 * $
 */

/*
 * Copyright (c) 1994-2000 by P.J. Plauger.  ALL RIGHTS RESERVED.
 * Consult your license regarding permissions and restrictions.
 */

#ifndef _STDIO_H_INCLUDED

#if defined(__WATCOMC__) && !defined(_ENABLE_AUTODEPEND)
#pragma read_only_file;
#endif

#ifndef __PLATFORM_H_INCLUDED
#include <sys/platform.h>
#endif

#if !defined(__cplusplus) || defined(_STD_USING) || defined(_GLOBAL_USING)
#define _STDIO_H_INCLUDED
#endif

#ifndef _STDIO_H_DECLARED
#define _STDIO_H_DECLARED

#include <_pack64.h>

_C_STD_BEGIN

#define _HAS_DINKUM_CLIB 1

#if defined(__SIZE_T)
typedef __SIZE_T    size_t;
#undef __SIZE_T
#endif

#ifndef _SYSCH_T
typedef char _Sysch_t;
#define _SYSCH_T
#endif

_C_STD_END

#if defined(__OFF_T)
typedef __OFF_T     off_t;
#undef __OFF_T
#endif

#if defined(__OFF64_T)
typedef __OFF64_T   off64_t;
#undef __OFF64_T
#endif

#ifndef NULL
# define NULL _NULL
#endif

#define BUFSIZ          1024        /*  Default buffer size                 */
#define _NFILES         16          /*  minimum guaranteed open files       */
#define FILENAME_MAX    255

#define _IOFBF      0   /* full buffering */
#define _IOLBF      1   /* line buffering */
#define _IONBF      2   /* no buffering */
_C_STD_BEGIN
#ifdef __FILE_T_DEF
/* Expand to generate definition of the type.  */
__FILE_T_DEF;
#undef __FILE_T_DEF
#endif
#ifdef __FILE_T
/* Usual typedefs. */
typedef __FILE_T _Filet;
typedef _Filet          FILE;
#undef __FILE_T
#endif

_C_STD_END


_C_STD_BEGIN
#define _FD_TYPE        int
#define __iobuf         _Filet

#if defined(__FPOS_T)
typedef __FPOS_T        fpos_t;
#undef __FPOS_T
#endif

_C_STD_END

#define FOPEN_MAX   _NFILES         /*  same as _NFILES                     */

__BEGIN_DECLS

extern _CSTD FILE *_Files[FOPEN_MAX];

/*
 *  Define macros to access the three default file pointer (and descriptors)
 *  provided to each process by default.  They will always occupy the
 *  first three file pointers in each processes' table.
 */

#define stdin       (&_CSTD _Stdin)     /* standard input file  */
#define stdout      (&_CSTD _Stdout)     /* standard output file */
#define stderr      (&_CSTD _Stderr)     /* standard error file  */
_C_STD_BEGIN
extern FILE _Stdin, _Stdout, _Stderr;
_C_STD_END

#define EOF         (-1)                /*  End of File/Error return code   */

#if defined(__SLIB_DATA_INDIRECT) && !defined(_Multi_threaded) && !defined(__SLIB)
  int *__get_Multi_threaded_ptr(void);
  #define _Multi_threaded (*__get_Multi_threaded_ptr())
#else
  extern int          _Multi_threaded;  /*  Non-zero if pthread_create ever called */
#endif
#if !defined(__EXT_POSIX1_199506)
#define _Multi_threaded         0       /* If threads not needed, don't check for them */
#endif

#define SEEK_SET    0                   /*  Seek relative to start of file  */
#define SEEK_CUR    1                   /*  Seek relative to current positn */
#define SEEK_END    2                   /*  Seek relative to end of file    */

#define _MULTI_THREAD       1           /* 0 for no thread locks */

_C_STD_BEGIN
#if _MULTI_THREAD
# define _Lockfile(str)        _Lockfilelock(str)
# define _Unlockfile(str)      _Unlockfilelock(str)
void _Lockfilelock(_Filet *);
void _Unlockfilelock(_Filet *);
#else /* _MULTI_THREAD */
# define _Lockfile(x)          (void)0
# define _Unlockfile(x)        (void)0
#endif /* _MULTI_THREAD */
_C_STD_END

#if defined(__EXT_POSIX1_199009)
# if !defined(__EXT_POSIX1_200112)      /*  removed legacy interface        */
#  define L_cuserid   14                /*  Max length of login names       */
# endif
# define L_ctermid   16                 /*  Max length of terminal names    */
# define P_tmpdir    "/tmp"             /*  Temporary file directory        */
#endif
#define L_tmpnam    255                 /*  Max length of tmp file names    */
#define TMP_MAX     (26*26*26)          /*  Max times tmpnam can be called  */

#ifdef __EXT_LF64SRC
extern _CSTD FILE *fopen64(const char *__filename, const char *__mode) __ALIASOFF("fopen");
extern _CSTD FILE *freopen64(const char *__filename, const char *__mode, _CSTD FILE *__fp) __ALIASOFF("freopen");
extern _CSTD FILE *tmpfile64(void) __ALIASOFF("tmpfile");
extern int fseeko64(_CSTD FILE *__fp, off64_t __offset, int __whence) __ALIASOFF("fseeko");
extern off64_t ftello64(_CSTD FILE *__fp) __ALIASOFF("ftello");
#if defined(__EXT_LF64ALIAS) && !defined(__ALIAS_ATTRIBUTE)
#error ALIAS not configured for compiler: fopen,freopen,tmpfile,fseeko,ftello
#endif
#endif

#if defined(__EXT_UNIX_HIST) || defined(__EXT_POSIX1_200112)
extern char *ctermid(char *__s);
#endif
#if defined(__EXT_UNIX_HIST)
extern int getw(_CSTD FILE *__fp);
#endif

_C_STD_BEGIN

extern void clearerr(FILE *__fp);
extern int fclose(FILE *__fp);
extern int feof(FILE *__fp);
extern int ferror(FILE *__fp);
extern int fflush(FILE *__fp);
extern int fgetc(FILE *__fp);
extern int fgetpos(FILE *__fp, fpos_t *__pos);
extern char *fgets(char *__s, int __n, FILE *__fp);
extern FILE *fopen(const char *__filename, const char *__mode) __ALIAS64("fopen64");
extern int fprintf(FILE *__fp, const char *__format, ...);
extern int fputc(int __c, FILE *__fp);
extern int fputs(const char *__s, FILE *__fp);
extern size_t fread(void *__ptr, size_t __size, size_t __n, FILE *__fp);
extern FILE *freopen(const char *__filename, const char *__mode, FILE *__fp) __ALIAS64("freopen64");
extern int fscanf(FILE*__fp, const char *__format, ...);
extern int fseek(FILE *__fp, long int __offset, int __whence);
extern int fsetpos(FILE *__fp, const fpos_t *__pos);
extern long ftell(FILE *__fp);
extern size_t fwrite(const void *__ptr, size_t __size, size_t __n, FILE *__fp);
extern char *gets(char *__s);
extern void perror(const char *__s);
extern int printf(const char *__format, ...);
extern int puts(const char *__s);
extern int remove(const char *__filename);
extern int rename(const char *__old, const char *__new);
extern void rewind(FILE *__fp);
extern int scanf(const char *__format, ...);
extern void setbuf(FILE *__fp, char *__buf);
extern int setvbuf(FILE *__fp, char *__buf, int __mode, size_t __size);
extern int sprintf(char *__s, const char *__format, ...);
extern int sscanf(const char *__s, const char *__format, ...);
extern FILE *tmpfile(void) __ALIAS64("tmpfile64");
extern char *tmpnam(char *__s);
extern int ungetc(int __c, FILE *__fp);
extern int vfprintf(FILE *__fp, const char *__format, __NTO_va_list __arg);
extern int vprintf(const char *__format, __NTO_va_list __arg);
extern int vsprintf(char *__s, const char *__format, __NTO_va_list __arg);
extern int vsnprintf(char *__s, size_t __size, const char *__format, __NTO_va_list __arg) __attribute__((__format__(__printf__, 3, 0)));
extern FILE *fdopen(int __handle, const char *__mode);
extern int fileno(_CSTD FILE *__fp);

_C_STD_END

extern int fseeko(_CSTD FILE *__fp, off_t __offset, int __whence) __ALIAS64("fseeko64");
extern off_t ftello(_CSTD FILE *__fp) __ALIAS64("ftello64");

#ifdef __EXT_FUNCALIAS64
# ifdef __ALIAS_ATTRIBUTE
/* Use __ALIAS64 define */
# elif defined(__WATCOMC__)
#  pragma aux fopen "fopen64";
#  pragma aux freopen "freopen64";
#  pragma aux tmpfile "tmpfile64";
#  pragma aux fseeko "fseeko64";
#  pragma aux ftello "ftello64";
# elif defined(_PRAGMA_REDEFINE_EXTNAME)
#  pragma redefine_extname fopen fopen64
#  pragma redefine_extname freopen freopen64
#  pragma redefine_extname tmpfile tmpfile64
#  pragma redefine_extname fseeko fseeko64
#  pragma redefine_extname ftello ftello64
# else
#  define fopen fopen64
#  define freopen freopen64
#  define tmpfile tmpfile64
#  define fseeko fseeko64
#  define ftello ftello64
# endif
#endif


#if !defined(__EXT_POSIX1_200112)   /* remove legacy interface */
extern int putw(int __w, _CSTD FILE *__stream);
#endif
extern int snprintf(char *__s, _CSTD size_t __size, const char *__format, ...) __attribute__((__format__(__printf__, 3, 4)));

#if defined(__EXT_QNX)
extern _CSTD FILE *_fsopen(const char *__filename, const char *__mode, int __shflag);
extern int _grow_handles(int __new_count);
extern int fcloseall(void);
extern int fgetchar(void);
extern int flushall(void);
extern int fputchar(int __c);
# ifdef _this_belongs_in_a_private_qnx_header
extern int _input_line_max;            /* defaults to 20 */
char *input_line(_CSTD FILE *, char *, int);
# endif
#endif

#if defined(__EXT_QNX) || defined(__EXT_POSIX1_200112)
extern int vfscanf(_CSTD FILE *__fp, const char *__format, __NTO_va_list __arg) __attribute__((__format__(__scanf__, 2, 0)));
extern int vscanf(const char *__format, __NTO_va_list __arg) __attribute__((__format__(__scanf__, 1, 0)));
extern int vsscanf(const char *__s, const char *__format, __NTO_va_list __arg) __attribute__((__format__(__scanf__, 2, 0)));
#endif

#if defined(__EXT_UNIX_HIST)
#if defined(__SLIB_DATA_INDIRECT) && !defined(optind) && !defined(__SLIB)
   int *__get_optind_ptr(void);
   #define optind (*__get_optind_ptr())
#else
   extern int   optind;        /*  index of current option being scanned */
#endif

#if defined(__SLIB_DATA_INDIRECT) && !defined(optarg) && !defined(__SLIB)
   char **__get_optarg_ptr(void);
   #define optarg (*__get_optarg_ptr())
#else
   extern char *optarg;        /*  points to optional argument */
#endif

#if defined(__SLIB_DATA_INDIRECT) && !defined(opterr) && !defined(__SLIB)
   int *__get_opterr_ptr(void);
   #define opterr (*__get_opterr_ptr())
#else
   extern int   opterr;        /*  print|don't print error message */
#endif

#if defined(__SLIB_DATA_INDIRECT) && !defined(optopt) && !defined(__SLIB)
   int *__get_optopt_ptr(void);
   #define optopt (*__get_optopt_ptr())
#else
   extern int   optopt;        /*  offending letter when error detected */
#endif

extern int      getopt(int __argc, char * const __argv[], const char *__optstring);
#endif

#if defined(__EXT_XOPEN_EX) || defined(__EXT_POSIX1_200112)
extern _CSTD FILE *popen(const char *__filename, const char *__mode);
extern int pclose(_CSTD FILE *__stream);
#endif

#if defined(__EXT_XOPEN_EX)
extern char *tempnam(const char *__dir, const char *__pfx);
#endif

__END_DECLS

#if defined(__cplusplus) && !defined(_NO_CPP_INLINES)

_C_STD_BEGIN

/* inlines, for C++ */

inline int getc(FILE *_Str)
    {   /* get a character */
    return (((_Multi_threaded || _Str->_Next >= _Str->_Rend)
        ? fgetc(_Str) : *_Str->_Next++)); }

inline int getchar()
    {   /* get a character from stdin */
    return (((_Multi_threaded || _Files[0]->_Next >= _Files[0]->_Rend)
    ? fgetc(_Files[0]) : *_Files[0]->_Next++)); }

inline int putc(int _C, FILE *_Str)
    {   /* put a character */
    return (((_C == '\n' || _Multi_threaded || _Str->_Next >= _Str->_Wend)
        ? fputc(_C, _Str) : (*_Str->_Next++ = (unsigned char)_C))); }

inline int putchar(int _C)
    {   /* put a character to stdout */
    return (((_C == '\n' || _Multi_threaded || _Files[1]->_Next >= _Files[1]->_Wend)
    ? fputc(_C, _Files[1]) : (*_Files[1]->_Next++ = (unsigned char)_C))); }

_C_STD_END

# if defined(__EXT_POSIX1_199506)

inline int getc_unlocked(_CSTD FILE *_Str)
    {   /* get a character */
    return ((_Str->_Next < _Str->_Rend
        ? *_Str->_Next++ : _CSTD fgetc(_Str))); }

inline int getchar_unlocked()
    {   /* get a character from stdin */
    return ((_Files[0]->_Next < _Files[0]->_Rend
    ? *_Files[0]->_Next++ : _CSTD fgetc(_Files[0]))); }

inline int putc_unlocked(int _C, _CSTD FILE *_Str)
    {   /* put a character */
    return (((_C != '\n' && _Str->_Next < _Str->_Wend)
        ? (*_Str->_Next++ = (unsigned char)_C) : _CSTD fputc(_C, _Str))); }

inline int putchar_unlocked(int _C)
    {   /* put a character to stdout */
    return (((_C != '\n' && _Files[1]->_Next < _Files[1]->_Wend)
    ? (*_Files[1]->_Next++ = (unsigned char)_C) : _CSTD fputc(_C, _Files[1]))); }

# endif

#else /* defined(__cplusplus) && !defined(_NO_CPP_INLINES) */

__BEGIN_DECLS

_C_STD_BEGIN

extern int getc(FILE *__fp);
extern int getchar(void);
extern int putc(int __c, FILE *__fp);
extern int putchar(int __c);

_C_STD_END

# if defined(__EXT_POSIX1_199506)
extern int getc_unlocked(_CSTD FILE *__fp);
extern int getchar_unlocked(void);
extern int putc_unlocked(int __c, _CSTD FILE *__fp);
extern int putchar_unlocked(int __c);
# endif

__END_DECLS

# ifdef __GNUC__
#  define getc(__fpin)											\
	({															\
		FILE * const __fp = (__fpin);							\
		((_Multi_threaded || (__fp)->_Next >= (__fp)->_Rend) ?	\
		 (fgetc)(__fp) : *(__fp)->_Next++);						\
	})
#  define getchar() getc(_Files[0])
#  define putc(__cin, __fpin)											\
	({																	\
		const int __c = (__cin);										\
		FILE * const __fp = (__fpin);									\
		((__c == '\n' || _Multi_threaded || (__fp)->_Next >= (__fp)->_Wend) ? \
		 (fputc)(__c, __fp) : (*(__fp)->_Next++ = __c));				\
	})

#  define putchar(__c) putc(__c, _Files[1])
# endif

# if defined(__EXT_POSIX1_199506)
#  ifdef __GNUC__
#   define getc_unlocked(__fpin)				\
	({											\
		FILE * const __fp = (__fpin);			\
		((__fp)->_Next >= (__fp)->_Rend ?		\
		 (fgetc)(__fp) : *(__fp)->_Next++);		\
	})
#   define getchar_unlocked() getc_unlocked(_Files[0])
#   define putc_unlocked(__cin, __fpin)						\
	({														\
		const int __c = (__cin);							\
		FILE * const __fp = (__fpin);						\
		(__c == '\n' || (__fp)->_Next >= (__fp)->_Wend ?	\
		 (fputc)(__c, __fp) : (*(__fp)->_Next++ = __c));	\
	})
#   define putchar_unlocked(__c) putc_unlocked(__c, _Files[1])
#  endif
# endif

#endif

#if defined(__EXT_POSIX1_199506)
__BEGIN_DECLS
extern void flockfile(_CSTD FILE *__fp);
extern int ftrylockfile(_CSTD FILE *__fp);
extern void funlockfile(_CSTD FILE *__fp);
__END_DECLS
#endif      /* POSIX 1995 */

#if __GNUC__ && __USE_FORTIFY_LEVEL > 0
#include <stdio_chk.h>
#endif

#include <_packpop.h>

#endif

#ifdef _STD_USING
using _CSTD fdopen; using _CSTD fileno;
using _CSTD size_t; using _CSTD fpos_t; using _CSTD FILE;
using _CSTD clearerr; using _CSTD fclose; using _CSTD feof;
using _CSTD ferror; using _CSTD fflush; using _CSTD fgetc;
using _CSTD fgetpos; using _CSTD fgets; using _CSTD fopen;
using _CSTD fprintf; using _CSTD fputc; using _CSTD fputs;
using _CSTD fread; using _CSTD freopen; using _CSTD fscanf;
using _CSTD fseek; using _CSTD fsetpos; using _CSTD ftell;
using _CSTD fwrite; using _CSTD getc; using _CSTD getchar;
using _CSTD gets; using _CSTD perror;
using _CSTD putc; using _CSTD putchar;
using _CSTD printf; using _CSTD puts; using _CSTD remove;
using _CSTD rename; using _CSTD rewind; using _CSTD scanf;
using _CSTD setbuf; using _CSTD setvbuf; using _CSTD sprintf;
using _CSTD sscanf; using _CSTD tmpfile; using _CSTD tmpnam;
using _CSTD ungetc; using _CSTD vfprintf; using _CSTD vprintf;
using _CSTD vsprintf; using _CSTD vsnprintf;
#endif /* _STD_USING */

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/c/public/stdio.h $ $Rev: 735298 $")
#endif
