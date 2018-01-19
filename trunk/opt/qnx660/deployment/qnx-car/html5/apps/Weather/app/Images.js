/**
 * @author msimic
 */

var Images = {

	//language: WEATHEREYE.getLanguage,
	language: function () {
		return 'en';
	},

	TWNMMLogo: "TWNMMLogo",
	CrntHrlyBtn: "curHrlyBtnImg",
	ShortTermBtn: "stBtnImg",
	LongTermBtn: "ltBtnImg",
	CitiesBtn: "menuBtnImg",
	SettingsBtn: "settingsBtnImg",
	HelpBtn: "helpBtnImg",
	EditBtn: "EditBtnImg",
	DoneBtn: "DoneBtnImg",
	SearchBtn: "SearchBtnImg",

	CrntHrlyBtnOnImg: "",
	ShortTermBtnOnImg: "",
	LongTermBtnOnImg: "",
	CrntHrlyBtnOffImg: "",
	ShortTermBtnOffImg: "",
	LongTermBtnOffImg: "",

	preLoadObject: null,




	Refresh: function()
	{
//		document.getElementById(this.TWNMMLogo).src = this.GetImgPath("TWNMMLogo");
//
//		document.getElementById(this.CitiesBtn).src = this.GetImgPath("CitiesBtn");
//		document.getElementById(this.SettingsBtn).src = this.GetImgPath("SettingsBtn");
//		document.getElementById(this.HelpBtn).src = this.GetImgPath("HelpBtn");
//
//		document.getElementById(this.EditBtn).src = this.GetImgPath("EditBtn");
//		document.getElementById(this.DoneBtn).src = this.GetImgPath("DoneBtn");
//		document.getElementById(this.SearchBtn).src = this.GetImgPath("SearchBtn");

		this.PresetImg(this.TWNMMLogo, "TWNMMLogo");
		this.PresetImg(this.TWNMMLogoMini, "TWNMMLogoMini");
		this.PresetImg(this.CitiesBtn, "CitiesBtn");
		this.PresetImg(this.SettingsBtn, "SettingsBtn");
		this.PresetImg(this.HelpBtn, "HelpBtn");
		this.PresetImg(this.EditBtn, "EditBtn");
		this.PresetImg(this.DoneBtn, "DoneBtn");
		this.PresetImg(this.SearchBtn, "SearchBtn");

	},

	PreLoadImg: function(ImgName, SubGroup)
	{
		var imgSrc = this.GetImgPathMulti(ImgName, SubGroup);
		
		if(imgSrc != ImgName)
		{
			this.preLoadObject = new Image();
			this.preLoadObject.src = this.GetImgPathMulti(ImgName, SubGroup);
		}
	},

	PresetImg: function(ImgObject, ImgName)
	{
		if(document.getElementById(ImgObject))
		{
			document.getElementById(ImgObject).src = this.GetImgPath(ImgName);
		}
	},

	GetImgPath: function(ImgKey)
	{
		return this.GetImgPathBase(ImgKey, this.language());
	},
	GetImgPathBase: function(ImgKey, LangSetting)
	{
		for(il = 0; il < this.imageLookup.length; il++)
		{
			if( this.imageLookup[il][ ImgKey ] &&  this.imageLookup[il][ ImgKey ][ LangSetting ]  && this.imageLookup[il][ ImgKey ][ LangSetting ]['path'])
			{
				return this.imageLookup[il][ ImgKey ][ LangSetting  ]['path'];
	
			}
			else if(this.imageLookup[il][ ImgKey ] &&  this.imageLookup[il][ ImgKey ][ 'all' ]  && this.imageLookup[il][ ImgKey ][ 'all' ]['path'])
			{
				return this.imageLookup[il][ ImgKey ][ 'all'  ]['path'];
			}
		}
		
		return ImgKey;
		
	},
	GetImgPathMulti: function(ImgKey, SubGroup)
	{
		return this.GetImgPathMultiBase(ImgKey, this.language(), SubGroup);
	},
	//used for any subgrouping ie. small, large, top image, bottom image
	GetImgPathMultiBase: function(ImgKey, LangSetting, SubGroup)
	{
		for(il = 0; il < this.imageLookup.length; il++)
		{
			if( this.imageLookup[il][ ImgKey ] &&  this.imageLookup[il][ ImgKey ][ LangSetting ]  && this.imageLookup[il][ ImgKey ][ LangSetting ]['path'] && this.imageLookup[il][ ImgKey ][ LangSetting ]['path'][SubGroup])
			{
				return this.imageLookup[il][ ImgKey ][ LangSetting  ]['path'][SubGroup];
			}
			else if(this.imageLookup[il][ ImgKey ] &&  this.imageLookup[il][ ImgKey ][ 'all' ]  && this.imageLookup[il][ ImgKey ][ 'all' ]['path']  && this.imageLookup[il][ ImgKey ][ 'all' ]['path'][SubGroup])
			{
				return this.imageLookup[il][ ImgKey ][ 'all'  ]['path'][SubGroup];
			}
			else if(this.imageLookup[il][ ImgKey ] &&  this.imageLookup[il][ ImgKey ][ LangSetting ]  && this.imageLookup[il][ ImgKey ][ LangSetting ]['path'])
			{
				return this.imageLookup[il][ ImgKey ][ LangSetting ]['path'];
			}
			else if(this.imageLookup[il][ ImgKey ] &&  this.imageLookup[il][ ImgKey ][ 'all' ]  && this.imageLookup[il][ ImgKey ][ 'all' ]['path'])
			{
				return this.imageLookup[il][ ImgKey ][ 'all'  ]['path'];
			}
		}
		
		return ImgKey;
	},

	GetImgText: function(ImgKey)
	{
		return this.GetImgTextBase(ImgKey, this.language());
	},
	GetImgGroup: function(ImgKey)
	{
		LangSetting=this.language();
		
		for(il = 0; il < this.imageLookup.length; il++)
		{
			if( this.imageLookup[il][ ImgKey ] &&  this.imageLookup[il][ ImgKey ][ LangSetting  ]  && this.imageLookup[il][ ImgKey ][ LangSetting  ]['group'])
			{
				return this.imageLookup[il][ ImgKey ][ LangSetting ]['group' ];
			}
		}
	},
	GetImgTextBase: function(ImgKey, LangSetting)
	{
		for(il = 0; il < this.imageLookup.length; il++)
		{
			if( this.imageLookup[il][ ImgKey ] &&  this.imageLookup[il][ ImgKey ][ LangSetting  ]  && this.imageLookup[il][ ImgKey ][ LangSetting  ]['text'])
			{
				return this.imageLookup[il][ ImgKey ][ LangSetting ]['text' ];
			}
			else if(this.imageLookup[il][ ImgKey ] &&  this.imageLookup[il][ ImgKey ][ 'all' ]  && this.imageLookup[il][ ImgKey ][ 'all' ]['text'])
			{
				return this.imageLookup[il][ ImgKey ][ 'all'  ]['text'];
			}
		}
		
		return ImgKey;
		
	},

	//imageLookup setup as an array of objects, so that we can add images to imageLookup later in other javascript files
	//This was done to reduce the imageLookup size for the mini-app and only including image references necessary for the mini and full version of the apps.
	
	imageLookup : [
				{"TWNMMLogoMini": {
					"en": {
						"path": "img/logo_twn.jpg",
						"text":  "The Weather Network"
					},
					"fr": {
						"path": "img/logo_twn.jpg",
						"text":  "Météo Média"
					}
				},
				"Loading": {
					"en": {
						"path": {
							"large": "images/mini/loading.gif",
							"small": "images/mini/loading.gif"
						},
						"text": "Loading"
					},
					"fr": {
						"path": {
							"large": "images/mini/loading.gif",
							"small": "images/mini/loading.gif"
						},
						"text": "Loading"
					}
				},
				"NW_Heading": {
					"en": {
						"path": {
							"large": "images/full/current_compass/outer_directions/NW_White.png",
							"small": "images/mini/wind/en/NW_White.png"
						},
						"text": "Northwest"
					},
					"fr": {
						"path": {
							"large": "images/mini/wind/en/NO_White.png",
							"small": "images/mini/wind/en/NO_White.png"
						},
						"text": "Nord-ouest"
					}
				},
		
				"N_Heading": {
					"en": {
						"path": {
							"large": "images/full/current_compass/outer_directions/N_White.png",
							"small": "images/mini/wind/en/N_White.png"
						},
						"text": "North"
					},
					"fr": {
						"path": {
							"large": "images/mini/wind/en/N_White.png",
							"small": "images/mini/wind/en/N_White.png"
						},
						"text": "Nord"
					}
				},
		
				"NE_Heading": {
					"en": {
						"path": {
							"large": "images/full/current_compass/outer_directions/NE_White.png",
							"small": "images/mini/wind/en/NE_White.png"
						},
						"text": "Northeast"
					},
					"fr": {
						"path": {
							"large": "images/mini/wind/en/NE_White.png",
							"small": "images/mini/wind/en/NE_White.png"
						},
						"text": "Nord-est"
					}
				},
		
				"E_Heading": {
					"en": {
						"path": {
							"large": "images/full/current_compass/outer_directions/E_White.png",
							"small": "images/mini/wind/en/E_White.png"
						},
						"text": "East"
					},
					"fr": {
						"path": {
							"large": "images/mini/wind/en/E_White.png",
							"small": "images/mini/wind/en/E_White.png"
						},
						"text": "Est"
					}
				},
		
				"SE_Heading": {
					"en": {
						"path": {
							"large": "images/full/current_compass/outer_directions/SE_White.png",
							"small": "images/mini/wind/en/SE_White.png"
						},
						"text": "Southeast"
					},
					"fr": {
						"path": {
							"large": "images/mini/wind/en/SE_White.png",
							"small": "images/mini/wind/en/SE_White.png"
						},
						"text": "Sud-est"
					}
				},
		
				"S_Heading": {
					"en": {
						"path": {
							"large": "images/full/current_compass/outer_directions/S_White.png",
							"small": "images/mini/wind/en/S_White.png"
						},
						"text": "South"
					},
					"fr": {
						"path": {
							"large": "images/mini/wind/en/S_White.png",
							"small": "images/mini/wind/en/S_White.png"
						},
						"text": "Sud"
					}
				},
		
				"SW_Heading": {
					"en": {
						"path": {
							"large": "images/full/current_compass/outer_directions/SW_White.png",
							"small": "images/mini/wind/en/SW_White.png"
						},
						"text": "Southwest"
					},
					"fr": {
						"path": {
							"large": "images/mini/wind/en/SO_White.png",
							"small": "images/mini/wind/en/SO_White.png"
						},
						"text": "Sud-ouest"
					}
				},
		
				"W_Heading": {
					"en": {
						"path": {
							"large": "images/full/current_compass/outer_directions/W_White.png",
							"small": "images/mini/wind/en/W_White.png"
						},
						"text": "West"
					},
					"fr": {
						"path": {
							"large": "images/mini/wind/en/O_White.png",
							"small": "images/mini/wind/en/O_White.png"
						},
						"text": "Ouest"
					}
				},
				"N_Crdnl": {
					"en": {
						"path": {
							"large": "images/full/current_compass/outer_directions/N_Blue.png",
							"small": "images/mini/wind/en/N_Yellow.png"
						},
						"text": "North"
					},
					"fr": {
						"path": {
							"large": "images/mini/wind/en/N_Blue.png",
							"small": "images/mini/wind/en/N_Yellow.png"
						},
						"text": "Nord"
					}
				},
		
				"E_Crdnl": {
					"en": {
						"path": {
							"large": "images/full/current_compass/outer_directions/E_Blue.png",
							"small": "images/mini/wind/en/E_Yellow.png"
						},
						"text": "East"
					},
					"fr": {
						"path": {
							"large": "images/mini/wind/en/E_Blue.png",
							"small": "images/mini/wind/en/E_Yellow.png"
						},
						"text": "Est"
					}
				},
		
				"S_Crdnl": {
					"en": {
						"path": {
							"large": "images/full/current_compass/outer_directions/S_Blue.png",
							"small": "images/mini/wind/en/S_Yellow.png"
						},
						"text": "South"
					},
					"fr": {
						"path": {
							"large": "images/mini/wind/en/S_Blue.png",
							"small": "images/mini/wind/en/S_Yellow.png"
						},
						"text": "Sud"
					}
				},
		
				"W_Crdnl": {
					"en": {
						"path": {
							"large": "images/full/current_compass/outer_directions/W_Blue.png",
							"small": "images/mini/wind/en/W_Yellow.png"
						},
						"text": "West"
					},
					"fr": {
						"path": {
							"large": "images/mini/wind/en/O_Blue.png",
							"small": "images/mini/wind/en/O_Yellow.png"
						},
						"text": "Ouest"
					}
				},
				
				"windDialShadow": {
					"en": {
						"path": {
							"large": "images/full/current_compass/circle_dropshadow.png",
							"small": "images/mini/wind/Wind_Shadow.png"
						},
						"text": "Wind Dial Shadow"
					},
					"fr": {
						"path": {
							"large": "images/full/current_compass/circle_dropshadow.png",
							"small": "images/mini/wind/Wind_Shadow.png"
						},
						"text": "Wind Dial Shadow"
					}
				},
				
				"windDial": {
					"en": {
						"path": {
							"large": "images/full/current_compass/compass.png",
							"small": "images/mini/wind/Wind_Arrow.png"
						},
						"text": "Wind Dial"
					},
					"fr": {
						"path": {
							"large": "images/full/current_compass/compass.png",
							"small": "images/mini/wind/Wind_Arrow.png"
						},
						"text": "Wind Dial"
					}
				},
				
				"windDialCalm": {
					"en": {
						"path": {
							"large": "images/full/current_compass/compass_calm.png",
							"small": "images/mini/wind/Wind_Arrow_Calm.png"
						},
						"text": "Wind Dial Calm"
					},
					"fr": {
						"path": {
							"large": "images/full/current_compass/compass_calm.png",
							"small": "images/mini/wind/Wind_Arrow_Calm.png"
						},
						"text": "Wind Dial Calm"
					}
				},
				
				"windDialCentre": {
					"en": {
						"path": {
							"large": "images/full/current_compass/centre_circle.png",
							"small": "images/mini/wind/Wind_Centre.png"
						},
						"text": "Wind Dial Calm"
					},
					"fr": {
						"path": {
							"large": "images/full/current_compass/centre_circle.png",
							"small": "images/mini/wind/Wind_Centre.png"
						},
						"text": "Wind Dial Calm"
					}
				}
				
				
			}
		]

};


