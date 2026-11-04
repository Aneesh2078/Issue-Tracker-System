import React from 'react';

export const FilterDropdown = ({ label, value, onChange, options, allLabel = 'All' }) => {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{label}:</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs bg-white border border-slate-200 rounded-md py-1.5 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors cursor-pointer"
      >
        <option value="">{allLabel}</option>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const name = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {name}
            </option>
          );
        })}
      </select>
    </div>
  );
};

