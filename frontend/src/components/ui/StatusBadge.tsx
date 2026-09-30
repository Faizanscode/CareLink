import React from 'react';

interface Props {
 status: string;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
 const getColors = () => {
 switch (status) {
 case 'Available':
 case 'Accepted':
 case 'Completed':
 return 'bg-green-100 text-green-800 ';
 case 'Limited Capacity':
 case 'Reviewing':
 return 'bg-amber-100 text-amber-800 ';
 case 'Pending':
 return 'bg-muted text-foreground ';
 case 'Data Needs Update':
 return 'bg-red-100 text-red-800 ';
 case 'In Transit':
 return 'bg-blue-100 text-blue-800 ';
 default:
 return 'bg-muted text-foreground ';
 }
 };

 return (
 <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getColors()}`}>
 {status}
 </span>
 );
};
