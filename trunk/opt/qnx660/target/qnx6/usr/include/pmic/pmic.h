/******************************************************************************
 * Filename:    pmic.h
 *
 * Copyright 2012, Research In Motion Ltd
 *
 * Author:      Matthew Mao
 *
 * Created:     January 2012
 *
 * Description: PMIC library common interface
 *****************************************************************************/
#ifndef __PMIC_H__
#define __PMIC_H__

#include <stdint.h>
#include <sys/slog.h>
#include <sys/slogcodes.h>
#include <intsvr/intsvr.h>

/*-----------------------------------------------------------------------------
 * Macros
 *---------------------------------------------------------------------------*/
#define INTFLAG_CATCH_MISS          ( 1 << 0 )
/* PmicIntUnmask() assumes the interrupt was previously unmasked by some
 * other client. Now if the interrupt is actually masked, PmicIntUnmask()
 * assumes it has already fired and delivers the attached event immediately. */

/*-----------------------------------------------------------------------------
 * Types
 *---------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
 * Data
 *---------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
 * Prototypes
 *---------------------------------------------------------------------------*/
int PmicRead( uint8_t dev, uint8_t reg, uint8_t *val, uint16_t cnt );
int PmicWrite( uint8_t dev, uint8_t reg, uint8_t *val, uint16_t cnt );
int PmicSet( uint8_t dev, uint8_t reg, uint8_t bts );
int PmicClear( uint8_t dev, uint8_t reg, uint8_t bts );
int PmicClearSet( uint8_t dev, uint8_t reg, uint8_t msk, uint8_t bts );

int PmicIntAttachEvent( uint32_t intid, struct sigevent *event, uint32_t flags, uint32_t *clientid );
int PmicIntDetachEvent( uint32_t intid, uint32_t clientid );
int PmicIntUnmask( uint32_t intid, uint32_t clientid );
int PmicIntMask( uint32_t intid, uint32_t clientid );

#endif // __PMIC_H__
/*-----------------------------------------------------------------------------
 * End of file
 *---------------------------------------------------------------------------*/

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/pmic/common/public/pmic/pmic.h $ $Rev: 680336 $")
#endif
