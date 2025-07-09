import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Heart, 
  MessageCircle, 
  Repeat, 
  Share, 
  MoreHorizontal,
  Laugh,
  Flame,
  Rocket,
  Hash,
  Tag,
  Music,
  Trash2
} from "lucide-react";
import type { ForumPostType } from "@/lib/types";

interface MemePostProps {
  post: ForumPostType;
}

const REACTION_ICONS = {
  like: Heart,
  love: Heart,
  rocket: Rocket,
  fire: Flame,
};

export function MemePost({ post }: MemePostProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showFullImage, setShowFullImage] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check current user authentication - use auth context instead
  const { user: currentUser } = useAuth();

  const reactionMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiRequest('POST', `/api/forum/posts/${post.id}/reactions`, { type });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
    }
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/forum/posts', {
        userId: 2, // HodlMyBeer21 user
        content,
        isReply: true,
        parentPostId: parseInt(post.id),
        categories: [],
        upvotes: 0,
        downvotes: 0
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
      setReplyContent("");
      setShowReplyForm(false);
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/forum/posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
      toast({
        title: "Post deleted",
        description: "The meme post has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting post",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleReaction = (type: string) => {
    reactionMutation.mutate(type);
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    replyMutation.mutate(replyContent);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate();
    }
  };

  const getUserInitials = (username: string) => {
    return username.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="bg-card border border-muted/20 hover:border-muted/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getUserInitials(post.author.username)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">{post.author.username}</span>
                <span className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
              {post.memeTemplate && (
                <div className="flex items-center space-x-1 mt-1">
                  <Laugh className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{post.memeTemplate} meme</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Delete button only for HodlMyBeer21 when logged in */}
            {currentUser?.username === "HodlMyBeer21" && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                disabled={deletePostMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post content */}
        <div className="space-y-3">
          {post.content && (
            <p className="text-sm leading-relaxed">
              {post.content.split(/(\s+)/).map((word, index) => {
                if (word.startsWith('#')) {
                  return (
                    <span key={index} className="text-orange-400 hover:underline cursor-pointer">
                      {word}
                    </span>
                  );
                }
                if (word.startsWith('@')) {
                  return (
                    <span key={index} className="text-blue-400 hover:underline cursor-pointer">
                      {word}
                    </span>
                  );
                }
                return word;
              })}
            </p>
          )}

          {/* Meme caption */}
          {post.memeCaption && (
            <div className="bg-muted/20 p-3 rounded-lg border border-muted/30">
              <div className="flex items-center space-x-2 mb-1">
                <Laugh className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-medium text-muted-foreground">MEME CAPTION</span>
              </div>
              <p className="text-sm font-medium">{post.memeCaption}</p>
            </div>
          )}

          {/* Meme file */}
          {post.imageUrl && (
            <div className="rounded-lg overflow-hidden border border-muted/20">
              {/* Image files */}
              {(!post.fileType || post.fileType.startsWith('image/')) && (
                <img 
                  src={post.imageUrl} 
                  alt={post.memeCaption || "Meme"}
                  className={`w-full transition-all duration-200 cursor-pointer ${
                    showFullImage ? 'max-h-none' : 'max-h-96 object-cover'
                  }`}
                  onClick={() => setShowFullImage(!showFullImage)}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              
              {/* Video files */}
              {post.fileType && post.fileType.startsWith('video/') && (
                <video 
                  src={post.imageUrl} 
                  controls 
                  className="w-full max-h-96"
                  poster={post.imageUrl}
                />
              )}
              
              {/* Audio files */}
              {post.fileType && post.fileType.startsWith('audio/') && (
                <div className="p-6 bg-muted/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <Music className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="font-medium">{post.fileName || "Audio File"}</p>
                      {post.fileSize && (
                        <p className="text-sm text-muted-foreground">
                          {Math.round(post.fileSize / 1024 / 1024 * 100) / 100} MB
                        </p>
                      )}
                    </div>
                  </div>
                  <audio 
                    src={post.imageUrl} 
                    controls 
                    className="w-full"
                  />
                </div>
              )}
              
              {/* File info for uploaded files */}
              {post.fileName && (
                <div className="px-3 py-2 bg-muted/5 border-t border-muted/20">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.fileName}</span>
                    {post.fileSize && (
                      <span>{Math.round(post.fileSize / 1024 / 1024 * 100) / 100} MB</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-500/10 text-orange-400 rounded-full text-xs"
                >
                  <Tag className="w-3 h-3" />
                  <span>{category}</span>
                </span>
              ))}
            </div>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((hashtag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs cursor-pointer hover:bg-blue-500/20"
                >
                  <Hash className="w-3 h-3" />
                  <span>{hashtag}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-muted/20 mt-4">
          <div className="flex items-center space-x-4">
            {/* Reactions */}
            {['like', 'love', 'rocket', 'fire'].map((type) => {
              const Icon = REACTION_ICONS[type as keyof typeof REACTION_ICONS];
              const count = post.reactions?.[type as keyof typeof post.reactions] || 0;
              const isActive = post.reactions?.userReaction === type;
              
              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(type)}
                  className={`flex items-center space-x-1 h-8 px-2 ${
                    isActive 
                      ? type === 'like' ? 'text-red-500' 
                        : type === 'love' ? 'text-pink-500'
                        : type === 'rocket' ? 'text-blue-500'
                        : 'text-orange-500'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
                  {count > 0 && <span className="text-xs">{count}</span>}
                </Button>
              );
            })}

            {/* Reply button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <MessageCircle className="w-4 h-4" />
              {post.commentCount > 0 && <span className="text-xs">{post.commentCount}</span>}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Repeat className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-4 pt-4 border-t border-muted/20">
            <form onSubmit={handleReply} className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">HM</span>
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder="Post your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!replyContent.trim() || replyMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {replyMutation.isPending ? "Posting..." : "Reply"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Replies */}
        {post.replies && post.replies.length > 0 && (
          <div className="mt-4 pt-4 border-t border-muted/20 space-y-3">
            {post.replies.map((reply) => (
              <div key={reply.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {getUserInitials(reply.author.username)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{reply.author.username}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}