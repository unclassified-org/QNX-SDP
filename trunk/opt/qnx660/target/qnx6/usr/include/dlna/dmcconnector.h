/*
 * $QNXLicenseC:
 * Copyright 2012, QNX Software Systems. All Rights Reserved.
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
#ifndef DMCCONNECTOR_H
#define DMCCONNECTOR_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include <errno.h>
#include <stdbool.h>

#define STATE_STOPPED                               0           ///< Renderer stopped
#define STATE_PLAYING                               1           ///< Renderer is playing
#define STATE_TRANSITIONING                         2           ///< Renderer is transitioning to another state
#define STATE_PAUSED_PLAYBACK                       3           ///< Renderer pauses during playback
#define STATE_NO_MEDIA_PRESENT                      6           ///< Renderer has no media. Some devices use this state to signal that the device is in sleep mode.
#define STATE_UNKNOWN                               -1

#define QUEUE_EVENT_STOPPED                         0		//MUST EQUAL TO NMC_QUEUE_EVENT_STOPPED IN Tm_dmr_cp.h
#define QUEUE_EVENT_PLAYING                         1		//MUST EQUAL TO NMC_QUEUE_EVENT_PLAYING IN Tm_dmr_cp.h
#define QUEUE_EVENT_CLEARED                         1001	//MUST EQUAL TO NMC_QUEUE_EVENT_CLEARED IN Tm_dmr_cp.h
#define QUEUE_EVENT_SHUFFLED                        1002	//MUST EQUAL TO NMC_QUEUE_EVENT_SHUFFLED IN Tm_dmr_cp.h
#define QUEUE_EVENT_ITEM_REMOVED                    1003	//MUST EQUAL TO NMC_QUEUE_EVENT_ITEM_REMOVED IN Tm_dmr_cp.h
#define QUEUE_EVENT_ITEM_ADDED                      1004	//MUST EQUAL TO NMC_QUEUE_EVENT_ITEM_ADDED IN Tm_dmr_cp.h
#define QUEUE_EVENT_ITEM_MOVED                      1005	//MUST EQUAL TO NMC_QUEUE_EVENT_ITEM_MOVED IN Tm_dmr_cp.h
#define QUEUE_EVENT_ITEM_OUTOFSYNC                  1006	//MUST EQUAL TO NMC_QUEUE_EVENT_SYNC IN Tm_dmr_cp.h
#define QUEUE_EVENT_ITEM_SKIPPED                    1007	//MUST EQUAL TO ..... !!!

#define MAX_LOCAL_DEVICE_LENGTH                     32
#define MAX_FRIENDLYNAME_LENGTH                     64
#define ROOT_BOOKMARK_LENGTH                        128
#define MAX_URL_LENGTH                              1024
#define MAX_ERR_STR_LENGTH							256
#define VOLUME_CTRL_SET								0
#define VOLUME_CTRL_GET								1

#define DMSCP_SERVER_UPDATED	 					1
#define DMSCP_SERVER_CONTACT_LOST 					2
#define DMSCP_SERVER_DETECTED	  					3

#define DMRCP_RENDERER_CONTACT_LOST 				4
#define DMRCP_RENDERER_DETECTED						5

#define SEEKABLE_BY_TIME (0x01)
#define SEEKABLE_BY_POSITION (0x02)
#define SEEKABLE_UNKNOWN (-1);

typedef enum dmcErr {
	dmcErr_noErr=0,  //no error;
	dmcErr_ioWrite, //i/o write error at sink (pps object)
	dmcErr_ioRead, //i/o read error at source
	dmcErr_noMem, //not enough space;
	dmcErr_busy, //device or resource busy, retry may recover;
	dmcErr_inval, //invlalid argument;
	dmcErr_noSupport, //not supported;
	dmcErr_timeout,
	dmcErr_notAvail, //resource not avaliable, retry my recover;
	dmcErr_pps, //specifically for pps resource error;
	dmcErr_noExist, //sink (dmr object) no exist;
	dmcErr_outofState,
	dmcErr_outofRange, //Speed out of range
	dmcErr_unknown,
	dmcErr_framework_no_supported_objects, // error 25   //!< Play queue is empty or contains only unsupported objects
	dmeErr_no_supported_media_format //render doesn support the media format.
} dmcErr_t;

typedef struct sourceInfo
{
	char uuid[ROOT_BOOKMARK_LENGTH];
	char mac[ROOT_BOOKMARK_LENGTH];
	char friendlyName[MAX_FRIENDLYNAME_LENGTH];
	char iconUrl[MAX_URL_LENGTH];
	char isLocalDevice[MAX_LOCAL_DEVICE_LENGTH];
	char modelDescription[ROOT_BOOKMARK_LENGTH];
	char strBaseUrl[MAX_URL_LENGTH];
	char strManufacturer[ROOT_BOOKMARK_LENGTH];
	char strModelName[ROOT_BOOKMARK_LENGTH];
	char strModelNumber [ROOT_BOOKMARK_LENGTH];
	char strModelDescription[ROOT_BOOKMARK_LENGTH];
	char strDlnaVersion [ROOT_BOOKMARK_LENGTH];
	char strUpnpVersion [ROOT_BOOKMARK_LENGTH];

	char isEnabled [8];

}sourceInfo_t;

typedef struct itemInfo
{
	char title[128];
	char duration[128];
	char date[128];
	char album[128];
	char creator[128];
	char artist[128];
	char albumUrl[MAX_URL_LENGTH];
	char resourceUrl[MAX_URL_LENGTH];
	char size[128];
	char mediaType[128];

}itemInfo_t;

typedef struct bookmarkInfo
{
	char folderName[128];
	char bookmark[1024];
	bool isDirectory;
	double count;

}bookmarkInfo_t;

#define VOLUME_STR_SIZE (8)
#define STATE_INFO_TYPE_POSITION (0)
#define STATE_INFO_TYPE_STATE (1)
#define STATE_INFO_TYPE_QUEUE (2)
#define STATE_INFO_TYPE_UNKNOWN (3)
#define STATE_INFO_TYPE_ERROR (4)

struct deviceStateInfo
{
	uint32_t nPlayState;	//transport_state
	uint64_t position;
	int playIndex;
	int qRemaining;
	int32_t qLastKnownEvent;
	uint64_t duration; //duration of the currently played track.
	uint32_t reportType; //STATE_INFO_TYPE_XXX
	dmcErr_t transport_status; //dmcErr_noErr if no error, otherwise those dmcErr_framework_xxxx.
	int32_t seekable;
	int32_t pausable;
	char uuid[ROOT_BOOKMARK_LENGTH];
	char currUrl[MAX_URL_LENGTH];
	char volume [VOLUME_STR_SIZE];
	char errStr[MAX_ERR_STR_LENGTH];
};

typedef struct trackInfo {
	const char * url;
	uint32_t duration;
	//... ...
}trackInfo_t;

typedef int (*dmc_deviceState_callback_t)(struct deviceStateInfo *deviceStateInfo, void *cbdata);
typedef int (*dmc_rendererState_callback_t)(sourceInfo_t *rendererState, int32_t nEventType, void *cbdata);
typedef int (*dmc_serverState_callback_t)( sourceInfo_t * serverstate, int32_t nEventType, void *cbdata);

dmcErr_t dmcSetLogThreshold(int threshold);

/**
 *  The dmr handle type.
 */
