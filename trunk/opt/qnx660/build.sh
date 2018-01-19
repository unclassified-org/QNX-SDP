rm image/*.tar
rm image/*.img
echo "**********Start to make image first time.**********"
mksysimage.sh -vvvvvvv -o /opt/qnx660/image jacinto6hg.external
echo "**********Make image first time done.**********"
echo "**********Start to replace ifs.**********"
image/ifs_replace.sh
echo "**********Replace ifs done.**********"
echo "##########Start to make image second time.##########"
mksysimage.sh -vvvvvvv -o /opt/qnx660/image jacinto6hg.external
echo "##########Make image second time done.##########"
