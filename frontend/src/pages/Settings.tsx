import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { ThemeToggle } from '../components/ThemeToggle';

export const Settings: React.FC = () => {
 return (
 <div className="max-w-4xl mx-auto space-y-8 pb-12">
 <PageHeader title="Settings" description="Manage your preferences and system settings." />

 <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
 <div className="p-8 border-b border-border">
 <h2 className="text-xl font-bold mb-6">Account Profile</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div>
 <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Full Name</label>
 <input type="text" disabled value="Dr. Faizan" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 opacity-70 font-medium" />
 </div>
 <div>
 <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Role</label>
 <input type="text" disabled value="Care Coordinator" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 opacity-70 font-medium" />
 </div>
 <div className="md:col-span-2">
 <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Affiliated Hospital</label>
 <input type="text" disabled value="City General Hospital" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 opacity-70 font-medium" />
 </div>
 </div>
 </div>

 <div className="p-8 border-b border-border">
 <h2 className="text-xl font-bold mb-6">Appearance</h2>
 <div className="flex items-center justify-between">
 <div>
 <p className="font-semibold text-lg">Theme Preference</p>
 <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
 </div>
 <ThemeToggle />
 </div>
 </div>

 <div className="p-8">
 <h2 className="text-xl font-bold mb-6">Notifications</h2>
 <div className="flex items-center justify-between">
 <div>
 <p className="font-semibold text-lg">System Notifications</p>
 <p className="text-sm text-muted-foreground">Receive alerts for new referrals</p>
 </div>
 <div className="relative inline-block w-14 mr-2 align-middle select-none transition duration-200 ease-in">
 <input type="checkbox" name="toggle" id="toggle" defaultChecked className="toggle-checkbox absolute block w-7 h-7 rounded-full bg-card border-4 appearance-none cursor-pointer" />
 <label htmlFor="toggle" className="toggle-label block overflow-hidden h-7 rounded-full bg-primary cursor-pointer"></label>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};
