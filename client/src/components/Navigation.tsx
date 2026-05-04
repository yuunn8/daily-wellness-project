import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Leaf } from 'lucide-react';

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, setUser, isLoggedIn } = useApp();

  const handleLogout = () => {
    localStorage.removeItem('token'); // 🔥 추가 (로그아웃 안정화)
    setUser(null);
    setLocation('/');
  };

  const handleNavClick = (path: string) => {
    if (path === '/') {
      setLocation(path);
      return;
    }

    if (!isLoggedIn) {
      setLocation('/auth');
    } else {
      setLocation(path);
    }
  };

  const navItems = [
    { label: '홈', path: '/' },
    { label: '오늘의 미션', path: '/missions' },
    { label: '커뮤니티', path: '/community' },
    { label: '나의 기록', path: '/my-record' },
    { label: '상품 교환', path: '/rewards' },
  ];

  // 🔥 핵심: 이름 처리 통일
  const displayName = user?.nickname ?? user?.name ?? '';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-gray-900">
              일일 웰빙 관리
            </span>
          </button>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`transition-colors font-medium ${
                  location === item.path
                    ? 'text-primary'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 우측 버튼 그룹 */}
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-600 hidden sm:inline">
                {displayName}님
              </span>
            )}

            {user && location !== '/dashboard' && (
              <Button
                variant="outline"
                onClick={() => setLocation('/dashboard')}
                className="border-primary text-primary hover:bg-primary/10"
              >
                대시보드
              </Button>
            )}

            {user && (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                로그아웃
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}