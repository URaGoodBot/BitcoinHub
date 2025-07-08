import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Image as ImageIcon, 
  Hash, 
  AtSign, 
  X,
  Plus
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getUserInitials } from "@/lib/utils";

interface NewPostFormProps {
  onPostCreated?: () => void;
  placeholder?: string;
}

const NewPostForm = ({ onPostCreated, placeholder = "What's happening in Bitcoin?" }: NewPostFormProps) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [showTitle, setShowTitle] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const { toast } = useToast();

  const availableCategories = [
    "Price Discussion", "Wallets", "Mining", "Security", 
    "Trading", "Technology", "Adoption", "News", "Learning Resources"
  ];

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest('POST', '/api/forum/posts', postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setContent("");
      setTitle("");
      setCategories([]);
      setShowTitle(false);
      onPostCreated?.();
      toast({
        title: "Post created",
        description: "Your post has been shared with the community!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!content.trim()) return;

    // Extract hashtags and mentions from content
    const hashtags = content.match(/#(\w+)/g)?.map(tag => tag.slice(1)) || [];
    const mentions = content.match(/@(\w+)/g)?.map(mention => mention.slice(1)) || [];

    createPostMutation.mutate({
      userId: 2, // HodlMyBeer21 user
      title: showTitle && title ? title : undefined,
      content: content.trim(),
      categories,
      hashtags,
      mentions,
      isReply: false,
      upvotes: 0,
      downvotes: 0
    });
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const addCustomCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  return (
    <Card className="bg-card border border-muted/20 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              HM
            </span>
          </div>
          <div className="flex-1">
            {showTitle && (
              <Input
                placeholder="Post title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-3"
              />
            )}
            <Textarea
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] border-none shadow-none resize-none p-0 text-base bg-transparent"
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.map((category) => (
              <Badge 
                key={category} 
                variant="secondary" 
                className="text-xs flex items-center gap-1"
              >
                {category}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeCategory(category)}
                />
              </Badge>
            ))}
          </div>
        )}
        
        {/* Category Selection */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1 mb-2">
            {availableCategories
              .filter(cat => !categories.includes(cat))
              .slice(0, 6)
              .map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  onClick={() => addCategory(category)}
                  className="text-xs h-6"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {category}
                </Button>
              ))}
          </div>
          
          {/* Custom category input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="text-xs h-8"
              onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addCustomCategory}
              disabled={!newCategory.trim()}
              className="h-8"
            >
              Add
            </Button>
          </div>
        </div>
        
        {/* Post Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-muted/20">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTitle(!showTitle)}
              className={`text-xs ${showTitle ? 'text-orange-500' : 'text-muted-foreground'}`}
            >
              <Hash className="h-4 w-4 mr-1" />
              Title
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              disabled
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              Image
            </Button>
            
            <span className="text-xs text-muted-foreground">
              Use #hashtags and @mentions
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${content.length > 280 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {content.length}/500
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > 500 || createPostMutation.isPending}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600"
            >
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewPostForm;