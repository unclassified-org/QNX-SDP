#!/bin/sh

# List of files that need modification
FILE_LIST="
/base/scripts/hid-start.sh
/base/scripts/apkruntime-start.sh
/etc/system/config/display.conf
/etc/system/config/graphics.conf
/etc/system/config/scaling.conf
/etc/system/config/launcher.cfg
/base/usr/share/webplatform/apps/eb_navigation/ebnav.conf
/apps/common/js/tablist.json
/apps/sys.apkruntime.gYABgKAOw1czN6neiAT72SGO.ns/native/init.cfg
"
RESOLUTION_FILE=/etc/system/config/resolution
CALIBRATION_FILE=/var/etc/system/config/calib.localhost
THEMES_BACKUP=/etc/system/config/resolution.themes
WALLPAPER=/usr/share/images/car-startup.png
WALLPAPER_480p=/usr/share/images/car-startup480p.png
WALLPAPER_720P=/usr/share/images/car-startup720p.png

function usage
{
    # Get the current resolution
    if [ -e $RESOLUTION_FILE ]; then
        currentResolution=`cat $RESOLUTION_FILE`
    else
        currentResolution="480p"
    fi

    cat << EOF
#
# Get build artifacts from Jenkins.
# The default is to get all architectures and variants available in the latest build.

Usage: $0 720p|480p

    -h                # Print this help
    -x                # DEBUG

Current Resolution: $currentResolution
EOF
}

while getopts hx opt  2> /dev/null; do
    case $opt in
    h) usage; exit 0 ;;
    x) set -x ;;
    ?) usage >&2; exit 1 ;;
    esac
done
shift $((OPTIND-1))
OPTIND=0
resolution=$@

# Error Checking
if [ -z "$resolution" ]; then
    echo "[error]: No Resolution Provided." >&2
    usage >&2
    exit 1
fi

if [ "$resolution" != "720p" ] && [ "$resolution" != "480p" ]; then
    echo "[error]: Unknown Resolution: [$resolution]." >&2
    usage >&2
    exit 1
fi

#Check that the graphics.conf is a link to the filesystem that can be modified
#/proc/boot/graphics.conf should link to /etc/system/config/graphics.conf but in some fastboot 
#configurations it is stored in the IFS and is read-only
if [ ! -h /proc/boot/graphics.conf ]; then
    echo "ERROR: Graphics configuration /proc/boot/graphics.conf is part of the IFS and cannot be modified"
    exit 1;
fi

# Backup the files
if [ -e $RESOLUTION_FILE ]; then
    currentResolution=`cat $RESOLUTION_FILE`
    if [ "$currentResolution" = "$resolution" ]; then
        echo "[error]: Already running at $resolution." >&2
        echo "         Please ensure you've rebooted the device after setting the resolution." >&2
        exit 1
    fi
else
    mount -uw /base
    echo "480p" > $RESOLUTION_FILE
    for file in $FILE_LIST; do
        [ ! -e "$file.480p" ] && cp -f $file $file.480p
        [ ! -e "$file.720p" ] && cp -f $file $file.720p
    done

    # Wallpaper (create a copy of the 800x480 wallpaper, which is named $WALLPAPER)
    if [ ! -e $WALLPAPER_480p ]; then
        cp -f $WALLPAPER $WALLPAPER_480p
    fi

    # Themes
    cp /pps/qnxcar/themes $THEMES_BACKUP.480p
    echo "-titanium" >> /pps/qnxcar/themes
    cp /pps/qnxcar/themes $THEMES_BACKUP.720p

    #Modify the files
    sed -i 's/R800,480/R1280,720/g' /base/scripts/hid-start.sh.720p

    #Graphics.conf
    sed -i 's/video-mode = 800 x 480 @ 60/video-mode = 1280 x 720 @ 60/g' /etc/system/config/graphics.conf.720p
    sed -i 's/options = height=480,width=800,poll=1000/options = height=720,width=1280,poll=1000/g' /etc/system/config/graphics.conf.720p

    #Scaling.conf
    sed -i 's/800x480:mode=direct/1280x720:mode=direct/g' /etc/system/config/scaling.conf.720p

    #Display.conf
    sed -i 's/xres=800/xres=1280/g' /etc/system/config/display.conf.720p
    sed -i 's/yres=480/yres=720/g' /etc/system/config/display.conf.720p

    #EBNav.conf
    sed -i 's/"width":800,/"width":1280,/g' /base/usr/share/webplatform/apps/eb_navigation/ebnav.conf.720p
    sed -i 's/"height":395/"height":632/g' /base/usr/share/webplatform/apps/eb_navigation/ebnav.conf.720p

    # tablist.json
    sed -i -e '/"id": "carcontrol"/ {n; s/local_oop/local/g}'    /apps/common/js/tablist.json.720p
    sed -i -e '/"id": "Communication"/ {n; s/local_oop/local/g}' /apps/common/js/tablist.json.720p

    # launcher.cfg - change mlink-viewer resolution and enable reduced resolution mode
    sed -i 's/-h 395/-h 576 -R/' /etc/system/config/launcher.cfg.720p
    
    # APK runtime
    sed -i 's/,WIDTH=800,HEIGHT=395/,WIDTH=1280,HEIGHT=584/g' /base/scripts/apkruntime-start.sh.720p
    sed -i 's/car.keyboard.height 130/car.keyboard.height 220/g' /apps/sys.apkruntime.gYABgKAOw1czN6neiAT72SGO.ns/native/init.cfg.720p
fi

# Link files to the proper resolution
mount -uw /base
for file in $FILE_LIST; do
    if [ -e "$file.$resolution" ]; then
        rm -f $file
        cp $file.$resolution $file
    else
        echo "[warning]: No [$file.$resolution] file found." >&2
    fi
done

# Wallpaper (if 720p, copy 1280x720 wallpaper to $WALLPAPER, otherwise copy 800x480 wallpaper)
if [ "$resolution" = "720p" ]; then	# 720p (1280x720)
    cp -f $WALLPAPER_720P $WALLPAPER
else					# Default (800x480)
    cp -f $WALLPAPER_480p $WALLPAPER
fi

# Set the theme
cat $THEMES_BACKUP.$resolution > /pps/qnxcar/themes

# TODO Remove this check when Titanium is supported in 720p (if ever)
# In the meantime we must switch to Default theme becasue Titanium isn't supported in 720p mode
currentTheme=$(cat /pps/qnxcar/profile/theme | grep theme::)
if [ "$resolution" = "720p" ] && [ "$currentTheme" = "theme::titanium" ]; then
    echo "theme::default" >> /pps/qnxcar/profile/theme
fi

# Remove calibration
rm $CALIBRATION_FILE 2> /dev/null

# Set the resolution
echo "$resolution" > $RESOLUTION_FILE

# All Done
mount -ur /base
echo "Please run \"reboot\" now to enter $resolution mode."
