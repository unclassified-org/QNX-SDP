SERVICE_usb_panda ()
{
	case "$1" in
	start)
		# USB may have already been started in the IFS
                local omap4430_waitfile ehci_waitfile
                omap4430_waitfile=/dev/io-usb/devu-omap4430-mg.so
                ehci_waitfile=/dev/io-usb/devu-ehci-omap3.so
                if ! [ -e "${omap4430_waitfile:?}" -a -e "${ehci_waitfile:?}" ]
		then
			Starting "io-usb"
                        io-usb -c -domap4430-mg ioport=0x4a0ab000,irq=124 \
                               -dehci-omap3 ioport=0x4a064c00,irq=109
			
                        WAITFOR "io-usb omap4430" "${omap4430_waitfile:?}"
                        WAITFOR "io-usb ehci" "${ehci_waitfile:?}"

		fi
		;;
	stop)
		Terminate io-usb
		;;
	esac
}

SERVICE_ethernet_panda ()
{
	: depends-on iopkt usb
	
    macConfig=/var/etc/system/config/random-mac.conf
	case "$1" in
	start)
        mac=;
        if [ -e $macConfig ]; then
            mac="`cat $macConfig`"
        else
            mac="`random-mac`";
            echo $mac > $macConfig
        fi

		OPTS="mac=$mac"
		mount -Tio-pkt -o "${OPTS?}" devn-smsc9500.so
		;;
	stop)
		for iface in `ifconfig -l`; do
		    ifconfig ${iface} destroy
		done
		;;
	esac
}

SERVICE_i2c_panda () {
	case "$1" in
	start)
        	[ -e /dev/i2c0 ] || i2c-omap35xx-omap4 -p 0x48070000 -i 88 --u0
        	[ -e /dev/i2c1 ] || i2c-omap35xx-omap4 -p 0x48072000 -i 89 --u1
        	[ -e /dev/i2c2 ] || i2c-omap35xx-omap4 -p 0x48060000 -i 93 --u2
        	[ -e /dev/i2c3 ] || i2c-omap35xx-omap4 -p 0x48350000 -i 94 --u3
        	WAITFOR "i2c" /dev/i2c0
       		WAITFOR "i2c" /dev/i2c1
       		WAITFOR "i2c" /dev/i2c2
       		WAITFOR "i2c" /dev/i2c3
		;;
	stop)
		Terminate i2c-omap35xx-omap4
		;;
	esac
}

SERVICE_audio_panda ()
{
	: depends-on i2c
	
	case "$1" in
	start)
	            #Now starting audio in IFS, so we can play early audio clip
                #io-audio -d omap4pdm clkmgnt=0
                #WAITFOR "PDM Audio Driver" /dev/snd/pcmC0D0p
                io-audio -d mcbsp-omap4
                WAITFOR "McBSP Audio Driver" /dev/snd/pcmC1D0p
                WAITFOR "mixer" /dev/snd/mixerC0D0
                mix_ctl group "Input Gain" volume=90%
                mix_ctl group "Master" volume=90%
		;;
	stop)
		Terminate io-audio
		;;
	esac
}

SERVICE_hci_panda ()
{
	case "$1" in
		start)
			devc-seromap_hci -E -f -a -n /etc/system/config/bluetooth/WL127x_2.0_SP1.bts -g0x48055000,46 -c48000000/16 0x4806c000^2,105
		;;
		stop)
			Terminate devc-seromap_hci
		;;
	esac
}

SERVICE_keyboard_panda ()
{
	case ${1} in
		start)
			keyboard-imf -U99:0 -d hdmi
			;;
		stop)
			Terminate keyboard-imf
			;;
	esac
}

SERVICE_screen_omap5uevm ()
{
    screen_omap ${1}
}

SERVICE_syslink_panda ()
{
    case ${1} in
    start ) syslink_start ;;
    stop ) syslink_stop ;;
    esac    
}

