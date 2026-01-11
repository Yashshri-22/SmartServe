import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
// Uncomment the line below if your friend created a Dashboard.jsx file!
// import Dashboard from './Dashboard' 

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 2. Listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  // SCENARIO 1: User is NOT logged in -> Show Login Page
  if (!session) {
    return <Auth />
  }
  
  // SCENARIO 2: User IS logged in -> Show the Main App (Friend's Work)
  else {
    return (
      <div style={{ padding: '20px' }}>
        {/* This header is temporary so you know it worked */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3>Welcome, {session.user.email}</h3>
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{ padding: '8px 16px', background: 'red', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </div>

        <hr />

        {/* YOUR FRIEND'S WORK GOES HERE! 
           If you have a <Dashboard /> component, replace the <h2> below with <Dashboard /> 
        */}
        <h2>✅ You are logged in! This is where the Dashboard will appear.</h2>
        
      </div>
    )
  }
}

export default App