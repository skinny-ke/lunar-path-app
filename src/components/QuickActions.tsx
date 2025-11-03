import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Smile, Heart } from "lucide-react";
import LogPeriodDialog from "./dialogs/LogPeriodDialog";
import LogSymptomDialog from "./dialogs/LogSymptomDialog";
import DailyCheckInDialog from "./dialogs/DailyCheckInDialog";

interface QuickActionsProps {
  userId: string;
}

const QuickActions = ({ userId }: QuickActionsProps) => {
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const [symptomDialogOpen, setSymptomDialogOpen] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);

  return (
    <>
      <Card className="bg-gradient-card shadow-soft border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => setPeriodDialogOpen(true)}
              variant="soft"
              className="h-24 flex flex-col gap-2"
            >
              <Droplet className="h-6 w-6" />
              <span className="text-xs">Log Period</span>
            </Button>
            <Button
              onClick={() => setSymptomDialogOpen(true)}
              variant="soft"
              className="h-24 flex flex-col gap-2"
            >
              <Smile className="h-6 w-6" />
              <span className="text-xs">Log Symptoms</span>
            </Button>
            <Button
              onClick={() => setCheckInDialogOpen(true)}
              variant="soft"
              className="h-24 flex flex-col gap-2"
            >
              <Heart className="h-6 w-6" />
              <span className="text-xs">Daily Check-In</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <LogPeriodDialog
        open={periodDialogOpen}
        onOpenChange={setPeriodDialogOpen}
        userId={userId}
      />
      <LogSymptomDialog
        open={symptomDialogOpen}
        onOpenChange={setSymptomDialogOpen}
        userId={userId}
      />
      <DailyCheckInDialog
        open={checkInDialogOpen}
        onOpenChange={setCheckInDialogOpen}
        userId={userId}
      />
    </>
  );
};

export default QuickActions;