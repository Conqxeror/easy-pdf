import React from 'react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl border border-gray-200">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
    <p>Loading tool...</p>
  </div>
);

export default LoadingSpinner;
