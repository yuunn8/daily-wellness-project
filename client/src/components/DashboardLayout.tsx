import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  Gift,
  LogOut,
  Leaf,
  Coins,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, setUser } = useApp();

  const handleLogout = () => {
    setUser(null);
    setLocation('/');
  };

  const navItems = [
    { label: '대시보드', icon: Home, path: '/dashboard' },
    { label: '미션', icon: Leaf, path: '/missions' },
    { label: '커뮤니티', icon: Users, path: '/community' },
    { label: '상품 교환', icon: Gift, path: '/rewards' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <div className="w-64 bg-primary text-white shadow-lg flex flex-col">
        {/* 로고 */}
        <div className="p-6 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6" />
            <h1 className="text-xl font-bold">웰빙 미션</h1>
          </div>
        </div>

        {/* 사용자 정보 */}
        {user && (
          <div className="p-6 border-b border-primary/20">
            <p className="text-sm opacity-90">환영합니다!</p>
            <p className="font-semibold text-lg">{user.name}</p>
            <div className="mt-3 flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
              <Coins className="w-4 h-4" />
              <span className="font-bold">{user.coins.toLocaleString()}</span>
              <span className="text-xs opacity-90">코인</span>
            </div>
          </div>
        )}

        {/* 네비게이션 */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/20 font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 로그아웃 */}
        <div className="p-4 border-t border-primary/20">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-primary border-white/30 hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
