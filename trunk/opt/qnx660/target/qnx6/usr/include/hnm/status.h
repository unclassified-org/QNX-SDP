/* -*- Mode: C -*- */

/* status.h - Declaration of the HNM Status PPS object.
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
  * @file status.h
  *
  * @brief Declaration of the PPS @c Status object used by the HNM.
  */
  
#ifndef __HNM_PPS_STATUS_H__
#define __HNM_PPS_STATUS_H__

/* HNM includes */
#include <hnm/display_event.h>
#include <hnm/pps.h>
#include <hnm/queue.h>

#ifdef GLOBAL
#define EXTERN
#else   /* !GLOBAL */
#define EXTERN extern
#endif  /* !GLOBAL */

/* [[file:~/mainline/services/hmi-notification/doc/status.org][hnm_Status]] */
/** 
 * @brief  Definition of the PPS object ID used by the @c Status object. 
 */
#define STATUS_PPS_OBJECT_ID 0x0

/**
 * @brief This is an alias for the @c hnm_status_s structure.
 */
typedef struct hnm_status_s hnm_Status ;
/**
 * @brief Data structure for the PPS @c Status object.
 *
 * The @c hnm_Status structure is a specialization of the @c #pps_Object structure 
 * and therefore has an instance of that structure as its first member. This
 * specialization enhances the @c pps_Object with data that is specific
 * to the PPS @c Status object.
 */

struct hnm_status_s {
		/** Defines the base structure for PPS objects. */
        PPS_OBJECT_BASE ;
        /* [[file:~/mainline/services/hmi-notification/doc/status.org::*Display%20List][hnm_Status-display_list]] */
        /** A list of events that affect the display modality of a subscribed HMI. */
        queue_Queue             display_list ;
        /* hnm_Status-display_list ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/status.org::*Display%20List][hnm_Status-update_display_list]] */
        /** A flag that specifies whether the @c display_list has been
         * changed since the last update of the @c Status object. This is set
         * automatically by some of the accessor functions to ensure that
         * changes to the display list are propagated to clients that subscribe to
         * the @c Status object. */
        bool                    update_display_list ;
        /* hnm_Status-update_display_list ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/status.org::*Display%20List][hnm::Status::displayList]] */
        /** Callback referencing the function that provides read-only access to the display list. */
        const queue_Queue*      (*displayList)( hnm_Status* self ) ;
        /* hnm::Status::displayList ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/status.org::*Display%20List][hnm::Status::getDisplayList]] */
        /** Callback that provides read/write access to the display list. */
        queue_Queue*    (*getDisplayList)( hnm_Status* self ) ;
        /* hnm::Status::getDisplayList ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/status.org::*Display%20List][hnm::Status::findDisplayEvent]] */
        /** Callback that provides an accessor to find a named display event
         * in the display list associated with the current @c Status object. */
        hnm_DisplayEvent*       (*findDisplayEvent)( hnm_Status* self, const char* event_name ) ;
        /* hnm::Status::findDisplayEvent ends here */
} ;

/* hnm_Status ends here */
/* [[file:~/mainline/services/hmi-notification/doc/status.org][hnm_Status_Narrow]] */
/**
 * @brief Narrow a @c #pps_Object to an @c #hnm_Status structure whenever possible. 
 */
#define hnm_Status_Narrow( obj )                                        \
        ( obj && obj->type == STATUS_PPS_OBJECT_ID ) ? ( hnm_Status* )obj : NULL

/* hnm_Status_Narrow ends here */
/* [[file:~/mainline/services/hmi-notification/doc/status.org][HNM_PPS_STATUS_OBJET_PATH]] */
/**
 * @brief Path to the PPS @c Status object.
 */
#define HNM_PPS_STATUS_OBJECT_PATH "Status"
/* HNM_PPS_STATUS_OBJET_PATH ends here */
/* [[file:~/mainline/services/hmi-notification/doc/status.org][hnm_Status_update-PROTO]] */
/**
 * @brief Update the PPS object to reflect the current status
 *
 * The @e hnm_Status_update() function updates the @c Status object to ensure that subscribers are
 * notified of changes.
 *
 * @param self A pointer to an @c #hnm_Status object whose updates are pushed to 
 * subscribers of the PPS interface. If the argument doesn't correspond to an actual 
 * status object, no update takes place.
 *
 * @return Nothing.
 */
void hnm_Status_update( pps_Object* self ) ;

/* hnm_Status_update-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/status.org][hnm_Status_ppsHandler-PROTO]] */
/**
 * @brief Handle PPS I/O
 *
 * This reads PPS messages from the PPS interface of the @c Status object and 
 * then handles messages appropriately.
 *
 * @param object The Object that received a message via PPS.
 *
 * @return Nothing.
 */
