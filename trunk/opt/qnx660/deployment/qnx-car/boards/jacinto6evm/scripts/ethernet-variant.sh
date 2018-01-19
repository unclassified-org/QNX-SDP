#!/bin/sh

macConfig=/var/etc/system/config/random-mac.conf;
mac=;

mount -Tio-pkt devnp-dm814x-j6.so

if_up -r60 -p dm0;
if [ $? == 0 ]; then
    echo "Network interface detected.";
    if [ ! -e $macConfig ]; then
        mac="` ifconfig dm0 | grep address | sed s/://g | cut -c10-21 `";
        echo $mac > $macConfig;
    fi
else
    echo "Network interface failed to come up"; 
fi
