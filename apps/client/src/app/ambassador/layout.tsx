import { type ReactNode } from "react";
import Link from "next/link";
import { 
  Search, 
  Bell, 
  Mail, 
  LayoutDashboard, 
  Megaphone, 
  Star, 
  BarChart2, 
  Settings, 
  HelpCircle,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

type AmbassadorLayoutProps = {
  children: ReactNode;
};

export default function AmbassadorLayout({ children }: AmbassadorLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#f8f9fa] font-sans text-slate-900">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 z-20 flex h-full w-[260px] flex-col border-r border-slate-200 bg-white">
        {/* Logo Area */}
        <div className="flex h-20 items-center px-6">
          <Link href="/ambassador/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f39c12] text-white shadow-sm">
              <span className="material-icons-outlined text-xl">hive</span>
            </div>
            <div>
              <h2 className="text-lg font-bold leading-none text-slate-900">Hive</h2>
              <p className="text-sm font-semibold leading-none text-slate-900 mt-1">Workspace</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                Creator Pro
              </p>
            </div>
          </Link>
        </div>

        {/* Action Button */}
        <div className="px-6 py-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f39c12] py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#e67e22]">
            <Plus className="h-4 w-4" />
            New Campaign
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 px-4 py-2">
          <Link
            href="/ambassador/dashboard"
            className="flex items-center gap-3 rounded-lg bg-orange-50 px-3 py-3 text-sm font-semibold text-[#f39c12]"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
            <div className="ml-auto h-5 w-1 rounded-full bg-[#f39c12]" />
          </Link>

          <Link
            href="/ambassador/campaigns"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <Megaphone className="h-5 w-5" />
            Campaigns
          </Link>

          <Link
            href="/ambassador/reputation"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <Star className="h-5 w-5" />
            Reputation
          </Link>

          <Link
            href="/ambassador/analytics"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <BarChart2 className="h-5 w-5" />
            Analytics
          </Link>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto flex flex-col gap-1 border-t border-slate-100 p-4">
          <Link
            href="/ambassador/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>

          <Link
            href="/ambassador/support"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <HelpCircle className="h-5 w-5" />
            Support
          </Link>

          {/* Quick Actions Moved from Header */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              <Bell className="h-4 w-4" />
              <div className="relative">
                <span className="absolute -right-2 -top-2 block h-2 w-2 rounded-full bg-red-500" />
              </div>
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              <Mail className="h-4 w-4" />
            </button>
          </div>
          
          <button className="mt-1 flex w-full items-center justify-center rounded-lg bg-slate-900 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-slate-800">
             Create Post
          </button>

          <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <div className="flex h-10 w-10 overflow-hidden rounded-full border border-slate-200 shadow-sm bg-white">
              {/* Fallback avatar */}
              <div className="h-full w-full bg-slate-200" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Alex Creator</p>
              <p className="text-xs font-medium text-slate-500">Pro Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="relative ml-[260px] flex min-h-screen w-[calc(100%-260px)] flex-col">
        {/* Enhanced Top Navbar */}
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-8 backdrop-blur-md">
          {/* Search Bar - Modernized */}
          <div className="flex w-full max-w-xl items-center">
            <div className="group relative flex w-full items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#f39c12]" />
              <input
                type="text"
                placeholder="Search campaigns, brands, or keywords..."
                className="h-11 w-full rounded-2xl bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none ring-1 ring-slate-200 transition-all hover:ring-slate-300 focus:bg-white focus:ring-2 focus:ring-[#f39c12]/30"
              />
            </div>
          </div>

          {/* Navigation Tabs - Modern Segmented Control */}
          <nav className="flex items-center gap-1 rounded-xl bg-slate-50/80 p-1 ring-1 ring-slate-200/60">
            <Link
              href="/ambassador/dashboard"
              className="rounded-lg bg-white px-5 py-2 text-sm font-bold text-[#f39c12] shadow-sm ring-1 ring-slate-200/50"
            >
              Overview
            </Link>
            <Link
              href="/ambassador/schedule"
              className="rounded-lg px-5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200/50 hover:text-slate-900"
            >
              Schedule
            </Link>
            <Link
              href="/ambassador/partners"
              className="rounded-lg px-5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200/50 hover:text-slate-900"
            >
              Partners
            </Link>
          </nav>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
