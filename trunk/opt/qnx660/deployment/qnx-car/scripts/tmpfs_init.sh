#!/bin/sh

#This script is intended to run once/boot only, at startup
running=/dev/shmem/tmpfs_init.run
[ -e $running ] && exit

###########################################################
# For logging
###########################################################
chgrp -R 25 /var/log/;
chmod -R 770 /var/log/;

touch $running
unset running
