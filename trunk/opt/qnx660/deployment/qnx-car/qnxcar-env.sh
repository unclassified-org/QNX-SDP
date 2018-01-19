# = = = = = = = = = = = = = = = =
# QNX CAR Deployment Environment
# = = = = = = = = = = = = = = = =
#  ####   #    #  #    #
# #    #  ##   #   #  #
# #    #  # #  #    ##
# #  # #  #  # #    ##
# #   #   #   ##   #  #
#  ### #  #    #  #    #
# = = = = = = = = = = = = = = = =

if [ ! -z "$qnxCarDeployment" ]; then
    export QNX_CAR_DEPLOYMENT="$qnxCarDeployment"

elif [ ! -z "${BASH_SOURCE[0]}" ]; then
    # Determine the real path to this script
    pushd . > /dev/null
    SCRIPT_PATH="${BASH_SOURCE[0]}"
    while([ -h "${SCRIPT_PATH}" ]) do 
        cd "`dirname "${SCRIPT_PATH}"`"
        SCRIPT_PATH="$(readlink "`basename "${SCRIPT_PATH}"`")"; 
    done
    cd "`dirname "${SCRIPT_PATH}"`" > /dev/null
    export QNX_CAR_DEPLOYMENT="`pwd`"
    popd > /dev/null
fi
[ -z "$QNX_CAR2_WORKSPACE" ] && export QNX_CAR2_WORKSPACE=$QNX_CAR_DEPLOYMENT
[ ! -z "$QNX_HOST" ] && export QNX_PYTHON_PATH="$QNX_HOST/usr/python27/bin"

# ========================
# Add script to the PATH environment
# ========================
if [ ! -z "$QNX_CAR_DEPLOYMENT" ]; then
    isDeploymentInPath=`echo $PATH | grep ":$QNX_CAR_DEPLOYMENT"`
    if [ -z "$isDeploymentInPath" ]; then
        export PATH="$PATH:$QNX_CAR_DEPLOYMENT/deployment/scripts"
    fi
fi

