/* Copyright 2010, QNX Software Systems. All Rights Reserved.
 *
 * You must obtain a written license from and pay applicable license fees to
 * QNX Software Systems before you may reproduce, modify or distribute this
 * software, or any work that includes all or part of this software.  Free
 * development licenses are available for evaluation and non-commercial purposes.
 * For more information visit http://licensing.qnx.com or email licensing@qnx.com.
 *
 * This file may contain contributions from others.  Please review this entire
 * file for other proprietary rights or license notices, as well as the QNX
 * Development Suite License Guide at http://licensing.qnx.com/license-guide/
 * for other information.
 */

#include <stdint.h>

#ifndef SWBLIT_H_
#define SWBLIT_H_

#define SWBLIT_FMT_MASK_BPP             0x0000003F
#define SWBLIT_FMT_MASK_CSPACE          0x000000C0

#define SWBLIT_FMT_SHIFT_BPP            0
#define SWBLIT_FMT_SHIFT_CSPACE         6

#define SWBLIT_FMT_FLAG_REV             0x80000000
#define SWBLIT_FMT_FLAG_ALPHA_VAL       0x40000000
#define SWBLIT_FMT_FLAG_ALPHA_LOC       0x20000000

#define SWBLIT_FMT_BITS_PER_PIXEL(__fmt) \
    ((__fmt) & SWBLIT_FMT_MASK_BPP)
#define SWBLIT_FMT_BYTES_PER_PIXEL(__fmt) \
    (((__fmt) & SWBLIT_FMT_MASK_BPP) >> 3)
#define SWBLIT_FMT_IS_RGB(__fmt) \
    ((((__fmt) & SWBLIT_FMT_MASK_CSPACE) >> SWBLIT_FMT_SHIFT_CSPACE) == 0)
#define SWBLIT_FMT_IS_YUV_PACKED(__fmt) \
    ((((__fmt) & SWBLIT_FMT_MASK_CSPACE) >> SWBLIT_FMT_SHIFT_CSPACE) == 1)
#define SWBLIT_FMT_IS_YUV_PLANAR(__fmt) \
    ((((__fmt) & SWBLIT_FMT_MASK_CSPACE) >> SWBLIT_FMT_SHIFT_CSPACE) == 2)
#define SWBLIT_FMT_HAS_ALPHA_VALUE(__fmt) \
    ((__fmt) & SWBLIT_FMT_FLAG_ALPHA_VAL)
#define SWBLIT_FMT_HAS_ALPHA_CHANNEL(__fmt) \
    ((__fmt) & SWBLIT_FMT_FLAG_ALPHA_LOC)


