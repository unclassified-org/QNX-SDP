/**
 * @file terminals.h
 *
 * @brief For internal use only
 *
 * @details The @c terminals.h header is for internal use only.
 */
#ifndef _TERMINALS_H
#define _TERMINALS_H

#define CONFIRMATION_ID_CANCEL 0
#define CONFIRMATION_ID_YES    1
#define CONFIRMATION_ID_NO     2
#define CONFIRMATION_ID_HELP   10001 

#define NBEST_ID_CANCEL       0
#define NBEST_ID_LINE_1        1
#define NBEST_ID_LINE_2        2
#define NBEST_ID_LINE_3        3
#define NBEST_ID_LINE_4        4
#define NBEST_ID_LINE_5        5
#define NBEST_ID_HELP         10001

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/asr/core/public/asr/terminals.h $ $Rev: 730767 $")
#endif
