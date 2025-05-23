'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, BookOpen, Video, FileText } from 'lucide-react';

export default function HowToUsePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-background to-background/80 p-6 border border-border shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-primary">Documentation</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">
            How to Use Nox
          </h1>
          <p className="text-muted-foreground text-sm">
            Learn how to use the platform effectively with our comprehensive guides and tutorials.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden rounded-2xl border-white/5 bg-background/30 backdrop-blur-xl shadow-sm">
          <CardHeader className="border-b border-white/5">
            <div className="flex items-center gap-2 p-2">
              <BookOpen className="h-4 w-4 text-primary/80 mr-2" />
              <div>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Learn the basics of using Nox
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Account Setup</h3>
                  <p className="text-sm text-muted-foreground">Complete your profile and preferences</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Dashboard Overview</h3>
                  <p className="text-sm text-muted-foreground">Navigate and understand the interface</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-medium">First Project</h3>
                  <p className="text-sm text-muted-foreground">Create and manage your first project</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-white/5 bg-background/30 backdrop-blur-xl shadow-sm">
          <CardHeader className="border-b border-white/5">
            <div className="flex items-center gap-2 p-2">
              <Video className="h-4 w-4 text-primary/80 mr-2" />
              <div>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>
                  Learn through visual demonstrations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              <li className="p-3 rounded-lg bg-white/5 border border-white/5">
                <h3 className="font-medium mb-1">Platform Introduction</h3>
                <p className="text-sm text-muted-foreground mb-2">Overview of key features and benefits</p>
                <div className="aspect-video w-full">
                  <iframe 
                    className="w-full h-full rounded-md"
                    src="https://www.youtube.com/embed/A3xxG5zHuCA" 
                    title="Platform Introduction" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 