/*
 * $QNXLicenseC:
 * Copyright 2011, QNX Software Systems. All Rights Reserved.
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


/* Description: library that returns good quality entropy */

#ifndef ENTROPY_H_
#define ENTROPY_H_

#include <stdint.h>
#include <stdbool.h>

#define ENTROPY_LIB_VERSION             0x01                                /* modify this as changes are made to the library */
#define ENTROPY_HANDLER_MAGIC_COOKIE    (0x524E4700 | ENTROPY_LIB_VERSION)  /* "RNG" ascii - then version */
#define RNG_DATA_MAX_SIZE               256                                 /* maximum amount of entropy that can be requested at one time */

typedef enum {
    ENTROPY_SUCCESS = 0,
    ENTROPY_FAIL_BAD_PARAMETERS,
    ENTROPY_FAIL_REGISTER_NULL_FUNCTION,
    ENTROPY_FAIL_REGISTER_NULL_CONTEXT,
    ENTROPY_FAIL_NOT_REGISTERED,
    ENTROPY_FAIL_EXCEED_FEED_BYTES,
    ENTROPY_FAIL_SET_SCHED_PARAMS,
    ENTROPY_FAIL_SET_INHERIT_SCHED,
    ENTROPY_FAIL_THREAD_CREATION,
    ENTROPY_FAIL_NOT_RUNNING,
} entropy_return_status;


typedef bool (*entropy_add_fn)(uint8_t *buffer, uint32_t size);                                                 /* prototype for the app function registered to collect the entropy */
typedef entropy_return_status (*entropy_source_init_fn)(entropy_add_fn pfn, void *context);                     /* prototype for function entropy_source_init() which is called from the app */
typedef entropy_return_status (*entropy_source_start_fn)(const char *context);                                  /* prototype for function entropy_source_start() which is called from the app */


/* DLL exported functions */
entropy_return_status entropy_source_init(entropy_add_fn pfn, void *context);                                   /* Registers the function that will be receiving the entropy. */
entropy_return_status entropy_source_start(const char *context);                                                /* Starts a thread that feeds entropy to the registered function. Parameters, */
                                                                                                                /* how often, how much, are passed in context. */
entropy_return_status entropy_source_stop(void);                                                                /* Stop the thread that feeds entropy back into the app. */

#endif /* !ENTROPY_H_ */


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/random/public/entropy.h $ $Rev: 680334 $")
#endif
