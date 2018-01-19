/*
 * $QNXLicenseC:
 * Copyright 2007, 2008, QNX Software Systems. All Rights Reserved.
 *
 * You must obtain a written license from and pay applicable license fees to QNX
 * Software Systems before you may reproduce, modify or distribute this software,
 * or any work that includes all or part of this software.	 Free development
 * licenses are available for evaluation and non-commercial purposes.  For more
 * information visit http://licensing.qnx.com or email licensing@qnx.com.
 *
 * This file may contain contributions from others.	 Please review this entire
 * file for other proprietary rights or license notices, as well as the QNX
 * Development Suite License Guide at http://licensing.qnx.com/license-guide/
 * for other information.
 * $
 */

#ifndef SHUTDOWN_H_INCLUDED
#define SHUTDOWN_H_INCLUDED

#ifndef _INTTYPES_H_INCLUDED
#include <inttypes.h>
#endif
#ifndef _UNISTD_H_INCLUDED
#include <unistd.h>
#endif

/* process classifications */
typedef enum
{
	CLASS_UNKNOWN = -1,
	CLASS_PHOTON_APP,		/* photon or graphical applications */
	CLASS_GRAPHICAL_APP = CLASS_PHOTON_APP,
	CLASS_APP,				/* non-graphical apps */
	CLASS_DAEMON,			/* servers, resmgrs, drivers */
	CLASS_FSYS,				/* filesystems */
	CLASS_DISPLAY,			/* display drivers */
	CLASS_NR				/* no_reset */
} ProcessClass_t;

/* shutdown types */
#define SHUTDOWN_PHOTON_USER		0
#define SHUTDOWN_PHOTON			1
#define SHUTDOWN_REBOOT			2       // does a cold reboot
#define SHUTDOWN_SYSTEM			3       // powers off the system in such a way to maintain the RTC 
#define SHUTDOWN_KILLSWITCH		4       // for most systems this will be the same as SHUTDOWN_SYSTEM. Used in cases where SHUTDOWN_SYSTEM doesn't actually poweroff the system. RTC will not be maintained.
#define SHUTDOWN_WARMREBOOT		5       // does a warm reboot if possible

/* how to deal with a non-responding application */
#define PROMPT_KILL		0	/* hit immediately with SIGKILL */
#define PROMPT_WAIT		1	/* continue waiting with pending SIGTERM */
#define PROMPT_SKIP		2	/* ignore and shutdown other processes */
#define PROMPT_CANCEL	3	/* abort shutdown in progress */

/* type of data to display, passed in as first arg to
   shutdown_display() */
#define DISPLAY_CLASS	1		/* new class of prcesses encountered */
#define DISPLAY_PROC	2		/* new process encountered */

/* passed in as second arg to shutdown_display() */
typedef union
{
	int proc_class;				/* use for DISPLAY_CLASS */
	char const *proc_name;	/* use for DISPLAY_PROC */
} DisplayData_t;

/* flags to use in shutdown() */
#define FLAG_FAST				0x1 /* do "fast" shutdown */
#define FLAG_DEBUG				0x2 /* debug mode, don't actually shutdown */
#define FLAG_VERBOSE			0x4
#define FLAG_VERY_VERBOSE	0x8
#define FLAG_PHLOGIN			0x10	/* if spawned from phlogin */
#define FLAG_PHOTON_REMOTE	0x20	/* remote photon session */
#define FLAG_NONROOT			0x40	/* ignore root priveleges */
#define FLAG_UNATTENDED		0x80 /* don't ask for options */
#define FLAG_NO_DAEMON		0x100 /* Don't daemonize process.*/

typedef struct
{
	uint64_t start_time;
	pid_t pid;
	int8_t class;
	uint8_t flags;
	uint8_t padding[2];
	char *name;
	unsigned connection_count;
	int *connections_from;
	/* Note that this type is passed to implementations of shutdown_classify.
	 * It is safe to modify it by appending to it, but for backwards compatibility
	 * the existing field order can't be changed.
	 */
} ProcessInfo_t;

/*** API ***/

extern void shutdown_system(int type,int flags);
extern void shutdown_system_with_reason(int type,int flags,char* reason);

/*** LIBSHUTDOWN CALLOUTS ***/
/*** implement what you want, the lib has stubs for the rest */

/* determine whether an app is photon- or console- based.  Should return one of the defined
   class types.	 Default stub unconditionally returns CLASS_UNKNOWN */
extern ProcessClass_t shutdown_classify(ProcessInfo_t const *pip);

/* display new process or class of processes being shutdown */
extern void shutdown_display(int type,DisplayData_t const *display);

/* called prior to shutdown of display procs but after the rest */
extern void shutdown_done(int type);

/* error has occurred (lib will exit with failure after issuing callout) */
extern void shutdown_error(char const *msg);

/* called to process intermediate events during shutdown */
extern void shutdown_process(void);

/* called to update progress */
extern void shutdown_progress(int done,int total);

/* called to  deal with a process that's not responding.  Should return PROMPT_KILL,
   PROMPT_WAIT, PROMPT_SKIP or PROMPT_CANCEL to indicate to the library how to deal with
   the errant process.	Default stub returns PROMPT_SKIP. */
extern int shutdown_prompt(char const *name,pid_t pid);

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/shutdown/public/sys/shutdown.h $ $Rev: 733536 $")
#endif
