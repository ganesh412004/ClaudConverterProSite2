// Converter data
const converters = {
    video: {
        title: "Video Converter",
        formats: [
            {name: "MP4", value: "mp4", description: "MP4 Video File"},
            {name: "MOV to MP4", value: "mov-to-mp4", description: "Convert Apple MOV to MP4"},
            {name: "AVI to MP4", value: "avi-to-mp4", description: "Convert AVI to MP4"},
            {name: "Video to GIF", value: "video-to-gif", description: "Create GIF from video"},
            {name: "Video to MP3", value: "video-to-mp3", description: "Extract audio from video"},
            {name: "WEBM to MP4", value: "webm-to-mp4", description: "Convert WEBM to MP4"}
        ],
        hasQuality: true
    },
    audio: {
        title: "Audio Converter",
        formats: [
            {name: "MP3", value: "mp3", description: "MP3 Audio File"},
            {name: "WAV to MP3", value: "wav-to-mp3", description: "Convert WAV to MP3"},
            {name: "AAC to MP3", value: "aac-to-mp3", description: "Convert AAC to MP3"},
            {name: "OGG to MP3", value: "ogg-to-mp3", description: "Convert OGG to MP3"},
            {name: "M4A to MP3", value: "m4a-to-mp3", description: "Convert M4A to MP3"},
            {name: "FLAC to MP3", value: "flac-to-mp3", description: "Convert FLAC to MP3"}
        ],
        hasQuality: true
    },
    image: {
        title: "Image Converter",
        formats: [
            {name: "JPG", value: "jpg", description: "JPG Image File"},
            {name: "PNG to JPG", value: "png-to-jpg", description: "Convert PNG to JPG"},
            {name: "HEIC to JPG", value: "heic-to-jpg", description: "Convert HEIC to JPG"},
            {name: "JPG to PDF", value: "jpg-to-pdf", description: "Convert JPG to PDF"},
            {name: "Image to PDF", value: "image-to-pdf", description: "Combine images to PDF"},
            {name: "WEBP to JPG", value: "webp-to-jpg", description: "Convert WEBP to JPG"}
        ],
        hasQuality: false
    },
    document: {
        title: "Document Converter",
        formats: [
            {name: "PDF to Word", value: "pdf-to-word", description: "Convert PDF to DOCX"},
            {name: "Word to PDF", value: "word-to-pdf", description: "Convert DOCX to PDF"},
            {name: "Excel to PDF", value: "excel-to-pdf", description: "Convert XLSX to PDF"},
            {name: "EPUB to PDF", value: "epub-to-pdf", description: "Convert EPUB to PDF"},
            {name: "EPUB to MOBI", value: "epub-to-mobi", description: "Convert EPUB to MOBI"},
            {name: "PDF to TXT", value: "pdf-to-txt", description: "Extract text from PDF"}
        ],
        hasQuality: false
    },
    archive: {
        title: "Archive Converter",
        formats: [
            {name: "ZIP", value: "zip", description: "ZIP Archive"},
            {name: "RAR to ZIP", value: "rar-to-zip", description: "Convert RAR to ZIP"},
            {name: "7Z to ZIP", value: "7z-to-zip", description: "Convert 7Z to ZIP"},
            {name: "TAR to ZIP", value: "tar-to-zip", description: "Convert TAR to ZIP"},
            {name: "ZIP to RAR", value: "zip-to-rar", description: "Convert ZIP to RAR"},
            {name: "Extract Archive", value: "extract-archive", description: "Extract files from archive"}
        ],
        hasQuality: false
    },
    timezone: {
        title: "Time Zone Converter",
        formats: [
            {name: "PST to EST", value: "pst-to-est", description: "Convert Pacific to Eastern Time"},
            {name: "CST to EST", value: "cst-to-est", description: "Convert Central to Eastern Time"},
            {name: "EST to GMT", value: "est-to-gmt", description: "Convert Eastern to Greenwich Mean Time"},
            {name: "IST to EST", value: "ist-to-est", description: "Convert India to Eastern Time"},
            {name: "AEST to EST", value: "aest-to-est", description: "Convert Australian Eastern to Eastern Time"},
            {name: "Custom Time Zone", value: "custom-timezone", description: "Convert between any time zones"}
        ],
        hasQuality: false
    },
    unit: {
        title: "Unit Converter",
        formats: [
            {name: "Lbs to Kg", value: "lbs-to-kg", description: "Convert pounds to kilograms"},
            {name: "Kg to Lbs", value: "kg-to-lbs", description: "Convert kilograms to pounds"},
            {name: "Feet to Meters", value: "feet-to-meters", description: "Convert feet to meters"},
            {name: "Miles to Kilometers", value: "miles-to-km", description: "Convert miles to kilometers"},
            {name: "Fahrenheit to Celsius", value: "f-to-c", description: "Convert Fahrenheit to Celsius"},
            {name: "Custom Unit", value: "custom-unit", description: "Convert between any units"}
        ],
        hasQuality: false
    },
    bonus: {
        title: "Bonus Tools",
        formats: [
            {name: "Collage Maker", value: "collage-maker", description: "Combine multiple images into one"},
            {name: "Image Resizer", value: "image-resizer", description: "Resize images without quality loss"},
            {name: "Image Cropper", value: "image-cropper", description: "Crop images to desired dimensions"},
            {name: "Color Picker", value: "color-picker", description: "Extract HEX/RGB codes from images"},
            {name: "PDF Merger", value: "pdf-merger", description: "Combine multiple PDFs into one"},
            {name: "PDF Splitter", value: "pdf-splitter", description: "Split PDF into multiple files"}
        ],
        hasQuality: false
    }
};

