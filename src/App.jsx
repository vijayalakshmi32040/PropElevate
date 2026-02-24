import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import HomeownerForm from './pages/HomeownerForm';
import HomeownerDashboard from './pages/HomeownerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PropertyPlatform from './pages/PropertyPlatform';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PropertyPlatform />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/homeowner-form" element={<HomeownerForm />} />
        <Route path="/homeowner-dashboard" element={<HomeownerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