#ifdef __cplusplus
extern "C" {
#endif

/*!
 * Packed RGB (alpha) or YUV.
 * Interpretation, bit depth, byte order and swizzle depends
 * on surface it's targeting.
 */
typedef uint32_t swblit_color_t;

/*!
 *
 */
typedef uint8_t swblit_bool_t;

/*!
 *
 */
typedef enum {
	SWBLIT_FILTER_NONE,
	SWBLIT_FILTER_FASTEST,
	SWBLIT_FILTER_NICEST
} swblit_filter_t;

/*!
 *
 */
typedef enum {
    SWBLIT_TEST_LESS_THAN,
    SWBLIT_TEST_LESS_THAN_OR_EQUAL,
    SWBLIT_TEST_EQUAL,
    SWBLIT_TEST_GREATER_THAN_OR_EQUAL,
    SWBLIT_TEST_GREATER_THAN,
    SWBLIT_TEST_NOT_EQUAL
} swblit_test_t;

/*!
 * Read big-endian.
 */
typedef enum {
    SWBLIT_FMT_R5G6B5   = 16,
    SWBLIT_FMT_X8R8G8B8 = 32 | SWBLIT_FMT_FLAG_ALPHA_LOC,
    SWBLIT_FMT_B8G8R8X8 = 32 | SWBLIT_FMT_FLAG_ALPHA_LOC | SWBLIT_FMT_FLAG_REV,
    SWBLIT_FMT_A8R8G8B8 = 32 | SWBLIT_FMT_FLAG_ALPHA_LOC | SWBLIT_FMT_FLAG_ALPHA_VAL,
    SWBLIT_FMT_B8G8R8A8 = 32 | SWBLIT_FMT_FLAG_ALPHA_LOC | SWBLIT_FMT_FLAG_ALPHA_VAL | SWBLIT_FMT_FLAG_REV,
    SWBLIT_FMT_Y8V8Y8U8 = 16 | (1 << SWBLIT_FMT_SHIFT_CSPACE),
    SWBLIT_FMT_U8Y8V8Y8 = 16 | (1 << SWBLIT_FMT_SHIFT_CSPACE) | SWBLIT_FMT_FLAG_REV
} swblit_format_t;

/*!
 * For formats with alpha, controls whether operations assume
 * non pre-multiplied (NPM) or pre-multiplied (PM) alpha (with color).
 */
typedef enum {
    SWBLIT_ALPHA_MODE_NPM,
    SWBLIT_ALPHA_MODE_PM
} swblit_alpha_mode_t;

/*!
 * SWBLIT_ALPHA_OP_NONE: Color pixels are copied.
 *
 * SWBLIT_ALPHA_OP_TEST: Copy pixel only if it passes a logical test.
 *
 * SWBLIT_ALPHA_OP_BLEND_OVER: Porter-Duff source-over applied to color only.
 *
 * In all cases, destination alpha is controlled using swblit_context_set_alpha_dst_op().
 */
typedef enum {
    SWBLIT_ALPHA_OP_NONE,
    SWBLIT_ALPHA_OP_TEST,
    SWBLIT_ALPHA_OP_BLEND_OVER
} swblit_alpha_op_t;

/*!
 * The alpha valued used for blending.
 *
 * For SWBLIT_ALPHA_OP_BLEND_OVER+SWBLIT_ALPHA_CONST:
 *  Porter-Duff source-over blending using alpha value from context.
 *
 * For SWBLIT_ALPHA_OP_BLEND_OVER+SWBLIT_ALPHA_SRC_PIX_SRC:
 *  Porter-Duff source-over blending using alpha value from source pixel.
 */
typedef enum {
    SWBLIT_ALPHA_SRC_CONST,
    SWBLIT_ALPHA_SRC_PIX_SRC
} swblit_alpha_src_t;

/*!
 * Determines the output value of the destination alpha channel.
 */
typedef enum {
	SWBLIT_ALPHA_DST_OP_DEFAULT,
    SWBLIT_ALPHA_DST_OP_REPLACE,
    SWBLIT_ALPHA_DST_OP_ONE,
} swblit_alpha_dst_op_t;

/*!
 * Return codes.
 */
typedef enum {
    SWBLIT_ERR_NONE,
    SWBLIT_ERR_PARAM_MISSING,
    SWBLIT_ERR_PARAM_INVALID,
    SWBLIT_ERR_CONV_UNSUPPORTED,    /* Unsupported surface conversion. */
    SWBLIT_ERR_FMT_UNSUPPORTED,     /* Surface format not supported with current operation. */
    SWBLIT_ERR_FMT_NO_ALPHA,        /* Surface format missing required alpha channel. */
    SWBLIT_ERR_RECT_UNCLIPPED,
    SWBLIT_ERR_RECT_OVERLAP,
    SWBLIT_ERR_OP_UNSUPPORTED,
    SWBLIT_ERR_OP_INVALID
} swblit_error_t;

struct _swblit_context_t;
typedef struct _swblit_context_t* swblit_context_t;

struct _swblit_surface_desc_t;
typedef struct _swblit_surface_desc_t* swblit_surface_desc_t;

/*!
 *
 */
void swblit_context_create(swblit_context_t* ctx);

/*!
 *
 */
void swblit_context_destroy(swblit_context_t ctx);

/*!
 *
 */
void swblit_context_set_filter(swblit_context_t ctx, swblit_filter_t f);

/*!
 *
 */
void swblit_context_set_color(swblit_context_t ctx, swblit_color_t c);

/*!
 *
 */
void swblit_context_set_alpha_mode(swblit_context_t ctx, swblit_alpha_mode_t m);

/*!
 *
 */
void swblit_context_set_alpha_op(swblit_context_t ctx, swblit_alpha_op_t op);

/*!
 *
 */
void swblit_context_set_alpha_src(swblit_context_t ctx, swblit_alpha_src_t src);

/*!
 *
 */
void swblit_context_set_alpha_dst_op(swblit_context_t ctx, swblit_alpha_dst_op_t op);

/*!
 *
 */
void swblit_context_set_alpha_value(swblit_context_t ctx, uint8_t a);

/*!
 *
 */
void swblit_context_set_alpha_test(swblit_context_t ctx, swblit_test_t at);

/*!
 *
 */
void swblit_context_set_alpha_ref(swblit_context_t ctx, uint8_t r);

/*!
 *
 */
void swblit_context_set_simd(swblit_context_t ctx, swblit_bool_t simd);

/*!
 *
 */
void swblit_surface_desc_create(swblit_surface_desc_t* surf);

/*!
 *
 */
void swblit_surface_desc_destroy(swblit_surface_desc_t surf);

/*!
 *
 */
void swblit_surface_desc_init(swblit_surface_desc_t surf,
        int width,
        int height,
        unsigned stride,
        void *vaddr,
        swblit_format_t format);

/*!
 *
 */
swblit_error_t swblit_fill(
        swblit_context_t ctx,
        swblit_surface_desc_t dst,
        int sx, int sy,
        int width, int height);

/*!
 *
 */
swblit_error_t swblit_copy(
        swblit_context_t ctx,
        swblit_surface_desc_t src, swblit_surface_desc_t dst,
        int sx, int sy,
        int dx, int dy,
        int width, int height);

/*!
 *
 */
swblit_error_t swblit_scale(
        swblit_context_t ctx,
        swblit_surface_desc_t src, swblit_surface_desc_t dst,
        int sx, int sy,
        int swidth, int sheight,
        int dx, int dy,
        int dwidth, int dheight);

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /* SWBLIT_H_ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/swblit/public/swblit/swblit.h $ $Rev: 680336 $")
#endif
