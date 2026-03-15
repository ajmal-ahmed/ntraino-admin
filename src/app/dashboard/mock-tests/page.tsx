'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface ExaminationSummary {
  id: string;
  name: string;
  description: string;
  templateType: 'ts1' | 'ts2';
  totalQuestions: number;
}

interface MockTestSummary {
  id: string;
  examinationName: string;
  totalQuestions: number;
  totalScore: number;
  obtainedScore: number;
  status: 'in-progress' | 'completed';
  startedAt: string;
  completedAt?: string;
}

export default function MockTestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [examinations, setExaminations] = useState<ExaminationSummary[]>([]);
  const [mockTests, setMockTests] = useState<MockTestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [examsRes, testsRes] = await Promise.all([
        fetch('/api/examinations'),
        fetch(`/api/mock-tests?userId=${user?.uid || ''}`),
      ]);

      const examsData = await examsRes.json();
      const testsData = await testsRes.json();

      if (examsRes.ok) setExaminations(examsData.examinations);
      if (testsRes.ok) setMockTests(testsData.mockTests);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStartTest = async (examinationId: string) => {
    try {
      setStarting(examinationId);
      const res = await fetch('/api/mock-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examinationId,
          userId: user?.uid || 'anonymous',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/mock-tests/${data.id}/take`);
      } else {
        setError(data.error || 'Failed to start test');
      }
    } catch {
      setError('Network error');
    } finally {
      setStarting(null);
    }
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Mock Tests
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Take practice tests and track your performance
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
          },
          '& .Mui-selected': { color: '#667eea' },
          '& .MuiTabs-indicator': {
            backgroundColor: '#667eea',
          },
        }}
      >
        <Tab icon={<PlayArrowIcon />} iconPosition="start" label="Start Test" />
        <Tab icon={<HistoryIcon />} iconPosition="start" label="Test History" />
      </Tabs>

      {/* Tab 0: Select Examination */}
      {tab === 0 && (
        <Box>
          {examinations.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.06)',
                textAlign: 'center',
                py: 6,
              }}
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  No examinations available
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Create an examination first to start taking tests.
                </Typography>
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
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {exam.name}
                          </Typography>
                          <Chip
                            label={exam.templateType.toUpperCase()}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 24,
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {exam.description}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                          {exam.totalQuestions} questions
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={
                          starting === exam.id ? (
                            <CircularProgress size={16} sx={{ color: 'white' }} />
                          ) : (
                            <PlayArrowIcon />
                          )
                        }
                        disabled={starting !== null}
                        onClick={() => handleStartTest(exam.id)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 3,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                          '&:hover': {
                            boxShadow: '0 6px 25px rgba(102, 126, 234, 0.6)',
                          },
                        }}
                      >
                        Start Test
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Tab 1: Test History */}
      {tab === 1 && (
        <Box>
          {mockTests.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.06)',
                textAlign: 'center',
                py: 6,
              }}
            >
              <CardContent>
                <HistoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No tests taken yet
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Start a test from the available examinations above.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {mockTests.map((test) => {
                const percentage =
                  test.status === 'completed'
                    ? Math.round((test.obtainedScore / test.totalScore) * 100)
                    : 0;

                return (
                  <Card
                    key={test.id}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: '1px solid rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => router.push(`/dashboard/mock-tests/${test.id}/results`)}
                    >
                      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {test.examinationName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              <Chip
                                label={test.status === 'completed' ? 'Completed' : 'In Progress'}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  backgroundColor:
                                    test.status === 'completed'
                                      ? 'rgba(34, 197, 94, 0.1)'
                                      : 'rgba(251, 191, 36, 0.1)',
                                  color:
                                    test.status === 'completed' ? '#22c55e' : '#f59e0b',
                                }}
                              />
                              <Typography variant="caption" color="text.disabled">
                                {new Date(test.startedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>

                          {test.status === 'completed' && (
                            <Box sx={{ textAlign: 'center' }}>
                              <EmojiEventsIcon
                                sx={{
                                  fontSize: 28,
                                  color:
                                    percentage >= 80
                                      ? '#f59e0b'
                                      : percentage >= 50
                                      ? '#667eea'
                                      : 'text.disabled',
                                }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{
                                  color:
                                    percentage >= 80
                                      ? '#22c55e'
                                      : percentage >= 50
                                      ? '#667eea'
                                      : '#ef4444',
                                }}
                              >
                                {test.obtainedScore}/{test.totalScore}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {percentage}%
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
