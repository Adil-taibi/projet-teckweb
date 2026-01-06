import { useState, useEffect,useCallback } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

// --- واجهات البيانات ---
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

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

// الأوقات الافتراضية للاختيار منها عند الإعداد
const ALL_POSSIBLE_SLOTS_TEMPLATE: string[] = []; 
for (let i = 8; i <= 17; i++) {
  const hour = i < 10 ? `0${i}` : i;
  ALL_POSSIBLE_SLOTS_TEMPLATE.push(`${hour}:00`);
  if (i !== 17) ALL_POSSIBLE_SLOTS_TEMPLATE.push(`${hour}:30`);
}

// --- 1. الصفحة الرئيسية ---
export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/صووووووووووورة.jpg')`,
      backgroundSize: 'cover',
      textAlign: 'center', 
      direction: 'rtl',
      fontFamily: 'sans-serif',
      position: 'fixed', // تثبيت كامل للشاشة
      top: 0,
      left: 0,
      overflow: 'hidden' // منع التمرير نهائياً
    }}>
      {/* الكارت الرئيسي - تم ضغط المسافات قليلاً */}
      <div  style={{ 
    width: '400px', 
    display: 'flex',
    flexDirection: 'column',
    padding: '100px',
    // التغيير الأول: stretch بدلاً من center لجعل الأبناء يتمددون
    alignItems: 'stretch', 
    
  }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1px',marginTop: '-50px' }}>🏥</div>
        
        <h1 style={{ 
          fontSize: '1.7rem', 
          color: '#ffffffff', 
          marginBottom: '20px',
          fontWeight: 'bold' 
        }}>
          عيادة السلام
        </h1>
        
        <p style={{ 
          marginBottom: '25px', 
          color: '#ffffffff',
          fontSize: '1rem',
          lineHeight: '1.4'
        }}>
         احجز موعدك الآن
        </p>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          width: '100%' 
        }}>
          <button 
            onClick={() => navigate('/book')} 
            style={{ 
              ...heroBtnStyle, 
              width: '100%', 
              padding: '14px',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              margin: '0' // لضمان عدم وجود هوامش خارجية
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            📅 حجز موعد جديد
          </button>

          <button 
            onClick={() => navigate('/manage')} 
            style={{ 
              ...heroBtnStyle, 
              background: '#3498db', 
              width: '100%', 
              padding: '14px',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              margin: '0',
              marginTop: '15px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            🔍 إدارة مواعيدي
          </button>
        </div>

        <div style={{ 
    marginTop: '25px', 
    width: '100%',
    border: 'none',      // منع أي حدود
    outline: 'none',     // منع أي إطار خارجي
    background: 'none'   // منع أي خلفية قد تبدو كخط
}}>
  <Link 
    to="/login" 
    style={{ 
      color: '#ffffff', 
      marginTop: '50px',
      textDecoration: 'none', // حذف الخط تحت الكلام
      fontSize: '0.85rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px'
    }}
  >
    🔐 دخول بوابة الإدارة
  </Link>
</div>
      </div>

      <p style={{ 
        position: 'absolute', 
        bottom: '15px', 
        color: 'rgba(255,255,255,0.2)', 
        fontSize: '0.75rem',
        width: '100%' 
      }}>
        جميع الحقوق محفوظة © 2025
      </p>
    </div>
  );
}

// --- 2. صفحة الحجز (محدثة لتعتمد على إعدادات الأدمن) ---
export function BookPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', date: getTomorrowDate(), time: '' });
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const availRes = await axios.get<DayAvailability[]>(`https://backend-eosin-three-61.vercel.app/availability?date=${formData.date}`);
        const daySettings = availRes.data[0];
        if (!daySettings || daySettings.slots.length === 0) {
          setAvailableSlots([]); 
          setLoading(false);
          return;
        }
        const appsRes = await axios.get<Appointment[]>('https://backend-eosin-three-61.vercel.app/clients');
        const taken = appsRes.data
          .filter(a => a.appointment_date === formData.date && a.status !== 'Rejected')
          .map(a => a.appointment_time);
        
        setBookedSlots(taken);
        setAvailableSlots(daySettings.slots);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchSlots();
  }, [formData.date]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.time) return toast.error('يرجى اختيار الوقت');
    try {
      await axios.post('https://backend-eosin-three-61.vercel.app/register', formData);
      toast.success('تم الحجز!');
      navigate('/'); 
    } catch { toast.error('فشل في الحجز'); }
  };

  const finalSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

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
      position: 'fixed', // تثبيت الصفحة لمنع أي حركة اهتزازية أو تمرير
      top: 0,
      left: 0,
      fontFamily: 'sans-serif',
      overflow: 'hidden' // منع التمرير الخارجي نهائياً
    }}>
      {/* زر الرجوع الموحد */}
      <button 
        onClick={() => navigate('/')} 
        style={{ ...backBtnStyle, top: '15px', right: '15px', padding: '8px 15px', fontSize: '0.8rem', zIndex: 10 }}
      >
        ↪️ رجوع
      </button>

      <form 
  onSubmit={submit} 
  style={{ 
    width: '400px', 
    display: 'flex',
    flexDirection: 'column',
    // التغيير الأول: stretch بدلاً من center لجعل الأبناء يتمددون
    alignItems: 'stretch', 
    gap: '5px' 
  }}
