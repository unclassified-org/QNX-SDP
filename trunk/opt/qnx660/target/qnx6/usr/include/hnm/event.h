/* -*- Mode: C -*- */

/*
 * hnm/event.h - Declaration of the HNM Event structure and its
 *      associated functions.
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
  * @file event.h
  *
  * @brief Declaration of the HNM Event structure and its associated functions.
  */
  
#ifndef __HNM_EVENT_H__
#define __HNM_EVENT_H__

/* POSIX includes */
#include <stdbool.h>

/* HNM includes */
#include <hnm/queue.h>

/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Priorities][nil]] */
/******************************************************************************
 * Priority Structures and Utilities
 ******************************************************************************/

/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Priorities][hnm::Priority]] */
/**
 * @brief Enumeration of priority levels defined for the HNM subsystem.
 */
enum hnm_priority_e {
        HNM_MIN_PRIORITY        = 0, /**< Lowest priority. */
        HNM_MAX_PRIORITY        = 7, /**< Highest priority. */
        HNM_NUM_PRIORITY_LEVELS,
        HNM_DEFAULT_PRIORITY    = HNM_MIN_PRIORITY,
} ;

/**
 * @brief A type representing the priority level.
 */
typedef unsigned int hnm_Priority ;

/* hnm::Priority ends here */
/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Priorities][hnm::EventPriorityMap]] */
/**
 * @brief This is an alias for the @c hnm_event_priority_map structure.
 */
typedef struct hnm_event_priority_map hnm_EventPriorityMap ;
/**
 * @brief Structure representing a single mapping of an event name to a priority value.
 */
struct hnm_event_priority_map {
		/** The name of an event. The name can be at most 255 characters in 
		 * length (plus a null terminator). */
        char                    event_name[ 256 ] ;
		/** The priority that has been assigned to the named event. */
        hnm_Priority            priority ;
		/** A pointer to the next event priority map in the global map list. */
        hnm_EventPriorityMap*   next ;
} ;

/* hnm::EventPriorityMap ends here */

/* nil ends here */
/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Types][EventType-SECTION]] */
/******************************************************************************
 * EventType Declaration
 ******************************************************************************/

/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Types][hnm::EventClass]] */
/**
 * @brief Enumeration of HNM event class IDs
 *
 * Events are categorized into classes that correspond to the
 * interaction types (e.g., display, audio). The HNM
 * subsystem defines an enumeration of event class IDs that are used
 * to distinguish the different classes of events. 
 */
typedef enum hnm_event_class {
        HNM_EVENT_NONE = 0,
        /* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Types][DISPLAY_EVENT_ID]] */
        HNM_EVENT_DISPLAY,
        /* DISPLAY_EVENT_ID ends here */
        HNM_EVENT_UNKNOWN       /**< Add new event types before this entry. */
} hnm_EventClass ;

/* hnm::EventClass ends here */
/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Types][hnm::EventType]] */
/**
 * @brief Event Type ID 
 */
typedef unsigned short          hnm_EventType ;

/* hnm::EventType ends here */
/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Types][hnm::EventType-RTTI]] */
#define hnm_EventClassShift     8 /**< Number of bits to shift; used in @c hnm_EventTypeID and @c hnm_EventClassID */
#define hnm_EventClassMask      (0xffff << hnm_EventClassShift) /**< Mask to extract class ID; used by @c hnm_EventTypeID, @c hnm_EventClassID, and @c hnm_Event_typeof*/
#define hnm_EventTypeMask       ~hnm_EventClassMask

/**
 * @brief Aggregate the event class and subtype IDs into a
 *      single event-type ID
 */
#define hnm_EventTypeID( class, type ) ( hnm_EventType )( class << hnm_EventClassShift | ( type & hnm_EventTypeMask ) )

/**
 * @brief Extract the event class ID from the event-type ID
 */
#define hnm_EventClassID( event_id ) ( hnm_EventClass )( event_id >> hnm_EventClassShift )

/**
 * @brief Macro used to perform runtime type-checking of events
 *
 * This macro evaluates to @c true if the specified @c event
 * corresponds to the specified event @c class.
 */
#define hnm_Event_typeof( event, class ) ( event && hnm_EventClassID( event->type ) == class )

/* hnm::EventType-RTTI ends here */

/* EventType-SECTION ends here */

/******************************************************************************
 * hnm::Event
 ******************************************************************************/

/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Events][hnm::Event]] */
/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Events][hnm::Event-documentation]] */

/* hnm::Event-documentation ends here */
/**
 * @brief This is an alias for the @c hnm_event structure.
 */
        /* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Events][hnm::Event-BASE]] */
typedef struct hnm_event hnm_Event ;
/** @def EVENT_BASE
 * @c EVENT_BASE defines the base structure for events.
 *
 * @c EVENT_BASE contains the following:
 * - @c queue_elem The queue member of the Event structure. This member
 * must be the first one defined in the structure to allow it to
 * be used with the generic Queue data structure and its associated functions.
 * - @c name[ 256 ] The name of the event. If this string corresponds to an
 * event name in the policy configuration, the associated
 * priority will be assigned to events with that name.
 * - @c priority The priority of the event. The minimum value is
 * @c HNM_DEFAULT_PRIORITY. The maximum value is @c HNM_MAX_PRIORITY.
 * - @c type The event type (e.g. @c display_start or @c display_end ). A
 * @c display_start event signifies that an application or service
 * wishes to display some information in a window of a specified
 * type. A @c display_end event may occur when an application no
 * longer has information to display (e.g. if a handsfree phone
 * call is terminated on the remote end).
 *
 * The following callbacks are associated with the Event structure:
 * - <em>(*appraise)()</em> This callback is called to appraise the current
 * event. This function takes a pointer to the HNM data structure
 * and the event instance as arguments. It returns a Boolean flag
 * to indicate whether to service the event.
 * - <em>(*service)()</em> This callback is called to service the current event.
 */
 
/**
 * @brief An abstract @e multimodal event structure.
 *
 * The @c hnm_Event structure is the base type for asynchronous system events that
 * are handled by the HNM. See <a href="event.h_defines.xml">EVENT_BASE</a> for details.
 */
struct hnm_event {
        #define EVENT_BASE                                      \
                queue_Element           queue_elem ;            \
                char                    name[ 256 ] ;           \
                hnm_Priority            priority ;              \
                hnm_EventType           type ;                  \
                                                                \
				/* Callbacks associated with the Event structure. */            \
                bool                    ( *appraise )( hnm_Event* self, void* data ) ; \
				void                    ( *service )( hnm_Event* self, void* data )
        
        /* hnm::Event-BASE ends here */
        EVENT_BASE ; /**< Defines the base structure for events.*/
} ;

/* hnm::Event ends here */


#endif /* __HNM_EVENT_H__ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/hmi-notification/public/hnm/event.h $ $Rev: 730777 $")
#endif