void hnm_Status_ppsHandler( pps_Object* object ) ;

/* hnm_Status_ppsHandler-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/status.org::*Display%20List][hnm_Status_displayList-PROTO]] */
/**
 * @brief Get the display event list of a PPS @c Status object
 *
 * Given a @c #pps_Object, this function:
 * - verifies that this object represents an @c #hnm_Status type
 * - returns the display list associated with that object.
 *
 * @param self A pointer to a @c #pps_Object instance that is also an @c #hnm_Status structure. 
 * This object is the recipient of the @c displayList message.
 *
 * @return A pointer to the display list associated with the @c Status object. 
 * If the object isn't of the correct type, NULL is returned. The ownership of 
 * the memory referenced by the pointer is retained by the called context and must not 
 * be deleted by the calling context.
 */
const queue_Queue* hnm_Status_displayList( hnm_Status* self ) ;

/* hnm_Status_displayList-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/status.org::*Display%20List][hnm_Status_getDisplayList-PROTO]] */
/**
 * @brief Get the display list of a PPS @c Status object and set the update flag
 *
 * Given a @c #pps_Object, this function:
 * - verifies that this object represents an @c #hnm_Status type
 * - returns the display list associated with that structure.
 *
 * This function also sets the update flag associated with the display list 
 * to ensure that changes are propagated to subscribers of the PPS object.
 *
 * @param self A pointer to the @c #hnm_Status instance that receives 
 * the @c getDisplayList message.
 *
 * @return A pointer to the display list associated with the @c Status object. 
 * If the object isn't of the correct type, NULL is returned. The ownership of 
 * the memory referenced by the pointer is retained by the called context and must not 
 * be deleted by the calling context.
 */
queue_Queue* hnm_Status_getDisplayList( hnm_Status* self ) ;

/* hnm_Status_getDisplayList-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/status.org::*Display%20List][hnm_Status_findDisplayEvent-PROTO]] */
/**
 * @brief Find the named event in the display list
 *
 * The @e hnm_Status_findDisplayEvent() function walks the display list 
 * associated with the specified @c Status object until either an event with the
 * specified name is found or the end of the list is reached.
 *
 * @param self A pointer to the @c #hnm_Status structure that represents the 
 * recipient object of the method invocation.
 * @param event_name The name of the event being sought in the display list.
 *
 * @return A pointer to an @c #hnm_DisplayEvent whose name matches @e event_name. 
 * If no such event is found, this function returns NULL.
 */
hnm_DisplayEvent* hnm_Status_findDisplayEvent( hnm_Status* self, const char* event_name ) ;

/* hnm_Status_findDisplayEvent-PROTO ends here */
/** @def HNM_PPS_STATUS_INITIALIZE
 * @c HNM_PPS_STATUS_INITIALIZE defines the static initializer for the @c Status PPS object. 
 * This initializes a static declaration of an @c #hnm_Status
 * object, allowing applications that use the @c Status object to
 * assign custom type IDs that are unique to the application scope.
 *
 * @c HNM_PPS_STATUS_INITIALIZE sets the specified structure members:
 * - <tt>.type</tt> PPS object ID used by the @c Status object.
 * - <tt>.fd</tt> File descriptor (@c -1) for the @c Status object.
 * - <tt>.path</tt> Path to the @c Status object (e.g., @c /pps/services/hmi-notification/Status).
 * - <tt>.pollfd</tt> List entry used to poll for events on the associated PPS object.
 * - <tt>.object_data</tt> Object-specific data.
 * - <tt>.pps_handler</tt> Pointer to the @e #hnm_Status_ppsHandler() function.
 * - <tt>.pps_update</tt> Pointer to the @e #hnm_Status_update() function.
 * - <tt>.displayList</tt> Pointer to the @e #hnm_Status_displayList() function.
 * - <tt>.getDisplayList</tt> Pointer to the @e #hnm_Status_getDisplayList() function.
 * - <tt>.findDisplayEvent</tt> Pointer to the @e #hnm_Status_findDisplayEvent() function.
 */
#define HNM_PPS_STATUS_INITIALIZE {                                     \
                .type = STATUS_PPS_OBJECT_ID,                           \
                .fd = -1,                                               \
                .path = HNM_PPS_STATUS_OBJECT_PATH,                     \
                .pollfd = NULL,                                         \
                .object_data = NULL,                                    \
                .pps_handler = hnm_Status_ppsHandler,                   \
                .pps_update = hnm_Status_update,                        \
                .displayList = hnm_Status_displayList,                  \
                .getDisplayList = hnm_Status_getDisplayList,            \
                .findDisplayEvent = hnm_Status_findDisplayEvent,        \
}

#endif  /* __HNM_PPS_STATUS_H__ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/hmi-notification/public/hnm/status.h $ $Rev: 730777 $")
#endif
