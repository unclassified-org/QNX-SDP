/*
 * $QNXLicenseC:
 * Copyright 2008, QNX Software Systems. All Rights Reserved.
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
#if !defined(BLUETOOTH_BTMGR_H_INCLUDED)
#define BLUETOOTH_BTMGR_H_INCLUDED

__BEGIN_DECLS

#if !defined(__TYPES_H_INCLUDED)
#include <sys/types.h>
#endif

#ifndef BLUETOOTH_BTUTILS_H_INCLUDED
#include <bluetooth/btutils.h>
#endif

/** @file bluetooth/btmgr.h
 * io-bluetooth Bluetooth Manager external API.
 * @ingroup extBTMGR_API BTMGR External API
 */

/** @defgroup extBTMGR_API BTMGR External API
 */
/*@{*/

/** The maximum size for the Bluetooth friendly name */
#define IOBT_FRIENDLY_NAME_SIZE 248

/** The length of the service UUID */
#define IOBT_SERVICE_UUID_SIZE	(16)

/** Go to the next device in the device list */
#define iobt_device_info_next(_info) \
   (iobt_device_info_t *)ROUNDUP8((char *)(_info) + sizeof(iobt_device_info_t) + (_info)->namelen)

/** Bluetooth Stack State */
typedef _Uint16t iobt_stack_state_t;

#define IOBT_STACK_NOT_INITIALIZED 	0 /**< The stack has completed initialization of the radio hardware. */
#define IOBT_STACK_INITIALIZED 		1 /**< The stack is initialized. */
#define IOBT_STACK_INITIALIZE_ERR	2 /**< The stack has encountered an error while initializing the radio hardware. */
#define IOBT_STACK_DEINITIALIZE		3 /**< The stack is deinitializing. */

/** Bluetooth Device Status */
typedef _Uint16t iobt_device_status_t;

/** @name Bluetooth Device Status
 *  These are the results provided when a service discovery procedure is executed
 * @{*/
#define IOBT_IN_RANGE        0x01
#define IOBT_PAIRED          0x02
#define IOBT_TRUSTED         0x04
/**@}*/

/** Bluetooth class of device */
typedef _Uint32t iobt_class_t;

/** @name Major Service Classes
 *  Can be ORed together
 * @{*/
#define IOBT_COD_LIMITED_DISCOVERABLE_MODE 0x00002000
#define IOBT_COD_POSITIONING               0x00010000
#define IOBT_COD_NETWORKING                0x00020000
#define IOBT_COD_RENDERING                 0x00040000
#define IOBT_COD_CAPTURING                 0x00080000
#define IOBT_COD_OBJECT_TRANSFER           0x00100000
#define IOBT_COD_AUDIO                     0x00200000
#define IOBT_COD_TELEPHONY                 0x00400000
#define IOBT_COD_INFORMATION               0x00800000
/**@}*/

/** @name Major Device Classes
 *  Select one
 * @{*/
#define IOBT_COD_MAJOR_MISCELLANEOUS       0x00000000
#define IOBT_COD_MAJOR_COMPUTER            0x00000100
#define IOBT_COD_MAJOR_PHONE               0x00000200
#define IOBT_COD_MAJOR_LAN_ACCESS_POINT    0x00000300
#define IOBT_COD_MAJOR_AUDIO               0x00000400
#define IOBT_COD_MAJOR_PERIPHERAL          0x00000500
#define IOBT_COD_MAJOR_IMAGING             0x00000600
#define IOBT_COD_MAJOR_UNCLASSIFIED        0x00001F00
/**@}*/

/** @name Minor Device Class
 *  Computer Major class
 * @{*/
#define IOBT_COD_MINOR_COMP_UNCLASSIFIED   0x00000000
#define IOBT_COD_MINOR_COMP_DESKTOP        0x00000004
#define IOBT_COD_MINOR_COMP_SERVER         0x00000008
#define IOBT_COD_MINOR_COMP_LAPTOP         0x0000000C
#define IOBT_COD_MINOR_COMP_HANDHELD       0x00000010
#define IOBT_COD_MINOR_COMP_PALM           0x00000014
#define IOBT_COD_MINOR_COMP_WEARABLE       0x00000018
/**@}*/

/** @name Minor Device Class
 *  Phone Major class
 * @{*/
#define IOBT_COD_MINOR_PHONE_UNCLASSIFIED  0x00000000
#define IOBT_COD_MINOR_PHONE_CELLULAR      0x00000004
#define IOBT_COD_MINOR_PHONE_CORDLESS      0x00000008
#define IOBT_COD_MINOR_PHONE_SMART         0x0000000C
#define IOBT_COD_MINOR_PHONE_MODEM         0x00000010
#define IOBT_COD_MINOR_PHONE_ISDN          0x00000014
/**@}*/

