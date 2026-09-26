import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AuthGate } from './components/common/AuthGate';
import { PasswordResetPage } from './components/common/PasswordResetPage';
import { PatientAccessPage } from './components/security/PatientAccessPage';
import { SecureClinic } from './components/security/SecureClinic';

export default function App() {
  if (window.location.pathname === '/auth/action') return <PasswordResetPage />;
  if (window.location.pathname === '/patient-access') return <PatientAccessPage />;
  return <AuthProvider><AuthGate><SecureClinic /></AuthGate></AuthProvider>;
}
