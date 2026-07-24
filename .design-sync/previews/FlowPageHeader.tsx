import { FlowPageHeader } from 'client';

export function Default() {
  return (
    <div style={{ width: 900 }}>
      <FlowPageHeader
        nav={
          <nav className='flex items-center gap-1 text-xs font-medium text-foreground-muted'>
            <span>Chiến dịch</span>
            <span className='material-symbols-outlined text-sm'>chevron_right</span>
            <span>Tìm KOL</span>
            <span className='material-symbols-outlined text-sm'>chevron_right</span>
            <span className='text-foreground'>Kết quả tìm kiếm</span>
          </nav>
        }
        title={
          <div>
            <h1 className='text-2xl font-bold text-foreground'>Ghép đôi Nhà sáng tạo bằng AI</h1>
            <p className='mt-1 text-sm text-foreground-muted'>
              Chiến dịch “Ra mắt Son Mùa hè” · 48 ứng viên phù hợp
            </p>
          </div>
        }
        actions={
          <>
            <button
              type='button'
              className='inline-flex items-center gap-1 rounded-lg border border-primary-soft px-4 py-2 text-sm font-semibold text-foreground hover:bg-primary-soft'
            >
              <span className='material-symbols-outlined text-base'>bookmark</span>
              Lưu nháp
            </button>
            <button
              type='button'
              className='inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background-dark'
            >
              <span className='material-symbols-outlined text-base'>auto_awesome</span>
              Tạo lại gợi ý
            </button>
          </>
        }
      />
    </div>
  );
}
