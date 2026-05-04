import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { CheckCircle2, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = 'http://localhost:5000/api';

const DUMMY_MISSIONS = [
  { id: '1', title: '물 2L 마시기', description: '하루 동안 물 충분히 섭취하기', completed: false, reward: 10, icon: '💧' },
  { id: '2', title: '30분 운동', description: '걷기, 스트레칭 등 가볍게 운동하기', completed: false, reward: 15, icon: '🏃' },
  { id: '3', title: '감사일기 쓰기', description: '오늘 감사한 일 3가지 적기', completed: false, reward: 8, icon: '📔' },
  { id: '4', title: '휴대폰 1시간 끄기', description: '디지털 디톡스 시간 갖기', completed: false, reward: 12, icon: '📵' },
  { id: '5', title: '일찍 자기', description: '23시 이전 취침', completed: false, reward: 20, icon: '🌙' },
  { id: '6', title: '책 10페이지 읽기', description: '자기계발 또는 소설 읽기', completed: false, reward: 10, icon: '📚' },
];

export default function Missions() {
  const [, setLocation] = useLocation();
  const { isLoggedIn, missions, setMissions, setUser } = useApp();

  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [proofCaption, setProofCaption] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLocation('/');
      return;
    }

    fetchTodayMissions();
  }, [setLocation]);

  const fetchTodayMissions = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/missions/today`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '오늘 미션을 불러오지 못했습니다.');
      }

      if (!data.missions || data.missions.length === 0) {
        setMissions(DUMMY_MISSIONS);
      } else {
        const normalizedMissions = data.missions.map((mission: any) => ({
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
    } catch (err) {
      console.error(err);
      setMissions(DUMMY_MISSIONS);
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async () => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE_URL}/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (res.ok) {
    setUser(data.user);
  }
};

  const resetProofForm = () => {
    setShowProofDialog(false);
    setProofCaption('');
    setPreviewImage(null);
    setProofFile(null);
    setSelectedMission(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!selectedMission || !proofFile) return;

    try {
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

      alert('미션 인증 완료!');
      await fetchTodayMissions();
      await fetchMe();
      resetProofForm();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isLoggedIn && !localStorage.getItem('token')) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="p-10">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">오늘의 미션</h1>

        {missions.length === 0 ? (
          <p>미션 없음</p>
        ) : (
          missions.map((mission: any) => (
            <Card key={mission.id}>
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{mission.icon ?? '🌿'}</span>
                    <h3 className="font-semibold">{mission.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{mission.description}</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    보상 코인: {mission.rewardCoins ?? mission.reward ?? 0}
                  </p>
                </div>

                {mission.completed ? (
                  <CheckCircle2 className="text-green-500" />
                ) : (
                  <Button
                    onClick={() => {
                      setSelectedMission(mission.id);
                      setShowProofDialog(true);
                    }}
                  >
                    인증하기
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog
        open={showProofDialog}
        onOpenChange={(open) => {
          if (!open) resetProofForm();
          else setShowProofDialog(true);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>미션 인증</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {previewImage ? (
              <div className="relative overflow-hidden rounded-xl border border-gray-200">
                <img
                  src={previewImage}
                  alt="인증 이미지"
                  className="w-full h-56 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setProofFile(null);
                  }}
                  className="absolute top-3 right-3 rounded-full bg-black/60 text-white px-3 py-1 text-sm hover:bg-black/80"
                >
                  다시 선택
                </button>
              </div>
            ) : (
              <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 transition">
                <Camera className="w-8 h-8 text-emerald-600 mb-2" />
                <p className="font-medium text-gray-800">인증 사진 업로드</p>
                <p className="text-sm text-gray-500 mt-1">
                  클릭해서 사진을 선택하세요
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}

            <Textarea
              placeholder="미션 완료 내용을 입력하세요"
              value={proofCaption}
              onChange={(e) => setProofCaption(e.target.value)}
              maxLength={100}
              className="min-h-24 resize-none break-all break-all whitespace-pre-wrap"
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetProofForm}
                className="hover:bg-gray-100"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmitProof}
                disabled={!proofFile}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                인증 완료
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}