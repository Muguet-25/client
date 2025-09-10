"use client";

import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { navData } from "@/constants/navigation";

interface NavigationProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

const Navigation = ({ activeSection, onSectionClick }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-20 flex items-center justify-between px-6 sm:px-8 lg:px-16 py-6 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <span className="text-white text-xl font-bold tracking-wider">MUGUET</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          {navData.map((item) => (
            <button 
              key={item.href}
              onClick={() => onSectionClick(item.href)} 
              className={`transition-colors ${
                activeSection === item.href 
                  ? 'text-white border-b-2 border-orange-500 pb-1' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="w-6 h-6 text-white/80 hover:text-white transition-colors">
            <Search className="w-6 h-6" />
          </button>
          <button 
            className="md:hidden text-white/80 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-30 bg-black/90 backdrop-blur-sm border-t border-white/20 md:hidden">
          <div className="px-6 py-4 space-y-4">
            {navData.map((item) => (
              <button 
                key={item.href}
                onClick={() => {
                  onSectionClick(item.href);
                  setIsMobileMenuOpen(false);
                }} 
                className={`block w-full text-left transition-colors py-2 ${
                  activeSection === item.href 
                    ? 'text-white border-l-4 border-orange-500 pl-4' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
