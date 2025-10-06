"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/useAuthStore';
import { useLoginStore } from '@/lib/useLogin';
import { useToast } from '@/hooks/useToast';
import { 
  LogOut, User, Settings, BarChart3, Calendar, Mail, Menu, X, ChevronDown, 
  TrendingUp, TrendingDown, Eye, Heart, Users, Download, Clock, 
  Target, PieChart, Activity, Bell, Plus, Filter, Search, Home, 
  FileText, Lightbulb, BarChart, FileDown, ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn, user, isLoading } = useAuthStore();
  const { logout } = useLoginStore();
  const { success, error } = useToast();

  return (
    <>
      {isLoading && (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {!isLoggedIn ? router.push('/auth/login') : (
        <div className="min-h-screen bg-foreground">

        </div>
      )}
    </>
  )
}