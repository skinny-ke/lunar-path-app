import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Heart, Plus, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  is_anonymous: boolean;
  created_at: string;
  profiles?: {
    username: string;
  };
}

const Community = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
    is_anonymous: false,
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, filter]);

  const fetchPosts = async () => {
    setLoading(true);

    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles(username)
      `)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("category", filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
    } else if (data) {
      setPosts(data);
      
      // Fetch likes and comment counts
      if (user) {
        const postIds = data.map(p => p.id);
        
        const { data: likesData } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds);

        const likesMap: Record<string, boolean> = {};
        likesData?.forEach(like => {
          likesMap[like.post_id] = true;
        });
        setLikes(likesMap);

        // Get comment counts
        const { data: commentsData } = await supabase
          .from("comments")
          .select("post_id")
          .in("post_id", postIds);

        const counts: Record<string, number> = {};
        commentsData?.forEach(comment => {
          counts[comment.post_id] = (counts[comment.post_id] || 0) + 1;
        });
        setCommentCounts(counts);
      }
    }

    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.title || !newPost.content) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      ...newPost,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create post. Please try again.",
      });
    } else {
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
      setDialogOpen(false);
      setNewPost({ title: "", content: "", category: "general", is_anonymous: false });
      fetchPosts();
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    if (likes[postId]) {
      // Unlike
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      
      setLikes(prev => ({ ...prev, [postId]: false }));
    } else {
      // Like
      await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: user.id,
      });
      
      setLikes(prev => ({ ...prev, [postId]: true }));
    }
  };

  if (!user) return null;

  const categories = [
    { value: "all", label: "All Posts" },
    { value: "general", label: "General" },
    { value: "health", label: "Health" },
    { value: "wellness", label: "Wellness" },
    { value: "tips", label: "Tips & Advice" },
    { value: "support", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Community
            </h1>
            <p className="text-muted-foreground mt-1">Connect, share, and support each other</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a Post</DialogTitle>
                <DialogDescription>Share your thoughts with the community</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="What's on your mind?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newPost.category}
                    onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your experience..."
                    rows={5}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    checked={newPost.is_anonymous}
                    onCheckedChange={(checked) => setNewPost({ ...newPost, is_anonymous: checked })}
                  />
                  <Label htmlFor="anonymous">Post anonymously</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost}>Post</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <Button
              key={cat.value}
              variant={filter === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <Card className="bg-gradient-card shadow-soft border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading posts...
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="bg-gradient-card shadow-soft border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                No posts yet. Be the first to share!
              </CardContent>
            </Card>
          ) : (
            posts.map(post => (
              <Card key={post.id} className="bg-gradient-card shadow-soft border-border/50 hover:shadow-glow transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {post.is_anonymous ? "Anonymous" : post.profiles?.username || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap mb-4">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={likes[post.id] ? "text-primary" : ""}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${likes[post.id] ? "fill-current" : ""}`} />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {commentCounts[post.id] || 0} Comments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default Community;