'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import DownloadIcon from '@mui/icons-material/Download';

export default function CreateExaminationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState<'ts1' | 'ts2'>('ts1');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

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
    if (!name || !description || !file) {
      setError('Please fill in all fields and upload a template file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('templateType', templateType);
      formData.append('file', file);

      const res = await fetch('/api/examinations', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard/examinations');
      } else {
        setError(data.error || 'Failed to create examination');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
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
            Create Examination
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload an XLSX template to create a new examination
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
              placeholder="e.g. SSC CGL 2026 Tier-1"
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
              placeholder="Brief description of the examination"
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
                <MenuItem value="ts1">
                  <Box>
                    <Typography fontWeight={600}>TS1</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Question, option-1..4, Answer
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="ts2">
                  <Box>
                    <Typography fontWeight={600}>TS2</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Question, answer-1..4, option-1..4, Answer
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Sample Template Downloads */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(102, 126, 234, 0.04)',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Need help with the format? Download a sample template:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  href="/api/templates/sample?type=ts1"
                  download
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: '#667eea',
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                  }}
                  variant="outlined"
                >
                  TS1 Sample
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  href="/api/templates/sample?type=ts2"
                  download
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: '#f093fb',
                    borderColor: 'rgba(240, 147, 251, 0.3)',
                  }}
                  variant="outlined"
                >
                  TS2 Sample
                </Button>
              </Box>
            </Box>

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
                    Drop your XLSX template here
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    or click to browse
                  </Typography>
                </>
              )}
            </Box>

            <Button
              id="submit-exam-button"
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !name || !description || !file}
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
                'Create Examination'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
