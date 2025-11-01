import React, { useRef, useState } from 'react';
import {
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import axios from 'axios';
import '../css_files/Home.css'; // Make sure this CSS file includes the styles from the previous step
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { useSnackBarStore } from '../stores/snackBarStore';
import { useQuestionsStore } from '../stores/useQuestionsStore';
import { useInformationStore } from '../stores/informationStore';

const backendURL = import.meta.env.VITE_BACKEND;

/**
 * Home component allows users to upload a file via drag-and-drop or browsing.
 * The component infers the file type (PDF, PPTX, DOCX) from the file extension.
 * It processes the file by making a POST request to the server.
 * Provides feedback via Snackbar and loading indicators.
 */
const Home: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<null | string>(null);
  const [processed, setProcessed] = useState(false);
  const createSnackBar = useSnackBarStore((state) => state.createSnackBar);
  const informationStore = useInformationStore((state) => state);
  const questionStore = useQuestionsStore((state) => state);
  const user = useUserStore((state) => state.user);
  const reset = useQuestionsStore((state) => state.reset);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Infers the file type string required by the API from the file's name.
   */
  const getInferredFileType = (fileName: string): string | null => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return null;

    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'pptx':
        return 'pptx';
      case 'doc':
      case 'docx':
        return 'docx';
      default:
        return null; // Unsupported type
    }
  };

  /**
   * Processes the file by sending it to the backend.
   */
  const processFile = async (file: File, inferredType: string) => {
    setLoading(true);
    setProcessed(false);
    informationStore.reset();
    questionStore.reset();
    questionStore.resetCache();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(
        `${backendURL}/transform/${inferredType}`, // Use the inferred type in the URL
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
        }
      );
      const message: string = res.data.message ?? 'File processed successfully!';
      const document: string = res.data.document;
      localStorage.setItem('slides', JSON.stringify(document));
      setProcessed(true);
      createSnackBar(message, 'success');
      reset();
    } catch (err) {
      let errorMsg = 'Network error';
      if (axios.isAxiosError(err)) {
        errorMsg =
          err.response?.data?.message ??
          'Please make sure you are logged in and you are subscribed';
      }
      createSnackBar(errorMsg, 'error');
      console.error('Upload failed:', errorMsg);
      // Clear file on failure
      handleRemoveFile();
    } finally {
      setLoading(false);
    }
  };

  /**
   * A central handler for when a file is selected (via drop or browse).
   * It validates the file type and triggers processing.
   */
  const handleFileSelect = (selectedFile: File | undefined) => {
    if (!selectedFile) {
      setUploadedFile(null);
      return;
    }

    const inferredType = getInferredFileType(selectedFile.name);

    if (!inferredType) {
      createSnackBar(
        'Unsupported file type. Please upload a PDF, DOCX, PPTX.',
        'error'
      );
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear input
      }
      return;
    }

    setUploadedFile(selectedFile);
    processFile(selectedFile, inferredType); // Pass file and inferred type
  };

  // --- Input/Drop Handlers ---

  const onInternalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    handleFileSelect(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // --- UI Action Handlers ---

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setProcessed(false); // Reset processed state
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input value
    }
  };

  const handleGenerateClick = () => {
    navigate('/question');
    if (customPrompt !== null) {
      informationStore.setCustomPrompt(customPrompt);
    } else {
      informationStore.setCustomPrompt('');
    }
  };

  return (
    <div className="container-generate">
      <Typography variant="h5" gutterBottom>
        <b>Upload your file to generate quizzes</b>
      </Typography>
      <Typography variant="body1" component="p" gutterBottom>
        Supports PDF, DOCX, and PPTX formats
      </Typography>

      <div className="file-upload-container">
        {/* Hidden actual file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onInternalFileChange}
          accept=".pdf,.pptx,.doc,.docx" // Accept all supported types
          disabled={loading}
          style={{ display: 'none' }}
        />

        {/* Show drop zone only if no file is uploaded and not loading */}
        {!uploadedFile && !loading && (
          <div
            className="drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <div className="upload-icon-wrapper">
              <img 
                src="/cloud-upload.svg" 
                alt="Upload file icon" 
                className="upload-cloud-icon" 
            />
            </div>
            <p>Drag & drop your file here</p>
            <p>or click to browse</p>
          </div>
        )}

        {/* Show loading indicator */}
        {loading && (
          <div className="loading-container" style={{ padding: '40px 0' }}>
            <CircularProgress />
            <Typography variant="body1" style={{ marginTop: '15px' }}>
              Processing file...
            </Typography>
          </div>
        )}

        {/* Show uploaded file info */}
        {uploadedFile && !loading && (
          <div className="uploaded-file-info">
            <img 
                src="/cloud-upload.svg" 
                alt="Upload file icon" 
                className="upload-cloud-icon-info" 
            />
            <span>{uploadedFile.name}</span>
            <button
              onClick={handleRemoveFile}
              className="remove-file-button"
              disabled={loading}
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Custom Prompt Section */}
      {processed && !loading && (
          <div className="custom-prompt-input-container">
            <textarea
              className="prompt-textarea" // Key class for styling
              placeholder="Optional: enter your custom prompt here (e.g., 'Generate 10 hard multiple choice questions about...')"
              value={customPrompt || ''}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3} // Set a default number of rows
            />
          {/* Optional: Add a subtle 'Send' icon or button here if you want to emphasize the input */}
        </div>
      )}

      {/* Generate Button Section */}
      {processed && !loading && ( 
        <Button
          className='generate-quiz-button'
          variant="contained"
          onClick={handleGenerateClick}
          disabled={loading} // Redundant check, but good practice
        >
          Create questions for file
        </Button>
      )}
    </div>
  );
};

export default Home;