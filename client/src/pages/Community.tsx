import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const API_BASE_URL = 'https://daily-wellness.onrender.com/api';
const SERVER_URL = 'https://daily-wellness.onrender.com/api';

export default function Community() {
  const [, setLocation] = useLocation();
  const { isLoggedIn, communityPosts, setCommunityPosts, addComment, user } = useApp();

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (!isLoggedIn && !localStorage.getItem('token')) {
      setLocation('/');
      return;
    }

    fetchPosts();
  }, [isLoggedIn, setLocation]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '게시글을 불러오지 못했습니다.');
      }

      setCommunityPosts(data.posts || []);
    } catch (err) {
      console.error(err);
      setCommunityPosts([]);
    }
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${SERVER_URL}${imageUrl}`;
  };

  const handleAddComment = async () => {
    if (!selectedPostId || !commentText.trim() || !user) return;

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/posts/${selectedPostId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '댓글 등록 실패');
      }

      addComment(selectedPostId, {
        id: String(data.comment.id),
        userId: String(user.id),
        userName: user.nickname ?? user.name ?? '사용자',
        text: commentText.trim(),
        createdAt: '방금 전',
      });

      setCommentText('');
      setShowCommentDialog(false);

      await fetchPosts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 50) {
      setCommentText(e.target.value);
    }
  };

  const handleLike = async (postId: string) => {
    const targetPost = communityPosts.find((post) => post.id === postId);
    if (!targetPost) return;

    setCommunityPosts(
      communityPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked,
            }
          : post
      )
    );

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('좋아요 실패');
      }

      await fetchPosts();
    } catch (err) {
      console.error(err);
      await fetchPosts();
    }
  };

  if (!isLoggedIn && !localStorage.getItem('token')) {
    return null;
  }

  const filteredPosts = communityPosts.filter((post) => {
    const missionTitle = post.missionTitle ?? '';
    const userName = post.userName ?? '';
    const caption = post.caption ?? '';

    return (
      missionTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      userName.toLowerCase().includes(searchText.toLowerCase()) ||
      caption.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티</h1>
          <p className="text-gray-600">다른 사용자들의 미션 인증을 보고 응원해주세요</p>
        </div>

        <div className="mb-8">
          <Input
            type="text"
            placeholder="미션이나 사용자 검색..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                아직 커뮤니티에 올라온 인증이 없습니다.
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{post.userName}</p>
                      <p className="text-sm text-gray-600">{post.missionTitle}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>

                {post.imageUrl && (
                  <div className="w-full h-64 bg-gray-200 overflow-hidden">
                    <img
                      src={getImageUrl(post.imageUrl)}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardContent className="p-4 space-y-4">
                  <p className="text-gray-800 break-words">{post.caption}</p>

                  <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          post.liked ? 'fill-primary text-primary' : ''
                        }`}
                      />
                      <span className="text-sm">{post.likes}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPostId(post.id);
                        setShowCommentDialog(true);
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">{post.comments.length}</span>
                    </button>
                  </div>

                  {post.comments.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                      {post.comments.slice(0, 2).map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <span className="font-semibold text-gray-900">
                            {comment.userName}
                          </span>
                          <span className="text-gray-700 ml-2 break-words">
                            {comment.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="max-w-md max-h-96 flex flex-col">
          <DialogHeader>
            <DialogTitle>댓글</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {communityPosts
              .find((p) => p.id === selectedPostId)
              ?.comments.map((comment) => (
                <div key={comment.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">
                      {comment.userName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 break-words">{comment.text}</p>
                </div>
              ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="댓글을 입력하세요..."
                value={commentText}
                onChange={handleCommentChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                maxLength={50}
              />
              <Button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="bg-primary hover:bg-primary/90 text-white"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-right">{commentText.length}/50</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}