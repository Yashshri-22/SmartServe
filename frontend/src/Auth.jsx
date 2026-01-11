import { useState } from 'react'
import { supabase } from './supabaseClient'
import './Auth.css'

export default function Auth() {
  const [view, setView] = useState('selection')
  const [role, setRole] = useState('') 
  const [isLogin, setIsLogin] = useState(true) 
  
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Messages
  const [errorMsg, setErrorMsg] = useState('')

  const handleCardClick = (selectedRole, mode) => {
    setRole(selectedRole)
    setIsLogin(mode === 'login')
    setView('form')
    setEmail('')
    setPassword('')
    setErrorMsg('')
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // 1. Password Length Check (Client Side)
    if (!isLogin && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        
        // Alert for Login Success
        alert("Login Successful!")
        // App.jsx will automatically detect the session and redirect you
      } 
      else {
        // --- REGISTER ---
        const { data, error } = await supabase.auth.signUp({ email, password })
        
        if (error) throw error

        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, email: email, role: role }])
          
          if (profileError) {
             console.error('Profile error:', profileError)
             setErrorMsg('Account created but profile failed.')
          } else {
             // Alert for Registration Success
             alert("Registration Successful! Please check your email.")
             // If 'Confirm Email' is disabled in Supabase, you will be auto-logged in now.
          }
        }
      }
    } catch (error) {
      // 2. Catch Errors
      if (error.message.includes('already registered') || error.message.includes('unique constraint')) {
        setErrorMsg('The user already exists. Try logging in.')
      } else if (error.message.includes('Invalid login')) {
         setErrorMsg('Invalid email or password.')
      } else {
        setErrorMsg(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // --- VIEW 1: SELECTION CARDS ---
  if (view === 'selection') {
    return (
      <div className="auth-container">
        <h1 className="main-title">Join SmartServe</h1>
        <div className="cards-wrapper">
          {/* NGO Card */}
          <div className="role-card">
            <div>
              <span className="card-badge">Organization</span>
              <h2 className="card-title">For NGOs</h2>
              <p className="card-desc">
                Connect with thousands of volunteers. Post events, manage drives, 
                and make a bigger impact.
              </p>
            </div>
            <div>
              <button className="black-btn" onClick={() => handleCardClick('ngo', 'login')}>
                Login
              </button>
              <div className="signup-link">
                Don't have an account? <span className="link-text" onClick={() => handleCardClick('ngo', 'register')}>Sign up</span>
              </div>
            </div>
          </div>

          {/* Volunteer Card */}
          <div className="role-card">
            <div>
              <span className="card-badge">Community</span>
              <h2 className="card-title">For Volunteers</h2>
              <p className="card-desc">
                Find meaningful opportunities. Upskill yourself, earn certificates, 
                and contribute to causes.
              </p>
            </div>
            <div>
              <button className="black-btn" onClick={() => handleCardClick('volunteer', 'login')}>
                Login
              </button>
              <div className="signup-link">
                Don't have an account? <span className="link-text" onClick={() => handleCardClick('volunteer', 'register')}>Sign up</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- VIEW 2: FORM ---
  return (
    <div className="auth-container">
      <div className="role-card form-card"> {/* Added 'form-card' class for specific sizing */}
        <button className="back-btn" onClick={() => setView('selection')}>
           ← Back
        </button>
        
        <h2 className="card-title">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        <form onSubmit={handleAuth} style={{textAlign: 'left', width: '100%'}}>
          
          {/* EMAIL INPUT */}
          <input
            type="email"
            placeholder="name@work-email.com"
            className={`input-field ${errorMsg ? 'input-error' : ''}`} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* PASSWORD INPUT */}
          <input
            type="password"
            placeholder="Password"
            className={`input-field ${errorMsg ? 'input-error' : ''}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* INLINE ERROR MESSAGE */}
          {errorMsg && (
            <div className="error-text">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          <button type="submit" className="black-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="signup-link" style={{textAlign: 'center'}}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className="link-text" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </div>
      </div>
    </div>
  )
}