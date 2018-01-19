/**
 * The message service notification type constants.
 * Notification type constants must be consistent with those defined in the qnx.message client.js.
 *
 * @author lgreenway
 * $Id: servicenotification.js 4377 2012-09-28 22:34:57Z lgreenway@qnx.com $
 */
module.exports = {
	/** Notification type for new message */
	NOTIFICATION_NEW_MESSAGE:'NOTIFICATION_NEW_MESSAGE',
	/** Notification type for delivery of sent message successful */
	NOTIFICATION_DELIVERY_SUCCESS:'NOTIFICATION_DELIVERY_SUCCESS',
	/** Notification type for sending of message successful */
	NOTIFICATION_SENDING_SUCCESS:'NOTIFICATION_SENDING_SUCCESS',
	/** Notification type for delivery of sent message failed */
	NOTIFICATION_DELIVERY_FAILURE:'NOTIFICATION_DELIVERY_FAILURE',
	/** Notification type for sending of message failed */
	NOTIFICATION_SENDING_FAILURE:'NOTIFICATION_SENDING_FAILURE',
	/** Notification type when phone memory is full */
	NOTIFICATION_MEMORY_FULL:'NOTIFICATION_MEMORY_FULL',
	/** Notification type when phone memory is available */
	NOTIFICATION_MEMORY_AVAILABLE:'NOTIFICATION_MEMORY_AVAILABLE',
	/** Notification type when message is deleted*/
	NOTIFICATION_MESSAGE_DELETED:'NOTIFICATION_MESSAGE_DELETED',
	/** Notification type when message moved */
	NOTIFICATION_MESSAGE_SHIFT:'NOTIFICATION_MESSAGE_SHIFT',
};