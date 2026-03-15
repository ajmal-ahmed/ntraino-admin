'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Grid from '@mui/material/Grid';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';

const cards = [
  {
    title: 'Examinations',
    description: 'Create, manage, and organize your competitive examinations with template uploads.',
    icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
    path: '/dashboard/examinations',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    title: 'Mock Tests',
    description: 'Take practice tests from available examinations and track your scores.',
    icon: <QuizIcon sx={{ fontSize: 40 }} />,
    path: '/dashboard/mock-tests',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to nTraino — your competitive examination platform.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid size={{ xs: 12, sm: 6 }} key={card.title}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)',
                },
              }}
            >
              <CardActionArea onClick={() => router.push(card.path)}>
                <Box
                  sx={{
                    height: 6,
                    background: card.gradient,
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      background: card.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      mb: 2,
                      boxShadow: `0 4px 20px rgba(102, 126, 234, 0.3)`,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