>
  <div style={{ fontSize: '1.8rem', textAlign: 'center' }}>🗓️</div>
  <h3 style={{ textAlign: 'center', color: '#fff', marginBottom: '5px', fontSize: '1.2rem' }}>حجز موعد جديد</h3>
  
  {/* حاوية التاريخ */}
  <div style={{ width: '100%', marginBottom: '5px' }}>
    <label style={{display: 'block', marginBottom: '3px', fontSize: '0.75rem', color: '#fff', fontWeight: 'bold'}}>تاريخ الحجز:</label>
    <input 
      type="date" 
      // التغيير الثاني: إضافة العرض والـ box-sizing
      style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '0.85rem' }} 
      value={formData.date} 
      min={new Date().toISOString().split('T')[0]}
      onChange={(e) => setFormData({...formData, date: e.target.value, time: ''})} 
    />
  </div>

  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>الاسم الكامل</label>
  <input 
    // التغيير الثالث: تطبيق العرض الكامل على باقي الحقول
    style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '0.85rem' }} 
    onChange={(e) => setFormData({...formData, name: e.target.value})} 
    required 
  />

  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>رقم الهاتف</label>
  <input 
  type="tel"
  required
  pattern="\d{10}"
  value={formData.phone}
  onChange={(e) => {
    // إخبار TypeScript أن الهدف هو عنصر Input
    (e.target as HTMLInputElement).setCustomValidity(""); 
    
    const val = e.target.value;
    if (/^\d*$/.test(val) && val.length <= 10) {
      setFormData({...formData, phone: val});
    }
  }}
  onInvalid={(e) => {
    // إخبار TypeScript أن الهدف هو عنصر Input هنا أيضاً
    (e.target as HTMLInputElement).setCustomValidity(" يرجى إدخال رقم هاتف صحيح ");
  }}
  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
/>
  
  <p style={{marginTop: '5px', fontWeight: 'bold', fontSize: '0.8rem', color: '#fff'}}>الأوقات المتاحة:</p>
  
  <div style={{ 
  display: 'grid', 
  height: '150px',
  gridTemplateColumns: 'repeat(3, 1fr)', 
  gap: '5px', 
  maxHeight: '130px', 
  overflowY: 'auto',
  padding: '5px',
  background: '#f8f9fa',
  borderRadius: '10px',
  border: '1px solid #eee'
}}>
  {loading ? <p style={{fontSize: '0.7rem', gridColumn: 'span 3', textAlign: 'center'}}>جاري التحميل...</p> : 
    finalSlots.length > 0 ? 
    // التعديل الوحيد هنا: عمل نسخة من المصفوفة وترتيبها قبل العرض
    [...finalSlots].sort((a, b) => a.localeCompare(b)).map(slot => (
        <button 
          key={slot} 
          type="button" 
          onClick={() => setFormData({...formData, time: slot})} 
          style={{ 
            width: '100%',
            padding: '8px 0', 
            fontSize: '0.75rem', 
            borderRadius: '6px',
            transition: '0.2s',
            background: formData.time === slot ? '#3498db' : '#fff', 
            border: '1px solid #ddd', 
            cursor: 'pointer', 
            color: formData.time === slot ? '#fff' : '#2c3e50',
            fontWeight: formData.time === slot ? 'bold' : 'normal'
          }}
        >
          {slot}
        </button>
    )) : <p style={{gridColumn: 'span 3', fontSize: '0.7rem', textAlign: 'center', color: '#e74c3c'}}>لا توجد مواعيد متاحة</p>
  }
