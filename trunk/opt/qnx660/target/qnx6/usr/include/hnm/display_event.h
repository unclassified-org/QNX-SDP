/* -*- Mode: C -*- */
  
/*
 * display_event.h - Definition of the types, structures, and
 *      functions that comprise the display event type.
 *
 * $QNXLicenseC:
 * Copyright 2012, QNX Software Systems. All Rights Reserved
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
 * @file display_event.h
 *
 * @brief Definition of the types, structures, and functions that comprise the <em>display event</em> type
 */
  
#ifndef __DISPLAY_EVENT_H__
#define __DISPLAY_EVENT_H__

/* [[file:~/mainline/services/hmi-notification/doc/display_event.org][display_event.h-dependencies]] */
#include <hnm/event.h>

/**
 * @brief Alias for @c hnm_display_event
 *
 * This is an alias for the @c #hnm_display_event structure.
 */
typedef struct hnm_display_event hnm_DisplayEvent ;

/* display_event.h-dependencies ends here */

/* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Factory][DisplayEventFactory-decls-section]] */
/******************************************************************************
 * Display Event Factory
 ******************************************************************************/

/** 
 * @brief Forward declaration of the configuration node structure. 
 */
struct hnm_config_node ;

/* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Factory][DisplayEventFactory::init-proto]] */

/**
 * @brief Initialize the display event "factory"
 *
 * Display events are generated by a "factory" responsible for
 * allocating and initializing new @c DisplayEvent instances. Although the internal
 * state of the factory isn't visible to other compilation units,
 * a factory API is defined to expose the factory itself as a
 * black box.
 *
 * Before the factory can be used, it must be initialized via the
 * @e hnm_DisplayEventFactory_init() function.
 *
 * NOTE: If the factory isn't initialized before it's used, the default policy 
 * for window types will be followed.
 * 
 * @param config_tree Configuration tree used to initialize the state of the 
 * internal factory.
 *
 * @return Nothing.
 */
void hnm_DisplayEventFactory_init( struct hnm_config_node* config_tree ) ;
/* DisplayEventFactory::init-proto ends here */
/* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Window%20Types][DisplayEventFactory::InitWindowTypes-PROTO]] */
/**
 * @brief Initialize the window types
 * 
 * This function initializes the window type semantics from the policy configuration.
 *
 * Given a configuration tree, this function finds the @c window-types section in the tree 
 * and then extracts the window type semantic information. The semantics are expressed by 
 * the internal HNM state machine. If the configuration tree doesn't contain a @c window-types 
 * section, then a default policy is used.
 *
 * @param config_tree Configuration tree searched for the window type semantic information.
 *
 * @return Nothing.
 */
void hnm_DisplayEventFactory_InitWindowTypes( struct hnm_config_node* config_tree ) ;
/* DisplayEventFactory::InitWindowTypes-PROTO ends here */

/* DisplayEventFactory-decls-section ends here */
/* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Factory][DisplayEventFactory_getDefaultEvent-proto]] */
/**
 * @brief Obtain a pointer to the default event instance
 *
 * This function returns the <em>default event</em>, which is used when no other event is specified.
 *
 * @return The default event. 
 */
hnm_DisplayEvent* hnm_DisplayEventFactory_getDefaultEvent() ;
/* DisplayEventFactory_getDefaultEvent-proto ends here */
/* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Factory][DisplayEventFactory_findEvent-proto]] */
/**
 * @brief Search for a named event
 * 
 * This function searches for the event specified. If multiple events have the same name,
 * the first one encountered with the highest priority is returned.
 
 * @param event_name Name of the event.
 *
 * @return A queued event with the specified event name. Returns NULL if none are found.
 */
hnm_DisplayEvent* hnm_DisplayEventFactory_findEvent( const char* event_name ) ;
/* DisplayEventFactory_findEvent-proto ends here */
/* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Window%20Types][window-type-id-decl]] */
/******************************************************************************
 * Window Type
 ******************************************************************************/

/**
 * @brief Enumeration of window display types
 *
 * The available window types are Fullscreen, Growl, Notification, and Overlay.
 * Note that the Hidden window type is defined only for the sake of completeness; it shouldn't be used in practice. 
 */
