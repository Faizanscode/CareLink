import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import { Hospitals } from './pages/Hospitals';
import { HospitalDetail } from './pages/HospitalDetail';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Referrals } from './pages/Referrals';
import { ReceivingReferrals } from './pages/ReceivingReferrals';
import { NewReferral } from './pages/NewReferral';
import { ReferralDetail } from './pages/ReferralDetail';
import { Documents } from './pages/Documents';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="referrals/new" element={<NewReferral />} />
            <Route path="referrals/:id" element={<ReferralDetail />} />
            <Route path="receiving-referrals" element={<ReceivingReferrals />} />
            <Route path="receiving-referrals/:id" element={<ReferralDetail isReceiving={true} />} />
            <Route path="hospitals" element={<Hospitals />} />
            <Route path="hospitals/:id" element={<HospitalDetail />} />
            <Route path="documents" element={<Documents />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<div className="p-8">Page Not Found</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
