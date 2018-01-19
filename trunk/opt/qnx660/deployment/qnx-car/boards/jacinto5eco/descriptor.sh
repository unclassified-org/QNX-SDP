SERVICE_usb_jacinto5eco ()
{
	case "$1" in
	start)
		# USB may have already been started in the IFS
		local waitfile
		waitfile=/dev/io-usb/devu-dm816x-mg.so
		if ! [ -e "${waitfile:?}" ]
		then
			Starting "io-usb"
	                io-usb -c -v -d dm816x-mg ioport=0x47401400,irq=18
			WAITFOR "io-usb" "${waitfile:?}"
		fi
		;;
	stop)
		Terminate io-usb
		;;
	esac
}

SERVICE_ethernet_jacinto5eco ()
{
	: depends-on iopkt usb
	
	case "$1" in
	start)
		mount -Tio-pkt devn-asix.so
		;;
	stop)
		ifconfig en0 destroy
		;;
	esac
}

SERVICE_hci_jacinto5eco ()
{
	case "$1" in
		start)
			devc-seromap_hci -E -f -a -n /etc/system/config/bluetooth/j5_slave_mo2.bts  -c48000000/16 0x481A6000^2,44
		;;
		stop)
			Terminate devc-seromap_hci
		;;
	esac
}

SERVICE_i2c_jacinto5eco () {
        case "$1" in
        start)
                [ -e /dev/i2c0 ] || i2c-omap35xx-j5 -i 70 -p0x48028000 --u0
                [ -e /dev/i2c1 ] || i2c-omap35xx-j5 -i 71 -p0x4802a000 --u1
                [ -e /dev/i2c2 ] || i2c-omap35xx-j5 -i 30 -p0x4819c000 --u2
                [ -e /dev/i2c3 ] || i2c-omap35xx-j5 -i 31 -p0x4819e000 --u3
                WAITFOR "i2c" /dev/i2c0
                WAITFOR "i2c" /dev/i2c1
                WAITFOR "i2c" /dev/i2c2
                WAITFOR "i2c" /dev/i2c3
#               [ -e /dev/i2c0 ] || i2c-omap35xx-j5 -i 70 -p0x48028000 --u0
#               [ -e /dev/i2c2 ] || i2c-omap35xx-j5 -i 30 -p0x4819C000 --u2
#               WAITFOR "i2c" /dev/i2c0
#               WAITFOR "i2c" /dev/i2c2
                ;;
        stop)
                Terminate i2c-omap35xx-j5
                ;;
        esac
}

SERVICE_audio_jacinto5eco ()
{
	: depends-on i2c
	
	case "$1" in
	start)
		## For Mistral
	        #io-audio -vv -d mcasp-j5_aic3106 mcasp=2
	        ## For Spectrum Digital B Board, use hxclk_io=1
	        io-audio -d mcasp-j5_aic3106 mcasp=2,hxclk_io=1
		WAITFOR "io-audio" /dev/snd/pcmC0D0p
		;;
	stop)
		Terminate io-audio
		;;
	esac
}

SERVICE_mixer_jacinto5eco ()
{
        : depends-on pps audio
        mixer_common "$1" "-m h=PCM -m s=PCM" 
}

SERVICE_hid_jacinto5eco ()
{
	case ${1} in
		start)
			io-hid -dusb -dmicrotouch noinit
			WAITFOR "io-hid" /dev/io-hid/devh-usb.so
			local calib;
			calib=/var/etc/system/config/calib.localhost;
			if [ -e $calib ]; then
				devi-mxt224 -PrR800,480 touch -r abs -f$calib;
			else
				devi-mxt224 -PrR800,480 touch -r abs;
			fi;
			WAITFOR "devi-mxt224" /dev/devi
		;;
		stop)
			Terminate io-hid
			Terminate devi-mxt224
		;;
	esac
}

SERVICE_calib_jacinto5eco ()
{
    : depends-on screen
    case "$1" in
        start)
           local calib;
           calib=/var/etc/system/config/calib.localhost;

           if [ -e $calib ]; then
                return 0;
           fi
           ln -Psf /base/etc /etc
           screen-calib -i 0 -bc -f$calib 
        ;;
        stop)
           Teminate screen-calib;
        ;;
     esac
}

SERVICE_wallpaper_jacinto5eco ()
{
    : depends-on screen
    add_proc_link "${BASEFS?}/etc/system/config/img.conf" "/etc/system/config/img.conf"
    case "$1" in
    start)
        LD_LIBRARY_PATH="${BASEFS?}/lib/dll:${BASEFS?}/lib:${BASEFS?}/usr/lib:${LD_LIBRARY_PATH?}" wallpaper_car2 -wallpaper="${BASEFS?}/usr/share/images/car-startup.png" -display=internal &
        ;;   
    stop)
        Terminate wallpaper_car2
        ;;   
    esac 
}

SERVICE_keyboard_jacinto5eco ()
{
	case ${1} in
		start)
			keyboard-imf -U99:0 -d internal
			;;
		stop)
			Terminate keyboard-imf
			;;
	esac
}

SERVICE_gears_jacinto5eco ()
{
	: depends-on screen pps
	case "$1" in
	start)
		gles2-gears-pps -display=0&
		;;
	stop)
		Terminate gles2-gears-pps
		;;
	esac
}

SERVICE_tisyslink_jacinto5eco ()
{
	prcm_qnx
	if [ $RUN_RADIO -eq 0 ]; then
		syslink_drv
		#firmware_loader_g 1 /usr/bin/dm814x_hdvicp.xem3 start &
	else
		syslink_drv
		#firmware_loader_g 0 /usr/bin/jive_dsp_app_elf.out start &
		#syslink_drv.radio
	fi	
}

SERVICE_radio_jacinto5eco ()
{
    case ${1} in 
        start)
		mq
		RadioApp -h PPS -p 0 & sleep 1
		sleep 2
        ;;
        stop)
			Terminate RadioApp
            Terminate mq 
        ;;
    esac
}

SERVICE_wifi_jacinto5eco ()
{
        : depends-on iopkt      

        case "$1" in
        start)
                mount -Tio-pkt -ofirmdir=/etc/system/config/wifi/ devnp-ti1283-j5.so
                ifconfig ti0 up
                wpa_supplicant -B -Dwext -iti0 -c/etc/system/config/wifi/wpa_supplicant.conf >/dev/null 2>&1 &
                ;;
        stop)
                Terminate wpa_supplicant
                ifconfig ti0 destroy      
                ;;
        esac
}

# Don't start mmrenderer with user 520. This causes the TI syslink stuff to stop working
# TODO: check if there is a problem introduced by doing this, then research a proper fix
# to allow user 520 to work.
mmrenderer_start ()
{
        WAITFOR "/pps/services/audio/devices" /pps/services/audio/devices
    # These directories cannot exist when starting renderer
    rm -Rf /pps/services/multimedia/renderer/context
    rm -Rf /pps/services/multimedia/renderer/component
    # mm-renderer is used for webkit HTML5 media support
    #on -d mm-renderer -c 
	
	#In GR2_0_0 libc.so.3,using atexit in a shared library is considered an error and the libc will call abort
	#However,TI is doing that in their code.This will cause mm-renderer to crash when it load and unload ivahd_video_decoder.so
	#We use LD_PRELOAD to overwrite the atexit() in libc with an empty function. This is considered to be temporary fix.
	#We should remove it once the kernel team fix the libc so that it does not call abort()
	#instead it will remove the atexit() handler
	LD_PRELOAD=/usr/lib/libatexitstub.so on -d mm-renderer -c
}

