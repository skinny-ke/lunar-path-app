import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { getDailyQuote } from "@/utils/quotes";

const DailyQuote = () => {
  const quote = getDailyQuote();

  return (
    <Card className="bg-gradient-card shadow-soft border-border/50 overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
            <Quote className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-lg italic text-foreground/90 leading-relaxed">
              "{quote}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuote;