/** @name Minor Device Class
 *  LAN Access Point Major class
 * @{*/
#define IOBT_COD_MINOR_LAN_0               0x00000000     /**< fully available */
#define IOBT_COD_MINOR_LAN_17              0x00000020     /**< 1-17% utilized */
#define IOBT_COD_MINOR_LAN_33              0x00000040     /**< 17-33% utilized */
#define IOBT_COD_MINOR_LAN_50              0x00000060     /**< 33-50% utilized */
#define IOBT_COD_MINOR_LAN_67              0x00000080     /**< 50-67% utilized */
#define IOBT_COD_MINOR_LAN_83              0x000000A0     /**< 67-83% utilized */
#define IOBT_COD_MINOR_LAN_99              0x000000C0     /**< 83-99% utilized */
#define IOBT_COD_MINOR_LAN_NO_SERVICE      0x000000E0     /**< 100% utilized */
/**@}*/

/** @name Minor Device Class
 *  Audio Major class
 * @{*/
#define IOBT_COD_MINOR_AUDIO_UNCLASSIFIED  0x00000000
#define IOBT_COD_MINOR_AUDIO_HEADSET       0x00000004
#define IOBT_COD_MINOR_AUDIO_HANDSFREE     0x00000008
#define IOBT_COD_MINOR_AUDIO_MICROPHONE    0x00000010
#define IOBT_COD_MINOR_AUDIO_LOUDSPEAKER   0x00000014
#define IOBT_COD_MINOR_AUDIO_HEADPHONES    0x00000018
#define IOBT_COD_MINOR_AUDIO_PORTABLEAUDIO 0x0000001C
#define IOBT_COD_MINOR_AUDIO_CARAUDIO      0x00000020
#define IOBT_COD_MINOR_AUDIO_SETTOPBOX     0x00000024
#define IOBT_COD_MINOR_AUDIO_HIFIAUDIO     0x00000028
#define IOBT_COD_MINOR_AUDIO_VCR           0x0000002C
#define IOBT_COD_MINOR_AUDIO_VIDEOCAMERA   0x00000030
#define IOBT_COD_MINOR_AUDIO_CAMCORDER     0x00000034
#define IOBT_COD_MINOR_AUDIO_VIDEOMONITOR  0x00000038
#define IOBT_COD_MINOR_AUDIO_VIDEOSPEAKER  0x0000003C
#define IOBT_COD_MINOR_AUDIO_CONFERENCING  0x00000040
#define IOBT_COD_MINOR_AUDIO_GAMING        0x00000048
/**@}*/

/** @name Minor Device Class
 *  Peripheral Major class
 * @{*/
#define IOBT_COD_MINOR_PERIPH_KEYBOARD     0x00000040
#define IOBT_COD_MINOR_PERIPH_POINTING     0x00000080
#define IOBT_COD_MINOR_PERIPH_COMBOKEY     0x000000C0
/**@}*/

/** @name Minor Device Class
 *  ORed with Peripheral Minor Device class
 * @{*/
#define IOBT_COD_MINOR_PERIPH_UNCLASSIFIED 0x00000000
#define IOBT_COD_MINOR_PERIPH_JOYSTICK     0x00000004
#define IOBT_COD_MINOR_PERIPH_GAMEPAD      0x00000008
#define IOBT_COD_MINOR_PERIPH_REMOTECTRL   0x0000000C
#define IOBT_COD_MINOR_PERIPH_SENSING      0x00000010
#define IOBT_COD_MINOR_PERIPH_DIGITIZER    0x00000014
#define IOBT_COD_MINOR_PERIPH_CARD_RDR     0x00000018
/**@}*/

/** @name Minor Device Class
 *  Imaging Major class
 * @{*/
#define IOBT_COD_MINOR_IMAGE_UNCLASSIFIED  0x00000000
#define IOBT_COD_MINOR_IMAGE_DISPLAY       0x00000010
#define IOBT_COD_MINOR_IMAGE_CAMERA        0x00000020
#define IOBT_COD_MINOR_IMAGE_SCANNER       0x00000040
#define IOBT_COD_MINOR_IMAGE_PRINTER       0x00000080
/**@}*/

/** @name
 *  Masks used to isolate the class of device components
 * @{*/
#define IOBT_COD_SERVICE_MASK              0x00ffC000     /**< Less LIAC bit */
#define IOBT_COD_MAJOR_MASK                0x00001F00
#define IOBT_COD_MINOR_MASK                0x000000FC
#define IOBT_COD_LIMITED_DISC_MASK         0x00002000     /**< LIAC bit */
/**@}*/

