import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Repeat, 
  Share, 
  MoreHorizontal,
  Rocket,
  ThumbsUp,
  Reply,
  Zap
} from "lucide-react";
import { formatRelativeTime, getUserInitials } from "@/lib/utils";
import { ForumPost } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SocialForumPostProps {
  post: ForumPost;
  showReplies?: boolean;
}

const SocialForumPost = ({ post, showReplies = true }: SocialForumPostProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showAllReplies, setShowAllReplies] = useState(false);
  const { toast } = useToast();

  // Fetch replies if needed
  const { data: allReplies = [] } = useQuery({
    queryKey: [`/api/forum/posts/${post.id}/replies`],
    enabled: showAllReplies && showReplies,
  });

  const reactionMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiRequest('POST', `/api/forum/posts/${post.id}/reactions`, { type });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to react",
        description: error.message,
        variant: "destructive",
      });
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
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${post.id}/replies`] });
      setReplyContent("");
      setShowReplyForm(false);
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to post reply",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleReaction = (type: string) => {
    reactionMutation.mutate(type);
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      replyMutation.mutate(replyContent);
    }
  };

  const extractHashtags = (text: string) => {
    return text.match(/#\w+/g) || [];
  };

  const extractMentions = (text: string) => {
    return text.match(/@\w+/g) || [];
  };

  const formatPostContent = (content: string) => {
    return content
      .replace(/#(\w+)/g, '<span class="text-blue-500 font-medium">#$1</span>')
      .replace(/@(\w+)/g, '<span class="text-blue-500 font-medium">@$1</span>');
  };

  const reactionButtons = [
    { type: 'like', icon: ThumbsUp, label: 'Like', count: post.reactions?.like || 0 },
    { type: 'love', icon: Heart, label: 'Love', count: post.reactions?.love || 0 },
    { type: 'rocket', icon: Rocket, label: 'Rocket', count: post.reactions?.rocket || 0 },
    { type: 'fire', icon: Zap, label: 'Fire', count: post.reactions?.fire || 0 },
  ];

  const displayReplies = showAllReplies ? allReplies : (post.replies || []);

  return (
    <Card className={`bg-card border border-muted/20 ${post.isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              {post.author.avatar ? (
                <img 
                  src={post.author.avatar} 
                  alt={post.author.username} 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {getUserInitials(post.author.username)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {post.author.username}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(post.createdAt)}
                </span>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Post Title (if exists) */}
            {post.title && (
              <h3 className="text-lg font-semibold mt-1 mb-2">{post.title}</h3>
            )}
            
            {/* Post Content */}
            <div 
              className="text-sm text-foreground whitespace-pre-wrap mb-3"
              dangerouslySetInnerHTML={{ __html: formatPostContent(post.content) }}
            />
            
            {/* Categories */}
            {post.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.categories.map((category) => (
                  <Badge 
                    key={category} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Hashtags */}
            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.hashtags.map((hashtag) => (
                  <span key={hashtag} className="text-blue-500 text-sm font-medium">
                    #{hashtag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-muted/20">
              <div className="flex items-center space-x-1">
                {reactionButtons.map(({ type, icon: Icon, label, count }) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(type)}
                    className={`text-xs flex items-center space-x-1 ${
                      post.reactions?.userReaction === type ? 'text-orange-500' : 'text-muted-foreground'
                    }`}
                    disabled={reactionMutation.isPending}
                  >
                    <Icon className="h-4 w-4" />
                    {count > 0 && <span>{count}</span>}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs text-muted-foreground flex items-center space-x-1"
                >
                  <Reply className="h-4 w-4" />
                  <span>Reply</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground flex items-center space-x-1"
                >
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Reply Form */}
            {showReplyForm && (
              <div className="mt-3 pt-3 border-t border-muted/20">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] mb-2"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={!replyContent.trim() || replyMutation.isPending}
                  >
                    {replyMutation.isPending ? "Posting..." : "Reply"}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Replies */}
            {showReplies && displayReplies.length > 0 && (
              <div className="mt-4">
                {displayReplies.map((reply) => (
                  <SocialForumPost 
                    key={reply.id} 
                    post={reply} 
                    showReplies={false}
                  />
                ))}
                
                {!showAllReplies && (allReplies as ForumPost[]).length > (post.replies?.length || 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllReplies(true)}
                    className="mt-2 text-blue-500"
                  >
                    Show more replies ({(allReplies as ForumPost[]).length - (post.replies?.length || 0)})
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialForumPost;