'use client';

import React from 'react';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <AnnouncementBar />
      <Header />
      <CartDrawer />
      <main className="app-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
