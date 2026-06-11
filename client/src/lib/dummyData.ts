import { Mission, Reward, User } from '@/types';

export const dummyUser: User = {
  id: '1',
  email: 'user@example.com',
  name: '김웨비망',
  coins: 5000,
  streakDays: 0,
  createdAt: '2024-01-15',
};

export const dummyMissions: Mission[] = [
  {
    id: '1',
    title: '물 1.5L 마시기',
    description: '하루에 물 1.5리터 이상 마시기',
    reward: 1,
    icon: '💧',
    completed: false,
  },
  {
    id: '2',
    title: '5000보 이상 걷기',
    description: '하루에 5000보 이상 걷기',
    reward: 1,
    icon: '🚶',
    completed: false,
  },
  {
    id: '3',
    title: '30분 운동하기',
    description: '30분 이상 운동하기',
    reward: 1,
    icon: '💪',
    completed: false,
  },
  {
    id: '4',
    title: '명상 10분',
    description: '10분 이상 명상하기',
    reward: 1,
    icon: '🧘',
    completed: false,
  },
  {
    id: '5',
    title: '건강한 식단',
    description: '채소 3가지 이상 섭취',
    reward: 2,
    icon: '🥗',
    completed: false,
  },
  {
    id: '6',
    title: '충분한 수면',
    description: '7시간 이상 수면',
    reward: 1,
    icon: '😴',
    completed: false,
  },
];

export const dummyRewards: Reward[] = [
  {
    id: '1',
    name: '스타벅스 기프티콘',
    description: '스타벅스 5,000원 기프티콘',
    price: 5000,
    category: 'voucher',
    image: '/rewards/starbucks.png',
    certificateImage: '/rewards/gifticon.png',
    available: true,
  },
  {
    id: '2',
    name: 'GS25 편의점',
    description: 'GS25 10,000원 상품권',
    price: 10000,
    category: 'voucher',
    image: '/rewards/gs25.png',
    certificateImage: '/rewards/gifticon.png',
    available: true,
  },
  {
    id: '3',
    name: '요기요 쿠폰',
    description: '요기요 배달앱 15,000원 쿠폰',
    price: 15000,
    category: 'voucher',
    image: '/rewards/yogiyo.png',
    certificateImage: '/rewards/gifticon.png',
    available: true,
  },

];
