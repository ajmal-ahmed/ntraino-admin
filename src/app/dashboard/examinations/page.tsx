'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';

interface ExaminationSummary {
  id: string;
  name: string;
  description: string;
  templateType: 'ts1' | 'ts2';
  templateFileName: string;
  totalQuestions: number;
  createdAt: string;
}

export default function ExaminationsPage() {
  const router = useRouter();
  const [examinations, setExaminations] = useState<ExaminationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: '',
    name: '',
  });

  const fetchExaminations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/examinations');
      const data = await res.json();
      if (res.ok) {
        setExaminations(data.examinations);
      } else {
        setError(data.error || 'Failed to fetch examinations');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExaminations();
  }, [fetchExaminations]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/examinations/${deleteDialog.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Examination deleted successfully', severity: 'success' });
        fetchExaminations();
      } else {
        const data = await res.json();
        setSnackbar({ open: true, message: data.error || 'Failed to delete', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Network error', severity: 'error' });
    }
    setDeleteDialog({ open: false, id: '', name: '' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Examinations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your competitive examinations
          </Typography>
        </Box>
        <Button
          id="create-exam-button"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/dashboard/examinations/create')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              boxShadow: '0 6px 25px rgba(102, 126, 234, 0.6)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          Create Examination
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Examinations List */}
      {examinations.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            textAlign: 'center',
            py: 8,
          }}
        >
          <CardContent>
            <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No examinations yet
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              Create your first examination by uploading a template file.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => router.push('/dashboard/examinations/create')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#667eea',
                color: '#667eea',
              }}
            >
              Create Examination
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {examinations.map((exam) => (
            <Card
              key={exam.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.08)',
                },
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Typography variant="h6" fontWeight={600} noWrap>
                        {exam.name}
                      </Typography>
                      <Chip
                        label={exam.templateType.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 24,
                          backgroundColor:
                            exam.templateType === 'ts1'
                              ? 'rgba(102, 126, 234, 0.1)'
                              : 'rgba(240, 147, 251, 0.1)',
                          color:
                            exam.templateType === 'ts1'
                              ? '#667eea'
                              : '#f093fb',
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1.5 }}
                      noWrap
                    >
                      {exam.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.disabled">
                        {exam.totalQuestions} questions
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {exam.templateFileName}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {new Date(exam.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/dashboard/examinations/${exam.id}`)}
                      sx={{ color: '#667eea' }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        router.push(`/dashboard/examinations/${exam.id}/edit`)
                      }
                      sx={{ color: 'text.secondary' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setDeleteDialog({ open: true, id: exam.id, name: exam.name })
                      }
                      sx={{ color: '#ef4444' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: '', name: '' })}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={600}>Delete Examination</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, id: '', name: '' })}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
