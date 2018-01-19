#!/bin/sh

ntpdate -sb 0.pool.ntp.org 1.pool.ntp.org
rtc -s phoenix

exit 0

