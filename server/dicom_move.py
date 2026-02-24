#!/usr/bin/env python3.11
"""
DICOM C-MOVE Script
Downloads a study from remote PACS to local cache directory
"""

import sys
import json
import os
import shutil
from pynetdicom import AE, evt, StoragePresentationContexts
from pynetdicom.sop_class import StudyRootQueryRetrieveInformationModelMove

def handle_store(event):
    """Handle incoming C-STORE during C-MOVE"""
    ds = event.dataset
    ds.file_meta = event.file_meta
    
    # Get cache directory from environment or use default
    cache_dir = os.environ.get('DICOM_CACHE_DIR', '/tmp/dicom-cache')
    
    # Organize by Study Instance UID
    study_uid = ds.StudyInstanceUID
    study_cache_dir = os.path.join(cache_dir, study_uid)
    os.makedirs(study_cache_dir, exist_ok=True)
    
    # Save DICOM file
    filename = f"{ds.SOPInstanceUID}.dcm"
    filepath = os.path.join(study_cache_dir, filename)
    ds.save_as(filepath, write_like_original=False)
    
    return 0x0000  # Success

def c_move_study(pacs_ip, pacs_port, pacs_ae_title, local_ae_title, study_instance_uid, cache_dir):
    """
    Perform C-MOVE to download study from PACS to local cache
    
    Args:
        pacs_ip: IP address of PACS
        pacs_port: Port of PACS
        pacs_ae_title: AE Title of PACS
        local_ae_title: AE Title of this application
        study_instance_uid: Study Instance UID to download
        cache_dir: Directory to store downloaded files
    
    Returns:
        dict: Result with success status and file count
    """
    
    # Set cache directory in environment for handler
    os.environ['DICOM_CACHE_DIR'] = cache_dir
    
    # Create cache directory if it doesn't exist
    os.makedirs(cache_dir, exist_ok=True)
    
    # Initialize Application Entity for C-MOVE
    ae = AE(ae_title=local_ae_title)
    ae.add_requested_context(StudyRootQueryRetrieveInformationModelMove)
    
    # Initialize Application Entity for receiving C-STORE (SCP)
    ae_scp = AE(ae_title=local_ae_title)
    for context in StoragePresentationContexts:
        ae_scp.add_supported_context(context.abstract_syntax)
    
    handlers = [(evt.EVT_C_STORE, handle_store)]
    
    # Start SCP server in background to receive images
    scp = ae_scp.start_server(('0.0.0.0', 11113), block=False, evt_handlers=handlers)
    
    try:
        # Associate with PACS for C-MOVE
        assoc = ae.associate(pacs_ip, pacs_port, ae_title=pacs_ae_title)
        
        if assoc.is_established:
            # Create C-MOVE request
            from pydicom.dataset import Dataset
            ds = Dataset()
            ds.QueryRetrieveLevel = 'STUDY'
            ds.StudyInstanceUID = study_instance_uid
            
            # Send C-MOVE request
            responses = assoc.send_c_move(ds, local_ae_title, StudyRootQueryRetrieveInformationModelMove)
            
            success_count = 0
            failed_count = 0
            
            for (status, identifier) in responses:
                if status:
                    if status.Status in (0xFF00, 0xFF01):  # Pending
                        continue
                    elif status.Status == 0x0000:  # Success
                        success_count += 1
                    else:  # Failure or warning
                        failed_count += 1
            
            assoc.release()
            
            # Count downloaded files
            study_cache_dir = os.path.join(cache_dir, study_instance_uid)
            file_count = 0
            if os.path.exists(study_cache_dir):
                file_count = len([f for f in os.listdir(study_cache_dir) if f.endswith('.dcm')])
            
            return {
                "success": True,
                "file_count": file_count,
                "cache_dir": study_cache_dir,
                "study_instance_uid": study_instance_uid
            }
        else:
            return {
                "success": False,
                "error": "Failed to establish association with PACS"
            }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    
    finally:
        # Stop SCP server
        scp.shutdown()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "error": "Usage: dicom_move.py '<json_params>'"}))
        sys.exit(1)
    
    try:
        params = json.loads(sys.argv[1])
        
        result = c_move_study(
            pacs_ip=params['pacs_ip'],
            pacs_port=int(params['pacs_port']),
            pacs_ae_title=params['pacs_ae_title'],
            local_ae_title=params.get('local_ae_title', 'PACSMANUS'),
            study_instance_uid=params['study_instance_uid'],
            cache_dir=params.get('cache_dir', '/tmp/dicom-cache')
        )
        
        print(json.dumps(result))
    
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
