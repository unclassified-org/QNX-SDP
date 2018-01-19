/*
 * $QNXLicenseC:
 * Copyright 2013, QNX Software Systems.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You
 * may not reproduce, modify or distribute this software except in
 * compliance with the License. You may obtain a copy of the License
 * at: http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OF ANY KIND, either express or implied.
 *
 * This file may contain contributions from others, either as
 * contributors under the License or as licensors under other terms.
 * Please review this entire file for other proprietary rights or license
 * notices, as well as the QNX Development Suite License Guide at
 * http://licensing.qnx.com/license-guide/ for other information.
 * $
 */

#ifndef HDRINCL_WFDCFG_IMX6X
#define HDRINCL_WFDCFG_IMX6X

#include <wfdqnx/wfdcfg.h>

/**
 * Extensions for i.MX6
 *
 */

enum imx6x_ldb_options {
	TIMING_LDB_DATA_MAPPING_SPWG,   /* 24 bit SPWG */
	TIMING_LDB_DATA_MAPPING_JEIDA,  /* 24 bit JEIDA or 18 bit SPWG */
	TIMING_LDB_DATA_MAPPING_SPWG_24 = TIMING_LDB_DATA_MAPPING_SPWG,   /* alias */
	TIMING_LDB_DATA_MAPPING_SPWG_18 = TIMING_LDB_DATA_MAPPING_JEIDA,  /* alias */
};
#define TIMING_LDB_OPTIONS "ldb_options"

/**
 * Some users prefer to program the IPU clock sources explicitly to
 * avoid EMI, jitter or other issues related to clock source selection.
 * These options collectively provide full control over all clock setup:
 *
 * TIMING_LDB_DISABLE_CLOCK_SETUP disables LDB clock PLL configuration.
 * The clock source will be gated and ungated as required, but there
 * will be no frequency changes.
 *
 * TIMING_EXT_CLK_KHZ disables IPU clock MUX configuration.  The internal
 * divisor in the IPU will be computed assuming the external clock
 * frequency is the option value.
 *
 * TIMING_DI_DIVISOR specifies the internal frequency divisor in the IPU,
 * overriding any internally computed value.
 *
 * TIMING_CLK_UP_RAW and TIMING_CLK_DOWN_RAW provide fine control of the
 * pixel clock duty cycle.
 *
 * Setting all of the above options on a port provides maximum control
 * of clock behavior.
 */

/**
 * This option disables LDB clock configuration.  The BSP is expected
 * to configured the LDB clock source (e.g. PLL5) to an appropriate
 * value.
 *
 * If this option is set to a non-zero value, the PLL must be configured
 * to a rate of (7.0 * pixel_clk).  In this case, the pixel_clk_kHz
 * mode parameter will have no effect, but it should be the same as
 * the LVDS pixel rate so that the display refresh rate reported by WFD
 * will be correct.
 *
 * This option only affects displays that are routed to at least one
 * LVDS port.  Other displays use the internal IPU clock divider.
 */
#define TIMING_LDB_DISABLE_CLOCK_SETUP "ldb_disable_clock_setup"

/**
 * This option overrides IPU clock MUX inspection and configures the IPU
 * DI for external clocking.  The BSP is expected to configure an
 * appropriate clock before the WFD driver starts.
 *
 * The option value is the pixel clock frequency entering the IPU.
 * This frequency is used to compute the value for the IPU internal
 * frequency divider.
 *
 * If this option is used for an LVDS display,
 * TIMING_LDB_DISABLE_CLOCK_SETUP should be used as well.
 */
#define TIMING_EXT_CLK_KHZ "ext_clk_khz"

/**
 * This option controls IPU pixel clock frequency divisor calculation.
 * If a display port is routed to any LVDS output, the default is
 * 16 (divisor = 1.0); otherwise, the default is calculated to match
 * the pixel clock frequency of the selected mode.
 *
 * If this option is set to TIMING_DI_DIVISOR_DEFAULT, the pixel clock
 * from the mode is used to calculate an appropriate divisor value.
 * This is the default behavior if this extension is not used.
 *
 * If this option is set to TIMING_DI_DIVISOR_ROUND_UP, the divisor
 * is calculated, but rounded up so that the divisor has no fractional
 * component.  The pixel clock frequency may be less than the pixel
 * clock from the mode, but the clock signal may be more stable.
 *
 * If this option value is in the range [16..2047], the pixel clock
 * from the mode is ignored, and the value is used directly
 * in register IPUx_DIn_BS_CLKGEN0 field diN_disp_clk_period.
 *
 * For LVDS displays this option should not be used unless it is also
 * used with TIMING_DISABLE_CLOCK_SETUP and TIMING_EXT_CLK_KHZ
 * to produce a correct configuration.
 */
#define TIMING_DI_DIVISOR "di_divisor"

/**
 * Special values for TIMING_DI_DIVISOR.  Values 0..15 are not valid
 * for the hardware, so we assign them special meanings.
 */
#define TIMING_DI_DIVISOR_DEFAULT  0   /* compute div and use it */
#define TIMING_DI_DIVISOR_ROUND_UP 1   /* compute div, round up */

