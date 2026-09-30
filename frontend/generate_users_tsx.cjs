const fs = require('fs');
const path = require('path');

const usersTsx = `import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, RefreshCcw } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchUsers, createUser, deleteUser, User } from '../api/client';

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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="User Management" description="Manage staff and coordinator access." />
        <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus size={18} className="mr-2" /> Add User
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><RefreshCcw className="animate-spin text-slate-400" /></div>
      ) : error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.filter(u => u.is_active).map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">{user.role}</span></td>
                  <td className="px-6 py-4"><span className="text-green-500 font-medium">Active</span></td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-600"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Add User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" className="w-full p-2 border border-border rounded bg-transparent" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input required type="email" className="w-full p-2 border border-border rounded bg-transparent" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input required type="password" className="w-full p-2 border border-border rounded bg-transparent" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select className="w-full p-2 border border-border rounded bg-transparent" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="HOSPITAL_ADMIN">HOSPITAL_ADMIN</option>
                  <option value="DOCTOR">DOCTOR</option>
                  <option value="COORDINATOR">COORDINATOR</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
`;

fs.writeFileSync(path.join(__dirname, 'src/pages/Users.tsx'), usersTsx, 'utf8');
console.log('Users.tsx generated.');