/** Bluetooth Service */
typedef struct _iobt_service_t {
	_Uint16t service_type;
	_Uint8t service_uuid[IOBT_SERVICE_UUID_SIZE];
} iobt_service_t;

/** @name Major Service Classes
 *  These are the results provided when a service discovery procedure is executed
 * @{*/
#define IOBT_SERVICE_UNDEFINED                    0x0000 /**< Service Undefined. */
#define IOBT_SERVICE_DISCOVERY_SERVER             0x1000 /**< Service Discovery Server service. */
#define IOBT_BROWSE_GROUP_DESC                    0x1001 /**< Browse Group Descriptor service. */
#define IOBT_PUBLIC_BROWSE_GROUP                  0x1002 /**< Public Browse Group service. */
#define IOBT_SERIAL_PORT                          0x1101 /**< Serial Port service and profile. */
#define IOBT_LAN_ACCESS_PPP                       0x1102 /**< LAN Access over PPP service. */
#define IOBT_DIALUP_NETWORKING                    0x1103 /**< Dial-up networking service and profile. */
#define IOBT_IRMC_SYNC                            0x1104 /**< IrMC Sync service and Synchronization profile. */
#define IOBT_OBEX_OBJECT_PUSH                     0x1105 /**< OBEX Object Push service and Object Push profile. */
#define IOBT_OBEX_FILE_TRANSFER                   0x1106 /**< OBEX File Transfer service and File Transfer profile. */
#define IOBT_IRMC_SYNC_COMMAND                    0x1107 /**< IrMC Sync service and Synchronization profile (Sync Command Scenario).*/
#define IOBT_HEADSET                              0x1108 /**< Headset service and profile. */
#define IOBT_CORDLESS_TELEPHONY                   0x1109 /**< Cordless telephony service and profile. */
#define IOBT_AUDIO_SOURCE                         0x110A /**< Audio Source */
#define IOBT_AUDIO_SINK                           0x110B /**< Audio Sink */
#define IOBT_AV_REMOTE_CONTROL_TARGET             0x110C /**< Audio/Video Remote Control Target */
#define IOBT_AUDIO_DISTRIBUTION                   0x110D /**< Advanced Audio Distribution Profile */
#define IOBT_AV_REMOTE_CONTROL                    0x110E /**< Audio/Video Remote Control */
#define IOBT_VIDEO_CONFERENCING                   0x110F /**< Video Conferencing Profile */
#define IOBT_INTERCOM                             0x1110 /**< Intercom service and profile. */
#define IOBT_FAX                                  0x1111 /**< Fax service and profile. */
#define IOBT_HEADSET_AUDIO_GATEWAY                0x1112 /**< Headset Audio Gateway */
#define IOBT_WAP                                  0x1113 /**< WAP service */
#define IOBT_WAP_CLIENT                           0x1114 /**< WAP client service */
#define IOBT_PANU                                 0x1115 /**< Personal Area Networking Profile */
#define IOBT_NAP                                  0x1116 /**< Personal Area Networking Profile */
#define IOBT_GN                                   0x1117 /**< Personal Area Networking Profile */
#define IOBT_DIRECT_PRINTING                      0x1118 /**< Basic Printing Profile */
#define IOBT_REFERENCE_PRINTING                   0x1119 /**< Basic Printing Profile */
#define IOBT_IMAGING                              0x111A /**< Imaging Profile */
#define IOBT_IMAGING_RESPONDER                    0x111B /**< Imaging Profile */
#define IOBT_IMAGING_AUTOMATIC_ARCHIVE            0x111C /**< Imaging Profile */
#define IOBT_IMAGING_REFERENCED_OBJECTS           0x111D /**< Imaging Profile */
#define IOBT_HANDSFREE                            0x111E /**< Handsfree Profile */
#define IOBT_HANDSFREE_AUDIO_GATEWAY              0x111F /**< Handsfree Audio Gateway */
#define IOBT_DIRECT_PRINTING_REF_OBJECTS          0x1120 /**< Basic Printing Profile */
#define IOBT_REFLECTED_UI                         0x1121 /**< Basic Printing Profile */
#define IOBT_BASIC_PRINTING                       0x1122 /**< Basic Printing Profile */
#define IOBT_PRINTING_STATUS                      0x1123 /**< Basic Printing Profile */
#define IOBT_HUMAN_INTERFACE_DEVICE               0x1124 /**< Human Interface Device Profile */
#define IOBT_HCR                                  0x1125 /**< Hardcopy Cable Replacement Profile */
#define IOBT_HCR_PRINT                            0x1126 /**< Hardcopy Cable Replacement Profile */
#define IOBT_HCR_SCAN                             0x1127 /**< Hardcopy Cable Replacement Profile */
#define IOBT_ISDN                                 0x1128 /**< Common ISDN Access / CAPI Message Transport Protocol */
#define IOBT_VIDEO_CONFERENCING_GW                0x1129 /**< Video Conferencing Gateway */
#define IOBT_UDI_MT                               0x112A /**< Unrestricted Digital Information Mobile Termination */
#define IOBT_UDI_TA                               0x112B /**< Unrestricted Digital Information Terminal Adapter */
#define IOBT_AUDIO_VIDEO                          0x112C /**< Audio Video service */
#define IOBT_SIM_ACCESS                           0x112D /**< SIM Access Profile */
#define IOBT_PBAP_CLIENT                          0x112E /**< Phonebook Access Client */
#define IOBT_PBAP_SERVER                          0x112F /**< Phonebook Access Server */
#define IOBT_PBAP_PROFILE                         0x1130 /**< Phonebook Access Profile Id */
#define IOBT_MAP_SERVER                           0x1132 /**< Message Access Server */
#define IOBT_MAP_NOTIFY_SERVER                    0x1133 /**< Message Access Notification Server */
#define IOBT_MAP_PROFILE                          0x1134 /**< Message Access Profile */
#define IOBT_PNP_INFO                             0x1200 /**< Plug-n-Play service */
#define IOBT_GENERIC_NETWORKING                   0x1201 /**< Generic Networking service. */
#define IOBT_GENERIC_FILE_TRANSFER                0x1202 /**< Generic File Transfer service. */
#define IOBT_GENERIC_AUDIO                        0x1203 /**< Generic Audio service. */
#define IOBT_GENERIC_TELEPHONY                    0x1204 /**< Generic Telephony service. */
#define IOBT_UPNP_SERVICE                         0x1205 /**< UPnP L2CAP based profile. */
#define IOBT_UPNP_IP_SERVICE                      0x1206 /**< UPnP IP based profile. */
#define IOBT_ESDP_UPNP_IP_PAN                     0x1300 /**< UPnP IP based solution using PAN */
#define IOBT_ESDP_UPNP_IP_LAP                     0x1301 /**< UPnP IP based solution using LAP */
#define IOBT_ESDP_UPNP_L2CAP                      0x1302 /**< UPnP L2CAP based solution */
#define IOBT_VIDEO_SOURCE                         0x1303 /**< Video Source */
#define IOBT_VIDEO_SINK                           0x1304 /**< Video Sink */
#define IOBT_VIDEO_DISTRIBUTION                   0x1305 /**< Video Sink */
/**@}*/

