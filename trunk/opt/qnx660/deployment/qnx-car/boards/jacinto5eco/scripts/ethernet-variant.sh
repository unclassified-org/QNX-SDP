#!/bin/sh
macConfig=/var/etc/system/config/random-mac.conf;
mac=;

if [ -e $macConfig ]; then
    mac="`cat $macConfig`";
else
    mac="`random-mac`";
    echo $mac > $macConfig;
fi;

OPTS="mac=$mac";
mount -Tio-pkt -o "${OPTS?}" devnp-dm814x-eco.so 

if_up -r60 -p dm0;
if [ $? == 0 ]; then
    echo "Network interface detected.";
else
    echo "Network interface failed to come up"; 
fi

