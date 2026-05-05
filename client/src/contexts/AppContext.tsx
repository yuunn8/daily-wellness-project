import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Mission, MissionProof } from '@/types';

export interface Comment {
id: string;
userId: string;
userName: string;
text: string;
createdAt: string;
}

export interface CommunityPost {
id: string;
userId: string;
userName: string;
missionTitle: string;
imageUrl: string;
caption: string;
likes: number;
comments: Comment[];
liked: boolean;
createdAt: string;
}

interface AppContextType {
user: User | null;
setUser: (user: User | null) => void;
updateUser: (updater: (prev: User) => User) => void;
isLoggedIn: boolean;

missions: Mission[];
setMissions: (missions: Mission[]) => void;

missionProofs: MissionProof[];
setMissionProofs: (proofs: MissionProof[]) => void;

communityPosts: CommunityPost[];
setCommunityPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;

addCommunityPost: (post: CommunityPost) => void;
addComment: (postId: string, comment: Comment) => void;

addCoins: (amount: number) => void;
spendCoins: (amount: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
const [user, setUser] = useState<User | null>(null);
const [missions, setMissions] = useState<Mission[]>([]);
const [missionProofs, setMissionProofs] = useState<MissionProof[]>([]);
const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

// 🔥 핵심: 로그인 유지 (localStorage → API)
useEffect(() => {
const init = async () => {
const token = localStorage.getItem('token');
if (!token) return;

  try {
    const res = await fetch('http://daily-wellness.onrender.com/api/user/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      localStorage.removeItem('token');
      setUser(null);
      return;
    }

    setUser(data.user);
  } catch (err) {
    console.error(err);
    localStorage.removeItem('token');
    setUser(null);
  }
};

init();

}, []);

// 🔥 user 안전 업데이트
const updateUser = (updater: (prev: User) => User) => {
setUser((prev) => {
if (!prev) return prev;
return updater(prev);
});
};

// 🔥 코인 증가
const addCoins = (amount: number) => {
updateUser((prev) => ({
...prev,
coins: prev.coins + amount,
}));
};

const spendCoins = (amount: number): boolean => {
if (!user || user.coins < amount) return false;

updateUser((prev) => ({
  ...prev,
  coins: prev.coins - amount,
}));

return true;

};

const addCommunityPost = (post: CommunityPost) => {
setCommunityPosts((prev) => [post, ...prev]);
};

const addComment = (postId: string, comment: Comment) => {
setCommunityPosts((prev) =>
prev.map((post) =>
post.id === postId
? { ...post, comments: [...post.comments, comment] }
: post
)
);
};

return (
<AppContext.Provider
value={{
user,
setUser,
updateUser,
isLoggedIn: !!user,

    missions,
    setMissions,

    missionProofs,
    setMissionProofs,

    communityPosts,
    setCommunityPosts,

    addCommunityPost,
    addComment,

    addCoins,
    spendCoins,
  }}
>
  {children}
</AppContext.Provider>

);
}

export function useApp() {
const context = useContext(AppContext);
if (!context) {
throw new Error('useApp must be used within AppProvider');
}
return context;
}
