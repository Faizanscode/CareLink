import React from 'react';

interface Props {
 priority: string;
}

export const PriorityBadge: React.FC<Props> = ({ priority }) => {
 const getColors = () => {
 switch (priority) {
 case 'EMERGENCY':
 return 'bg-red-100 text-red-800 border border-red-200 ';
 case 'URGENT':
 return 'bg-orange-100 text-orange-800 border border-orange-200 ';
 case 'ROUTINE':
 return 'bg-green-100 text-green-800 border border-green-200 ';
 default:
 return 'bg-muted text-foreground border border-border ';
 }
 };

 return (
 <span className={`px-2 py-0.5 rounded text-xs font-bold ${getColors()}`}>
 {priority}
 </span>
 );
};
