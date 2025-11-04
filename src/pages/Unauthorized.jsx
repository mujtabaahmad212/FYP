import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">403</h1>
        <p className="text-2xl md:text-3xl font-light text-gray-800 mb-4">
          Sorry, you are not authorized to access this page.
        </p>
        <p className="text-md text-gray-600 mb-8">
          The page you are looking for requires special permissions.
        </p>
        <Link 
          to="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
