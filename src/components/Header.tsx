import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: 'work' | 'about' | 'contact';
  setActiveTab: (tab: 'work' | 'about' | 'contact') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: 'work' | 'about' | 'contact') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0c10]/90 border-b border-[#1b1e28]/70">
      <div className="max-w-3xl mx-auto px-5 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('about')}
          className="flex items-center gap-2 text-left group focus:outline-none"
        >
          <span className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-white group-hover:text-blue-400 transition-colors">
            Dit R S
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_12px_#3b82f6]"></span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNav('about')}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'about'
                ? 'text-white'
                : 'text-[#8b91a5] hover:text-white'
            }`}
          >
            About
          </button>
          <button
            onClick={() => handleNav('work')}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'work'
                ? 'text-white'
                : 'text-[#8b91a5] hover:text-white'
            }`}
          >
            Work
          </button>
          <button
            onClick={() => handleNav('contact')}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'contact'
                ? 'text-white'
                : 'text-[#8b91a5] hover:text-white'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#9ba1b5] hover:text-white p-2 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e1017] border-b border-[#202434] px-6 py-6 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleNav('about')}
              className={`text-left text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                activeTab === 'about'
                  ? 'bg-[#1e2336] text-white font-semibold'
                  : 'text-[#8b91a5] hover:text-white hover:bg-[#151824]'
              }`}
            >
              About
            </button>
            <button
              onClick={() => handleNav('work')}
              className={`text-left text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                activeTab === 'work'
                  ? 'bg-[#1e2336] text-white font-semibold'
                  : 'text-[#8b91a5] hover:text-white hover:bg-[#151824]'
              }`}
            >
              Work
            </button>
            <button
              onClick={() => handleNav('contact')}
              className={`text-left text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                activeTab === 'contact'
                  ? 'bg-[#1e2336] text-white font-semibold'
                  : 'text-[#8b91a5] hover:text-white hover:bg-[#151824]'
              }`}
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
