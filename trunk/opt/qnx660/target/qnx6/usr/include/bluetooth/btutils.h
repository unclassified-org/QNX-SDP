/*
 * $QNXLicenseC:
 * Copyright 2008, QNX Software Systems. All Rights Reserved.
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

#ifndef BLUETOOTH_BTUTILS_H_INCLUDED
#define BLUETOOTH_BTUTILS_H_INCLUDED

/** @file bluetooth/btutils.h
 * io-bluetooth external API.
 * @ingroup ext_API Common External API
 */

#if !defined(__TYPES_H_INCLUDED)
#include <sys/types.h>
#endif

#if !defined(_INTTYPES_H_INCLUDED)
#include <inttypes.h>
#endif

__BEGIN_DECLS

/** @defgroup ext_API Common External API
 */
/*@{*/

/** Size of a Bluetooth Address */
#define IOBT_ADDR_SIZE 6   //XX:XX:XX:XX:XX:XX
#define IOBT_ADDR_STRING_SIZE (IOBT_ADDR_SIZE * 2) + (IOBT_ADDR_SIZE - 1) + 1 //the number of XX's plus the number of ':' plus the '\0 at the end
/** Structure containing a Bluetooth Address */
typedef struct iobt_addr {
	uint8_t addr[IOBT_ADDR_SIZE];
} iobt_addr_t;

/** Macro used to round up while advancing to next header in a buffer  */
#define ROUNDUP8(_x) (((unsigned)(_x) + (unsigned)7) & ~(unsigned)7)

/** An io-bluetooth event structure */
typedef struct iobt_event {
	uint32_t length; ///< Length in bytes, not including the header
	uint32_t type;
	char data[];
} iobt_event_t;

/**
 * Round the event length to find the next event in the buffer.
 * @param _evt The event header
 * @return The rounded length, in bytes
 */
#define iobt_event_next(_evt) (iobt_event_t *)ROUNDUP8((char *)_evt + \
                                        (sizeof(iobt_event_t) + _evt->length))

/**
 * Register for events
 *
 * @param btd The file descriptor of the manager.
 * @param events Not currently used. Leave as NULL
 * @return -1 on error, >=0 as bt handler
 */
int iobt_register_events(int btd, int events);

/**
 *  Read one or more events
 *
 *  Each event consists of a iobt_event_header_t possibly followed by
 *  additional data, and then possibly a few bytes of padding to ensure
 *  alignment.  If more than one event is returned, use the
 *  iobt_next_header() function to find the next header based on the
 *  previous header's address and contents.
 *
 *  This function never returns partial events, except that instead of
 *  the first event that doesn't fit into the remaining space in the buffer,
 *  it may return just its length.  In particular, that's what happens when the
 *  first event doesn't fit into the given buffer: the function returns four
 *  and stores the 32-bit event length in the buffer.  This allows the client
 *  to reallocate the buffer and retry the read.
 *
 *  @param btd The file descriptor to read events from.
 *  @param buf Buffer to read events into
 *  @param buf_len Length of the buffer, in bytes
 *
 *        At any given time, you can have at most one thread waiting for events or at most
 *        one sigevent armed.
 *
 *        There's a limit to the total size of unread events that io-media will
 *        hold for a client; when that limit overflows, all unread events
 *        and any subsequent events are thrown away.   If the client then calls
 *        iobt_read_events(), it fails with an \c EOVERFLOW, and then the queuing of
 *        events resumes.
 *
 *  @return The number of bytes read, or -1 on error
 */
ssize_t iobt_read_events(int btd, void *buf, size_t buf_len);

/**
 *  Parse a string into a iobt_addr_t struct.
 *
 *  @param data The string to parse. Should be null terminated.
 *  @param addr The structure that is populated.
 *
 *  @return The 0 if success, or -1 on error
 */
int iobt_parse_btaddr(const char* data, iobt_addr_t* addr);

/**
 *  Convert an iobt_addr_t struct to a ascii string
 *
 *  @param addr The structure that containing the adddr
 *  @param addrstr The ascii representation
 *
 *  @return a pointer to the formatted addrstr
 */
char* iobt_btaddr_toa(const iobt_addr_t* addr, char* addrstr);

/*@}*/

__END_DECLS

#endif /*BLUETOOTH_H_*/


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/btutils.h $ $Rev: 725212 $")
#endif
