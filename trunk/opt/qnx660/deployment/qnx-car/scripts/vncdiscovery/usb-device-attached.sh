#!/bin/sh
# Set the sandbox for this script
export SOCK=/mirrorlink_sandbox/

vendorid=$1
productid=$2
bus=$(($3))
device=$(($4))

pps_object=/pps/services/vnc/discovery/usb/$productid?nopersist

# request IP address from device
dhcp.client -a -n -R &
dhcp_pid=$!

trap "rm $pps_object; slay -f $dhcp_pid; exit" SIGINT SIGTERM

# notify discoverer
mkdir -p /pps/services/vnc/discovery/usb
echo \
"
type::USB
vid::$vendorid
pid::$productid
bus::$bus
dev::$device
" > $pps_object

# sleep until the signal comes from usblauncher
while true; do
sleep 1
done
