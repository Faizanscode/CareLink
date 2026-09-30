import React from 'react';

interface Props {
 title: string;
 value: string | number;
 icon?: React.ReactNode;
}

export const StatCard: React.FC<Props> = ({ title, value, icon }) => {
 return (
 <div className="bg-card text-card-foreground border border-border p-6 rounded-xl shadow-sm">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-medium text-muted-foreground ">{title}</h3>
 {icon && <div className="text-primary">{icon}</div>}
 </div>
 <p className="text-3xl font-semibold mt-2">{value}</p>
 </div>
 );
};
