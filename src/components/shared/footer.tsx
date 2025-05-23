'use client';

import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/5 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo and description */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">N</span>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Nox</p>
              <p className="text-xs text-muted-foreground">Modern SaaS platform</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Nox. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 