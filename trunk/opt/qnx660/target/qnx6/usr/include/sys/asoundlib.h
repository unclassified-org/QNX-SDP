/*
 *  Application interface library for the ALSA driver
 *  Copyright (c) by Jaroslav Kysela <perex@suse.cz>
 *
 *
 *   This library is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU Library General Public License as
 *   published by the Free Software Foundation; either version 2 of
 *   the License, or (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Library General Public License for more details.
 *
 *   You should have received a copy of the GNU Library General Public
 *   License along with this library; if not, write to the Free Software
 *   Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 *
 */

#ifndef __ASOUNDLIB_H
#define __ASOUNDLIB_H

#include <sys/asound.h>
#include <unistd.h>
#include <fcntl.h>

/*
 *  version.h
 */

#define SND_LIB_MAJOR		0
#define SND_LIB_MINOR		5
#define SND_LIB_SUBMINOR	2
#define SND_LIB_VERSION		((SND_LIB_MAJOR<<16)|\
							(SND_LIB_MINOR<<8)|\
							SND_LIB_SUBMINOR)
#define SND_LIB_VERSION_STR	"0.5.2"


/*
 *  error.h
 */

#define SND_ERROR_BEGIN				500000
#define SND_ERROR_INCOMPATIBLE_VERSION		(SND_ERROR_BEGIN+0)

#ifdef __cplusplus
extern "C" {
#endif

const char *snd_strerror( int errnum );

#ifdef __cplusplus
}
#endif

/****************************************************************************
 *                                                                          *
 *                              control.h                                   *
 *                          Control Interface                               *
 *                                                                          *
 ****************************************************************************/

typedef struct snd_ctl_callbacks {
	void *private_data;	/* should be used by an application */
	void (*rebuild) (void *private_data);
	void (*xswitch) (void *private_data, int cmd, int iface, snd_switch_list_item_t *item);
	void *reserved[29];	/* reserved for the future use - must be NULL!!! */
} snd_ctl_callbacks_t;

#ifdef __cplusplus
extern "C" {
#endif

typedef struct snd_ctl snd_ctl_t;
typedef struct snd_mixer snd_mixer_t;
typedef struct snd_pcm snd_pcm_t;


int snd_cards ( void );
int snd_cards_list ( int *cards , int card_array_size , int *cards_over );
int snd_card_name ( const char *string );
int snd_card_get_name ( int card , char *name , size_t size );
int snd_card_get_longname ( int card , char *name , size_t size );

int snd_ctl_open(snd_ctl_t **handle, int card);
int snd_ctl_open_name(snd_ctl_t **handle, const char *filename);
int snd_ctl_close(snd_ctl_t *handle);
int snd_ctl_driver_version(snd_ctl_t *ctl);
int snd_ctl_file_descriptor(snd_ctl_t *handle);
int snd_ctl_hw_info(snd_ctl_t *handle, struct snd_ctl_hw_info *info);
int snd_ctl_switch_list(snd_ctl_t *handle, snd_switch_list_t * list);
int snd_ctl_switch_read(snd_ctl_t *handle, snd_switch_t * sw);
int snd_ctl_switch_write(snd_ctl_t *handle, snd_switch_t * sw);
int snd_ctl_pcm_info(snd_ctl_t *handle, int dev, snd_pcm_info_t * info);
int snd_ctl_pcm_channel_info(snd_ctl_t *handle, int dev, int channel, int subdev, snd_pcm_channel_info_t * info);
int snd_ctl_pcm_channel_switch_list(snd_ctl_t *handle, int dev, int channel, snd_switch_list_t * list);
int snd_ctl_pcm_playback_switch_list(snd_ctl_t *handle, int dev, snd_switch_list_t * list);
int snd_ctl_pcm_capture_switch_list(snd_ctl_t *handle, int dev, snd_switch_list_t * list);
int snd_ctl_pcm_channel_switch_read(snd_ctl_t *handle, int dev, int channel, snd_switch_t * sw);
int snd_ctl_pcm_playback_switch_read(snd_ctl_t *handle, int dev, snd_switch_t * sw);
int snd_ctl_pcm_capture_switch_read(snd_ctl_t *handle, int dev, snd_switch_t * sw);
int snd_ctl_pcm_channel_switch_write(snd_ctl_t *handle, int dev, int channel, snd_switch_t * sw);
int snd_ctl_pcm_playback_switch_write(snd_ctl_t *handle, int dev, snd_switch_t * sw);
int snd_ctl_pcm_capture_switch_write(snd_ctl_t *handle, int dev, snd_switch_t * sw);
int snd_ctl_mixer_info(snd_ctl_t *handle, int dev, snd_mixer_info_t * info);
int snd_ctl_mixer_switch_list(snd_ctl_t *handle, int dev, snd_switch_list_t *list);
int snd_ctl_mixer_switch_read(snd_ctl_t *handle, int dev, snd_switch_t * sw);
int snd_ctl_mixer_switch_write(snd_ctl_t *handle, int dev, snd_switch_t * sw);
int snd_ctl_read(snd_ctl_t *handle, snd_ctl_callbacks_t * callbacks);

#ifdef __cplusplus
}
#endif

/****************************************************************************
 *                                                                          *
 *                               mixer.h                                    *
 *                           Mixer Interface                                *
 *                                                                          *
 ****************************************************************************/

#define SND_FILE_MIXER_PREFIX	"/dev/snd/"
#define SND_FILE_MIXER_NAME		"mixerC%iD%i"
#define SND_FILE_MIXER			SND_FILE_MIXER_PREFIX SND_FILE_MIXER_NAME

typedef struct snd_mixer_callbacks {
	void *private_data;	/* should be used with an application */
	void (*rebuild) (void *private_data);
	void (*element) (void *private_data, int cmd, snd_mixer_eid_t *eid);
	void (*group) (void *private_data, int cmd, snd_mixer_gid_t *gid);
	void *reserved[28];	/* reserved for the future use - must be NULL!!! */
} snd_mixer_callbacks_t;

typedef struct {
	char *name;
	int weight;
} snd_mixer_weight_entry_t;

#ifdef __cplusplus
extern "C" {
#endif

int snd_mixer_open(snd_mixer_t **handle, int card, int device);
int snd_mixer_open_name(snd_mixer_t **handle, const char *filename);
int snd_mixer_open_pcm(snd_mixer_t ** handle,  snd_pcm_t *pcm_handle);
int snd_mixer_close(snd_mixer_t *handle);
int snd_mixer_file_descriptor(snd_mixer_t *handle);
int snd_mixer_info(snd_mixer_t *handle, snd_mixer_info_t * info);
int snd_mixer_elements(snd_mixer_t *handle, snd_mixer_elements_t * elements);
int snd_mixer_routes(snd_mixer_t *handle, snd_mixer_routes_t * routes);
int snd_mixer_groups(snd_mixer_t *handle, snd_mixer_groups_t * groups);
int snd_mixer_group_read(snd_mixer_t *handle, snd_mixer_group_t * group);
int snd_mixer_group_write(snd_mixer_t *handle, snd_mixer_group_t * group);
int snd_mixer_element_info(snd_mixer_t *handle, snd_mixer_element_info_t * info);
int snd_mixer_element_read(snd_mixer_t *handle, snd_mixer_element_t * element);
int snd_mixer_element_write(snd_mixer_t *handle, snd_mixer_element_t * element);
int snd_mixer_get_filter(snd_mixer_t *handle, snd_mixer_filter_t * filter);
int snd_mixer_set_filter(snd_mixer_t *handle, snd_mixer_filter_t * filter);
int snd_mixer_read(snd_mixer_t *handle, snd_mixer_callbacks_t * callbacks);

void snd_mixer_set_bit(unsigned int *bitmap, int bit, int val);
int snd_mixer_get_bit(unsigned int *bitmap, int bit);

const char *snd_mixer_channel_name(int channel);

int snd_mixer_element_has_info(snd_mixer_eid_t *eid);
int snd_mixer_element_info_build(snd_mixer_t *handle, snd_mixer_element_info_t * info);
int snd_mixer_element_info_free(snd_mixer_element_info_t * info);
int snd_mixer_element_has_control(snd_mixer_eid_t *eid);
int snd_mixer_element_build(snd_mixer_t *handle, snd_mixer_element_t * element);
int snd_mixer_element_free(snd_mixer_element_t * element);

void snd_mixer_sort_eid_name_index(snd_mixer_eid_t *list, int count);
void snd_mixer_sort_eid_table(snd_mixer_eid_t *list, int count, snd_mixer_weight_entry_t *table);
void snd_mixer_sort_gid_name_index(snd_mixer_gid_t *list, int count);
void snd_mixer_sort_gid_table(snd_mixer_gid_t *list, int count, snd_mixer_weight_entry_t *table);
extern snd_mixer_weight_entry_t *snd_mixer_default_weights;

#ifdef __cplusplus
}
#endif

