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
#ifndef _IOBT_CFG_H_INCLUDED
#define _IOBT_CFG_H_INCLUDED

#include <sys/cdefs.h>

__BEGIN_DECLS

typedef struct iobt_cfg {
	void *next;
	char *name;
	char *value;
} iobt_cfg_t;

iobt_cfg_t *iobt_add_cfg(iobt_cfg_t **cfgp, char const *name, char *value);
extern void iobt_free_cfg(iobt_cfg_t *cfg);
void iobt_free_cfgs(iobt_cfg_t *cfglist);
extern char *iobt_cfg_lookup(iobt_cfg_t *cfgroot, char *name);

__END_DECLS

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/iobt/public/bluetooth/iobt_cfg.h $ $Rev: 725214 $")
#endif
