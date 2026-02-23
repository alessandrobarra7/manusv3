#!/usr/bin/python3.11
"""
DICOM C-FIND Query Script
Uses pynetdicom to perform Study-level C-FIND queries on PACS/Orthanc servers
"""

import sys
import json
from pynetdicom import AE, debug_logger
from pynetdicom.sop_class import StudyRootQueryRetrieveInformationModelFind

def query_studies(pacs_ip, pacs_port, pacs_ae_title, local_ae_title="PACSMANUS", filters=None):
    """
    Perform C-FIND query on PACS server
    
    Args:
        pacs_ip: IP address of PACS server
        pacs_port: Port of PACS server (usually 11112 for Orthanc)
        pacs_ae_title: AE Title of PACS server
        local_ae_title: Local AE Title (default: PACSMANUS)
        filters: Dictionary with query filters
            - patient_name: Patient name (wildcards supported)
            - patient_id: Patient ID
            - modality: Modality (CR, CT, MR, etc.)
            - study_date: Study date (YYYYMMDD format)
            - accession_number: Accession number
    
    Returns:
        List of studies as dictionaries
    """
    
    # Initialize Application Entity
    ae = AE(ae_title=local_ae_title)
    ae.add_requested_context(StudyRootQueryRetrieveInformationModelFind)
    
    # Build query dataset
    from pydicom.dataset import Dataset
    
    ds = Dataset()
    ds.QueryRetrieveLevel = 'STUDY'
    
    # Required return keys (empty = return all)
    ds.StudyInstanceUID = ''
    ds.StudyID = ''
    ds.StudyDate = ''
    ds.StudyTime = ''
    ds.StudyDescription = ''
    ds.AccessionNumber = ''
    ds.PatientName = ''
    ds.PatientID = ''
    ds.PatientBirthDate = ''
    ds.PatientSex = ''
    ds.ModalitiesInStudy = ''
    ds.NumberOfStudyRelatedSeries = ''
    ds.NumberOfStudyRelatedInstances = ''
    
    # Apply filters
    if filters:
        if filters.get('patient_name'):
            # DICOM wildcard: * for any characters
            ds.PatientName = f"*{filters['patient_name']}*"
        if filters.get('patient_id'):
            ds.PatientID = f"*{filters['patient_id']}*"
        if filters.get('modality') and filters['modality'] != 'ALL':
            ds.ModalitiesInStudy = filters['modality']
        if filters.get('study_date'):
            # Convert from YYYY-MM-DD to YYYYMMDD
            ds.StudyDate = filters['study_date'].replace('-', '')
        if filters.get('accession_number'):
            ds.AccessionNumber = f"*{filters['accession_number']}*"
    
    studies = []
    
    try:
        # Associate with peer AE
        assoc = ae.associate(pacs_ip, pacs_port, ae_title=pacs_ae_title)
        
        if assoc.is_established:
            # Send C-FIND request
            responses = assoc.send_c_find(ds, StudyRootQueryRetrieveInformationModelFind)
            
            for (status, identifier) in responses:
                if status:
                    # If status is pending, identifier contains study data
                    if status.Status in (0xFF00, 0xFF01):
                        if identifier:
                            study = {
                                'studyInstanceUid': str(identifier.get('StudyInstanceUID', '')),
                                'studyId': str(identifier.get('StudyID', '')),
                                'studyDate': str(identifier.get('StudyDate', '')),
                                'studyTime': str(identifier.get('StudyTime', '')),
                                'studyDescription': str(identifier.get('StudyDescription', '')),
                                'accessionNumber': str(identifier.get('AccessionNumber', '')),
                                'patientName': str(identifier.get('PatientName', '')),
                                'patientId': str(identifier.get('PatientID', '')),
                                'patientBirthDate': str(identifier.get('PatientBirthDate', '')),
                                'patientSex': str(identifier.get('PatientSex', '')),
                                'modality': str(identifier.get('ModalitiesInStudy', '')),
                                'numberOfSeries': str(identifier.get('NumberOfStudyRelatedSeries', '')),
                                'numberOfInstances': str(identifier.get('NumberOfStudyRelatedInstances', ''))
                            }
                            studies.append(study)
            
            # Release association
            assoc.release()
            
            return {
                'success': True,
                'studies': studies,
                'count': len(studies)
            }
        else:
            return {
                'success': False,
                'error': 'Failed to establish association with PACS server',
                'details': 'Association rejected or timeout'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'details': 'Exception during DICOM query'
        }

if __name__ == '__main__':
    # Read input from command line arguments
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Missing input JSON argument'
        }))
        sys.exit(1)
    
    try:
        # Parse input JSON
        input_data = json.loads(sys.argv[1])
        
        pacs_ip = input_data.get('pacs_ip')
        pacs_port = input_data.get('pacs_port')
        pacs_ae_title = input_data.get('pacs_ae_title')
        local_ae_title = input_data.get('local_ae_title', 'PACSMANUS')
        filters = input_data.get('filters', {})
        
        if not all([pacs_ip, pacs_port, pacs_ae_title]):
            print(json.dumps({
                'success': False,
                'error': 'Missing required parameters: pacs_ip, pacs_port, pacs_ae_title'
            }))
            sys.exit(1)
        
        # Perform query
        result = query_studies(pacs_ip, pacs_port, pacs_ae_title, local_ae_title, filters)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except json.JSONDecodeError as e:
        print(json.dumps({
            'success': False,
            'error': f'Invalid JSON input: {str(e)}'
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }))
        sys.exit(1)
