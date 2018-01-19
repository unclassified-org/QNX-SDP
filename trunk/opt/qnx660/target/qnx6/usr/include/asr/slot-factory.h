/* -*- Mode: C -*- */

/**
 * @file slot-factory.h
 *
 * @brief Functions and data types for the SlotFactory.
 *
 * @details The @c slot-factory.h header file provides functions and data types for interacting
 *         with the SlotFactory object, which is used to manage recognition results.
 */
 
 /* 
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

#ifndef __SLOT_ENTRIES_H__
#define __SLOT_ENTRIES_H__

/* [[file:~/mainline/services/asr/doc/asr-slotfactory.org][slot-factory.h-INCLUDES]] */
/* POSIX includes */
#include <stdbool.h>

/* ASR includes */
#include <asr/mod_types.h>
#include <asr/protos.h>
/* slot-factory.h-INCLUDES ends here */
/* [[file:~/mainline/services/asr/doc/asr-slotfactory.org::*Slot%20Entries][SlotFactory::Entry]] */

/**
 * @brief An alias for the slot list entry type.
 * @details This type is an alias for the slot list entry type, @c _Entry.
 */
typedef struct _Entry SlotFactory_Entry ;

/**
 * @brief A slot list entry
 * @details This structure holds the word that is associated with the entry, as
 * well as a pointer to the transcription slot entry (see @c #asr_slot_entry_t) and a pointer to 
 * the next slot entry in the list. This allows entries to be chained in a singly
 * linked list.
 */
struct _Entry {
        char*                   word ; /**< The word associated with the entry. */
        asr_slot_entry_t*       slot ; /**< The transcription slot entry. */
        SlotFactory_Entry*      next ; /**< A pointer to the next slot list entry. */
} ;

/**
 * @brief Create a new slot factory entry on the heap
 * @details The @e %SlotFactory_Entry_Create() function is a constructor for slot entries that,
 * optionally given a terminal string, will create a new entry instance. If no terminal string
 * is provided, the word buffer will remain unallocated. This function is primarily defined for
 * use internally. Use the more robust @e SlotFactory_createUniqueEntry() function instead.
 * 
 * @param terminal A pointer to a character buffer containing the terminal to associate with the
 *                 new entry. The ownership of this memory is retained by the calling context and
 *                 won't be deleted by the entry structure member functions. If the argument value is
 *                 NULL, the new entry is created without an associated word buffer.
 *
 * @return A pointer to a newly allocated entry. The ownership of the memory returned by this function
 *         is transferred to the calling context, which is responsible for deleting it by calling the
 *         @e SlotFactory_Entry_delete() member function.
 */
SlotFactory_Entry* SlotFactory_Entry_Create( const char* terminal ) ;


/**
 * @brief Delete a slot factory entry
 * @details The @e %SlotFactory_Entry_delete() function deallocates a slot entry that was previously allocated
 * by the @e SlotFactory_Entry_Create() function. This function deletes the @e word buffer associated
 * with the entry; therefore, any external references to this buffer become invalid following a
 * call to this function.
 *
 * @param entry A pointer to the entry to be deleted.
 * @return Nothing. 
 */
void SlotFactory_Entry_delete( SlotFactory_Entry** entry ) ;
/* SlotFactory::Entry ends here */
/* [[file:~/mainline/services/asr/doc/asr-slotfactory.org::*Entry%20Lists][SlotFactory::EntryList]] */


/**
 * @brief An ordered list of slot entry objects
 * @details This data type is used to manage ordered
 *  lists of slot entry objects. Slot entry lists are in alphabetical order by
 *  terminal. Duplicate terminals are not allowed in slot entry lists.
 */
typedef SlotFactory_Entry* SlotFactory_EntryList ;

/* SlotFactory::EntryList ends here */
/* [[file:~/mainline/services/asr/doc/asr-slotfactory.org::*Factory][SlotFactory]] */

 /**
 * @brief An alias for the slot factory type.
 * @details This type is an alias for the slot factory type, @c _SlotFactory.
 */
typedef struct _SlotFactory SlotFactory ;

/**
 * @brief Structure encapsulating slot factory data
 * @details The slot factory manages an array of ASR slot structures that can be
 * passed to the various ASR context-manipulation functions. 
 *
 * The buffer slot structure is allocated in pages to optimize memory use without frequently reallocating
 * the buffer. The size of a single page of slot entries can be set when the slot factory is initialized. 
 * The default page size is 4 KB, which is large enough to hold 168 @c asr_slot_entry_t instances. If a page
 * size is specified when the slot factory is initialized, it is adjusted to the next largest 32-bit aligned
 * buffer size.
 */
struct _SlotFactory {
        asr_slot_entry_t*       entries ;     /**< A buffer containing an array of transcription slot entries. */
        size_t                  buffer_size ; /**< The size of the buffer. */ 
#define SlotFactory_DefaultPageSize    4096   /**< The default page size. */
        unsigned int            page_size ;   /**< The page size. Optional. Specified at initialization. */
        unsigned int            max_entries ; /**< The maximum number of slot entries in the buffer. */
        unsigned int            num_entries ; /**< The current number of slot entries in the buffer. */
        SlotFactory_EntryList   terminals ;   /**< An ordered list of slot entry objects. */
} ;

