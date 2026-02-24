#!/bin/bash
unset PYTHONPATH
unset PYTHONHOME
export PATH="/usr/bin:$PATH"
exec /usr/bin/python3.11 "$(dirname "$0")/dicom_move.py" "$@"
