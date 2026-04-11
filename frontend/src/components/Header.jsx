import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'
import logo from '../assets/LOGO.png'
import RegisterForm from './RegisterForm'
import LoginForm    from './LoginForm'
import AdminPanel   from './AdminPanel'

function Header() {
  const [menuOpen, setMenuOpen]         = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showLogin, setShowLogin]       = useState(false)
  const [showAdmin, setShowAdmin]       = useState(false)
  const [user, setUser]                 = useState(null)   // { username, role }

  // Read auth state from localStorage (set by App.jsx after verification or login)
  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username')
      if (token && username) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          // Check token hasn't expired
          if (payload.exp * 1000 > Date.now()) {
            setUser({ username: payload.sub, role: payload.role })
            return
          }
        } catch {}
      }
      setUser(null)
    }

    syncAuth()
    // Also react when App.jsx fires after email verification redirect
    window.addEventListener('storage', syncAuth)
    // Custom event fired by App.jsx after writing token
    window.addEventListener('auth-changed', syncAuth)
    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('auth-changed', syncAuth)
    }
  }, [])

  const close = () => setMenuOpen(false)
  const { pathname } = useLocation()
  const nav = (path) => `nav-link${pathname === path ? ' active' : ''}`

  function openRegister() { close(); setShowLogin(false);    setShowRegister(true); }
  function openLogin()    { close(); setShowRegister(false); setShowLogin(true);    }
  function closeAll()     { setShowRegister(false); setShowLogin(false); }

  function handleLoginSuccess(token) {
    closeAll()
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      localStorage.setItem('token', token)
      localStorage.setItem('username', payload.sub)
      setUser({ username: payload.sub, role: payload.role })
      window.dispatchEvent(new Event('auth-changed'))
    } catch {}
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setUser(null)
    window.dispatchEvent(new Event('auth-changed'))
  }

  return (
    <>
      <header className="header">
        <div className="container header-inner">

          <Link to="/" className="logo" onClick={close}>
            <img src={logo} alt="BublikStudios" className="logo-img" />
            <div className="logo-text">
              <span className="logo-main">Bublik<span className="logo-accent">Studios</span></span>
            </div>
          </Link>

          <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>

          <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
            <Link to="/"           className={nav('/')}            onClick={close}>Home</Link>
            <Link to="/blog"       className={nav('/blog')}        onClick={close}>Blog</Link>
            <Link to="/tutorials"  className={nav('/tutorials')}   onClick={close}>Tutorials</Link>
            <a    href="#shop"     className="nav-link"            onClick={close}>Shop</a>
            <a    href="#about"    className="nav-link"            onClick={close}>About</a>

            <div className="nav-auth">
              {user ? (
                <>
                  <span className="nav-username">
                    👤 {user.username}
                    {user.role === 'ADMIN' && <span className="nav-admin-badge"> 👑</span>}
                  </span>
                  {user.role === 'ADMIN' && (
                    <button className="nav-btn nav-admin-btn" onClick={() => { close(); setShowAdmin(true) }}>👑 Admin Panel</button>
                  )}
                  <button className="nav-logout" onClick={logout}>Log out</button>
                </>
              ) : (
                <>
                  <button className="nav-login"    onClick={openLogin}>Log in</button>
                  <button className="nav-register" onClick={openRegister}>Register</button>
                </>
              )}
            </div>
          </nav>

        </div>
      </header>

      {showRegister && (
        <RegisterForm onClose={closeAll} onSwitchToLogin={openLogin} />
      )}
      {showLogin && (
        <LoginForm onClose={closeAll} onSwitchToRegister={openRegister} onSuccess={handleLoginSuccess} />
      )}
      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
    </>
  )
}

export default Header