/** Bluetooth Error Code */
typedef _Uint16t iobt_error_t;

/** @name These errors are provided on ACL connect
 * 			and disconnect events.
 * @{*/
#define IOBT_ERROR_NO_ERROR             0x00 /**< No error */
#define IOBT_ERROR_UNKNOWN_HCI_CMD      0x01 /**< Unknown HCI Command */
#define IOBT_ERROR_NO_CONNECTION        0x02 /**< No connection */
#define IOBT_ERROR_HARDWARE_FAILURE     0x03 /**< Hardware Failure */
#define IOBT_ERROR_PAGE_TIMEOUT         0x04 /**< Page timeout */
#define IOBT_ERROR_AUTHENTICATE_FAILURE 0x05 /**< Authentication failure */
#define IOBT_ERROR_MISSING_KEY          0x06 /**< Missing key */
#define IOBT_ERROR_MEMORY_FULL          0x07 /**< Memory full */
#define IOBT_ERROR_CONNECTION_TIMEOUT   0x08 /**< Connection timeout */
#define IOBT_ERROR_MAX_CONNECTIONS      0x09 /**< Max number of connections */
#define IOBT_ERROR_MAX_SCO_CONNECTIONS  0x0a /**< Max number of SCO connections to a device */
#define IOBT_ERROR_ACL_ALREADY_EXISTS   0x0b /**< The ACL connection already exists. */
#define IOBT_ERROR_COMMAND_DISALLOWED   0x0c /**< Command disallowed */
#define IOBT_ERROR_LIMITED_RESOURCE     0x0d /**< Host rejected due to limited resources */
#define IOBT_ERROR_SECURITY_ERROR       0x0e /**< Host rejected due to security reasons */
#define IOBT_ERROR_PERSONAL_DEVICE      0x0f /**< Host rejected (remote is personal device) */
#define IOBT_ERROR_HOST_TIMEOUT         0x10 /**< Host timeout */
#define IOBT_ERROR_UNSUPPORTED_FEATURE  0x11 /**< Unsupported feature or parameter value */
#define IOBT_ERROR_INVALID_HCI_PARM     0x12 /**< Invalid HCI command parameters */
#define IOBT_ERROR_USER_TERMINATED      0x13 /**< Other end terminated (user) */
#define IOBT_ERROR_LOW_RESOURCES        0x14 /**< Other end terminated (low resources) */
#define IOBT_ERROR_POWER_OFF            0x15 /**< Other end terminated (about to power off) */
#define IOBT_ERROR_LOCAL_TERMINATED     0x16 /**< Terminated by local host */
#define IOBT_ERROR_REPEATED_ATTEMPTS    0x17 /**< Repeated attempts */
#define IOBT_ERROR_PAIRING_NOT_ALLOWED  0x18 /**< Pairing not allowed */
#define IOBT_ERROR_UNKNOWN_LMP_PDU      0x19 /**< Unknown LMP PDU */
#define IOBT_ERROR_UNSUPPORTED_REMOTE   0x1a /**< Unsupported Remote Feature */
#define IOBT_ERROR_SCO_OFFSET_REJECT    0x1b /**< SCO Offset Rejected */
#define IOBT_ERROR_SCO_INTERVAL_REJECT  0x1c /**< SCO Interval Rejected */
#define IOBT_ERROR_SCO_AIR_MODE_REJECT  0x1d /**< SCO Air Mode Rejected */
#define IOBT_ERROR_INVALID_LMP_PARM     0x1e /**< Invalid LMP Parameters */
#define IOBT_ERROR_UNSPECIFIED_ERR      0x1f /**< Unspecified Error */
#define IOBT_ERROR_UNSUPPORTED_LMP_PARM 0x20 /**< Unsupported LMP Parameter Value */
#define IOBT_ERROR_ROLE_CHG_NOT_ALLOWED 0x21 /**< Role Change Not Allowed */
#define IOBT_ERROR_LMP_RESPONSE_TIMEOUT 0x22 /**< LMP Response Timeout */
#define IOBT_ERROR_LMP_TRANS_COLLISION  0x23 /**< LMP Error Transaction Collision */
#define IOBT_ERROR_LMP_PDU_NOT_ALLOWED  0x24 /**< LMP PDU Not Allowed */
#define IOBT_ERROR_ENCRYP_MODE_NOT_ACC  0x25 /**< Encryption Mode Not Acceptable */
#define IOBT_ERROR_UNIT_KEY_USED        0x26 /**< Unit Key Used */
#define IOBT_ERROR_QOS_NOT_SUPPORTED    0x27 /**< QoS is Not Supported */
#define IOBT_ERROR_INSTANT_PASSED       0x28 /**< Instant Passed */
#define IOBT_ERROR_PAIR_UNITKEY_NO_SUPP 0x29 /**< Pairing with Unit Key Not Supported */
#define IOBT_ERROR_NOT_FOUND            0xf1 /**< Item not found */
#define IOBT_ERROR_REQUEST_CANCELLED    0xf2 /**< Pending request cancelled */
/**@}*/

