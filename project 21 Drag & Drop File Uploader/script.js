class FileUploader {
    constructor() {
        this.files = [];
        this.uploadedFiles = [];
        this.sharedFiles = [];
        this.init();
    }

    init() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.filePreview = document.getElementById('filePreview');
        this.progressBar = document.getElementById('progressBar');
        this.message = document.getElementById('message');
        this.uploadedFilesList = document.getElementById('uploadedFilesList');
        this.sharedFilesList = document.getElementById('sharedFilesList');

        this.bindEvents();
        this.loadStoredFiles();
        this.initTabs();
    }

    bindEvents() {
        // Drag and drop events
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });

        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            this.addFiles(files);
        });

        // Click to browse
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.addFiles(files);
        });


    }

    addFiles(files) {
        files.forEach(file => {
            if (this.validateFile(file)) {
                this.files.push(file);
            }
        });
        this.updatePreview();
        this.uploadFiles();
    }

    validateFile(file) {
        const maxSize = 50 * 1024 * 1024; // 50MB

        if (file.size > maxSize) {
            this.showMessage('File too large. Max size is 50MB.', 'error');
            return false;
        }

        return true;
    }

    updatePreview() {
        this.filePreview.innerHTML = '';
        
        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            fileItem.innerHTML = `
                <div class="file-icon">${this.getFileIcon(file.type)}</div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
                <button class="remove-btn" onclick="fileUploader.removeFile(${index})">Remove</button>
            `;
            
            this.filePreview.appendChild(fileItem);
        });
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updatePreview();
    }



    uploadFiles() {
        if (this.files.length === 0) return;

        this.progressBar.style.display = 'block';
        this.showMessage('Uploading files...', 'info');

        // Simulate file upload with progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress > 100) progress = 100;
            
            this.progressBar.querySelector('.progress-fill').style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                this.completeUpload();
            }
        }, 100);
    }

    completeUpload() {
        // Move files to uploaded
        this.files.forEach(file => {
            const uploadedFile = {
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString(),
                id: Date.now() + Math.random()
            };
            this.uploadedFiles.push(uploadedFile);
        });

        // Save to localStorage
        this.saveToStorage();
        
        // Show success message
        this.showMessage(`Successfully uploaded ${this.files.length} file(s)!`, 'success');
        
        // Clear file input
        this.fileInput.value = '';
        
        // Reset
        this.files = [];
        this.updatePreview();
        this.updateFilesList();
        
        // Hide progress bar
        setTimeout(() => {
            this.progressBar.style.display = 'none';
            this.progressBar.querySelector('.progress-fill').style.width = '0%';
        }, 1000);
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType === 'application/pdf') return '📄';
        if (fileType.startsWith('video/')) return '🎥';
        if (fileType.startsWith('audio/')) return '🎵';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📋';
        if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
        return '📁';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showMessage(text, type) {
        this.message.textContent = text;
        this.message.className = `message ${type}`;
        this.message.style.display = 'block';
        
        setTimeout(() => {
            this.message.style.display = 'none';
        }, 4000);
    }

    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                // Remove active class from all
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked
                btn.classList.add('active');
                document.getElementById(`${tabName}-panel`).classList.add('active');
            });
        });
    }

    updateFilesList() {
        // Update uploaded files
        this.uploadedFilesList.innerHTML = '';
        if (this.uploadedFiles.length === 0) {
            this.uploadedFilesList.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No files uploaded yet</div>';
        } else {
            this.uploadedFiles.forEach((file, index) => {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'uploaded-file';
                fileDiv.innerHTML = `
                    <div class="file-icon">${this.getFileIcon(file.type)}</div>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                    <button class="remove-btn" onclick="fileUploader.deleteUploadedFile(${index})" style="margin-left: auto;">Delete</button>
                `;
                this.uploadedFilesList.appendChild(fileDiv);
            });
        }

        // Update shared files
        this.updateSharedFiles();
    }

    updateSharedFiles() {
        if (this.sharedFiles.length === 0) {
            // Add some sample shared files
            this.sharedFiles = [
                { name: 'Project_Report.pdf', size: 2048576, type: 'application/pdf' },
                { name: 'Team_Photo.jpg', size: 1024000, type: 'image/jpeg' },
                { name: 'Meeting_Notes.docx', size: 512000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
            ];
        }

        this.sharedFilesList.innerHTML = '';
        this.sharedFiles.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'uploaded-file';
            fileDiv.innerHTML = `
                <div class="file-icon">${this.getFileIcon(file.type)}</div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
            `;
            this.sharedFilesList.appendChild(fileDiv);
        });
    }

    saveToStorage() {
        localStorage.setItem('uploadedFiles', JSON.stringify(this.uploadedFiles));
    }

    loadStoredFiles() {
        try {
            const stored = localStorage.getItem('uploadedFiles');
            if (stored) {
                this.uploadedFiles = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading stored files:', error);
        }
        this.updateFilesList();
    }

    deleteUploadedFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.saveToStorage();
        this.updateFilesList();
        this.showMessage('File deleted successfully', 'success');
    }
}

// Initialize when DOM is loaded
let fileUploader;
document.addEventListener('DOMContentLoaded', () => {
    fileUploader = new FileUploader();
});