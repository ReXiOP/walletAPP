
'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Activity, AlertTriangle, ListChecks, PiggyBank, MoreHorizontal, CheckCircle, LineChart as LineChartIcon, PieChart as PieChartIcon, PlusCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, Line, Pie, ResponsiveContainer, Cell, TooltipProps, PieLabelRenderProps, XAxis, YAxis, LineChart as RechartsLineChart, PieChart as RechartsPieChart } from 'recharts';
import { useAppData } from '@/contexts/AppDataContext';
import type { Transaction, Budget } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { parseISO, isSameDay } from 'date-fns'; // format is now handled by context
import { CategoryIcon, getCategoryByName } from '@/components/shared/CategoryIcon';

const CHART_COLORS_PRIMARY = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

const CustomTooltip = ({ active, payload, label, formatter }: TooltipProps<number, string> & {formatter?: (value: number) => string}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const displayValue = formatter && data.value !== undefined ? formatter(data.value) : `$${data.value?.toFixed(2)}`;
    return (
      <div className="rounded-lg border bg-background p-2.5 shadow-sm">
        <div className="flex flex-col">
          <span className="text-[0.75rem] uppercase text-muted-foreground mb-1">
            {label || data.name}
          </span>
          <span className="font-bold text-lg text-foreground">
            {displayValue}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps ) => {
  if (percent === undefined || midAngle === undefined || innerRadius === undefined || outerRadius === undefined || cx === undefined || cy === undefined ) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6; 
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';

  if (percent * 100 < 7) return null; 

  return (
    <text x={x} y={y} fill="hsl(var(--card-foreground))" textAnchor={textAnchor} dominantBaseline="central" className="text-xs font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DashboardPage() {
  const { 
    transactions, budgets, totalIncome, totalExpenses, currentBalance, 
    getCategorySpentAmount, isLoaded, appCategories, formatCurrency, formatDisplayDate 
  } = useAppData();

  const expenseByCategoryData = React.useMemo(() => {
    const categoryMap: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + Math.abs(t.amount);
      }
    });
    return Object.entries(categoryMap)
      .map(([name, value], index) => ({ name, value, fill: CHART_COLORS_PRIMARY[index % CHART_COLORS_PRIMARY.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  const balanceOverTimeData = React.useMemo(() => {
    if (transactions.length === 0) return [];
    const sortedTransactions = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0;
    const dataMap = new Map<string, number>();
    
    sortedTransactions.forEach(t => {
      runningBalance += t.amount; 
      dataMap.set(formatDisplayDate(t.date).split(',')[0], runningBalance); // Show short date e.g. "MMM dd"
    });
    
    return Array.from(dataMap.entries()).map(([date, balance]) => ({ date, balance }));
  }, [transactions, formatDisplayDate]);

  const recentTransactions = React.useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const budgetHighlights = React.useMemo(() => {
    return budgets.map(budget => {
      const spent = getCategorySpentAmount(budget.category);
      const progress = budget.amount > 0 ? (Math.abs(spent) / budget.amount) * 100 : 0;
      const remaining = budget.amount - Math.abs(spent);
      const categoryDetails = getCategoryByName(appCategories, budget.category);
      return { ...budget, spent: Math.abs(spent), progress: Math.min(progress, 100), remaining, iconKey: categoryDetails?.iconKey || 'Package' };
    })
    .sort((a,b) => (a.progress > b.progress ? -1 : 1)) 
    .slice(0, 3);
  }, [budgets, getCategorySpentAmount, appCategories]);

  const netChangeToday = React.useMemo(() => {
    const today = new Date();
    return transactions
      .filter(t => isSameDay(parseISO(t.date), today))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);


  if (!isLoaded) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
        <Card className="lg:col-span-2 shadow-md">
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="h-[300px]"><Skeleton className="h-full w-full" /></CardContent>
        </Card>
         <Card className="lg:col-span-2 shadow-md">
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="h-[300px]"><Skeleton className="h-full w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Current Balance</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(currentBalance)}</div>
            <p className={`text-xs ${currentBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {currentBalance >=0 ? "Looking good!" : "Caution advised!"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Total Income</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">Overall earnings</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Total Expenses</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(Math.abs(totalExpenses))}</div>
            <p className="text-xs text-muted-foreground">Overall spending</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Net Change (Today)</CardTitle>
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${netChangeToday >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {netChangeToday >= 0 ? '+' : ''}{formatCurrency(netChangeToday)}
            </div>
            <p className="text-xs text-muted-foreground">Today's financial movement</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center"><LineChartIcon className="mr-2 h-5 w-5 text-primary"/>Balance Over Time</CardTitle>
            <CardDescription>Track your financial progress</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] md:h-[350px]">
            {balanceOverTimeData.length > 0 ? (
              <ChartContainer config={{ balance: { label: 'Balance', color: 'hsl(var(--chart-1))' } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={balanceOverTimeData} margin={{ top: 5, right: 25, left: -10, bottom: 5 }}>
                    <defs><linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/><stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/></linearGradient></defs>
                    <Line type="monotone" dataKey="balance" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ r: 3, strokeWidth:1, fill: 'hsl(var(--background))', stroke: 'hsl(var(--chart-1))' }} activeDot={{r: 5}} fillOpacity={1} fill="url(#balanceGradient)" />
                    <ChartTooltip content={<CustomTooltip formatter={formatCurrency} />} cursor={{strokeDasharray: '4 4', stroke: 'hsl(var(--muted-foreground))', strokeOpacity: 0.5}} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value} className="text-xs"/>
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => formatCurrency(value).replace(/\.00$/, '')} className="text-xs"/>
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : <p className="text-muted-foreground text-center pt-10">No transaction data for balance chart.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center"><PieChartIcon className="mr-2 h-5 w-5 text-primary"/>Top Expense Categories</CardTitle>
            <CardDescription>Where your money is going</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] md:h-[350px] flex items-center justify-center">
            {expenseByCategoryData.length > 0 ? (
              <ChartContainer config={expenseByCategoryData.reduce((acc, entry) => { acc[entry.name] = { label: entry.name, color: entry.fill }; return acc; }, {} as any)}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={expenseByCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="85%" labelLine={false} label={renderCustomizedLabel}>
                      {expenseByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke={"hsl(var(--background))"} strokeWidth={2} className="focus:outline-none hover:opacity-80 transition-opacity"/>
                      ))}
                    </Pie>
                    <ChartTooltip content={<CustomTooltip formatter={formatCurrency} />} />
                    <ChartLegend content={<ChartLegendContent nameKey="name" className="text-xs mt-2"/>} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : <p className="text-muted-foreground text-center pt-10">No expense data to display.</p>}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center"><PiggyBank className="mr-2 h-5 w-5 text-primary"/>Budget Highlights</CardTitle>
            <CardDescription>Quick view of your top budgets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetHighlights.length > 0 ? budgetHighlights.map(budget => (
              <div key={budget.id} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium flex items-center"><CategoryIcon iconKey={budget.iconKey} className="mr-2 h-4 w-4 text-muted-foreground"/>{budget.category}</span>
                  <span className={`${budget.remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <Progress value={budget.progress} className="h-2" indicatorClassName={
                    budget.progress > 90 ? 'bg-destructive' : budget.progress > 70 ? 'bg-yellow-500' : 'bg-primary'
                  } />
                 {budget.progress >= 100 && <p className="text-xs text-destructive flex items-center"><AlertTriangle className="mr-1 h-3 w-3"/>Over budget!</p>}
              </div>
            )) : <p className="text-muted-foreground text-center">No budgets set. <Link href="/budgets" className="text-primary hover:underline">Create one now!</Link></p>}
             {budgetHighlights.length > 0 && budgets.length > 3 && (
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link href="/budgets"><MoreHorizontal className="mr-2 h-4 w-4" /> View All Budgets</Link>
                </Button>
             )}
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Recent Activity</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.length > 0 ? recentTransactions.map(t => {
              const categoryDetails = getCategoryByName(appCategories, t.category);
              const iconKey = categoryDetails?.iconKey || 'Package';
              return (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <CategoryIcon iconKey={iconKey} className="mr-2 h-5 w-5 text-muted-foreground"/>
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDisplayDate(t.date)}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {t.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(t.amount))}
                  </span>
                </div>
              );
            }) : <p className="text-muted-foreground text-center">No recent transactions. <Link href="/transactions" className="text-primary hover:underline">Add one now!</Link></p>}
            {recentTransactions.length > 0 && transactions.length > 5 && (
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link href="/transactions"><MoreHorizontal className="mr-2 h-4 w-4" /> View All Transactions</Link>
                </Button>
             )}
          </CardContent>
        </Card>
      </div>
      
      {transactions.length === 0 && budgets.length === 0 && (
         <Card className="shadow-lg">
            <CardHeader className="items-center">
                 <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                <CardTitle>Welcome to BudgetZen!</CardTitle>
                <CardDescription>Start by adding a transaction or setting up a budget.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground"><Link href="/transactions"><PlusCircle className="mr-2 h-5 w-5"/>Add First Transaction</Link></Button>
              <Button asChild variant="outline"><Link href="/budgets"><PiggyBank className="mr-2 h-5 w-5"/>Set First Budget</Link></Button>
            </CardContent>
        </Card>
      )}
    </div>
    </ScrollArea>
  );
}
