import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VerificationContextType {
  verificationStatuses: { [lessonId: string]: string };
  updateVerificationStatus: (lessonId: string, status: string) => void;
  getVerificationStatus: (lessonId: string) => string | undefined;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};

interface VerificationProviderProps {
  children: ReactNode;
}

export const VerificationProvider: React.FC<VerificationProviderProps> = ({ children }) => {
  const [verificationStatuses, setVerificationStatuses] = useState<{ [lessonId: string]: string }>({});

  const updateVerificationStatus = (lessonId: string, status: string) => {
    setVerificationStatuses(prev => ({
      ...prev,
      [lessonId]: status
    }));
  };

  const getVerificationStatus = (lessonId: string) => {
    return verificationStatuses[lessonId];
  };

  return (
    <VerificationContext.Provider value={{
      verificationStatuses,
      updateVerificationStatus,
      getVerificationStatus
    }}>
      {children}
    </VerificationContext.Provider>
  );
};
