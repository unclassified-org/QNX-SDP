QnxCar.ns('QnxCar.Media');

/**
 * Allows control of radio services
 *
 * Data Structure: Radio Status
 *	{
 *		tuner	: {
 *			band	: 'am',
 *			min		: 880,
 *			max		: 1710,
 *			step	: 10,
 *		},
 *		artist	: 'Bjork',
 *		genre	: 'News & Entertainment',
 *		song	: 'All is Full of Love',
 *		station	: 'CBC Radio 2',
 *		hd		: true,
 *		channel	: 990,
 *	}
 *
 * @author mlapierre
 * $Id$
 */
QnxCar.Media.Radio = new ((function() {

	var SIMULATION_MODE = false;
	
	var self = this;
	
	var PPS_STATUS	= "/pps/radio/status";
	//var PPS_TUNERS	= "/pps/radio/tuners";
	var PPS_COMMAND	= "/pps/radio/command";
	var PPS_TI_CONTROL = "/pps/radio/ti_control";
	var PPS_TI_STATUS = "/pps/radio/ti_status";
	var PPS_TI_RDS = "/pps/radio/ti_rds";
	var PPS_TI_PRESET = "/pps/radio/tuners";
	
	var ppsStatus;
	var ppsStatusWrite;
	var ppsTuners;
	var ppsCommand;
	var ppsReadPreset;
	var ppsWritePreset;
	var ppsRds;
	
	///// EVENTS /////

	/**
	{
		event: 'QnxCar.Media.Radio.E_UPDATE',
		data: {
			tuner	: {
				band	: 'am',
				min		: 880,
				max		: 1710,
				step	: 10,
			},
			artist	: 'Bjork',
			genre	: 'News & Entertainment',
			song	: 'All is Full of Love',
			station	: 'CBC Radio 2',
			hd		: true,
			channel	: 990,
		}
	}
	*/
	this.E_UPDATE  = "QnxCar.Media.Radio.E_UPDATE";
	this.E_STATUS_UPDATE = "QnxCar.Media.Radio.E_STATUS_UPDATE";

	///// PRIVATE METHODS /////
	
	/**
	 * Method called when the pps status object changes
	 * @param event {Object} The PPS event
	 */
	var onStatusChange = function(event) {
		self.dispatch(self.E_STATUS_UPDATE, self.getStatus());
	};
	
	var onRdsChange = function(event) {
		self.dispatch(self.E_UPDATE, self.getRds());
	}

	///// PUBLIC METHODS /////
	
	/**
	 * Initialize method
	 */
	self.init = function() {
		/*//ppsTuners
		ppsTuners = new JNEXT.PPS();
		ppsTuners.m_strObjId = JNEXT.createObject("pps.PPS");
		JNEXT.registerEvents(ppsTuners);
		ppsTuners.open(PPS_TUNERS, JNEXT.PPS_RDONLY);
		ppsTuners.read();*/
		
		//ppsStatus
		ppsStatus = new JNEXT.PPS();
		ppsStatus.init();// ppsStatus.m_strObjId = JNEXT.createObject("pps.PPS");
		JNEXT.registerEvents(ppsStatus);
		ppsStatus.onChange = onStatusChange.bind(this);
		ppsStatus.open(PPS_TI_STATUS, JNEXT.PPS_RDONLY);
		ppsStatus.read();
		
		//ppsRds - currently use status file location
		ppsRds = new JNEXT.PPS();
		ppsRds.init(); //ppsRds.m_strObjId = JNEXT.createObject("pps.PPS");
		JNEXT.registerEvents(ppsRds);
		ppsRds.onChange = onRdsChange.bind(this);
		ppsRds.open(PPS_TI_RDS, JNEXT.PPS_RDONLY);
		ppsRds.read();
		
		//writing pps commands
		ppsCommand = new JNEXT.PPS();
		ppsCommand.init(); //ppsCommand.m_strObjId = JNEXT.createObject("pps.PPS");
		if (SIMULATION_MODE)
		{
			ppsCommand.open(PPS_STATUS, JNEXT.PPS_WRONLY);
		}
		else
		{
			ppsCommand.open(PPS_TI_CONTROL, JNEXT.PPS_WRONLY);
		}
		
		// reading presets
		ppsReadPreset = new JNEXT.PPS();
		ppsReadPreset.init(); //ppsReadPreset.m_strObjId = JNEXT.createObject("pps.PPS");
		JNEXT.registerEvents(ppsReadPreset);
		ppsReadPreset.open(PPS_TI_PRESET, JNEXT.PPS_RDONLY);
		ppsReadPreset.read();
		
		// writing presets
		ppsWritePreset = new JNEXT.PPS();
		ppsWritePreset.init(); //ppsWritePreset.m_strObjId = JNEXT.createObject("pps.PPS");
		ppsWritePreset.open(PPS_TI_PRESET, JNEXT.PPS_WRONLY);
	};
	
	self.tunerSelect = function(concurrency) {
		ppsCommand.write({msg: "tuner_select", location: "onboard", concurrency: concurrency});
	}
	
	self.bandSelect = function(band) {
		ppsCommand.write({msg: "band_select", num: "0", band: band});
	};
	
	self.tuneFreq = function(band, freq) {
		ppsCommand.write({msg: "tune_frequency", num: "0", band: band, frq: freq});
	};
	
	self.hdGetStatus = function() {
		ppsCommand.write({msg: "hd_getstatus", num: "0"});
	};
	
	self.hdSpsCtrl = function(chnl) {
		ppsCommand.write({msg: "hd_sps_ctrl", num: "0", func : "set", channel : chnl});
	};
	
	self.hdAcquire = function() {
		ppsCommand.write({msg: "hd_acquire", num: "0"});
	};

	self.getPresets = function(band) {
		return ppsReadPreset.ppsObj[band].presets || [];
	};
	
	self.savePreset = function(band, freq, presetIdx) {
		var obj = {};
		obj[band]=ppsReadPreset.ppsObj[band];
		obj[band].presets[presetIdx] = freq;
		ppsWritePreset.write(obj);
	};
	
	self.saveLastFreq = function(band,freq) {
		var obj = {};
		obj[band]=ppsReadPreset.ppsObj[band];
		obj[band].freq = freq;
		ppsWritePreset.write(obj);
	};
	
	self.getLastFreq = function(band) {
		if (ppsReadPreset.ppsObj[band])
			return ppsReadPreset.ppsObj[band].freq || [];
		else
			return [];
	};
	
	self.saveAllPreset = function() {
		var obj = {};
		obj["AM"] = {};
		obj["FM"] = {};
		obj["AM"].freq = 950;   // last frequency for AM
		obj["FM"].freq = 101.1; // last frequency for FM
		obj["AM"].presets = [880, 930, 950, 1460, 1120, 1000];
		obj["FM"].presets = [88.1, 95.7, 101.1, 96.5, 93.7, 100.3];
		ppsWritePreset.write(obj);
	};
	
	/**
	 * Get the current status of the radio
	 * @return {Object} A Radio Status object
	 */
	self.getRds = function() {
		var rds = ppsRds.ppsObj;
		
		if (rds) {
			return {
				TrafficAlert: ((rds.TrafficAlert)?(rds.TrafficAlert): " "),
				AlbumArt: ((rds.AlbumArt)?(rds.AlbumArt):" "),
				album   : ((rds.album)?(rds.album):" "),
				artist	: ((rds.artist)?(rds.artist):" "),
				genre	: ((rds.genre)?(rds.genre):" "),
				song	: ((rds.song)?(rds.song):" "),
				station	: ((rds.station)?(rds.station):" "),
				hd      : ((rds.hd)?(rds.hd):false)
			};
		} else {
			return {
				TrafficAlert: " ",
				AlbumArt: " ",
				album   : " ",
				artist	: " ",
				genre	: " ",
				song	: " ",
				station	: " ",
				hd      : false
			};
		}
		
	};
	
	self.getStatus = function() {
		var status = ppsStatus.ppsObj;
		
		if (status) {
			return {
				hd_signal: ((status.hd_signal)?(status.hd_signal):false),
				hd_sis: ((status.hd_sis)?(status.hd_sis):false),
				hd_audio: ((status.hd_audio)?(status.hd_audio):false),
				hd_daai: ((status.hd_daai)?(status.hd_daai):0),
				hd_qi: ((status.hd_qi)?(status.hd_qi):0),
				hd_cdno: ((status.hd_cdns)?(status.hd_cdns):0),
				hd_curpgm: ((status.hd_curpgm)?(status.hd_curpgm):0),
				hd_pgmAvail: ((status.hd_pgmAvail)?(status.hd_pgmAvail):0),
				hd_psmode: ((status.hd_psmode)?(status.hd_psmode):0),
			};
		} else {
			return {
				hd_signal: false,
				hd_sis: false,
				hd_audio: false,
				hd_daai: 0,
				hd_qi: 0,
				hd_cdno: 0,
				hd_curpgm: 0,
				hd_pgmAvail: 0,
				hd_psmode: 0,
			}
		}
	};
}).extend(QnxCar.EventDispatcher));