typedef enum hnm_window_type_e {
        /* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Window%20Types][fullscreen-type-id]] */
        HNM_WINDOW_FULLSCREEN,          /**< Full screen window. */
        /* fullscreen-type-id ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Window%20Types][overlay-type-id]] */
        HNM_WINDOW_OVERLAY,             /**< Popup overlay. */
        /* overlay-type-id ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Window%20Types][notification-type-id]] */
        HNM_WINDOW_NOTIFICATION,        /**< Persistent notification. */
        /* notification-type-id ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Window%20Types][growl-type-id]] */
        HNM_WINDOW_GROWL,               /**< Transient notification. */
        /* growl-type-id ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Window%20Types][hidden-type-id]] */
        HNM_WINDOW_HIDDEN,              /**< Do not display. */
        /* hidden-type-id ends here */
        HNM_WINDOW_NUM_TYPES
} hnm_WindowTypeID ;

/**
 * @brief Get the window type ID that corresponds to the specified string
 *
 * This function has worst-case complexity of @c O(m*n) where @e m is the
 * average length of the window type string and @e n is the number of
 * window types defined.
 *
 * @param type_string The JSON string used to represent the window type.
 *
 * @return An @c hnm_WindowTypeID that corresponds to the specified
 * window type string. If no corresponding window type is found,
 * @c HNM_WINDOW_HIDDEN is returned.
 */
hnm_WindowTypeID display_event_window_type_id( const char* type_string ) ;
       
/**
 * @brief Get the window type name that corresponds to the specified ID
 *
 * This function obtains the string literal that corresponds to the
 * specified @c WindowTypeID in constant @c O(1) time.
 *
 * @param type_id The @c WindowTypeID whose literal string representation is
 *      being sought.
 *
 * @return The string literal the corresponds with the specified type ID.
 */
const char* display_event_window_type_name( hnm_WindowTypeID type_id ) ;

/* window-type-id-decl ends here */
/* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Window%20Types][WindowType-decl]] */
/**
 * @brief Enumeration of display control types
 *
 * These values are used to specify whether window types
 * require exclusive control of the display.
 */
typedef enum hnm_display_control_e {
        HNM_DISPLAY_SHARED = -1,        /**< Nonexclusive display control. */
        HNM_DISPLAY_EXCLUSIVE,          /**< Exclusive display control. */
        HNM_DISPLAY_SEMI_EXCLUSIVE,     /**< Semi-exclusive display control. */
} hnm_DisplayControl ;

/**
 * @brief Structure representing a window type
 *
 * This structure is used to group window type configuration data
 * including name strings as well as exclusivity.
 */
typedef struct hnm_window_type {
        /** A pointer to a string literal that expresses the window
         * type as a string. This structure member is immutable; it
         * should be set only at initialization. */
        const char*             name ;
        /* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Window%20Types][window-type-default-priority]] */
        /** The default priority used for events of the associated window
         * type. */
        unsigned int            default_priority ;
        /* window-type-default-priority ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Sharing%20the%20Display][window-type-exclusive-flag]] */
        /** A flag indicating whether the window type requires exclusive
         * access to the display. This is a tri-state value that is evaluated
         * in the decision tree used to determine if a display request can be
         * accepted. A window type may require exclusive, semi-exclusive, or shared
         * access to the display. */
        hnm_DisplayControl      exclusive ;
        /* window-type-exclusive-flag ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Sharing%20the%20Display][window-type-display-slots]] */
        /** The maximum number of display slots available for the current
         * window type. If this type isn't semi-exclusive, this value should
         * be zero. */
        unsigned short          max_display_slots ;
        /** The number of available display slots for the current window
         * type. If the window type isn't semi-exclusive, the value of this
         * member should be zero. */
        unsigned short          num_display_slots ;
        /** An array of display slots. Each slot is a pointer to an active
         * event. Available display slots contain NULL pointers. */
        hnm_DisplayEvent**      display_slots ;
        /* window-type-display-slots ends here */
} hnm_WindowType ;

/* WindowType-decl ends here */
/* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Events][DisplayEvent-decl]] */
/******************************************************************************
 * Display Event
 ******************************************************************************/

/**
 * @brief Enumeration of DisplayEvent subtype IDs.
 */
enum hnm_display_event_subtype {
        HNM_EVENT_DISPLAY_START = hnm_EventTypeID( HNM_EVENT_DISPLAY, 0 ),
        HNM_EVENT_DISPLAY_END,
} ;

