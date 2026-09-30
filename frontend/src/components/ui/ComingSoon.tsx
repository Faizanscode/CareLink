import React from 'react';
import { Clock } from 'lucide-react';
import { PageHeader } from './PageHeader';

export const ComingSoon: React.FC<{ title: string }> = ({ title }) => {
 return (
 <div className="p-6">
 <PageHeader title={title} />
 <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
 <Clock size={48} className="text-slate-300 mb-4" />
 <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
 <p className="text-muted-foreground text-center max-w-md">
 This module will be implemented in a later phase. Stay tuned for updates!
 </p>
 </div>
 </div>
 );
};