/** Bluetooth Manager Events  */
typedef _Uint16t btmgr_event_type_t;

/** @name Bluetooth Manager Events
 *
 * @{*/
#define BTMGR_EVENT_RADIO_INIT                     0x0000
#define BTMGR_EVENT_RADIO_SHUTDOWN                 0x0001
#define BTMGR_EVENT_DEVICE_SEARCH_COMPLETE         0x0002
#define BTMGR_EVENT_DEVICE_LIST_CHANGED            0x0003
#define BTMGR_EVENT_ACL_REQUEST                    0x0004
#define BTMGR_EVENT_ACL_CONNECTED                  0x0005
#define BTMGR_EVENT_ACL_DISCONNECTED               0x0006
#define BTMGR_EVENT_SCO_CONNECTED                  0x0007
#define BTMGR_EVENT_SCO_DISCONNECTED               0x0008
#define BTMGR_EVENT_PASSKEY_REQUIRED               0x0009
#define BTMGR_EVENT_PAIRING_COMPLETE               0x000A
#define BTMGR_EVENT_CURRENT_ACCESS_MODE_CHANGED    0x000C
#define BTMGR_EVENT_SECURITY_MODE_CHANGED          0x000D
#define BTMGR_EVENT_CONNECTION_ROLE_CHANGED        0x000E
#define BTMGR_EVENT_SERVICE_CONNECTED              0x000F
#define BTMGR_EVENT_SERVICE_DISCONNECTED           0x0010
#define BTMGR_EVENT_SERVICE_QUERY_COMPLETE         0x0011
#define BTMGR_EVENT_SERVICE_QUERY_FAILED           0x0012
#define BTMGR_EVENT_AUTHORIZE_REQUIRED 	           0x0013
#define BTMGR_EVENT_CONFIRM_NUMERIC_REQ 	       0x0014
#define BTMGR_EVENT_DISPLAY_NUMERIC_IND			   0x0015
#define BTMGR_EVENT_DEVICE_ADDED	               0x0016
#define BTMGR_EVENT_DEVICE_DELETED	               0x0017
#define BTMGR_EVENT_STACK_FAULT                    0x0018
#define BTMGR_EVENT_SERVICE_CONNECT_IND            0x0019
#define BTMGR_EVENT_DEVICE_DELETED_FAILED          0x001A
#define BTMGR_EVENT_INIT_PAIRING_SUCCESS           0x001B
#define BTMGR_EVENT_INIT_PAIRING_FAILED            0x001C
#define BTMGR_EVENT_PAIRING_FAILED                 0x001D
#define BTMGR_EVENT_PAIRING_CANCELED               0x001E
#define BTMGR_EVENT_LEGACY_PIN_REQUIRED            0x001F
#define BTMGR_EVENT_DISCONNECT_ALL_SUCCESS		   0x0020
#define BTMGR_EVENT_DISCONNECT_ALL_FAILURE		   0x0021
#define BTMGR_EVENT_CONNECT_ALL_SUCCESS			   0x0022
#define BTMGR_EVENT_CONNECT_ALL_FAILURE			   0x0023
#define BTMGR_EVENT_COMMAND_FAILED				   0x0024
#define BTMGR_EVENT_COMMAND_STATUS				   0x0025
/**@}*/

