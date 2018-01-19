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
#ifndef _IOBT_EVENT_H_INCLUDED
#define _IOBT_EVENT_H_INCLUDED

#include <pthread.h>
#include <stdint.h>
#include <bluetooth/btutils.h>

/*
 * This is our internal event data structure. This contains an
 * event, it's data and list pointer.
 */
typedef struct event_data {

	struct event_data *next;
	iobt_event_t *event;
} event_data_t;

/*
 * Standard linked list implementation, This list is thread safe
 */
typedef struct event_queue {

	event_data_t *head;
	event_data_t *tail;
	pthread_mutex_t mux;
	int count;

} iobt_event_queue_t;

__BEGIN_DECLS

/*
 * Create and event queue
 */
iobt_event_queue_t* iobt_event_queue_create();

/*
 * Insert an event a the tail of the queue. Memory
 * allocation is handled internally.
 */
void iobt_event_queue_insert(iobt_event_queue_t* evtq, uint32_t event, const char* data, uint32_t size);

/*
 * Clean up the memory from a single dequeued event
 */
void iobt_event_queue_cleanup(event_data_t* wd);

/*
 * Destroy the entire queue. Clean up any memory in the
 * the process.
 */
void iobt_event_queue_destroy(iobt_event_queue_t* evtq);

/*
 * Remove and event from the head of the list.
 */
event_data_t* iobt_event_queue_remove(iobt_event_queue_t* evtq);

/*
 * Return the number of events in the queue
 */
int iobt_event_queue_count(iobt_event_queue_t* evtq);

/*
 * Is the list empty?
 */
#define iobt_event_queue_empty( _evq ) ( _evq->head == _evq->tail )

__END_DECLS

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/iobt/public/bluetooth/iobt_event.h $ $Rev: 725214 $")
#endif
