import { addDays, differenceInDays, format } from "date-fns";

export interface FertilityData {
  nextPeriodDate: Date | null;
  ovulationDate: Date | null;
  fertileWindowStart: Date | null;
  fertileWindowEnd: Date | null;
  daysUntilPeriod: number | null;
  daysUntilOvulation: number | null;
  currentPhase: "menstrual" | "follicular" | "ovulation" | "luteal" | "unknown";
}

export const calculateFertility = (
  lastPeriodDate: string | null,
  averageCycleLength: number
): FertilityData => {
  if (!lastPeriodDate) {
    return {
      nextPeriodDate: null,
      ovulationDate: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      daysUntilPeriod: null,
      daysUntilOvulation: null,
      currentPhase: "unknown",
    };
  }

  const lastPeriod = new Date(lastPeriodDate);
  const today = new Date();
  
  // Calculate next period date
  const nextPeriodDate = addDays(lastPeriod, averageCycleLength);
  const daysUntilPeriod = differenceInDays(nextPeriodDate, today);
  
  // Ovulation typically occurs 14 days before next period
  const ovulationDate = addDays(nextPeriodDate, -14);
  const daysUntilOvulation = differenceInDays(ovulationDate, today);
  
  // Fertile window is 5 days before ovulation to 1 day after
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);
  
  // Determine current phase
  const daysSinceLastPeriod = differenceInDays(today, lastPeriod);
  let currentPhase: FertilityData["currentPhase"] = "unknown";
  
  if (daysSinceLastPeriod >= 0 && daysSinceLastPeriod <= 5) {
    currentPhase = "menstrual";
  } else if (daysSinceLastPeriod > 5 && daysSinceLastPeriod < averageCycleLength - 14) {
    currentPhase = "follicular";
  } else if (Math.abs(differenceInDays(today, ovulationDate)) <= 1) {
    currentPhase = "ovulation";
  } else if (daysSinceLastPeriod >= averageCycleLength - 14 && daysSinceLastPeriod < averageCycleLength) {
    currentPhase = "luteal";
  }
  
  return {
    nextPeriodDate,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    daysUntilPeriod,
    daysUntilOvulation,
    currentPhase,
  };
};

export const isDateInFertileWindow = (
  date: Date,
  fertileWindowStart: Date | null,
  fertileWindowEnd: Date | null
): boolean => {
  if (!fertileWindowStart || !fertileWindowEnd) return false;
  return date >= fertileWindowStart && date <= fertileWindowEnd;
};

export const isOvulationDay = (date: Date, ovulationDate: Date | null): boolean => {
  if (!ovulationDate) return false;
  return format(date, "yyyy-MM-dd") === format(ovulationDate, "yyyy-MM-dd");
};
