/**
 * Simple Broadcast Dialog
 * Simplified broadcast message creation with cockpit aesthetic
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';

interface SimpleBroadcastDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type MessageNature = 'info' | 'warning' | 'alert' | 'announcement' | 'success' | 'milestone' | 'update';

export function SimpleBroadcastDialog({ isOpen, onClose }: SimpleBroadcastDialogProps) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageNature>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          nature: messageType,
        }),
      });

      if (response.ok) {
        // Success - trigger refresh event for BroadcastArchiveNavigator
        window.dispatchEvent(new CustomEvent('broadcastCreated'));
        // Reset form and close
        setMessage('');
        setMessageType('info');
        setError(null);
        onClose();
      } else {
        const data = await response.json().catch(() => ({ error: 'Failed to create broadcast' }));
        if (response.status === 403) {
          setError('You do not have permission to create broadcasts. Creator or Operator access required.');
        } else {
          setError(data.error || 'Failed to create broadcast');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create broadcast');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMessage('');
      setMessageType('info');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="cockpit-panel border-purple-500">
        <DialogHeader>
          <DialogTitle className="cockpit-title">Broadcast Message</DialogTitle>
          <DialogDescription className="cockpit-text">
            Create a system broadcast message that will appear in the contributor dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleBroadcast}>
          <div className="space-y-4 py-4">
            {/* Message Type */}
            <div>
              <Label htmlFor="message-type" className="cockpit-label mb-2 block">
                Message Type
              </Label>
              <select
                id="message-type"
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as MessageNature)}
                className="cockpit-select"
              >
                <option value="info">Info</option>
                <option value="announcement">Announcement</option>
                <option value="update">Update</option>
                <option value="success">Success</option>
                <option value="milestone">Milestone</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="broadcast-message" className="cockpit-label mb-2 block">
                Message
              </Label>
              <Textarea
                id="broadcast-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your broadcast message..."
                className="cockpit-input min-h-[120px]"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded border border-red-500/50 bg-red-500/10 p-3">
                <div className="flex items-center gap-2 text-red-400">
                  <X className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleClose}
              className="cockpit-lever"
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="cockpit-lever"
              disabled={loading || !message.trim()}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Broadcasting...' : 'Broadcast Now'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


