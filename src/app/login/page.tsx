'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Fade from '@mui/material/Fade';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, loading } = useAuth();
    const router = useRouter();

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (!loading && user) {
            router.replace('/dashboard');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/dashboard');
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            switch (firebaseError.code) {
                case 'auth/invalid-email':
                    setError('Invalid email address.');
                    break;
                case 'auth/user-not-found':
                    setError('No account found with this email.');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password.');
                    break;
                case 'auth/invalid-credential':
                    setError('Invalid email or password.');
                    break;
                case 'auth/too-many-requests':
                    setError('Too many failed attempts. Please try again later.');
                    break;
                default:
                    setError('An error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading spinner while checking auth state
    if (loading || user) {
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
                        maxWidth: 420,
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
                                mb: 3,
                            }}
                        >
                            <Avatar
                                sx={{
                                    mb: 2,
                                    width: 56,
                                    height: 56,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                                }}
                            >
                                <LockOutlinedIcon fontSize="large" />
                            </Avatar>
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
                                Welcome Back
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Sign in to your account
                            </Typography>
                        </Box>

                        {error && (
                            <Fade in>
                                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            </Fade>
                        )}

                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <TextField
                                id="email"
                                label="Email Address"
                                type="email"
                                fullWidth
                                required
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ mb: 2 }}
                                slotProps={{
                                    input: {
                                        sx: { borderRadius: 2 },
                                    },
                                }}
                            />
                            <TextField
                                id="password"
                                label="Password"
                                type="password"
                                fullWidth
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: 3 }}
                                slotProps={{
                                    input: {
                                        sx: { borderRadius: 2 },
                                    },
                                }}
                            />
                            <Button
                                id="login-button"
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isSubmitting || !email || !password}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 6px 25px rgba(102, 126, 234, 0.6)',
                                        transform: 'translateY(-1px)',
                                    },
                                    '&:active': {
                                        transform: 'translateY(0)',
                                    },
                                }}
                            >
                                {isSubmitting ? (
                                    <CircularProgress size={24} sx={{ color: 'white' }} />
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Fade>
        </Box>
    );
}