typedef struct dmr_connection dmr_connection_t;

/**
 *  The dms handle type.
 */
typedef struct dms_connection dms_connection_t;

/**
 *  The dmc handle type.
 */
typedef struct dmc_connector dmc_connector_t;


/**
 * dmcConnect(): connects to the DMC.  It creates a dmc connector instance. it must be called before
 * any other APIs calls
 * @param  void 
 * @return  valid dmc_connector handle on success, otherwise NULL.
 */
dmc_connector_t* dmcConnect(void);


/**
 * dmcDisconnect(): disconnects to the DMC.  
 * @param dmc   dmc connector handle created by dmcConnect();
 * @return void
 */
void dmcDisconnect(dmc_connector_t *dmc);

/**
 * dmcCreateDmrConnection(): for the given UUID update messages will be sent to the dmrStateCallback.
 * @param   dmc_connector_t *dmc   dmc connector handle created by dmcConnect();
 * @param   uuid    UUID of the DMR to be connected
 * @return  valid connection handle on success, otherwise NULL.
 */
dmr_connection_t * dmcCreateDmrConnection(dmc_connector_t *dmc, const char *uuid);

/**
 * dmcDeleteDmrConnection(): Disconnect from the dmr that represented by the connection handle.
 * @param dmc connector handle created by dmcConnect();
 * @param connection a connection handle that is to be deleted.
 * @return  void
 */
void dmcDeleteDmrConnection(dmc_connector_t *dmc, dmr_connection_t *connection);

