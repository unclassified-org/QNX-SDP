#!/bin/sh
# Take a screenshot by calling the screenshot utility.
# (Default: /tmp/)
SCRIPT=`basename $0`

function usage
{
    cat << EOF
# Take a snapshot of the current screen and save the .bmp file
# to the specified location (default: /tmp)

Usage: $SCRIPT <path-to-images>

    -h   # Print this help
    -q   # Quiet output
    -x   # DEBUG
EOF

}

# DEFAULTS
OUTPUT_DIR=/tmp

# GETOPTS
while getopts hqx opt
do
	case $opt in
	h) usage ; exit 0 ;;
	q) QUIET="TRUE" ;;
	x) set -x ;;
	\?) usage >&2; echo "Error: Unknown Option" >&2 ; exit 1 ;;
	esac
done

shift $(($OPTIND - 1))
OPTIND=0
[ ! -z "$@" ] && OUTPUT_DIR="$@"

# ERROR CHECKS
if [ ! -d "$OUTPUT_DIR" ]; then
    mkdir -p "$OUTPUT_DIR"
    if [ $? -ne 0 ]; then
        echo "Error creating directory [$OUTPUT_DIR]." >&2
        exit 1
    fi
fi

# ===========================
# Get the current incremental number for the image.
# If no image exists in the destination path, the image will be named:
#    0.bmp
# If, for example, 0.bmp exists, the image will be named:
#    1.bmp
# etc.
# ===========================
imgNumber=0
if [ -f $OUTPUT_DIR/0.bmp ]; then
    imgNumber=`cd $OUTPUT_DIR; ls [0-9]*.bmp 2> /dev/null | sort -n | sed 's/\.bmp//' | sed 's/.*\///' | tail -1`
    ((imgNumber=imgNumber+1))
fi

#Running screenshot utility
screenshot -file=$OUTPUT_DIR/$imgNumber.bmp
exitValue=$?

if [ $exitValue -eq 0 ]; then
    [ -z "$QUIET" ] && echo "Screenshot taken to: [$OUTPUT_DIR/$imgNumber.bmp]"
fi
exit $exitValue
