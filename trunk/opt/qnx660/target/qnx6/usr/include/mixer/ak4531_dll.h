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
 *
 *      ak4531_dll.h
 *        
 */

#ifndef _AK4531_DLL_H_INCLUDED_
#define _AK4531_DLL_H_INCLUDED_


#define		AK4531_MINOR_VERSION		1


typedef
struct	ado_mixer_dll_params_ak4531
{
	HW_CONTEXT_T	*hw_context;
	void			(*write) (HW_CONTEXT_T *hw_context, uint16_t reg, uint16_t val);
	int32_t			(*init) (HW_CONTEXT_T *hw_context);
	void			(*destroy) (HW_CONTEXT_T *hw_context);
	uint32_t		spare[8];
}
ado_mixer_dll_params_ak4531_t;

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/audio/public/include/mixer/ak4531_dll.h $ $Rev: 680334 $")
#endif
