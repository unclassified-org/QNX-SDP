#!/bin/sh

#This script is intended to run once/boot only, at startup
running=/dev/shmem/navigation-start.run
[ -e $running ] && exit

# Ensure Navigation is to start
navigationBinary="/usr/bin/navigation-sample"

isNavigationTrue=`grep "NAVIGATION:true" /var/etc/services-enabled`
if [ ! -z "$isNavigationTrue" ]; then
    $navigationBinary
    navigationReturnCode=$?
    if [ $navigationReturnCode -ne 0 ]; then
        echo "[error]: Unable to execute: [$navigationBinary]" >&2
    else
        touch $running
    fi
fi

exit $navigationReturnCode
