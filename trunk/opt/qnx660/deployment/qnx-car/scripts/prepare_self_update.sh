#!/bin/sh
# This script prepares the system to install a self-update with swud.
# This is intended to be referenced by a self-update manifest file as a preinstall script
# and called by swud.

# Stop mm-player before the backup and downsize operations
# This will force the last track to be saved before qdb is killed
# see QCARTWO-5324 for more details
slay mm-player

# Backup databases
echo "Backing up databases..."
for db in mme personalization; do
    if [ -e /dev/qdb/$db ]
    then
        qdbc -d$db -B -vv
    fi
done

# Shutdown all the services but the ones needed by swud
downsize $UPDATE_APPS_TO_KEEP
res=$?

if [ $res -ne 0 ]
then
    echo "Downsize exited with error $res"
    exit $res
fi

# Force the Qt HMI to stop if it is running.  This was done to address
# the issue noted in QCARTWO-5430 and QCARTWO-5080. This
# is only meant as a workaround.
slay -9 qnxcar2

# Make base writable so we can do an update on it
mount -uw /base
res=$?

if [ $res -ne 0 ]
then
    echo "Making the /base partition writable exited with error $res"
    exit $res
fi

echo "Ready to install self-update"

exit 0
