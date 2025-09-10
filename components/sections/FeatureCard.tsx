"use client";

import { Feature } from "@/types";

interface FeatureCardProps {
  feature: Feature;
  onFeatureClick?: (href: string) => void;
}

const FeatureCard = ({ feature, onFeatureClick }: FeatureCardProps) => {
  const IconComponent = feature.icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 hover:from-green-500/20 hover:to-green-600/20 transition-all duration-500 border border-gray-700 hover:border-green-500/50">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative p-8 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/30 transition-colors duration-300">
          <IconComponent className="w-10 h-10 text-green-400" />
        </div>
        <h3 className="text-white text-xl font-bold mb-4 group-hover:text-green-400 transition-colors duration-300">
          {feature.name}
        </h3>
        <p className="text-white/70 leading-relaxed mb-6">
          {feature.description}
        </p>
        <button
          onClick={() => onFeatureClick?.(feature.href)}
          className="text-green-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          자세히 보기 →
        </button>
      </div>
    </div>
  );
};

export default FeatureCard;