/****************************************************************************
 *                                                                          *
 *                                pcm.h                                     *
 *                        Digital Audio Interface                           *
 *                                                                          *
 ****************************************************************************/

#define SND_PCM_OPEN_PLAYBACK		0x0001
#define SND_PCM_OPEN_CAPTURE		0x0002
#define SND_PCM_OPEN_DUPLEX		0x0003
#define SND_PCM_OPEN_NONBLOCK		0x1000

#ifdef __cplusplus
extern "C" {
#endif

int snd_pcm_find(unsigned int format, int *number, int *cards, int *devices, int mode);
int snd_pcm_open(snd_pcm_t **handle, int card, int device, int mode);
int snd_pcm_open_name(snd_pcm_t **handle, const char *name, int mode);
int snd_pcm_open_preferred(snd_pcm_t **handle, int *rcard, int *rdevice, int mode);
int snd_pcm_close(snd_pcm_t *handle);
int snd_pcm_file_descriptor(snd_pcm_t *handle, int channel);
int snd_pcm_nonblock_mode(snd_pcm_t *handle, int nonblock);
int snd_pcm_info(snd_pcm_t *handle, snd_pcm_info_t * info);
int snd_pcm_channel_info(snd_pcm_t *handle, snd_pcm_channel_info_t * info);
int snd_pcm_channel_params(snd_pcm_t *handle, snd_pcm_channel_params_t * params);
int snd_pcm_channel_setup(snd_pcm_t *handle, snd_pcm_channel_setup_t * setup);
int snd_pcm_channel_status(snd_pcm_t *handle, snd_pcm_channel_status_t * status);
int snd_pcm_playback_prepare(snd_pcm_t *handle);
int snd_pcm_capture_prepare(snd_pcm_t *handle);
int snd_pcm_channel_prepare(snd_pcm_t *handle, int channel);
int snd_pcm_playback_go(snd_pcm_t *handle);
int snd_pcm_capture_go(snd_pcm_t *handle);
int snd_pcm_channel_go(snd_pcm_t *handle, int channel);
int snd_pcm_playback_pause ( snd_pcm_t *pcm );
int snd_pcm_capture_pause ( snd_pcm_t *pcm );
int snd_pcm_channel_pause ( snd_pcm_t *pcm , int channel );
int snd_pcm_playback_resume ( snd_pcm_t *pcm );
int snd_pcm_capture_resume ( snd_pcm_t *pcm );
int snd_pcm_channel_resume ( snd_pcm_t *pcm , int channel );
int snd_pcm_playback_drain(snd_pcm_t *handle);
int snd_pcm_playback_flush(snd_pcm_t *handle);
int snd_pcm_capture_flush(snd_pcm_t *handle);
int snd_pcm_channel_flush(snd_pcm_t *handle, int channel);
ssize_t snd_pcm_transfer_size(snd_pcm_t *handle, int channel);
ssize_t snd_pcm_write(snd_pcm_t *handle, const void *buffer, size_t size);
ssize_t snd_pcm_read(snd_pcm_t *handle, void *buffer, size_t size);
int snd_pcm_mmap(snd_pcm_t *handle, int channel, snd_pcm_mmap_control_t **control, void **buffer);
int snd_pcm_munmap(snd_pcm_t *handle, int channel);
int snd_pcm_get_audioman_handle(snd_pcm_t * handle, unsigned int * audioman_handle);
int snd_pcm_set_audioman_handle(snd_pcm_t * handle, unsigned int audioman_handle);
int snd_pcm_set_audioman_handle_type(snd_pcm_t * handle, const char * type);

int snd_pcm_link(snd_pcm_t *pcm1, snd_pcm_t *pcm2);
int snd_pcm_unlink(snd_pcm_t *pcm);

/* misc */

int snd_pcm_format_signed(int format);
int snd_pcm_format_unsigned(int format);
int snd_pcm_format_linear(int format);
int snd_pcm_format_little_endian(int format);
int snd_pcm_format_big_endian(int format);
int snd_pcm_format_width(int format);		/* in bits */
int snd_pcm_build_linear_format(int width, int unsignd, int big_endian);
ssize_t snd_pcm_format_size(int format, size_t samples);
const char *snd_pcm_get_format_name(int format);

#ifdef __cplusplus
}
#endif


