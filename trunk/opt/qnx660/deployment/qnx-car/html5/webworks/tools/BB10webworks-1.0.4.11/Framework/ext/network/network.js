/**
* The abstraction layer for volume functionality
 *
 * @author mlapierre
 * $Id: network.js 4667 2012-10-19 20:15:04Z mlapierre@qnx.com $
 */

var	_pps = require('../../lib/pps/ppsUtils'),
	_controlPPS,
	_statusPPS = {},
	_interfaces = [],
	_trigger,
	IP_REGEX = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;

/**
 * Finds the first available IPv4 addresses in the interface pps object
 * @param ipAddresses {Array} The array of IP addresses
 * @returns {Object} An object containing an IP address and a netmask for for IPv4
 */
function findIPv4(ipAddresses) {
	//example input: ip_addresses:json:["fe80::a021:63ff:fef6:7fe9%en0/ffff:ffff:ffff:ffff::","10.222.99.154/255.255.240.0"]

	for (i=0; i<ipAddresses.length; i++) {
		//split the ip from the netmask
		var pieces = ipAddresses[i].split('/');
		if (pieces[0].match(IP_REGEX)) {
			//found an IPv4 ip/netmask
			return {
				ip: pieces[0],
				netmask: pieces[1]
			};
		}
	}
	
	return {ip: null, netmask: null};
}

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	/**
	 * Initializes the extension 
	 */
	init: function() {
		//controlPPS
		_controlPPS = _pps.createObject();
		_controlPPS.init();
		_controlPPS.open("/pps/services/networking/control", JNEXT.PPS_WRONLY);
		
		//hardcode some initialization data until we can read from the .all
		_interfaces.push("en0","fec0");
		
		//open status listeners for 
		for (var i=0; i<_interfaces.length; i++) {
			var iface = _interfaces[i];
			_statusPPS[iface] = _pps.createObject();
			_statusPPS[iface].init();
			_statusPPS[iface].onChange = function() {
				if (_trigger) {
					var ipNetmask = findIPv4(_statusPPS[iface].ppsObj.ip_addresses);
					_trigger({
						id: iface,
						data: {
							dhcp: (_statusPPS[iface].ppsObj.manual == 'no'),
							ip: ipNetmask.ip,
							netmask: ipNetmask.netmask,
							gateway: _statusPPS[iface].ppsObj.ip_gateway[0]
						}
					});
				}
			};
			_statusPPS[iface].open("/pps/services/networking/all/interfaces/" + iface);
		}
	},
	
	/**
	 * Sets the trigger function to call when a volume event is fired
	 * @param trigger {Function} The trigger function to call when the event is fired
	 */
	setTrigger: function(trigger) {
		_trigger = trigger;
	},
	
	/**
	 * Returns an array of available network interfaces
	 * @returns {Array} The array of available network interfaces
	 */
	getInterfaces: function() {
		var interfaces = {};
		for (var i=0; i<_interfaces.length; i++) {
			var iface = _interfaces[i];
			if (typeof _statusPPS[iface] != 'undefined' && typeof _statusPPS[iface].ppsObj == 'object'){
				var ppsObj = _statusPPS[iface].ppsObj;
				var ipNetmask = findIPv4(ppsObj.ip_addresses);
				interfaces[iface] = {
					dhcp: (ppsObj.manual == 'no'),
					ip: ipNetmask.ip,
					netmask: ipNetmask.netmask,
					gateway: ppsObj.ip_gateway[0]
				};
			}
		}
		return interfaces;
	},
	
	/**
	 * Confgure network interface parameters
	 * @param id {String} The id of a network interface as returned by get()
	 * @param params {Object} A collection of parameters to set.
	 */
	configureInterface: function(id, params) {
		if (id && _statusPPS[id]) {
			//first, disconnect
			_controlPPS.write({
				msg: 'net_disconnected',
				id: 0,
				dat: '"' + id + '"' //this is wrong and a bug in net_pps
			});
			
			setTimeout(function() {
				//then, reconnect
				if (params.dhcp) {
					//as dhcp
					_controlPPS.write({
						msg: 'net_connected',
						id: 0,
						dat: [id, { manual:"no", manual6: "off" }]
					});
				} else {
					//with static ip
					var data = { manual:"yes", manual6: "off" };
				
					if (typeof params.ip == 'string' && params.ip.match(IP_REGEX)) {
						data.ip_address = params.ip;
					}
					
					if (typeof params.netmask == 'string' && params.netmask.match(IP_REGEX)) {
						data.netmask = params.netmask;
					}
					
					if (typeof params.gateway == 'string' && params.gateway.match(IP_REGEX)) {
						data.gateway = params.gateway;
					}
					
					_controlPPS.write({
						msg: 'net_connected',
						id: 0,
						dat: [id, data]
					});
				}
			}, 2000);
		}
	}
};
