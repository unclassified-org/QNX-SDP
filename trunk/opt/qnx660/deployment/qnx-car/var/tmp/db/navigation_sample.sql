-- vim: ts=3
BEGIN TRANSACTION;

--
-- Set SQLite's journal mode.
--
-- 'truncate' is the fastest and safest for most configurations.
-- See <http://sqlite.org/pragma.html> for more on this mode.
PRAGMA journal_mode=truncate;


-- The QDB information for this database
CREATE TABLE _qdb_info_ (
   version INTEGER NOT NULL
);
INSERT INTO _qdb_info_(version) VALUES(1011);

-- *******************************************************************************
-- *******************************************************************************
CREATE TABLE locations (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      name              TEXT,
      country           TEXT,
      province          TEXT,
      city              TEXT,
      street            TEXT,
      number            TEXT,
      latitude          REAL DEFAULT 0 NOT NULL,
      longitude         REAL DEFAULT 0 NOT NULL,
      postalCode        TEXT,
      categoryId        INTEGER DEFAULT 0 NOT NULL,
      distance          INTEGER DEFAULT 0 NOT NULL
      );

CREATE TABLE categories (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      name              TEXT DEFAULT '' NOT NULL,
      parentId          INTEGER,
      type              TEXT DEFAULT '' NOT NULL                  
      );
CREATE UNIQUE INDEX ix_categories_parentId on categories(parentId, name);

CREATE TABLE categories_customer (
      id                INTEGER PRIMARY KEY,
      name              TEXT DEFAULT '' NOT NULL,
      categoryId        INTEGER REFERENCES categories(id)
      );
CREATE UNIQUE INDEX ix_categoriescustomer_categoryId on categories_customer(categoryId);

CREATE TABLE route(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    street              TEXT,
    command             TEXT,
    distance            INTEGER DEFAULT 0 NOT NULL,
    latitude            REAL DEFAULT 0 NOT NULL,
    longitude           REAL DEFAULT 0 NOT NULL
    );
COMMIT;