/**
 * dmrAttachTrack(): attach a track to a DMR. 
 * @param dmr  handle of the DMR to which the content will be played.
 * @param track_url  path to the track.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrAttachTrack(dmr_connection_t *dmr, const char * track_url);

/**
 * dmrAttachPlaylist(): attach a new playlist to a DMR. 
 * @param dmr  handle of the DMR to which the content will be played.
 * @param playlist_url  path to the playlist
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrAttachPlaylist(dmr_connection_t *dmr, const char * playlist_url);

/**
 * dmrUpdatePlaylist(): update playlist on a DMR. 
 * @param dmr  handle of the DMR to which the content will be played.
 * @param newplaylist_url  path to the updated playlist
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrUpdatePlaylist(dmr_connection_t *dmr, const char * newplaylist_url,  int delta);

/**
 * dmrSetTrackIndex(): seeks to an track on the playlist. 
 * @param dmr  handle of the DMR to which the content will be played.
 * @param nQueueIndex   index of the track on the playlist queue to seek to.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrSetTrackIndex(dmr_connection_t *dmr, const char *nIndex);

/**
 * dmrPlay(): starts playback on a DMR.
 * Assumes the content, either single track or playlist,  has already been attached to the DMR.
 * @param dmr handle of the DMR to which the content will be played.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrPlay(dmr_connection_t *dmr);

/**
 * dmrStop(): stops playback a DMR.
 * @param dmr handle of the DMR to which the content will be played.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrStop(dmr_connection_t *dmr );

/**
 * dmrPause(): pauses playback on a DMR.
 * @param dmr handle of the DMR to which the content will be played.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrPause(dmr_connection_t *dmr);

/**
 * dmrSeek(): seek to a (time) position in the current track on a DMR.
 * @param dmr handle of the DMR to which the content will be played.
 * @param   position Time in ms to jump to in the stream.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrSeek(dmr_connection_t *dmr,  uint64_t position);

/**
 * dmrGetPosition(): gets the current playback position on DMR.
 * @param dmr handle of the DMR to which the content will be played.
 * @param position pointer to the position that the value will be returned.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrGetPosition (dmr_connection_t *dmr, uint64_t *position);

/**
 * dmrGetState(): provides the state of the DMR.
 * @param dmr handle of the DMR to which the content will be played.
 * @param   nPlayState pointer to the playstate in which the playstate will be returned.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrGetState (dmr_connection_t *dmr, uint32_t *nPlayState);

/**
 * dmrGetQueueSize: get the number of tracks on the play queue on a DMR.
 * @param dmr handle of the DMR to which the content will be played.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrGetQueueSize(dmr_connection_t *dmr, uint32_t *size);

/**
 * dmrGetTrackInfo: get the metadata of a track in the playlist queue of a DMR.
 * @param dmr handle of the DMR to which the content will be played.
 * @param index  index of the track that is queried;
 * @param trackInfor_t * info a pointer to the trackInfo structure.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrGetTrackInfo(dmr_connection_t *dmr, uint32_t index, trackInfo_t *info);

/**
 * dmcRegisterDeviceStateCallback, registers a callback from the connector on a specific DMR.
 * Notes:  calling this API overwrites previous registered callback func if exist. It can be used to unregister a callback func by passing dmrStateCallback=NULL
 * @param dmr handle of the DMR to which the content will be played.
 * @param   dmrStateCallback callback function.
 * @param   cbcata a pointer ahat will be echoed in the callback function.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmcRegisterDeviceStateCallback(dmr_connection_t *dmr,dmc_deviceState_callback_t dmrStateCallback, void * cbdata);

/**
 * dmcRegisterRendererStateCallback, registers a callback function from the dmc connector, to get notified on any changes of network DMRs.
 * Notes:  calling this API overwrites previous registered callback func if exist. It can be used to unregister a callback func by passing dmrRendererStateCallback=NULL
 * @param   dmc  handle to the DMC connector.
 * @param   dmrRendererStateCallback callback function.
 * @param   cbcata pointer that will be echoed in the callback function.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmcRegisterRendererStateCallback(dmc_connector_t *dmc, dmc_rendererState_callback_t dmrRendererStateCallback, void *cbdata);

/**
 * dmcRegisterServerStateCallback, registers a callback function from the dmc connector, to get notified on any changes of network DMSs.
 * Notes:  calling this API overwrites previous registered callback func if exist. It can be used to unregister a callback func by passing dmrServerStateCallback=NULL
 * @param   dmc  handle to the DMC connector.
 * @param   dmrServerStateCallback function to be called.
 * @param   cbcata pointer that will be echoed in the callback function.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmcRegisterServerStateCallback(dmc_connector_t *dmc, dmc_serverState_callback_t dmrServerStateCallback, void * cbdata);

/**
 * dmrCtrlGetDeviceList, gets the list of DMR devices seen by the Twonky stack for the device.
 * @param type Type of the device the list is for, dms will return list of servers, dmr will return list of renderers.
 * @param deviceInfoList  Pointer to the list of devices.
 * @param nCount	Number of items in the list.
 *
 * @return  0 on success, otherwise 1 in an error situation.
 * @note caller of this function need to free the list after it is done with it.
 *       Example: struct sourceInfo *listdmr = NULL;
 *             dmcCtrlGetDMRList(&listdmr, &rCount);
 *		  printf("%s\n", listdmr[0].friendlyName);
 *		  free(listdmr);
 */
