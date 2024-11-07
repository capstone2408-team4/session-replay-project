import React, { Children } from 'react';
import axios from 'axios';

const AuthContext = React.createContext({});

interface AuthProviderProps {
  children: any;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [projectName, setProjectName] = React.useState<string | null>(null);

  React.useEffect(() => {
    checkAuthStatus();
  }, [])
  
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/XXXXX', { withCredentials: true});
      setProjectName(response.data.projectName);
    } catch (error) {
      setProjectName(null)
    }
  }
  
  const login = async (projectName: string, password: string) => {
    try {
      const response = await axios.post('api/login', { projectName: projectName, password: password }, { withCredentials: true, headers: {'Content-Type': 'application/json'} });
      setProjectName(response.data.projectID);
      return response.data
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      projectName,
      login,
      isAuthenticated: !!projectName
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
