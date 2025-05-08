'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, Code, UserCircle, Github, Linkedin, Globe, Heart, Brain, Coffee } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const features = [
    { text: "Intuitive Transaction Tracking (Income & Expenses)", icon: <Zap className="h-5 w-5 text-accent" /> },
    { text: "Comprehensive Budget Management", icon: <CheckCircle className="h-5 w-5 text-primary" /> },
    { text: "Insightful Data Visualization Dashboard", icon: <Zap className="h-5 w-5 text-accent" /> },
    { text: "Flexible Data Import/Export (JSON)", icon: <CheckCircle className="h-5 w-5 text-primary" /> },
    { text: "Customizable Themes & Color Palettes", icon: <Zap className="h-5 w-5 text-accent" /> },
    { text: "Responsive Design for All Devices", icon: <CheckCircle className="h-5 w-5 text-primary" /> },
  ];

  const techStack = [
    { name: "Next.js (App Router)", icon: <Code className="h-5 w-5 text-muted-foreground" />, category: "Framework" },
    { name: "React & TypeScript", icon: <Code className="h-5 w-5 text-muted-foreground" />, category: "Core" },
    { name: "Tailwind CSS", icon: <Code className="h-5 w-5 text-muted-foreground" />, category: "Styling" },
    { name: "ShadCN UI Components", icon: <Code className="h-5 w-5 text-muted-foreground" />, category: "UI Library" },
    { name: "Lucide Icons", icon: <Code className="h-5 w-5 text-muted-foreground" />, category: "Icons" },
    { name: "Recharts", icon: <Code className="h-5 w-5 text-muted-foreground" />, category: "Charting" },
    { name: "Genkit (for AI features)", icon: <Code className="h-5 w-5 text-muted-foreground" />, category: "AI" },
    { name: "LocalStorage API", icon: <Code className="h-5 w-5 text-muted-foreground" />, category: "Storage" },
  ];

  return (
    <div className="space-y-10 max-w-4xl mx-auto p-2 sm:p-4">
      <header className="text-center py-8 rounded-xl bg-gradient-to-br from-primary/10 via-background to-accent/10 shadow-inner border border-border">
        <div className="inline-flex items-center gap-3 mb-4">
           <svg width="60" height="60" viewBox="0 0 100 100" className="text-primary drop-shadow-lg">
            <rect width="100" height="100" rx="20" fill="currentColor"/>
            <circle cx="35" cy="35" r="15" fill="hsl(var(--primary-foreground))"/>
            <line x1="35" y1="50" x2="35" y2="75" stroke="hsl(var(--primary-foreground))" strokeWidth="10" strokeLinecap="round"/>
            <line x1="65" y1="25" x2="65" y2="75" stroke="hsl(var(--primary-foreground))" strokeWidth="10" strokeLinecap="round"/>
            <line x1="50" y1="65" x2="80" y2="65" stroke="hsl(var(--primary-foreground))" strokeWidth="10" strokeLinecap="round"/>
          </svg>
          <h1 className="text-5xl font-extrabold text-primary tracking-tight">S-Wallet</h1>
        </div>
        <p className="text-2xl text-muted-foreground font-light">
          Effortless finance management, beautifully designed.
        </p>
         <p className="text-sm text-muted-foreground mt-2">Version: 1.0.0</p>
      </header>

      <Card className="shadow-xl border-primary/20 overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-2xl flex items-center text-primary">
            <Zap className="mr-3 h-7 w-7 text-accent" /> What is S-Wallet?
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4 text-lg">
          <p className="text-foreground leading-relaxed">
            <strong>S-Wallet</strong> is a powerful personal budgeting and expense tracking tool built to empower users to take full control of their finances.
            Whether you're managing daily spending or planning monthly budgets, S-Wallet provides a clean, intuitive interface with smart visualizations and real-time feedback.
          </p>
          <p className="text-foreground leading-relaxed">
            Developed with modern technologies, it brings together performance, accessibility, and elegant design in one seamless application.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-accent/20">
        <CardHeader className="bg-accent/5 border-b border-accent/10">
          <CardTitle className="text-2xl flex items-center text-accent">
            <CheckCircle className="mr-3 h-7 w-7" /> Key Features
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start text-foreground text-md">
                <span className="mr-3 mt-1 flex-shrink-0">{feature.icon}</span>
                {feature.text}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center text-primary">
            <Code className="mr-3 h-7 w-7" /> Technology Stack
          </CardTitle>
          <CardDescription>The technologies powering the S-Wallet experience.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((tech) => (
              <div key={tech.name} className="p-4 rounded-lg border bg-card hover:border-primary/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-1">
                  {tech.icon}
                  <h4 className="font-semibold text-md text-foreground">{tech.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground ml-8">{tech.category}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-primary/20 overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-2xl flex items-center text-primary">
            <UserCircle className="mr-3 h-7 w-7 text-accent" /> Meet the Developer
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex-shrink-0">
            <Image
              src="https://sajid09.netlify.app/images/profile.png"
              alt="Muhammad Sajid"
              width={150}
              height={150}
              className="rounded-full border-4 border-accent shadow-lg"
            />
          </div>
          <div className="space-y-3 text-center md:text-left">
            <h3 className="text-3xl font-bold text-foreground">Muhammad Sajid</h3>
            <p className="text-lg text-accent font-semibold">Full-Stack Developer | UI/UX Specialist | AI Innovator</p>
            <p className="text-md text-muted-foreground leading-relaxed">
              Sajid is passionate about building scalable, user-focused applications.
              He brings together performance, security, and aesthetics—making digital products both powerful and beautiful.
            </p>
            <div className="flex justify-center md:justify-start space-x-3 pt-2">
              <Button variant="outline" size="icon" asChild>
                <a href="https://github.com/ReXiOP" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://linkedin.com/in/sajid09" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://sajid09.netlify.app" target="_blank" rel="noopener noreferrer">
                  <Globe className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 p-4 border-t text-sm text-muted-foreground flex items-center justify-center gap-x-4">
          <div className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-destructive" /><span>Crafted with Passion</span></div>
          <div className="flex items-center gap-1.5"><Brain className="h-4 w-4 text-primary" /><span>Driven by Innovation</span></div>
          <div className="flex items-center gap-1.5"><Coffee className="h-4 w-4 text-amber-600" /><span>Fueled by Coffee</span></div>
        </CardFooter>
      </Card>

      <footer className="text-center text-muted-foreground py-8 mt-10 border-t">
        <p>&copy; {new Date().getFullYear()} S-Wallet by Muhammad Sajid. All rights reserved.</p>
        <p className="text-xs">Dedicated to better financial well-being for everyone.</p>
      </footer>
    </div>
  );
}
