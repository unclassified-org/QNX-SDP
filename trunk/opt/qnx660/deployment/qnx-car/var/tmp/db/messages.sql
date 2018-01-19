/* Turn foreign key constraints on */
PRAGMA foreign_keys = ON;

/* Message types */
CREATE TABLE message_types (
	message_type_id		INTEGER PRIMARY KEY AUTOINCREMENT,
	type				TEXT NOT NULL UNIQUE
);

/* Accounts/Instances */
CREATE TABLE accounts (
	account_id	INTEGER PRIMARY KEY,
	name		TEXT,
	active		BOOLEAN NOT NULL
);

/* Accounts/Instances */
CREATE TABLE accounts_message_types_rel (
	account_id			INTEGER NOT NULL REFERENCES accounts ON DELETE CASCADE,
	message_type_id		INTEGER NOT NULL REFERENCES message_types,
	PRIMARY KEY (account_id, message_type_id)
);

/* Folders */
CREATE TABLE folders (
	folder_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	parent_id	INTEGER REFERENCES folders ON DELETE CASCADE,
	account_id	INTEGER NOT NULL REFERENCES accounts ON DELETE CASCADE,
	name		TEXT NOT NULL,
	path		TEXT NOT NULL,
	CHECK (parent_id <> folder_id)
);

/* Messages (all types: email, sms, mms) */
CREATE TABLE messages (
	message_id			INTEGER PRIMARY KEY AUTOINCREMENT,
	message_type_id		INTEGER NOT NULL REFERENCES message_types,
	folder_id			INTEGER NOT NULL REFERENCES folders ON DELETE CASCADE,
	handle				TEXT NOT NULL,
	subject				TEXT NOT NULL,
	datetime			TEXT NOT NULL,
	sender_contact_id	INTEGER REFERENCES contacts(contact_id),
	reply_to_contact_id	INTEGER REFERENCES contacts(contact_id),
	read				INTEGER NOT NULL DEFAULT 0,
	sent				INTEGER NOT NULL DEFAULT 0,
	protected			INTEGER NOT NULL DEFAULT 0,
	priority			INTEGER NOT NULL DEFAULT 0,
	CHECK 				(read = 0 OR read = 1),
	CHECK 				(sent = 0 OR sent = 1),
	CHECK 				(protected = 0 OR protected = 1),
	CHECK 				(priority = 0 OR priority = 1)
);

/* Contacts (senders/recipients) */
CREATE TABLE contacts (
	contact_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	email		TEXT,
	number		TEXT,
	family_name TEXT,
	given_name	TEXT,
	CHECK(email IS NOT NULL OR number IS NOT NULL)
);

/* Message contents */
CREATE TABLE message_contents (
	message_content_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	message_id			INTEGER NOT NULL UNIQUE REFERENCES messages ON DELETE CASCADE,
	subject				TEXT ,
	body_html			TEXT ,
	body_plain_text		TEXT ,
	CHECK				(body_html IS NOT NULL OR body_plain_text IS NOT NULL)
);

/* Message recipient types */
CREATE TABLE message_recipient_types (
	message_recipient_type_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	type						TEXT NOT NULL UNIQUE
);

/* Message recipients */
CREATE TABLE message_recipients (
	message_recipient_id		INTEGER PRIMARY KEY AUTOINCREMENT,
	message_id					INTEGER NOT NULL REFERENCES messages ON DELETE CASCADE,
	contact_id					INTEGER NOT NULL REFERENCES contacts,
	message_recipient_type_id	INTEGER NOT NULL REFERENCES message_recipient_types
);

/* Attachments */
CREATE TABLE attachments (
	attachment_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	message_id		INTEGER NOT NULL REFERENCES messages ON DELETE CASCADE,
	filename		TEXT NOT NULL,
	size			INTEGER NOT NULL,
	embedded		BOOLEAN NOT NULL
);

/** 
	VIEWS
 */
 
 /* Ciew to retrieve a list of brief messages */
 CREATE VIEW "messages_view" AS  
 SELECT
	accounts.account_id,
	accounts.name as account_name,
	messages.message_id,
	messages.folder_id,
	folders.name as folder_name,
	folders.path as folder_path,
	message_types.type,
	messages.handle,
	messages.subject,
	messages.datetime,
	messages.sender_contact_id,
	contacts_sender.email as sender_email,
	contacts_sender.number as sender_number,
	contacts_sender.family_name as sender_last_name,
	contacts_sender.given_name as sender_first_name,
	messages.reply_to_contact_id,
	contacts_reply.email as reply_to_email,
	contacts_reply.number as reply_to_number,
	contacts_reply.family_name as reply_to_last_name,
	contacts_reply.given_name as reply_to_first_name,
	messages.read,
	messages.sent,
	messages.protected,
	messages.priority,
	recipients.email as recipient_email,
	recipients.number as recipient_number,
	recipients.family_name as recipient_last_name,
	recipients.given_name as recipient_first_name
