import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
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

const ALL_POSSIBLE_SLOTS_TEMPLATE = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const StatCard = ({ title, count, color, icon }: { title: string; count: number; color: string; icon: string }) => (
  <div style={{ 
    background: color, 
    color: 'white', 
    padding: '20px', 
    borderRadius: '12px', 
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}>
    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>{count}</div>
    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{title}</div>
  </div>
);

const thStyle = {
  padding: '12px',
  textAlign: 'right' as const,
  fontWeight: 'bold',
  fontSize: '0.9rem'
};

const tdStyle = {
  padding: '12px',
  textAlign: 'right' as const,
  fontSize: '0.85rem'
};

const actionBtnStyle = (type: 'green' | 'red') => ({
  padding: '6px 12px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  background: type === 'green' ? '#27ae60' : '#e74c3c',
  color: 'white',
  fontSize: '0.9rem'
});

const secondaryBtnStyle = {
  background: '#95a5a6',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '0.85rem'
};

const deleteBtnStyle = {
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '0.85rem'
};

export function AdminDashboard({ isAdmin }: { isAdmin: boolean }) {
  const [apps, setApps] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  const [configDate, setConfigDate] = useState(getTomorrowDate());
  const [configSlots, setConfigSlots] = useState<string[]>([]);
  const [existingConfigId, setExistingConfigId] = useState<number | null>(null);

  const fetchApps = useCallback(async () => {
    try {
      const res = await axios.get<Appointment[]>('https://backend-eosin-three-61.vercel.app/clients');
      setApps(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await axios.get<DayAvailability[]>(`https://backend-eosin-three-61.vercel.app/availability?date=${configDate}`);
      if (res.data.length > 0) {
        setConfigSlots(res.data[0].slots);
        setExistingConfigId(res.data[0].id || null);
      } else {
        setConfigSlots([]);
        setExistingConfigId(null);
      }
    } catch (e) {
      console.error(e);
    }
  }, [configDate]);

  useEffect(() => {
    const initializeAdminData = async () => {
      if (isAdmin) {
        await fetchApps();
        await fetchConfig();
      }
    };

    initializeAdminData();
  }, [isAdmin, fetchApps, fetchConfig]);

  if (!isAdmin) return <Navigate to="/login" />;

  const filteredApps = apps.filter(a => filter === 'All' ? true : a.status === filter);

  const stats = {
    total: apps.length,
    accepted: apps.filter(a => a.status === 'Accepted').length,
    pending: apps.filter(a => a.status === 'Pending').length,
    rejected: apps.filter(a => a.status === 'Rejected').length,
  };

  const saveAvailability = async () => {
    try {
      if (existingConfigId) {
        await axios.put(`https://backend-eosin-three-61.vercel.app/availability/${existingConfigId}`, { date: configDate, slots: configSlots });
      } else {
        await axios.post('https://backend-eosin-three-61.vercel.app/availability', { date: configDate, slots: configSlots });
        fetchConfig();
      }
      toast.success('تم تحديث أوقات العمل');
    } catch { 
      toast.error('خطأ في الحفظ'); 
    }
  };

  const toggleSlotConfig = (slot: string) => {
    setConfigSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredApps.length) setSelectedIds([]);
    else setSelectedIds(filteredApps.map(a => a.id));
  };

  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  
  const handleDeleteSelected = async () => {
    if (window.confirm(`حذف ${selectedIds.length} عنصر؟`)) {
      await Promise.all(selectedIds.map(id => axios.delete(`https://backend-eosin-three-61.vercel.app/appointments/${id}`)));
      toast.success('تم الحذف'); 
      setSelectedIds([]); 
      fetchApps();
    }
  };

  const updateStatus = async (id: number, status: string) => {
    await axios.patch(`https://backend-eosin-three-61.vercel.app/appointments/${id}/status`, { status }); 
    fetchApps();
  };

  return (
    <div style={{ 
      padding: '15px',
      direction: 'rtl', 
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/صووووووووووورة.jpg')`,
      backgroundSize: 'cover', 
      backgroundAttachment: 'fixed',
      minHeight: '100vh' 
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ color: '#ffffff', margin: 0 }}>الإدارة</h2>
          <button onClick={() => window.location.href = '/'} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>تسجيل الخروج</button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px', 
          marginBottom: '30px' 
        }}>
          <StatCard title="الإجمالي" count={stats.total} color="#34495e" icon="📂" />
          <StatCard title="مقبولة" count={stats.accepted} color="#27ae60" icon="✅" />
          <StatCard title="انتظار" count={stats.pending} color="#f39c12" icon="⏳" />
          <StatCard title="مرفوضة" count={stats.rejected} color="#e74c3c" icon="❌" />
        </div>

        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px', fontSize: '1.1rem' }}>⚙️ إعداد أوقات العمل</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
            <input type="date" value={configDate} onChange={(e) => setConfigDate(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd', flex: '1', minWidth: '150px' }} />
            <button onClick={saveAvailability} style={{ background: '#2980b9', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', flex: '1' }}>حفظ</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {ALL_POSSIBLE_SLOTS_TEMPLATE.map(slot => (
              <button 
                key={slot} 
                onClick={() => toggleSlotConfig(slot)}
                style={{
                  padding: '6px 10px', borderRadius: '5px', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.8rem',
                  background: configSlots.includes(slot) ? '#2ecc71' : '#fff',
                  color: configSlots.includes(slot) ? '#fff' : '#7f8c8d'
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {['All', 'Pending', 'Accepted', 'Rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', fontSize: '0.8rem', background: filter === f ? '#2c3e50' : '#ecf0f1', color: filter === f ? 'white' : '#7f8c8d', cursor: 'pointer' }}>
                {f === 'All' ? 'الكل' : f === 'Pending' ? 'انتظار' : f === 'Accepted' ? 'مقبول' : 'مرفوض'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            <button onClick={handleSelectAll} style={{...secondaryBtnStyle, padding: '5px 15px'}}>{selectedIds.length === filteredApps.length && filteredApps.length > 0 ? "إلغاء التحديد" : "تحديد الكل"}</button>
            {selectedIds.length > 0 && <button onClick={handleDeleteSelected} style={{...deleteBtnStyle, padding: '5px 15px'}}>حذف ({selectedIds.length})</button>}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '15px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                <th style={thStyle}>-</th>
                <th style={thStyle}>المريض</th>
                <th style={thStyle}>التاريخ</th>
                <th style={thStyle}>الوقت</th>
                <th style={thStyle}>الحالة</th>
                <th style={thStyle}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                  <td style={tdStyle}><input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleSelect(a.id)} style={{ width: '18px', height: '18px' }} /></td>
                  <td style={tdStyle}><b>{a.name}</b><br/><small style={{color:'#7f8c8d'}}>{a.phone}</small></td>
                  <td style={tdStyle}>{a.appointment_date}</td>
                  <td style={tdStyle}>{a.appointment_time}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', background: a.status==='Accepted'?'#eafaf1':a.status==='Rejected'?'#fdedec':'#fef9e7', color: a.status==='Accepted'?'#27ae60':a.status==='Rejected'?'#e74c3c':'#f39c12' }}>
                      {a.status === 'Pending' ? 'منتظر' : a.status === 'Accepted' ? 'مقبول' : 'مرفوض'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => updateStatus(a.id, 'Accepted')} style={actionBtnStyle('green')}>✔️</button>
                      <button onClick={() => updateStatus(a.id, 'Rejected')} style={actionBtnStyle('red')}>❌</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredApps.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#95a5a6' }}>لا توجد بيانات</p>}
        </div>
      </div>
    </div>
  );
}