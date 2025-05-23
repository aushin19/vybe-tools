'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NotificationCenter from '@/components/notifications/notification-center';
import { 
  LayoutDashboard, 
  CreditCard, 
  Menu, 
  X,
  User,
  ChevronRight,
  LogOut,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background/90 to-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-32 bg-primary/20 rounded-full"></div>
          <div className="h-4 w-48 bg-primary/10 rounded-full"></div>
        </div>
      </div>
    );
  }

  const userInitials = user?.user_metadata?.full_name 
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  // Navigation items
  const navItems = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      href: '/dashboard/account', 
      label: 'Account', 
      icon: <User className="h-5 w-5" /> 
    },
    { 
      href: '/dashboard/billing', 
      label: 'Billing', 
      icon: <CreditCard className="h-5 w-5" /> 
    },
  ];

  // Help and support items
  const helpItems = [
    {
      href: '/dashboard/how-to-use',
      label: 'How to Use?',
      icon: <HelpCircle className="h-5 w-5" />
    },
    {
      href: '/dashboard/support',
      label: 'Support',
      icon: <MessageSquare className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/90 to-background">
      {/* Header with futuristic glass effect */}
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground/80 hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="font-bold text-primary-foreground text-sm">N</span>
              </div>
              <span className="text-xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 hidden md:inline-block">
                Nox
              </span>
            </Link>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-4">
            <NotificationCenter />
            
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                    <AvatarImage src={user?.user_metadata?.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background/80 backdrop-blur-xl border border-white/10" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer">
                  <Link href="/dashboard/billing">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscription & billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="text-red-500 focus:text-red-500 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar - desktop with glass effect */}
        <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-background/50 backdrop-blur-xl">
          <div className="flex flex-col gap-2 p-4 h-full">
            <div className="py-4 px-2">
              <p className="text-xs uppercase text-foreground/40 font-medium tracking-wider pl-3 mb-4">
                Navigation
              </p>
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "justify-start h-11 px-3 mb-1.5 w-full relative group transition-all duration-300",
                    pathname === item.href 
                      ? "bg-gradient-to-r from-primary/10 to-emerald-600/10 text-primary hover:bg-primary/20 font-medium border-l-2 border-primary"
                      : "hover:bg-white/5 text-foreground/70 hover:text-foreground"
                  )}
                >
                  <Link href={item.href} className="flex items-center w-full">
                    <span className={cn(
                      "p-1.5 rounded-lg mr-3 transition-all duration-300",
                      pathname === item.href 
                        ? "bg-primary/10 text-primary" 
                        : "bg-transparent text-foreground/70 group-hover:text-foreground group-hover:bg-white/5"
                    )}>
                      {item.icon}
                    </span>
                    {item.label}
                    <ChevronRight className={cn(
                      "ml-auto h-4 w-4 transition-transform duration-300",
                      pathname === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-70 -translate-x-2 group-hover:translate-x-0"
                    )} />
                  </Link>
                </Button>
              ))}

              <p className="text-xs uppercase text-foreground/40 font-medium tracking-wider pl-3 mb-4 mt-8">
                Help & Support
              </p>
              {helpItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "justify-start h-11 px-3 mb-1.5 w-full relative group transition-all duration-300",
                    pathname === item.href 
                      ? "bg-gradient-to-r from-primary/10 to-emerald-600/10 text-primary hover:bg-primary/20 font-medium border-l-2 border-primary"
                      : "hover:bg-white/5 text-foreground/70 hover:text-foreground"
                  )}
                >
                  <Link href={item.href} className="flex items-center w-full">
                    <span className={cn(
                      "p-1.5 rounded-lg mr-3 transition-all duration-300",
                      pathname === item.href 
                        ? "bg-primary/10 text-primary" 
                        : "bg-transparent text-foreground/70 group-hover:text-foreground group-hover:bg-white/5"
                    )}>
                      {item.icon}
                    </span>
                    {item.label}
                    <ChevronRight className={cn(
                      "ml-auto h-4 w-4 transition-transform duration-300",
                      pathname === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-70 -translate-x-2 group-hover:translate-x-0"
                    )} />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile sidebar with glass effect */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background/90 backdrop-blur-xl border-r border-white/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="font-bold text-primary-foreground text-sm">N</span>
                  </div>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Nox</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex flex-col space-y-1 mt-6">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    onClick={() => setMobileMenuOpen(false)}
                    asChild
                    className={cn(
                      "justify-start h-11 relative group transition-all duration-300",
                      pathname === item.href 
                        ? "bg-gradient-to-r from-primary/10 to-emerald-600/10 text-primary hover:bg-primary/20 font-medium border-l-2 border-primary"
                        : "hover:bg-white/5 text-foreground/70 hover:text-foreground"
                    )}
                  >
                    <Link href={item.href} className="flex items-center">
                      <span className={cn(
                        "p-1.5 rounded-md mr-3 transition-all duration-300",
                        pathname === item.href 
                          ? "bg-primary/10 text-primary" 
                          : "bg-transparent text-foreground/70 group-hover:text-foreground group-hover:bg-white/5"
                      )}>
                        {item.icon}
                      </span>
                      {item.label}
                      <ChevronRight className={cn(
                        "ml-auto h-4 w-4 transition-transform duration-300",
                        pathname === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                      )} />
                    </Link>
                  </Button>
                ))}

                <p className="text-xs uppercase text-foreground/40 font-medium tracking-wider pl-3 mt-6 mb-2">
                  Help & Support
                </p>
                {helpItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    onClick={() => setMobileMenuOpen(false)}
                    asChild
                    className={cn(
                      "justify-start h-11 relative group transition-all duration-300",
                      pathname === item.href 
                        ? "bg-gradient-to-r from-primary/10 to-emerald-600/10 text-primary hover:bg-primary/20 font-medium border-l-2 border-primary"
                        : "hover:bg-white/5 text-foreground/70 hover:text-foreground"
                    )}
                  >
                    <Link href={item.href} className="flex items-center">
                      <span className={cn(
                        "p-1.5 rounded-md mr-3 transition-all duration-300",
                        pathname === item.href 
                          ? "bg-primary/10 text-primary" 
                          : "bg-transparent text-foreground/70 group-hover:text-foreground group-hover:bg-white/5"
                      )}>
                        {item.icon}
                      </span>
                      {item.label}
                      <ChevronRight className={cn(
                        "ml-auto h-4 w-4 transition-transform duration-300",
                        pathname === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                      )} />
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-7xl mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 