// Current files to convert
let filesToConvert = [];

// Show the selected converter interface
function showConverter(type) {
    const converter = converters[type];
    document.getElementById('converter-title').textContent = converter.title;
    
    // Populate format options
    const formatSelect = document.getElementById('outputFormat');
    formatSelect.innerHTML = '';
    converter.formats.forEach(format => {
        const option = document.createElement('option');
        option.value = format.value;
        option.textContent = format.name;
        option.title = format.description;
        formatSelect.appendChild(option);
    });
    
    // Show/hide quality options
    document.getElementById('qualityGroup').style.display = converter.hasQuality ? 'block' : 'none';
    
    // Show the converter interface
    document.getElementById('converter-interface').style.display = 'block';
    
    // Scroll to the converter
    document.getElementById('converter-interface').scrollIntoView({ behavior: 'smooth' });
}

// Initialize drag and drop
document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    // Handle selected files
    fileInput.addEventListener('change', handleFiles, false);
    
    // Convert button click
    document.getElementById('convertBtn').addEventListener('click', startConversion);
    
    // Download button click
    document.getElementById('downloadBtn').addEventListener('click', downloadFiles);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    document.getElementById('dropArea').classList.add('active');
}

function unhighlight() {
    document.getElementById('dropArea').classList.remove('active');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
}

function handleFiles(e) {
    const files = e.target.files;
    filesToConvert = Array.from(files);
    validateFiles();
    updateFileList();
}

function validateFiles() {
    const validFiles = [];
    const maxSize = 40 * 1024 * 1024; // 40MB
    
    filesToConvert.forEach(file => {
        // Check file type
        const validTypes = ['image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert(`File ${file.name} is not a valid PNG or WebP image.`);
            return;
        }
        
        // Check file size
        if (file.size > maxSize) {
            alert(`File ${file.name} exceeds the 40MB size limit.`);
            return;
        }
        
        validFiles.push(file);
    });
    
    filesToConvert = validFiles;
}

function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    if (filesToConvert.length === 0) {
        return;
    }
    
    filesToConvert.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        
        const fileIcon = document.createElement('i');
        fileIcon.className = 'file-icon fas fa-file-image';
        
        const fileName = document.createElement('span');
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('span');
        fileSize.className = 'file-size';
        fileSize.textContent = formatFileSize(file.size);
        
        fileInfo.appendChild(fileIcon);
        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);
        
        const fileActions = document.createElement('div');
        fileActions.className = 'file-actions';
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => removeFile(index);
        
        fileActions.appendChild(removeBtn);
        
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(fileActions);
        
        fileList.appendChild(fileItem);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeFile(index) {
    filesToConvert.splice(index, 1);
    updateFileList();
}

function startConversion() {
    if (filesToConvert.length === 0) {
        alert('Please select at least one file to convert.');
        return;
    }
    
    const outputFormat = document.getElementById('outputFormat').value;
    const quality = document.getElementById('qualityGroup').style.display === 'block' 
        ? document.getElementById('quality').value 
        : null;
    
    // Show modal
    document.getElementById('conversionModal').style.display = 'flex';
    document.getElementById('conversionStatus').textContent = 'Starting conversion...';
    
    // Simulate conversion progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        document.getElementById('conversionProgress').style.width = progress + '%';
        
        if (progress < 30) {
            document.getElementById('conversionStatus').textContent = 'Uploading files...';
        } else if (progress < 70) {
            document.getElementById('conversionStatus').textContent = 'Converting files...';
        } else if (progress < 90) {
            document.getElementById('conversionStatus').textContent = 'Processing output...';
        } else {
            document.getElementById('conversionStatus').textContent = 'Conversion complete!';
        }
        
        if (progress === 100) {
            clearInterval(progressInterval);
            document.getElementById('downloadBtn').style.display = 'block';
        }
    }, 300);
}

function closeModal() {
    document.getElementById('conversionModal').style.display = 'none';
    document.getElementById('conversionProgress').style.width = '0%';
    document.getElementById('downloadBtn').style.display = 'none';
}

function downloadFiles() {
    // In a real app, this would download the actual converted files
    // For this demo, we'll just show an alert
    alert('Your converted files would download now. In a real application, this would trigger the download of the actual converted files.');
    closeModal();
}