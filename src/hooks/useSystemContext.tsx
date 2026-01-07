import { createContext, useContext, useState, ReactNode } from 'react';

type SystemType = 'fuel-report' | 'travel-order';

interface SystemContextType {
  currentSystem: SystemType;
  setCurrentSystem: (system: SystemType) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [currentSystem, setCurrentSystem] = useState<SystemType>('fuel-report');

  return (
    <SystemContext.Provider value={{ currentSystem, setCurrentSystem }}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystemContext() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystemContext must be used within a SystemProvider');
  }
  return context;
}
