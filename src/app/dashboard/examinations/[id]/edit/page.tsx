'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Fade from '@mui/material/Fade';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';

export default function EditExaminationPage() {
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState<'ts1' | 'ts2'>('ts1');
  const [file, setFile] = useState<File | null>(null);
  const [currentFileName, setCurrentFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fetchExamination = useCallback(async () => {
    try {
      const res = await fetch(`/api/examinations/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setName(data.examination.name);
        setDescription(data.examination.description);
        setTemplateType(data.examination.templateType);
        setCurrentFileName(data.examination.templateFileName);
      } else {
        setError(data.error || 'Failed to fetch examination');
      }
    } catch {
      setError('Network error');
    } finally {
      setFetching(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchExamination();
  }, [fetchExamination]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx')) {
        setError('Only .xlsx files are supported');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.xlsx')) {
        setError('Only .xlsx files are supported');
        return;
      }
      setFile(droppedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);

      if (file) {
        formData.append('templateType', templateType);
        formData.append('file', file);
      }

      const res = await fetch(`/api/examinations/${params.id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard/examinations');
      } else {
        setError(data.error || 'Failed to update examination');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton
          onClick={() => router.push('/dashboard/examinations')}
          sx={{
            bgcolor: 'white',
            border: '1px solid rgba(0,0,0,0.06)',
            '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.06)' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Edit Examination
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update examination details or re-upload template
          </Typography>
        </Box>
      </Box>

      <Card
        elevation={0}
        sx={{
          maxWidth: 700,
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Fade in>
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              id="exam-name"
              label="Examination Name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 3 }}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />

            <TextField
              id="exam-description"
              label="Description"
              fullWidth
              required
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 3 }}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Template Type</InputLabel>
              <Select
                id="template-type"
                value={templateType}
                label="Template Type"
                onChange={(e: SelectChangeEvent) =>
                  setTemplateType(e.target.value as 'ts1' | 'ts2')
                }
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ts1">TS1 — Question, option-1..4, Answer</MenuItem>
                <MenuItem value="ts2">TS2 — Question, answer-1..4, option-1..4, Answer</MenuItem>
              </Select>
            </FormControl>

            {/* Current file info */}
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              Current file: <strong>{currentFileName}</strong> — Upload a new file below to replace it, or leave empty to keep existing.
            </Alert>

            {/* File Upload Area */}
            <Box
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                mb: 4,
                p: 4,
                borderRadius: 3,
                border: `2px dashed ${dragOver ? '#667eea' : 'rgba(0,0,0,0.12)'}`,
                backgroundColor: dragOver
                  ? 'rgba(102, 126, 234, 0.04)'
                  : 'rgba(0,0,0,0.01)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#667eea',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                },
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {file ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                  <InsertDriveFileIcon sx={{ color: '#667eea', fontSize: 32 }} />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography fontWeight={600} fontSize="0.9rem">
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    sx={{ color: 'text.secondary' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography fontWeight={600} color="text.secondary">
                    Drop new XLSX template here (optional)
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    or click to browse
                  </Typography>
                </>
              )}
            </Box>

            <Button
              id="update-exam-button"
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !name || !description}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  boxShadow: '0 6px 25px rgba(102, 126, 234, 0.6)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Update Examination'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
