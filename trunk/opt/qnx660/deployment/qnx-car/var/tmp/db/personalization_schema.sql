CREATE TABLE "nav_favourites" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "profile_id" INTEGER NOT NULL , "name" TEXT NOT NULL , "number" TEXT NOT NULL , "street" TEXT NOT NULL , "city" TEXT NOT NULL , "province" TEXT NOT NULL , "postalCode" TEXT NOT NULL , "country" TEXT NOT NULL , "type" TEXT NOT NULL, "latitude" REAL NOT NULL, "longitude" REAL NOT NULL);
CREATE TABLE "nav_history" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "profile_id" INTEGER NOT NULL , "name" TEXT NOT NULL , "number" TEXT NOT NULL , "street" TEXT NOT NULL , "city" TEXT NOT NULL , "province" TEXT NOT NULL , "postalCode" TEXT NOT NULL , "country" TEXT NOT NULL , "type" TEXT NOT NULL , "timestamp" INTEGER NOT NULL, "latitude" REAL NOT NULL, "longitude" REAL NOT NULL);
CREATE TABLE "profiles" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "full_name" VARCHAR(20) NOT NULL , "device_id" VARCHAR(20) DEFAULT "0", "theme" VARCHAR(50) NOT NULL , "avatar" VARCHAR(50) NOT NULL , "avatar_file_path" VARCHAR(150));
CREATE TABLE "settings" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "profile_id" INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, "key" VARCHAR(50) NOT NULL , "value" VARCHAR(150) NOT NULL , UNIQUE(profile_id, key));
CREATE INDEX "idx_nav_favs" ON "nav_favourites" ("id" ASC, "profile_id" ASC);
CREATE INDEX "idx_nav_history" ON "nav_history" ("profile_id" DESC, "timestamp" DESC);
CREATE INDEX "idx_profiles" ON "profiles" ("id" ASC, "device_id" ASC);
CREATE INDEX "idx_settings" ON "settings" ("id" ASC, "profile_id" ASC, "key" ASC);
