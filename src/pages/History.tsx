import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplet, Smile, Heart, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface PeriodLog {
  id: string;
  start_date: string;
  end_date: string | null;
  is_predicted: boolean;
}

interface SymptomLog {
  id: string;
  date: string;
  mood: string | null;
  symptoms: string[] | null;
  notes: string | null;
}

interface DailyCheckIn {
  id: string;
  date: string;
  mood: string | null;
  energy_level: number | null;
  water_intake: number | null;
  sleep_hours: number | null;
  notes: string | null;
}

const History = () => {
  const [user, setUser] = useState<User | null>(null);
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [periodsRes, symptomsRes, checkInsRes] = await Promise.all([
        supabase
          .from("cycles")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_predicted", false)
          .order("start_date", { ascending: false }),
        supabase
          .from("symptoms")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false }),
        supabase
          .from("daily_checkins")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false }),
      ]);

      if (periodsRes.data) setPeriodLogs(periodsRes.data);
      if (symptomsRes.data) setSymptomLogs(symptomsRes.data);
      if (checkInsRes.data) setCheckIns(checkInsRes.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Your History</h1>

        <div className="space-y-6">
          {/* Period Logs */}
          <Card className="bg-gradient-card shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-primary" />
                Period Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : periodLogs.length === 0 ? (
                <p className="text-muted-foreground">No period logs yet</p>
              ) : (
                <div className="space-y-3">
                  {periodLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {format(new Date(log.start_date), "MMM d, yyyy")}
                          {log.end_date && ` - ${format(new Date(log.end_date), "MMM d, yyyy")}`}
                        </p>
                        {log.end_date && (
                          <p className="text-sm text-muted-foreground">
                            Duration: {Math.ceil((new Date(log.end_date).getTime() - new Date(log.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Check-Ins */}
          <Card className="bg-gradient-card shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Daily Check-Ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : checkIns.length === 0 ? (
                <p className="text-muted-foreground">No check-ins yet</p>
              ) : (
                <div className="space-y-3">
                  {checkIns.map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="p-4 bg-muted/50 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {format(new Date(checkIn.date), "MMM d, yyyy")}
                        </p>
                        {checkIn.mood && (
                          <Badge variant="secondary" className="capitalize">
                            {checkIn.mood}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                        {checkIn.energy_level && (
                          <div>Energy: {checkIn.energy_level}/5</div>
                        )}
                        {checkIn.water_intake !== null && (
                          <div>Water: {checkIn.water_intake} glasses</div>
                        )}
                        {checkIn.sleep_hours && (
                          <div>Sleep: {checkIn.sleep_hours}h</div>
                        )}
                      </div>
                      {checkIn.notes && (
                        <p className="text-sm text-foreground/80 mt-2">{checkIn.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Symptom Logs */}
          <Card className="bg-gradient-card shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-primary" />
                Symptom Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : symptomLogs.length === 0 ? (
                <p className="text-muted-foreground">No symptom logs yet</p>
              ) : (
                <div className="space-y-3">
                  {symptomLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 bg-muted/50 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {format(new Date(log.date), "MMM d, yyyy")}
                        </p>
                        {log.mood && (
                          <Badge variant="secondary" className="capitalize">
                            {log.mood}
                          </Badge>
                        )}
                      </div>
                      {log.symptoms && log.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {log.symptoms.map((symptom, idx) => (
                            <Badge key={idx} variant="outline">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {log.notes && (
                        <p className="text-sm text-foreground/80 mt-2">{log.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default History;
