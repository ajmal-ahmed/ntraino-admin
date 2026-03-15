'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import SendIcon from '@mui/icons-material/Send';
import TimerIcon from '@mui/icons-material/Timer';

interface Option {
  [key: string]: string;
}

interface Question {
  id: string;
  question: string;
  options: Option[];
  additionalOptions?: Option[];
  alignment: 'right' | 'left';
}

interface MockTestData {
  id: string;
  examinationId: string;
  examinationName: string;
  totalQuestions: number;
}

interface UserAnswer {
  questionId: string;
  selectedAnswer: string[];
  timeTaken: number;
}

export default function TakeTestPage() {
  const router = useRouter();
  const params = useParams();
  const [mockTest, setMockTest] = useState<MockTestData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [questionTimes, setQuestionTimes] = useState<Map<string, number>>(new Map());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch mock test
      const testRes = await fetch(`/api/mock-tests/${params.id}`);
      const testData = await testRes.json();

      if (!testRes.ok) {
        setError(testData.error || 'Failed to load test');
        return;
      }

      if (testData.mockTest.status === 'completed') {
        router.replace(`/dashboard/mock-tests/${params.id}/results`);
        return;
      }

      setMockTest(testData.mockTest);

      // Fetch questions from examination
      const examRes = await fetch(`/api/examinations/${testData.mockTest.examinationId}`);
      const examData = await examRes.json();

      if (examRes.ok) {
        setQuestions(examData.examination.questions);
      } else {
        setError('Failed to load questions');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Question timer
  useEffect(() => {
    if (questions.length === 0) return;

    setQuestionTimer(0);
    timerRef.current = setInterval(() => {
      setQuestionTimer((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, questions.length]);

  const saveQuestionTime = () => {
    if (questions.length === 0) return;
    const qId = questions[currentIndex].id;
    const existing = questionTimes.get(qId) || 0;
    setQuestionTimes(new Map(questionTimes.set(qId, existing + questionTimer)));
  };

  const handleSelectAnswer = (value: string) => {
    const qId = questions[currentIndex].id;
    setAnswers(new Map(answers.set(qId, [value])));
  };

  const handleNext = () => {
    saveQuestionTime();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    saveQuestionTime();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setConfirmDialog(false);
    setSubmitting(true);
    saveQuestionTime();

    try {
      const responses = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answers.get(q.id) || [],
        timeTaken: questionTimes.get(q.id) || 0,
      }));

      const res = await fetch(`/api/mock-tests/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });

      if (res.ok) {
        router.push(`/dashboard/mock-tests/${params.id}/results`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit test');
        setSubmitting(false);
      }
    } catch {
      setError('Network error');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!mockTest || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers.get(currentQuestion.id);
  const answeredCount = answers.size;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isRtl = currentQuestion.alignment === 'left';

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {mockTest.examinationName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Question {currentIndex + 1} of {questions.length}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<TimerIcon />}
            label={formatTime(questionTimer)}
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: '0.9rem',
              borderColor: 'rgba(102, 126, 234, 0.3)',
              color: '#667eea',
            }}
          />
          <Chip
            label={`${answeredCount}/${questions.length} answered`}
            size="small"
            sx={{
              fontWeight: 600,
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              color: '#22c55e',
            }}
          />
        </Box>
      </Box>

      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          mb: 3,
          height: 6,
          borderRadius: 3,
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
          },
        }}
      />

      {/* Question Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.06)',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Question Number Navigator */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
            {questions.map((q, i) => (
              <Box
                key={q.id}
                onClick={() => {
                  saveQuestionTime();
                  setCurrentIndex(i);
                }}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  backgroundColor:
                    i === currentIndex
                      ? '#667eea'
                      : answers.has(q.id)
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'rgba(0,0,0,0.04)',
                  color:
                    i === currentIndex
                      ? 'white'
                      : answers.has(q.id)
                      ? '#22c55e'
                      : 'text.secondary',
                  border:
                    i === currentIndex
                      ? '2px solid #667eea'
                      : answers.has(q.id)
                      ? '2px solid rgba(34, 197, 94, 0.3)'
                      : '2px solid transparent',
                  '&:hover': {
                    backgroundColor:
                      i === currentIndex
                        ? '#667eea'
                        : 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              >
                {i + 1}
              </Box>
            ))}
          </Box>

          {/* Question Text */}
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 3, lineHeight: 1.6, direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}
          >
            <Box component="span" sx={{ color: '#667eea', mr: isRtl ? 0 : 1, ml: isRtl ? 1 : 0 }}>
              Q{currentIndex + 1}.
            </Box>
            {currentQuestion.question}
          </Typography>

          {/* Additional Options (TS2) */}
          {currentQuestion.additionalOptions &&
            currentQuestion.additionalOptions.length > 0 && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(240, 147, 251, 0.04)',
                  border: '1px solid rgba(240, 147, 251, 0.15)',
                  direction: isRtl ? 'rtl' : 'ltr',
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ mb: 1, display: 'block' }}
                >
                  Statements:
                </Typography>
                {currentQuestion.additionalOptions.map((opt, i) => {
                  const key = Object.keys(opt)[0];
                  return (
                    <Typography key={i} variant="body2" sx={{ py: 0.3 }}>
                      <Box
                        component="span"
                        sx={{ fontWeight: 700, color: '#f093fb', mr: 1 }}
                      >
                        {key.toUpperCase()}.
                      </Box>
                      {opt[key]}
                    </Typography>
                  );
                })}
              </Box>
            )}

          {/* Options */}
          <RadioGroup
            value={selectedAnswer?.[0] || ''}
            onChange={(e) => handleSelectAnswer(e.target.value)}
          >
            {currentQuestion.options.map((opt, i) => {
              const key = Object.keys(opt)[0];
              const value = opt[key];
              const isSelected = selectedAnswer?.[0] === value;

              return (
                <FormControlLabel
                  key={i}
                  value={value}
                  control={
                    <Radio
                      sx={{
                        color: 'rgba(0,0,0,0.2)',
                        '&.Mui-checked': { color: '#667eea' },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body1">
                      <Box
                        component="span"
                        sx={{ fontWeight: 700, color: '#667eea', mr: 1 }}
                      >
                        {key.toUpperCase()}.
                      </Box>
                      {value}
                    </Typography>
                  }
                  sx={{
                    mx: 0,
                    mb: 1,
                    py: 1,
                    px: 2,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    backgroundColor: isSelected
                      ? 'rgba(102, 126, 234, 0.06)'
                      : 'transparent',
                    border: `1px solid ${
                      isSelected
                        ? 'rgba(102, 126, 234, 0.3)'
                        : 'rgba(0,0,0,0.06)'
                    }`,
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.04)',
                    },
                  }}
                />
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          disabled={currentIndex === 0}
          onClick={handlePrev}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'rgba(102, 126, 234, 0.3)',
            color: '#667eea',
          }}
        >
          Previous
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {currentIndex === questions.length - 1 ? (
            <Button
              variant="contained"
              endIcon={
                submitting ? (
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                ) : (
                  <SendIcon />
                )
              }
              disabled={submitting}
              onClick={() => setConfirmDialog(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                '&:hover': {
                  boxShadow: '0 6px 25px rgba(34, 197, 94, 0.6)',
                },
              }}
            >
              Submit Test
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<NavigateNextIcon />}
              onClick={handleNext}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      {/* Submit Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={600}>Submit Test?</DialogTitle>
        <DialogContent>
          <Typography>
            You have answered <strong>{answeredCount}</strong> out of{' '}
            <strong>{questions.length}</strong> questions.
          </Typography>
          {answeredCount < questions.length && (
            <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
              {questions.length - answeredCount} question(s) are unanswered and will be marked as incorrect.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            Review
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
