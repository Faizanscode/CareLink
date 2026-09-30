import React from 'react';

interface Props {
 title: string;
 description?: string;
 actions?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({ title, description, actions }) => {
 return (
 <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold">{title}</h1>
 {description && <p className="text-muted-foreground mt-1">{description}</p>}
 </div>
 {actions && <div>{actions}</div>}
 </div>
 );
};
