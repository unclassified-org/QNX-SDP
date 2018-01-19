#!/bin/sh

# print_usage - Print a usage message for the current script.
print_usage()
{
    echo "usage: ${0##*/} interface [ up | down ]"
}

# Ensure that the script was provided the correct number of arguments.
if [ $# -ne 2 ]; then
    echo "${0##*/}: wrong number of arguments"
    print_usage
    exit 1
fi

iface=${1}
action=${2:-"up"}
NETCFG=${NETWORKCFG:-"/var/etc/system/config/network"}

# netconfig - Bring up or bring down the specified network interface.
#
# When the @action is 'up', this will bring up the network interface
# specified as the first argument. The interface configuration can be
# specified by a run control named
# /etc/system/config/net/${iface}.conf.
#
# When the @action is 'down', this will disconnect the specified
# network interface (if the interface is connected).
#
# @iface: The network interface name. This is expected to be a valid
#	network interface name.
#
# @action: The action to perform on the specified network
# 	interface. If this argument is omitted, the default behaviour
# 	is to bring up the interface.
netconfig ()
{
    case "${action}" in
	down)
 	    (exec 3<>/pps/services/networking/control && cat >&3 && cat <&3)<<EOF
msg::net_disconnected
id::0
dat::"$iface"
EOF
	    ;;
	up)
	    # Request and IP via DHCP by default.
	    if [ -e ${NETCFG}/${iface}.conf ]; then
		while read line
		do
		    # First trim comments and white space from the line.
		    cfg=$(echo "${line}" | cut -d "#" -f1 | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
		    # Ignore lines that contain only comments.
		    if [ ! -z "${cfg}" ]; then
			key=$(echo "${cfg}" | cut -d "=" -f1)
			value=$(echo "${cfg}" | cut -d "=" -f2)
			case "$value" in
				\[*\])
					# Got a list, don't change the value.
				;;
				*)
					# Got a value, quote it.
					value="\"$value\""
				;;
			esac
			if [ -z "${args}" ]; then
			    args="\"${key}\":${value}"
			else
			    args="${args},\"${key}\":${value}"
			fi
		    fi
		done < ${NETCFG}/${iface}.conf
	    fi

	    if [ -z "${args}" ]; then
		dat="\"${iface}\""
	    else
		dat="[\"${iface}\",{${args}}]"
	    fi
 	    (exec 3<>/pps/services/networking/control && cat >&3 && cat <&3)<<EOF
msg::net_connected
id::0
dat::${dat}
EOF
	    ;;
    esac
}

# Test for the existence of the specified interface.
ifconfig ${iface} >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "${0##*/}: Invalid network interface -- ${iface}"
    print_usage
    exit 1
fi

# If we get here, the interface is valid, so let's try to bring it up
# or take it down.
netconfig ${iface} ${action}
