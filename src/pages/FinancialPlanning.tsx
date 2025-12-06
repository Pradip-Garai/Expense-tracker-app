import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Target, AlertCircle, CheckCircle, AlertTriangle, Lightbulb, Calendar, DollarSign, PiggyBank } from 'lucide-react';
import { toast } from 'sonner';
import { fdDepositApi } from '@/db/api';
import {
  calculateFutureValueWithContributions,
  calculateFutureAssetPrice,
  determineGoalStatus,
  calculateGoalPercentage,
  calculateShortfall,
  generateRecommendations,
  type GoalAnalysis,
  type Recommendation,
} from '@/utils/financialCalculations';
import {
  getAssetTypes,
  getAvailableCities,
  getAssetPriceEstimate,
  getAppreciationRate,
  formatLargeNumber,
} from '@/utils/marketData';

export default function FinancialPlanning() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Form state
  const [assetType, setAssetType] = useState<'car' | 'flat' | 'house' | 'land'>('car');
  const [location, setLocation] = useState('Mumbai');
  const [targetYears, setTargetYears] = useState(5);
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [monthlyContribution, setMonthlyContribution] = useState(10000);
  
  // Data state
  const [fdBalance, setFdBalance] = useState(0);
  const [fdRate, setFdRate] = useState(7);
  
  // Analysis state
  const [analysis, setAnalysis] = useState<GoalAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  const assetTypes = getAssetTypes();
  const cities = getAvailableCities();
  
  useEffect(() => {
    if (user) {
      loadFDData();
    }
  }, [user]);
  
  const loadFDData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const deposits = await fdDepositApi.getDeposits(user.id);
      const totalBalance = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
      setFdBalance(totalBalance);
    } catch (error) {
      console.error('Error loading FD data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnalyze = async () => {
    if (!user) return;
    
    try {
      setAnalyzing(true);
      
      // Get market price estimate
      const priceEstimate = getAssetPriceEstimate(assetType, location);
      const currentPrice = customPrice || priceEstimate.avg;
      
      // Get appreciation rate
      const appreciationRate = getAppreciationRate(assetType, location);
      
      // Calculate future asset price
      const futureAssetPrice = calculateFutureAssetPrice(
        currentPrice,
        appreciationRate,
        targetYears
      );
      
      // Calculate projected savings
      const projectedSavings = calculateFutureValueWithContributions(
        fdBalance,
        monthlyContribution,
        fdRate,
        targetYears
      );
      
      // Determine status
      const status = determineGoalStatus(projectedSavings, futureAssetPrice);
      const percentage = calculateGoalPercentage(projectedSavings, futureAssetPrice);
      const shortfall = calculateShortfall(projectedSavings, futureAssetPrice);
      
      // Create analysis
      const goalAnalysis: GoalAnalysis = {
        currentSavings: fdBalance,
        monthlyContribution,
        annualRate: fdRate,
        targetAmount: futureAssetPrice,
        years: targetYears,
        projectedAmount: projectedSavings,
        status,
        percentage,
        shortfall,
      };
      
      setAnalysis(goalAnalysis);
      
      // Generate recommendations
      const recs = generateRecommendations(goalAnalysis);
      setRecommendations(recs);
      
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing goal:', error);
      toast.error('Failed to analyze goal');
    } finally {
      setAnalyzing(false);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achievable':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'partially':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'not-achievable':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'achievable':
        return 'Achievable ✅';
      case 'partially':
        return 'Partially Achievable ⚠️';
      case 'not-achievable':
        return 'Not Achievable ❌';
      default:
        return '';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achievable':
        return 'bg-green-500';
      case 'partially':
        return 'bg-yellow-500';
      case 'not-achievable':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    };
    return variants[priority] || 'default';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 xl:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">AI Financial Planning</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Analyze your financial goals with intelligent insights and recommendations
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This tool provides financial guidance based on estimates and assumptions. It is not professional financial advice. 
            Actual results may vary based on market conditions and individual circumstances.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goal Configuration
              </CardTitle>
              <CardDescription>
                Define your financial goal and investment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Asset Type */}
              <div className="space-y-2">
                <Label>Asset Type</Label>
                <Select value={assetType} onValueChange={(value: any) => setAssetType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Target Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <Label>Target Timeline (Years)</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={targetYears}
                  onChange={(e) => setTargetYears(Number(e.target.value))}
                />
              </div>

              {/* Custom Price */}
              <div className="space-y-2">
                <Label>Custom Target Price (Optional)</Label>
                <Input
                  type="number"
                  placeholder="Leave empty for market estimate"
                  value={customPrice || ''}
                  onChange={(e) => setCustomPrice(e.target.value ? Number(e.target.value) : null)}
                />
              </div>

              {/* Monthly Contribution */}
              <div className="space-y-2">
                <Label>Monthly Savings Contribution (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                />
              </div>

              {/* FD Balance */}
              <div className="space-y-2">
                <Label>Current FD Balance</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full bg-muted" />
                ) : (
                  <Input
                    type="number"
                    value={fdBalance}
                    onChange={(e) => setFdBalance(Number(e.target.value))}
                  />
                )}
              </div>

              {/* FD Rate */}
              <div className="space-y-2">
                <Label>Expected Annual Return (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={fdRate}
                  onChange={(e) => setFdRate(Number(e.target.value))}
                />
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={analyzing}
                className="w-full"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Goal'}
              </Button>
            </CardContent>
          </Card>

          {/* Market Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Information
              </CardTitle>
              <CardDescription>
                Current market estimates for {location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const priceEstimate = getAssetPriceEstimate(assetType, location);
                const appreciationRate = getAppreciationRate(assetType, location);
                const selectedAsset = assetTypes.find(a => a.value === assetType);
                
                return (
                  <>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Asset Type</p>
                        <p className="text-lg font-semibold">
                          {selectedAsset?.icon} {selectedAsset?.label}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Price Range</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-muted rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Min</p>
                          <p className="text-sm font-semibold">{formatLargeNumber(priceEstimate.min)}</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Average</p>
                          <p className="text-sm font-semibold">{formatLargeNumber(priceEstimate.avg)}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Max</p>
                          <p className="text-sm font-semibold">{formatLargeNumber(priceEstimate.max)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Annual Appreciation Rate</p>
                        <p className={`text-lg font-semibold ${appreciationRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {appreciationRate >= 0 ? '+' : ''}{appreciationRate}%
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {appreciationRate >= 0 
                          ? 'Expected to appreciate over time' 
                          : 'Expected to depreciate over time'}
                      </p>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        These are estimated market values and may vary based on specific location, 
                        property features, and market conditions.
                      </AlertDescription>
                    </Alert>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Dream Progress Summary */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(analysis.status)}
                  Dream Progress Summary
                </CardTitle>
                <CardDescription>
                  Your financial goal analysis for {assetTypes.find(a => a.value === assetType)?.label} in {location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-center">
                  <Badge variant={analysis.status === 'achievable' ? 'default' : 'secondary'} className="text-lg px-6 py-2">
                    {getStatusText(analysis.status)}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Goal Completion</p>
                    <p className="text-sm font-semibold">{analysis.percentage.toFixed(1)}%</p>
                  </div>
                  <Progress value={analysis.percentage} className="h-3" />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <PiggyBank className="h-4 w-4 text-primary" />
                      <p className="text-xs text-muted-foreground">Projected Savings</p>
                    </div>
                    <p className="text-xl font-bold">{formatLargeNumber(analysis.projectedAmount)}</p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-primary" />
                      <p className="text-xs text-muted-foreground">Target Amount</p>
                    </div>
                    <p className="text-xl font-bold">{formatLargeNumber(analysis.targetAmount)}</p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <p className="text-xs text-muted-foreground">
                        {analysis.shortfall > 0 ? 'Shortfall' : 'Surplus'}
                      </p>
                    </div>
                    <p className={`text-xl font-bold ${analysis.shortfall > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {formatLargeNumber(Math.abs(analysis.shortfall))}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Timeline</p>
                  </div>
                  <p className="text-lg">
                    {targetYears} year{targetYears > 1 ? 's' : ''} from now
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Target date: {new Date(new Date().setFullYear(new Date().getFullYear() + targetYears)).getFullYear()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Smart Recommendations
                  </CardTitle>
                  <CardDescription>
                    Actionable steps to achieve your financial goal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge variant={getPriorityBadge(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-medium">Impact:</span>
                        <span className="text-muted-foreground">{rec.impact}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Motivational Message */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Keep Going! 💪</h3>
                    <p className="text-muted-foreground">
                      {analysis.status === 'achievable' 
                        ? "You're on the right track! Stay consistent with your savings, and you'll achieve your dream. Consider increasing your contributions to reach your goal even faster."
                        : analysis.status === 'partially'
                        ? "You're making good progress! With a few adjustments to your savings plan or timeline, you can definitely achieve this goal. Stay focused and keep saving!"
                        : "Don't be discouraged! Every financial goal is achievable with the right strategy. Consider the recommendations above, adjust your plan, and remember that small consistent steps lead to big results."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
