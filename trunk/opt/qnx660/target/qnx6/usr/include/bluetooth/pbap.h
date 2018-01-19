/*
 * pbap.h
 *
 *  Created on: Nov 13, 2012
 *      Author: nouldbrahim
 */

#ifndef PBAP_PROFILE_COMMONG_DEFINES_H_
#define PBAP_PROFILE_COMMONG_DEFINES_H_

#define PPS_ROOT                    		"/pps"
#define PPS_SERVICES 						PPS_ROOT "/services"
#define PPS_BTMGR_ROOT 						PPS_SERVICES "/bluetooth"
#define PBAP_PPS_ROOT						PPS_BTMGR_ROOT "/phonebook"
#define PBAP_PPS_STATUS						PBAP_PPS_ROOT "/status"
#define PBAP_PPS_CMD 						PBAP_PPS_ROOT "/control"
#define PPS_SERVICES_OBJECT					PPS_BTMGR_ROOT "/services"

static const char INTIALIZATION_COMPLETE_STRING[] = "INTIALIZATION_COMPLETE";
static const char CALL_SYNC_START_STRING[] = "CALL_SYNC_START";
static const char SYNC_START_STRING[] = "SYNC_START";
static const char TESTING_SET_LOGGING_STRING[] = "TESTING_SET_LOGGING";

static const char CONTROL_OBJECT_NAME[] = "@control";
static const char CONTROL_OBJECT_ATTRIBUTE_COMMAND[] = "command";
static const char CONTROL_OBJECT_ATTRIBUTE_PARAM[] = "param";

static const char STATUS_OBJECT_NAME[] = "@status";
static const char STATUS_OBJECT_ATTRIBUTE_STATUS[] = "[n]status";
static const char STATUS_OBJECT_ATTRIBUTE_STATE[] = "[n]state";
static const char STATUS_OBJECT_ATTRIBUTE_DEVICE[] = "[n]device";

static const char COMPLETE_STRING[] = "COMPLETE";
static const char FAILED_STRING[] = "FAILED";
static const char PROCESSING_STRING[] = "PROCESSING";
static const char ERROR_BUSY_STRING[] = "ERROR_BUSY";
static const char ERROR_NOT_CONNECTED_STRING[] = "ERROR_NOT_CONNECTED";
static const char ERROR_COMMAND_NOT_KNOWN_STRING[] = "ERROR_COMMAND_NOT_KNOWN";

static const char DISCONNECTED_STRING[] = "DISCONNECTED";
static const char CONNECTED_STRING[] = "CONNECTED";
static const char UNINITIALIZED_STRING[] = "UNINITIALIZED";
static const char CONNECTING_STRING[] = "CONNECTING";

#endif //PBAP_PROFILE_COMMONG_DEFINES_H_
#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/services/io-bluetooth-cybercom/profiles/pbap/public/pbap.h $ $Rev: 726294 $")
#endif
