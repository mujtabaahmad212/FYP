import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Phone, MessageSquare, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../utils/firebase';

const Login = () => {
  const { login, signup, loginWithGoogle, loginWithPhone } = useAuth();
  
  const [authMethod, setAuthMethod] = useState('email'); // email, phone

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [recaptcha, setRecaptcha] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible'
    });
    setRecaptcha(verifier);
  }, []);

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please log in.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-phone-number':
        return 'Please enter a valid phone number (e.g., +16505551234).';
      case 'auth/too-many-requests':
        return 'Too many requests. Please try again later.';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleEmailSubmit = async (action) => {
    setLoading(true);
    setError('');
    try {
      if (action === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, 'viewer');
      }
    } catch (err) {
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await loginWithPhone(phoneNumber, recaptcha);
      setConfirmationResult(result);
    } catch (err) {
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await confirmationResult.confirm(verificationCode);
    } catch (err) {
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const renderEmailForm = () => (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5 animate-fadeIn">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
            placeholder="name@example.com"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
            placeholder="••••••••"
            required
          />
        </div>
      </div>
      <div className="flex gap-4">
        <button onClick={() => handleEmailSubmit('login')} disabled={loading} className="w-full btn-primary flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <div className="spinner w-5 h-5 border-2"></div> : <LogIn size={20}/>}
          <span>Sign In</span>
        </button>
        <button onClick={() => handleEmailSubmit('signup')} disabled={loading} className="w-full btn-secondary flex items-center justify-center gap-3 px-6 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-semibold shadow-lg transition-all duration-200 disabled:opacity-50">
          {loading ? <div className="spinner w-5 h-5 border-2"></div> : <UserPlus size={20}/>}
          <span>Sign Up</span>
        </button>
      </div>
    </form>
  );

  const renderPhoneForm = () => (
    <form onSubmit={handlePhoneSubmit} className="space-y-5 animate-fadeIn">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
            placeholder="+16505551234"
            required
          />
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? <div className="spinner w-5 h-5 border-2"></div> : <ArrowRight size={20}/>}
        <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
      </button>
    </form>
  );

  const renderVerificationForm = () => (
    <form onSubmit={handleVerifyCode} className="space-y-5 animate-fadeIn">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
        <div className="relative">
          <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
            placeholder="Enter 6-digit code"
            required
          />
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? <div className="spinner w-5 h-5 border-2"></div> : <LogIn size={20}/>}
        <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full animate-scaleIn border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-xl">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 gradient-text">Welcome to SecureWatch</h1>
          <p className="text-gray-600 mt-2">Please sign in to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-fadeIn">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {confirmationResult ? renderVerificationForm() : (
          <>
            {authMethod === 'email' && renderEmailForm()}
            {authMethod === 'phone' && renderPhoneForm()}

            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">Or continue with</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="space-y-4">
              <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 text-gray-800 rounded-xl hover:bg-gray-100 font-semibold shadow-lg transition-all duration-200 disabled:opacity-50">
                <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.24 44 30.022 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                <span>Sign in with Google</span>
              </button>
              <button onClick={() => setAuthMethod(authMethod === 'email' ? 'phone' : 'email')} disabled={loading} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 text-gray-800 rounded-xl hover:bg-gray-100 font-semibold shadow-lg transition-all duration-200 disabled:opacity-50">
                {authMethod === 'email' ? <Phone size={20}/> : <Mail size={20}/>}
                <span>{authMethod === 'email' ? 'Sign in with Phone' : 'Sign in with Email'}</span>
              </button>
            </div>
          </>
        )}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default Login;
