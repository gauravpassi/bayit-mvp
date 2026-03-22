'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Property } from '@/types';
import PropertyModal from '@/components/PropertyModal';

interface PropertyModalContextType {
  openModal:  (property: Property) => void;
  closeModal: () => void;
}

const PropertyModalContext = createContext<PropertyModalContextType>({
  openModal:  () => {},
  closeModal: () => {},
});

export function PropertyModalProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Property | null>(null);

  // Lock body scroll when a modal is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  return (
    <PropertyModalContext.Provider
      value={{ openModal: setSelected, closeModal: () => setSelected(null) }}
    >
      {children}
      {selected && (
        <PropertyModal property={selected} onClose={() => setSelected(null)} />
      )}
    </PropertyModalContext.Provider>
  );
}

export const usePropertyModal = () => useContext(PropertyModalContext);
