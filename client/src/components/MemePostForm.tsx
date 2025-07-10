import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { ImageIcon, Upload, Hash, Laugh, X, Film, Music, FileIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDonation } from "@/contexts/DonationContext";
import { DonationButton } from "@/components/DonationButton";

const MEME_TEMPLATES = [
  "Drake Pointing",
  "Distracted Boyfriend",
  "Woman Yelling at Cat",
  "Two Buttons",
  "Change My Mind",
  "This is Fine",
  "Galaxy Brain",
  "Stonks",
  "Bitcoin Hodler",
  "Number Go Up",
  "Custom"
];

const MEME_CATEGORIES = [
  "Bitcoin Memes",
  "Crypto Humor", 
  "Trading Memes",
  "HODL Life",
  "Market Reactions",
  "General Funny"
];

export function MemePostForm() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [memeCaption, setMemeCaption] = useState("");
  const [memeTemplate, setMemeTemplate] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
  } | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { canPostMeme, incrementMemeCount } = useDonation();

  // Show donation prompt if user hasn't donated or already posted their meme
  if (!canPostMeme) {
    return <DonationButton />;
  }

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedFile(data.file);
      toast({
        title: "File uploaded!",
        description: "Your file has been uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: "Please try again with a different file",
        variant: "destructive",
      });
    }
  });

  const createMemeMutation = useMutation({
    mutationFn: async () => {
      // Extract hashtags and mentions from content
      const hashtags = content.match(/#(\w+)/g)?.map(tag => tag.slice(1)) || [];
      const mentions = content.match(/@(\w+)/g)?.map(mention => mention.slice(1)) || [];

      const finalImageUrl = uploadedFile?.url || imageUrl;
      
      const response = await apiRequest('POST', '/api/forum/posts', {
        content: content.trim(),
        imageUrl: finalImageUrl || undefined,
        fileName: uploadedFile?.originalName || undefined,
        fileType: uploadedFile?.mimetype || undefined,
        fileSize: uploadedFile?.size || undefined,
        memeCaption: memeCaption || undefined,
        memeTemplate: memeTemplate || undefined,
        categories,
        hashtags,
        mentions,
        isReply: false,
        upvotes: 0,
        downvotes: 0
      });
      return response.json();
    },
    onSuccess: () => {
      // Reset form
      setContent("");
      setImageUrl("");
      setUploadedFile(null);
      setMemeCaption("");
      setMemeTemplate("");
      setCategories([]);
      setShowAdvanced(false);
      
      // Increment meme count (this will disable further posting)
      incrementMemeCount();
      
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
      toast({
        title: "Meme posted!",
        description: "Your meme has been shared with the community. Thanks for your donation!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error posting meme",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (file: File) => {
    if (file) {
      uploadFileMutation.mutate(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return ImageIcon;
    if (mimetype.startsWith('video/')) return Film;
    if (mimetype.startsWith('audio/')) return Music;
    return FileIcon;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl.trim() && !uploadedFile) return;
    createMemeMutation.mutate();
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  return (
    <Card className="bg-card border border-muted/20 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">HM</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Laugh className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-muted-foreground">Share a Bitcoin Meme</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main content area */}
          <Textarea
            placeholder="What's your meme about? Add a caption or description..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0"
          />

          {/* Upload mode toggle */}
          <div className="flex items-center space-x-4 mb-4">
            <Button
              type="button"
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('file')}
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </Button>
            <Button
              type="button"
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('url')}
              className="flex items-center space-x-2"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Image URL</span>
            </Button>
          </div>

          {/* File upload area */}
          {uploadMode === 'file' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload Meme File</span>
              </Label>
              
              {!uploadedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-muted/40 hover:border-muted/60'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  {uploadFileMutation.isPending ? (
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">
                        Supports: JPEG, PNG, GIF, MP4, WEBM, MP3, WAV (max 50MB)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-muted/10 rounded-lg border border-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const Icon = getFileIcon(uploadedFile.mimetype);
                        return <Icon className="w-5 h-5 text-orange-500" />;
                      })()}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{uploadedFile.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadedFile.size)} • {uploadedFile.mimetype}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearUploadedFile}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* File preview */}
                  {uploadedFile.mimetype.startsWith('image/') && (
                    <div className="mt-3">
                      <img 
                        src={uploadedFile.url} 
                        alt="Uploaded meme" 
                        className="max-w-full h-auto max-h-64 rounded-md mx-auto"
                      />
                    </div>
                  )}
                  
                  {uploadedFile.mimetype.startsWith('video/') && (
                    <div className="mt-3">
                      <video 
                        src={uploadedFile.url} 
                        controls 
                        className="max-w-full h-auto max-h-64 rounded-md mx-auto"
                      />
                    </div>
                  )}
                  
                  {uploadedFile.mimetype.startsWith('audio/') && (
                    <div className="mt-3">
                      <audio 
                        src={uploadedFile.url} 
                        controls 
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Image URL input */}
          {uploadMode === 'url' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Meme Image URL</span>
              </Label>
              <Input
                type="url"
                placeholder="https://example.com/your-meme.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="border-muted/40"
              />
              {imageUrl && (
                <div className="mt-3 p-2 border border-muted/20 rounded-lg">
                  <img 
                    src={imageUrl} 
                    alt="Meme preview" 
                    className="max-w-full h-auto max-h-64 rounded-md mx-auto"
                    onError={() => setImageUrl("")}
                  />
                </div>
              )}
            </div>
          )}

          {/* Advanced options toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-muted-foreground"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </Button>

          {showAdvanced && (
            <div className="space-y-4 p-4 bg-muted/10 rounded-lg">
              {/* Meme template selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Meme Template</Label>
                <Select value={memeTemplate} onValueChange={setMemeTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a meme template" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEME_TEMPLATES.map((template) => (
                      <SelectItem key={template} value={template}>
                        {template}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meme caption */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Meme Caption</Label>
                <Input
                  placeholder="Top text / Bottom text"
                  value={memeCaption}
                  onChange={(e) => setMemeCaption(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center space-x-2">
                  <Hash className="w-4 h-4" />
                  <span>Categories</span>
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {categories.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs cursor-pointer"
                      onClick={() => removeCategory(category)}
                    >
                      {category} ×
                    </span>
                  ))}
                </div>
                <Select onValueChange={addCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEME_CATEGORIES.filter(cat => !categories.includes(cat)).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-between items-center pt-3 border-t border-muted/20">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <ImageIcon className="w-4 h-4" />
                <span>Image</span>
              </span>
              <span className="flex items-center space-x-1">
                <Hash className="w-4 h-4" />
                <span>Tags</span>
              </span>
              <span className="flex items-center space-x-1">
                <Laugh className="w-4 h-4" />
                <span>Meme</span>
              </span>
            </div>
            <Button 
              type="submit" 
              disabled={(!content.trim() && !imageUrl.trim() && !uploadedFile) || createMemeMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {createMemeMutation.isPending ? "Posting..." : "Post Meme"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}