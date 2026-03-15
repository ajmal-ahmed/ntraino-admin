'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmailIcon from '@mui/icons-material/Email';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.replace('/login');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    // Show loading spinner while checking auth state
    if (loading || !user) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    const userInitial = user.email ? user.email.charAt(0).toUpperCase() : '?';

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 2,
            }}
        >
            <Fade in timeout={600}>
                <Card
                    elevation={12}
                    sx={{
                        maxWidth: 500,
                        width: '100%',
                        borderRadius: 4,
                        overflow: 'hidden',
                        backdropFilter: 'blur(20px)',
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(30, 30, 50, 0.85)'
                                : 'rgba(255, 255, 255, 0.95)',
                    }}
                >
                    <Box
                        sx={{
                            height: 6,
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                        }}
                    />
                    <CardContent sx={{ p: 4 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                mb: 4,
                            }}
                        >
                            <Avatar
                                sx={{
                                    mb: 2,
                                    width: 72,
                                    height: 72,
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                                }}
                            >
                                {userInitial}
                            </Avatar>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DashboardIcon
                                    sx={{
                                        color: (theme) =>
                                            theme.palette.mode === 'dark' ? '#a78bfa' : '#667eea',
                                    }}
                                />
                                <Typography
                                    variant="h4"
                                    fontWeight={700}
                                    sx={{
                                        background: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'linear-gradient(135deg, #a78bfa, #f093fb)'
                                                : 'linear-gradient(135deg, #667eea, #764ba2)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    Dashboard
                                </Typography>
                            </Box>
                            <Typography variant="body1" color="text.secondary">
                                Welcome back! You&apos;re signed in.
                            </Typography>
                        </Box>

                        <Card
                            variant="outlined"
                            sx={{
                                mb: 3,
                                borderRadius: 3,
                                borderColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(167, 139, 250, 0.2)'
                                        : 'rgba(102, 126, 234, 0.2)',
                                backgroundColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(167, 139, 250, 0.05)'
                                        : 'rgba(102, 126, 234, 0.04)',
                            }}
                        >
                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <EmailIcon fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Signed in as
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {user.email}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Chip
                                        label="Active"
                                        size="small"
                                        sx={{
                                            backgroundColor: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(34, 197, 94, 0.15)'
                                                    : 'rgba(34, 197, 94, 0.1)',
                                            color: '#22c55e',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>

                        <Button
                            id="signout-button"
                            fullWidth
                            variant="outlined"
                            startIcon={<LogoutIcon />}
                            onClick={handleSignOut}
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: '1rem',
                                textTransform: 'none',
                                borderColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(167, 139, 250, 0.4)'
                                        : 'rgba(102, 126, 234, 0.4)',
                                color: (theme) =>
                                    theme.palette.mode === 'dark' ? '#a78bfa' : '#667eea',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: (theme) =>
                                        theme.palette.mode === 'dark' ? '#a78bfa' : '#667eea',
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(167, 139, 250, 0.08)'
                                            : 'rgba(102, 126, 234, 0.06)',
                                    transform: 'translateY(-1px)',
                                },
                            }}
                        >
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </Fade>
        </Box>
    );
}
