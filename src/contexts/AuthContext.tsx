import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to validate token with backend
  const validateToken = async (storedToken: string) => {
    try {
      const response = await fetch('/api/auth/validate-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Load user and token from localStorage on app start
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Validate token with backend
          const validatedUser = await validateToken(storedToken);
          
          if (validatedUser) {
            // Token is valid, set the user and token
            setToken(storedToken);
            setUser(validatedUser);
          } else {
            // Token is invalid, clear stored data
            console.log('Stored token is invalid, clearing auth data');
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to parse stored user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}