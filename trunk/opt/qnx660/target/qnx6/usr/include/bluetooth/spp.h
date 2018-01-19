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
#if !defined(BLUETOOTH_IOBT_SPP_H_INCLUDED)
#define BLUETOOTH_IOBT_SPP_H_INCLUDED

#if !defined(__TYPES_H_INCLUDED)
#include <sys/types.h>
#endif

#ifndef BLUETOOTH_BTUTILS_H_INCLUDED
#include <bluetooth/btutils.h>
#endif

__BEGIN_DECLS

/** @file bluetooth/spp.h
 * io-bluetooth Serial Port Profile Protocol external API.
 * @ingroup extSPP_API SPP External API
 */

/** @defgroup extSPP_API SPP External API
 */
/*@{*/

/** Function types used by iobt_spp_ioctl*/
typedef int iobt_spp_ioctl_func_t;

/** @name Function Types
 *  iobt_spp_ioctl function types
 * @{*/
#define IOBT_SPP_IOC_NREAD              0    /**< Returns number of bytes in read buffer */
#define IOBT_SPP_IOC_NWRITE             1    /**< Returns number of bytes in write buffer */
#define IOBT_SPP_IOC_FLUSH              2    /**< Discards all bytes in read and write buffers */
#define IOBT_SPP_IOC_RFLUSH             3    /**< Discards all bytes in read buffer */
#define IOBT_SPP_IOC_WFLUSH             4    /**< Discards all bytes in write buffer */
#define IOBT_SPP_IOC_CANCEL             5    /**< Cancels a blocked read or write */
#define IOBT_SPP_IOC_RBUFSET            6    /**< Sets size of receive buffer */
#define IOBT_SPP_IOC_WBUFSET            7    /**< Sets size of transmit buffer */
#define IOBT_SPP_IOC_SETBAUD            8    /**< Set the baud rate */
#define IOBT_SPP_IOC_GETBAUD            9    /**< Get the baud rate */
#define IOBT_SPP_IOC_GET_DATAFORMAT     10   /**< Get stopbits, charsize, parity, flow control */
#define IOBT_SPP_IOC_SET_DATAFORMAT     11   /**< Set stopbits, charsize, parity, flow control */
#define IOBT_SPP_IOC_STOPBITS           12   /**< Set number of stop bits */
#define IOBT_SPP_IOC_CHARSIZE           13   /**< Set character size */
#define IOBT_SPP_IOC_PARITY             14   /**< Set parity */
#define IOBT_SPP_IOC_GET_MODEM_STATUS   15   /**< Get modem status */
#define IOBT_SPP_IOC_SET_MODEM_CONTROL  16   /**< Set modem control */
#define IOBT_SPP_IOC_GET_LINE_STATUS    17   /**< Get line status */
#define IOBT_SPP_IOC_GET_FLOWCONTROL    18   /**< Get flow control settings */
#define IOBT_SPP_IOC_SET_FLOWCONTROL    19   /**< Set flow control settings */
#define IOBT_SPP_IOC_SET_DEVICEID       20   /**< Set Remote DeviceId for client port */
/**@}*/

/* * iobt_spp_baudrate_t type */
typedef int iobt_spp_baudrate_t;
/** @name Baud Rates
 *  iobt_spp_ioctl 'arg' points to this type when setting/getting Baud Rates
 * @{*/
#define IOBT_SPP_BAUD_2400      0
#define IOBT_SPP_BAUD_4800      1
#define IOBT_SPP_BAUD_9600      2
#define IOBT_SPP_BAUD_19200     3
#define IOBT_SPP_BAUD_38400     4
#define IOBT_SPP_BAUD_57600     5
#define IOBT_SPP_BAUD_115200    6
/**@}*/

/* * iobt_spp_dataformat_t type */
typedef int iobt_spp_dataformat_t;
/** @name Data Formats
 *  iobt_spp_ioctl 'arg' points to this type when setting/getting Data Formats
 * @{*/
#define     IOBT_SPP_STOP_MASK           0x0003
#define     IOBT_SPP_STOP_BITS_1         0x0000
#define     IOBT_SPP_STOP_BITS_2         0x0001
#define     IOBT_SPP_STOP_BITS_1_5       0x0002
#define     IOBT_SPP_CHAR_MASK           0x000c
#define     IOBT_SPP_CHAR_SIZE_5         0x0000
#define     IOBT_SPP_CHAR_SIZE_6         0x0004
#define     IOBT_SPP_CHAR_SIZE_7         0x0008
#define     IOBT_SPP_CHAR_SIZE_8         0x000c
#define IOBT_SPP_PARITY_ENABLE_MASK      0x0010
#define     IOBT_SPP_PAR_NONE            0x0000
#define     IOBT_SPP_PAR_ENABLE          0x0010
#define IOBT_SPP_PARITY_TYPE_MASK        0x0060
#define     IOBT_SPP_PAR_ODD             0x0000
#define     IOBT_SPP_PAR_EVEN            0x0020
#define     IOBT_SPP_PAR_MARK            0x0040
#define     IOBT_SPP_PAR_SPACE           0x0060
#define IOBT_SPP_FLOW_MASK               0x0300
#define     IOBT_SPP_FLOW_NONE           0x0000
#define     IOBT_SPP_FLOW_RTS_CTS        0x0100
#define     IOBT_SPP_FLOW_DTR_DSR        0x0200
#define     IOBT_SPP_FLOW_XON_XOFF       0x0300
/**@}*/

/** iobt_spp_modemstatus_t type */
typedef int iobt_spp_modemstatus_t;
/** @name Modem Status
 *  iobt_spp_ioctl 'arg' points to this type when setting/getting modem status.
 * @{*/
#define IOBT_SPP_MODEM_STATUS_DSR    0x01
#define IOBT_SPP_MODEM_STATUS_CTS    0x02
#define IOBT_SPP_MODEM_STATUS_RI     0x04
#define IOBT_SPP_MODEM_STATUS_DCD    0x08
#define IOBT_SPP_MODEM_STATUS_DTR    IOBT_SPP_MODEM_STATUS_DSR /** Bits for modem status (DTE->DCE) */
#define IOBT_SPP_MODEM_STATUS_RTS    IOBT_SPP_MODEM_STATUS_CTS /** Bits for modem status (DTE->DCE) */
/** @}*/

/** iobt_spp_linestatus_t type */
typedef int iobt_spp_linestatus_t;
/** @name Modem Status
 *  iobt_spp_ioctl 'arg' points to this type when setting/getting line status.
 * @{*/
#define IOBT_SPP_LINE_STATUS_OVR     0x01
#define IOBT_SPP_LINE_STATUS_PARITY  0x02
#define IOBT_SPP_LINE_STATUS_FRAMING 0x04
/** @}*/

/**
 * Performs various functions on an open io-bluetooth spp device
 *
 * @param fd valid file descriptor returned by open
 * @param function function to be performed
 * @param arg pointer to function-specific argument
 *                 (see types iobt_spp_baudrate_t, iobt_spp_modemstatus_t, iobt_spp_linestatus_t & iobt_spp_dataformat_t)
 *
 * @return 0 on success, -1 on error with errno set
 */
int iobt_spp_ioctl(int fd, iobt_spp_ioctl_func_t func, void *arg);

/*@}*/

__END_DECLS

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/spp.h $ $Rev: 725212 $")
#endif
