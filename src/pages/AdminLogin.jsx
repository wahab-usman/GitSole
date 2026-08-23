import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Lock, User, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAdminLoggedIn } = useAdminAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to admin dashboard
  React.useEffect(() => {
    if (isAdminLoggedIn) {
      navigate('/admin');
    }
  }, [isAdminLoggedIn, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const res = login(username, password);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      backgroundColor: 'var(--color-paper)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        border: '1.5px solid var(--color-ink)',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.06)'
      }}>
        {/* Header Band */}
        <div style={{
          backgroundColor: 'var(--color-ink)',
          color: 'var(--color-paper)',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-oxblood)',
              backgroundColor: '#FFFFFF',
              padding: '3px 8px',
              fontWeight: 700
            }}>
              GITSOLE PORTAL
            </div>
            <ShieldCheck size={20} color="var(--color-paper)" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '24px',
            letterSpacing: '-0.02em',
            marginTop: '4px'
          }}>
            Admin Login
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-on-ink)', lineHeight: 1.4 }}>
            Access inventory management and order controls.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{
              backgroundColor: '#FFF0F0',
              border: '1px solid var(--color-oxblood)',
              color: 'var(--color-oxblood)',
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--color-ink)'
            }}>
              Username
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--color-line-strong)',
              padding: '0 12px',
              backgroundColor: 'var(--color-paper)'
            }}>
              <User size={16} color="var(--color-muted)" style={{ marginRight: '10px' }} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-ink)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--color-ink)'
            }}>
              Password
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--color-line-strong)',
              padding: '0 12px',
              backgroundColor: 'var(--color-paper)'
            }}>
              <Lock size={16} color="var(--color-muted)" style={{ marginRight: '10px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-ink)'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '4px' }}
          >
            Authenticate & Access Panel
          </button>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: 'var(--color-muted)',
                fontWeight: 500
              }}
            >
              <ArrowLeft size={14} /> Back to Gitsole Storefront
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
