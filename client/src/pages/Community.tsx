import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Heart, MessageCircle, MoreHorizontal, Send, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const API_BASE_URL = 'https://daily-wellness.onrender.com/api';
const SERVER_URL = 'https://daily-wellness.onrender.com';

export default function Community() {
  const [, setLocation] = useLocation();
  const { isLoggedIn, communityPosts, setCommunityPosts, addComment, user } = useApp();

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editImageName, setEditImageName] = useState('');

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

  const handleDeleteComment = async (postId: string, commentId: string) => {
    const confirmed = window.confirm('댓글을 삭제하시겠습니까?');

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '댓글 삭제 실패');
      }

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

  const openEditDialog = (postId: string, caption: string, imageUrl?: string) => {
    setEditingPostId(postId);
    setEditText(caption || '');
    setEditImageFile(null);
    setEditImagePreview(imageUrl ? getImageUrl(imageUrl) : '');
    setShowEditDialog(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 100) {
      setEditText(e.target.value);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setEditImageFile(file);
    setEditImageName(file ? file.name : '');

    if (file) {
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const resetEditDialog = () => {
    setShowEditDialog(false);
    setEditingPostId(null);
    setEditText('');
    setEditImageFile(null);
    setEditImagePreview('');
    setEditImageName('');
  };

  const handleUpdatePost = async () => {
    if (!editingPostId || !editText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('content', editText.trim());

      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      const res = await fetch(`${API_BASE_URL}/posts/${editingPostId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '게시글 수정 실패');
      }

      resetEditDialog();
      await fetchPosts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    const confirmed = window.confirm('게시글을 삭제하시겠습니까? 인증글이라면 관련 코인과 미션 완료 기록도 취소됩니다.');

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '게시글 삭제 실패');
      }

      setCommunityPosts((prev) => prev.filter((post) => post.id !== postId));
      await fetchPosts();
    } catch (err: any) {
      alert(err.message);
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

  const selectedPost = communityPosts.find((p) => p.id === selectedPostId);

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
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleString('ko-KR')}
                      </p>

                      {user && String(post.userId) === String(user.id) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                              aria-label="게시글 메뉴"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(post.id, post.caption, post.imageUrl)}>
                              수정하기
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              삭제하기
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
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
                        <div key={comment.id} className="flex items-start justify-between gap-2 text-sm">
                          <div>
                            <span className="font-semibold text-gray-900">
                              {comment.userName}
                            </span>
                            <span className="text-gray-700 ml-2 break-words">
                              {comment.text}
                            </span>
                          </div>
                          {user && String(comment.userId) === String(user.id) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(post.id, comment.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              aria-label="댓글 삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
            {selectedPost?.comments.map((comment) => (
              <div key={comment.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-gray-900">
                    {comment.userName}
                  </span>
                  {user && String(comment.userId) === String(user.id) && selectedPostId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(selectedPostId, comment.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="댓글 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md rounded-2xl border-0 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              게시글 수정
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  이미지 수정
                </p>

                {editImageName && (
                  <span className="text-xs text-gray-400 truncate max-w-[180px]">
                    {editImageName}
                  </span>
                )}
              </div>

              <label
                htmlFor="edit-image-upload"
                className="group flex h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 transition-all hover:border-gray-300 hover:bg-gray-100"
              >
                {editImageFile && editImagePreview ? (
                  <img
                    src={editImagePreview}
                    alt="선택 이미지 미리보기"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
                      +
                    </div>

                    <div className="text-sm font-medium">
                      이미지 선택
                    </div>

                    <div className="text-xs text-gray-400">
                      JPG, PNG 업로드 가능
                    </div>
                  </div>
                )}
              </label>

              <Input
                id="edit-image-upload"
                type="file"
                accept="image/*"
                onChange={handleEditImageChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  글 수정
                </p>

                <span className="text-xs text-gray-400">
                  {editText.length}/100
                </span>
              </div>

              <Textarea
                value={editText}
                onChange={handleEditChange}
                placeholder="수정할 내용을 입력하세요"
                maxLength={100}
                className="min-h-32 resize-none rounded-2xl border-gray-200 bg-gray-50 px-4 py-3 focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={resetEditDialog}
                className="flex-1 rounded-xl border-gray-200 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                취소
              </Button>

              <Button
                onClick={handleUpdatePost}
                disabled={!editText.trim()}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white"
              >
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog></div>
  );
}