var imageLookupObs = { 
		"obs_-BKN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Partly cloudy",
				"group": "sunny"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Ciel variable",
				"group": "sunny"
			}
		},
		"obs_-BKNN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Partly cloudy",
				"group": "sunny"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Nuageux avec éclaircies",
				"group": "sunny"
			}
		},
		"obs_-OVC": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/3.png",
					"small": "images/mini/icons_80/3.png"
				},
				"text": "Cloudy",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/3.png",
					"small": "images/mini/icons_80/3.png"
				},
				"text": "Plutôt nuageux",
				"group": "cloudy"
			}
		},
		"obs_-OVCN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/20.png",
					"small": "images/mini/icons_80/20.png"
				},
				"text": "Cloudy",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/20.png",
					"small": "images/mini/icons_80/20.png"
				},
				"text": "Plutôt nuageux",
				"group": "cloudy"
			}
		},
		"obs_-SCT": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/1.png",
					"small": "images/mini/icons_80/1.png"
				},
				"text": "Fair",
				"group": "sunny"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/1.png",
					"small": "images/mini/icons_80/1.png"
				},
				"text": "Généralement ensoleillé",
				"group": "sunny"
			}
		},
		"obs_-SCTN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/18.png",
					"small": "images/mini/icons_80/18.png"
				},
				"text": "Fair",
				"group": "sunny"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/18.png",
					"small": "images/mini/icons_80/18.png"
				},
				"text": "Généralement dégagé",
				"group": "sunny"
			}
		},
		"obs_A": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Hail",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Grêle",
				"group": "rain"
			}
		},
		"obs_A+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Heavy hail",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Forte grêle",
				"group": "rain"
			}
		},
		"obs_A+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Heavy hail",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Forte grêle",
				"group": "rain"
			}
		},
		"obs_A-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Light hail",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Faible grêle",
				"group": "rain"
			}
		},
		"obs_A--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Light hail",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Faible grêle",
				"group": "rain"
			}
		},
		"obs_A--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Light hail",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Faible grêle",
				"group": "rain"
			}
		},
		"obs_A-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Light hail",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Faible grêle",
				"group": "rain"
			}
		},
		"obs_AN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Hail",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Grêle",
				"group": "rain"
			}
		},
		"obs_B": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Blowing sand",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Chasse-sable élevé",
				"group": "cloudy"
			}
		},
		"obs_BD": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Blowing dust",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Chasse-poussière élevé",
				"group": "cloudy"
			}
		},
		"obs_BDN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Blowing dust",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Chasse-poussière élevé",
				"group": "cloudy"
			}
		},
		"obs_BKN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/3.png",
					"small": "images/mini/icons_80/3.png"
				},
				"text": "Partly cloudy",
				"group": "sunny"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/3.png",
					"small": "images/mini/icons_80/3.png"
				},
				"text": "Partiellement nuageux",
				"group": "sunny"
			}
		},
		"obs_BKNN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/20.png",
					"small": "images/mini/icons_80/20.png"
				},
				"text": "Partly cloudy",
				"group": "sunny"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/20.png",
					"small": "images/mini/icons_80/20.png"
				},
				"text": "Partiellement nuageux",
				"group": "sunny"
			}
		},
		"obs_BN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Blowing sand",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Chasse-sable élevé",
				"group": "cloudy"
			}
		},
		"obs_BNN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Blowing sand",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Chasse-sable élevé",
				"group": "cloudy"
			}
		},
		"obs_BS": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/22.png",
					"small": "images/mini/icons_80/22.png"
				},
				"text": "Blowing snow",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/22.png",
					"small": "images/mini/icons_80/22.png"
				},
				"text": "Poudrerie élevé",
				"group": "snow"
			}
		},
		"obs_BSN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/22.png",
					"small": "images/mini/icons_80/22.png"
				},
				"text": "Blowing snow",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/22.png",
					"small": "images/mini/icons_80/22.png"
				},
				"text": "Poudrerie élevé",
				"group": "snow"
			}
		},
		"obs_CLR": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/1.png",
					"small": "images/mini/icons_80/1.png"
				},
				"text": "Clear",
				"group": "sunny"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/1.png",
					"small": "images/mini/icons_80/1.png"
				},
				"text": "Ciel dégagé",
				"group": "sunny"
			}
		},
		"obs_CLRN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/18.png",
					"small": "images/mini/icons_80/18.png"
				},
				"text": "Clear",
				"group": "sunny"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/18.png",
					"small": "images/mini/icons_80/18.png"
				},
				"text": "Ciel dégagé",
				"group": "sunny"
			}
		},
		"obs_D": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Dust",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Poussière",
				"group": "cloudy"
			}
		},
		"obs_DN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Dust",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Poussière",
				"group": "cloudy"
			}
		},
		"obs_F": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/17.png",
					"small": "images/mini/icons_80/17.png"
				},
				"text": "Fog",
				"group": "fog"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/17.png",
					"small": "images/mini/icons_80/17.png"
				},
				"text": "Brouillard",
				"group": "fog"
			}
		},
		"obs_FN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/17.png",
					"small": "images/mini/icons_80/17.png"
				},
				"text": "Fog",
				"group": "fog"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/17.png",
					"small": "images/mini/icons_80/17.png"
				},
				"text": "Brouillard",
				"group": "fog"
			}
		},
		"obs_H": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Haze",
				"group": "sunny"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Brume sèche",
				"group": "sunny"
			}
		},
		"obs_HN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Haze",
				"group": "sunny"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Brume sèche",
				"group": "sunny"
			}
		},
		"obs_IC": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Ice crystals",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Cristaux de glace",
				"group": "snow"
			}
		},
		"obs_ICN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Ice crystals",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Cristaux de glace",
				"group": "snow"
			}
		},
		"obs_IF": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/17.png",
					"small": "images/mini/icons_80/17.png"
				},
				"text": "Ice fog",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/17.png",
					"small": "images/mini/icons_80/17.png"
				},
				"text": "Brouillard glacé",
				"group": "cloudy"
			}
		},
		"obs_IFN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/17.png",
					"small": "images/mini/icons_80/17.png"
				},
				"text": "Ice fog",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/17.png",
					"small": "images/mini/icons_80/17.png"
				},
				"text": "Brouillard glacé",
				"group": "cloudy"
			}
		},
		"obs_IP": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Ice pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Grésil",
				"group": "snow"
			}
		},
		"obs_IP+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Heavy ice pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Fort grésil",
				"group": "snow"
			}
		},
		"obs_IP+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Heavy ice pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Fort grésil",
				"group": "snow"
			}
		},
		"obs_IP-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light ice pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible grésil",
				"group": "snow"
			}
		},
		"obs_IP--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light ice pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible grésil",
				"group": "snow"
			}
		},
		"obs_IP--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light ice pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible grésil",
				"group": "snow"
			}
		},
		"obs_IP-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light ice pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible grésil",
				"group": "snow"
			}
		},
		"obs_IPN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Ice pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Grésil",
				"group": "snow"
			}
		},
		"obs_IPW": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Ice pellet showers",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Averses de grésil",
				"group": "snow"
			}
		},
		"obs_IPW+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Heavy ice pellet showers",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Forte averse de grésil",
				"group": "snow"
			}
		},
		"obs_IPW+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Heavy ice pellet showers",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Forte averse de grésil",
				"group": "snow"
			}
		},
		"obs_IPW-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light ice pellet showers",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible averse de grésil",
				"group": "snow"
			}
		},
		"obs_IPW--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light ice pellet showers",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible averse de grésil",
				"group": "snow"
			}
		},
		"obs_IPW--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light ice pellet showers",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible averse de grésil",
				"group": "snow"
			}
		},
		"obs_IPW-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light ice pellet showers",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible averse de grésil",
				"group": "snow"
			}
		},
		"obs_IPWN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Ice pellet showers",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Averse de grésil",
				"group": "snow"
			}
		},
		"obs_K": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Smoke",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Fumée",
				"group": "cloudy"
			}
		},
		"obs_KN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Smoke",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Fumée",
				"group": "cloudy"
			}
		},
		"obs_L": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Drizzle",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Bruine",
				"group": "rain"
			}
		},
		"obs_L+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Heavy drizzle",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Forte bruine",
				"group": "rain"
			}
		},
		"obs_L+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Heavy drizzle",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Forte bruine",
				"group": "rain"
			}
		},
		"obs_L-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Light drizzle",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Faible bruine",
				"group": "rain"
			}
		},
		"obs_L--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Light drizzle",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Faible bruine",
				"group": "rain"
			}
		},
		"obs_L--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Light drizzle",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Faible bruine",
				"group": "rain"
			}
		},
		"obs_L-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Light drizzle",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Faible bruine",
				"group": "rain"
			}
		},
		"obs_LN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Drizzle",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/9.png",
					"small": "images/mini/icons_80/9.png"
				},
				"text": "Bruine",
				"group": "rain"
			}
		},
		"obs_OVC": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/8.png",
					"small": "images/mini/icons_80/8.png"
				},
				"text": "Overcast",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/8.png",
					"small": "images/mini/icons_80/8.png"
				},
				"text": "Couvert",
				"group": "cloudy"
			}
		},
		"obs_OVCN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/8.png",
					"small": "images/mini/icons_80/8.png"
				},
				"text": "Overcast",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/8.png",
					"small": "images/mini/icons_80/8.png"
				},
				"text": "Couvert",
				"group": "cloudy"
			}
		},
		"obs_R": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Rain",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Pluie",
				"group": "rain"
			}
		},
		"obs_R+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Heavy rain",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Pluie forte",
				"group": "rain"
			}
		},
		"obs_R+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Heavy rain",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Pluie forte",
				"group": "rain"
			}
		},
		"obs_R-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Light rain",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Faible pluie",
				"group": "rain"
			}
		},
		"obs_R--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Light rain",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Faible pluie",
				"group": "rain"
			}
		},
		"obs_R--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Light rain",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Faible pluie",
				"group": "rain"
			}
		},
		"obs_R-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Light rain",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Faible pluie",
				"group": "rain"
			}
		},
		"obs_R-S": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Rain and snow mixed",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Pluie mêlée de neige",
				"group": "rain"
			}
		},
		"obs_R-S-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Rain and snow mixed",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Pluie mêlée de neige",
				"group": "rain"
			}
		},
		"obs_R-S-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Rain and snow mixed",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Pluie mêlée de neige",
				"group": "rain"
			}
		},
		"obs_R-SN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Rain and snow mixed",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Pluie mêlée de neige",
				"group": "rain"
			}
		},
		"obs_RN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Rain",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Pluie",
				"group": "rain"
			}
		},
		"obs_RS": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Rain and snow mixed",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Pluie mêlée de neige",
				"group": "rain"
			}
		},
		"obs_RS-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Rain and snow mixed",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Pluie mêlée de neige",
				"group": "rain"
			}
		},
		"obs_RS-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Rain and snow mixed",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Pluie mêlée de neige",
				"group": "rain"
			}
		},
		"obs_RSN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Rain and snow mixed",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/13.png",
					"small": "images/mini/icons_80/13.png"
				},
				"text": "Pluie mêlée de neige",
				"group": "rain"
			}
		},
		"obs_RW": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Rain showers",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Averse de pluie",
				"group": "rain"
			}
		},
		"obs_RW+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Heavy rain showers",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Forte averse de pluie",
				"group": "rain"
			}
		},
		"obs_RW+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Heavy rain showers",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Forte averse de pluie",
				"group": "rain"
			}
		},
		"obs_RW-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Light rain showers",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Faibles averses de pluie",
				"group": "rain"
			}
		},
		"obs_RW--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Light rain showers",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Faibles averses de pluie",
				"group": "rain"
			}
		},
		"obs_RW--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Light rain showers",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Faibles averses de pluie",
				"group": "rain"
			}
		},
		"obs_RW-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Light rain showers",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Faibles averses de pluie",
				"group": "rain"
			}
		},
		"obs_RWN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Rain showers",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/10.png",
					"small": "images/mini/icons_80/10.png"
				},
				"text": "Averses de pluie",
				"group": "rain"
			}
		},
		"obs_S": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Snow",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Neige",
				"group": "snow"
			}
		},
		"obs_S+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Heavy snow",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Neige forte",
				"group": "snow"
			}
		},
		"obs_S+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Heavy snow",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Neige forte",
				"group": "snow"
			}
		},
		"obs_S-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Light snow",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Faible neige",
				"group": "snow"
			}
		},
		"obs_S--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Light snow",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Faible neige",
				"group": "snow"
			}
		},
		"obs_S--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Light snow",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Faible neige",
				"group": "snow"
			}
		},
		"obs_S-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Light snow",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Faible neige",
				"group": "snow"
			}
		},
		"obs_SCT": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "A few clouds",
				"group": "sunny"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/2.png",
					"small": "images/mini/icons_80/2.png"
				},
				"text": "Quelques nuages",
				"group": "sunny"
			}
		},
		"obs_SCTN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "A few clouds",
				"group": "sunny"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/19.png",
					"small": "images/mini/icons_80/19.png"
				},
				"text": "Quelques nuages",
				"group": "sunny"
			}
		},
		"obs_SG": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Snow grains",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Neige en grains",
				"group": "snow"
			}
		},
		"obs_SG+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Heavy snow grains",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Neige forte en grains",
				"group": "snow"
			}
		},
		"obs_SG+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Heavy snow grains",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Neige forte en grains",
				"group": "snow"
			}
		},
		"obs_SG-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Light snow grains",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Faible neige en grains",
				"group": "snow"
			}
		},
		"obs_SG--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Light snow grains",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Faible neige en grains",
				"group": "snow"
			}
		},
		"obs_SG--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Light snow grains",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Faible neige en grains",
				"group": "snow"
			}
		},
		"obs_SG-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Light snow grains",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Faible neige en grains",
				"group": "snow"
			}
		},
		"obs_SGN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Snow grains",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Neige en grains",
				"group": "snow"
			}
		},
		"obs_SN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Snow",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Neige",
				"group": "snow"
			}
		},
		"obs_SP": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Snow pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Neige roulée",
				"group": "snow"
			}
		},
		"obs_SP-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Light snow pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Faible neige roulée",
				"group": "snow"
			}
		},
		"obs_SP--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Light snow pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Faible neige roulée",
				"group": "snow"
			}
		},
		"obs_SP--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Light snow pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Faible neige roulée",
				"group": "snow"
			}
		},
		"obs_SP-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Light snow pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Faible neige roulée",
				"group": "snow"
			}
		},
		"obs_SPN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Snow pellets",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/15.png",
					"small": "images/mini/icons_80/15.png"
				},
				"text": "Neige roulée",
				"group": "snow"
			}
		},
		"obs_SW": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Flurries",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Averse de neige",
				"group": "snow"
			}
		},
		"obs_SW+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Heavy flurries",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Forte averse de neige",
				"group": "snow"
			}
		},
		"obs_SW+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Heavy flurries",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Forte averse de neige",
				"group": "snow"
			}
		},
		"obs_SW-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Light flurries",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Faible averse de neige",
				"group": "snow"
			}
		},
		"obs_SW--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Light flurries",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Faible averse de neige",
				"group": "snow"
			}
		},
		"obs_SW--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Light flurries",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Faible averse de neige",
				"group": "snow"
			}
		},
		"obs_SW-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Light flurries",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Faible averse de neige",
				"group": "snow"
			}
		},
		"obs_SWN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Flurries",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/16.png",
					"small": "images/mini/icons_80/16.png"
				},
				"text": "Averse de neige",
				"group": "snow"
			}
		},
		"obs_T": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Thunder",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Tonnerre",
				"group": "cloudy"
			}
		},
		"obs_T+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Severe thunder",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Tonnerre fort",
				"group": "cloudy"
			}
		},
		"obs_T+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Severe thunder",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Tonnerre fort",
				"group": "cloudy"
			}
		},
		"obs_TF": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/27.png",
					"small": "images/mini/icons_80/27.png"
				},
				"text": "Foggy with thunder",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/27.png",
					"small": "images/mini/icons_80/27.png"
				},
				"text": "Brumeux avec tonnerre",
				"group": "cloudy"
			}
		},
		"obs_TH": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/27.png",
					"small": "images/mini/icons_80/27.png"
				},
				"text": "Hazy with thunder",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/27.png",
					"small": "images/mini/icons_80/27.png"
				},
				"text": "Brume sèche et tonnerre",
				"group": "cloudy"
			}
		},
		"obs_TN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Thunder",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Tonnerre",
				"group": "cloudy"
			}
		},
		"obs_TR": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Thunderstorm",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Orage",
				"group": "rain"
			}
		},
		"obs_TR+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Heavy thunderstorm",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Orage fort",
				"group": "rain"
			}
		},
		"obs_TR+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Heavy thunderstorm",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Orage fort",
				"group": "rain"
			}
		},
		"obs_TR-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Light thunderstorm",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Orage faible",
				"group": "rain"
			}
		},
		"obs_TR--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Light thunderstorm",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Orage faible",
				"group": "rain"
			}
		},
		"obs_TR--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Light thunderstorm",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Orage faible",
				"group": "rain"
			}
		},
		"obs_TR-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Light thunderstorm",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Orage faible",
				"group": "rain"
			}
		},
		"obs_TRN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Thunderstorm",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Orage",
				"group": "rain"
			}
		},
		"obs_TRW": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/7.png",
					"small": "images/mini/icons_80/7.png"
				},
				"text": "Thundershower",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/7.png",
					"small": "images/mini/icons_80/7.png"
				},
				"text": "Orage",
				"group": "rain"
			}
		},
		"obs_TRW+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Heavy thundershower",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Orage fort",
				"group": "rain"
			}
		},
		"obs_TRW+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Heavy thundershower",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/11.png",
					"small": "images/mini/icons_80/11.png"
				},
				"text": "Orage fort",
				"group": "rain"
			}
		},
		"obs_TRW-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/7.png",
					"small": "images/mini/icons_80/7.png"
				},
				"text": "Light thundershower",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/7.png",
					"small": "images/mini/icons_80/7.png"
				},
				"text": "Orage faible",
				"group": "rain"
			}
		},
		"obs_TRW--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/7.png",
					"small": "images/mini/icons_80/7.png"
				},
				"text": "Light thundershower",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/7.png",
					"small": "images/mini/icons_80/7.png"
				},
				"text": "Orage faible",
				"group": "rain"
			}
		},
		"obs_TRW--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/24.png",
					"small": "images/mini/icons_80/24.png"
				},
				"text": "Light thundershower",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/24.png",
					"small": "images/mini/icons_80/24.png"
				},
				"text": "Orage faible",
				"group": "rain"
			}
		},
		"obs_TRW-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/24.png",
					"small": "images/mini/icons_80/24.png"
				},
				"text": "Light thundershower",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/24.png",
					"small": "images/mini/icons_80/24.png"
				},
				"text": "Orage faible",
				"group": "rain"
			}
		},
		"obs_TRWN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/24.png",
					"small": "images/mini/icons_80/24.png"
				},
				"text": "Thundershower",
				"group": "rain"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/24.png",
					"small": "images/mini/icons_80/24.png"
				},
				"text": "Orage",
				"group": "rain"
			}
		},
		"obs_X": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/8.png",
					"small": "images/mini/icons_80/8.png"
				},
				"text": "Sky obscured",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/8.png",
					"small": "images/mini/icons_80/8.png"
				},
				"text": "Ciel obscurci",
				"group": "cloudy"
			}
		},
		"obs_XN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/8.png",
					"small": "images/mini/icons_80/8.png"
				},
				"text": "Sky obscured",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/8.png",
					"small": "images/mini/icons_80/8.png"
				},
				"text": "Ciel obscurci",
				"group": "cloudy"
			}
		},
		"obs_ZF": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/17.png",
					"small": "images/mini/icons_80/17.png"
				},
				"text": "Freezing fog",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/17.png",
					"small": "images/mini/icons_80/17.png"
				},
				"text": "Brume verglaçante",
				"group": "cloudy"
			}
		},
		"obs_ZFN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/17.png",
					"small": "images/mini/icons_80/17.png"
				},
				"text": "Freezing fog",
				"group": "cloudy"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/17.png",
					"small": "images/mini/icons_80/17.png"
				},
				"text": "Brume verglaçante",
				"group": "cloudy"
			}
		},
		"obs_ZL": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Freezing drizzle",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Bruine verglaçante",
				"group": "snow"
			}
		},
		"obs_ZL+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Heavy freezing drizzle",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Forte bruine verglaçante",
				"group": "snow"
			}
		},
		"obs_ZL+N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Heavy freezing drizzle",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Forte bruine verglaçante",
				"group": "snow"
			}
		},
		"obs_ZL-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light freezing drizzle",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible bruine verglaçante",
				"group": "snow"
			}
		},
		"obs_ZL--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light freezing drizzle",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible bruine verglaçante",
				"group": "snow"
			}
		},
		"obs_ZL--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light freezing drizzle",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible bruine verglaçante",
				"group": "snow"
			}
		},
		"obs_ZL-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light freezing drizzle",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible bruine verglaçante",
				"group": "snow"
			}
		},
		"obs_ZLN": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Freezing drizzle",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Bruine verglaçante",
				"group": "snow"
			}
		},
		"obs_ZR": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Freezing rain",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Pluie verglaçante",
				"group": "snow"
			}
		},
		"obs_ZR+": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Heavy freezing rain",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Forte pluie verglaçante",
				"group": "snow"
			}
		},
		"obs_ZR-": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light freezing rain",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible pluie verglaçante",
				"group": "snow"
			}
		},
		"obs_ZR--": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light freezing rain",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible pluie verglaçante",
				"group": "snow"
			}
		},
		"obs_ZR--N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light freezing rain",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible pluie verglaçante",
				"group": "snow"
			}
		},
		"obs_ZR-N": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Light freezing rain",
				"group": "snow"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/5.png",
					"small": "images/mini/icons_80/5.png"
				},
				"text": "Faible pluie verglaçante",
				"group": "snow"
			}
		},

		"obs_": {
			"en": {
				"path": {
					"large": "images/full/current_wxicons/27.png",
					"small": "images/mini/icons_80/27.png"
				},
				"text": " ",
				"group": "unknown"
			},
			"fr": {
				"path": {
					"large": "images/full/current_wxicons/27.png",
					"small": "images/mini/icons_80/27.png"
				},
				"text": " ",
				"group": "unknown"
			}
		}
	};
	
	Images.imageLookup.push(imageLookupObs);