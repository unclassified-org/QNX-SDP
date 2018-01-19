#!/bin/sh
start-calib () 
{ 
           #Run calib
           echo "Running screen-calib..."
	   calib-touch -zorder=20 -config-file=${CALIBFILE?} &
}

#This script is intended to run once/boot only, at startup
running=/dev/shmem/calib-start.run
[ -e $running ] && exit

start-calib;

touch $running
unset running