int32_t dmcGetDMRList(sourceInfo_t **deviceInfoList, int *nCount);

/**
 * dmrCtrlGetDeviceList, gets the list of DMS devices seen by the Twonky stack for the device.
 * @param type Type of the device the list is for, dms will return list of servers, dmr will return list of renderers.
 * @param deviceInfoList  Pointer to the list of devices.
 * @param nCount	Number of items in the list.
 *
 * @return  0 on success, otherwise 1 in an error situation.
 * @note caller of this function need to free the list after it is done with it.
 *       Example: struct sourceInfo *listdms = NULL;
 *             dmcCtrlGetDMSList(&listdms, &rCount);
 *		  printf("%s\n", listdmr[0].friendlyName);
 *		  free(listdms);
 */
int32_t dmcGetDMSList(sourceInfo_t **deviceInfoList, int *nCount);

/**
 * dmrGetVolume, gets the volume of a specific DMR based on UUID provided to function.
 * @param dmr handle of the DMR to which the content will be played.
 * @param volume  the level the volume will be returned. Ranges 0 --> mute, max is 100 when no error
 * @return dmcErr_t
 */
dmcErr_t dmrGetVolume(dmr_connection_t *dmr, char *nVolumePercent);

/**
 * dmrSetVolume, sets the volume of a specific DMR based on UUID provided to function.
 * @param dmr handle of the DMR to which the content will be played.
 * @param volume  the level the volume will be changed to. Ranges 0 --> mute, max is 100 when no error
 * @return  dmcErr_t
 */
dmcErr_t dmrSetVolume(dmr_connection_t *dmr, char *nVolumePercent);

/**
 * dmrSetUpdateInterval(), set the DMR state update interval
 * @param dmr handle of the DMR to which the content will be played.
 * @param interval state update interval in ms
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrSetUpdateInterval(dmr_connection_t *dmr,  int interval);

/**
 * dmrSetPlayMode(), set the play mode on DMR.
 * @param dmr handle of the DMR to which the content will be played.
 * @param newMode  mode string, could be "normal", "repeat_single", "repeat_all", "shuffle"
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrSetPlayMode(dmr_connection_t *dmr,  const char *newMode);

/**
 * dmrSetSlideshowMode(), set the slide show mode on DMR.
 * @param dmr handle of the DMR to which the content will be played.
 * @param delay  Integer value of the delay between images. 0 is no automatic transition.
 * @param termination Can be stop or paused. 
 * @return dmcErr_noErr on success, otherwise dmcErr_t error.
 */
dmcErr_t dmrSetSlideshowMode(dmr_connection_t *dmr,  const char *delay, const char *termination);


/**
 * dmcCreateDmsConnection(): for the given UUID.
 * @param   dmc_connector_t *dmc   dmc connector handle created by dmcServerConnect();
 * @param   uuid    UUID of the DMS to be connected
 * @return  valid connection handle on success, otherwise NULL.
 */
dms_connection_t * dmcCreateDmsConnection(dmc_connector_t *dmc, const char *uuid);

/**
 * dmcDeleteDmsConnection(): delete dms connection that represented by the connection handle.
 * @param dmc connector handle created by dmcConnect();
 * @param connection a connection handle that is to be deleted.
 * @return  void
 */
void dmcDeleteDmsConnection(dmc_connector_t *dmc, dms_connection_t *dms);

/**
 * dmcGetKnownBookmarkItemCount(): Returns the count of a given bookmark.
 * @param   dmc_connector_t *dmc   dmc connector handle created by dmcServerConnect();
 * @param   dms_connection_t *dms  dms server handle created by dmcCreateDmsConnection();
 * @param   bookmark  bookmark for which we want the count.
 * 					- possible bookmarks for now are:
 * 						root       - Simple bookmark to get the count for root directory.
 *                      musicAll   - Simple bookmark to get the count for music directory containing all tracks.
 *                      pictureAll - Simple bookmark to get the count for picture directory containing all pictures.
 *                      videoAll   - Simple bookmark to get the count for video directory containing all videos.
 * @param   count count of children in the given bookmark. 
 * @return  0 on success, -1 on generic error, upnp error
 */
