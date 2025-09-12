import React, { createContext, useContext } from 'react';
import { useCalling } from '@/hooks/useCalling';

const CallingContext = createContext<ReturnType<typeof useCalling> | null>(null);

export const CallingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const calling = useCalling();
  return (
    <CallingContext.Provider value={calling}>
      {children}
    </CallingContext.Provider>
  );
};

export const useCallingContext = () => {
  const ctx = useContext(CallingContext);
  if (!ctx) throw new Error('useCallingContext must be used within CallingProvider');
  return ctx;
};
