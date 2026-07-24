import { Check, Sparkles } from 'lucide-react';

export function SetupCompleteCard() {
  return (
    <section className='mt-3 overflow-hidden rounded-2xl border border-emerald-200 bg-[linear-gradient(120deg,#f0fdf4,#ffffff_72%)] p-4 shadow-[0_10px_30px_rgba(16,185,129,0.08)] sm:p-5'>
      <div className='flex items-start gap-3'>
        <span className='flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.2)]'>
          <Check className='size-5' strokeWidth={2.5} aria-hidden />
        </span>
        <div className='min-w-0'>
          <div className='flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700'>
            <Sparkles className='size-3.5' aria-hidden />
            Workspace The TutorX sẵn sàng
          </div>
          <h3 className='mt-1.5 text-base font-extrabold text-foreground'>
            Hồ sơ và chiến lược nền đã hoàn tất
          </h3>
          <p className='mt-1 text-xs leading-5 text-foreground-muted'>
            HiveK đã có đủ ngữ cảnh để tạo lịch nội dung theo đúng trụ cột, kênh và giọng thương
            hiệu. Bạn vẫn duyệt trước khi lên lịch.
          </p>
        </div>
      </div>
    </section>
  );
}
