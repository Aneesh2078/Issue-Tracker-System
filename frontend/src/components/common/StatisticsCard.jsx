import React from 'react';

export const StatisticsCard = ({ title, count, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    slate: 'text-slate-600 bg-slate-100 border-slate-200'
  };

  const activeColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {count !== undefined && count !== null ? count : '—'}
          </p>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-md border flex items-center justify-center ${activeColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
