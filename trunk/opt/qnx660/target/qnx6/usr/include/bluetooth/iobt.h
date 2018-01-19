/*
 * $QNXLicenseC:
 * Copyright 2008, QNX Software Systems. All Rights Reserved.
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

#ifndef _IOBT_H_INCLUDED
#define _IOBT_H_INCLUDED

#include <dlfcn.h>
#include <errno.h>
#include <malloc.h>
#include <pthread.h>
#include <stdarg.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/dispatch.h>
#include <sys/iofunc.h>
#include <sys/procmgr.h>
#include <sys/resmgr.h>
#include <sys/slog.h>
#include <sys/slogcodes.h>

#include <bluetooth/iobt_log.h>
#include <bluetooth/iobt_cfg.h>
#include <bluetooth/btmgr.h>

#define PREFIX_IO_BLUETOOTH "/dev/io-bluetooth"
#define CONFIG_IO_BLUETOOTH "/etc/system/config/bluetooth.conf"
#define BLUETOOTH_NAME "QNX CAR"

__BEGIN_DECLS

struct iobt_ctrl_block;
struct iobt_addr;

typedef struct _iobt_profile_entry {
	char *name;
	unsigned flags;
	int (*init)(struct iobt_ctrl_block *bcp, iobt_cfg_t *cfg, void **phandle);
	int (*create_service)(struct iobt_addr const * addr, iobt_service_t const * serviceCode, void *phandle);
	int (*disconnect_service)(struct iobt_addr const* addr, iobt_service_t const * serviceCode, void *phandle);
	int (*radio_shutdown_procedure)(void *phandle);
	int (*terminate)(void *phandle);
	uint16_t service_length;
	uint16_t service[];
} iobt_profile_entry_t;

typedef struct iobt_profile {
	struct iobt_profile *next;
	char *name;
	char *dlname;
	void *dlhandle;
	iobt_cfg_t *cfg;
	iobt_profile_entry_t *pentry;
	void *phandle;
} iobt_profile_t;

typedef struct iobt_ctrl_block {
	/* for resmgr */
	dispatch_t *dpp;
	thread_pool_t *tpp;

	/* profile link list */
	struct iobt_profile *profile_list;

	/* options */
	char *conf_file;
	char *prefix;
	char *btname;
	int verbose;
	int logfd;
	char* dump;
	int daemon;
	int threads;
	int prio;

} iobt_ctrl_t;

#define iobt_addr_to_bdaddr(_addr, _baddr) {\
    int i; \
    for (i = 0; i < IOBT_ADDR_SIZE; i++) { \
       (_baddr)->addr[i] = (_addr)->addr[(IOBT_ADDR_SIZE-1) - i];\
    }\
}

#define iobt_bdaddr_to_addr(_baddr, _addr) {\
   int i; \
   for (i = 0; i < IOBT_ADDR_SIZE; i++) {\
      (_addr)->addr[i] = (_baddr)->addr[(IOBT_ADDR_SIZE-1) - i];\
   }\
}

__END_DECLS

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/iobt/public/bluetooth/iobt.h $ $Rev: 725214 $")
#endif
