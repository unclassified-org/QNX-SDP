#!/bin/sh
macConfig=/var/etc/system/config/random-mac.conf;
mac=;

if [ -e $macConfig ]; then
    mac="`cat $macConfig`";
else
    mac="`omap4-dieid -m`";
    echo $mac > $macConfig;
fi;

OPTS="mac=$mac";

#From BSP build file and testing: need to sleep a bit after usb comes up 
# and before starting ethernet driver
# How long to wait depends on what's connected to USB. We found that 2s is
# safe given a low-grade hub with ipod, usb stick plugged in
waitfor /dev/io-usb/io-usb
sleep 2
mount -Tio-pkt -o "${OPTS?}" devn-smsc9500.so

if_up -r60 -p en0;
if [ $? == 0 ]; then
    echo "Network interface detected.";
else
    echo "Network interface failed to come up"; 
fi

