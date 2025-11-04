import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, X } from "lucide-react";

interface EmailVerificationBannerProps {
  email: string;
  onDismiss: () => void;
}

export const EmailVerificationBanner = ({ email, onDismiss }: EmailVerificationBannerProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox and spam folder.",
      });
    }
    setLoading(false);
  };

  return (
    <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
      <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <div className="flex items-start justify-between flex-1">
        <div className="flex-1">
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">
            Verify your email address
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            We've sent a verification email to <strong>{email}</strong>. 
            Please check your inbox and click the link to verify your account.
          </AlertDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={loading}
            className="mt-2 border-yellow-300 dark:border-yellow-700"
          >
            {loading ? "Sending..." : "Resend verification email"}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};