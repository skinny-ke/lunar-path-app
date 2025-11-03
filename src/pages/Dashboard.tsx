import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import PeriodCountdown from "@/components/PeriodCountdown";
import QuickActions from "@/components/QuickActions";
import CycleSummary from "@/components/CycleSummary";
import DailyQuote from "@/components/DailyQuote";
import FertilityInfo from "@/components/FertilityInfo";
import { calculateFertility, FertilityData } from "@/utils/fertility";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [fertilityData, setFertilityData] = useState<FertilityData | null>(null);
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
    const fetchFertilityData = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("last_period_date, average_cycle_length")
        .eq("id", user.id)
        .single();

      if (profile) {
        const fertility = calculateFertility(
          profile.last_period_date,
          profile.average_cycle_length
        );
        setFertilityData(fertility);
      }
    };

    fetchFertilityData();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <DailyQuote />
          <PeriodCountdown userId={user.id} />
          {fertilityData && <FertilityInfo fertilityData={fertilityData} />}
          <QuickActions userId={user.id} />
          <CycleSummary userId={user.id} />
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default Dashboard;