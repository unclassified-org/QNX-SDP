/*
 * $QNXLicenseC:  
 * Copyright 2012, QNX Software Systems. All Rights Reserved.
 *
 * This source code may contain confidential information of QNX Software 
 * Systems (QSS) and its licensors.  Any use, reproduction, modification, 
 * disclosure, distribution or transfer of this software, or any software 
 * that includes or is based upon any of this code, is prohibited unless 
 * expressly authorized by QSS by written agreement.  For more information 
 * (including whether this source code file has been published) please
 * email licensing@qnx.com.
 * $
 */
#ifndef __CHARCONV_H__
#define __CHARCONV_H__

#include <mm/charconvert2.h>

__BEGIN_DECLS

/**
 * This is the list of encoding hint.
 */
#define CHAR_FORMAT_ISO8859_1    ("iso8859-1")
#define CHAR_FORMAT_ISO8859_2    ("iso8859-2")
#define CHAR_FORMAT_UTF16BE      ("utf16be")
#define CHAR_FORMAT_UTF16LE      ("utf16le")
#define CHAR_FORMAT_UTF16        ("utf16")
#define CHAR_FORMAT_UTF32BE      ("utf32be")
#define CHAR_FORMAT_UTF32LE      ("utf32le")
#define CHAR_FORMAT_UTF32        ("utf32")
#define CHAR_FORMAT_UTF8         ("utf8")
#define CHAR_FORMAT_SHIFTJIS     ("shift_jis")
#define CHAR_FORMAT_KOI8U        ("koi8-u")
#define CHAR_FORMAT_ISO2022_CN   ("iso2022-cn")
#define CHAR_FORMAT_WINDOWS_1251 ("windows-1251")

/**
 * Load and initialize the character convert library.
 *
 * @param cfg A path of a configuration file. If the parameter is null, will
 *            select a default configuration file.
 *                "/etc/mm/mm-charconv.conf"
 *            (Could override using MM_CHARCONV_CONFIG of an environment value)
 *
 * @return -1 on error. Should call charconv_err() for error string.
 * @return  0 on success.
 *
 * @attention If a plug-in is not specified "intentionally", will try to load
 *            v1 library.
 */
int charconv_load_init(const char *cfg);

/**
 * Returns a string for the current error.
 *
 * @return A pointer to a string describing the error.
 */
const char *charconv_err(void);

/**
 * Set character convert library parameters.
 *
 * @param params             String to be passed to the library.
 * @param v1_allow_detection For v1 libraries, allow detection(0=no, 1=yes).
 *
 * @return -1 on error.
 * @return  0 on success.
 */
int charconv_setparams(const char *params, int v1_allow_detection);

/**
 * Unload the character convert library.
 */
void charconv_unload();

/**
 * Create a new group.
 *
 * Groups are not thread safe objects.
 * It is up to the caller to make sure a group object is only in use
 * by a single thread at a time.
 *
 * @param srctype A string describing the source for this group's strings.
 *
 * @return NULL on error.
 * @return A group pointer on success.
 */
convert_group_t *charconv_newgroup(const char *srctype);

/**
 * Destroy a conversion group.
 *
 * @param grp A pointer to the group to be destroyed.
 */
void charconv_endgroup(convert_group_t *grp);

/**
 * Provide strings to a group to detect character encoding.
 *
 * @param grp  A pointer to the group.
 * @param data A pointer to the source buffer.
 * @param len  The size of the source buffer in bytes(include null, if known to be in buffer).
 * @param bpc  Byte count hint.
 * @param hint Encoding hint.
 *
 * @return -1 on error.
 * @return  0 on success.
 */
int charconv_detect_string(convert_group_t *grp, const void *data, size_t len, convert_bpc_t bpc, const char *hint);

/**
 * Convert a string to UTF-8 encoding.
 *
 * @param grp   A pointer to the group.
 * @param src   A pointer to the source buffer.
 * @param len   The size of the source buffer in bytes(include null, if known to be in buffer).
 * @param bpc   Byte count hint.
 * @param hint  Encoding hint.
 * @param buf   Output buffer pointer.
 * @param blen  Size of output buffer in bytes.
 * @param flags Flags as described in convert_string_flags.
 *
 * @return -1 on error.
 * @return A converted string size(not include null) on success.
 */
ssize_t charconv_convert_string(convert_group_t *grp, const void *src, size_t len, convert_bpc_t bpc, const char *hint, unsigned char *buf, size_t blen, unsigned flags);

__END_DECLS

#endif /* __CHARCONV_H__ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/charconv/public/mm/charconv.h $ $Rev: 703058 $")
#endif
