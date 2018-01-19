#!/bin/sh
logger ifdepart.sh launched

if [[ "pan0" = $1 ]]; then
    opts="-t PAN"  
	dhcpsz=$(pidin a | grep dhcp.client | grep $1)
	if [[ -n $dhcpsz ]]; then
		#remove anything but the first group of digits, i.e. process ID
		procid=${dhcpsz%${dhcpsz#*(?)+([0-9]) }}
		if [[ -n $procid ]]; then
			slay $procid
			logger $opts "Found <$dhcpsz> | procid is $procid | slay returned $?"
		else
			logger $opts "Found <$dhcpsz>, but procid is empty!"
		fi
	else
		logger $opts "PAN dhcp.client not running!"
	fi	
fi