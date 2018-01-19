BEGIN TRANSACTION;

-- *******************************************************************************
-- *******************************************************************************
-- @table _mmplayer_info_
--
-- _mmplayer_info_ contains a schema version number to help mm-player identify the
-- schema version.  It may be extended in the future to include further schema-
-- related information for mm-player.
--
-- @field version      mm-player schema version
-- *******************************************************************************
-- *******************************************************************************
CREATE TABLE _mmplayer_info_ (
      version INTEGER NOT NULL
);
INSERT INTO _mmplayer_info_(version) VALUES(1100);

-- *******************************************************************************
-- *******************************************************************************
-- @table players 
--
-- @field name          The name of the player.
-- @field ts_id         The trksession id associated with the player.
-- @field status        The status of the player STATUS_*
-- @field shuffle_mode  The shuffle mode of the player (SHUFFLE_*)
-- @field repeat_mode   The repeat mode of the player (REPEAT_*)
-- @field playback_rate The playback rate of the player
-- *******************************************************************************
-- *******************************************************************************
CREATE TABLE players (
    name    TEXT NOT NULL,
    ts_id   INTEGER DEFAULT -1 NOT NULL,
    status  INTEGER DEFAULT 1 NOT NULL,
    shuffle_mode INTEGER DEFAULT 0 NOT NULL,
    repeat_mode INTEGER DEFAULT 0 NOT NULL,
    playback_rate REAL DEFAULT 1.0 NOT NULL,
    UNIQUE (name),
    CHECK (status<=4 AND status>=1),
    CHECK (shuffle_mode<=1 AND shuffle_mode>=0),
    CHECK (repeat_mode<=2 AND repeat_mode>=0)
);

-- *******************************************************************************
-- *******************************************************************************
-- @table trksessions 
--
-- @field ms_plugin_name    The name of the plugin used to detect and browse the
--                          media source
-- @field ts_id     The unique trksession id.
-- @field mn_id     The media node id used to create trksession.
-- @field length    The number of media items within the trksession.
-- @field trk_id    The index of the current track
-- @field trk_pos   The position of the current track
-- *******************************************************************************
-- *******************************************************************************
CREATE TABLE trksessions (
    ts_id           INTEGER,
    ms_plugin_name  TEXT NOT NULL,
    ms_type         INTEGER NOT NULL,
    ms_uid          TEXT NOT NULL,
    mn_id           TEXT NOT NULL,
    length          INTEGER DEFAULT 0 NOT NULL,
    trk_id          INTEGER DEFAULT 0 NOT NULL,
    trk_pos         INTEGER DEFAULT 0 NOT NULL,
    UNIQUE (ts_id)
);

-- *******************************************************************************
-- *******************************************************************************
-- @table trksession_medianodes 
--
-- @field id            The index for the media node 
-- @filed ts_id         The trksession id the media node belongs to
-- @filed mn_id         The unique media node id
-- @field name          The name of the media node.
-- @field url           The file path to the media node.
-- @field mn_type       The type of the media node.
-- @filed ms_uid        The unique media source uid
-- @field ms_type       The device type on which the track is actually lives.
-- *******************************************************************************
-- *******************************************************************************
CREATE TABLE trksession_medianodes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ts_id       INTEGER,
    mn_id       TEXT NOT NULL,
    name        TEXT DEFAULT NULL,
    url         TEXT NOT  NULL,
    mn_type     INTEGER,
    ms_uid      TEXT NOT NULL,
    ms_type     INTEGER,
    FOREIGN KEY(ts_id) REFERENCES trksessions(ts_id)
);

COMMIT;
