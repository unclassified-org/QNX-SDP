/* Turn foreign key constraints on */
PRAGMA foreign_keys = ON;

/* Contacts */
CREATE TABLE contacts (
	contact_id			INTEGER PRIMARY KEY AUTOINCREMENT,
	version				TEXT NOT NULL,
	fn					TEXT NOT NULL,
	family_name			TEXT NOT NULL,
	given_name			TEXT NOT NULL,
	additional_names	TEXT,
	honorific_prefixes	TEXT,
	honorific_suffixes	TEXT,
	sort_string			TEXT,
	bday				TEXT,
	geo_lat				REAL,
	geo_long			REAL,
	mailer				TEXT,
	tz					TEXT,
	title				TEXT,
	role				TEXT,
	org					TEXT,
	note				TEXT,
	rev					TEXT,
	url					TEXT,
	uid					TEXT,
	prod_id				TEXT,
	class				TEXT
);

/* Emails */
CREATE TABLE emails (
	email_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	contact_id	INTEGER NOT NULL REFERENCES contacts ON DELETE CASCADE,
	email		TEXT NOT NULL
);

CREATE TABLE email_types (
	email_type_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	type			TEXT NOT NULL UNIQUE
);

CREATE TABLE emails_types_rel (
	email_id		INTEGER NOT NULL REFERENCES emails ON DELETE CASCADE,
	email_type_id	INTEGER NOT NULL REFERENCES email_types
);

/* Telephone numbers */
CREATE TABLE telephone_numbers (
	telephone_number_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	contact_id			INTEGER NOT NULL REFERENCES contacts ON DELETE CASCADE,
	number				TEXT NOT NULL
);

CREATE TABLE telephone_number_types (
	telephone_number_type_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	type						TEXT NOT NULL UNIQUE
);

CREATE TABLE telephone_numbers_types_rel (
	telephone_number_id			INTEGER NOT NULL REFERENCES telephone_numbers ON DELETE CASCADE,
	telephone_number_type_id	INTEGER NOT NULL REFERENCES telephone_number_types
);

/* Addresses */
CREATE TABLE addresses (
	address_id			INTEGER PRIMARY KEY AUTOINCREMENT,
	contact_id			INTEGER NOT NULL REFERENCES contacts ON DELETE CASCADE,
	post_office_box		TEXT,
	extended_address	TEXT,
	street_address		TEXT,
	locality			TEXT,
	region				TEXT,
	postal_code			TEXT,
	country_name		TEXT
);

CREATE TABLE address_types (
	address_type_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	type			TEXT NOT NULL UNIQUE
);

CREATE TABLE addresses_types_rel (
	address_id		INTEGER NOT NULL REFERENCES addresses ON DELETE CASCADE,
	address_type_id	INTEGER NOT NULL REFERENCES address_types
);

/* Nicknames */
CREATE TABLE nicknames (
	nickname_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	contact_id	INTEGER NOT NULL REFERENCES contacts ON DELETE CASCADE,
	nickname	TEXT NOT NULL
);

/* Categories */
CREATE TABLE categories (
	category_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	contact_id	INTEGER NOT NULL REFERENCES contacts ON DELETE CASCADE,
	category	TEXT NOT NULL
);

/* Photos */
CREATE TABLE photos (
	photo_id			INTEGER PRIMARY KEY AUTOINCREMENT,
	contact_id			INTEGER NOT NULL REFERENCES contacts ON DELETE CASCADE,
	photo_data			BLOB,
	photo_uri			TEXT,
	encoding_type		TEXT,
	image_media_type	TEXT
);

/* Call Log */
CREATE TABLE calls (
	call_id			INTEGER PRIMARY KEY AUTOINCREMENT,
	contact_id		INTEGER REFERENCES contacts ON DELETE SET NULL,
	call_type_id	INTEGER NOT NULL REFERENCES call_types,
	fn				TEXT,
	number			TEXT,
	time			TEXT NOT NULL,
	duration		INTEGER
);

CREATE TABLE call_types (
	call_type_id	INTEGER PRIMARY KEY AUTOINCREMENT,
	type			TEXT
);

-- ASR matched contacts
CREATE TABLE asr_matched_contacts (
	match_id			INTEGER PRIMARY KEY AUTOINCREMENT,
	contact_id			INTEGER NOT NULL REFERENCES contacts ON DELETE CASCADE,
	confidence_score	INTEGER NOT NULL
);

/********
  VIEWS
********/
CREATE VIEW emails_view AS
SELECT
	emails.email_id,
	emails.contact_id,
	emails.email,
	MAX(CASE WHEN email_types.type = 'PREF' THEN 1 ELSE 0 END) AS pref,
	MAX(CASE WHEN email_types.type = 'INTERNET' THEN 1 ELSE 0 END) AS internet
