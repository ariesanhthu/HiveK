import { 
  Rocket, 
  MessageSquare, 
  CheckSquare, 
  Award, 
  ChevronRight,
  MoreVertical,
  Clock,
  Calendar,
  Star
} from "lucide-react";
import Image from "next/image";

export default function AmbassadorDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-8">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Campaigns */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#f39c12]">
              <Rocket className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-600">
              +12%
            </span>
          </div>
          <div className="mt-6">
             <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Campaigns</p>
             <h3 className="mt-1 text-3xl font-black text-slate-900">14</h3>
          </div>
        </div>

        {/* Pending Invitations */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f39c12]">
              Urgent
            </span>
          </div>
          <div className="mt-6">
             <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Invitations</p>
             <h3 className="mt-1 text-3xl font-black text-slate-900">08</h3>
          </div>
        </div>

        {/* KPI Submissions */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
              <CheckSquare className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Due Today
            </span>
          </div>
          <div className="mt-6">
             <p className="text-xs font-bold uppercase tracking-wider text-slate-500">KPI Submissions</p>
             <h3 className="mt-1 text-3xl font-black text-slate-900">23</h3>
          </div>
        </div>

        {/* Reputation Score */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="absolute -bottom-6 -right-6 text-slate-100">
            <Star className="h-32 w-32 fill-slate-100 text-slate-100" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
              <Award className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600">
              Top 1%
            </span>
          </div>
          <div className="relative z-10 mt-6">
             <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Reputation Score</p>
             <h3 className="mt-1 text-3xl font-black text-purple-600">984</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content Area (Left 2 Col) */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* Active Campaigns */}
          <section className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-100">
            <div className="mb-6 flex items-center justify-between">
               <h2 className="text-lg font-extrabold text-slate-900">Active Campaigns</h2>
               <button className="text-sm font-bold text-[#f39c12] hover:text-[#e67e22]">
                 View All
               </button>
            </div>
            <div className="space-y-6">
              {/* Campaign 1 */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                 <div className="flex items-center gap-4">
                   <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-red-50 p-2">
                     {/* Mock image container */}
                     <div className="flex h-full w-full items-center justify-center rounded-lg bg-red-100 text-red-500 text-xs font-bold">N</div>
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-slate-900">Nike Summer Run '24</h4>
                     <p className="text-xs font-medium text-slate-500">Instagram Reel & Carousel</p>
                   </div>
                 </div>
                 
                 <div className="w-full sm:w-1/3">
                   <div className="mb-2 flex items-center justify-between text-xs font-bold">
                     <span className="text-slate-500">Progress</span>
                     <span className="text-[#f39c12]">75%</span>
                   </div>
                   <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                     <div className="h-full bg-[#f39c12]" style={{ width: "75%" }} />
                   </div>
                 </div>

                 <div className="text-right">
                   <p className="text-lg font-black text-slate-900">$1,200</p>
                   <p className="text-[10px] font-bold text-slate-400">Due in 3d</p>
                 </div>
              </div>

              <hr className="border-slate-100" />

              {/* Campaign 2 */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                 <div className="flex items-center gap-4">
                   <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 p-2">
                     <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-200 text-slate-500 text-xs font-bold">L</div>
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-slate-900">Lumina Watch Series</h4>
                     <p className="text-xs font-medium text-slate-500">YouTube Tech Review</p>
                   </div>
                 </div>
                 
                 <div className="w-full sm:w-1/3">
                   <div className="mb-2 flex items-center justify-between text-xs font-bold">
                     <span className="text-slate-500">Progress</span>
                     <span className="text-[#f39c12]">30%</span>
                   </div>
                   <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                     <div className="h-full bg-[#f39c12]" style={{ width: "30%" }} />
                   </div>
                 </div>

                 <div className="text-right">
                   <p className="text-lg font-black text-slate-900">$4,500</p>
                   <p className="text-[10px] font-bold text-slate-400">Due in 12d</p>
                 </div>
              </div>
            </div>
          </section>

          {/* Upcoming Deadlines */}
          <section className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-100">
            <div className="mb-6">
               <h2 className="text-lg font-extrabold text-slate-900">Upcoming Deadlines</h2>
            </div>
            
            <div className="space-y-4">
              {/* Task 1 */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-shadow hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-slate-200 bg-white" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Submit draft for 'Eco-Friendly' Campaign</p>
                    <p className="text-xs font-medium text-red-500">Overdue - 2 hours ago</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-900">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Task 2 */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-shadow hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-slate-200 bg-white" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Post TikTok Live Stream Link</p>
                    <p className="text-xs font-medium text-slate-500">Tomorrow at 10:00 AM</p>
                  </div>
                </div>
                <Clock className="h-5 w-5 text-slate-400" />
              </div>

              {/* Task 3 */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-shadow hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-slate-200 bg-white" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Monthly Analytics Report Export</p>
                    <p className="text-xs font-medium text-slate-500">June 30th, 2024</p>
                  </div>
                </div>
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Column (Right 1 Col) */}
        <div className="space-y-8">
          
          {/* Profile Strength */}
          <div className="rounded-2xl bg-gradient-to-br from-[#f39c12] to-[#e67e22] p-8 text-white shadow-sm">
             <div className="mb-2 flex items-center justify-between">
               <h3 className="font-bold">Profile Strength</h3>
               <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">Level 4</span>
             </div>
             
             <div className="mt-6 flex items-end gap-3 border-b border-white/20 pb-6">
                <span className="text-5xl font-black leading-none">82%</span>
                <span className="pb-1 text-sm font-semibold opacity-90">Almost a Pro!</span>
             </div>

             <div className="mt-6">
                <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                   <div className="h-full bg-white" style={{ width: "82%" }} />
                </div>
                
                <button className="mt-8 w-full rounded-xl bg-white py-3 text-sm font-bold text-[#f39c12] shadow-sm hover:bg-slate-50">
                  Complete Profile
                </button>
             </div>
          </div>

          {/* New Invitations */}
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
             <div className="mb-6">
               <h2 className="text-lg font-extrabold text-slate-900">New Invitations</h2>
             </div>
             <div className="space-y-4">
               {/* Invite 1 */}
               <div className="rounded-xl border border-slate-100 p-4">
                 <div className="flex gap-4">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-slate-900" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Aura Skincare</h4>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">Collaboration for new serum...</p>
                    </div>
                 </div>
                 <div className="mt-4 flex gap-2">
                   <button className="flex-1 rounded-lg bg-[#f39c12] py-2 text-xs font-bold text-white hover:bg-[#e67e22]">
                     Accept
                   </button>
                   <button className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                     Details
                   </button>
                 </div>
               </div>

               {/* Invite 2 */}
               <div className="rounded-xl border border-slate-100 p-4">
                 <div className="flex gap-4">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-slate-900" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Vigor Fitness</h4>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">3-month ambassador program...</p>
                    </div>
                 </div>
                 <div className="mt-4 flex gap-2">
                   <button className="flex-1 rounded-lg bg-[#f39c12] py-2 text-xs font-bold text-white hover:bg-[#e67e22]">
                     Accept
                   </button>
                   <button className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                     Details
                   </button>
                 </div>
               </div>
             </div>
          </section>

          {/* Score Trend (Mockup) */}
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
             <div className="mb-6 flex items-center justify-between">
               <h2 className="text-lg font-extrabold text-slate-900">Score Trend</h2>
               <span className="text-xs font-bold text-blue-500">+42pts this mo.</span>
             </div>
             
             {/* Mock Chart Area */}
             <div className="flex h-32 items-end justify-between gap-2 overflow-hidden px-2 pb-2 pt-6">
                <div className="w-full rounded-t-sm bg-blue-100" style={{ height: "40%" }} />
                <div className="w-full rounded-t-sm bg-blue-200" style={{ height: "55%" }} />
                <div className="w-full rounded-t-sm bg-blue-300" style={{ height: "45%" }} />
                <div className="w-full rounded-t-sm bg-blue-400" style={{ height: "70%" }} />
                <div className="w-full rounded-t-sm bg-blue-500" style={{ height: "85%" }} />
                <div className="w-full rounded-t-sm bg-purple-500" style={{ height: "100%" }} />
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
