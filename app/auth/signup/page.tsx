"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginStore } from '@/lib/useLogin';
import { useSnsLoginStore } from '@/lib/useSnsLoginStore';
import { useAuthStore } from '@/lib/useAuthStore';
import { Eye, EyeOff, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { emailSignup, validateSignup, isLoading, error, clearError } = useLoginStore();
  const { snsLogin } = useSnsLoginStore();
  const { isLoggedIn, user } = useAuthStore();

  // 로그인 상태면 리다이렉트
  useEffect(() => {
    if (isLoggedIn && user) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, user, router]);

  // 로그인 상태면 로딩 표시
  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const validation = validateSignup(formData);
    if (!validation.success) {
      return;
    }

    await emailSignup(formData.email, formData.password, formData.confirmPassword);
  };

  const handleSnsLogin = async (provider: 'google' | 'kakao' | 'facebook') => {
    clearError();
    await snsLogin(provider);
  };

  // 비밀번호 강도 체크
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-zA-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm scale-110"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4 tracking-wider">
              MUGUET
              <span className="text-orange-500 ml-2">●</span>
            </h1>
            <p className="text-white/80 text-lg">
              크리에이터를 위한 마케팅 플랫폼
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
              SIGN UP
            </h2>
            <div className="w-12 h-0.5 bg-orange-500 mb-6"></div>
            <p className="text-white/70 text-sm">
              이메일과 비밀번호를 입력하여 계정을 만드세요
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded text-sm mb-6 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-transparent border border-white/30 rounded-none text-white placeholder-white/60 focus:outline-none focus:border-orange-400 focus:ring-0 transition-colors"
                  placeholder="이메일"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-transparent border border-white/30 rounded-none text-white placeholder-white/60 focus:outline-none focus:border-orange-400 focus:ring-0 transition-colors"
                  placeholder="비밀번호"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-orange-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-orange-300 transition-colors" />
                  )}
                </button>
              </div>
              
              {/* 비밀번호 강도 표시 */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength
                            ? passwordStrength === 1
                              ? 'bg-orange-500'
                              : passwordStrength === 2
                              ? 'bg-orange-500'
                              : passwordStrength === 3
                              ? 'bg-orange-500'
                              : 'bg-orange-500'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/60 mt-2">
                    {passwordStrength === 0 && '비밀번호를 입력하세요'}
                    {passwordStrength === 1 && '약함 - 8자 이상, 영문, 숫자, 특수문자 포함'}
                    {passwordStrength === 2 && '보통 - 8자 이상, 영문, 숫자, 특수문자 포함'}
                    {passwordStrength === 3 && '좋음 - 8자 이상, 영문, 숫자, 특수문자 포함'}
                    {passwordStrength === 4 && '강함 - 안전한 비밀번호입니다'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-transparent border border-white/30 rounded-none text-white placeholder-white/60 focus:outline-none focus:border-orange-400 focus:ring-0 transition-colors"
                  placeholder="비밀번호 확인"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-orange-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-orange-300 transition-colors" />
                  )}
                </button>
              </div>
              
              {/* 비밀번호 일치 확인 */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-orange-400 mr-2" />
                      <span className="text-orange-400 text-sm">비밀번호가 일치합니다</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                      <span className="text-red-400 text-sm">비밀번호가 일치하지 않습니다</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || passwordStrength < 4 || formData.password !== formData.confirmPassword}
              className="w-full py-3 px-4 border border-white/30 text-white uppercase font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? '회원가입 중...' : 'SIGN UP'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-white/60">또는</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSnsLogin('google')}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-3 px-4 border border-white/30 text-white/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-all duration-200"
              >
                <span className="sr-only">Google로 회원가입</span>
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>

              <button
                onClick={() => handleSnsLogin('kakao')}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-3 px-4 border border-white/30 text-white/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-all duration-200"
              >
                <span className="sr-only">카카오로 회원가입</span>
                <span className="text-yellow-400 font-bold text-xl">K</span>
              </button>

              <button
                onClick={() => handleSnsLogin('facebook')}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-3 px-4 border border-white/30 text-white/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-all duration-200"
              >
                <span className="sr-only">페이스북으로 회원가입</span>
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-orange-500 hover:text-orange-300 font-medium transition-colors"
              >
                로그인
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}