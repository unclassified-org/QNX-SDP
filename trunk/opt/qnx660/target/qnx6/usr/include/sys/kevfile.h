/*
 * $QNXLicenseC:
 * Copyright 2007, QNX Software Systems. All Rights Reserved.
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


/*
 * kevfile.h
 * 
 * kevfile operations
 * 
 */	
 
#ifndef __KEVFILE_H__
#define __KEVFILE_H__
#include <sys/types.h>
#include <sys/neutrino.h>
#include <sys/tracelog.h>
#include <inttypes.h>

#define _TRACE_MAKE_CODE(c,f,cl,e)  (((c)<<24)|(f)|(cl)|(e))

struct attributes {
	struct attributes *next;
	char *key;
	char *value;
};

typedef struct kevfile_buf kevfile_buf_t;
struct kevfile_buf {
	kevfile_buf_t	*next;
	size_t			nbytes;
	unsigned char	*data;
	unsigned		off;
};
typedef struct kevfile kevfile_t;
struct kevfile {
	tracelog_write_t	write;
	tracelog_writev_t	writev;
	void 		*cookie;
	uint8_t		*addr;
	off_t		current_offset;
	size_t		max_size;
	
	unsigned	buffers_logged;
	unsigned	buffers_dropped;
	unsigned	last_buffers_dropped;
	
	unsigned	num_buffers;
	intrspin_t		buf_spin;
	kevfile_buf_t	*free_buffers;
	kevfile_buf_t	*write_buffers;
	kevfile_buf_t	*write_tail;
	unsigned		write_depth;
	unsigned		max_write_depth;
};

__BEGIN_DECLS

extern kevfile_t		*kevfile_open( tracelog_write_t write, tracelog_writev_t writev, void *cookie, size_t max_size, void *pbufs, unsigned initial_buffers, struct attributes *extra_attributes );	
extern void				kevfile_close( kevfile_t *kevfile );
extern kevfile_buf_t	*kevfile_buffer_get( kevfile_t *kevfile );	
extern int				kevfile_buffer_put( kevfile_t *kevfile, kevfile_buf_t *buf );	
extern int				kevfile_flush( kevfile_t *kevfile );
extern unsigned			kevfile_space_left( kevfile_t *kevfile );

#define KEVFILE_FLUSH_NBUFS	1
#define kevfile_needs_flush( kev ) ( ((kev)->addr == NULL) && (kev)->write_depth > KEVFILE_FLUSH_NBUFS )
	
__END_DECLS

#endif /* __KEVFILE_H__ */
	

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/tracelog/public/sys/kevfile.h $ $Rev: 680336 $")
#endif
