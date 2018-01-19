: ${BASEFS=/base}

debug-init ()
{
            [ -x /proc/boot/.start-secondary-disks ] && /proc/boot/.start-secondary-disks
 
            ln -Ps $BASEFS/bin /bin
            ln -Ps $BASEFS/sbin /sbin
            ln -Ps $BASEFS/lib /lib;
            ln -Ps $BASEFS/usr /usr;
            ln -Ps $BASEFS/opt /opt;
            ln -Ps $BASEFS/etc /etc;
            ln -Ps $BASEFS/scripts /scripts
            ln -Ps /var/etc/id $BASEFS/etc/id;
            ln -Ps /var/etc/dhcpd_urndis.leases $BASEFS/etc/dhcpd_urndis.leases;
            ln -Ps /var/etc/dhcpd_usbdnet.leases $BASEFS/etc/dhcpd_usbdnet.leases;
            ln -Ps /var/etc/wpa_supplicant.conf $BASEFS/etc/wpa_supplicant.conf;
            ln -Ps /var/etc/system/config/debug_host.conf $BASEFS/etc/system/config/debug_host.conf;
            ln -Ps /var/etc/system/config/calib.localhost $BASEFS/etc/system/config/calib.localhost;
            ln -Ps /var/etc/ssh $BASEFS/etc/ssh
            ln -Ps /var/etc/www $BASEFS/etc/www
            ln -Ps /var/tmp /tmp
}

if waitfor "$BASEFS/scripts/env.sh" 10
then
    echo "sourcing env.sh"
    . $BASEFS/scripts/env.sh

    if [ -e /var/swud/swu_persist.manifest ]
    then
        waitfor /dev/screen 10
        waitfor /pps/services/update/target 10

        #In some cases (e.g. omap5's emmc-sata configuration), this script needs 
        #to be called to ensure all required partitions for SWU are available.
        #It is normally called by SLM after the HMI is loaded because these partitions
        #or disks are not needed for 'normal' operation.
        if [ -e /proc/boot/.start-secondary-disks ]
        then
           echo "Starting secondary disks"
	   /proc/boot/.start-secondary-disks
        fi

        echo "Continuing self-update"
        /base/usr/sbin/swud -i swud_car2.1 -vvvvvv -m /base/lib/dll/swud-self-update-hmi.so=QNX,CAR2.1 -m /base/lib/dll/rb_self_update.so=delta=/var/swud/mydelta.mld,temp=/var/swud/updAgentTmp,persist=/var/swud/swu_persist.manifest -m /base/lib/dll/swud-client-config.so -m /base/lib/dll/swud-simple-self-update.so=/var/swud/swu_persist.manifest
        if [ $? -ne 0 ]
        then
            echo "Error launching swud.  Can't continue self-update"
        fi
    else
        waitfor /base/etc/slm-config-all.xml 10
        print "Starting SLM..."
        /proc/boot/timestamp "LAUNCHING SLM" &
        slm -p10 -scar2-init -C -T10000 -x none -r none -vvvvv -V /base/etc/slm-config-all.xml > /dev/shmem/slm-output.log 2>&1

	slmRes=$?
        if [ $slmRes -ne 0 ]
        then
            echo ""
            echo "*** SLM exited with $slmRes, start basic init for debug..."
            echo ""
            debug-init;
        fi
    fi
fi

