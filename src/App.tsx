import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Login from './Login';
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import Staff from './Staff';
import Settings from './Settings';
import { Page, User } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import { firebaseService } from './firebaseService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const refreshUser = () => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser({
        name: user.displayName || user.email?.split('@')[0] || 'User',
        role: 'Administrator',
        avatar: user.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQ6HzowJ9ABIH7VKRje6t_e-jkHaoxVjtgAObjIwZ32MPzA5cgL0tQZ-HIWozMok-HeHwtMS2E5nw1zbWvQZX_Vd-eQdx2RpwwRj6ka2DINLBU1OuPyAmHuqh3_Nre_VG-dT7i-B9PAw8VR_72tMSOXPkYOeuDmfhi5LZB2-gHHHq41_NeY2a-UutP4ecij7lErpEJ2qx9mdE-3dS2Q046RTNEOYo8fLEcCBfW9QxxhcEGOL4KcDfWuz7W5O2UE6IemWlTwhacO55A'
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Seed initial data if empty
        await firebaseService.seedInitialData();
        await firebaseService.checkAndBootstrapAdmin();
        
        setCurrentUser({
          name: user.displayName || user.email?.split('@')[0] || 'User',
          role: 'Administrator',
          avatar: user.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQ6HzowJ9ABIH7VKRje6t_e-jkHaoxVjtgAObjIwZ32MPzA5cgL0tQZ-HIWozMok-HeHwtMS2E5nw1zbWvQZX_Vd-eQdx2RpwwRj6ka2DINLBU1OuPyAmHuqh3_Nre_VG-dT7i-B9PAw8VR_72tMSOXPkYOeuDmfhi5LZB2-gHHHq41_NeY2a-UutP4ecij7lErpEJ2qx9mdE-3dS2Q046RTNEOYo8fLEcCBfW9QxxhcEGOL4KcDfWuz7W5O2UE6IemWlTwhacO55A'
        });
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-app flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-secondary font-bold text-[12px] uppercase tracking-[0.2em] animate-pulse">Lumina Library Loading</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'inventory':
        return <Inventory isAdding={isAddModalOpen} onAdded={() => setIsAddModalOpen(false)} />;
      case 'staff':
        return <Staff isAdding={isAddModalOpen} onAdded={() => setIsAddModalOpen(false)} />;
      case 'settings':
        return <Settings onUserUpdate={refreshUser} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      setCurrentPage={setCurrentPage} 
      user={currentUser}
      onLogout={handleLogout}
      onAdd={() => setIsAddModalOpen(true)}
    >
      {renderPage()}
    </Layout>
  );
}
