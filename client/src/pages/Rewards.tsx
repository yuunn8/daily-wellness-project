import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { dummyRewards } from '@/lib/dummyData';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { nanoid } from 'nanoid';
import type { Reward } from '@/types';

const API_BASE_URL = 'https://daily-wellness.onrender.com/api';

interface ExchangeHistory {
  id: string;
  rewardId: string;
  rewardName: string;
  coinsSpent: number;
  exchangedAt: string;
  certificateImage: string;
}

export default function Rewards() {
  const [, setLocation] = useLocation();
  const { isLoggedIn, user, setUser } = useApp();

  const [rewards] = useState<Reward[]>(dummyRewards);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeHistory[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'history'>('products');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [exchanging, setExchanging] = useState(false);

  const defaultCertificateImage = '/gifticon.png';

  useEffect(() => {
    if (!isLoggedIn) {
      setLocation('/');
      return;
    }

    const savedHistory = localStorage.getItem('exchangeHistory');
    if (savedHistory) {
      setExchangeHistory(JSON.parse(savedHistory));
    }
  }, [isLoggedIn, setLocation]);

  const saveExchangeHistory = (history: ExchangeHistory[]) => {
    setExchangeHistory(history);
    localStorage.setItem('exchangeHistory', JSON.stringify(history));
  };

  const voucherRewards = rewards.filter((reward) => reward.category === 'voucher');

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleExchange = async (reward: Reward) => {
    if (!user || exchanging) return;

    if (user.coins < reward.price) {
      alert('코인이 부족합니다.');
      return;
    }

    try {
      setExchanging(true);

      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/user/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          price: reward.price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '상품 교환 실패');
      }

      setUser(data.user);

      const exchange: ExchangeHistory = {
        id: nanoid(),
        rewardId: String(reward.id),
        rewardName: reward.name,
        coinsSpent: reward.price,
        exchangedAt: new Date().toLocaleString('ko-KR'),
        certificateImage: reward.certificateImage || reward.image || defaultCertificateImage,
      };

      saveExchangeHistory([exchange, ...exchangeHistory]);

      alert(`${reward.name}을(를) 교환했습니다!`);
      setShowConfirmDialog(false);
      setSelectedReward(null);
      setActiveTab('history');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setExchanging(false);
    }
  };

  if (!isLoggedIn || !user) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">상품 교환</h1>
          <p className="text-gray-600">코인으로 다양한 상품을 교환하세요</p>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-primary to-primary/80 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">현재 보유 코인</p>
                <p className="text-4xl font-bold">{user.coins.toLocaleString()}</p>
              </div>
              <ShoppingBag className="w-12 h-12 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            상품권
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            교환기록
          </button>
        </div>

        {activeTab === 'products' && (
          <div>
            {voucherRewards.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">상품이 없습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {voucherRewards.map((reward) => (
                  <Card key={reward.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="w-full h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={reward.image || defaultCertificateImage}
                        alt={reward.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {reward.name}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4">
                        {reward.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-lg font-bold text-primary">
                          {reward.price.toLocaleString()} 코인
                        </span>

                        <Button
                          onClick={() => {
                            setSelectedReward(reward);
                            setShowConfirmDialog(true);
                          }}
                          disabled={!reward.available || user.coins < reward.price}
                          className={`${
                            user.coins >= reward.price
                              ? 'bg-primary hover:bg-primary/90 text-white'
                              : 'bg-gray-300 text-gray-500'
                          }`}
                        >
                          {reward.available ? '교환' : '품절'}
                        </Button>
                      </div>

                      {user.coins < reward.price && (
                        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>
                            {(reward.price - user.coins).toLocaleString()} 코인 부족
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {exchangeHistory.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">아직 교환 기록이 없습니다</p>
              </div>
            ) : (
              exchangeHistory.map((exchange) => (
                <Card key={exchange.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        <img
                          src={exchange.certificateImage}
                          alt={exchange.rewardName}
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {exchange.rewardName}
                        </h3>

                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">사용한 코인:</span>{' '}
                            <span className="text-primary font-semibold">
                              {exchange.coinsSpent.toLocaleString()}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">교환 날짜:</span>{' '}
                            {exchange.exchangedAt}
                          </p>
                        </div>

                        <button
                          onClick={() => handleViewImage(exchange.certificateImage)}
                          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          전체보기
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>상품 교환 확인</DialogTitle>
          </DialogHeader>

          {selectedReward && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">상품</p>
                <p className="font-semibold text-lg text-gray-900">
                  {selectedReward.name}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">교환 가격</p>
                <p className="font-semibold text-lg text-primary">
                  {selectedReward.price.toLocaleString()} 코인
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">교환 후 남은 코인</p>
                <p className="font-semibold text-lg text-gray-900">
                  {(user.coins - selectedReward.price).toLocaleString()} 코인
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1"
                  disabled={exchanging}
                >
                  취소
                </Button>
                <Button
                  onClick={() => handleExchange(selectedReward)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  disabled={exchanging}
                >
                  {exchanging ? '교환 중...' : '교환하기'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>기프티콘 전체보기</DialogTitle>
          </DialogHeader>

          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt="기프티콘"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}