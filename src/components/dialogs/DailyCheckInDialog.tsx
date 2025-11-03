import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Smile, Frown, Meh, SmilePlus, Angry } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface DailyCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const DailyCheckInDialog = ({ open, onOpenChange, userId }: DailyCheckInDialogProps) => {
  const [mood, setMood] = useState<string>("");
  const [energyLevel, setEnergyLevel] = useState<number[]>([3]);
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [sleepHours, setSleepHours] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const moods = [
    { value: "amazing", icon: SmilePlus, label: "Amazing", color: "text-green-500" },
    { value: "happy", icon: Smile, label: "Happy", color: "text-blue-500" },
    { value: "neutral", icon: Meh, label: "Neutral", color: "text-yellow-500" },
    { value: "sad", icon: Frown, label: "Sad", color: "text-orange-500" },
    { value: "angry", icon: Angry, label: "Angry", color: "text-red-500" },
  ];

  const handleSubmit = async () => {
    if (!mood) {
      toast({
        title: "Missing Information",
        description: "Please select your mood",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const today = new Date().toISOString().split("T")[0];

    try {
      const { error } = await supabase
        .from("daily_checkins")
        .upsert({
          user_id: userId,
          date: today,
          mood,
          energy_level: energyLevel[0],
          water_intake: waterIntake,
          sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
          notes: notes || null,
        }, {
          onConflict: "user_id,date"
        });

      if (error) throw error;

      toast({
        title: "Check-in Saved!",
        description: "Your daily wellness check-in has been recorded.",
      });

      // Reset form
      setMood("");
      setEnergyLevel([3]);
      setWaterIntake(0);
      setSleepHours("");
      setNotes("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily Wellness Check-In</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>How are you feeling today?</Label>
            <div className="grid grid-cols-5 gap-2">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    mood === m.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <m.icon className={`h-6 w-6 ${m.color}`} />
                  <span className="text-xs">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Energy Level: {energyLevel[0]}/5</Label>
            <Slider
              value={energyLevel}
              onValueChange={setEnergyLevel}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="water">Water Intake (glasses)</Label>
            <Input
              id="water"
              type="number"
              min="0"
              max="20"
              value={waterIntake}
              onChange={(e) => setWaterIntake(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sleep">Sleep (hours)</Label>
            <Input
              id="sleep"
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              placeholder="8"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How's your day going? Any thoughts to capture..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
            variant="soft"
          >
            {isLoading ? "Saving..." : "Save Check-In"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyCheckInDialog;
