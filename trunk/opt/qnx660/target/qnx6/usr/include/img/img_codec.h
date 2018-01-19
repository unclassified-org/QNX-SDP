/* Copyright 2009, QNX Software Systems. All Rights Reserved.
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
#ifndef _IMG_CODEC_H_INCLUDED
#define _IMG_CODEC_H_INCLUDED

#ifndef _IMG_H_INCLUDED
#include <img/img.h>
#endif

__BEGIN_DECLS

typedef int (img_codec_decode_validate_f)(io_istream_t *input);
typedef int (img_codec_decode_begin_f)(io_istream_t *input, _Uintptrt *decode_data);
typedef int (img_codec_decode_f)(io_istream_t *input, const img_decode_callouts_t *callouts, img_t *img, _Uintptrt *decode_data);
typedef int (img_codec_decode_finish_f)(io_istream_t *input,_Uintptrt *decode_data);
typedef int (img_codec_encode_begin_f)(io_ostream_t*, _Uintptrt*);
typedef int (img_codec_encode_f)(io_ostream_t*, const img_encode_callouts_t*, img_t*, _Uintptrt*);
typedef int (img_codec_encode_finish_f)(io_ostream_t*, _Uintptrt*);

typedef struct {
	img_codec_decode_validate_f		*decode_validate_f;
	img_codec_decode_begin_f		*decode_begin_f;
	img_codec_decode_f				*decode_f;
	img_codec_decode_finish_f		*decode_finish_f;
	img_codec_encode_begin_f		*encode_begin_f;
	img_codec_encode_f				*encode_f;
	img_codec_encode_finish_f		*encode_finish_f;
} img_codec_funcs_t;

typedef int (img_codec_getfuncs_f)(img_codec_funcs_t*, unsigned);

#define IMG_CODEC_ADD_FUNC(_name,_entry,_func,_limit)	\
	{ if (((unsigned)&(((img_codec_funcs_t*)0)->_entry)) + sizeof(void(*)()) <= (_limit))	\
		(_name)->_entry = _func; }

#define IMG_DECODE_CHOOSE_FORMAT(_c,_i,_f,_n)		\
	((_c)->choose_format_f((_c)->data,_i,_f,_n))
#define IMG_DECODE_SETUP(_c,_i,_f)					\
	((_c)->setup_f((_c)->data,_i,_f))
#define IMG_DECODE_ABORT(_c,_i)						\
	((_c)->abort_f((_c)->data,_i))
#define IMG_DECODE_SCANLINE(_c,_i,_r,_l,_t)			\
	((_c)->scanline_f == NULL ? IMG_ERR_OK :		\
	(_c)->scanline_f((_c)->data,_i,_r,_l,_t))
#define IMG_DECODE_SET_PALETTE(_c,_i,_p,_f)			\
	((_c)->set_palette_f((_c)->data,_i,_p,_f))
#define IMG_DECODE_SET_TRANSPARENCY(_c,_i,_t)		\
	((_c)->set_transparency_f((_c)->data,_i,_t))
#define IMG_DECODE_FRAME(_c,_i)						\
	((_c)->frame_f((_c)->data,_i))
#define IMG_DECODE_SET_VALUE(_c,_i,_t,_v)			\
	((_c)->set_value_f == NULL ? IMG_ERR_OK :		\
	(_c)->set_value_f((_c)->data,_i,_t,_v))

#define IMG_ENCODE_CHOOSE_FORMAT(_c,_i,_f,_n)		\
	((_c)->choose_format_f((_c)->data,_i,_f,_n))
#define IMG_ENCODE_SETUP(_c,_i,_f)					\
	((_c)->setup_f((_c)->data,_i,_f))
#define IMG_ENCODE_ABORT(_c,_i)						\
	((_c)->abort_f((_c)->data,_i))
#define IMG_ENCODE_SCANLINE(_c,_i,_r,_l,_t)			\
	((_c)->scanline_f == NULL ? IMG_ERR_OK :		\
	(_c)->scanline_f((_c)->data,_i,_r,_l,_t))
#define IMG_ENCODE_GET_PALETTE(_c,_i,_p,_f)			\
	((_c)->get_palette_f((_c)->data,_i,_p,_f))
#define IMG_ENCODE_GET_TRANSPARENCY(_c,_i,_t)		\
	((_c)->get_transparency_f((_c)->data,_i,_t))
#define IMG_ENCODE_FRAME(_c,_i)						\
	((_c)->frame_f((_c)->data,_i))

extern img_codec_t img_codec_register(img_lib_t ilib, img_codec_getfuncs_f *getfuncs, const char *ext, const char *mime);
extern img_codec_t img_codec_register_dll(img_lib_t ilib, const char *so_path, const char *ext, const char *mime);
extern void img_codec_deregister(img_lib_t ilib, img_codec_t codec);

__END_DECLS

#endif

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/img/lib/public/img/img_codec.h $ $Rev: 680336 $")
#endif
