/*
 * $QNXLicenseC:
 * Copyright 2009, QNX Software Systems. All Rights Reserved.
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
#ifndef DMSCONNECTOR_H
#define DMSCONNECTOR_H

#ifdef __cplusplus
extern "C" {
#endif

#define DMSCONNECTOR_SUCCESS						0
#define DMSCONNECTOR_ERROR							1
#define SERVER_INDEXING_STATE_COMPLETE              0           ///< Server complete indexing and time seek generation
#define SERVER_INDEXING_STATE_RUNNING               1           ///< Server indexing or time seek generating
#define SERVER_INDEXING_UKNOWN_STATE               	2           ///< Server indexing returned unknown state
#define INTERNAL_ERROR                             -1           ///< Internal error

#define WHITELIST_ENABLE_USING_MAC              	"mac"
#define WHITELIST_ENABLE_USING_IP               	"ip"
#define WHITELIST_ENABLE_USING_UUID               	"uuid"
#define WHITELIST_ENABLE_USING_FN               	"fn"

#define MAX_LOCAL_DEVICE_LENGTH                     32
#define MAX_FRIENDLYNAME_LENGTH                     64
#define ROOT_BOOKMARK_LENGTH                        128
#define MAX_URL_LENGTH								1024

#define DELETE_DB_ITEM                       		0
#define CHECK_DB_ITEM								1

struct clientInfo
{
	char uuid[ROOT_BOOKMARK_LENGTH];
	char mac[ROOT_BOOKMARK_LENGTH];
	char friendlyName[MAX_FRIENDLYNAME_LENGTH];
	char iconUrl[MAX_URL_LENGTH];
	char ip[MAX_URL_LENGTH];
	char isEnabled [8];

};

/**
 * dmsIsIndexing(): inform caller of the current indexing status of the server
 * @return  0 SERVER_INDEXING_STATE_COMPLETE - if server completed indexing,
 * 			1 SERVER_INDEXING_STATE_RUNNING - if server is still indexing,
 * 			2 SERVER_INDEXING_UKNOWN_STATE - if the server is in a uknown state,
 * 		   -1 INTERNAL_ERROR - if we are in an error state.
 */
int32_t dmsIsIndexing();


// dmsGetClientList, gets the list of clients.
//
// @param   listOfClients  Pointer to the list of devices.
// @param	nCount			Number of items in the list.
//
// @return  0 on success, otherwise 1 in an error situation.
// @note caller of this function need to free the list after it is done with it.
//       Example: struct clientInfo *listOfClients = NULL;
//                dmsGetClientList(&listOfClients, &rCount);
//				  printf("%s\n", listOfClients[0].friendlyName);
//				  free(listOfClients);
//
int32_t dmsGetClientList(struct clientInfo **listOfClients, int *nCount);

/**
 * dmsWhitelistServerClient(): enables or disables media sharing with server clients
 *  @param  value - value is based on the type possible values are
 *  				mac: 00:21:6B:53:66:44.
 *  				ip:  192.168.22.135
 *  				fn: FriendlyNameOfTheDevice
 *  				uuid: 55076f6e-6b79-4d65-6465-424242424242
 *  @param	type - type of the api to use when enabling or disabling devices possible values are:
 *  			    mac: WHITELIST_ENABLE_USING_MAC --> upnp_client_enable_by_mac().
 *  				ip:  WHITELIST_ENABLE_USING_IP --> upnp_client_enable_by_ip().
 *  				fn: WHITELIST_ENABLE_USING_FN --> upnp_client_enable_by_friendlyname().
 *  				uuid: WHITELIST_ENABLE_USING_UUID --> upnp_client_enable_by_udn().
 *
 *  @param	enable - boolean value to enable or disable possible values:
 *  				true: enable client
 *  				false: disable client
 *  @return  0 on success, otherwise 1 in an error situation.
 */
int32_t dmsWhitelistServerClient(const char *value, char *type, bool enable);

/**
 * dmsCheckOrDeleteItemFromDB(): check if item exists in the db or remove the item
 *  @param  itemPath - path to an item on the local storage
 *  				  e.g. /accounts/1000/shared/music/11 Yesterday.mp3
 *
 *  @param	actionType - type of the action:
 *  			      e.g. DELETE_DB_ITEM - delete the item with itemPath from DB
 *  					   CHECK_DB_ITEM  - just check if the item wth itemPath is in DB.
 *
 *  @return  1 on success, 0 if the action was not succesful -1 on internal error.
 */
int32_t dmsCheckOrDeleteItemFromDB(const char *itemPath, int actionType);

/**
 * dmsRemoveClientFromList(): removes a client from the DMS client database
 *  @param  strMac - the MAC Address of the client to be deleted from the database
 *  				  e.g. 00:21:6B:53:66:44
 *
 *  @return  1 on success, 0 if the action was not succesful -1 on internal error.
 */
int32_t dmsRemoveClientFromList(const char *strMac);

#ifdef __cplusplus
}  /* end of the 'extern "C"' block */
#endif

#endif /* DMSCONNECTOR_H */


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://foundry51.qnx.com/svn/repos/internal-source/branches/6.6.0/trunk/playto/libs/DMSConnector/public/dlna/dmsconnector.h $ $Rev: 54036 $")
#endif
