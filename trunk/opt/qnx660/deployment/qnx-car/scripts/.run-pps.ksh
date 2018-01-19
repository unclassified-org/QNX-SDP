# ** Note: waiting for slogger2 delays startup, and is not required for PPS to run
#waitfor /dev/shmem/slogger2

#This works around a bug where the /pps directory is created in the on-disk filesystem (breaks pps)
[ -d /pps ] && mv /pps /filesys-pps 

/proc/boot/timestamp "LAUNCHING PPS" >> /dev/shmem/boot_metrics.log &
pps -v -l0 -C -t 300000 -A /base/etc/pps.conf > /dev/shmem/pps.stdout 2>&1

waitfor /pps
/proc/boot/timestamp "DONE PPS (/pps is available)" >> /dev/shmem/boot_metrics.log &

if [ -d /filesys-pps ]; then
   print "STALE FILESYSTEM COPY OF THE PPS DIRECTORY FOUND, REMOVING..." 
   rm -rf /filesys-pps &
fi