FROM messages
LEFT JOIN contacts contacts_sender ON messages.sender_contact_id = contacts_sender.contact_id
LEFT JOIN contacts contacts_reply ON messages.reply_to_contact_id =  contacts_reply.contact_id
LEFT JOIN folders ON messages.folder_id =  folders.folder_id
LEFT JOIN accounts ON folders.account_id = accounts.account_id
LEFT JOIN message_types ON messages.message_type_id =  message_types.message_type_id
LEFT JOIN contacts recipients ON recipients.contact_id = (SELECT contact_id FROM message_recipients WHERE message_recipients.message_id = messages.message_id AND message_recipients.message_recipient_type_id = 1 ORDER BY message_recipients.message_recipient_id DESC LIMIT 1);

/* View to retrieve full messages */
CREATE VIEW "full_messages_view" AS    
SELECT
	accounts.account_id,
	accounts.name as account_name,
	messages.message_id,
	messages.folder_id,
	folders.name as folder_name,
	folders.path as folder_path,
	message_types.type,
	messages.handle,
	messages.datetime,
	messages.sender_contact_id,
	contacts_sender.email as sender_email,
	contacts_sender.number as sender_number,
	contacts_sender.family_name as sender_last_name,
	contacts_sender.given_name as sender_first_name,
	messages.reply_to_contact_id,
	contacts_reply.email as reply_to_email,
	contacts_reply.number as reply_to_number,
	contacts_reply.family_name as reply_to_last_name,
	contacts_reply.given_name as reply_to_first_name,
	messages.read,
	messages.sent,
	messages.protected,
	messages.priority,
	COALESCE(message_contents.subject, messages.subject) as subject,
	message_contents.body_plain_text,
	message_contents.body_html
FROM messages
LEFT JOIN message_contents ON messages.message_id = message_contents.message_id
LEFT JOIN contacts contacts_sender ON messages.sender_contact_id = contacts_sender.contact_id
LEFT JOIN contacts contacts_reply ON messages.reply_to_contact_id =  contacts_reply.contact_id
LEFT JOIN folders ON messages.folder_id =  folders.folder_id
LEFT JOIN accounts ON folders.account_id = accounts.account_id
LEFT JOIN message_types ON messages.message_type_id =  message_types.message_type_id
WHERE message_contents.message_content_id IS NOT NULL;

/* view to retrieve contacts */
CREATE VIEW "contacts_view" AS  
select contacts.contact_id, contacts.email, contacts.number, contacts.family_name, contacts.given_name, message_recipient_types.type,  message_recipients.message_id from message_recipients 
LEFT JOIN message_recipient_types ON message_recipients.message_recipient_type_id =  message_recipient_types. message_recipient_type_id
LEFT JOIN contacts ON message_recipients.contact_id =  contacts.contact_id;


/*
	TRIGGERS
*/

/* Constrain messages to be a message type that is of its parent account supported message types */
/*
CREATE TRIGGER insert_message_check_message_type BEFORE INSERT ON messages
FOR EACH ROW WHEN NOT EXISTS (SELECT *
		FROM accounts_message_types_rel
		LEFT JOIN folders ON accounts_message_types_rel.account_id = folders.account_id
		LEFT JOIN messages ON folders.folder_id = new.folder_id WHERE new.message_type_id = accounts_message_types_rel.message_type_id)
BEGIN
	SELECT RAISE(ABORT, 'Message type must be a supported message type of the message''s account');
END

CREATE TRIGGER insert_message_check_handle BEFORE INSERT ON messages
FOR EACH ROW WHEN (SELECT count(*) FROM messages JOIN folders ON messages.folder_id = folders.folder_id WHERE new.handle = messages.handle AND folders.account_id = 
(SELECT accounts.account_id FROM accounts JOIN folders ON accounts.account_id = folders.account_id WHERE folders.folder_id = new.folder_id)) > 0
BEGIN
	SELECT RAISE(ABORT, 'Handle must be unique per a message''s account');
END
*/