</div>
  
  <button 
    type="submit" 
    disabled={finalSlots.length === 0 || loading} 
    style={{ 
      ...bookBtnStyle, 
      width: '100%', // لضمان تمدد الزر أيضاً
      marginTop: '10px',
      padding: '12px',
      fontSize: '1rem',
      background: finalSlots.length === 0 ? '#bdc3c7' : '#2ecc71',
    }}
  >
    {loading ? 'انتظر...' : 'تأكيد الحجز'}
  </button>
</form>
    </div>
  );
}


// --- 3. صفحة إدارة المريض (النسخة الكاملة والمصلحة) ---
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
    } catch { toast.error("خطأ في جلب البيانات"); }
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
    } catch { toast.error("خطأ في تحميل الأوقات"); } finally { setLoadingSlots(false); }
  };

  const saveEdit = async (id: number) => {
    try {
      await axios.patch(`https://backend-eosin-three-61.vercel.app/appointments/${id}/status`, { appointment_time: newTime, status: 'Pending' });
      toast.success("تم التحديث");
      setEditingId(null);
      fetchMyData();
    } catch { toast.error("فشل في الحفظ"); }
  };

  const deleteApp = async (id: number) => {
    if (window.confirm("هل تريد حذف الحجز؟")) {
      try {
        await axios.delete(`https://backend-eosin-three-61.vercel.app/appointments/${id}`);
        toast.success("تم الحذف");
        fetchMyData();
      } catch { toast.error("فشل الحذف"); }
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
      position: 'fixed', // لضمان عدم وجود أي تمرير خلفي
      top: 0,
      left: 0,
      overflow: 'hidden', // يمنع النزول لأسفل نهائياً
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
        maxHeight: '85vh', // يجعل الكارت لا يزيد عن 85% من طول الشاشة
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

        {/* الجزء الوحيد الذي يسمح بالتمرير إذا زادت المواعيد */}
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

// --- 4. لوحة الإدارة (مع الإحصائيات وإدارة الأوقات) ---
export function AdminDashboard({ isAdmin }: { isAdmin: boolean }) {
  const [apps, setApps] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  const [configDate, setConfigDate] = useState(getTomorrowDate());
  const [configSlots, setConfigSlots] = useState<string[]>([]);
  const [existingConfigId, setExistingConfigId] = useState<number | null>(null);

  // 1. تعريف fetchApps باستخدام useCallback
  const fetchApps = useCallback(async () => {
    try {
      const res = await axios.get<Appointment[]>('https://backend-eosin-three-61.vercel.app/clients');
      setApps(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []); // مصفوفة فارغة لأنها لا تعتمد على متغيرات خارجية

  // 2. تعريف fetchConfig باستخدام useCallback
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
  }, [configDate]); // تعتمد على configDate لأنها تستخدمه في الرابط
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
              await axios.post(`https://backend-eosin-three-61.vercel.app/availability`, { date: configDate, slots: configSlots });
              fetchConfig();
          }
          toast.success('تم تحديث أوقات العمل');
      } catch { toast.error('خطأ في الحفظ'); }
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
        toast.success('تم الحذف'); setSelectedIds([]); fetchApps();
    }
  };
  const updateStatus = async (id: number, status: string) => {
    await axios.patch(`https://backend-eosin-three-61.vercel.app/appointments/${id}/status`, { status }); fetchApps();
  };

  return (
    <div style={{ 
      padding: '15px', // تقليل الحواف في الموبايل
      direction: 'rtl', 
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/صووووووووووورة.jpg')`,
      backgroundSize: 'cover', 
      backgroundAttachment: 'fixed',
      minHeight: '100vh' 
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* رأس الصفحة المتجاوب */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ color: '#ffffff', margin: 0 }}>الإدارة</h2>
          <button onClick={() => window.location.href = '/'} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>تسجيل الخروج</button>
        </div>

        {/* 1. قسم الإحصائيات - تعديل Grid ليكون مرناً */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', // جعل المربعات تنزل سطر جديد تلقائياً
          gap: '10px', 
          marginBottom: '30px' 
        }}>
            <StatCard title="الإجمالي" count={stats.total} color="#34495e" icon="📂" />
            <StatCard title="مقبولة" count={stats.accepted} color="#27ae60" icon="✅" />
            <StatCard title="انتظار" count={stats.pending} color="#f39c12" icon="⏳" />
            <StatCard title="مرفوضة" count={stats.rejected} color="#e74c3c" icon="❌" />
        </div>

        {/* 2. قسم أوقات العمل - تحسين للأزرار */}
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

        {/* 3. أدوات الفلترة والحذف */}
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

        {/* 4. الجدول - إضافة حاوية للتمرير الأفقي */}
        <div style={{ background: 'white', borderRadius: '15px', overflowX: 'auto' }}> {/* تم إضافة overflowX هنا */}
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}> {/* minWidth يمنع سحق المحتوى */}
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

