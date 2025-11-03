import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles } from "lucide-react";
import { FertilityData } from "@/utils/fertility";
import { format } from "date-fns";

interface FertilityInfoProps {
  fertilityData: FertilityData;
}

const FertilityInfo = ({ fertilityData }: FertilityInfoProps) => {
  const { ovulationDate, fertileWindowStart, fertileWindowEnd, currentPhase, daysUntilOvulation } = fertilityData;

  const phaseColors: Record<FertilityData["currentPhase"], string> = {
    menstrual: "bg-red-500/10 text-red-600 border-red-500/20",
    follicular: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    ovulation: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    luteal: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    unknown: "bg-muted text-muted-foreground",
  };

  const phaseLabels: Record<FertilityData["currentPhase"], string> = {
    menstrual: "Menstrual Phase",
    follicular: "Follicular Phase",
    ovulation: "Ovulation Phase",
    luteal: "Luteal Phase",
    unknown: "Unknown Phase",
  };

  return (
    <Card className="bg-gradient-card shadow-soft border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Fertility & Cycle Phase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Phase</span>
          <Badge className={phaseColors[currentPhase]}>
            {phaseLabels[currentPhase]}
          </Badge>
        </div>

        {ovulationDate && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">Ovulation</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Ovulation Date</p>
                <p className="font-medium">{format(ovulationDate, "MMM d, yyyy")}</p>
              </div>
              {daysUntilOvulation !== null && (
                <div>
                  <p className="text-muted-foreground mb-1">Days Until</p>
                  <p className="font-medium">
                    {daysUntilOvulation > 0 
                      ? `${daysUntilOvulation} days`
                      : daysUntilOvulation === 0
                      ? "Today!"
                      : `${Math.abs(daysUntilOvulation)} days ago`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {fertileWindowStart && fertileWindowEnd && (
          <div className="space-y-2 pt-2 border-t">
            <span className="text-sm font-medium">Fertile Window</span>
            <p className="text-sm text-muted-foreground">
              {format(fertileWindowStart, "MMM d")} - {format(fertileWindowEnd, "MMM d, yyyy")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FertilityInfo;
