import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type MetalType } from '@/styles/themeColors';
import { getUserSettings } from '@/services/settingsService';

interface MetalContextType {
  selectedMetal: MetalType;
  setSelectedMetal: (metal: MetalType) => void;
}

const MetalContext = createContext<MetalContextType | undefined>(undefined);

export function MetalProvider({ children }: { children: ReactNode }) {
  const [selectedMetal, setSelectedMetal] = useState<MetalType>('gold');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    getUserSettings().then(settings => {
      setSelectedMetal((settings.defaultMetal as MetalType) || 'gold');
      setInitialized(true);
    });
  }, []);

  if (!initialized) {
    return null;
  }

  return (
    <MetalContext.Provider value={{ selectedMetal, setSelectedMetal }}>
      {children}
    </MetalContext.Provider>
  );
}

export function useMetal(): MetalContextType {
  const context = useContext(MetalContext);
  if (!context) {
    throw new Error('useMetal must be used within a MetalProvider');
  }
  return context;
}