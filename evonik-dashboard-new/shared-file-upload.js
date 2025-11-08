/**
 * Shared File Upload Utilities
 * Handles file upload logic for Excel/CSV files
 */

/**
 * Setup file upload with drag and drop support
 * @param {Object} options - Configuration options
 * @param {string} options.fileInputId - ID of file input element
 * @param {string} options.uploadSectionId - ID of upload section element
 * @param {string} options.uploadStatusId - ID of upload status element
 * @param {Function} options.onFileSelected - Callback when file is selected
 * @param {Array} options.acceptedTypes - Accepted file types (default: ['.xlsx', '.xls', '.csv'])
 */
function setupFileUpload(options = {}) {
    const {
        fileInputId,
        uploadSectionId,
        uploadStatusId,
        onFileSelected,
        acceptedTypes = ['.xlsx', '.xls', '.csv']
    } = options;

    const fileInput = document.getElementById(fileInputId);
    const uploadSection = document.getElementById(uploadSectionId);
    const uploadStatus = document.getElementById(uploadStatusId);

    if (!fileInput || !uploadSection) {
        console.error('File upload elements not found');
        return;
    }

    // Drag and drop handlers
    uploadSection.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadSection.style.borderColor = 'var(--evonik-purple)';
        uploadSection.style.background = 'rgba(139, 46, 139, 0.05)';
    });

    uploadSection.addEventListener('dragleave', () => {
        uploadSection.style.borderColor = 'var(--border-gray)';
        uploadSection.style.background = 'var(--bg-gray)';
    });

    uploadSection.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadSection.style.borderColor = 'var(--border-gray)';
        uploadSection.style.background = 'var(--bg-gray)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0], { uploadStatus, onFileSelected, acceptedTypes });
        }
    });

    // File input change handler
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0], { uploadStatus, onFileSelected, acceptedTypes });
        }
    });
}

/**
 * Handle file selection and validation
 * @param {File} file - Selected file
 * @param {Object} options - Configuration options
 */
function handleFileSelection(file, options = {}) {
    const {
        uploadStatus,
        onFileSelected,
        acceptedTypes = ['.xlsx', '.xls', '.csv']
    } = options;

    const fileName = file.name.toLowerCase();
    const isValidType = acceptedTypes.some(type => fileName.endsWith(type));

    if (!isValidType) {
        showUploadStatus(uploadStatus, 'error', `Invalid file format. Please upload ${acceptedTypes.join(', ')} files.`);
        return;
    }

    if (uploadStatus) {
        showUploadStatus(uploadStatus, 'loading', 'Processing file...');
    }

    // Call custom handler if provided
    if (onFileSelected) {
        onFileSelected(file, uploadStatus);
    }
}

/**
 * Show upload status message
 * @param {HTMLElement} uploadStatus - Status element
 * @param {string} type - Status type: 'loading', 'success', 'error'
 * @param {string} message - Status message
 * @param {number} autoHideDelay - Delay before auto-hiding (0 = no auto-hide)
 */
function showUploadStatus(uploadStatus, type, message, autoHideDelay = 5000) {
    if (!uploadStatus) {
        return;
    }

    uploadStatus.style.display = 'block';
    uploadStatus.className = 'upload-status';
    uploadStatus.textContent = message;

    switch (type) {
        case 'success':
            uploadStatus.className = 'upload-status success';
            uploadStatus.style.background = 'rgba(22, 163, 74, 0.1)';
            uploadStatus.style.color = 'var(--success-green)';
            uploadStatus.style.border = '1px solid rgba(22, 163, 74, 0.2)';
            if (autoHideDelay > 0) {
                setTimeout(() => {
                    uploadStatus.style.display = 'none';
                }, autoHideDelay);
            }
            break;
        case 'error':
            uploadStatus.className = 'upload-status error';
            uploadStatus.style.background = 'rgba(220, 38, 38, 0.1)';
            uploadStatus.style.color = 'var(--alert-red)';
            uploadStatus.style.border = '1px solid rgba(220, 38, 38, 0.2)';
            break;
        case 'loading':
        default:
            uploadStatus.className = 'upload-status';
            uploadStatus.textContent = message;
            break;
    }
}

/**
 * Parse CSV file using PapaParse
 * @param {File} file - CSV file
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
function parseCSVFile(file, onSuccess, onError) {
    if (typeof Papa === 'undefined') {
        if (onError) {
            onError(new Error('PapaParse library not loaded'));
        }
        return;
    }

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (results.errors.length > 0) {
                if (onError) {
                    onError(new Error('Error parsing CSV: ' + results.errors[0].message));
                }
                return;
            }
            if (onSuccess) {
                onSuccess(results.data);
            }
        },
        error: function(error) {
            if (onError) {
                onError(new Error('Error reading CSV file: ' + error.message));
            }
        }
    });
}

/**
 * Parse Excel file using XLSX
 * @param {File} file - Excel file
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
function parseExcelFile(file, onSuccess, onError) {
    if (typeof XLSX === 'undefined') {
        if (onError) {
            onError(new Error('XLSX library not loaded'));
        }
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            if (onSuccess) {
                onSuccess(jsonData);
            }
        } catch (error) {
            if (onError) {
                onError(new Error('Error parsing Excel file: ' + error.message));
            }
        }
    };

    reader.onerror = function(error) {
        if (onError) {
            onError(new Error('Error reading Excel file: ' + error.message));
        }
    };

    reader.readAsArrayBuffer(file);
}

/**
 * Auto-detect file type and parse
 * @param {File} file - File to parse
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
function parseFile(file, onSuccess, onError) {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
        parseCSVFile(file, onSuccess, onError);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        parseExcelFile(file, onSuccess, onError);
    } else {
        if (onError) {
            onError(new Error('Unsupported file type'));
        }
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupFileUpload,
        handleFileSelection,
        showUploadStatus,
        parseCSVFile,
        parseExcelFile,
        parseFile
    };
}

