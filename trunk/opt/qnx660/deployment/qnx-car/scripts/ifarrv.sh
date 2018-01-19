#!/bin/sh

if [[ "pan0" = $1 ]]; then
    opts="-t PAN"  
	#get the local BDADDR
	btsz=$(cat /pps/services/bluetooth/settings | grep btaddr )
	#echo $btsz shows btaddr::XX:XX:XX:XX:XX:XX
	#delete "btaddr::", i.e. the shortest match of anything followed by two colons
	bdaddr=${btsz#*::}
	
	#get the current MAC
	btsz=$(ifconfig $1 | grep address)
	#echo $btzs shows  address: f2:0b:a4:65:eb:08
	#delete "address: ", i.e. the shortest match of anything followed by one colon followed by space
	oldmac=${btsz#*: }

	logger $opts "Local BDADDR is $bdaddr | Old MAC is $oldmac"
	
	#set the new MAC to match the BDADDR
	ifconfig $1 link $bdaddr active
	logger $opts "New MAC setting returned $?"
	logger $opts $(ifconfig $1)
	
	#remove the old MAC
	ifconfig $1 link $oldmac delete
	logger $opts "Old MAC removal returned $?"
	logger $opts $(ifconfig $1)
	
	#launch dhcp.client
	dhcp.client -i$1 -b
	logger $opts "dhcp.client -i$1 -b" returned $?
	#wait for the UP flag
	if_up -alr 10 $1
	logger $opts "$1 is up now"
	logger $opts $(arp -van)
	#get some traffic going now
	#ping -c 10 -B $1 8.8.8.8
	#logger $opts $(arp -van)
fi