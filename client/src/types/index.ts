export interface User {
  id: string;
  email: string;
  nickname?: string;
  name?: string;    
  coins: number;
  streakDays: number;
  lastCompletedDate?: string | null; 
  createdAt: string;
}

// 미션 타입
export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: string;
  completed: boolean;
  completedAt?: string;
  proof?: MissionProof;
}

// 미션 인증 타입
export interface MissionProof {
  id: string;
  missionId: string;
  userId: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
}

// 댓글 타입
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

// 상품 타입
export interface Reward {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'voucher';
  image: string;
  available: boolean;
  certificateImage?: string;
}

// 사용자 활동 타입
export interface UserActivity {
  date: string;
  completedMissions: number;
  coinsEarned: number;
  totalCoins: number;
}

// 교환 기록 타입
export interface ExchangeHistory {
  id: string;
  rewardId: string;
  rewardName: string;
  coinsSpent: number;
  exchangedAt: string;
  certificateImage: string;
}
