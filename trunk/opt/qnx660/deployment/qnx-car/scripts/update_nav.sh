#!/bin/sh
update_navmenu () 
{ 
    local ppsmenu_file newmenu_dir newmenu_file;
    ppsmenu_file=/pps/system/navigator/applications/applications;
    newmenu_dir=/appinfo/menuentry/;
    set --;
    for newmenu_file in "${newmenu_dir:?}"/*;
    do
        [ -f "${newmenu_file:?}" ] || continue;
        cat "${newmenu_file:?}" >> "${ppsmenu_file}" || Fatal "couldn't add menu entry to PPS";
        set -- "$@" "${newmenu_file:?}";
    done;
    fsync "${ppsmenu_file}" || Fatal "couldn't fsync PPS menu";
    [ "$#" -eq 0 ] || rm -f "$@" || Fatal "couldn't remove appinfo menu entries"
}

preactivate_bars () 
{ 
    local ppstrans_dir newtrans_dir classification;
    ppstrans_dir=/pps/system/installer/upd/deferred/0/;
    newtrans_dir=${BASEFS?}/appinfo/inst-trans/;
    for classification in mandatory optional;
    do
        local appinfo appname;
        for appinfo in "${newtrans_dir:?}/${classification:?}"/*;
        do
            [ -f "${appinfo:?}" ] || continue;
            appname=${appinfo##*/};
            cat "${appinfo:?}" > "${ppstrans_dir:?}${appname:?}" || Fatal "couldn't add install transaction to PPS";
            rm -f "${appinfo:?}" || Fatal "couldn't remove app preactivation info";
        done;
    done
}


#This script is intended to run once/boot only, at startup
running=/dev/shmem/update-nav-start.run
[ -e $running ] && exit

    update_navmenu;

    preactivate_bars;

touch $running
unset running


