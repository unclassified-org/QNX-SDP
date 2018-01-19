/* -*- Mode: C -*- */

/* queue.h - Declaration of a generic queue data structure.
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
  * @file queue.h
  *
  * @brief Declaration of a generic queue data structure
  */
  
#ifndef __QUEUE_H__
#define __QUEUE_H__



/* [[file:~/mainline/services/hmi-notification/doc/queue.org][queue.h-INCLUDES]] */
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

/* queue.h-INCLUDES ends here */
/* [[file:~/mainline/services/hmi-notification/doc/queue.org::*Data%20Structures][queue::Queue]] */
/* Forward declaration of the queue_Element type. */
/**
 * @brief Alias for @c queue_element
 *
 * This is an alias for the @c queue_element structure.
 */
typedef struct queue_element queue_Element ;
/**
 * @brief Alias for @c queue_queue
 *
 * This is an alias for the @c queue_queue structure.
 */
typedef struct queue_queue queue_Queue ;
/**
 * @brief A generic Queue data structure
 */
struct queue_queue {
        /* [[file:~/mainline/services/hmi-notification/doc/queue.org::*Data%20Structures][queue::Queue::head]] */
        /** The first element or head of the queue. If @c head is NULL, the
         * queue is necessarily empty. */
        queue_Element*  head ;
        /* queue::Queue::head ends here */
        /* [[file:~/mainline/services/hmi-notification/doc/queue.org::*Data%20Structures][queue::Queue::tail]] */
        /** The last element or tail of the queue. If @c tail is NULL, the queue
         * is necessarily empty. */
        queue_Element*  tail ;
        /* queue::Queue::tail ends here */
} ;

/* queue::Queue ends here */
/* [[file:~/mainline/services/hmi-notification/doc/queue.org::*Data%20Structures][queue::Element]] */
/**
 * @brief A data structure that represents a single element in a queue
 */
struct queue_element {
        queue_Element*  prev ;	/**< The previous element in the queue. If this member is NULL,
									 then the element is likely the first item in the queue. */
        queue_Element*  next ;	/**< The next element in the queue. If this member is NULL, the
									 element is likely the last in the queue. */
        queue_Queue*    queue ; /**< The queue that the element belongs to. If this member is NULL, 
									 the element hasn't been added to a queue. */
} ;

/* queue::Element ends here */
/* [[file:~/mainline/services/hmi-notification/doc/queue.org::*Test%20Functions][queue::is_empty-PROTO]] */
/**
 * @brief Test whether the specified queue is empty
 *
 * The @e queue_is_empty() function checks the cardinality of the specified
 * queue and reports success if it evaluates to zero.
 *
 * @param queue The queue whose cardinality will be evaluated.
 *
 * @return @c true if there are no elements in the specified queue; @c false otherwise.
 */
bool queue_is_empty( const queue_Queue* queue ) ;

/* queue::is_empty-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/queue.org::*Test%20Functions][queue::has_element-PROTO]] */
/**
 * @brief Test whether an element is part of a queue
 *
 * Given a @c queue_element data structure, the queue_has_element() function determines
 * whether it belongs to the specified @e queue. This test is performed
 * in constant @c O(1) time. Both the queue and element data remain
 * unchanged following a call to this function.
 *
 * @param queue The queue for which the element is being tested for membership.
 * @param element A pointer to a specialized structure that contains a 
 * @c queue_Element structure as its first member. This element is tested for 
 * membership in the specified @e queue.
 *
 * @return A Boolean flag indicating whether @e element is (@c true) or is not (@c false) a member of
 * @e queue .
 */
bool queue_has_element( const queue_Queue* queue, const void* element ) ;

/* queue::has_element-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/queue.org::*Operations][queue::push-PROTO]] */
/**
 * @brief Add an element to the tail of the queue
 *
 * Given a @c queue_Element data structure, the @e queue_push() function adds 
 * the enclosing data structure to the specified @e queue. This operation is
 * performed in constant @c O(1) time. The @c queue_Element structure that
 * adorns the enclosing structure as well as the queue structure itself are updated accordingly.
 *
 * Note that an element can only ever be a member of a
 * @e single queue. If the supplied element is already a member of
 * another queue, the push operation will fail.
 *
 * @param queue A pointer to the queue structure to which the element is
 *      being added.
 * @param element A pointer to a specialized structure that contains a
 * @c queue_Element structure as its first element. This element is added
 * to the specified @e queue and its @c queue_Element members are updated.
 *
 * @return A flag indicating whether the element was (@c true) or was not (@c false) successfully 
 * added to the queue.
 */
bool queue_push( queue_Queue* queue, void* element ) ;

/* queue::push-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/queue.org::*Operations][queue::pop-PROTO]] */
/**
 * @brief Remove the head element from the specified queue
 *
 * The @e queue_pop() function will remove the head @c queue_Element instance 
 * from the specified queue. The function is robust to instances where the provided queue
 * is empty; the queue remains unchanged in this scenario.
 *
 * @param queue A pointer to a queue data structure whose head element is to be removed.
 *
 * @return A pointer to the @c queue_Element that was removed from the
 * queue structure. If the @c queue_Element is the first element of a
 * containing structure, you should be able to cast this pointer to 
 * the enclosing structure's type to access the specialized structure's members.
 */
queue_Element* queue_pop( queue_Queue* queue ) ;
         
/* queue::pop-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/queue.org::*Operations][queue::delete-PROTO]] */
/**
 * @brief Delete an arbitrary element from a queue
 *
 * The @e queue_delete() function deletes an arbitrary event @e element from its queue.
 *
 * @param element A pointer to the element to remove from its queue.
 *
 * @return Nothing.
 */
void queue_delete( void* element ) ;

/* queue::delete-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/queue.org::*Operations][queue::get_head-PROTO]] */
/**
 * @brief Get a pointer to the first element in the specified queue
 *
 * The @e queue_get_head() function returns a void pointer to the first element in the
 * specified queue. This pointer can be cast by the calling context to
 * the expected storage type of the queue.
 *
 * @param queue The queue structure whose head element will be retrieved.
 *
 * @return A pointer to the head element in @e queue. If the queue is
 * empty, the returned value will be NULL.
 */
void* queue_get_head( queue_Queue queue ) ;

/* queue::get_head-PROTO ends here */
/* [[file:~/mainline/services/hmi-notification/doc/queue.org::*Operations][queue::next_element-PROTO]] */
/**
 * @brief Move to the next element following the specified one
 *
 * The @e queue_next_element() function can be used to iterate over queued elements from the
 * head toward the tail.
 *
 * @param element A pointer to an element structure that represents the
 *      queue element that is currently being visited.
 *
 * @return A pointer to the containing structure of the next element or
 * NULL if no such element exists.
 */
void* queue_next_element( void* element ) ;

/* queue::next_element-PROTO ends here */

#endif  /* __QUEUE_H__ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/hmi-notification/public/hnm/queue.h $ $Rev: 730777 $")
#endif
