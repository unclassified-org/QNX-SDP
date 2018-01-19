/* -*- Mode: C -*- */

/*
 * notification.h - Declaration of the Notification PPS object used by
 *      the HNM.
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

#ifndef __NOTIFICATION_H__
#define __NOTIFICATION_H__

#include <hnm/event.h>
#include <hnm/pps.h>

/* [[file:~/mainline/services/hmi-notification/doc/notification.org][hnm_Notification]] */
/* [[file:~/mainline/services/hmi-notification/doc/notification.org::*Clients][hnm_Notification_Client]] */
/**
 * hnm_Notification_Client - Structure used to represent a
 *      Notification client.
 *
 * This structure encapsulates data about clients that are subscribed
 * to the Notification PPS object.
 *
 * @id: The PPS Id of the subscribed client.
 */
typedef struct hnm_notification_client_s hnm_Notification_Client ;
struct hnm_notification_client_s {
        char*           id ;
} ;

/* hnm_Notification_Client ends here */

/**
 * hnm_Notification - A structure representing a Notification PPS
 *      object.
 *
 * This object is a specialization of the pps_Object structure that
 * provides a mechanism by which a notification manager can send
 * transient notifications to subscribed clients. This structure can
 * be used directly with pps_Object methods.
 */
typedef struct hnm_notification_s hnm_Notification ;
struct hnm_notification_s {
        PPS_OBJECT_BASE ;
        /* [[file:~/mainline/services/hmi-notification/doc/notification.org::*Clients][hnm_Notification-clients]] */
        /* The list of clients that have subscribed to the Notification PPS
         * object. */
        hnm_Notification_Client*        clients ;
        /* The number of clients that have subscribed to the Notification PPS
         * object. */
        int                             num_clients ;
        
        /* hnm_Notification-clients ends here */
} ;

/* hnm_Notification ends here */
/* [[file:~/mainline/services/hmi-notification/doc/notification.org][HNM_PPS_NOTIFICATION_OBJECT_PATH]] */
#define HNM_PPS_NOTIFICATION_OBJECT_PATH "Notification?server,nopersist"

/* HNM_PPS_NOTIFICATION_OBJECT_PATH ends here */
/* [[file:~/mainline/services/hmi-notification/doc/notification.org::*Clients][hnm_Notification_ppsHandler-prototype]] */
/**
 * hnm_Notification_ppsHandler - The callback used to handle PPS
 *      messages to the Notification object.
 *
 * This function parses an incoming PPS message and determines whether
 * to connect or disconnect the client from the Notification object.
 *
 * @pps_object: A pointer to the location in memory of a PPS
 *      Object. This object will provide the private data used by this
 *      callback to handle the request.
 */
void hnm_Notification_ppsHandler( pps_Object* pps_object ) ;

/* hnm_Notification_ppsHandler-prototype ends here */
/* [[file:~/mainline/services/hmi-notification/doc/notification.org::*Notification%20Messages][hnm_Notification_sendTransient-prototype]] */
/**
 * hnm_Notification_sendTransient - Send a transient notification
 *      request to all connected clients.
 *
 * This will construct a PPS object describing a transient
 * notification that must be shown by the HMI. This message will be
 * transmitted to each client that is connected to the Notification
 * object. Presumably, each connected client represents a different
 * HMI.
 *
 * @notification_obj: A pointer to the notification object that
 *      manages the connected client list. The clients of this server
 *      object will be notified of the transient message specified by
 *      event.
 * @event: The event structure that will be used to construct the
 *      transient notification. The ownership of this event is
 *      retained by the calling context which is responsible for
 *      deleting it.
 */
void hnm_Notification_sendTransient( hnm_Notification* notification_obj, const hnm_Event* event ) ;

/* hnm_Notification_sendTransient-prototype ends here */
/* [[file:~/mainline/services/hmi-notification/doc/notification.org::*Initialization][hnm_Notification_INITIALIZE]] */
/**
 * HNM_PPS_NOTIFICATION_INITIALIZE - Static initializer for the
 *      Notification PPS object.
 *
 * This will initialize a static declaration of an hnm_Notification
 * object. The type Id of the object is defined in the HNM header.
 */
#define HNM_PPS_NOTIFICATION_INITIALIZE {                          \
                .type = HNM_PPS_OBJECT_NOTIFICATION,               \
                .fd = -1,                                       \
                .path = HNM_PPS_NOTIFICATION_OBJECT_PATH,          \
                .pollfd = NULL,                                 \
                .object_data = NULL,                            \
                .pps_handler = hnm_Notification_ppsHandler,        \
                .pps_update = NULL,                             \
} ;

/* hnm_Notification_INITIALIZE ends here */

#endif  /* __NOTIFICATION_H__ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/mainline/services/hmi-notification/public/hnm/notification.h $ $Rev: 708280 $")
#endif
