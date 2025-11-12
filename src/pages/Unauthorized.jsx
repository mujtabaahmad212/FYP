import React from 'react';
import { AlertTriangle, ArrowLeft, Home, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 text-center animate-in">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>

          {/* Error Message */}
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">
            You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
          </p>

          {/* Error Details */}
          <div className="p-4 bg-slate-50 rounded-xl mb-6 text-left">
            <p className="text-xs text-slate-600 font-mono">
              Error Code: 403 Forbidden
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/viewer')}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t-2 border-slate-200">
            <p className="text-xs text-slate-600 mb-3">Need help?</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Contact Support
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 text-slate-600 text-sm">
            <Shield className="w-4 h-4" />
            Protected by SecureWatch
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
