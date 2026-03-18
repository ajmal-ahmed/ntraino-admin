'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Option {
  [key: string]: string;
}

interface Question {
  id: string;
  question: string;
  options: Option[];
  answer: string[];
  additionalOptions?: Option[];
   passage?: string;
  alignment: 'right' | 'left';
}

interface Examination {
  id: string;
  name: string;
  description: string;
  templateType: 'ts1' | 'ts2';
  templateFileName: string;
  questions: Question[];
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export default function ViewExaminationPage() {
  const router = useRouter();
  const params = useParams();
  const [examination, setExamination] = useState<Examination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExamination = useCallback(async () => {
    try {
      const res = await fetch(`/api/examinations/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setExamination(data.examination);
      } else {
        setError(data.error || 'Failed to fetch examination');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchExamination();
  }, [fetchExamination]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !examination) {
    return (
      <Box>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || 'Examination not found'}
        </Alert>
      </Box>
    );
  }

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
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" fontWeight={700}>
              {examination.name}
            </Typography>
            <Chip
              label={examination.templateType.toUpperCase()}
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor:
                  examination.templateType === 'ts1'
                    ? 'rgba(102, 126, 234, 0.1)'
                    : 'rgba(240, 147, 251, 0.1)',
                color:
                  examination.templateType === 'ts1'
                    ? '#667eea'
                    : '#f093fb',
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {examination.description}
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.06)',
            minWidth: 140,
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">
              Total Questions
            </Typography>
            <Typography variant="h5" fontWeight={700} color="#667eea">
              {examination.totalQuestions}
            </Typography>
          </CardContent>
        </Card>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.06)',
            minWidth: 140,
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">
              Template File
            </Typography>
            <Typography variant="body1" fontWeight={600} noWrap>
              {examination.templateFileName}
            </Typography>
          </CardContent>
        </Card>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.06)',
            minWidth: 140,
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {new Date(examination.createdAt).toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Questions */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Questions
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {examination.questions.map((q, index) => {
          const isRtl = q.alignment === 'left';
          return (
          <Accordion
            key={q.id}
            elevation={0}
            sx={{
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '12px !important',
              '&:before': { display: 'none' },
              '&.Mui-expanded': { margin: 0 },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={500} sx={{ mr: 1, direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left', width: '100%' }}>
                <Box
                  component="span"
                  sx={{
                    color: '#667eea',
                    fontWeight: 700,
                    mr: isRtl ? 0 : 1.5,
                    ml: isRtl ? 1.5 : 0,
                  }}
                >
                  Q{index + 1}.
                </Box>
                {q.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
              {q.passage && (
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(59, 130, 246, 0.04)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                    direction: isRtl ? 'rtl' : 'ltr',
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {q.passage}
                  </Typography>
                </Box>
              )}
              {/* Additional Options (TS2) */}
              {q.additionalOptions && q.additionalOptions.length > 0 && (
                <Box
                  sx={{
                    mb: 2,
                    direction: isRtl ? 'rtl' : 'ltr',
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  {q.additionalOptions
                    .map((opt) => {
                      const key = Object.keys(opt)[0];
                      const value = opt[key];
                      return value ? value : null;
                    })
                    .filter((value): value is string => Boolean(value))
                    .map((value, index) => {
                      const romanLabels = ['i', 'ii', 'iii', 'iv'];
                      const label = romanLabels[index] || `${index + 1}`;
                      return (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: 0.5,
                            px: 1.5,
                            mb: 0.5,
                            borderRadius: 1.5,
                            backgroundColor: 'rgba(240, 147, 251, 0.06)',
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ color: '#f093fb', minWidth: 20, textTransform: 'lowercase' }}
                          >
                            {label}.
                          </Typography>
                          <Typography variant="body2">{value}</Typography>
                        </Box>
                      );
                    })}
                </Box>
              )}

              {/* Options */}
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ mb: 1, display: 'block' }}
              >
                Options:
              </Typography>
              {q.options.map((opt, i) => {
                const key = Object.keys(opt)[0];
                const isAnswer = q.answer.includes(opt[key]);
                return (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 0.75,
                      px: 1.5,
                      mb: 0.5,
                      borderRadius: 1.5,
                      backgroundColor: isAnswer
                        ? 'rgba(34, 197, 94, 0.08)'
                        : 'rgba(0,0,0,0.02)',
                      border: isAnswer
                        ? '1px solid rgba(34, 197, 94, 0.2)'
                        : '1px solid transparent',
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color: isAnswer ? '#22c55e' : '#667eea',
                        minWidth: 20,
                      }}
                    >
                      {key.toUpperCase()}.
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {opt[key]}
                    </Typography>
                    {isAnswer && (
                      <CheckCircleIcon
                        sx={{ color: '#22c55e', fontSize: 18 }}
                      />
                    )}
                  </Box>
                );
              })}

              {/* Answer */}
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Correct Answer:
                </Typography>
                <Chip
                  label={q.answer.join(', ')}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
          );
        })}
      </Box>
    </Box>
  );
}
