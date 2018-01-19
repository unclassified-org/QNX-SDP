#!/bin/sh

# replaces appdata on SD card with a ram disk for faster loading performance.

rm -rf /accounts/1000/appdata 
devb-ram ram capacity=65536 blk cache=0

waitfor /dev/hd1t77 5

mount -tqnx4 /dev/hd1t77 /accounts/1000/appdata
chown -R apps:1000 /accounts/1000/appdata
