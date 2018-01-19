/*
 * $QNXLicenseC:
 * Copyright 2010, QNX Software Systems. All Rights Reserved.
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

#ifndef FORKSAFE_MUTEX_H_
#define FORKSAFE_MUTEX_H_


#include <inttypes.h>
#include <pthread.h>

/*
 * file: public/forksafe.h
 * 
 * A forksafe_mutex_t is a replacement for a pthread_mutex that is automatically 
 * "handled" at fork time.
 * 
 * When a fork happens, all forksafe_mutexes are grabbed before the fork and released
 * after the fork on the parent, and initialized after the fork in the child.
 * This ensures that the forksafe_mutexes and the regions they protect are thread-safe
 * even when a process forks.  The fork cannot happen while any mutex is held
 * (and thus cannot happen while some other thread is in the middle of a critical
 * section), and the mutexes are left in the correct state post-fork.
 * 
 * Normally a forksafe_mutex_t structure is included in another structure.  The 
 * mutex is initialized, destroyed, locked, trylocked, or unlocked in the same 
 * manner as a pthread_mutex_t.  The only difference to a pthread_mutex_t
 * is that an forksafe_mutex_t supports fork under the hood.
 * 
 * Unfortunately it's not possible to statically initialize a forksafe_mutex_t, so at
 * worst initialization must be done with a pthread_once call.
 * 
 * A forksafe_mutex_t has one property unique from a pthread_mutex -- it has an order, 
 * passed in when the mutex is initialized.  This is a value between FORKSAFE_MUTEX_ORDER_MIN
 * and FORKSAFE_MUTEX_ORDER_MAX, which defines the order in which mutexes are locked
 * at fork time.  Mutexes are locked before the fork in increasing order, and are 
 * unlocked after the fork in decreasing order.  The intention is that the order 
 * mechanism can be used to avoid deadlocks where a single thread might hold two
 * separate mutexes simultaneously.  As long as locking/unlocking order is maintained,
 * there can be no deadlock.  Generally you won't care about order, in which case
 * you can specify FORKSAFE_MUTEX_ORDER_DEFAULT.
 * 
 * Also note that it's important that the pthread_mutexattr_t structure used to
 * initialize the mutex must survive until any/all subsequent fork calls, since we
 * need to reinitialize the mutex in the child process context;
 */


typedef uintptr_t forksafe_mutex_t;

#define FORKSAFE_MUTEX_ORDER_MIN 0
#define FORKSAFE_MUTEX_ORDER_DEFAULT 5
#define FORKSAFE_MUTEX_ORDER_MAX 10

extern int forksafe_mutex_init(forksafe_mutex_t *mtxp, const pthread_mutexattr_t *attr, unsigned order);
extern int forksafe_mutex_init_from_mutex(forksafe_mutex_t *mtxp, const pthread_mutex_t *orig_mutex, unsigned order);
extern int forksafe_mutex_destroy(forksafe_mutex_t *mtxp);
extern int forksafe_mutex_lock(forksafe_mutex_t *mtxp);
extern int forksafe_mutex_trylock(forksafe_mutex_t *mtxp);
extern int forksafe_mutex_unlock(forksafe_mutex_t *mtxp);
extern int forksafe_mutex_cond_wait(pthread_cond_t *condp, forksafe_mutex_t *mtxp);
extern int forksafe_mutex_cond_timedwait(pthread_cond_t *condp, forksafe_mutex_t *mtxp, const struct timespec *ts);


#endif /* FORKSAFE_MUTEX_H_ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/c/public/forksafe_mutex.h $ $Rev: 680336 $")
#endif
