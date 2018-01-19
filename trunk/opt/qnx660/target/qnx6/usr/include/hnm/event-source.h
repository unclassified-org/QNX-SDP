/* -*- Mode: C -*- */

/*
 * hnm/event-source.h - Pluggable interface for HNM Event Sources.
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
 * @file event-source.h
 *
 * @brief Structures and the register function for event-source plugins
 *
 * To register with the HNM, plugins must use the @e hnm_register_module() function.
 */
  
#ifndef __HNM_EVENT_SOURCE_H__
#define __HNM_EVENT_SOURCE_H__

/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Sources][hnm-includes]] */
/* HNM includes */
#include <hnm/event.h>

/* hnm-includes ends here */

/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Sources][hnm::EventSource]] */
/**
 * @brief This is an alias for the @c hnm_event_source structure
 */
typedef struct hnm_event_source hnm_EventSource ;
/**
 * @brief Structure that defines the form of event-source plugins for the HNM.
 *
 * This structure declares the interface used for dynamically loading code
 * into an existing HNM runtime environment. Once this code is loaded,
 * the known layout of objects can be relied upon to enable the
 * module.
 */
struct hnm_event_source {
        /** The name of the application that is associated with the
         * event source (e.g. HFP for the Bluetooth handsfree phone system). */
        char*                           name ;
        /** The connection ID (i.e. file descriptor or connection ID)
         * used to communicate with the plugin. This member must be
         * initialized in the @e (*open)() callback and is used to poll
         * the plugin for input. */
        int                             connection_id ;
        /** The private data associated with the specialized
         * per-module @c hnm_EventSource. */
        void*                           data ;
        /* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Priorities][hnm::EventSource::priority_map]] */
        /** The global mapping of event names to priorities for the current
         * event-source instance. */
        hnm_EventPriorityMap*          priority_map ;
        /* hnm::EventSource::priority_map ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Sources][hnm::EventSource::open]] */
		/** Called by the HNM subsystem when a plugin is initially loaded 
		 * via @e dlopen() to open the event source. Returns a file descriptor associated with 
		 * the event source, if successful; otherwise, returns a negative value. */
        int             ( *open )( hnm_EventSource* event_source, int channel_id ) ;
        /* hnm::EventSource::open ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Sources][hnm::EventSource::close]] */
		/** Called by the HNM subsystem when a plugin is being released via @e dlclose(). */
        void            ( *close )( hnm_EventSource* event_source ) ;    
        /* hnm::EventSource::close ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Event%20Sources][hnm::EventSource::read_event]] */
		/** Read the event parameters from the event source. */
        hnm_Event*      ( *read_event )( hnm_EventSource* event_source ) ;
        /* hnm::EventSource::read_event ends here */
} ;

/* hnm::EventSource ends here */
/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Loading%20Plugins][hnm::Module]] */
/**
 * @brief This is an alias for the @c hnm_module structure
 */
typedef struct hnm_module hnm_Module ;
/**
 * @brief Structure that represents an event-source module.
 *
 * Event-source modules are represented by a module type that
 * encloses a definition of the specific event-source data and
 * callbacks. This data structure also provides a mechanism to chain
 * the modules in a list.
 */
struct hnm_module {
        struct pollfd*          poll_entry ;    /**< The entry in a poll list that is used to poll
													 events on the module. */
        hnm_EventSource         event_source ;  /**< The event source that is plugged into the HNM via
													 the current module instance. */
        hnm_Module*             next ;			/**< The next module in the list. */
} ;

/* hnm::Module ends here */
/* [[file:~/mainline/services/hmi-notification/doc/hnm.org::*Loading%20Plugins][hnm::register_module-PROTO]] */
/**
 * @brief Register the specified event source as a module of the HNM subsystem.
 *
 * Modules that wish to register with the HNM subsystem must call the @e hnm_register_module() function.
 * This function adds the module to the list of managed event sources associated with the HNM
 * subsystem. The new module is added to the front of the list of registered modules.
 * This function is defined in the HNM subsystem's scope.
 *
 * @param event_source The event source being registered as a
 *        module with the HNM subsystem.
 * @param private_data The private data to associate with the event source.
 * @return A pointer to the @c hnm_module structure that is created to
 *         manage the specified event source.
 */
extern hnm_Module* hnm_register_module( hnm_EventSource* event_source, void* private_data ) ;

/* hnm::register_module-PROTO ends here */

#endif  /* __HNM_EVENT_SOURCE_H__ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/hmi-notification/public/hnm/event-source.h $ $Rev: 730777 $")
#endif