// مكون فرعي لبطاقة الإحصائيات
function StatCard({ title, count, color, icon }: { title: string, count: number, color: string, icon: string }) {
    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', borderRight: `5px solid ${color}`, boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>{title}</p>
                <h2 style={{ margin: '5px 0 0 0', color: color }}>{count}</h2>
            </div>
            <div style={{ fontSize: '2rem' }}>{icon}</div>
        </div>
    );
}

// --- 5. دخول الإدارة ---
export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  const [u, setU] = useState(''); 
  const [p, setP] = useState('');
  

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/صووووووووووورة.jpg')`,
      backgroundSize: 'cover',
      direction: 'rtl', 
      position: 'fixed', // منع أي حركة للصفحة الخلفية
      top: 0,
      left: 0,
      overflow: 'hidden', // منع التمرير نهائياً
      fontFamily: 'sans-serif'
    }}>
      {/* زر الرجوع الموحد */}
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          ...backBtnStyle, 
          top: '15px', 
          right: '15px', 
          padding: '8px 15px', 
          fontSize: '0.8rem',
          transition: '0.3s', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px',
          fontWeight: '600',
          zIndex: 10
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = '#f8f9fa')}
        onMouseOut={(e) => (e.currentTarget.style.background = 'white')}
      >
        <span>↪️</span> رجوع للرئيسية
      </button>

      <form 
        onSubmit={(e) => { 
          e.preventDefault(); 
          if(u === 'عادل' && p === '123456') { 
            onLogin(); 
            navigate('/admin'); 
          } else {
            toast.error('خطأ في بيانات الدخول'); 
          }
        }} 
        style={{ 
         
          width: '400px', // عرض متناسق مع بقية الصفحات
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '5px' }}>🔐</div>
        <h3 style={{ 
          textAlign: 'center', 
          marginBottom: '20px', 
          color: '#ffffffff', 
          fontSize: '1.3rem',
          fontWeight: 'bold'
        }}>
          دخول الإدارة
        </h3>

        <div style={{ width: '100%', marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: '#ffffffff', fontWeight: 'bold' }}>اسم المستخدم</label>
          <input 
            
            style={{ ...inputStyle, border: '1px solid #313131ff',padding: '10px', fontSize: '0.9rem' }} 
            onChange={(e) => setU(e.target.value)} 
          />
        </div>

        <div style={{ width: '100%', marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: '#ffffffff', fontWeight: 'bold' }}>كلمة المرور</label>
          <input 
            type="password" 
            
            style={{ ...inputStyle, border: '1px solid #313131ff', padding: '10px', fontSize: '0.9rem' }} 
            onChange={(e) => setP(e.target.value)} 
          />
        </div>

        <button 
          type="submit" 
          style={{ 
            ...bookBtnStyle, 
            marginTop: '15px', 
            background: '#3498db', 
            fontSize: '1rem',
            padding: '12px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          تسجيل الدخول
        </button>

        
      </form>
    </div>
  );
}

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

// التنسيقات (CSS)
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' as const, outline: 'none' };
const heroBtnStyle = { padding: '15px 30px', background: '#3498db', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' };
const bookBtnStyle = { padding: '15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '12px', width: '100%', cursor: 'pointer', fontWeight: 'bold' };
const thStyle = { padding: '15px', textAlign: 'right' as const, color: '#7f8c8d', fontSize: '0.9rem' };
const tdStyle = { padding: '15px', textAlign: 'right' as const };
const actionBtnStyle = (color: string) => ({ background: 'none', border: `1px solid ${color}`, color: color, padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' });
const secondaryBtnStyle = { background: '#ecf0f1', color: '#2c3e50', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' };
const deleteBtnStyle = { background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' };
const backBtnStyle = { position: 'absolute' as const, top: '20px', right: '20px', background: '#fff', padding: '10px 20px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#2c3e50', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', gap: '5px' };

