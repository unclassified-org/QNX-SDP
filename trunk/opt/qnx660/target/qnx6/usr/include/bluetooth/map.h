/*
 * map_profile_common_define.h
 *
 *  Created on: Oct 31, 2012
 *      Author: nouldbrahim
 */

#ifndef MAP_PROFILE_COMMON_DEFINE_H_
#define MAP_PROFILE_COMMON_DEFINE_H_

#define PPS_ROOT                	    	"/pps"
#define PPS_SERVICES 						PPS_ROOT "/services"
#define PPS_BTMGR_ROOT 						PPS_SERVICES "/bluetooth"
#define MAP_PPS_ROOT						PPS_BTMGR_ROOT "/messages"
#define MAP_PPS_STATUS						MAP_PPS_ROOT "/status"
#define MAP_PPS_CMD 						MAP_PPS_ROOT "/control"
#define MAP_PPS_NOTIFICATION				MAP_PPS_ROOT "/notification"
#define MAP_QDB_PATH						"/dev/qdb/messages"

static const char CONTROL_OBJECT_NAME[] = "@control";
static const char CONTROL_OBJECT_ATTRIBUTE_COMMAND[] = "[n]command";
static const char CONTROL_OBJECT_ATTRIBUTE_ACCOUNT[] = "[n]account_id";
static const char CONTROL_OBJECT_ATTRIBUTE_HANDLE[] = "[n]message_handle";
static const char CONTROL_OBJECT_ATTRIBUTE_STATUS[] = "[n]message_status";
static const char CONTROL_OBJECT_ATTRIBUTE_FOLDER[] = "[n]message_folder";

static const char STATUS_OBJECT_NAME[] = "@status";
static const char STATUS_OBJECT_ATTRIBUTE_STATUS[] = "[n]status";
static const char STATUS_OBJECT_ATTRIBUTE_STATE[] = "[n]state";
static const char STATUS_OBJECT_ATTRIBUTE_DEVICE[] = "[n]device";

static const char NOTIFICATION_OBJECT_NAME[] = "@notification";
static const char NOTIFICATION_OBJECT_ATTRIBUTE_STATUS[] = "[n]status";
static const char NOTIFICATION_OBJECT_ATTRIBUTE_ACCOUNT_ID[] = "[n]account_id";
static const char NOTIFICATION_OBJECT_ATTRIBUTE_HANDLE[] = "[n]message_handle";
static const char NOTIFICATION_OBJECT_ATTRIBUTE_MESSAGE_TYPE[] = "[n]message_type";

static const char SYNC_COMPLETE_STRING[] = "COMPLETE";
static const char SYNC_FAILED_STRING[] = "FAILED";
static const char SYNC_PROCESSING_STRING[] = "PROCESSING";
static const char ERROR_BUSY_STRING[] = "ERROR_BUSY";
static const char ERROR_NOT_CONNECTED_STRING[] = "ERROR_NOT_CONNECTED";
static const char ERROR_COMMAND_NOT_KNOWN_STRING[] = "ERROR_COMMAND_NOT_KNOWN";

static const char DISCONNECTED_STRING[] = "DISCONNECTED";
static const char CONNECTED_STRING[] = "CONNECTED";
static const char UNINITIALIZED_STRING[] = "UNINITIALIZED";
static const char CONNECTING_STRING[] = "CONNECTING";

static const char MAP_COMMAND_STRING_SWITCH_INSTANCE[] = "SWITCH_INSTANCE";
static const char MAP_COMMAND_STRING_GET_FOLDER_LISTING[] = "GET_FOLDER_LISTING";
static const char MAP_COMMAND_STRING_UPDATE_INBOX[] = "UPDATE_INBOX";
static const char MAP_COMMAND_STRING_GET_MESSAGE_LISTING[] = "GET_MESSAGE_LISTING";
static const char MAP_COMMAND_STRING_GET_MESSAGE[] = "GET_MESSAGE";
static const char MAP_COMMAND_STRING_SET_MESSAGE_STATUS[] = "SET_MESSAGE_STATUS";
static const char MAP_COMMAND_STRING_SEND_MESSAGE[] = "SEND_MESSAGE";
static const char MAP_COMMAND_STRING_DELETE_MESSAGE[] = "DELETE_MESSAGE";
static const char MAP_COMMAND_STRING_INTIALIZATION_COMPLETE[] = "INTIALIZATION_COMPLETE";
static const char MAP_COMMAND_STRING_TESTING_NAVIGATE_TO_FOLDER[] = "TESTING_NAVIGATE_TO_FOLDER";
static const char MAP_COMMAND_STRING_TESTING_NAVIGATE_TO_ROOT[] = "TESTING_NAVIGATE_TO_ROOT";
static const char MAP_COMMAND_STRING_TESTING_SET_LOGGING[] = "TESTING_SET_LOGGING";
static const char MAP_COMMAND_STRING_UNKNOWN_COMMAND[] = "UNKNOWN_COMMAND";

#endif /* MAP_PROFILE_COMMON_DEFINE_H_ */

#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/io-bluetooth-cybercom/profiles/map/public/map.h $ $Rev: 726294 $")
#endif
