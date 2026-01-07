/**
 * Create Post Form Component
 * Form for creating new social media posts with image upload
 */

'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/utils/supabase/client';

interface CreatePostFormProps {
  sandboxId: string | null;
  onPostCreated: () => void;
  onCancel: () => void;
}

export function CreatePostForm({ sandboxId, onPostCreated, onCancel }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);
      if (sandboxId) {
        formData.append('sandbox_id', sandboxId);
      }

      const response = await fetch('/api/social/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.url);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload image');
        setImagePreview(null);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Post content is required');
      return;
    }

    if (content.length > 2000) {
      setError('Post must be less than 2000 characters');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sandbox_id: sandboxId,
          content: content.trim(),
          image_url: imageUrl,
        }),
      });

      if (response.ok) {
        setContent('');
        setImageUrl(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onPostCreated();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cockpit-panel border-l-4 border-[var(--hydrogen-amber)] p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="cockpit-input min-h-[100px] resize-none"
            maxLength={2000}
            disabled={submitting}
          />
          <div className="mt-1 text-xs cockpit-text opacity-70 text-right">
            {content.length}/2000
          </div>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-64 w-full rounded object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 bg-black/50 hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="cockpit-text text-red-400 text-sm">{error}</div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={uploading || submitting}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || submitting}
              className="cockpit-lever"
            >
              <ImageIcon className={`mr-2 h-4 w-4 ${uploading ? 'animate-pulse' : ''}`} />
              {uploading ? 'Uploading...' : 'Add Image'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={submitting}
              className="cockpit-lever"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !content.trim()}
              className="cockpit-lever"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

