if fatload mmc "$mmcdev:1" 0x80100000 qnx-ifs
then
	go 0x80100000
fi
