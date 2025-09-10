"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FAQItem } from "@/types";

interface FAQAccordionProps {
  faqData: FAQItem[];
}

const FAQAccordion = ({ faqData }: FAQAccordionProps) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqData.map((faq, index) => (
        <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleFaq(index)}
            className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
          >
            <h3 className="text-xl font-bold text-gray-900 pr-4">{faq.question}</h3>
            {openFaqIndex === index ? (
              <ChevronUp className="w-6 h-6 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-500 flex-shrink-0" />
            )}
          </button>
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-6 pb-6">
              <p className="text-gray-600 mt-2">{faq.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;
