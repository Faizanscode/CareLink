const fs = require('fs');
const path = require('path');

const hospitalsTsx = `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, RefreshCcw, Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { fetchHospitals, createHospital, updateHospital, deleteHospital, Hospital, fetchSpecialties, fetchServices, NameObj } from '../api/client';

export const Hospitals: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [specialties, setSpecialties] = useState<NameObj[]>([]);
  const [services, setServices] = useState<NameObj[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const initialForm = {
    name: '', hospital_code: '', registration_number: '', description: '',
    address: '', city: '', state: '', pincode: '',
    phone: '', email: '', website: '',
    emergency_available: true, operational_status: 'Available', is_active: true,
    capacity: {
      total_beds: 0, available_beds: 0, icu_total: 0, icu_available: 0,
      emergency_beds: 0, emergency_available: 0, ventilators_total: 0, ventilators_available: 0
    },
    specialties: [] as number[],
    services: [] as number[]
  };
  
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const queryParams: any = {};
      if (searchTerm) queryParams.q = searchTerm;
      if (statusFilter !== 'All') queryParams.status = statusFilter;
      
      const data = await fetchHospitals(queryParams);
      setHospitals(data);
      
      const specs = await fetchSpecialties();
      setSpecialties(specs);
      
      const srvs = await fetchServices();
      setServices(srvs);
      
      setError(null);
    } catch (err) {
      setError('Failed to connect to the backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (h: Hospital, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(h.id);
    setFormData({
      name: h.name, hospital_code: h.hospital_code, registration_number: h.registration_number || '', description: h.description || '',
      address: h.address, city: h.city, state: h.state, pincode: h.pincode,
      phone: h.phone || '', email: h.email || '', website: h.website || '',
      emergency_available: h.emergency_available, operational_status: h.operational_status, is_active: h.is_active,
      capacity: h.capacity ? { ...h.capacity } : initialForm.capacity,
      specialties: h.specialties.map(s => s.id),
      services: h.services.map(s => s.id)
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete Hospital?')) {
      try {
        await deleteHospital(id);
        alert('Hospital deleted successfully');
        loadData();
      } catch (err) {
        alert('Failed to delete hospital');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateHospital(editingId, formData);
        alert('Hospital updated successfully');
      } else {
        await createHospital(formData);
        alert('Hospital created successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Error saving hospital: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <PageHeader title="Hospitals" description="Directory of connected healthcare facilities and current capacity." />
        <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow hover:bg-primary/90 transition-colors">
          <Plus size={18} className="mr-2" /> Add Hospital
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search hospitals by name, code, city..."
            className="pl-10 pr-4 py-2 w-full bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-slate-400" />
          </div>
          <select
            className="pl-10 pr-8 py-2 w-full bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Limited Capacity">Limited Capacity</option>
            <option value="Temporarily Unavailable">Temporarily Unavailable</option>
            <option value="Data Needs Update">Data Needs Update</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-500">
          <RefreshCcw className="animate-spin mr-2" /> Loading hospitals...
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-dashed border-red-300 rounded-xl bg-red-50 dark:bg-red-900/10">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {hospitals.map((hospital) => (
            <div 
              key={hospital.id}
              onClick={() => navigate(\`/hospitals/\${hospital.id}\`)}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col group relative"
            >
              <div className="absolute top-4 right-4 hidden group-hover:flex space-x-2 z-10">
                <button onClick={(e) => openEditModal(hospital, e)} className="p-1.5 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 hover:text-primary"><Edit size={14}/></button>
                <button onClick={(e) => handleDelete(hospital.id, e)} className="p-1.5 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 hover:text-red-500"><Trash2 size={14}/></button>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="pr-16">
                  <h3 className="font-bold text-lg leading-tight">{hospital.name}</h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{hospital.hospital_code}</p>
                  <p className="text-slate-500 text-sm flex items-center mt-1">
                    <MapPin size={14} className="mr-1 shrink-0" />
                    <span className="truncate">{hospital.city}, {hospital.state}</span>
                  </p>
                </div>
                <StatusBadge status={hospital.operational_status} />
              </div>
              
              <div className="mt-auto space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Beds: <span className="font-semibold text-slate-700 dark:text-slate-300">{hospital.capacity?.available_beds || 0}/{hospital.capacity?.total_beds || 0}</span></span>
                  <span className="text-slate-500">ICU: <span className="font-semibold text-slate-700 dark:text-slate-300">{hospital.capacity?.icu_available || 0}/{hospital.capacity?.icu_total || 0}</span></span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 border-t border-border pt-3 mt-3">
                  <span className="truncate max-w-[60%]">
                    {hospital.specialties.map(s => s.name).join(', ') || 'No specialties'}
                  </span>
                  <span className={\`shrink-0 \${hospital.freshness === 'fresh' ? 'text-green-500' : hospital.freshness === 'aging' ? 'text-amber-500' : 'text-red-500'}\`}>
                    {hospital.freshness.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && !error && hospitals.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card">
          <p className="text-slate-500">No hospitals found matching your criteria.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-card w-full max-w-4xl rounded-xl shadow-2xl p-6 my-8">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Hospital' : 'Add Hospital'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b border-border pb-2">Basic Info</h3>
                  <div><label className="block text-sm mb-1">Name *</label><input required className="w-full p-2 border rounded bg-transparent" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-sm mb-1">Code *</label><input required className="w-full p-2 border rounded bg-transparent" value={formData.hospital_code} onChange={e => setFormData({...formData, hospital_code: e.target.value})} /></div>
                    <div><label className="block text-sm mb-1">Reg Number</label><input className="w-full p-2 border rounded bg-transparent" value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} /></div>
                  </div>
                  <div><label className="block text-sm mb-1">Status</label>
                    <select className="w-full p-2 border rounded bg-transparent" value={formData.operational_status} onChange={e => setFormData({...formData, operational_status: e.target.value})}>
                      <option value="Available">Available</option>
                      <option value="Limited Capacity">Limited Capacity</option>
                      <option value="Temporarily Unavailable">Temporarily Unavailable</option>
                      <option value="Data Needs Update">Data Needs Update</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b border-border pb-2">Location</h3>
                  <div><label className="block text-sm mb-1">Address *</label><input required className="w-full p-2 border rounded bg-transparent" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="block text-sm mb-1">City *</label><input required className="w-full p-2 border rounded bg-transparent" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
                    <div><label className="block text-sm mb-1">State *</label><input required className="w-full p-2 border rounded bg-transparent" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} /></div>
                    <div><label className="block text-sm mb-1">Pincode *</label><input required className="w-full p-2 border rounded bg-transparent" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} /></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-border pb-2">Capacity</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><label className="block text-xs mb-1">Total Beds</label><input type="number" required className="w-full p-2 border rounded bg-transparent" value={formData.capacity.total_beds} onChange={e => setFormData({...formData, capacity: {...formData.capacity, total_beds: parseInt(e.target.value)}})} /></div>
                  <div><label className="block text-xs mb-1">Avail. Beds</label><input type="number" required className="w-full p-2 border rounded bg-transparent" value={formData.capacity.available_beds} onChange={e => setFormData({...formData, capacity: {...formData.capacity, available_beds: parseInt(e.target.value)}})} /></div>
                  <div><label className="block text-xs mb-1">Total ICU</label><input type="number" required className="w-full p-2 border rounded bg-transparent" value={formData.capacity.icu_total} onChange={e => setFormData({...formData, capacity: {...formData.capacity, icu_total: parseInt(e.target.value)}})} /></div>
                  <div><label className="block text-xs mb-1">Avail. ICU</label><input type="number" required className="w-full p-2 border rounded bg-transparent" value={formData.capacity.icu_available} onChange={e => setFormData({...formData, capacity: {...formData.capacity, icu_available: parseInt(e.target.value)}})} /></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg border-b border-border pb-2 mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2 h-40 overflow-y-auto p-2 border border-border rounded">
                    {specialties.map(spec => (
                      <label key={spec.id} className="flex items-center space-x-2 text-sm w-full sm:w-auto p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                        <input type="checkbox" checked={formData.specialties.includes(spec.id)} 
                          onChange={(e) => {
                            if (e.target.checked) setFormData({...formData, specialties: [...formData.specialties, spec.id]});
                            else setFormData({...formData, specialties: formData.specialties.filter(id => id !== spec.id)});
                          }}
                        />
                        <span>{spec.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg border-b border-border pb-2 mb-3">Services</h3>
                  <div className="flex flex-wrap gap-2 h-40 overflow-y-auto p-2 border border-border rounded">
                    {services.map(srv => (
                      <label key={srv.id} className="flex items-center space-x-2 text-sm w-full sm:w-auto p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                        <input type="checkbox" checked={formData.services.includes(srv.id)} 
                          onChange={(e) => {
                            if (e.target.checked) setFormData({...formData, services: [...formData.services, srv.id]});
                            else setFormData({...formData, services: formData.services.filter(id => id !== srv.id)});
                          }}
                        />
                        <span>{srv.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-border rounded font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded font-medium">Save Hospital</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
`;

fs.writeFileSync(path.join(__dirname, 'src/pages/Hospitals.tsx'), hospitalsTsx, 'utf8');
console.log('Hospitals.tsx generated.');
