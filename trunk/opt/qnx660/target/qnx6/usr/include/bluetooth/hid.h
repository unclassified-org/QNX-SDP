/*
 * $QNXLicenseC:
 * Copyright 2009, QNX Software Systems. All Rights Reserved.
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
#if !defined(BLUETOOTH_HID_H_INCLUDED)
#define BLUETOOTH_HID_H_INCLUDED

#if !defined(__TYPES_H_INCLUDED)
#include <sys/types.h>
#endif

#ifndef BLUETOOTH_BTUTILS_H_INCLUDED
#include <bluetooth/btutils.h>
#endif

__BEGIN_DECLS

/** @file bluetooth/hid.h
 * io-bluetooth Human Interface Device Profile external API.
 * @ingroup ext HID_API HID External API
 */

/** @defgroup ext HID_API HID External API
 */
/*@{*/

#define IOBT_HID_MAX_DESCRIPTOR_LEN         500

typedef uint8_t iobt_hid_result_t;
/** @name HID result
 *  A HID result values
 *  @{*/
#define IOBT_HID_RESULT_SUCCESS              0
#define IOBT_HID_RESULT_NOT_READY            1
#define IOBT_HID_RESULT_INVALID_REPORT_ID    2
#define IOBT_HID_RESULT_UNSUPPORTED_REQUEST  3
#define IOBT_HID_RESULT_INVALID_PARAMETER    4
#define IOBT_HID_RESULT_UNKNOWN              5
#define IOBT_HID_RESULT_FATAL                6
/**@}*/

typedef uint8_t iobt_hid_query_type_t;
/** @name HID query type
 *  A HID query type values
 *  @{*/
#define IOBT_HID_MANUFACTURER                0
#define IOBT_HID_PRODUCT                     1
#define IOBT_HID_SERIAL                      2

/**@}*/

typedef uint8_t iobt_hid_protocol_t;
/** @name HID protocol
 *  A HID protocol selection
 *  @{*/
#define IOBT_HID_REPORT   1 /**< Default HID protocol is for Reports  */
#define IOBT_HID_BOOT     0 /**< Can set the HID protocol for Boot, where one can flash roms */
/**@}*/

typedef uint16_t iobt_hid_idle_rate_t;
/** @name HID Idle rate
 *  A HID idle rate value */

typedef uint8_t iobt_hid_report_type_t;
/** @name HID report type
 *  A HID Report type selection
 *  @{*/
#define IOBT_HID_REPORT_OTHER    0
#define IOBT_HID_REPORT_INPUT    1
#define IOBT_HID_REPORT_OUTPUT   2
#define IOBT_HID_REPORT_FEATURE  3
/**@}*/

typedef uint8_t iobt_hid_control_t;
/** @name HID control type
 *  A HID Contrl type selection
 *  @{*/
#define IOBT_HID_CTRL_NOP                   0
#define IOBT_HID_CTRL_HARD_RESET            1
#define IOBT_HID_CTRL_SOFT_RESET            2
#define IOBT_HID_CTRL_SUSPEND               3
#define IOBT_HID_CTRL_EXIT_SUSPEND          4
#define IOBT_HID_CTRL_VIRTUAL_CABLE_UNPLUG  5
/**@}*/

/** report structure */
typedef struct iobt_hid_report {
	iobt_hid_report_type_t reportType; /* Report type (input, output, or feature) */
	uint16_t dataLen; /* Length of the report data (max) to return */
	uint8_t data[]; /* Pointer to report data */
} iobt_hid_report_t;

/** report structure request */
typedef struct iobt_hid_report_req {
	iobt_hid_report_type_t reportType; /* Report type (input, output, or feature) */
	uint8_t useId; /* Set to TRUE if reportId should be used */
	uint8_t reportId; /* The report ID (optional) */
	uint16_t bufferSize; /* max buffer size for returning events to be */
} iobt_hid_report_req_t;

typedef struct iobt_hid_interrupt {
	iobt_hid_report_type_t reportType; /* Report type (input, output, or feature) */
	uint16_t dataLen; /* Length of the report data (max) to return */
	uint8_t data[]; /* Pointer to report data */
} iobt_hid_interrupt_t;

/** HID device usage descriptor */
typedef struct iobt_hid_descriptor {
	uint16_t vendorID; /* Vendor ID.*/
	uint16_t productID; /* Product ID.*/
	uint16_t version; /* Product Version.*/
	uint16_t descriptorLen; /* Length of the HID descriptor list.*/
	uint8_t descriptorList[IOBT_HID_MAX_DESCRIPTOR_LEN];
} iobt_hid_descriptor_t;

typedef uint16_t iobt_hid_event_t;
/** @name HID event type
 *  A HID event type selection
 *  @{*/