/**
 * @brief Create a new slot factory instance
 * @details The @e %SlotFactory_Create() function creates a new slot factory instance by allocating an entry
 * buffer that can hold a minimum number of slot entries (specified by @e num_slots). If the @e num_slots
 * argument is zero, the no memory is allocated for the entry buffer and no entry elements are created. 
 * These members are updated when the first allocation occurs via the @e SlotFactory_createUniqueEntry() function.
 *
 * @param num_slots The initial number of slot entries that the factory's buffer can hold.
 * @param page_size A pointer to a buffer containing the page size used when allocating ASR slot entry buffers. The
 *                  value obtained from this optional argument is adjusted to the next largest 32-bit aligned
 *                  value.
 *
 * @return A new slot factory instance created on the heap. The ownership of the memory returned by this function
 *  is transferred to the calling context, which must delete the instance by calling the @e SlotFactory_Delete() function.
 *  If an allocation error occurs, this constructor will return a NULL pointer and set @c errno accordingly.
 */
SlotFactory* SlotFactory_Create( unsigned int num_slots, unsigned int* page_size ) ;

/**
 * @brief Delete a slot factory instance
 * @details The @e %SlotFactory_Delete() function deletes a slot factory instance that was previously
 *          allocated via @e SlotFactory_Create(). This instance is reset (i.e., its buffer is released)
 *          and the memory it occupies is deleted. The @e factory pointer is set to NULL.
 *
 * @param factory A pointer to the memory location of a slot factory instance. 
 * @return Nothing.
 */
void SlotFactory_Delete( SlotFactory** factory ) ;

/**
 * @brief Initialize a slot factory instance
 * @details The @e %SlotFactory_init() function creates a new slot entry buffer large enough to contain @e num_slots
 * entries. If @e self was previously initialized, the memory it manages is leaked. Therefore, this function should not be
 * called twice on the same slot factory instance.
 *
 * @param self A pointer to the slot factory instance to initialize.
 * @param num_slots The number of slot entries that the initial buffer of the factory can hold.
 * @param page_size A pointer to a buffer containing the page size to use when allocating ASR slot entry buffers.
 *        The value obtained from this optional argument is aligned to the next 32-bit aligned value
 *        that is large enough to hold the specified page size.
 *
 * @return True if the factory is initialized; false if an error occurs during initialization. In the error
 *         case, @c errno is set to indicate the error that ocurred: either EINVAL if @e self refers to an 
 *         invalid slot factory instance or ENOMEM if the slot entry buffer cannot be allocated.
 */
bool SlotFactory_init( SlotFactory* self, unsigned int num_slots, unsigned int* page_size ) ;

/**
 * @brief Reset a slot factory instance
 * @details The @e %SlotFactory_reset() function releases the slot entry buffer and resets all
 *          counters to zero.
 *
 * @param self A pointer to the slot factory instance to reset.
 * @return Nothing.
 */
void SlotFactory_reset( SlotFactory* self ) ;

/**
 * @brief Create a new slot entry instance
 * @details The @e %SlotFactory_createEntry() function creates a new slot entry instance, associating it
 *          with an @c asr_slot_entry_t structure from the factory's buffer.
 *
 * The @e %SlotFactory_createEntry() function creates a new slot entry instance on the heap, copies the
 * specified @e terminal into its word buffer, allocates a new @c asr_slot_entry_t structure from the
 * factory, then associates the two structures. An optional entry ID, @e id, can be specified
 * and is assigned to the newly allocated entry. If no ID is specified, one is assigned automatically.
 *
 * @param self A pointer to the slot factory whose slot entry buffer provides the slot entry to associate with the
 *       slot entry structure.
 * @param terminal The terminal string to associate with the entry.
 * @param id A pointer to a buffer containing a 64-bit entry ID to associate with the @c asr_slot_entry_t type
 *        associated with the returned Entry.
 *
 * @return A new instance of the @c SlotFactory_Entry structure, created on the heap, that represents the 
 *         specified @e terminal. The ownership of the memory returned by this function is transferred to the
 *         calling context, which must delete it using the @e SlotFactory_Entry_delete() function.
 */
SlotFactory_Entry* SlotFactory_createEntry( SlotFactory* self, const char* terminal, const uint64_t* id ) ;

/**
 * @brief Create a unique Entry instance for the specified terminal
 * @details If no slot entry for the specified @e terminal has been created by the current factory instance
 * (using the @e createUniqueEntry() function), the @e %SlotFactory_createUniqueEntry() function allocates and
 *  returns a new slot entry. The new slot entry has an @c asr_slot_entry_t structure associated with
 *  it from the slot entry buffer maintained by the factory.
 *
 * @param self A pointer to the slot factory instance to use to allocate the new slot entry.
 * @param terminal The terminal string to associate with the new slot entry.
 * @param id An optional pointer to a buffer containing a 64-bit entry ID that is associated with the
 *        @c asr_slot_entry_t type associated with the returned slot entry. If this argument is NULL,
 *        the factory will automatically assign an ID to the entry.
 *
 * @return  A new instance of the @c SlotFactory_Entry type, created on the heap, that represents the specified
 *          @e terminal. The ownership of the returned memory is retained by the called context, which will
 *          delete it when the Factory is reset. If an Entry for @e terminal has already been created by this factory,
 *          its corresponding entry is returned. A NULL pointer is returned if this function fails to
 *          create a new entry.
 */
SlotFactory_Entry* SlotFactory_createUniqueEntry( SlotFactory* self, const char* terminal, const uint64_t* id ) ;

/* SlotFactory ends here */

#endif  /* __SLOT_ENTRIES_H__ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/asr/core/public/asr/slot-factory.h $ $Rev: 730767 $")
#endif