/** The pair type  */
typedef enum iobt_pair_type {
	IOBT_PAIR_NOT_SAVED, IOBT_PAIR_SAVE_NOT_TRUSTED, IOBT_PAIR_SAVE_TRUSTED,
} iobt_pair_type_t;

/** The type of inquiry to perform  */
typedef enum iobt_search_mode {
	IOBT_SEARCH_MODE_NORMAL, IOBT_SEARCH_MODE_RSSI, IOBT_SEARCH_MODE_EXTENDED,
} iobt_search_mode_t;

/** The accessibility mode of the local device */
typedef enum iobt_accessibility_mode {
	IOBT_NOT_ACCESSIBLE, /**< Non-discoverable or connectable. */
	IOBT_GENERAL_ACCESSIBLE, /**< General discoverable and connectable. */
	IOBT_LIMITED_ACCESSIBLE, /**< Limited discoverable and connectable. */
	IOBT_CONNECTABLE_ONLY, /**< Connectable but not discoverable. */
	IOBT_DISCOVERABLE_ONLY, /**< Discoverable but not connectable. */
} iobt_accessibility_mode_t;

/** The security mode of the local device */
typedef enum iobt_security_mode {
	IOBT_SECURITY_MODE_1, IOBT_SECURITY_MODE_2, IOBT_SECURITY_MODE_3, IOBT_SECURITY_MODE_4,
} iobt_security_mode_t;

/** The connection role of the local device */
typedef enum iobt_connection_role {
	IOBT_ROLE_MASTER, IOBT_ROLE_SLAVE, IOBT_ROLE_UNKNOWN, IOBT_ROLE_ANY,
} iobt_connection_role_t;

/** A service list obtained from a remote device. This is provided on a
 * BTMGR_EVENT_SERVICE_QUERY_COMPLETE event.
 */
typedef struct iobt_service_list {
	iobt_addr_t addr; /**< The Bluetooth address. */
	uint16_t length; /**< The number of services in the list */
	/* FIXME: 
	 TODO: 
	 We need to remove this and implement the logic
	 in the avrcp profile code not here... 
	 */
	uint16_t avrcp_controller_role;
	uint16_t avrcp_target_role;
/**iobt_service_t services[length]; */
} iobt_service_list_t;

/** A service on a remote device. This is provided on a
 * BTMGR_EVENT_SERVICE_CONNECTED  or BTMGR_EVENT_SERVICE_DISCONNECTED
 * event.
 */
typedef struct iobt_service_connection {
	iobt_addr_t addr; /**< The Bluetooth address. */
	iobt_service_t service; /**< The service being connected or disconnected */
} iobt_service_connection_t;

/** An acl connection event from a remote device. This data is received
 * on BTMGR_EVENT_ACL_CONNECTED, BTMGR_EVENT_ACL_DISCONNECTED, or
 * BTMGR_EVENT_CONNECTION_FAILED events.
 */
typedef struct iobt_acl_connection {
	iobt_addr_t addr; /**< The device being connected or disconnected */
	iobt_error_t error; /**< An error if relevant */
} iobt_acl_connection_t;

