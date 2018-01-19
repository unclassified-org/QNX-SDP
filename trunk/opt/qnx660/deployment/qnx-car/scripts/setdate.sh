#!/bin/sh
#
# sets the date using ntpdate and then writes it to rtc
#
. /scripts/env.sh


# =======================
# Append a boot-time entry to the boot metrics to assosciate date and CPU ticks.
# =======================
function set_date_boot_metric
{
    timestamp "SET DATE" &
    cat << EOF >> /dev/shmem/boot_metrics.log
(sw) CAR_BOOT_METRICS: (SYSTEM SECONDS) at `date -t`
(sw) CAR_BOOT_METRICS: (SYSTEM DATE) at `date`
EOF
    return 0
}

running=/dev/shmem/setdate-start.run
[ -e $running ] && exit 0


CURDATE=`date -t`
SYSDATE=1351742532 # Nov 1st, 2012

if [ $CURDATE -lt $SYSDATE ]; then
	# Ensure the network is up and configured before attempting to
	# set the date.
	if [ ! `if_up -r1 en0` ]; then
		if [ -e ${BASEFS?}/scripts/settime-variant.sh ]; then
    			${BASEFS?}/scripts/settime-variant.sh
    			print "System date and rtc have been set."
		else
    			print "settime-variant.sh: missing mount of board-specific time setting script in ${BASEFS?}/scripts/settime-variant.sh"
		fi
    else
		print "Cannot adjust the time, the network is unreachable"
	fi
else
	print "Date has already been set. Skip time setting."
fi

set_date_boot_metric
exit $?