/**
 * @brief Structure encapsulating display event specific data
 *
 * The @c hnm_DisplayEvent type is a specialization of an @c #hnm_Event, so it can be passed
 * around as a pointer to an @c hnm_Event, which can be narrowed to an @c #hnm_DisplayEvent.
 */
struct hnm_display_event {
        EVENT_BASE ; /**< Extend the base Event structure. */
        /* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Window%20Types][DisplayEvent-window_type]] */
        /** An identifier of the requested window type. This is the preferred
         * window type requested by an application. An alternate window type
         * may be specified by the HNM if the event has a lower priority than
         * the currently displayed application. This allows the information
         * to be presented on the display without needing to change which
         * application controls the display. */
        hnm_WindowTypeID        window_type ;
        /* DisplayEvent-window_type ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Window%20Types][DisplayEvent-fallback_types-decl]] */
        /** An array of supported window types that can be used as a fallback
         * in case the requested window type cannot be used for displaying
         * application information. This list must be ordered by preference
         * from most to least preferred. */
        hnm_WindowTypeID        fallback_types[ HNM_WINDOW_HIDDEN ] ;
        /* DisplayEvent-fallback_types-decl ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Display%20Start][DisplayEvent-view]] */
        /** A string describing the name of the view that is associated with
         * the interaction request. This is used to identify the name of
         * the application responsible for fulfilling the display request
         * and to inform the application of the relevant subview. */
        char                    view[ 256 ] ;
        /* DisplayEvent-view ends here */
} ;

/**
 * @brief Macro that lowers an @c hnm_Event
 *      instance to an @c hnm_DisplayEvent.
 */
#define hnm_DisplayEvent_narrow( event )                                \
        ( hnm_Event_typeof( event, HNM_EVENT_DISPLAY ) ?                \
          ( hnm_DisplayEvent* )event :                                  \
          NULL )

/**
 * @brief Create a new @c DisplayEvent instance
 *
 * This function allocates a new @c #hnm_DisplayEvent structure and initializes
 * all its members to zero with the exception of the @e appraise and
 * @e service callbacks, which will have the correct functions assigned to
 * them.
 *
 * @return A pointer to a new @c hnm_DisplayEvent structure. The memory
 * returned by this function is transferred to the calling context responsible for deleting it.
 */
hnm_DisplayEvent* hnm_DisplayEvent_create() ;

/**
 * @brief Appraise a display interaction request
 *      to determine if it should be serviced.
 *
 * This function analyzes the specified event to determine whether:
 *
 * - the request corresponds to a display event
 * 
 * OR:
 *
 * - given the current status of the HNM, the request should be serviced as is
 * or using a fallback window type.
 *
 * @param event The interaction event structure that encapsulates the
 *      display event.
 * @param hnm_data The HNM data structure that provides access to the
 *      active event list and to the HNM policy configuration.
 *
 * @return A flag indicating whether the current display interaction
 * request should be accepted (@c true) or rejected (@c false). If the
 * event is not a display event, it will be rejected (@c false).
 */
bool
hnm_display_event_appraise( hnm_Event* event, void* hnm_data ) ;

/**
 * @brief Service a display interaction request.
 *
 * This function does the specialized processing required to
 * service the specified display interaction event. The nature of the
 * processing required may vary depending on the type of event
 * received (i.e. @c display-start or @c display-end).
 *
 * @param event The interaction event structure that encapsulates the
 *      display event.
 * @param hnm_data The HNM data structure that provides access to the
 *      active event list and to the HNM policy configuration.
 *
 * @return Nothing.
 */
void
hnm_display_event_service( hnm_Event* event, void* hnm_data ) ;

/* DisplayEvent-decl ends here */

/* [[file:~/mainline/services/hmi-notification/doc/display_event.org::*Display%20End][DisplayEventFactory-getNextEvent-proto]] */
/**
 * @brief Get the next event.
 *
 * This function returns the next-highest priority display event to pass to the HNM.
 *
 * @return The next-highest priority event from the internal queues. Returns NULL if there are no queued events. 
 */
hnm_DisplayEvent* display_event_factory_get_next_event() ;
/* DisplayEventFactory-getNextEvent-proto ends here */

#endif  /* __DISPLAY_EVENT_H__ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/hmi-notification/public/hnm/display_event.h $ $Rev: 730777 $")
#endif
