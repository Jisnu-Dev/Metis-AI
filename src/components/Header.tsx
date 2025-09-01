'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight * 100}`;
      setScrollProgress(parseInt(scroll));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Shared styles for nav items
  const navItemClass = "text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer focus:outline-none focus:ring-0 focus:border-none focus:shadow-none border-0 bg-transparent hover:bg-white/10 active:outline-none active:ring-0 active:border-none";
  const mobileNavItemClass = "text-white/80 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 w-full text-left cursor-pointer focus:outline-none focus:ring-0 focus:border-none focus:shadow-none border-0 bg-transparent hover:bg-white/10 active:outline-none active:ring-0 active:border-none";

  const handleNavClick = (href?: string) => {
    if (href) {
      document.querySelector(href)?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      {/* Scroll Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      ></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white">
                Metis<span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">AI</span>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button 
                onClick={() => handleNavClick()}
                className={navItemClass}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                Home
              </button>
              <button 
                onClick={() => handleNavClick('#features')}
                className={navItemClass}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                Features
              </button>
              <button 
                onClick={() => handleNavClick('#how-it-works')}
                className={navItemClass}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                How It Works
              </button>
              <button 
                onClick={() => handleNavClick('#impact')}
                className={navItemClass}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                Impact
              </button>
              <button 
                onClick={() => handleNavClick('#contact')}
                className={navItemClass}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                Contact
              </button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-md focus:outline-none focus:text-white transition-all backdrop-blur-sm"
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/30 backdrop-blur-lg border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button 
                onClick={() => handleNavClick()}
                className={mobileNavItemClass}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                Home
              </button>
              <button 
                onClick={() => handleNavClick('#features')}
                className={mobileNavItemClass}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                Features
              </button>
              <button 
                onClick={() => handleNavClick('#how-it-works')}
                className={mobileNavItemClass}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                How It Works
              </button>
              <button 
                onClick={() => handleNavClick('#impact')}
                className={mobileNavItemClass}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                Impact
              </button>
              <button 
                onClick={() => handleNavClick('#contact')}
                className={mobileNavItemClass}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
