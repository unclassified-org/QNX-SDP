#!/bin/sh

# The option usbdnet_mac assigns the specified MAC address to the Host side
# The option mac assigns the specified MAC address on the device side
# Both have the locally admin bit
echo "usblauncher role switch - starting startncm.sh script (/sd/usblauncher/etc/startncm.sh)"

echo "Mounting NCM driver"
mount -Tio-pkt -o verbose=0,path=/dev/otg/io-usb-dcd,iface_num=1,protocol=ncm,usbdnet_mac=000022446688,mac=020022446688,name=${CARPLAY_IFACE_NAME} devnp-usbdnet.so