import React from 'react';

export const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="mt-3 text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
};
