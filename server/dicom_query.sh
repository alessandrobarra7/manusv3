#!/bin/bash
# Wrapper script to ensure Python 3.11 is used for DICOM queries
# Clear PYTHONPATH to avoid interference from other Python installations
unset PYTHONPATH
unset PYTHONHOME
export PYTHONNOUSERSITE=1
/usr/bin/python3.11 "$(dirname "$0")/dicom_query.py" "$@"
