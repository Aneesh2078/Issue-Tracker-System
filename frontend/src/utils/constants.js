export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const STATUSES = ['Open', 'In Progress', 'Closed'];

export const STATUS_CONFIG = {
  Open: {
    label: 'Open',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-600',
    color: '#2563EB'
  },
  'In Progress': {
    label: 'In Progress',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    color: '#F97316'
  },
  Closed: {
    label: 'Closed',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-600',
    color: '#16A34A'
  }
};

export const PRIORITY_CONFIG = {
  Low: {
    label: 'Low',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    color: '#64748B'
  },
  Medium: {
    label: 'Medium',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    color: '#2563EB'
  },
  High: {
    label: 'High',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    color: '#F59E0B'
  },
  Critical: {
    label: 'Critical',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    color: '#DC2626'
  }
};