/*
 *  Plug-In interface (ala C++)
 */

#define	PLUGIN_DISABLE_BUFFER_PARTIAL_BLOCKS	(1<<0) // Deprecated - please use PLUGIN_BUFFER_PARTIAL_BLOCKS
#define	PLUGIN_DISABLE_MMAP						(1<<1) // Deprecated - please use PLUGIN_MMAP

#define	PLUGIN_BUFFER_PARTIAL_BLOCKS			(1<<0)
#define	PLUGIN_MMAP								(1<<1)
#define	PLUGIN_ROUTING							(1<<2)
#define	PLUGIN_CONVERSION						(1<<3)

#ifdef __cplusplus
extern "C" {
#endif

ssize_t snd_pcm_plugin_transfer_size(snd_pcm_t *handle, int channel, size_t drv_size);
ssize_t snd_pcm_plugin_hardware_size(snd_pcm_t *handle, int channel, size_t trf_size);
int snd_pcm_plugin_info(snd_pcm_t *handle, snd_pcm_channel_info_t *info);
unsigned int snd_pcm_plugin_set_disable( snd_pcm_t *pcm, unsigned int mask );
unsigned int snd_pcm_plugin_set_enable( snd_pcm_t *pcm, unsigned int mask );
unsigned int snd_pcm_plugin_set_src_method ( snd_pcm_t *pcm , unsigned int method );
unsigned int snd_pcm_plugin_set_src_mode(snd_pcm_t * pcm, unsigned int src_mode, int target);
int snd_pcm_plugin_src_max_frag (snd_pcm_t * pcm, unsigned int fragsize);
int snd_pcm_plugin_update_src(snd_pcm_t * pcm, snd_pcm_channel_setup_t * setup, int currlevel);
int snd_pcm_plugin_params(snd_pcm_t *handle, snd_pcm_channel_params_t *params);
int snd_pcm_plugin_setup(snd_pcm_t *handle, snd_pcm_channel_setup_t *setup);
int snd_pcm_plugin_status(snd_pcm_t *handle, snd_pcm_channel_status_t *status);
int snd_pcm_plugin_prepare(snd_pcm_t *handle, int channel);
int snd_pcm_plugin_playback_drain(snd_pcm_t *handle);
int snd_pcm_plugin_flush(snd_pcm_t *handle, int channel);
int snd_pcm_plugin_pointer(snd_pcm_t *pcm, int channel, void **ptr, size_t *size);
ssize_t snd_pcm_plugin_write(snd_pcm_t *handle, const void *buffer, size_t size);
ssize_t snd_pcm_plugin_read(snd_pcm_t *handle, void *bufer, size_t size);
int snd_pcm_plugin_set_voice_conversion (snd_pcm_t *pcm, int channel, snd_pcm_voice_conversion_t *voice_conversion);
int snd_pcm_plugin_get_voice_conversion (snd_pcm_t *pcm, int channel, snd_pcm_voice_conversion_t *voice_conversion);
int snd_pcm_plugin_set_best_fit_voices(snd_pcm_t * pcm, int angle, snd_pcm_chmap_t *chmap);
int snd_pcm_plugin_reset_voice_conversion(snd_pcm_t * pcm, int channel);
#ifdef __cplusplus
}
#endif


#endif /* __ASOUNDLIB_H */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/asound/public/include/sys/asoundlib.h $ $Rev: 731507 $")
#endif
