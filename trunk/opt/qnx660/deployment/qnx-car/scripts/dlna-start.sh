#!/bin/sh

if cat /var/etc/services-enabled | grep -q "DLNA:true"; then
    #This script is intended to run once/boot only, at startup
    running=/dev/shmem/dlna-start.run
    [ -e $running ] && exit

	on -d /usr/sbin/dmr > "${LOGDIR}/dmr.log" 2>&1;
    on -d /usr/sbin/dmc -P -l > "${LOGDIR}/dmc.log" 2>&1;
    
    
    touch $running
    unset running    
fi
