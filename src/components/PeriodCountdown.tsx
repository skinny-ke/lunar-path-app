import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Droplet } from "lucide-react";
import { addDays, differenceInDays, format, parseISO } from "date-fns";

interface PeriodCountdownProps {
  userId: string;
}

const PeriodCountdown = ({ userId }: PeriodCountdownProps) => {
  const [daysUntil, setDaysUntil] = useState<number | null>(null);
  const [nextPeriodDate, setNextPeriodDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: cycles } = await supabase
        .from("cycles")
        .select("*")
        .eq("user_id", userId)
        .eq("is_predicted", false)
        .order("start_date", { ascending: false })
        .limit(1);

      const { data: profile } = await supabase
        .from("profiles")
        .select("average_cycle_length, last_period_date")
        .eq("id", userId)
        .maybeSingle();

      if (cycles && cycles.length > 0 && profile) {
        const lastPeriod = parseISO(cycles[0].start_date);
        const predicted = addDays(lastPeriod, profile.average_cycle_length);
        setNextPeriodDate(predicted);
        setDaysUntil(differenceInDays(predicted, new Date()));

        // Update last_period_date in profile if not set or outdated
        if (!profile.last_period_date || profile.last_period_date !== cycles[0].start_date) {
          await supabase
            .from("profiles")
            .update({ last_period_date: cycles[0].start_date })
            .eq("id", userId);
        }
      }
    };

    fetchData();
  }, [userId]);

  return (
    <Card className="bg-gradient-card shadow-soft border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-primary" />
          Next Period
        </CardTitle>
      </CardHeader>
      <CardContent>
        {daysUntil !== null && nextPeriodDate ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {daysUntil}
              </div>
              <div className="text-muted-foreground mt-2">
                {daysUntil === 0 ? "Today" : daysUntil === 1 ? "day" : "days"}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Expected on {format(nextPeriodDate, "MMMM d, yyyy")}</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            Start tracking to see predictions
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PeriodCountdown;