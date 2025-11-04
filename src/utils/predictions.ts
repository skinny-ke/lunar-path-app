import { differenceInDays, addDays, format } from "date-fns";

export interface CyclePrediction {
  nextPeriodDate: Date;
  nextOvulationDate: Date;
  fertilityWindowStart: Date;
  fertilityWindowEnd: Date;
  accuracyScore: number;
  cycleVariability: number;
}

export interface CycleData {
  start_date: string;
  end_date: string | null;
}

export const calculatePredictions = (
  cycles: CycleData[],
  lastPeriodDate: string,
  averageCycleLength: number
): CyclePrediction => {
  // Calculate cycle lengths from historical data
  const cycleLengths: number[] = [];
  
  for (let i = 0; i < cycles.length - 1; i++) {
    const currentStart = new Date(cycles[i].start_date);
    const nextStart = new Date(cycles[i + 1].start_date);
    const length = differenceInDays(nextStart, currentStart);
    if (length > 0 && length < 60) { // Valid cycle length
      cycleLengths.push(length);
    }
  }

  // Calculate average and variability
  const avgLength = cycleLengths.length > 0
    ? cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
    : averageCycleLength;

  // Calculate standard deviation for variability
  const variance = cycleLengths.length > 1
    ? cycleLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / cycleLengths.length
    : 0;
  const stdDev = Math.sqrt(variance);
  const cycleVariability = cycleLengths.length > 0 ? stdDev : 0;

  // Calculate accuracy score (0-100)
  // Lower variability = higher accuracy
  const accuracyScore = cycleLengths.length < 3
    ? 50 // Not enough data
    : Math.max(0, Math.min(100, 100 - (cycleVariability * 10)));

  // Predict next period
  const lastPeriod = new Date(lastPeriodDate);
  const predictedCycleLength = Math.round(avgLength);
  const nextPeriodDate = addDays(lastPeriod, predictedCycleLength);

  // Calculate ovulation (typically 14 days before next period)
  const nextOvulationDate = addDays(nextPeriodDate, -14);

  // Fertile window (5 days before ovulation to 1 day after)
  const fertilityWindowStart = addDays(nextOvulationDate, -5);
  const fertilityWindowEnd = addDays(nextOvulationDate, 1);

  return {
    nextPeriodDate,
    nextOvulationDate,
    fertilityWindowStart,
    fertilityWindowEnd,
    accuracyScore: Math.round(accuracyScore),
    cycleVariability: Math.round(cycleVariability * 10) / 10,
  };
};

export const getAccuracyLabel = (score: number): string => {
  if (score >= 80) return "Very High";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  return "Building...";
};

export const getAccuracyColor = (score: number): string => {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-blue-600 dark:text-blue-400";
  if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-gray-600 dark:text-gray-400";
};