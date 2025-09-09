export interface NavItem {
  name: string;
  href: string;
}

export interface Feature {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SocialProofItem {
  value: string;
  label: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
}
