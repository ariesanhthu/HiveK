import { cn } from "@/lib/utils";
import type { AmbassadorCampaign } from "@/data/mock-data";
import { Clock } from "lucide-react";
import Image from "next/image";

interface CampaignCardProps {
  campaign: AmbassadorCampaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const isCompleted = campaign.shortStatus === "ĐÃ HOÀN THÀNH";

  // Derive colors and button setups based on status
  let statusColorClass = "";
  let statusBadgeClass = "";
  let primaryBtnText = "";
  let primaryBtnClass = "";
  let secondaryBtnText = "Xem Yêu cầu";
  
  if (campaign.shortStatus === "ĐANG ĐĂNG BÀI") {
    statusColorClass = "text-[#f39c12]";
    statusBadgeClass = "bg-orange-50 text-[#f39c12]";
    primaryBtnText = "Nộp KPI";
    primaryBtnClass = "bg-[#f39c12] hover:bg-[#e67e22] text-white";
  } else if (campaign.shortStatus === "CHỜ DUYỆT") {
    statusColorClass = "text-blue-500";
    statusBadgeClass = "bg-blue-50 text-blue-500";
    primaryBtnText = "Xem Chi tiết";
    primaryBtnClass = "bg-blue-500 hover:bg-blue-600 text-white";
  } else if (campaign.shortStatus === "ĐANG LÊN KẾ HOẠCH") {
    statusColorClass = "text-purple-500";
    statusBadgeClass = "bg-purple-50 text-purple-500";
    primaryBtnText = "Lên Bản nháp";
    primaryBtnClass = "bg-[#a855f7] hover:bg-purple-600 text-white";
  } else if (isCompleted) {
    statusColorClass = "text-slate-400";
    statusBadgeClass = "bg-slate-100 text-slate-500";
    primaryBtnText = "Xem Báo cáo";
    primaryBtnClass = "bg-slate-200 hover:bg-slate-300 text-slate-600";
    secondaryBtnText = "Hỗ trợ";
  }

  // Derive status detail text color (like "Due in 2 days" vs "Approved")
  let detailTextClass = "text-slate-500";
  if (campaign.statusDetail.includes("Hạn chót")) detailTextClass = "text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full text-[10px]";
  else if (campaign.statusDetail.includes("phê duyệt") || campaign.statusDetail.includes("THANH TOÁN")) detailTextClass = "text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]";
  else detailTextClass = "text-slate-400 text-xs";

  return (
    <div className={cn(
      "flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md md:flex-row md:items-center",
      isCompleted && "bg-slate-50/50 opacity-90"
    )}>
      {/* Left: Avatar & Info */}
      <div className="flex flex-1 gap-4">
        <div className={cn(
          "h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100",
          isCompleted && "backdrop-grayscale opacity-60"
        )}>
           <div className="flex h-full w-full items-center justify-center bg-slate-800 text-white text-2xl font-black">
              {campaign.brand.charAt(0)}
           </div>
        </div>
        <div className="flex flex-col justify-center gap-1">
          <h3 className={cn("text-lg font-bold text-slate-900", isCompleted && "text-slate-600")}>
            {campaign.title}
          </h3>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={statusColorClass}>{campaign.brand}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{campaign.category}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{campaign.dateRange}</span>
          </div>
        </div>
      </div>

      {/* Center: Status & Progress */}
      <div className="flex w-full flex-col justify-center gap-4 border-y border-slate-100 py-4 md:w-1/3 md:border-y-0 md:py-0">
        <div className="flex items-center justify-between">
          <span className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider", statusBadgeClass)}>
            {campaign.shortStatus}
          </span>
          <span className={detailTextClass}>
            {campaign.statusDetail}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>{campaign.progressLabel}</span>
            <span>{campaign.progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
             <div 
               className={cn("h-full transition-all duration-500", 
                 campaign.shortStatus === "ĐANG ĐĂNG BÀI" ? "bg-[#f39c12]" :
                 campaign.shortStatus === "CHỜ DUYỆT" ? "bg-blue-500" :
                 campaign.shortStatus === "ĐANG LÊN KẾ HOẠCH" ? "bg-purple-500" :
                 "bg-emerald-400"
               )} 
               style={{ width: `${Math.max(campaign.progressPercent, 2)}%` }} 
             />
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-col gap-2 md:w-[160px] flex-shrink-0">
        <button className={cn("w-full rounded-xl py-2.5 text-sm font-bold transition-transform active:scale-95", primaryBtnClass)}>
          {primaryBtnText}
        </button>
        <button className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95">
          {secondaryBtnText}
        </button>
      </div>
    </div>
  );
}