FROM emails
LEFT JOIN emails_types_rel ON emails.email_id = emails_types_rel.email_id
LEFT JOIN email_types ON emails_types_rel.email_type_id = email_types.email_type_id
GROUP BY emails.email_id
ORDER BY pref DESC, emails.email_id DESC;

CREATE VIEW telephone_numbers_view AS
SELECT
	telephone_numbers.telephone_number_id,
	telephone_numbers.contact_id,
	telephone_numbers.number,
	MAX(CASE WHEN telephone_number_types.type = 'PREF' THEN 1 ELSE 0 END) AS pref,
	MAX(CASE WHEN telephone_number_types.type = 'HOME' THEN 1 ELSE 0 END) AS home,
	MAX(CASE WHEN telephone_number_types.type = 'WORK' THEN 1 ELSE 0 END) AS work,
	MAX(CASE WHEN telephone_number_types.type = 'VOICE' THEN 1 ELSE 0 END) AS voice,
	MAX(CASE WHEN telephone_number_types.type = 'FAX' THEN 1 ELSE 0 END) AS fax,
	MAX(CASE WHEN telephone_number_types.type = 'MSG' THEN 1 ELSE 0 END) AS msg,
	MAX(CASE WHEN telephone_number_types.type = 'CELL' THEN 1 ELSE 0 END) AS cell,
	MAX(CASE WHEN telephone_number_types.type = 'PAGER' THEN 1 ELSE 0 END) AS pager,
	MAX(CASE WHEN telephone_number_types.type = 'BBS' THEN 1 ELSE 0 END) AS bbs,
	MAX(CASE WHEN telephone_number_types.type = 'MODEM' THEN 1 ELSE 0 END) AS modem,
	MAX(CASE WHEN telephone_number_types.type = 'CAR' THEN 1 ELSE 0 END) AS car,
	MAX(CASE WHEN telephone_number_types.type = 'ISDN' THEN 1 ELSE 0 END) AS isdn,
	MAX(CASE WHEN telephone_number_types.type = 'VIDEO' THEN 1 ELSE 0 END) AS video
FROM telephone_numbers
LEFT JOIN telephone_numbers_types_rel ON telephone_numbers.telephone_number_id = telephone_numbers_types_rel.telephone_number_id
LEFT JOIN telephone_number_types ON telephone_numbers_types_rel.telephone_number_type_id = telephone_number_types.telephone_number_type_id
GROUP BY telephone_numbers.telephone_number_id
ORDER BY pref DESC, telephone_numbers.telephone_number_id DESC;

CREATE VIEW addresses_view AS
SELECT
	addresses.address_id,
	addresses.contact_id,
	addresses.post_office_box,
	addresses.extended_address,
	addresses.street_address,
	addresses.locality,
	addresses.region,
	addresses.postal_code,
	addresses.country_name,
	MAX(CASE WHEN address_types.type = 'PREF' THEN 1 ELSE 0 END) AS pref,
	MAX(CASE WHEN address_types.type = 'HOME' THEN 1 ELSE 0 END) AS home,
	MAX(CASE WHEN address_types.type = 'WORK' THEN 1 ELSE 0 END) AS work,
	MAX(CASE WHEN address_types.type = 'DOM' THEN 1 ELSE 0 END) AS dom,
	MAX(CASE WHEN address_types.type = 'INTL' THEN 1 ELSE 0 END) AS intl,
	MAX(CASE WHEN address_types.type = 'POSTAL' THEN 1 ELSE 0 END) AS postal,
	MAX(CASE WHEN address_types.type = 'PARCEL' THEN 1 ELSE 0 END) AS parcel
FROM addresses
LEFT JOIN addresses_types_rel ON addresses.address_id = addresses_types_rel.address_id
LEFT JOIN address_types ON addresses_types_rel.address_type_id = address_types.address_type_id
GROUP BY addresses.address_id
ORDER BY pref DESC, addresses.address_id DESC;

