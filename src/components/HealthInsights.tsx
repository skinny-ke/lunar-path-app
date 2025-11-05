import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface HealthInsightsProps {
  userId: string;
}

const HealthInsights = ({ userId }: HealthInsightsProps) => {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('health-insights', {
        body: { user_id: userId }
      });

      if (error) {
        console.error('Error generating insights:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to generate insights. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.insights) {
        setInsights(data.insights);
        toast({
          title: "Insights Generated!",
          description: "Your personalized health insights are ready.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-colorful hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg gradient-vibrant">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>AI Health Insights</CardTitle>
              <CardDescription>
                Get personalized tips based on your cycle patterns and symptoms
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={generateInsights} 
            disabled={loading}
            className="gradient-animated"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {insights && (
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h2 className="text-xl font-bold text-primary mt-4 mb-2">{children}</h2>,
                h2: ({ children }) => <h3 className="text-lg font-semibold text-foreground mt-3 mb-2">{children}</h3>,
                h3: ({ children }) => <h4 className="text-base font-medium text-foreground mt-2 mb-1">{children}</h4>,
                p: ({ children }) => <p className="text-muted-foreground mb-2">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              }}
            >
              {insights}
            </ReactMarkdown>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default HealthInsights;
