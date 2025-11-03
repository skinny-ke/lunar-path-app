import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { requestNotificationPermission } from "@/utils/notifications";

interface ProfileSettingsProps {
  userId: string;
}

const ProfileSettings = ({ userId }: ProfileSettingsProps) => {
  const [username, setUsername] = useState("");
  const [avgCycle, setAvgCycle] = useState(28);
  const [avgPeriod, setAvgPeriod] = useState(5);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationDays, setNotificationDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setUsername(data.username || "");
        setAvgCycle(data.average_cycle_length);
        setAvgPeriod(data.average_period_length);
        setAvatarUrl(data.avatar_url);
        setNotificationsEnabled(data.notification_enabled || false);
        setNotificationDays(data.notification_days_before || 3);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
      });
      return;
    }

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${Math.random()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Success",
        description: "Profile picture updated!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings",
        });
        return;
      }
    }
    setNotificationsEnabled(enabled);
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        average_cycle_length: avgCycle,
        average_period_length: avgPeriod,
        notification_enabled: notificationsEnabled,
        notification_days_before: notificationDays,
      })
      .eq("id", userId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }
    setLoading(false);
  };

  return (
    <Card className="bg-gradient-card shadow-soft border-border/50">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>{username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <Label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="text-sm">Upload Photo</span>
            </div>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avgCycle">Average Cycle Length (days)</Label>
          <Input
            id="avgCycle"
            type="number"
            value={avgCycle}
            onChange={(e) => setAvgCycle(Number(e.target.value))}
            min="20"
            max="45"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avgPeriod">Average Period Length (days)</Label>
          <Input
            id="avgPeriod"
            type="number"
            value={avgPeriod}
            onChange={(e) => setAvgPeriod(Number(e.target.value))}
            min="3"
            max="10"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="notifications">Period Reminders</Label>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
          {notificationsEnabled && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="notificationDays">Notify me (days before)</Label>
              <Input
                id="notificationDays"
                type="number"
                value={notificationDays}
                onChange={(e) => setNotificationDays(Number(e.target.value))}
                min="1"
                max="7"
                className="rounded-xl"
              />
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;