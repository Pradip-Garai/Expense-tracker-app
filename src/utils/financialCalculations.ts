// Financial calculation utilities for AI Financial Planning Agent

/**
 * Calculate future value with compound interest
 * FV = PV * (1 + r)^t
 */
export function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  years: number
): number {
  return principal * Math.pow(1 + annualRate / 100, years);
}

/**
 * Calculate future value with monthly contributions
 * FV = PV * (1 + r)^t + PMT * [((1 + r)^t - 1) / r]
 */
export function calculateFutureValueWithContributions(
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  
  // Future value of principal
  const fvPrincipal = principal * Math.pow(1 + monthlyRate, months);
  
  // Future value of monthly contributions
  const fvContributions = monthlyContribution * 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return fvPrincipal + fvContributions;
}

/**
 * Calculate asset price with inflation/appreciation
 */
export function calculateFutureAssetPrice(
  currentPrice: number,
  annualAppreciationRate: number,
  years: number
): number {
  return currentPrice * Math.pow(1 + annualAppreciationRate / 100, years);
}

/**
 * Calculate years needed to reach goal
 */
export function calculateYearsToGoal(
  currentSavings: number,
  monthlyContribution: number,
  annualRate: number,
  targetAmount: number
): number {
  if (monthlyContribution <= 0) {
    // No contributions, only compound interest
    if (annualRate <= 0 || currentSavings >= targetAmount) {
      return 0;
    }
    return Math.log(targetAmount / currentSavings) / Math.log(1 + annualRate / 100);
  }
  
  const monthlyRate = annualRate / 100 / 12;
  
  // Using formula: months = log((FV * r / PMT) + 1) / log(1 + r) - log((PV * r / PMT) + 1) / log(1 + r)
  const numerator = Math.log((targetAmount * monthlyRate / monthlyContribution) + 1);
  const denominator = Math.log(1 + monthlyRate);
  const pvTerm = Math.log((currentSavings * monthlyRate / monthlyContribution) + 1);
  
  const months = (numerator - pvTerm) / denominator;
  return months / 12;
}

/**
 * Calculate required monthly savings to reach goal
 */
export function calculateRequiredMonthlySavings(
  currentSavings: number,
  targetAmount: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  
  // FV of current savings
  const fvCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, months);
  
  // Remaining amount needed from contributions
  const remainingAmount = targetAmount - fvCurrentSavings;
  
  if (remainingAmount <= 0) {
    return 0;
  }
  
  // Calculate required monthly payment
  const requiredMonthly = remainingAmount / 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return Math.max(0, requiredMonthly);
}

/**
 * Determine goal status based on projected vs target
 */
export function determineGoalStatus(
  projectedAmount: number,
  targetAmount: number
): 'achievable' | 'partially' | 'not-achievable' {
  const percentage = (projectedAmount / targetAmount) * 100;
  
  if (percentage >= 100) {
    return 'achievable';
  } else if (percentage >= 60) {
    return 'partially';
  } else {
    return 'not-achievable';
  }
}

/**
 * Calculate goal completion percentage
 */
export function calculateGoalPercentage(
  projectedAmount: number,
  targetAmount: number
): number {
  return Math.min(100, (projectedAmount / targetAmount) * 100);
}

/**
 * Calculate shortfall or surplus
 */
export function calculateShortfall(
  projectedAmount: number,
  targetAmount: number
): number {
  return targetAmount - projectedAmount;
}

/**
 * Generate recommendations based on goal analysis
 */
export interface GoalAnalysis {
  currentSavings: number;
  monthlyContribution: number;
  annualRate: number;
  targetAmount: number;
  years: number;
  projectedAmount: number;
  status: 'achievable' | 'partially' | 'not-achievable';
  percentage: number;
  shortfall: number;
}

export interface Recommendation {
  type: 'increase-savings' | 'extend-timeline' | 'improve-returns' | 'reduce-target';
  title: string;
  description: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
  actionValue?: number;
}

export function generateRecommendations(analysis: GoalAnalysis): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  if (analysis.status === 'achievable') {
    recommendations.push({
      type: 'increase-savings',
      title: '🎉 Great Progress!',
      description: 'You\'re on track to achieve your goal! Consider increasing your monthly savings to reach it even faster.',
      impact: 'Achieve goal earlier than planned',
      priority: 'low',
    });
    return recommendations;
  }
  
  // Calculate required monthly savings
  const requiredMonthly = calculateRequiredMonthlySavings(
    analysis.currentSavings,
    analysis.targetAmount,
    analysis.annualRate,
    analysis.years
  );
  
  const additionalSavings = requiredMonthly - analysis.monthlyContribution;
  
  if (additionalSavings > 0 && additionalSavings < analysis.monthlyContribution * 2) {
    recommendations.push({
      type: 'increase-savings',
      title: 'Increase Monthly Savings',
      description: `Increase your monthly contribution by ₹${Math.round(additionalSavings).toLocaleString('en-IN')} to reach your goal on time.`,
      impact: `Total monthly savings: ₹${Math.round(requiredMonthly).toLocaleString('en-IN')}`,
      priority: 'high',
      actionValue: Math.round(additionalSavings),
    });
  }
  
  // Calculate years needed with current savings rate
  const yearsNeeded = calculateYearsToGoal(
    analysis.currentSavings,
    analysis.monthlyContribution,
    analysis.annualRate,
    analysis.targetAmount
  );
  
  if (yearsNeeded > analysis.years && yearsNeeded < analysis.years * 2) {
    const additionalYears = Math.ceil(yearsNeeded - analysis.years);
    recommendations.push({
      type: 'extend-timeline',
      title: 'Extend Goal Timeline',
      description: `Extend your timeline by ${additionalYears} year${additionalYears > 1 ? 's' : ''} to achieve your goal with current savings.`,
      impact: `New target date: ${additionalYears} year${additionalYears > 1 ? 's' : ''} later`,
      priority: 'medium',
      actionValue: additionalYears,
    });
  }
  
  // Suggest improving returns
  const improvedRate = analysis.annualRate + 2; // Suggest 2% higher returns
  const projectedWithBetterReturns = calculateFutureValueWithContributions(
    analysis.currentSavings,
    analysis.monthlyContribution,
    improvedRate,
    analysis.years
  );
  
  if (projectedWithBetterReturns > analysis.projectedAmount * 1.1) {
    recommendations.push({
      type: 'improve-returns',
      title: 'Improve Investment Returns',
      description: `Consider diversifying into higher-return investments like mutual funds or SIPs to earn ${improvedRate}% annual returns.`,
      impact: `Projected savings: ₹${Math.round(projectedWithBetterReturns).toLocaleString('en-IN')}`,
      priority: 'medium',
      actionValue: improvedRate,
    });
  }
  
  // Suggest reducing target if shortfall is significant
  if (analysis.shortfall > analysis.targetAmount * 0.4) {
    const affordableTarget = analysis.projectedAmount;
    recommendations.push({
      type: 'reduce-target',
      title: 'Consider Alternative Options',
      description: 'Your current goal may be ambitious. Consider starting with a more affordable option or a smaller asset.',
      impact: `Affordable target: ₹${Math.round(affordableTarget).toLocaleString('en-IN')}`,
      priority: 'low',
      actionValue: Math.round(affordableTarget),
    });
  }
  
  return recommendations;
}
