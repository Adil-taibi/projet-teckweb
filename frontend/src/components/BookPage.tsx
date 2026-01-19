import { useState, useEffect} from 'react';
import type { FormEvent } from 'react';
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

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const inputStyle = {
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '0.9rem'
};

const bookBtnStyle = {
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
};

const backBtnStyle = {
  position: 'fixed' as const,
  background: '#ffffffff',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export function BookPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', date: getTomorrowDate(), time: '' });
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const fetchSlots = async () => {
    setLoading(true);
    setAvailableSlots([]); // ← امسح الأوقات القديمة فوراً
    setBookedSlots([]);
    
    try {
      // جلب البيانات بالتوازي بدلاً من التسلسل
      const [availRes, appsRes] = await Promise.all([
        axios.get<DayAvailability[]>(`https://backend-eosin-three-61.vercel.app/availability?date=${formData.date}`),
        axios.get<Appointment[]>('https://backend-eosin-three-61.vercel.app/clients')
      ]);

      const daySettings = availRes.data[0];
      if (!daySettings || daySettings.slots.length === 0) {
        setAvailableSlots([]); 
        setLoading(false);
        return;
      }

      const taken = appsRes.data
        .filter(a => a.appointment_date === formData.date && a.status !== 'Rejected')
        .map(a => a.appointment_time);
      
      setBookedSlots(taken);
      setAvailableSlots(daySettings.slots);
    } catch (error) { 
      console.error(error);
      toast.error('خطأ في تحميل الأوقات');
    } finally { 
      setLoading(false); 
    }
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
    } catch { 
      toast.error('فشل في الحجز'); 
    }
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
      position: 'fixed',
      top: 0,
      left: 0,
      fontFamily: 'sans-serif',
      overflow: 'hidden'
    }}>
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
          alignItems: 'stretch', 
          gap: '5px' 
        }}
      >
        <div style={{ fontSize: '1.8rem', textAlign: 'center' }}>🗓️</div>
        <h3 style={{ textAlign: 'center', color: '#fff', marginBottom: '5px', fontSize: '1.2rem' }}>حجز موعد جديد</h3>
        
        <div style={{ width: '100%', marginBottom: '5px' }}>
          <label style={{display: 'block', marginBottom: '3px', fontSize: '0.75rem', color: '#fff', fontWeight: 'bold'}}>تاريخ الحجز:</label>
          <input 
            type="date" 
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '0.85rem' }} 
            value={formData.date} 
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setFormData({...formData, date: e.target.value, time: ''})} 
          />
        </div>

        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>الاسم الكامل</label>
        <input 
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
            (e.target as HTMLInputElement).setCustomValidity(""); 
            const val = e.target.value;
            if (/^\d*$/.test(val) && val.length <= 10) {
              setFormData({...formData, phone: val});
            }
          }}
          onInvalid={(e) => {
            (e.target as HTMLInputElement).setCustomValidity(" يرجى إدخال رقم هاتف صحيح ");
          }}
          style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
        />
        
        <p style={{marginTop: '5px', fontWeight: 'bold', fontSize: '0.8rem', color: '#fff'}}>الأوقات المتاحة:</p>
        
        <div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(3, 1fr)', 
  gap: '5px', 
  height: '150px', // ← ثابت بدلاً من maxHeight
  overflowY: 'auto',
  padding: '5px',
  background: '#f8f9fa',
  borderRadius: '10px',
  border: '1px solid #eee',
  alignContent: 'start' // ← يجعل العناصر تبدأ من الأعلى
}}>
  {loading ? (
    <p style={{fontSize: '0.7rem', gridColumn: 'span 3', textAlign: 'center', margin: 'auto'}}>
      جاري التحميل...
    </p>
  ) : 
    finalSlots.length > 0 ? 
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
          fontWeight: formData.time === slot ? 'bold' : 'normal',
          height: '35px' // ← ارتفاع ثابت للأزرار
        }}
      >
        {slot}
      </button>
    )) : (
      <p style={{
        gridColumn: 'span 3', 
        fontSize: '0.7rem', 
        textAlign: 'center', 
        color: '#e74c3c',
        margin: 'auto' // ← توسيط الرسالة عمودياً
      }}>
        لا توجد مواعيد متاحة
      </p>
    )
  }
</div>
        
        <button 
          type="submit" 
          disabled={finalSlots.length === 0 || loading} 
          style={{ 
            ...bookBtnStyle, 
            width: '100%',
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