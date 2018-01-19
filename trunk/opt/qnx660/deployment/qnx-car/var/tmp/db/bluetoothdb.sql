CREATE TABLE bluetooth_general(
	recordid INTEGER PRIMARY KEY AUTOINCREMENT,
	record_type INTEGER,
	address TEXT,
	data BLOB
);

CREATE TABLE bluetooth_devices(
	deviceid INTEGER PRIMARY KEY AUTOINCREMENT,
	address TEXT,
	cod INTEGER,
	nameFound INTEGER,
	name TEXT,
	call BLOB,
	media BLOB,
	pim BLOB,
	message BLOB,
	network BLOB
);
