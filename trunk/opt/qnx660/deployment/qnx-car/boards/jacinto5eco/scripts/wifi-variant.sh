FIRMWARE_PATH=/lib/firmware/ti1283/

cat /var/etc/services-enabled | grep -q "WIFI:true"
if [ $? -ne 0 ]; then
    echo "warning: WIFI is diabled." >&2
    exit 0
fi


for file in firmware.bin tiwlan.bin.mcp3 nvs_map.bin; do
    if [ ! -e "$FIRMWARE_PATH/$file" ]; then
        echo "Wifi not started because of missing file: [$FIRMWARE_PATH/$file]" >&2
        exit 1
    fi

done

mount -T io-pkt -o gpio=8,irq_gpio=163,irq=931 devnp-ti1283-j5.so 
waitfor /dev/tiw_sta_ctrl;
wpa_supplicant_ti  -Dwilink -itiw_sta0 -C /var/run/wpa_supplicant &
waitfor /var/run/wpa_supplicant/tiw_sta0;
wpa_pps -c /var/etc/wpa_pps.conf -j tiw_sap0 -h /usr/sbin/hostapd_ti -i tiw_sta0 &
tetherman &

# A temp workaround. Valid fix to come.
echo default_interface4::dm0 >> /pps/services/networking/status_public 
