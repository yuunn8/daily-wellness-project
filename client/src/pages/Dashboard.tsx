import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { CheckCircle2, Circle, TrendingUp, Flame, Camera, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoggedIn, missions, setMissions, setUser } = useApp();

  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    completed: 0,
    total: 0,
    coinsEarned: 0,
  });

  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [proofCaption, setProofCaption] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLocation('/');
      return;
    }

    fetchDashboardData();
  }, [setLocation]);

  useEffect(() => {
    const completed = missions.filter((m: any) => m.completed).length;

    const coinsEarned = missions
      .filter((m: any) => m.completed)
      .reduce((sum: number, m: any) => {
        return sum + (m.rewardCoins ?? m.reward ?? 0);
      }, 0);

    setTodayStats({
      completed,
      total: missions.length,
      coinsEarned,
    });
  }, [missions]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      const [missionRes, userRes] = await Promise.all([
        fetch(`${API_BASE_URL}/missions/today`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const missionData = await missionRes.json();
      const userData = await userRes.json();

      if (missionRes.ok) {
        const normalizedMissions = (missionData.missions || []).map((mission: any) => ({
          id: String(mission.id),
          title: mission.title,
          description: mission.description,
          category: mission.category,
          completed: mission.completed,
          completedAt: mission.completedAt,
          reward: mission.rewardCoins ?? mission.reward ?? 0,
          rewardCoins: mission.rewardCoins ?? mission.reward ?? 0,
          icon: mission.icon ?? '🌿',
        }));

        setMissions(normalizedMissions);
      }

      if (userRes.ok) {
        setUser(userData.user);
      }
    } catch (error) {
      console.error(error);
      setMissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setProofImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetProofForm = () => {
    setShowProofDialog(false);
    setProofCaption('');
    setProofImage(null);
    setProofFile(null);
    setSelectedMission(null);
    setSubmitting(false);
  };

  const handleSubmitProof = async () => {
    if (!selectedMission || !proofFile || submitting) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('missionId', selectedMission);
      formData.append('image', proofFile);

      if (proofCaption.trim()) {
        formData.append('content', proofCaption.trim());
      }

      const res = await fetch(`${API_BASE_URL}/missions/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '미션 인증 실패');
      }

      await fetchDashboardData();

      alert('미션 인증 완료!');
      resetProofForm();
    } catch (err: any) {
      alert(err.message);
      setSubmitting(false);
    }
  };

  if (!isLoggedIn && !localStorage.getItem('token')) {
    return null;
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-gray-600">오늘의 미션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const completionRate =
    todayStats.total > 0
      ? Math.round((todayStats.completed / todayStats.total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
            <p className="text-gray-600 mt-1">오늘의 웰빙 미션 현황</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">미션 완료율</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <p className="text-xs text-gray-600 mt-1">
                  {todayStats.completed}/{todayStats.total} 완료
                </p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">오늘 획득 코인</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  +{todayStats.coinsEarned}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  총 {(user.coins || 0).toLocaleString()} 코인
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">연속 달성</CardTitle>
                <Flame className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.streakDays ?? 0}일</div>
                <p className="text-xs text-gray-600 mt-1">계속 유지하세요!</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">오늘의 미션</h2>

            {missions.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600">오늘 미션이 아직 준비되지 않았어요.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missions.map((mission: any) => (
                  <Card
                    key={mission.id}
                    className={`transition-all hover:shadow-lg ${
                      mission.completed ? 'bg-green-50 border-green-200' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{mission.icon ?? '🌿'}</span>
                            <h3 className="font-semibold text-gray-900">
                              {mission.title}
                            </h3>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {mission.description}
                          </p>

                          <p className="text-xs text-emerald-700 mb-3">
                            보상 코인: {mission.rewardCoins ?? mission.reward ?? 0}
                          </p>

                          {!mission.completed && (
                            <Button
                              onClick={() => {
                                setSelectedMission(String(mission.id));
                                setShowProofDialog(true);
                              }}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              인증하기
                            </Button>
                          )}
                        </div>

                        <div className="ml-4">
                          {mission.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={showProofDialog}
        onOpenChange={(open) => {
          if (!open) resetProofForm();
          else setShowProofDialog(true);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>미션 인증</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-lg p-6 text-center">
              {proofImage ? (
                <div className="relative">
                  <img
                    src={proofImage}
                    alt="인증 이미지"
                    className="w-full h-48 object-cover rounded"
                  />
                  <button
                    onClick={() => {
                      setProofImage(null);
                      setProofFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Camera className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">사진을 선택하세요</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                설명 (선택사항)
              </label>
              <Textarea
                placeholder="미션 완료 내용을 입력하세요"
                value={proofCaption}
                onChange={(e) => setProofCaption(e.target.value)}
                maxLength={50}
                className="resize-none break-all whitespace-pre-wrap"
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {proofCaption.length}/50
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={resetProofForm}
                variant="outline"
                className="flex-1 hover:bg-gray-100"
                disabled={submitting}
              >
                취소
              </Button>

              <Button
                onClick={handleSubmitProof}
                disabled={!proofFile || submitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-400"
              >
                {submitting ? '인증 중...' : '인증 완료'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}