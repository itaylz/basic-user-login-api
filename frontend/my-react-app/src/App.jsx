import { useState, useEffect } from 'react';

function App() {
  // --- STATE ---
  // Form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // UI Toggles
  const [isRegistering, setIsRegistering] = useState(false); // NEW: Toggles between Login and Register
  
  // App status and data
  const [statusMessage, setStatusMessage] = useState('');
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(true); 

  // --- 1. INITIAL LOAD: Check for existing token ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false); 
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/secure-data`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (response.ok) {
          setUserData(result.secret_data); 
        } else {
          localStorage.removeItem('authToken'); 
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchProfile(); 
  }, []);

  // --- 2. LOGIN PROCESS ---
  const handleLogin = async (e) => {
    e.preventDefault(); 
    setStatusMessage('Checking credentials...');

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', result.token);
        setStatusMessage('Login successful! Fetching profile...');
        fetchSecureData(result.token); 
      } else {
        setStatusMessage(result.message || 'Login failed.');
        setUserData(null);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setStatusMessage('Error connecting to the server.');
    }
  };

  // --- 3. REGISTER PROCESS (NEW) ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setStatusMessage('Creating account...');

    try {
      // NOTE: Make sure your backend route matches this URL! 
      // It might be '/register' or '/api/register' depending on how you set it up.
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }), // Sending username and password
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage('Registration successful! You can now log in.');
        setIsRegistering(false); // Flip the UI back to the login screen
        setPassword(''); // Clear the password field for security
        setUsername(''); // Clear the username field for security

      } else {
        setStatusMessage(result.error || 'Registration failed.');
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setStatusMessage('Error connecting to the server.');
    }
  };

  // Helper function to fetch data right after logging in
  const fetchSecureData = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/secure-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (response.ok) {
        setUserData(result.data);
        setStatusMessage(''); 
      }
    } catch (error) {
      setStatusMessage('Error fetching secure data.');
    }
  };

  // --- 4. LOGOUT PROCESS ---
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUserData(null);
    setUsername('');
    setPassword('');
    setStatusMessage('You have successfully logged out.');
  };

  // --- 5. RENDER UI ---
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading application...</div>;
  }

  // LOGGED IN VIEW: Dashboard
  if (userData) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Welcome Back!</h2>
        <div style={{ padding: '15px', backgroundColor: '#eef', borderRadius: '5px', marginBottom: '20px' }}>
          <p><strong>Secure Database Info Retrieved:</strong></p>
          <p>{userData}</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px', cursor: 'pointer', width: '100%' }}>
          Logout
        </button>
      </div>
    );
  }

  // LOGGED OUT VIEW: Login / Register Forms
  return (
    <div style={{ maxWidth: '300px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      {/* The title changes based on state */}
      <h2>{isRegistering ? 'Create an Account' : 'Login System'}</h2>
      
      {/* The form dynamically chooses which function to run on submit */}
      <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {/* Main action button */}
        <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          {isRegistering ? 'Register' : 'Login'}
        </button>

        {/* Toggle button */}
        <button 
          type="button" 
          onClick={() => {
            setIsRegistering(!isRegistering);
            setStatusMessage(''); // Clear any old errors when switching screens
            setUsername(''); // Clear the username field for security
            setPassword(''); // Clear the password field for security
          }} 
          style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#007bff', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </form>

      {statusMessage && (
        <div style={{ marginTop: '20px', color: statusMessage.includes('Error') || statusMessage.includes('failed') ? 'red' : 'green' }}>
          <p><strong>Status:</strong> {statusMessage}</p>
        </div>
      )}
    </div>
  );
}

export default App;