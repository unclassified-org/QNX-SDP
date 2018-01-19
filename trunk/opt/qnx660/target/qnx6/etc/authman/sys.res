####################################
# List of authorized apps
####################################
use_camera
    allow *
read_geolocation
    allow *
access_location_services
    allow *
access_shared
    allow *
access_sys
    deny *
configure_system
    deny *
record_audio
    allow *
    allow sys.browser*
play_audio
    allow *
set_audio_volume
    allow *
post_notification
    allow *
access_bbid
    allow *
access_internet
    allow *
    allow sys.browser*
use_installer
    deny *
allow_app_purchase
    deny *
run_air_native
    allow *
read_device_identifying_information
    allow *
