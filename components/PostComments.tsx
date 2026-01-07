/**
 * Post Comments Component
 * Displays and manages comments for a social media post
 */

'use client';

import { useState, useEffect } from 'react';
import { Send, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
// Date formatting utility

interface Comment {
  id: string;
  post_id: string;
  author_email: string;
  author_role: 'contributor' | 'operator' | 'creator';
  author_name: string;
  author_profile_picture: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

interface PostCommentsProps {
  postId: string;
  currentUserEmail: string | null;
  onCommentAdded: (postId: string) => void;
}

export function PostComments({ postId, currentUserEmail, onCommentAdded }: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/social/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;
    if (newComment.length > 1000) {
      alert('Comment must be less than 1000 characters');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [data.comment, ...prev]);
        setNewComment('');
        onCommentAdded(postId);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    if (deleting) return;

    setDeleting(commentId);
    try {
      const response = await fetch(`/api/social/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        alert('Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    } finally {
      setDeleting(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      creator: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      operator: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      contributor: 'bg-green-500/20 text-green-400 border-green-500/50',
    };
    return colors[role as keyof typeof colors] || colors.contributor;
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      {loading ? (
        <div className="cockpit-text text-sm opacity-70 text-center py-4">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="cockpit-text text-sm opacity-70 text-center py-4">No comments yet</div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isOwnComment = currentUserEmail === comment.author_email;
            return (
              <div key={comment.id} className="flex gap-3">
                {/* Profile Picture */}
                <div className="h-8 w-8 rounded-full bg-[var(--hydrogen-amber)]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {comment.author_profile_picture ? (
                    <img
                      src={comment.author_profile_picture}
                      alt={comment.author_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-[var(--hydrogen-amber)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="cockpit-title text-sm font-semibold">{comment.author_name}</span>
                    <span className={`cockpit-badge text-xs ${getRoleBadge(comment.author_role)}`}>
                      {comment.author_role}
                    </span>
                    <span className="cockpit-text text-xs opacity-60">
                      {formatTime(comment.created_at)}
                    </span>
                    {isOwnComment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deleting === comment.id}
                        className="ml-auto h-6 px-2 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="cockpit-text text-sm whitespace-pre-wrap break-words">
                    {comment.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="cockpit-input flex-1 min-h-[60px] resize-none"
          maxLength={1000}
          disabled={submitting}
        />
        <Button
          type="submit"
          size="sm"
          disabled={submitting || !newComment.trim()}
          className="cockpit-lever self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

