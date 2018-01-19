#!/bin/sh
car_pps_init () 
{ 
    local dir file x;
    # OpenGL Navigator creates this server object (our html nav doesn't). Something in sapphire service needs it , so we clear it here to emulate the server not being up (TODO: fix this).
    rm -f /pps/system/navigator/control

    #Remove some directories so mm-renderer always has a clean startup environment
    rm -Rf /pps/services/multimedia/renderer/context;
    rm -Rf /pps/services/multimedia/renderer/component;

    #These directories will be created iff they don't already exist.
    for dir in services services/authentication services/clock services/input services/launcher \
    services/multimedia services/multimedia/sync services/networking services/power services/power/shutdown system system/development system/keyboard \
    system/installer system/installer/coreos system/installer/upd system/installer/upd/current system/navigator system/nvram system/power system/power/dev \
    system/power/dev/bus system/power/funcstatus services/mm-control services/mm-detect;
    do
        x="${PPSDIR?}/${dir:?}";
        [ -d "${x:?}" ] || mkdir "${x:?}" || return;
    done;
    unset dir || :;

    #JR: 430001
    chmod g+w ${PPSDIR?}/services/input;

    #These directories will be cleaned out
    for dir in services/mm-control;
    do
        x="${PPSDIR?}/${dir:?}";
        rm -rf $x/*;
    done;
    unset dir || :;

    #These objects will be created iff they don't exist
    for file in services/clock/status services/networking/proxy services/networking/status system/nvram/deviceinfo \
    system/power/funcstatus/user_activity services/mm-detect/status;
    do
        x="${PPSDIR?}/${file:?}";
        [ -f "${x:?}" ] || : >> "${x:?}";
    done;
    
    # For HMI eb-navigation
    #These objects will be created, or if they exist, all attributes cleaned out.
    for file in system/navigator/windowgroup qnxcar/navigation/control qnxcar/navigation/status?nopersist;
    do
        x="${PPSDIR?}/${file:?}";
        : > "${x:?}";
    done;
    #PR: 203848
    chmod -R a+rwx ${PPSDIR?}/qnxcar/navigation;
    chmod a+rwx ${PPSDIR?}/qnxcar/navigation/control;
    chmod a+rwx ${PPSDIR?}/qnxcar/navigation/status;
    file=${PPSDIR?}/qnxcar/navigation/status;
    cat > "${file:?}"  <<EOF
navigating:b:false
total_distance_remaining:n:0
total_time_remaining:n:0
destination:json:null
maneuvers:json:null
EOF
   
    file=${PPSDIR?}/services/networking/status_public;
    cat > "${file:?}"  <<EOF
default_gateway:json:["0.0.0.0"]
default_interface::en0
httpproxyloginrequired:b:false
wifi_ip_ok::yes
wifi_power::on
EOF

    echo '[n]dev_mode_enabled:b:false' >> "${PPSDIR:?}/system/development/devmode";
    unset file || :
}

#This script is intended to run once/boot only, at startup
running=/dev/shmem/setup-pps.run
[ -e $running ] && exit

: ${PPSDIR="/pps"};
ppspdir="/var/pps";
/proc/boot/waitfor "${PPSDIR:?}" 90;
if [ -n "${OS_VERSION+set}" ]; then
     "${BASEFS?}/scripts/startup-support/migrate_pps.sh" "${OS_VERSION?}";
fi;
car_pps_init

touch $running
unset running
