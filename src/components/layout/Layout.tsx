import React from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <main className="container mx-auto px-4 py-16 pb-24 md:pb-16">
        {children}
      </main>
      <MobileNav />
    </div>
  );
};

export default Layout;