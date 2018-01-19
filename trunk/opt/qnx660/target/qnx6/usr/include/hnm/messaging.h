/* -*- Mode: C -*- */

/*
 * messaging.h - Declaration of the Messaging PPS object used by
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
 
/**
  * @file messaging.h
  *
  * @brief Declaration of the @c Messaging PPS object used by the HNM.
  */
 
 
#ifndef __MESSAGING_H__
#define __MESSAGING_H__

#include <hnm/event.h>
#include <hnm/pps.h>

/* [[file:~/mainline/services/hmi-notification/doc/messaging.org][hnm_Messaging]] */
/* [[file:~/mainline/services/hmi-notification/doc/messaging.org::*Clients][hnm_Messaging_Client]] */

/**
 * @brief Alias for @c hnm_messaging_client_s
 *
 * This is an alias for the @c hnm_messaging_client_s structure.
 */
typedef struct hnm_messaging_client_s hnm_Messaging_Client ;
/**
 * @brief Structure used to represent a Messaging client.
 *
 * The @c hnm_messaging_client_s structure encapsulates data about clients that subscribe
 * to the @c Messaging PPS object.
 */
struct hnm_messaging_client_s {
        char*           id ; /**< The PPS ID of the subscribed client. */
} ;

/* hnm_Messaging_Client ends here */
 
 /**
 * @brief Alias for @c hnm_messaging_s
 *
 * This is an alias for the @c hnm_messaging_s structure.
 */
typedef struct hnm_messaging_s hnm_Messaging ;

/**
 * @brief A structure representing the @c Messaging PPS object.
 *
 * This object is a specialization of the @c #pps_Object structure that
 * provides a mechanism that a notification manager can use to send
 * transient notifications to subscribed clients. This structure can
 * be used directly with @c pps_Object methods.
 */
struct hnm_messaging_s {
        PPS_OBJECT_BASE ; /**< Defines the base structure for PPS objects. */
        /* [[file:~/mainline/services/hmi-notification/doc/messaging.org::*Clients][hnm_Messaging-clients]] */        
        hnm_Messaging_Client*        clients ; /**< The list of clients that have subscribed to the Messaging PPS object. */	
        int                             num_clients ; /**< The number of clients that have subscribed to the Messaging PPS object. */
        
        /* hnm_Messaging-clients ends here */
} ;

/* hnm_Messaging ends here */
/* [[file:~/mainline/services/hmi-notification/doc/messaging.org][HNM_PPS_MESSAGING_OBJECT_PATH]] */
/**
 * @brief Definition of the PPS path for the @c Messaging object.
 *
 * The @c Messaging object is created as a <em>server object</em> with persistence
 * disabled. Clients connect to the @c Messaging server to receive
 * messages informing them that a transient notification is ready to be
 * displayed.
 */
#define HNM_PPS_MESSAGING_OBJECT_PATH "Messaging?server,nopersist"

/* HNM_PPS_MESSAGING_OBJECT_PATH ends here */
/* [[file:~/mainline/services/hmi-notification/doc/messaging.org::*Clients][hnm_Messaging_ppsHandler-prototype]] */
/**
 * @brief Handle PPS messages to the @c Messaging object
 *
 * The @e hnm_Messaging_ppsHandler() function parses an incoming PPS message and determines whether
 * to connect or disconnect the client from the @c Messaging object.
 *
 * @param pps_object A pointer to the location in memory of a PPS
 *      Object. This object provides the private data used by this
 *      call to handle the request.
 *
 * @return Nothing.
 */
void hnm_Messaging_ppsHandler( pps_Object* pps_object ) ;

/* hnm_Messaging_ppsHandler-prototype ends here */
/* [[file:~/mainline/services/hmi-notification/doc/messaging.org::*Transient%20Messages][hnm_Messaging_sendTransient-prototype]] */
/**
 * @brief Send a transient notification request to all connected clients
 *
 * The @e hnm_Messaging_sendTransient() function sets up a PPS object describing a transient
 * notification that must be shown by the HMI. This message is transmitted to each client
 * that is connected to the @c Messaging object. Presumably, each connected client represents 
 * a different HMI.
 *
 * @param messaging_obj A pointer to the messaging object that manages the
 *      connected client list. The clients of this server object are notified 
 *      of the transient message specified by @e event.
 * @param event The event structure used to construct the
 *      transient notification. The ownership of this event is
 *      retained by the calling context responsible for
 *      deleting it.
 *
 * @return Nothing.
 */
void hnm_Messaging_sendTransient( hnm_Messaging* messaging_obj, const hnm_Event* event ) ;

/* hnm_Messaging_sendTransient-prototype ends here */
/* [[file:~/mainline/services/hmi-notification/doc/messaging.org::*Initialization][hnm_Messaging_INITIALIZE]] */
/** @def HNM_PPS_MESSAGING_INITIALIZE
 * @c HNM_PPS_MESSAGING_INITIALIZE defines the static initializer for the @c Messaging PPS object.
 * This initializes a static declaration of an @c hnm_Messaging
 * object.
 */
/* The type ID of the object is defined in the HNM header. */
/** 
 * @c HNM_PPS_MESSAGING_INITIALIZE sets the specified structure members:
 * - <tt>.type</tt> PPS object ID used by the @c Messaging object.
 * - <tt>.fd</tt> File descriptor (@c -1) for the @c Messaging object.
 * - <tt>.path</tt> Path to the @c Messaging object (e.g., @c /pps/services/hmi-notification/Messaging).
 * - <tt>.pollfd</tt> List entry used to poll for events on the associated PPS object.
 * - <tt>.object_data</tt> Object-specific data.
 * - <tt>.pps_handler</tt> Pointer to the @e #hnm_Messaging_ppsHandler() function.
 * - <tt>.pps_update</tt> Internal use only.
 
 */
#define HNM_PPS_MESSAGING_INITIALIZE {                          \
                .type = HNM_PPS_OBJECT_MESSAGING,               \
                .fd = -1,                                       \
                .path = HNM_PPS_MESSAGING_OBJECT_PATH,          \
                .pollfd = NULL,                                 \
                .object_data = NULL,                            \
                .pps_handler = hnm_Messaging_ppsHandler,        \
                .pps_update = NULL,                             \
} ;

/* hnm_Messaging_INITIALIZE ends here */

#endif  /* __MESSAGING_H__ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/hmi-notification/public/hnm/messaging.h $ $Rev: 730857 $")
#endif
