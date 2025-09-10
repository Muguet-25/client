"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Users } from "lucide-react";

// Components
import Navigation from "@/components/sections/Navigation";
import SideIndicators from "@/components/sections/SideIndicators";
import FeatureCard from "@/components/sections/FeatureCard";
import FAQAccordion from "@/components/sections/FAQAccordion";

// Hooks
import { useScrollSpy } from "@/hooks/useScrollSpy";

// Constants
import { navData, popularFeatures, socialProofData, faqData } from "@/constants/navigation";

// Data
import { pricingPlans } from "@/data/pricing";
import { bottomCards, processSteps, videoThumbnails, footerSections, socialMediaIcons } from "@/data/sections";

const Home = () => {
  const router = useRouter();
  const sections = ['hero', 'about', 'features', 'pricing', 'contact'];
  const { activeSection, isNavVisible } = useScrollSpy(sections);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section id="hero" className="relative w-full h-screen overflow-hidden">
        <video
        src="/videos/hero-section.mp4"
          autoPlay muted loop playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/70 via-black/50 to-black/60" />
        
        <Navigation 
          activeSection={activeSection} 
          onSectionClick={scrollToSection} 
        />
        
        {/* Main Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-8 lg:px-16">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-white text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
              CREATE
              <br />
              YOUR STORY
            </h1>
            <p className="text-white/90 text-lg sm:text-xl mb-16 max-w-2xl mx-auto leading-relaxed font-light">
              MUGUET으로 마케팅을 자동화하고, 콘텐츠 제작에만 집중하세요
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
  <button
    className="w-full sm:w-auto min-h-[56px] text-white text-lg font-semibold bg-green-600 hover:bg-green-700 active:bg-green-800 px-12 py-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-2xl hover:shadow-green-500/25"
    onClick={() => router.push("/auth/signup")}
  >
    지금 시작하기
  </button>
  <button
    className="w-full sm:w-auto min-h-[56px] text-white text-lg font-semibold bg-transparent border-2 border-white/60 hover:border-white hover:bg-white/10 px-12 py-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30"
    onClick={() => router.push("/auth/signup")}
  >
    더 알아보기
  </button>
</div>
          </div>
        </div>

        <SideIndicators 
          activeSection={activeSection} 
          onSectionClick={scrollToSection} 
        />

        {/* Bottom Info Cards */}
        <div className="absolute bottom-8 left-0 right-0 z-10 px-6 sm:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {bottomCards.map((card, index) => (
              <button 
                key={index}
                onClick={() => scrollToSection(card.href)}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 text-left"
              >
                <h3 className="text-white text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-white/70 text-sm mb-4">{card.description}</p>
                <span className="text-green-400 text-sm font-medium hover:text-green-300 transition-colors">
                  자세히 보기 →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section id="about" className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              아직도 혼자 마케팅 하시나요?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              크리에이터는 콘텐츠 제작에만 집중해야 합니다. 마케팅은 Muguet가 대신 해드릴게요.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="text-2xl font-bold text-red-700">기존 문제점</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">마케팅에 시간을 너무 많이 소모</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">복잡한 SNS 관리와 분석</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">효과적인 광고 전략 수립의 어려움</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">개인 브랜딩의 전문성 부족</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-2xl font-bold text-green-700">Muguet 솔루션</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">AI 기반 자동 마케팅 전략</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">통합 SNS 관리 대시보드</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">데이터 기반 성과 분석</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">전문 마케터 수준의 브랜딩</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Features Section */}
      <section id="features" className="py-20 px-4 sm:px-8 lg:px-16 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-400 text-sm font-medium tracking-wider uppercase mb-4">인기 기능</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              POPULAR FEATURES
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
              크리에이터들이 가장 사랑하는 기능들을 만나보세요
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularFeatures.map((feature) => (
              <FeatureCard 
                key={feature.name} 
                feature={feature} 
                onFeatureClick={scrollToSection}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-12">믿을 수 있는 성과</h2>
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {socialProofData.map((item, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-green-500 mb-2">{item.value}</div>
                <div className="text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">간단한 3단계</h2>
            <p className="text-xl text-gray-600">몇 분만에 시작하는 Muguet</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {processSteps.map((item) => (
              <div key={item.step} className="text-center">
                <div className={`w-20 h-20 ${item.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <span className="text-3xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">합리적인 가격</h2>
            <p className="text-xl text-gray-600">크리에이터를 위한 특별한 요금제</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => {
              const handleClick = plan.name === '프로' ? () => router.push("/signup") : undefined;
              
              return (
                <div key={index} className={`${plan.bgClass} rounded-2xl p-8 shadow-lg ${plan.textColor} relative`}>
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">인기</span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className={`text-4xl font-bold mb-6 ${plan.textColor}`}>
                    {plan.price}
                    <span className={`text-lg font-normal ${plan.textClass}`}>{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <span className={`${plan.checkClass} mr-2`}>✓</span>
                        <span className={plan.textClass}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${plan.buttonClass}`}
                    onClick={handleClick}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="contact" className="py-20 px-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
            <p className="text-xl text-gray-600">궁금한 점들을 미리 확인해보세요</p>
          </div>
          
          <FAQAccordion faqData={faqData} />
        </div>
      </section>

      {/* Inspiration & Video Section */}
      <section className="relative py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-600/5"></div>
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            CREATE AND
            <br />
            INSPIRE YOUR LIFE
          </h2>
          <p className="text-white/70 text-lg sm:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
            당신의 스토리를 세상에 전달하고, 영감을 주는 크리에이터가 되어보세요
          </p>
          
          
          {/* Video Description */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto mb-12">
            <p className="text-white/80 leading-relaxed">
              Muguet를 통해 마케팅의 모든 것을 자동화하고, 진정한 크리에이터로서의 여정을 시작하세요. <br />
              AI가 당신의 콘텐츠를 분석하고 최적의 전략을 제안합니다.
            </p>
          </div>
          
          {/* Related Video Thumbnails */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {videoThumbnails.map((video, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 hover:from-green-500/20 hover:to-green-600/20 transition-all duration-300 border border-gray-700 hover:border-green-500/50">
                <div className={`aspect-video bg-gradient-to-br ${video.gradient} flex items-center justify-center`}>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-300">
                    <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1"></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-medium">{video.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Muguet</h3>
              <p className="text-gray-400 mb-4">1인 크리에이터를 위한 마케팅 플랫폼</p>
              <div className="flex space-x-4">
                {socialMediaIcons.map((icon, index) => (
                  <a key={index} href="#" className="text-gray-400 hover:text-white transition-colors">{icon}</a>
                ))}
        </div>
      </div>

            {footerSections.map((section, index) => (
              <div key={index}>
                <h4 className="text-lg font-bold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-gray-400">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Muguet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
};

export default Home;