"use client";

import { navData } from "@/constants/navigation";

interface SideIndicatorsProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

const SideIndicators = ({ activeSection, onSectionClick }: SideIndicatorsProps) => {
  return (
    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20">
      <div className="flex flex-col space-y-4">
        {navData.map((item, index) => (
          <button 
            key={item.href} 
            onClick={() => onSectionClick(item.href)}
            className="flex items-center hover:opacity-100 transition-opacity duration-300"
          >
            <span className={`text-sm font-mono w-8 transition-colors ${
              activeSection === item.href 
                ? 'text-white' 
                : 'text-white/60 hover:text-white'
            }`}>
              {String(index + 1).padStart(2, '0')}
            </span>
            {activeSection === item.href && <div className="w-8 h-0.5 bg-green-500 ml-2"></div>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideIndicators;
