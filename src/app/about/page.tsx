
'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, Code } from 'lucide-react';

export default function AboutPage() {
  const features = [
    "Intuitive Transaction Tracking (Income & Expenses)",
    "Comprehensive Budget Management",
    "Insightful Data Visualization Dashboard",
    "Flexible Data Import/Export (JSON)",
    "Customizable Themes (Light, Dark, System)",
    "Responsive Design for All Devices",
  ];

  const techStack = [
    "Next.js (App Router)",
    "React & TypeScript",
    "Tailwind CSS",
    "ShadCN UI Components",
    "Lucide Icons",
    "Recharts for charts",
    "Genkit (for upcoming AI features)",
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">S-Wallet</h1>
        <p className="text-xl text-muted-foreground">Effortless finance management at your fingertips.</p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-6 w-6 text-accent" /> About S-Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">
            S-Wallet is a modern, user-friendly application designed to help you take control of your personal finances. 
            Whether you're looking to track your daily spending, set monthly budgets, or understand your financial habits better, 
            S-Wallet provides the tools you need in a clean and intuitive interface.
          </p>
          <p className="text-foreground">
            Our goal is to make financial management accessible and stress-free, empowering you to achieve your financial goals.
          </p>
          <p className="text-sm text-muted-foreground">Version: 1.0.0</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-6 w-6 text-primary" /> Key Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-foreground">
                <CheckCircle className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="mr-2 h-6 w-6 text-secondary-foreground" /> Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {techStack.map((tech, index) => (
              <li key={index} className="flex items-center text-foreground">
                <Code className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                {tech}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <footer className="text-center text-muted-foreground py-6">
        <p>&copy; {new Date().getFullYear()} S-Wallet. All rights reserved.</p>
        <p>Crafted with ❤️ for better financial well-being.</p>
      </footer>
    </div>
  );
}