CREATE VIEW contacts_view AS
SELECT
	contacts.contact_id,
	contacts.honorific_prefixes AS title,
	contacts.family_name AS last_name,
	contacts.given_name AS first_name,
	contacts.fn AS formatted_name,
	contacts.bday AS birthday,
	NULL AS anniversary,
	contacts.org AS company,
	contacts.title AS job_title,
	home_phone_1.number as home_phone,
	home_phone_2.number as home_phone_2,
	work_phone_1.number as work_phone,
	work_phone_2.number as work_phone_2,
	mobile_phone.number as mobile_phone,
	pager_phone.number as pager_phone,
	fax_phone.number as fax_phone,
	other_phone.number as other_phone,
	email_1.email AS email_1,
	email_2.email AS email_2,
	email_3.email AS email_3,
	home_address.street_address AS home_address_1,
	home_address.extended_address AS home_address_2,
	home_address.locality AS home_address_city,
	home_address.country_name AS home_address_country,
	home_address.region AS home_address_state_province,
	home_address.postal_code AS home_address_zip_postal,
	work_address.street_address AS work_address_1,
	work_address.extended_address AS work_address_2,
	work_address.locality AS work_address_city,
	work_address.country_name AS work_address_country,
	work_address.region AS work_address_state_province,
	work_address.postal_code AS work_address_zip_postal,
	photos.photo_uri AS picture,
	NULL AS pin,
	contacts.uid AS uid,
	contacts.url AS web_page,
	(SELECT GROUP_CONCAT(categories.category) FROM categories WHERE categories.contact_id = contacts.contact_id) AS categories,
	contacts.note AS note,
	NULL AS user1,
	NULL AS user2,
	NULL AS user3,
	NULL AS user4,
	asr_matched_contacts.confidence_score AS asr_match_score
from contacts
LEFT JOIN telephone_numbers_view home_phone_1 ON contacts.contact_id = home_phone_1.contact_id AND home_phone_1.home = 1
LEFT JOIN telephone_numbers_view home_phone_2 ON contacts.contact_id = home_phone_2.contact_id AND home_phone_2.home = 1
	AND home_phone_2.telephone_number_id <> home_phone_1.telephone_number_id
LEFT JOIN telephone_numbers_view work_phone_1 ON contacts.contact_id = work_phone_1.contact_id AND work_phone_1.work= 1
LEFT JOIN telephone_numbers_view work_phone_2 ON contacts.contact_id = work_phone_2.contact_id AND work_phone_2.work = 1
	AND work_phone_2.telephone_number_id <> work_phone_1.telephone_number_id
LEFT JOIN telephone_numbers_view mobile_phone ON contacts.contact_id = mobile_phone.contact_id AND mobile_phone.cell = 1
LEFT JOIN telephone_numbers_view pager_phone ON contacts.contact_id = pager_phone.contact_id AND pager_phone.pager = 1
LEFT JOIN telephone_numbers_view fax_phone ON contacts.contact_id = fax_phone.contact_id AND fax_phone.fax = 1
LEFT JOIN telephone_numbers_view other_phone ON contacts.contact_id = other_phone.contact_id
	AND other_phone.telephone_number_id NOT IN(COALESCE(home_phone_1.telephone_number_id, 0),
		COALESCE(home_phone_2.telephone_number_id, 0),
		COALESCE(work_phone_1.telephone_number_id, 0),
		COALESCE(work_phone_2.telephone_number_id, 0),
		COALESCE(mobile_phone.telephone_number_id, 0),
		COALESCE(pager_phone.telephone_number_id, 0),
		COALESCE(fax_phone.telephone_number_id, 0))
LEFT JOIN emails_view email_1 ON contacts.contact_id = email_1.contact_id
LEFT JOIN emails_view email_2 ON contacts.contact_id = email_2.contact_id
	AND email_2.email_id <> email_1.email_id
LEFT JOIN emails_view email_3 ON contacts.contact_id = email_3.contact_id
	AND email_3.email_id <> email_1.email_id AND email_3.email_id <> email_2.email_id
LEFT JOIN addresses_view home_address ON contacts.contact_id = home_address.contact_id AND home_address.home = 1
LEFT JOIN addresses_view work_address ON contacts.contact_id = work_address.contact_id AND work_address.work = 1
LEFT JOIN photos ON contacts.contact_id = photos.contact_id
LEFT JOIN asr_matched_contacts ON contacts.contact_id = asr_matched_contacts.contact_id
WHERE 0=0
AND (CASE WHEN home_phone_2.telephone_number_id IS NOT NULL THEN home_phone_1.pref >= home_phone_2.pref ELSE 1 END)
AND (CASE WHEN work_phone_2.telephone_number_id IS NOT NULL THEN work_phone_1.pref >= work_phone_2.pref ELSE 1 END)
AND (CASE WHEN email_2.email_id IS NOT NULL THEN email_1.pref >= email_2.pref ELSE 1 END)
AND (CASE WHEN email_3.email_id IS NOT NULL THEN email_1.pref >= email_3.pref ELSE 1 END)
GROUP BY contacts.contact_id
ORDER BY LOWER(last_name) ASC, LOWER(first_name) ASC;