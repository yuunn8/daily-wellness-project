import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Leaf, Menu, X } from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();
  const { isLoggedIn, user } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (path: string) => {
    // 홈은 항상 이동 가능
    if (path === '/') {
      setLocation(path);
      return;
    }
    // 다른 메뉴는 로그인 필요
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

  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 바 */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <button
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Leaf className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg text-gray-900">일일 웰빙 관리</span>
            </button>

            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* 버튼 그룹 */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-gray-600">
                    {user?.nickname ?? '사용자'}님
                  </span>
                  <Button
                    onClick={() => setLocation('/dashboard')}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    대시보드
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/auth')}
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    로그인
                  </Button>
                  <Button
                    onClick={() => setLocation('/auth?mode=signup')}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    회원가입
                  </Button>
                </>
              )}
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* 모바일 메뉴 */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    handleNavClick(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-primary/10 rounded"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 히어로 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[600px]">
            {/* 좌측 콘텐츠 */}
            <div className="space-y-8 flex flex-col justify-center">
              <div className="inline-block bg-green-100 text-primary px-4 py-2 rounded-full text-sm font-semibold w-fit">
                UN SDGs 3 & 13
              </div>

              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                건강한 나,<br />
                건강한 지구
              </h1>

              <p className="text-xl text-gray-700 leading-relaxed space-y-3">
                매일 작은 실천으로 나의 건강과 지구의 환경을 함께 지켜요.<br />
                오늘의 미션에 도전하고, 함께하는 사람들과 응원을 나눠보세요.
              </p>

              <div className="flex gap-4 pt-6">
                <Button
                  onClick={() => handleNavClick('/missions')}
                  className="bg-primary hover:bg-primary/90 text-white px-10 py-4 text-lg font-semibold rounded-lg"
                >
                  오늘의 미션 시작하기
                </Button>
              </div>
            </div>

            {/* 우측 미션 카드 */}
            <div className="space-y-4 flex flex-col justify-center">
              <div className="bg-white rounded-2xl p-7 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">💧</span>
                  <div>
                    <span className="font-semibold text-gray-900 text-lg">물 1.5L 마시기</span>
                    <p className="text-sm text-gray-500 mt-1">매일 충분한 수분 섭취</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-7 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">🚶</span>
                  <div>
                    <span className="font-semibold text-gray-900 text-lg">5,000보 걷기</span>
                    <p className="text-sm text-gray-500 mt-1">활동적인 하루 보내기</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-7 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">💪</span>
                  <div>
                    <span className="font-semibold text-gray-900 text-lg">30분 운동하기</span>
                    <p className="text-sm text-gray-500 mt-1">건강한 체력 유지</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
