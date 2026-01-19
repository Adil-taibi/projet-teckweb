import { useState } from 'react';
import { Routes, Route} from 'react-router-dom';
import  { Toaster } from 'react-hot-toast';




// الأوقات الافتراضية للاختيار منها عند الإعداد
const ALL_POSSIBLE_SLOTS_TEMPLATE: string[] = []; 
for (let i = 8; i <= 17; i++) {
  const hour = i < 10 ? `0${i}` : i;
  ALL_POSSIBLE_SLOTS_TEMPLATE.push(`${hour}:00`);
  if (i !== 17) ALL_POSSIBLE_SLOTS_TEMPLATE.push(`${hour}:30`);
}

import { WelcomePage } from './components/WelcomePage';
import { AdminDashboard } from './components/AdminDashboard';
import { BookPage } from './components/BookPage';
import { ManageAppointment } from './components/ManageAppointment';
import { LoginPage } from './components/LoginPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <div><Toaster position="top-center" /><Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/manage" element={<ManageAppointment />} />
        <Route path="/login" element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/admin" element={<AdminDashboard isAdmin={isLoggedIn} />} />
    </Routes></div>
  );
}


