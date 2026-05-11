import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getAllItems, type StackItem } from '@/services/stackStorage';

interface StackContextType {
  items: StackItem[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const StackContext = createContext<StackContextType | undefined>(undefined);

export function StackProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await getAllItems();
      setItems(all);
    } catch (error) {
      console.error('Error loading stack items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <StackContext.Provider value={{ items, isLoading, refresh }}>
      {children}
    </StackContext.Provider>
  );
}

export function useStack() {
  const context = useContext(StackContext);
  if (context === undefined) {
    throw new Error('useStack must be used within a StackProvider');
  }
  return context;
}