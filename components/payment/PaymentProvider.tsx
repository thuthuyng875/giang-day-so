'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category?: string | null;
  file_url?: string;
};

type PaymentContextType = {
  isModalOpen: boolean;
  selectedProduct: Product | null;
  openPaymentModal: (product: Product) => void;
  closePaymentModal: () => void;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const openPaymentModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  return (
    <PaymentContext.Provider value={{ isModalOpen, selectedProduct, openPaymentModal, closePaymentModal }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