#define IOBT_HID_QUERY_CNF                        1 /* event when string or descriptor information is desired query structure follows the event */
#define IOBT_HID_VIRTUAL_CABLE_UNPLUG             2 /* event when the control event virtually unplugged */
#define IOBT_HID_UNKNOWN_CONTROL_EVENT            3 /* unknown control event (device profile oriented) */
#define IOBT_HID_UNKNOWN_TRANSACTION_IND          4 /* unknown transaction type returned from the stack */
#define IOBT_HID_GETREPORT_RSP                    5 /* Response for a get_report call, report and data follows the event */
#define IOBT_HID_GETPROTOCOL_RSP                  6 /* Response for a get_protocol call, protocol follows the event */
#define IOBT_HID_GETIDLE_RSP                      7 /* Response for a get_idlerate call, idlerate follows the event */
#define IOBT_HID_GETREPORT_COMPLETE               8 /* Response for get_report call, when all responses are complete. */
#define IOBT_HID_GETPROTOCOL_COMPLETE             9 /* Response for get_protocol call, when all responses are complete. */
#define IOBT_HID_GETIDLE_COMPLETE                10 /* Response for get_idlerate call, when all responses are complete. */
#define IOBT_HID_SETREPORT_COMPLETE              11 /* Response for set_report call, when all responses are complete.*/
#define IOBT_HID_SETPROTOCOL_COMPLETE            12 /* Response for set_protocol call, when all responses are complete.*/
#define IOBT_HID_SETIDLE_COMPLETE                13 /* Response for set_idlerate call, when all responses are complete.*/
#define IOBT_HID_INTERRUPT                       14 /* interrupt event with device data following the event */
#define IOBT_HID_INTERRUPT_COMPLETE              15 /* interrupt event when all events with continuous data are complete */
#define IOBT_HID_SETREPORT_RSP                   16 /* Response for the set_report call */
/**@}*/

/**
 * Send a command to get a report. This will come back on a event.
 *
 * @param fd The file descriptor of our profile.
 * @param report Pointer to the type of report we are looking to get.
 *
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hid_get_report(int fd, const iobt_hid_report_req_t *report);

/**
 * Send a command to set the report
 *
 * @param fd The file descriptor of our profile.
 * @param report of type iobt_hid_report_t described above.
 *
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hid_set_report(int fd, const iobt_hid_report_t *report);

/**
 * Send a command to set the protocol
 *
 * @param fd The file descriptor of our profile.
 * @param protocol Pointer to iobt_hid_protocol_t to set. see description of iobt_hid_protocol_t above
 *
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hid_set_protocol(int fd, iobt_hid_protocol_t protocol);

/**
 * Send a command to get the protocol. This will be returned in
 * and event.
 *
 * @param fd The file descriptor of our profile.
 *
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hid_get_protocol(int fd);

/**
 * Send a command to get the idle rate, This will be returned in
 * an event.
 *
 * @param fd The file descriptor of our profile.
 *
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hid_get_idle_rate(int fd);

/**
 * Send a command to get the idle rate
 *
 * @param fd The file descriptor of our profile.
 * @param idlerate Pointer to iobt_hid_idle_rate_t to set. see description of iobt_hid_idle_rate_t above
 *
 * @return 0 on success, -1 on error with errno set
 */
int iobt_hid_set_idle_rate(int fd, iobt_hid_idle_rate_t idlerate);

/**
 * Reset the HID device (Currently not supported)
 *
 * @param fd The file descriptor of our profile.
 *
 * @return 0 on success, -1 on error with errno set (ENOSUP)
 */
int iobt_hid_reset(int fd);

/**
 * get a string of the descriptor of the connected HID device.
 * 
 * @param fd The file descriptor of our profile.
 * @param type HID query type enumerated above.
 *
 * @return 0 on success, -1 on error with errno set (ENOSUP)
 *           returning descriptors are in events IOBT_HID_QUERY_CNF
 */
int iobt_hid_getstring(int fd, int type);

/**
 * Query the device for the descriptor table.
 *
 * @param fd The file descriptor of our profile.
 *
 * @return 0 on success, -1 on error with errno set (ENOSUP)
 *           returning descriptors are in events IOBT_HID_QUERY_CNF
 */
int iobt_hid_query(int fd);

/**
 * Send a HID control transaction.
 *
 * @param fd The file descriptor of our profile.
 * @param control The control transaction type.
 *
 * @return 0 on success, -1 on error with errno set (ENOSUP)
 */
int iobt_hid_send_control(int fd, iobt_hid_control_t control);

/**
 * Send an interrupt report
 * NOTE: This function is just used for BT-Cert backdoor
 * testing.
 *
 * @param fd The file descriptor of our profile.
 * @param report The report to send.
 *
 * @return 0 on success, -1 on error with errno set (ENOSUP)
 */
int iobt_hid_send_interrupt(int fd, const iobt_hid_report_t *report);

/*@}*/

__END_DECLS

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/hid.h $ $Rev: 725212 $")
#endif
