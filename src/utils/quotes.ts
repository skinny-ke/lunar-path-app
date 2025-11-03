export const motivationalQuotes = [
  "Your body is a temple. Honor it, nurture it, listen to it.",
  "Every cycle is a reminder of your body's incredible wisdom.",
  "Be gentle with yourself. You're doing the best you can.",
  "Self-care isn't selfish. It's essential.",
  "Your period is not a curse, it's a superpower.",
  "Listen to your body. It knows what it needs.",
  "You are stronger than your symptoms.",
  "Embrace the rhythm of your body.",
  "Rest is productive. Your body is working hard.",
  "Tracking your cycle is an act of self-love.",
  "Your hormones don't define you, but understanding them empowers you.",
  "Be patient with yourself during every phase.",
  "You're not being dramatic. Your feelings are valid.",
  "Small steps of self-care create big changes.",
  "Your wellness journey is uniquely yours.",
  "Celebrate your body's natural cycles.",
  "Today is a good day to prioritize yourself.",
  "Your body deserves compassion, not criticism.",
  "Trust the wisdom of your cycle.",
  "You're exactly where you need to be.",
];

export const getRandomQuote = (): string => {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
};

export const getDailyQuote = (): string => {
  // Use the current date as a seed for consistent daily quote
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
};
