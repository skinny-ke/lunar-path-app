import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { calculatePredictions, CyclePrediction, getAccuracyLabel, getAccuracyColor } from "@/utils/predictions";
import { format } from "date-fns";
import { Calendar, Activity, Target, TrendingUp } from "lucide-react";

interface CyclePredictionsProps {
  userId: string;
}

const CyclePredictions = ({ userId }: CyclePredictionsProps) => {
  const [predictions, setPredictions] = useState<CyclePrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("last_period_date, average_cycle_length")
        .eq("id", userId)
        .single();

      if (!profile?.last_period_date) {
        setLoading(false);
        return;
      }

      // Get historical cycles
      const { data: cycles } = await supabase
        .from("cycles")
        .select("start_date, end_date")
        .eq("user_id", userId)
        .order("start_date", { ascending: false })
        .limit(12);

      if (cycles) {
        const prediction = calculatePredictions(
          cycles,
          profile.last_period_date,
          profile.average_cycle_length
        );
        setPredictions(prediction);
      }

      setLoading(false);
    };

    fetchPredictions();
  }, [userId]);

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-soft border-border/50">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading predictions...</div>
        </CardContent>
      </Card>
    );
  }

  if (!predictions) {
    return (
      <Card className="bg-gradient-card shadow-soft border-border/50">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Add your last period date in Profile to see predictions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-soft border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Cycle Predictions
            </CardTitle>
            <CardDescription>Based on your cycle history</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
            <Badge variant="outline" className={getAccuracyColor(predictions.accuracyScore)}>
              {predictions.accuracyScore}% - {getAccuracyLabel(predictions.accuracyScore)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Next Period
            </div>
            <div className="text-2xl font-bold text-foreground">
              {format(predictions.nextPeriodDate, "MMM dd, yyyy")}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(predictions.nextPeriodDate, "EEEE")}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Next Ovulation
            </div>
            <div className="text-2xl font-bold text-foreground">
              {format(predictions.nextOvulationDate, "MMM dd, yyyy")}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(predictions.nextOvulationDate, "EEEE")}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Fertile Window
            </div>
            <div className="text-lg font-semibold text-foreground">
              {format(predictions.fertilityWindowStart, "MMM dd")} - {format(predictions.fertilityWindowEnd, "MMM dd, yyyy")}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Cycle variability: ±{predictions.cycleVariability} days</p>
            <p>• Predictions improve with more cycle data</p>
            <p>• Log your periods regularly for better accuracy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CyclePredictions;