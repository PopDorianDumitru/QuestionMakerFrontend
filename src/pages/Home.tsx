import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import axios from 'axios';
import '../css_files/Home.css';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { useSnackBarStore } from '../stores/snackBarStore';
import { useQuestionsStore } from '../stores/useQuestionsStore';
import { useInformationStore } from '../stores/informationStore';

const backendURL = import.meta.env.VITE_BACKEND
/**
 * Home component allows users to upload a file and process it.
 * Users can select the file type (PDF, PowerPoint, or Word) via a dropdown menu.
 * Once a file is selected, it is processed by making a POST request to a server.
 * The component provides feedback to the user via a Snackbar about the success or failure of the file processing.
 * It also shows a loading indicator while the file is being processed.
 */

const Home: React.FC = () => {
  const navigate = useNavigate()
  const [, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<null | string>(null);
  const [processed, setProcessed] = useState(false);
  const [fileType, setFileType] = useState<'pdf' | 'pptx' | 'docx' | 'doc'>('pdf');
  const createSnackBar = useSnackBarStore((state) => state.createSnackBar)
  const informationStore = useInformationStore((state) => state)
  const questionStore = useQuestionsStore((state) => state)

  const user = useUserStore((state) => state.user)
  useEffect(() => {
    localStorage.setItem('fileType', fileType);
  }, [fileType])

  const reset = useQuestionsStore((state) => state.reset)

  const getAcceptString = (type: 'pdf' | 'pptx' | 'docx' | 'doc') => {
    switch (type) {
      case 'pdf':
        return '.pdf';
      case 'pptx':
        return '.pptx';
      case 'docx':
        return '.doc,.docx';
      default:
        return '.pdf,.pptx,.doc,.docx';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setLoading(true);
    setProcessed(false);
    informationStore.reset();
    questionStore.reset();
    questionStore.resetCache();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(
        `${backendURL}/transform/${fileType}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${await user?.getIdToken()}` }, }
      );
      const message: string = res.data.message ?? 'File processed successfully!';
      const document: string = res.data.document;
      localStorage.setItem('slides', JSON.stringify(document));
      setProcessed(true);
      createSnackBar(message, 'success')
      reset()
    } catch (err) {
      let errorMsg = 'Network error';
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.message ?? "Please make sure you are logged in and you are subscribed";
      }
      createSnackBar(errorMsg, 'error')
      console.error('Upload failed:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Typography variant="h5" gutterBottom>
        Upload your file
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel id="file-type-label">File Type</InputLabel>
        <Select
          labelId="file-type-label"
          value={fileType}
          label="File Type"
          onChange={(e) => setFileType(e.target.value as 'pdf' | 'pptx' | 'docx' | 'doc')}
          disabled={loading}
        >
          <MenuItem value="pdf">PDF</MenuItem>
          <MenuItem value="pptx">PowerPoint (.pptx)</MenuItem>
          <MenuItem value="docx">Word (.doc/.docx)</MenuItem>
        </Select>
      </FormControl>

      <input
        type="file"
        onChange={handleFileChange}
        accept={getAcceptString(fileType)}
        disabled={loading}
      />

      {loading && <CircularProgress />}
      {processed && 
        <div>
          <FormControl margin="normal">
            <label>
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) setCustomPrompt('');
                  else setCustomPrompt(null);
                }}
              />{' '}
              Use custom prompt
            </label>
            {customPrompt !== null && (
              <textarea
                placeholder="Enter custom prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4} // controls height
                style={{ display: 'block', marginTop: '8px', width: '100%', padding: '8px', fontSize: '14px' }}
              />
            )}
          </FormControl>
        </div>
      }
      {processed && (
        <Button variant="contained" color="primary" onClick={() => {
            navigate('/question')
            if(customPrompt !== null)
              informationStore.setCustomPrompt(customPrompt); 
            else 
              informationStore.setCustomPrompt('');
          }}>
          Create questions for file
        </Button>
      )}
    </div>
  );
};

export default Home;