/**
 * Output "format", i.e. arrangement of pixel bits on output pads
 * connected to the RGB parallel interface.  This DOES NOT affect graphics
 * formats which are always expanded to RGB888 internally.  For HDMI and
 * LVDS always use RGB888--the downstream bridges will handle pixel bit
 * arrangement, and the bridges expect RGB888.
 */
enum imx6x_output_formats {
	TIMING_OUTPUT_FORMAT_RGB888 = 24,  /* 24 bit (use for 18-bit SPWG too) */
	TIMING_OUTPUT_FORMAT_RGB666 = 18,  /* 18 bit (parallel LCD panels, not LVDS) */
	TIMING_OUTPUT_FORMAT_RGB565 = 16,  /* 16 bit parallel LCD panels */
};
#define TIMING_OUTPUT_FORMAT "output_format"

/**
 * These control the phase of the rising and falling edges of the clock.
 * The default value for 'up' is 0, 'down' is the DI divisor (i.e. 1/2
 * the clock period).
 *
 * The "_RAW" variants are the raw register values for DI_BS_CLKGEN1
 * (8 integer bits + 1 fractional bit).
 *
 * The non-_RAW variants are deprecated.  They use ns units instead
 * of IPU external clock frequency units.  They are provided for
 * compatibility with legacy display configurations.
 *
 * If both variants are specified, the deprecated variant is ignored.
 */
#define TIMING_CLK_DOWN_RAW "clk_down_raw"
#define TIMING_CLK_UP_RAW   "clk_up_raw"
#define TIMING_CLK_DOWN "clk_down" /* Deprecated */
#define TIMING_CLK_UP   "clk_up" /* Deprecated */

/**
 * The following options are DEPRECATED.  They used to change the
 * selection of the LVDS LDB input clock, but the WFD driver now reads
 * the mux register directly.  They are now ignored, but preserved here
 * for backward compatibility.
 *
 * The LDB clock MUX should be configured by BSP or startup code.
 * The WFD driver will read the MUX register and act accordingly.
 */
enum imx6x_ldb_di0_clock_sel {
	TIMING_LDB_DI0_CLOCK_SEL_PLL5 = 0 << 9,
	TIMING_LDB_DI0_CLOCK_SEL_PLL2_352M_PFD = 1 << 9,
	TIMING_LDB_DI0_CLOCK_SEL_PLL2_396M_PFD = 2 << 9,
	TIMING_LDB_DI0_CLOCK_SEL_MMDC_CH1 = 3 << 9,
	TIMING_LDB_DI0_CLOCK_SEL_PLL3 = 4 << 9,
};
#define TIMING_LDB_DI0_CLOCK_SEL "ldb_di0_clock_sel" /* Deprecated */

enum imx6x_ldb_di1_clock_sel {
	TIMING_LDB_DI1_CLOCK_SEL_PLL5 = 0 << 12,
	TIMING_LDB_DI1_CLOCK_SEL_PLL2_352M_PFD = 1 << 12,
	TIMING_LDB_DI1_CLOCK_SEL_PLL2_396M_PFD = 2 << 12,
	TIMING_LDB_DI1_CLOCK_SEL_MMDC_CH1 = 3 << 12,
	TIMING_LDB_DI1_CLOCK_SEL_PLL3 = 4 << 12,
};
#define TIMING_LDB_DI1_CLOCK_SEL "ldb_di1_clock_sel" /* Deprecated */

/* Backward compatibility */
#define LDB_DI0_CLK_SEL_OPTIONS TIMING_LDB_DI0_CLOCK_SEL

#endif

/**
 * Port initialisation hook.  If this port extension exists, the WFD driver
 * will call the given function when the port is created.
 *  .p is a pointer to a function of type wfdcfg_ext_fn_port_init1_t
 *      (which returns EOK on success or another errno code on failure)
 *  .i must be zero
 */
#define WFDCFG_EXT_FN_PORT_INIT1     "port_init1"
typedef int (wfdcfg_ext_fn_port_init1_t)(struct wfdcfg_port*);

/**
 * Port deinitialisation hook.  If this port extension exists, the WFD driver
 * will call the given function when the port is destroyed.
 *  .p is a pointer to a function of type wfdcfg_ext_fn_port_uninit1_t
 *  .i must be zero
 */
#define WFDCFG_EXT_FN_PORT_UNINIT1   "port_uninit1"
typedef void (wfdcfg_ext_fn_port_uninit1_t)(struct wfdcfg_port*);

/**
 * Port modesetting hook.  If this port extension exists, the WFD driver
 * will call the given function when programming a mode.
 *  .p is a pointer to a function of type wfdcfg_ext_fn_port_set_mode_t
 *      (which takes a pointer to the mode being programmed, and
 *      returns EOK on success or another errno code on failure)
 *  .i must be zero
 */
#define WFDCFG_EXT_FN_PORT_SET_MODE2 "port_set_mode2"
typedef int (wfdcfg_ext_fn_port_set_mode2_t)(struct wfdcfg_port*,
		const struct wfdcfg_timing*);

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/hardware/wfd/imx6x/wfdcfg/public/wfdqnx/wfdcfg_imx6x.h $ $Rev: 761330 $")
#endif
