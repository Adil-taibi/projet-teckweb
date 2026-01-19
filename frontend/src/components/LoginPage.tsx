import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box' as const
};

const bookBtnStyle = {
  width: '100%',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const backBtnStyle = {
  position: 'fixed' as const,
  background: 'white',
  color: '#2c3e50',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
};

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
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden',
      fontFamily: 'sans-serif'
    }}>
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
          width: '400px',
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
            style={{ ...inputStyle, border: '1px solid #313131ff', padding: '10px', fontSize: '0.9rem' }} 
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