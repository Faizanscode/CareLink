import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCcw } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchUsers, createUser, deleteUser, type User } from '../api/client';

export const Users: React.FC = () => {
 const [users, setUsers] = useState<User[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'COORDINATOR' });

 const loadData = async () => {
 setLoading(true);
 try {
 const data = await fetchUsers();
 setUsers(data);
 setError(null);
 } catch (err) {
 setError('Failed to fetch users');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadData();
 }, []);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 await createUser(formData);
 setIsModalOpen(false);
 setFormData({ name: '', email: '', phone: '', password: '', role: 'COORDINATOR' });
 loadData();
 } catch (err) {
 alert('Failed to create user');
 }
 };

 const handleDelete = async (id: number) => {
 if (confirm('Delete User?')) {
 try {
 await deleteUser(id);
 loadData();
 } catch (err) {
 alert('Failed to delete user');
 }
 }
 };

 return (
 <div className="max-w-7xl mx-auto space-y-8 pb-12">
 <div className="flex justify-between items-center">
 <PageHeader title="User Management" description="Manage staff and coordinator access." />
 <button onClick={() => setIsModalOpen(true)} className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold">
 <Plus size={20} className="mr-2" /> Add User
 </button>
 </div>

 {loading ? (
 <div className="flex justify-center py-10"><RefreshCcw className="animate-spin text-muted-foreground" /></div>
 ) : error ? (
 <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
 ) : (
 <div className="bg-card border border-border rounded-[32px] shadow-sm overflow-hidden mt-8">
 <div className="overflow-x-auto">
 <table className="w-full text-left whitespace-nowrap">
 <thead>
 <tr className="bg-muted/30 text-muted-foreground text-[11px] uppercase tracking-widest border-b border-border">
 <th className="px-8 py-5 font-semibold">Name</th>
 <th className="px-8 py-5 font-semibold">Email</th>
 <th className="px-8 py-5 font-semibold">Role</th>
 <th className="px-8 py-5 font-semibold">Status</th>
 <th className="px-8 py-5 font-semibold text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {users.filter(u => u.is_active).map((user) => (
 <tr key={user.id} className="hover:bg-muted transition-colors">
 <td className="px-8 py-5 font-medium">{user.name}</td>
 <td className="px-8 py-5 text-muted-foreground">{user.email}</td>
 <td className="px-8 py-5"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">{user.role}</span></td>
 <td className="px-8 py-5"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Active</span></td>
 <td className="px-8 py-5 text-right space-x-3">
 <button onClick={() => handleDelete(user.id)} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={18}/></button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {isModalOpen && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
 <div className="bg-card w-full max-w-lg rounded-[32px] shadow-xl p-8 border border-border">
 <h2 className="text-2xl font-bold mb-6 tracking-tight">Add User</h2>
 <form onSubmit={handleSubmit} className="space-y-5">
 <div>
 <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Name</label>
 <input required type="text" className="w-full px-4 py-3 border border-border rounded-xl bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
 </div>
 <div>
 <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Email</label>
 <input required type="email" className="w-full px-4 py-3 border border-border rounded-xl bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-colors" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
 </div>
 <div>
 <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Password</label>
 <input required type="password" className="w-full px-4 py-3 border border-border rounded-xl bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-colors" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
 </div>
 <div>
 <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Role</label>
 <select className="w-full px-4 py-3 border border-border rounded-xl bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-colors" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
 <option value="SUPER_ADMIN">SUPER_ADMIN</option>
 <option value="HOSPITAL_ADMIN">HOSPITAL_ADMIN</option>
 <option value="DOCTOR">DOCTOR</option>
 <option value="COORDINATOR">COORDINATOR</option>
 </select>
 </div>
 <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-border">
 <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors">Cancel</button>
 <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg transition-all">Add User</button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
};
