'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import TimerIcon from '@mui/icons-material/Timer';

interface MockTestResponse {
  questionId: string;
  selectedAnswer: string[];
  isCorrect: boolean;
  timeTaken: number;
}

interface MockTestResult {
  id: string;
  examinationId: string;
  examinationName: string;
  totalQuestions: number;
  totalScore: number;
  obtainedScore: number;
  status: string;
  responses: MockTestResponse[];
  startedAt: string;
  completedAt?: string;
}

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

export default function TestResultsPage() {
  const router = useRouter();
  const params = useParams();
  const [result, setResult] = useState<MockTestResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const testRes = await fetch(`/api/mock-tests/${params.id}`);
      const testData = await testRes.json();

      if (!testRes.ok) {
        setError(testData.error || 'Failed to load results');
        return;
      }

      setResult(testData.mockTest);

      // Fetch questions for detailed review
      const examRes = await fetch(
        `/api/examinations/${testData.mockTest.examinationId}`
      );
      const examData = await examRes.json();
      if (examRes.ok) {
        setQuestions(examData.examination.questions);
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !result) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error || 'Results not found'}
      </Alert>
    );
  }

  const percentage = Math.round(
    (result.obtainedScore / result.totalScore) * 100
  );
  const correctCount = result.responses.filter((r) => r.isCorrect).length;
  const wrongCount = result.responses.filter(
    (r) => !r.isCorrect && r.selectedAnswer.length > 0
  ).length;
  const unanswered = result.responses.filter(
    (r) => r.selectedAnswer.length === 0
  ).length;

  const getGradeInfo = () => {
    if (percentage >= 90) return { grade: 'Excellent!', color: '#22c55e', emoji: '🏆' };
    if (percentage >= 75) return { grade: 'Great Job!', color: '#667eea', emoji: '🌟' };
    if (percentage >= 50) return { grade: 'Good Effort', color: '#f59e0b', emoji: '👍' };
    return { grade: 'Keep Practicing', color: '#ef4444', emoji: '💪' };
  };

  const gradeInfo = getGradeInfo();

  // Map questionId -> response
  const responseMap = new Map(result.responses.map((r) => [r.questionId, r]));

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton
          onClick={() => router.push('/dashboard/mock-tests')}
          sx={{
            bgcolor: 'white',
            border: '1px solid rgba(0,0,0,0.06)',
            '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.06)' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          Test Results
        </Typography>
      </Box>

      {/* Score Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid rgba(0,0,0,0.06)',
          mb: 4,
          overflow: 'hidden',
        }}
      >
                <Box
          sx={{
            height: 6,
            background: `linear-gradient(90deg, ${gradeInfo.color}, ${gradeInfo.color}88)`,
          }}
        />
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            {gradeInfo.emoji}
          </Typography>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: gradeInfo.color, mb: 1 }}
          >
            {gradeInfo.grade}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            {result.examinationName}
          </Typography>

          {/* Score Circle */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              mb: 3,
            }}
          >
            <CircularProgress
              variant="determinate"
              value={100}
              size={160}
              thickness={4}
              sx={{ color: 'rgba(0,0,0,0.05)' }}
            />
            <CircularProgress
              variant="determinate"
              value={percentage}
              size={160}
              thickness={4}
              sx={{
                color: gradeInfo.color,
                position: 'absolute',
                left: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{ color: gradeInfo.color }}
              >
                {percentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {result.obtainedScore}/{result.totalScore}
              </Typography>
            </Box>
          </Box>

          {/* Stats Row */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  justifyContent: 'center',
                }}
              >
                <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                <Typography variant="h6" fontWeight={700} sx={{ color: '#22c55e' }}>
                  {correctCount}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Correct
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  justifyContent: 'center',
                }}
              >
                <CancelIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                <Typography variant="h6" fontWeight={700} sx={{ color: '#ef4444' }}>
                  {wrongCount}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Wrong
              </Typography>
            </Box>

            {unanswered > 0 && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={700} color="text.disabled">
                  {unanswered}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Unanswered
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ReplayIcon />}
          onClick={() => router.push('/dashboard/mock-tests')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#667eea',
            color: '#667eea',
          }}
        >
          Take Another Test
        </Button>
      </Box>

      {/* Detailed Review */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Detailed Review
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {questions.map((q, index) => {
          const response = responseMap.get(q.id);
          const isCorrect = response?.isCorrect || false;
          const selectedAnswer = response?.selectedAnswer || [];
          const timeTaken = response?.timeTaken || 0;
          const isRtl = q.alignment === 'left';

          return (
            <Card
              key={q.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${
                  isCorrect
                    ? 'rgba(34, 197, 94, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)'
                }`,
                backgroundColor: isCorrect
                  ? 'rgba(34, 197, 94, 0.02)'
                  : 'rgba(239, 68, 68, 0.02)',
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={600} sx={{ mb: q.passage ? 1 : 0 }}>
                      <Box component="span" sx={{ color: '#667eea', mr: 1 }}>
                        Q{index + 1}.
                      </Box>
                      {q.question}
                    </Typography>
                    {q.passage && (
                      <Box
                        sx={{
                          mt: 0.5,
                          p: 1.5,
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
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={<TimerIcon />}
                      label={`${timeTaken}s`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    {isCorrect ? (
                      <CheckCircleIcon sx={{ color: '#22c55e' }} />
                    ) : (
                      <CancelIcon sx={{ color: '#ef4444' }} />
                    )}
                  </Box>
                </Box>

                {/* Additional Options (TS2) */}
                {q.additionalOptions && q.additionalOptions.length > 0 && (
                  <Box
                    sx={{
                      mb: 2,
                      pl: isRtl ? 0 : 2,
                      pr: isRtl ? 2 : 0,
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
                          <Typography key={index} variant="body2" color="text.secondary" sx={{ py: 0.2 }}>
                            <Box
                              component="span"
                              sx={{ fontWeight: 700, color: '#f093fb', mr: 0.5, textTransform: 'lowercase' }}
                            >
                              {label}.
                            </Box>
                            {value}
                          </Typography>
                        );
                      })}
                  </Box>
                )}

                <Divider sx={{ mb: 1.5, opacity: 0.3 }} />

                {/* Options Review */}
                {q.options.map((opt, i) => {
                  const key = Object.keys(opt)[0];
                  const value = opt[key];
                  const isSelected = selectedAnswer.includes(value);
                  const isAnswer = q.answer.includes(value);

                  return (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        py: 0.6,
                        px: 1.5,
                        mb: 0.5,
                        borderRadius: 1.5,
                        backgroundColor: isAnswer
                          ? 'rgba(34, 197, 94, 0.08)'
                          : isSelected
                          ? 'rgba(239, 68, 68, 0.08)'
                          : 'transparent',
                        border: isAnswer
                          ? '1px solid rgba(34, 197, 94, 0.2)'
                          : isSelected
                          ? '1px solid rgba(239, 68, 68, 0.2)'
                          : '1px solid transparent',
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color: isAnswer
                            ? '#22c55e'
                            : isSelected
                            ? '#ef4444'
                            : '#667eea',
                          minWidth: 20,
                        }}
                      >
                        {key.toUpperCase()}.
                      </Typography>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {value}
                      </Typography>
                      {isAnswer && (
                        <Chip
                          label="Correct"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            backgroundColor: 'rgba(34, 197, 94, 0.15)',
                            color: '#22c55e',
                          }}
                        />
                      )}
                      {isSelected && !isAnswer && (
                        <Chip
                          label="Your Answer"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444',
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
