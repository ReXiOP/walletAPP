
'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, Line, Pie, ResponsiveContainer, Cell, TooltipProps, PieLabelRenderProps } from 'recharts';
import { useAppData } from '@/contexts/AppDataContext';
import type { Transaction, CategoryName } from '@/types';
import { CATEGORIES } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const CHART_COLORS_PRIMARY = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const CHART_COLORS_SECONDARY = CHART_COLORS_PRIMARY.map(color => color.replace(/(\d+)%\)/, `${parseInt(RegExp.$1) - 20}%)`)); // Darker shades for contrast

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label || payload[0].name}
            </span>
            <span className="font-bold text-foreground">
              ${payload[0].value?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};


export default function DashboardPage() {
  const { transactions, totalIncome, totalExpenses, currentBalance, isLoaded } = useAppData();

  const incomeExpenseData: ChartData[] = [
    { name: 'Income', value: totalIncome, fill: 'hsl(var(--chart-1))' },
    { name: 'Expenses', value: totalExpenses, fill: 'hsl(var(--chart-2))' },
  ];

  const expenseByCategoryData = React.useMemo(() => {
    const categoryMap: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(categoryMap)
      .map(([name, value], index) => ({ name, value, fill: CHART_COLORS_PRIMARY[index % CHART_COLORS_PRIMARY.length] }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const balanceOverTimeData = React.useMemo(() => {
    if (transactions.length === 0) return [];
    const sortedTransactions = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0;
    const dataMap = new Map<string, number>();

    sortedTransactions.forEach(t => {
      runningBalance += t.amount; // amount is already signed
      dataMap.set(t.date, runningBalance);
    });
    
    return Array.from(dataMap.entries()).map(([date, balance]) => ({ date, balance }));

  }, [transactions]);


  if (!isLoaded) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
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
        <Card className="lg:col-span-2">
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="h-[300px] md:h-[350px]">
                <Skeleton className="h-full w-full" />
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="h-[300px] md:h-[350px]">
                 <Skeleton className="h-full w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: PieLabelRenderProps & {name:string, value:number}) => {
    if (percent === undefined || midAngle === undefined || innerRadius === undefined || outerRadius === undefined || cx === undefined || cy === undefined ) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? 'start' : 'end';
  
    // Show label only if percent is significant
    if (percent * 100 < 5) return null; 
  
    return (
      <text x={x} y={y} fill="white" textAnchor={textAnchor} dominantBaseline="central" className="text-xs font-medium">
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };


  return (
    <ScrollArea className="h-full">
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">Current Balance</CardTitle>
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${currentBalance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {currentBalance >=0 ? "You're in the green!" : "Mind your spending!"}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Total Income</CardTitle>
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalIncome.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Total earnings this period</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Total Expenses</CardTitle>
          <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalExpenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Total spending this period</p>
        </CardContent>
      </Card>
      
      {transactions.length > 0 && (
        <>
          <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Balance Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[350px]">
              <ChartContainer config={{
                balance: { label: 'Balance', color: 'hsl(var(--chart-1))' },
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceOverTimeData} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                     <defs>
                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Line type="monotone" dataKey="balance" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false}  fillOpacity={1} fill="url(#balanceGradient)" />
                    <ChartTooltip content={<CustomTooltip />} cursor={{strokeDasharray: '3 3', stroke: 'hsl(var(--muted-foreground))'}} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[350px] flex items-center justify-center">
              {expenseByCategoryData.length > 0 ? (
                <ChartContainer config={
                  expenseByCategoryData.reduce((acc, entry) => {
                    acc[entry.name] = { label: entry.name, color: entry.fill };
                    return acc;
                  }, {} as any)
                }>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseByCategoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {expenseByCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} className="focus:outline-none hover:opacity-80 transition-opacity"/>
                        ))}
                      </Pie>
                      <ChartTooltip content={<CustomTooltip />} />
                      <ChartLegend content={<ChartLegendContent nameKey="name" className="text-xs"/>} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-muted-foreground">No expense data to display.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
      {transactions.length === 0 && (
         <Card className="md:col-span-2 lg:col-span-3 shadow-lg">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No transactions yet. Add some to see your dashboard populate!</p>
            </CardContent>
        </Card>
      )}
    </div>
    </ScrollArea>
  );
}
