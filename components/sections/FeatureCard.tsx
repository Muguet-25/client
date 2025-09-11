"use client";

import { Feature } from "@/types";

interface FeatureCardProps {
  feature: Feature;
  onFeatureClick?: (href: string) => void;
}

const FeatureCard = ({ feature, onFeatureClick }: FeatureCardProps) => {
  const IconComponent = feature.icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 hover:from-orange-500/20 hover:to-orange-600/20 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative p-8 mt-4">
        <h3 className="text-white text-xl font-bold mb-4 group-hover:text-orange-400 transition-colors duration-300">
          {feature.name}
        </h3>
        <p className="text-white/70 leading-relaxed mb-6">
          {feature.description}
        </p>
        <button
          onClick={() => onFeatureClick?.(feature.href)}
          className="text-orange-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          자세히 보기 →
        </button>
      </div>
    </div>
  );
};

export default FeatureCard;
