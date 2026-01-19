import { Link, useNavigate } from 'react-router-dom';

const heroBtnStyle = {
  background: '#2ecc71',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

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
      backgroundImage: `linear-gradient(rgba(51, 6, 109, 0.6), rgba(0, 0, 0, 0.6)), url('/صووووووووووورة.jpg')`,
      backgroundSize: 'cover',
      textAlign: 'center',
      direction: 'rtl',
      fontFamily: 'sans-serif',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden'
    }}>
      <div style={{
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        padding: '100px',
        alignItems: 'stretch',
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1px', marginTop: '-50px' }}>🏥</div>

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
              margin: '0'
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
          border: 'none',
          outline: 'none',
          background: 'none'
        }}>
          <Link
            to="/login"
            style={{
              color: '#ffffff',
              marginTop: '50px',
              textDecoration: 'none',
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
