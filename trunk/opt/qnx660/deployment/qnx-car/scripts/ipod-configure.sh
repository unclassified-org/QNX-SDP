#!/bin/sh

# List of files that need modification
#/etc/mmsync_car2.conf
#/etc/mm/mm-md.conf 
#/etc/mm-player.cfg 

LIBIPOD=/base/usr/lib/libipod.so
MMSYNC_FILE=/etc/mmsync_car2.conf
MMSYNC_DISABLE="IPOD DISABLED BY DEFAULT"
MM_MD_FILE=/etc/mm/mm-md.conf
MM_MD_DISABLE="#dll=mm-mdp-ipod.so"
MM_PLAYER_FILE=/etc/mm-player.cfg
MM_PLAYER_ENABLE="mpp-ipod.so"

function usage
{
    cat << EOF
This script modifies the following files to enable/disable ipod.
/etc/mmsync_car2.conf
/etc/mm/mm-md.conf 
/etc/mm-player.cfg

Usage: $0 enable|disable

    -h                # Print this help
    -x                # DEBUG
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
option=$@

# Error Checking
if [ -z "$option" ]; then
    echo "[error]: No Option Provided." >&2
    usage >&2
    exit 1
fi

if [ "$option" != "enable" ] && [ "$option" != "disable" ]; then
    echo "[error]: Unknown Option: [$option]." >&2
    usage >&2
    exit 1
fi

if [ "$option" = "enable" ] && [ ! -f "$LIBIPOD" ] ; then
    echo "[error]: $LIBIPOD could not be found" >&2
    echo "[error]: Please make sure you have the iPod package installed"
    exit 1
fi

mount -uw /base

#backup file
if [ ! -f "$MMSYNC_FILE".bkp ]; then
    echo "Backing up $MMSYNC_FILE ..."
    cp "$MMSYNC_FILE" "$MMSYNC_FILE".bkp
fi
if [ ! -f "$MM_MD_FILE".bkp ]; then
    echo "Backing up $MM_MD_FILE ..."
    cp "$MM_MD_FILE" "$MM_MD_FILE".bkp
fi
if [ ! -f "$MM_PLAYER_FILE".bkp ]; then
    echo "Backing up $MM_PLAYER_FILE ..."
    cp "$MM_PLAYER_FILE" "$MM_PLAYER_FILE".bkp
fi

#mmsync_car2.conf
if  grep -q "$MMSYNC_DISABLE" "$MMSYNC_FILE"  && [ "$option" = "enable" ]; then
    #enable ipod
    sed -i '/<!--    IPOD DISABLED BY DEFAULT.*/{
            N
            N
            N
            N
            s/<!--    IPOD DISABLED BY DEFAULT.*\n\(.*\n.*\n.*\n\)-->.*/\1/
	}' $MMSYNC_FILE
elif ! grep -q "$MMSYNC_DISABLE" "$MMSYNC_FILE" && [ "$option" = "disable" ]; then
    #disable ipod
    sed -i '/.*<dll name="mss-ipodgeneric.so"\/>/{
	    N
	    N
	    N
	    s/\(.*<dll name="mss-ipodgeneric.so"\/>\n.*\n.*\)\n/<!--    IPOD DISABLED BY DEFAULT - USE ipod-configure.sh TO ENABLE\n\1\n-->/
	}' $MMSYNC_FILE
else 
    echo "[warning]: mmsync_car2.conf: Ipod Already "$option"d." >&2
fi 

#mm-md.conf
if  grep -q "$MM_MD_DISABLE" "$MM_MD_FILE"  && [ "$option" = "enable" ]; then
    #enable ipod
    sed -i '/#\[plugin\]/{
            N
            N
            s/#\[plugin\]\n#dll=mm-mdp-ipod.so/\[plugin\]\ndll=mm-mdp-ipod.so/
	}' $MM_MD_FILE
elif ! grep -q "$MM_MD_DISABLE" "$MM_MD_FILE" && [ "$option" = "disable" ]; then
    #disable ipod
    sed -i '/\[plugin\]/{
	    N
	    N
	    s/\[plugin\]\ndll=mm-mdp-ipod.so/#\[plugin\]\n#dll=mm-mdp-ipod.so/
	}' $MM_MD_FILE
else 
    echo "[warning]: mm-md.conf: Ipod Already "$option"d." >&2
fi 

#mm-player.cfg
if ! grep -q "$MM_PLAYER_ENABLE" "$MM_PLAYER_FILE"  && [ "$option" = "enable" ]; then
    #enable ipod
    sed -i '/"mpp-avrcp.so":{/{
            N
            N
            s/\(.*\n.*\n.*\)/\1,\n        "mpp-ipod.so":{\n            "mode":"player"\n        }/
	}' $MM_PLAYER_FILE
elif grep -q "$MM_PLAYER_ENABLE" "$MM_PLAYER_FILE" && [ "$option" = "disable" ]; then
    #disable ipod
    sed -i '/"mpp-avrcp.so":{/{
	    N
	    N
            N
            N
            N
	    s/\(.*\n.*\n\).*\n.*\n.*\n/\1/
	}' $MM_PLAYER_FILE
else 
    echo "[warning]: mm-player.cfg: Ipod Already "$option"d." >&2
fi 

#all done
mount -ur /base
echo "Please run \"reboot\" now to $option ipod."
