/*
 * $QNXLicenseC:
 * Copyright 2007, QNX Software Systems. All Rights Reserved.
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
#ifndef _IOBT_RES_H_INCLUDED
#define _IOBT_RES_H_INCLUDED

#include <atomic.h>
#include <errno.h>
#include <malloc.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/dispatch.h>
#include <sys/iofunc.h>
#include <sys/resmgr.h>

#include <bluetooth/iobt_event.h>

typedef struct iobt_ocb {
	iofunc_ocb_t ocb;
	struct iobt_ocb *next;
	int flag;
	iobt_event_queue_t *evq;
	iofunc_notify_t notify[3];
} iobt_ocb_t;

typedef struct iobt_res_handle {
	iofunc_attr_t iobt_attr;
	resmgr_connect_funcs_t iobt_connect;
	resmgr_io_funcs_t iobt_io;
	int resid;
	dispatch_t *dpp;
	pthread_rwlock_t ocb_rwlock;
	iobt_ocb_t *ocb_list;

} iobt_res_handle_t;

__BEGIN_DECLS

/*
 * Initialize a io-bluetooth resource manage mount point. This must be
 * done before attaching.
 */
int iobt_res_init_handle(iobt_res_handle_t *rh, dispatch_t *dpp);

/*
 * Attach an io-bluetooth resource manage mount point
 */
int iobt_res_attach(iobt_res_handle_t *rh, char *prefix, char *profile);

/*
 * Detach an iobluetooth  resource manage mount point
 */
int iobt_res_detach(iobt_res_handle_t *rh);

/*
 * Register for an event queue on a OCB.
 */
int iobt_set_eventq(iobt_ocb_t *o);

/*
 * Add an event to a resource manager mount point. This will be
 * distributed to all OCB's with a registered event queue.
 */
int iobt_add_event(iobt_res_handle_t *rh, uint32_t eid, const char* data, uint32_t size);

/*
 * Write the events to the client
 */
int iobt_return_events(iobt_ocb_t *o, int rcvid, int rcvlen);

__END_DECLS

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/iobt/public/bluetooth/iobt_res.h $ $Rev: 725214 $")
#endif
