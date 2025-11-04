import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import CycleChart from "@/components/CycleChart";
import SymptomFrequency from "@/components/SymptomFrequency";
import CyclePredictions from "@/components/CyclePredictions";

const Analytics = () => {
  const [user, setUser] = useState<User | null>(null);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Your Insights
        </h1>
        <div className="space-y-6">
          <CyclePredictions userId={user.id} />
          <CycleChart userId={user.id} />
          <SymptomFrequency userId={user.id} />
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default Analytics;