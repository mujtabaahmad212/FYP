import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Search, MapPin, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const ViewerLanding = () => {
  const features = [
    {
      icon: AlertTriangle,
      title: 'Report Incidents',
      description: 'Quickly report security incidents with detailed information',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: Search,
      title: 'Track Reports',
      description: 'Monitor the status of your submitted reports in real-time',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MapPin,
      title: 'Live Location',
      description: 'Share precise incident locations with interactive maps',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'Quick Response',
      description: 'Get fast responses from our security team 24/7',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center mb-16 animate-in">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-2xl mb-6 animate-bounce-subtle">
              <Shield className="w-12 h-12 text-white" />
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-gradient">SIMS</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-700 mb-4 max-w-3xl mx-auto font-medium">
              Advanced Security Incident Management System
            </p>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Report, track, and manage security incidents with our intelligent monitoring platform.
              Real-time response and comprehensive analytics at your fingertips.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link
                to="/report-incident"
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <AlertTriangle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Report an Incident
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-2xl font-bold text-lg hover:border-blue-400 hover:shadow-lg transition-all duration-300"
              >
                <Shield className="w-6 h-6" />
                Staff Login
              </Link>
            </div>

            {/* Track Link */}
            <Link
              to="/track"
              className="inline-flex items-center gap-2 mt-6 text-blue-600 hover:text-blue-700 font-semibold group"
            >
              <Search className="w-5 h-5" />
              Track Your Report
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="card group hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {[
              { label: 'Incidents Managed', value: '10,000+' },
              { label: 'Response Time', value: '< 5 min' },
              { label: 'Success Rate', value: '98%' },
              { label: 'Active Officers', value: '150+' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white transition-all">
                <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">
              © 2025 SIMS. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm text-slate-600 hover:text-blue-600 transition">Privacy Policy</Link>
              <Link to="/login" className="text-sm text-slate-600 hover:text-blue-600 transition">Terms of Service</Link>
              <Link to="/login" className="text-sm text-slate-600 hover:text-blue-600 transition">Contact Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerLanding;
