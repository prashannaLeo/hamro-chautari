import React, { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Trash2, 
  Send,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  postId: string;
  isVisible?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, isVisible = false }) => {
  const { comments, loading, addComment, deleteComment } = useComments(postId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await addComment(newComment);
    setNewComment('');
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    await addComment(replyText, commentId);
    setReplyText('');
    setReplyingTo(null);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="flex space-x-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="" alt="You" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[60px] resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <Button 
                type="submit" 
                size="sm"
                disabled={!newComment.trim() || loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
              >
                <Send className="w-4 h-4 mr-1" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="bg-gray-50/50 border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex space-x-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.user_profile?.avatar_url} alt={comment.user_profile?.display_name || comment.user_profile?.username} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-sm">
                      {(comment.user_profile?.display_name || comment.user_profile?.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {comment.user_profile?.display_name || comment.user_profile?.username || 'Anonymous'}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {comment.user_id === user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-200">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem 
                              onClick={() => deleteComment(comment.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      {comment.content}
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {comment.likes_count > 0 && (
                          <span className="text-xs">{comment.likes_count}</span>
                        )}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="h-7 px-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        Reply
                      </Button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 pl-4 border-l-2 border-blue-200">
                        <div className="flex space-x-2">
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 min-h-[40px] text-sm resize-none"
                            rows={1}
                          />
                          <div className="flex flex-col space-y-1">
                            <Button 
                              onClick={() => handleReply(comment.id)}
                              size="sm"
                              disabled={!replyText.trim()}
                              className="h-8 px-3 bg-blue-600 hover:bg-blue-700"
                            >
                              <Send className="w-3 h-3" />
                            </Button>
                            <Button 
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-gray-500"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;