/** Information obtained from remote devices
 *  Each info struct consists of a iobt_device_info_t possibly followed by
 *  additional data containing the device name, and then possibly a few bytes
 *  of padding to ensure alignment.  If more than one info stuct is returned,
 *  use the iobt_device_info_next() macro to find the next header
 *  based on the previous header's address and
 *  contents. */
typedef struct iobt_device_info {
	uint16_t namelen; /**< The length of the name of the device. */
	iobt_addr_t addr; /**< The Bluetooth address. */
	iobt_class_t cod; /**< The class of device. */
	iobt_device_status_t state; /**< The status of the remote device */
	uint8_t connected; /**< Is the remote device currently connected. */
	uint8_t rssi; /**< The rssi signal. */
	uint8_t psresp; /**< The Page Scan response mode. */
/**_Uint8t name[1]; */
} iobt_device_info_t;

/**
 * Get the Bluetooth Stack State
 * @param btd The file descriptor of the manager.
 * @param state The current state of the stack
 * @return 0 on success, -1 on error with errno set
 */
int iobt_get_stack_state(int btd, iobt_stack_state_t* state);

/**
 * Initialize the Bluetooth radio hardware.
 *
 * @param btd The file descriptor of the manager.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_radio_init(int btd, char * name, size_t length);

/**
 * Shutdown the Bluetooth radio hardware.
 * @param btd The file descriptor of the manager.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_radio_shutdown(int btd);

/**
 * Start the Bluetooth inquiry procedure
 *
 * @param btd The file descriptor of the manager.
 * @param mode Sets the mode for the procedure.
 * @param devices Set the the maximum number of devices for the procedure to discover.
 * @param timeout Maximum amount of time before the Inquiry is halted.
 *                Range is 0x01 to 0x30. Time is timeout * 1.28 seconds
 * @return 0 on success, -1 on error with errno set
 */
int iobt_device_search(int btd, iobt_search_mode_t mode, int devices, int timeout);

/**
 * Cancel the Bluetooth inquiry procedure.
 *
 * @param btd The file descriptor of the manager.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_cancel_device_search(int btd);

/**
 * Get the device list from the previous inquiry
 *
 * @param btd The file descriptor of the manager.
 * @param addr The list of iobt_addr's to fill
 * @param len The length of info
 * @return The actual size of the list
 */
ssize_t iobt_get_device_list(int btd, iobt_addr_t* addr, size_t len);

/**
 * Remove a device from the list. This also remove a device from the dbb file
 *
 * @param btd The file descriptor of the manager.
 * @param addr The Address of the device to be removed
 * @return 0 on success, -1 on error with errno set
 */
int iobt_remove_device(int btd, const iobt_addr_t *addr);

/**
 * Get the information from a device at a specified index
 *
 * @param btd The file descriptor of the manager.
 * @param addr The Address of the device
 * @param info the info to be retrieved
 * @param len the size of the info struct plus any bytes allocated for the device name
 * @return 0 on success, -1 on error with errno set
 */
int iobt_get_device_info(int btd, const iobt_addr_t *addr, iobt_device_info_t* info, size_t len);

/**
 * Set the local name of the device
 *
 * @param btd The file descriptor of the manager.
 * @param data The data to send as the value.
 * @param len The number of bytes to send
 * @return 0 on success, -1 on error with errno set
 */
int iobt_set_local_name(int btd, const char* data, size_t len);

/**
 * Get the local name of the device
 *
 * @param btd The file descriptor of the manager.
 * @param data The data to recieve as the value.
 * @param len The size of data
 * @return The acutual length of the name
 */
ssize_t iobt_get_local_name(int btd, char* data, size_t len);

/**
 * Get the Bluetooth address of the local device
 *
 * @param btd The file descriptor of the manager.
 * @param addr The address of the local device.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_get_bt_addr(int btd, iobt_addr_t* addr);

/**
 * Set the device class of the local device
 *
 * @param btd The file descriptor of the manager.
 * @param class The Class of the device.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_set_device_class(int btd, iobt_class_t Class);

/**
 * Get the service list from a remote device
 *
 * @param btd The file descriptor of the manager.
 * @param addr The address of the device
 * @return 0 on success, -1 on error with errno set
 */
ssize_t iobt_get_service_list(int btd, const iobt_addr_t* addr);