int32_t dmcGetKnownBookmarkItemCount(dmc_connector_t *dmc, dms_connection_t *dms, const char *bookmark, int *count);


/**
 * dmcGetServerItemsBookmark(): Returns a bookmark in bookmarkInfo_t struct that is a represantation of the last entered folder.
 * 								The bookmark that is returned in the bookmarkInfo_t **bkmkInfo will be used
 * 								in dmcGetServerItemMetadata() to retrive the metadata of the item
 * 								dmcGetServerItemsBookmark(dmc, dms, bkmkInfo->bookmark, 0, &bkmkInfo)
 * 								dmcGetServerItemMetadata(dmc, dms, bkmkInfo->bookmark, i, &bkmkItemInfo).
 * @param   dmc_connector_t *dmc   dmc connector handle created by dmcServerConnect();
 * @param   dms_connection_t *dms  dms server handle created by dmcCreateDmsConnection();
 * @param   bookmark  bookmark for which we want the count.
 * 					- possible bookmarks for now are:
 * 						root       - Simple bookmark to enter root directory.
 *                      musicAll   - Simple bookmark to enter music directory containing all tracks.
 *                      pictureAll - Simple bookmark to enter for picture directory containing all pictures.
 *                      videoAll   - Simple bookmark to enter for video directory containing all videos.
 * @param   bkmkInfo  bookmarkInfo_t struct that will hold the bookmarks info.
 * @return  0 on success, otherwise 1 in an error situation.
 */
int32_t dmcGetServerItemsBookmark(dmc_connector_t *dmc, dms_connection_t *dms, const char *bookmark, int index, bookmarkInfo_t **bkmkInfo);

/**
 * dmcGetServerItemMetadata(): Returns a metadata of a requested item that is a represantation of the last entered folder.
 * 								The bookmark that is returned in the bookmarkInfo_t **bkmkInfo will be used
 * 								in dmcGetServerItemMetadata() to retrive the metadata of the item
 * 								dmcGetServerItemsBookmark(dmc, dms, bkmkInfo->bookmark, 0, &bkmkInfo)
 * 								dmcGetServerItemMetadata(dmc, dms, bkmkInfo->bookmark, i, &bkmkItemInfo).
 * @param   dmc_connector_t *dmc   dmc connector handle created by dmcServerConnect();
 * @param   dms_connection_t *dms  dms server handle created by dmcCreateDmsConnection();
 * @param   bookmark  bookmark where the item we are interested in is located.
 * 					- possible bookmarks for now are:
 * 						root       - Simple bookmark to enter root directory.
 *                      musicAll   - Simple bookmark to enter music directory containing all tracks.
 *                      pictureAll - Simple bookmark to enter for picture directory containing all pictures.
 *                      videoAll   - Simple bookmark to enter for video directory containing all videos.
 * @param   bkmkItemInfo  itemInfo_t struct that will hold the items info.
 * @param   index  position of the item inside the bookmark.
 * @return  0 on success, otherwise 1 in an error situation.
 */
int32_t dmcGetServerItemMetadata(dmc_connector_t *dmc, dms_connection_t *dms, const char *bookmark, int index, itemInfo_t **bkmkItemInfo);

/**
 * dmcGetProtocolInfo(): get the protocolInfo for a DMR.
 * @param IN  dmc_connector_t *dmc           dmc connector handle created by dmcConnect();
 * @param IN  const char      *uuid          UUID of the DMR to be queried.
 * @param OUT char            **protocolInfo  protocol information returned by the device.
 * @return dmcErr_noErr on success, otherwise dmcErr_t error with *protocolInfo is set to NULL.
 * @note caller of this function need to free the *protocolInfo after it is done with it.
 *       Example: char *protocolInfo = NULL;
 *            dmcGetProtocolInfo(dmc, "uuid", &protocolInfo);
 *		  printf("%s\n", protocolInfo);
 *		  free(protocolInfo);
 */
dmcErr_t dmcGetProtocolInfo(dmc_connector_t *dmc, const char *uuid, char **protocolInfo);

#ifdef __cplusplus
}  /* end of the 'extern "C"' block */
#endif


#endif /* DMCCONNECTOR_H */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://foundry51.qnx.com/svn/repos/internal-source/branches/6.6.0/trunk/playto/libs/DMCConnector/public/dlna/dmcconnector.h $ $Rev: 54036 $")
#endif
