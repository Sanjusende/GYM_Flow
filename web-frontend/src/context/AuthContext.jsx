import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import confetti from 'canvas-confetti';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [gym, setGym] = useState(() => {
    const saved = localStorage.getItem('gymflow_gym');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('gymflow_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await axiosInstance.get('/auth/me');
          if (res.data.success) {
            setGym(res.data.gym);
            localStorage.setItem('gymflow_gym', JSON.stringify(res.data.gym));
          }
        } catch (err) {
          console.warn('Session expired or server unavailable');
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const saveAuthSession = (tokenData, gymData) => {
    setToken(tokenData);
    setGym(gymData);
    localStorage.setItem('gymflow_token', tokenData);
    localStorage.setItem('gymflow_gym', JSON.stringify(gymData));
  };

  const updateGymSession = (gymData) => {
    setGym((prev) => {
      const updated = { ...prev, ...gymData };
      localStorage.setItem('gymflow_gym', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshGymProfile = async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      if (res.data.success && res.data.gym) {
        updateGymSession(res.data.gym);
        return res.data.gym;
      }
    } catch (err) {
      console.warn('Failed to refresh gym profile:', err);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      if (res.data.success) {
        saveAuthSession(res.data.token, res.data.gym);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  const register = async (gymData) => {
    try {
      const res = await axiosInstance.post('/auth/register', gymData);
      if (res.data.success) {
        return {
          success: true,
          step: res.data.step || 'OTP_SENT',
          phone: res.data.phone,
          email: res.data.email,
          devOtp: res.data.devOtp,
          message: res.data.message,
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const verifyOtp = async (identifier, otp) => {
    try {
      const payload =
        typeof identifier === 'object'
          ? { ...identifier, otp }
          : identifier.includes && identifier.includes('@')
          ? { email: identifier, otp }
          : { phone: identifier, otp };

      const res = await axiosInstance.post('/auth/verify-otp', payload);
      if (res.data.success) {
        saveAuthSession(res.data.token, res.data.gym);
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00F59B', '#10B981', '#3B82F6', '#F59E0B'],
        });
        return { success: true, message: res.data.message, gym: res.data.gym };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'OTP verification failed.',
      };
    }
  };

  const resendOtp = async (identifier) => {
    try {
      const payload =
        typeof identifier === 'object'
          ? identifier
          : identifier.includes && identifier.includes('@')
          ? { email: identifier }
          : { phone: identifier };

      const res = await axiosInstance.post('/auth/resend-otp', payload);
      if (res.data.success) {
        return {
          success: true,
          message: res.data.message,
          email: res.data.email,
          phone: res.data.phone,
          devOtp: res.data.devOtp,
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to resend verification OTP.',
      };
    }
  };

  const demoLogin = async () => {
    try {
      const res = await axiosInstance.post('/auth/demo-login');
      if (res.data.success) {
        saveAuthSession(res.data.token, res.data.gym);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10B981', '#00F59B', '#F59E0B', '#3B82F6'],
        });
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to start Demo session.',
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axiosInstance.put('/auth/profile', profileData);
      if (res.data.success) {
        setGym(res.data.gym);
        localStorage.setItem('gymflow_gym', JSON.stringify(res.data.gym));
        return { success: true, gym: res.data.gym };
      }
      return { success: false, message: res.data.message || 'Failed to update profile.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile.',
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await axiosInstance.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: res.data.message || 'Password reset OTP sent to your email.',
        email: res.data.email,
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to request password reset OTP.',
      };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await axiosInstance.post('/auth/reset-password', { email, otp, newPassword });
      return {
        success: true,
        message: res.data.message || 'Password reset successfully!',
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to reset password.',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setGym(null);
    localStorage.removeItem('gymflow_token');
    localStorage.removeItem('gymflow_gym');
  };

  return (
    <AuthContext.Provider
      value={{
        gym,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        demoLogin,
        updateProfile,
        updateGymSession,
        refreshGymProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