/**
 * Set the passkey during the pairing procedure
 *
 * @param btd The file descriptor of the manager.
 * @param addr The address of the remote device.
 * @param passkey The passkey of the device.
 * @param len The length of the key ( should not exceed six digits ).
 * @param type The pairing type.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_set_passkey(int btd, const iobt_addr_t * addr, const uint8_t * passkey, int len, iobt_pair_type_t type);

/**
 * Set the legacy passkey during the pairing procedure
 *
 * @param btd The file descriptor of the manager.
 * @param addr The address of the remote device.
 * @param passkey The legacy passkey of the device.
 * @param len The length of the key ( should not exceed six digits ).
 * @param type The pairing type.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_set_legacy_pin(int btd, const iobt_addr_t * addr, const uint8_t * passkey, int len, iobt_pair_type_t type);

/**
 * Provide a user confirmation for the pairing process.
 * This occurs after the BTMGR_EVENT_CONFIRM_NUMERIC_REQ event.
 *
 * @param btd The file descriptor of the manager.
 * @param addr The address of the remote device.
 * @param confirm 0 to deny confirmation, 1 to confirm.
 * @param type The pairing type.
 * @return 0 on success, -1 on error with errno set
 */
int iobt_user_confirm(int btd, const iobt_addr_t * addr, uint8_t confirm, iobt_pair_type_t type);

/**
 * Respond to an authorization request during the pairing procedure
 *
 * @param btd The file descriptor of the manager.
 * @param addr The address of the remote device.
 * @param auth 0 to deny authorization, 1 to authorize
 * @param future 0 to deny future authorization, 1 to authorize for future use
 * @return 0 on success, -1 on error with errno set
 */
int iobt_authorize(int btd, const iobt_addr_t * addr, uint8_t auth, uint8_t future);

/**
 * Set the accessibility of the local device
 *
 * @param btd The file descriptor of the manager.
 * @param mode the accessibility of the device
 * @param connected 0 for when not connected, 1 for when connected
 * @return 0 on success, -1 on error with errno set
 */
int iobt_set_accessibility(int btd, iobt_accessibility_mode_t mode, uint8_t connected);

/**
 * Get the accessibility of the local device
 *
 * @param btd The file descriptor of the manager.
 * @param mode the accessibility of the device
 * @param connected 0 for when not connected, 1 for when connected
 * @return 0 on success, -1 on error with errno set
 */
int iobt_get_accessibility(int btd, iobt_accessibility_mode_t* mode, uint8_t connected);

/**
 * Set the security mode of the device
 *
 * @param btd The file descriptor of the manager.
 * @param mode the security mode of the device
 * @return 0 on success, -1 on error with errno set
 */
int iobt_set_security_mode(int btd, iobt_security_mode_t mode);

/**
 * Set the connection role  of the device
 *
 * @param btd The file descriptor of the manager.
 * @param role The connection role of the device
 * @return 0 on success, -1 on error with errno set
 */
int iobt_set_connection_role(int btd, iobt_connection_role_t role);

/**
 * Create a service connection with a remote device
 *
 * @param btd The file descriptor of the manager
 * @param addr The address of the remote device with which to create the connection
 * @param service The local service to instantiate
 * @return 0 on success, -1 on error with errno set
 */
int iobt_create_service_connection(int btd, iobt_addr_t const * addr, iobt_service_t service);

/**
 * Initiate simple pairing with a remote device without opening a service connection
 *
 * @param btd The file descriptor of the manager
 * @param addr The address of the remote device with which to create the connection
 * @return 0 on success, -1 on error with errno set
 */
int iobt_initiate_pairing(int btd, iobt_addr_t *addr);

/**
 * Terminate the current connection immediately. There is no guarantee that
 * an attempt by the remote device to re-connect will not occur. If the target
 * remote device is currently in the middle of a pairing attempt initiated locally
 * (which is the primary use for this function), the pairing procedure will be terminated
 * prematurely. This is used instead of requiring a timeout to occur when the user
 * leaves the pairing menus.
 *
 * @param btd 	The file descriptor of the manager
 * @param addr	The address of the remote device to disconnect
 * @return 0 on success, -1 on error with errno set
 */
int iobt_cancel_pairing(int btd, iobt_addr_t *addr);
/**
 * Create a service connection with a remote device
 *
 * @param btd The file descriptor of the manager
 * @param addr The address of the remote device to from which to disconnect the service
 * @param service The local service to disconnect
 * @return 0 on success, -1 on error with errno set
 */
int iobt_disconnect_service_connection(int btd, iobt_addr_t const * addr, iobt_service_t service);

/*@}*/

__END_DECLS

#endif


#if defined(__QNXNTO__) && defined(__USESRCVERSION)
#include <sys/srcversion.h>
__SRCVERSION("$URL: http://svn/product/branches/6.6.0/trunk/lib/bluetooth/public/bluetooth/btmgr.h $ $Rev: 725212 $")
#endif
