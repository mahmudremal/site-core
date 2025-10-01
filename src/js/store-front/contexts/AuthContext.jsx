import Locationtracker from '../components/parts/Locationtracker';
import { createContext, useEffect, useState } from 'react';
import { useRequest } from '../hooks/useRequest';
import { useSession } from '../hooks/useSession';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function generateRandomString() {
  return Math.random().toString(36).substring(2, 7);
}

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const { config } = useRequest();
  const { session, setSession } = useSession();
  const [loggedin, setLoggedin] = useState(
    () => config?.loggedin == true || session?.session_id
  );
  const [user, setUser] = useState(
    () => session?.user??{}
  );

  const logout = () => {
    setSession(prev => ({ ...prev, session_key: null, session_id: null, user: null }));
  };

  const login = (formData) => {
    // console.log('Singin...', formData);
    return new Promise((resolve, reject) => {
      const { email: email_address, ...params } = formData;
      const { isRegister = true } = params;

      const base_code = btoa(email_address);
      // const payload = encryptString(JSON.stringify(params), email_address);
      const payload = `${generateRandomString()}${btoa(JSON.stringify(params))}`;

      api.post(`user/auth/${base_code.slice(0, -1)}/${isRegister ? 'register' : 'signin'}`, {payload: payload})
      .then(res => res.data)
      .then(data => {
        if (data?.session_id) {
          setLoggedin(true);
          const { session_id, session_key = null, user: userData = {} } = data;
          setSession(prev => ({ ...prev, session_key: session_key, session_id: session_id, user: userData }));
          navigate('/');
        }
        return data;
      })
      .then(data => resolve(data))
      .catch(err => reject(err));
    });
  };

  const register = (formData) => {
    // console.log('Signup...', formData)
    login(formData);
  }

  return (
    <AuthContext.Provider value={{ loggedin, setLoggedin, user, login, register, logout }}>
      <Locationtracker config={config} />
      {children}
    </AuthContext.Provider>
  );
};
