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
 *  x86/syspage.h
 *

 */

#ifndef __SYSPAGE_H_INCLUDED
#error x86/syspage.h should not be included directly.
#endif

/*
 *	CPU capability/state flags
 */
#define X86_CPU_CPUID		(1UL <<  0)	/* CPU supports cpuid instruction */
#define X86_CPU_RDTSC		(1UL <<  1)	/* CPU supports rdtsc instruction */
#define X86_CPU_INVLPG		(1UL <<  2)  /* CPU has INVLPG instruction */
#define X86_CPU_WP			(1UL <<  3)  /* CPU has WP bit in CR0 */
#define X86_CPU_BSWAP		(1UL <<  4)  /* CPU has BSWAP instruction */
#define X86_CPU_MMX			(1UL <<  5)  /* CPU has MMX instructions */
#define X86_CPU_CMOV		(1UL <<  6)  /* CPU has CMOVxx instructions */
#define X86_CPU_PSE			(1UL <<  7)  /* CPU has page size extensions */
#define X86_CPU_PGE			(1UL <<  8)  /* CPU has TLB global mappings */
#define X86_CPU_MTRR		(1UL <<  9)  /* CPU has MTRR registers */
#define X86_CPU_SEP			(1UL <<  10)  /* CPU supports SYSENTER  */
#define X86_CPU_SIMD		(1UL <<  11)  /* CPU supports SIMD (SSE1)  */
#define X86_CPU_FXSR		(1UL <<  12)  /* CPU supports FXSAVE/FXRSTOR  */
#define X86_CPU_PAE			(1UL <<  13)  /* CPU has phys addr extension  */
#define X86_CPU_NX			(1UL <<  14)  /* CPU supports NX PTE bit */
#define X86_CPU_SSE2		(1UL <<  15)  /* CPU supports SSE2 */
#define X86_CPU_AVX			(1UL <<  16)  /* CPU supports AVX */
#define X86_CPU_XSAVE		(1UL <<  17)  /* CPU supports XSAVE/XRSTOR */
#define X86_CPU_PAT 		(1UL <<  18)  /* CPU supports Page Attribute Tables */
#define X86_CPU_PTESPLIT_TLBFLUSH	(1UL <<  19)  /* Needs TLB flush when splitting a large page */

#if defined(ENABLE_DEPRECATED_SYSPAGE_SECTIONS)
/*
 *	Support hardware flags
 */
#define X86_HW_A20_MASK			(7UL <<  0)	/* Mask A20 gating type */
#define X86_HW_A20_NONE			(0UL <<  0)	/* No A20 gate */
#define X86_HW_A20_FAST			(1UL <<  0)	/* PS/2 fast A20 gate */
#define X86_HW_A20_AT			(2UL <<  0)	/* Standard AT kbd ctrl A20 gate */
#define X86_HW_A20_7552			(3UL <<  0)	/* IBM 7552 A20 gate */
#define X86_HW_WATCHDOG_MASK	(7UL <<  3)  /* Watchdog timer type */
#define X86_HW_WATCHDOG_NONE	(0UL <<  3)	/* No watchdog */
#define X86_HW_WATCHDOG_PS2		(1UL <<  3)  /* PS/2 watchdog */
#define X86_HW_WATCHDOG_386EX	(2UL <<  3)  /* 386ex watchdog */
#define X86_HW_BUS_ISA			(1UL <<  6)	/* Machine has ISA bus */
#define X86_HW_BUS_EISA			(1UL <<  7)	/* Machine has EISA bus */
#define X86_HW_BUS_PCI			(1UL <<  8)  /* Machine has PCI bus */
#define X86_HW_BUS_MCA			(1UL <<  9)	/* Machine has micro channel bus */
#define X86_HW_NO_DMA_MEM		(1UL << 10)	/* Machine has memory you can't DMA to/from */

struct	x86_boxinfo_entry {
	_Uint32t		hw_flags;			/* HW_* */
	_Uint32t		spare[9];
};

struct x86_diskinfo_entry {
	_Uint16t    valid;
	_Uint16t    heads;
	_Uint16t    cyls;
	_Uint16t    sectors;
	_Uint32t    nblocks;
	_Uint32t	spare;
};
#endif

#define LAPIC_ID_MAX			32
struct x86_smpinfo_entry {
	_SPPTR(void)		ap_start_addr;
	_SPPTR(unsigned)	lapic_addr;
	unsigned long		spare;
	_Uint32t		lapic_id[LAPIC_ID_MAX];
};

struct x86_syspage_entry {
	syspage_entry_info						DEPRECATED_SECTION_NAME(boxinfo);
	syspage_entry_info						smpinfo;
	syspage_entry_info				 		DEPRECATED_SECTION_NAME(diskinfo);
	unsigned long							spare[4];
	_SPPTR(struct x86_seg_descriptor_entry)	gdt;
	_SPPTR(struct x86_gate_descriptor_entry) idt;
	_SPPTR(_Paddr32t)						pgdir;
	_SPPTR(void)							real_addr;
};
 
struct x86_kernel_entry {
	unsigned char	code[4]; 
};

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/system/public/x86/syspage.h $ $Rev: 726780 $")
#endif
