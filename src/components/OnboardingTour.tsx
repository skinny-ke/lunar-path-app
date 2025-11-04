import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Activity, User, History } from "lucide-react";

const tourSteps = [
  {
    title: "Welcome to Your Cycle Tracker! 🌸",
    description: "Let's take a quick tour to help you get started with tracking your menstrual health and wellness.",
    icon: Heart,
  },
  {
    title: "Dashboard - Your Home Base",
    description: "See your period countdown, fertility window, daily quotes, and quick actions for logging symptoms and check-ins.",
    icon: Activity,
  },
  {
    title: "Calendar View",
    description: "Visualize your entire cycle with color-coded days showing periods (pink), ovulation (pink border), and fertile windows (teal).",
    icon: Calendar,
  },
  {
    title: "History & Analytics",
    description: "Track your journey over time with detailed history logs and insightful analytics about your cycle patterns.",
    icon: History,
  },
  {
    title: "Profile Settings",
    description: "Customize your cycle details, enable notifications, upload an avatar, and manage your account settings.",
    icon: User,
  },
];

export const OnboardingTour = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenOnboardingTour");
    if (!hasSeenTour) {
      setOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    localStorage.setItem("hasSeenOnboardingTour", "true");
    setOpen(false);
    navigate("/profile");
  };

  const CurrentIcon = tourSteps[currentStep].icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-border/50">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-primary p-4 rounded-full shadow-glow">
              <CurrentIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center bg-gradient-primary bg-clip-text text-transparent">
            {tourSteps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {tourSteps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-2 py-4">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-gradient-primary"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>
        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="flex-1"
          >
            Skip Tour
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1"
          >
            {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};