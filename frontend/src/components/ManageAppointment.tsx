import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Appointment {
  id: number;
  name: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

interface DayAvailability {
  id?: number;
  date: string;
  slots: string[];
}

const inputStyle = {
  flex: 1,
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid #ddd',
  outline: 'none'
};

const backBtnStyle = {
  position: 'fixed' as const,
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  zIndex: 10
};

export function ManageAppointment() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [myApps, setMyApps] = useState<Appointment[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  console.log(loadingSlots);

  const fetchMyData = async () => {
    if (!phone) return;
    try {   
      const res = await axios.get<Appointment[]>('https://backend-eosin-three-61.vercel.app/clients');
      const filtered = res.data.filter(a => a.phone === phone);
      setMyApps(filtered);
      setHasSearched(true);
    } catch { 
      toast.error("خطأ في جلب البيانات"); 
    }
  };

  const startEdit = async (app: Appointment) => {
    setEditingId(app.id);
    setNewTime(app.appointment_time);
    setLoadingSlots(true);
    try {
      const availRes = await axios.get<DayAvailability[]>(`https://backend-eosin-three-61.vercel.app/availability?date=${app.appointment_date}`);
      const appsRes = await axios.get<Appointment[]>('https://backend-eosin-three-61.vercel.app/clients');
      const taken = appsRes.data
        .filter(a => a.appointment_date === app.appointment_date && a.id !== app.id && a.status !== 'Rejected')
        .map(a => a.appointment_time);
      setAvailableSlots(availRes.data[0]?.slots || []);
      setBookedSlots(taken);
    } catch { 
      toast.error("خطأ في تحميل الأوقات"); 
    } finally { 
      setLoadingSlots(false); 
    }
  };

  const saveEdit = async (id: number) => {
    try {
      await axios.patch(`https://backend-eosin-three-61.vercel.app/appointments/${id}/status`, { appointment_time: newTime, status: 'Pending' });
      toast.success("تم التحديث");
      setEditingId(null);
      fetchMyData();
    } catch { 
      toast.error("فشل في الحفظ"); 
    }
  };

  const deleteApp = async (id: number) => {
    if (window.confirm("هل تريد حذف الحجز؟")) {
      try {
        await axios.delete(`https://backend-eosin-three-61.vercel.app/appointments/${id}`);
        toast.success("تم الحذف");
        fetchMyData();
      } catch { 
        toast.error("فشل الحذف"); 
      }
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/صووووووووووورة.jpg')`,
      backgroundSize: 'cover',
      direction: 'rtl', 
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden',
      fontFamily: 'sans-serif'
    }}>
      <button onClick={() => navigate('/')} style={{ ...backBtnStyle, top: '15px', right: '15px', padding: '8px 15px', fontSize: '0.8rem' }}>
        ↪️ رجوع
      </button>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '20px', 
        borderRadius: '20px', 
        width: '350px', 
        maxHeight: '85vh',
        boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '12px', fontSize: '1.1rem' }}>🔍 إدارة مواعيدي</h3>
        
        <div style={{ display: 'flex', gap: '5px', marginBottom: '12px' }}>
          <input 
            placeholder="رقم الهاتف..." 
            style={{ ...inputStyle, padding: '10px', fontSize: '0.85rem' }} 
            value={phone} 
            onChange={(e) => { setPhone(e.target.value); setHasSearched(false); }} 
          />
          <button onClick={fetchMyData} style={{ background: '#3498db', color: 'white', border: 'none', padding: '0 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>بحث</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px', scrollbarWidth: 'thin' }}>
          {myApps.length > 0 ? myApps.map(app => (
            <div key={app.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '12px', marginBottom: '8px', background: '#f8f9fa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem' }}>
                  <p style={{ margin: '0', fontWeight: 'bold' }}>📅 {app.appointment_date}</p>
                  <p style={{ margin: '2px 0' }}>⏰ {app.appointment_time}</p>
                  <span style={{ fontSize: '0.7rem', color: app.status === 'Accepted' ? '#27ae60' : '#e67e22', fontWeight: 'bold' }}>
                    {app.status === 'Pending' ? '⏳ انتظار' : app.status === 'Accepted' ? '✅ مقبول' : '❌ مرفوض'}
                  </span>
                </div>
                {editingId !== app.id && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => startEdit(app)} style={{ background: '#f39c12', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}>تعديل</button>
                    <button onClick={() => deleteApp(app.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}>حذف</button>
                  </div>
                )}
              </div>

              {editingId === app.id && (
                <div style={{ marginTop: '8px', padding: '8px', borderTop: '1px dashed #ccc' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                    {availableSlots.filter(s => !bookedSlots.includes(s) || s === app.appointment_time).map(s => (
                      <button 
                        key={s} 
                        onClick={() => setNewTime(s)} 
                        style={{
                          padding: '4px 0', fontSize: '0.7rem', borderRadius: '5px', border: '1px solid #ddd',
                          background: newTime === s ? '#3498db' : '#fff',
                          color: newTime === s ? '#fff' : '#333'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    <button onClick={() => saveEdit(app.id)} style={{ flex: 1, background: '#27ae60', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>حفظ</button>
                    <button onClick={() => setEditingId(null)} style={{ flex: 1, background: '#95a5a6', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '0.75rem' }}>إلغاء</button>
                  </div>
                </div>
              )}
            </div>
          )) : (hasSearched && (
            <div style={{ textAlign: 'center', padding: '12px', background: '#fff0f0', borderRadius: '10px', color: '#c0392b', fontSize: '0.8rem' }}>
              لا توجد مواعيد
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}