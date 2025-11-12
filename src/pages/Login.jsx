import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, loginAsGuest, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Forgot password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    try {
      if (!resetEmail) {
        setError('Enter your email to reset password.');
        return;
      }
      await import('firebase/auth').then(({ sendPasswordResetEmail }) =>
        sendPasswordResetEmail(require('../utils/firebase').auth, resetEmail)
      );
      setResetSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
    }
  };

  // Only admin/officer login, no signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Only admin/officer accounts can login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAsGuest();
      navigate('/viewer', { replace: true });
    } catch (err) {
      setError('Guest login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Google login failed. Only admin/officer accounts can login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            SecureWatch
          </h1>
          <p className="text-slate-600 mt-2">Security Incident Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <h2 className="text-2xl font-bold mb-2">Admin/Officer Login</h2>
          <p className="text-slate-600 mb-6">
            Only approved accounts can access the dashboard.
          </p>

          {/* Error or success messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          {resetSent && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
              Password reset link sent! Check your email.
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-3.5 text-slate-500 hover:text-blue-600"
                  aria-label={showPwd ? "Hide Password" : "Show Password"}>
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          {/* Forgot/Reset Password Flow */}
          <div className="mt-2 text-right">
            <button
              onClick={() => setResetSent(false)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >Forgot password?</button>
          </div>

          {/* Reset password form */}
          {resetSent && (
            <form onSubmit={handleForgotPassword} className="space-y-3 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter your email to reset password
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  autoComplete="email"
                  onChange={e => setResetEmail(e.target.value)}
                  className="input-field"
                  placeholder="your email"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Send Reset Link
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Alternative Login Options */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 border-2 border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Sign in with Google
            </button>

            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full py-3 border-2 border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition disabled:opacity-50"
            >
              Continue as Guest
            </button>
          </div>

          {/* Quick links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              to="/report-incident"
              className="block text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Report an Incident (No Login Required)
            </Link>
            <Link
              to="/track"
              className="block text-sm text-slate-600 hover:text-slate-700"
            >
              Track Your Report
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-semibold text-blue-900 mb-2">Demo Login:</p>
          <div className="text-xs text-blue-800 space-y-1">
            <p><strong>Admin:</strong> admin@securewatch.com / admin123</p>
            <p><strong>Officer:</strong> officer@securewatch.com / officer123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
