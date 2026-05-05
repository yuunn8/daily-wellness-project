import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Leaf } from 'lucide-react';

export default function Auth() {
const [isLogin, setIsLogin] = useState(true);
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [nickname, setNickname] = useState('');
const [, setLocation] = useLocation();
const { setUser } = useApp();

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'signup') {
    setIsLogin(false);
  }
}, []);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

try {
  if (isLogin) {
    // ✅ 로그인
    const res = await fetch('http://daily-wellness.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || '로그인 실패');
      return;
    }

    // ✅ token만 저장
    localStorage.setItem('token', data.token);

    // ✅ user는 state로만 관리 (localStorage 저장 ❌)
    setUser(data.user);

    setLocation('/dashboard');

  } else {
    // ✅ 회원가입
    const res = await fetch('http://daily-wellness.onrender.com/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        nickname // 🔥 backend와 일치
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || '회원가입 실패');
      return;
    }

    alert('회원가입 완료! 로그인 해주세요');

    setIsLogin(true);
    setPassword('');
  }

} catch (err) {
  console.error(err);
  alert('서버 오류');
}

};

return ( <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4"> <div className="w-full max-w-md">

    {/* 로고 */}
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center gap-2">
        <Leaf className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary">웰빙 미션</h1>
      </div>
    </div>

    {/* 카드 */}
    <Card className="shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">
          {isLogin ? '로그인' : '회원가입'}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? '계정으로 로그인하여 미션을 시작하세요'
            : '새 계정을 만들어 웰빙 여정을 시작하세요'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium">닉네임</label>
              <Input
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">이메일</label>
            <Input
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">비밀번호</label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white"
          >
            {isLogin ? '로그인' : '회원가입'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setEmail('');
              setPassword('');
              setNickname('');
            }}
            className="text-sm text-primary hover:underline"
          >
            {isLogin
              ? '계정이 없으신가요? 회원가입'
              : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>

      </CardContent>
    </Card>
  </div>
</div>

);
}
