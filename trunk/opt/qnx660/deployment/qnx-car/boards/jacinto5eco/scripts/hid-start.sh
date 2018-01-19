#!/bin/sh
start-hid () 
{ 
    local screenOpts h w;
    screenOpts=$(grep options /base/etc/system/config/graphics.conf)
    h=$(print $screenOpts | sed -n -r s/.*height=\([0-9]*\).*/\\1/p)
    w=$(print $screenOpts | sed -n -r s/.*width=\([0-9]*\).*/\\1/p)
 
    print "Starting devi-hid with width: $w and height: $h";

    devi-mxt224 -P -r -R$w,$h touch;
}

#This script is intended to run once/boot only, at startup
running=/dev/shmem/hid-start.run
[ -e $running ] && exit

start-hid;

touch $running
unset running

