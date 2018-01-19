#!/bin/sh

#This script is intended to run once/boot only, at startup
running=/dev/shmem/qdb_init.run
[ -e $running ] && exit

###########################################################
# For databases
###########################################################
cp /var/tmp/db/*.sql /fs/tmpfs/db
cp /var/tmp/db/*.db /fs/tmpfs/db

touch $running
unset running
