import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import { useApp } from '@/contexts/AppContext';
import { Leaf, Trophy, Coins } from 'lucide-react';
import html2canvas from 'html2canvas';

const API_BASE_URL = 'https://daily-wellness.onrender.com/api';

export default function MyRecord() {
  const [, setLocation] = useLocation();
  const { isLoggedIn, user, missions, setMissions, setUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLocation('/');
      return;
    }

    fetchRecordData();
  }, [setLocation]);

  const fetchRecordData = async () => {
    try {
      const token = localStorage.getItem('token');

      const [missionRes, userRes] = await Promise.all([
        fetch(`${API_BASE_URL}/missions/today`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const missionData = await missionRes.json();
      const userData = await userRes.json();

      if (missionRes.ok) {
        const normalizedMissions = (missionData.missions || []).map((mission: any) => ({
          id: String(mission.id),
          title: mission.title,
          description: mission.description,
          completed: mission.completed,
          completedAt: mission.completedAt,
          reward: mission.rewardCoins ?? mission.reward ?? 0,
          rewardCoins: mission.rewardCoins ?? mission.reward ?? 0,
          icon: mission.icon ?? '🌿',
          category: mission.category,
        }));

        setMissions(normalizedMissions);
      }

      if (userRes.ok) {
        setUser(userData.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCard = async () => {
    if (!shareCardRef.current || isDownloading) return;

    try {
      setIsDownloading(true);

      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `wellness-record-${new Date().toISOString().slice(0, 10)}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('이미지가 저장되었습니다!');
    } catch (error) {
      console.error('이미지 저장 실패:', error);
      alert('이미지 저장에 실패했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isLoggedIn && !localStorage.getItem('token')) {
    return null;
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-gray-600">기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const completedMissionsCount = missions.filter((m: any) => m.completed).length;

  const coinsEarnedToday = missions
    .filter((m: any) => m.completed)
    .reduce((sum: number, m: any) => {
      return sum + (m.rewardCoins ?? m.reward ?? 0);
    }, 0);

  const displayName = user.nickname ?? user.name ?? '나';

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">나의 기록</h1>
          <p className="text-gray-600">웰빙 여정의 모든 순간을 기록하세요</p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">오늘의 성과</h2>

          <div
            ref={shareCardRef}
            className="w-full max-w-sm mx-auto aspect-[9/16] bg-gradient-to-b from-emerald-50 via-white to-emerald-50 rounded-3xl p-8 mb-6 space-y-6 flex flex-col justify-between shadow-lg overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/30 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100/20 rounded-full -ml-16 -mb-16"></div>

            <div className="relative z-10">
              <p className="text-lg font-bold text-gray-900 mb-3">{displayName}</p>
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-600">
                  일일 웰빙 관리
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 text-white rounded-full mb-3 shadow-lg">
                  <Trophy className="w-10 h-10" />
                </div>
                <p className="text-5xl font-black text-gray-900 mb-1">
                  {completedMissionsCount}
                </p>
                <p className="text-sm text-gray-600 font-medium">개 미션 완료</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 border-2 border-emerald-100 text-center shadow-sm">
                  <Coins className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-600 mb-1">
                    +{coinsEarnedToday}
                  </p>
                  <p className="text-xs text-gray-600">오늘 획득</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border-2 border-emerald-100 text-center shadow-sm">
                  <Trophy className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-600 mb-1">
                    {user.streakDays ?? 0}
                  </p>
                  <p className="text-xs text-gray-600">연속 달성</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 text-center">
              <p className="text-xs text-gray-700 font-semibold">
                건강한 나, 건강한 지구
              </p>
            </div>
          </div>

          <div className="max-w-sm mx-auto">
          </div>
        </div>
      </div>
    </div>
  );
}