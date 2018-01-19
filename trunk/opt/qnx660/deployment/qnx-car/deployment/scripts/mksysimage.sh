#!/bin/sh
set -e


if [ -z "$QNX_PYTHON_PATH" ]; then 
    echo "[error]: QNX_PYTHON_PATH is not set!"
    exit 1
fi
srcroot=$(dirname "$0")
exec "$QNX_PYTHON_PATH/python" "${srcroot?}/mksysimage.py" "$@"