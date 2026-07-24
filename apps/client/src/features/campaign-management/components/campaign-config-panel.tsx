'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { PLATFORM_LABELS } from '@/features/campaign-management/data/campaign-management-options';
import type { CampaignBrief } from '@/features/campaign-management/types';
import { ImagePlus, Sparkles, Upload } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type CampaignConfigPanelProps = {
  campaign: CampaignBrief;
};

export function CampaignConfigPanel({ campaign }: CampaignConfigPanelProps) {
  const [uploadedImages, setUploadedImages] = useState<
    { id: string; name: string; url: string; }[]
  >([]);

  const handleUpload = (files: FileList | null) => {
    if (!files) return;

    const nextImages = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: `${file.name}-${file.lastModified}`,
        name: file.name,
        url: URL.createObjectURL(file),
      }));

    setUploadedImages((current) => [...nextImages, ...current]);
  };

  return (
    <div className='mx-auto max-w-6xl space-y-4'>
      <div className='rounded-lg border border-primary-soft bg-background-light p-4'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='text-sm font-extrabold text-foreground'>
              Config chiến dịch
            </p>
            <p className='mt-1 max-w-3xl text-xs leading-5 text-foreground-muted'>
              {campaign.description}
            </p>
          </div>
          <Link
            href={`/campaign-planning?campaignId=${campaign.id}`}
            className={buttonVariants()}
          >
            <Sparkles className='size-4' aria-hidden />
            Tạo bài viết
          </Link>
        </div>

        <div className='mt-4 grid gap-3 md:grid-cols-3'>
          <div className='rounded-lg border border-primary-soft bg-card p-3'>
            <p className='text-xs font-bold text-foreground'>Sản phẩm</p>
            <p className='mt-1 text-sm font-semibold text-foreground-muted'>
              {campaign.productName}
            </p>
          </div>
          <div className='rounded-lg border border-primary-soft bg-card p-3'>
            <p className='text-xs font-bold text-foreground'>Thông điệp</p>
            <p className='mt-1 text-sm font-semibold text-foreground-muted'>
              {campaign.keyMessage}
            </p>
          </div>
          <div className='rounded-lg border border-primary-soft bg-card p-3'>
            <p className='text-xs font-bold text-foreground'>CTA</p>
            <p className='mt-1 text-sm font-semibold text-primary'>{campaign.cta}</p>
          </div>
        </div>
      </div>

      <div className='rounded-lg border border-primary-soft bg-background-light p-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-extrabold text-foreground'>
              Content riêng theo từng nền tảng
            </p>
            <p className='mt-1 text-xs text-foreground-muted'>
              Facebook, Threads và Instagram có format, caption, media direction riêng.
            </p>
          </div>
          <Button size='sm' variant='outline'>
            <Sparkles className='size-3.5' aria-hidden />
            AI tối ưu caption
          </Button>
        </div>

        <div className='mt-4 grid gap-3 xl:grid-cols-3'>
          {campaign.platformContent.map((content) => (
            <article
              key={content.platform}
              className='rounded-lg border border-primary-soft bg-card p-4'
            >
              <div className='flex items-center justify-between gap-3'>
                <h3 className='text-sm font-extrabold text-foreground'>
                  {PLATFORM_LABELS[content.platform]}
                </h3>
                <span className='rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary'>
                  {content.primaryFormat}
                </span>
              </div>
              <p className='mt-3 text-xs font-bold text-foreground'>
                Cách đăng:{' '}
                <span className='font-medium text-foreground-muted'>
                  {content.postingStyle}
                </span>
              </p>
              <textarea
                defaultValue={content.caption}
                className='mt-3 min-h-36 w-full resize-none rounded-xl border border-primary-soft bg-background-light p-3 text-sm leading-6 text-foreground'
              />
              <p className='mt-3 text-xs text-foreground-muted'>
                Hình ảnh: {content.mediaDirection}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(24rem,0.8fr)]'>
        <div className='rounded-lg border border-primary-soft bg-background-light p-4'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-extrabold text-foreground'>Hình ảnh</p>
              <p className='mt-1 text-xs text-foreground-muted'>
                Fill sẵn ảnh mẫu, có thể upload thêm ảnh sản phẩm/lookbook.
              </p>
            </div>
            <label className='inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary-soft bg-card px-3 text-xs font-bold text-foreground transition-colors hover:bg-primary-soft'>
              <Upload className='size-3.5' aria-hidden />
              Upload ảnh
              <input
                type='file'
                accept='image/*'
                multiple
                className='hidden'
                onChange={(event) => handleUpload(event.target.files)}
              />
            </label>
          </div>

          <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {[...uploadedImages, ...campaign.media].map((media) => (
              <figure
                key={media.id}
                className='overflow-hidden rounded-lg border border-primary-soft bg-card'
              >
                <img
                  src={media.url}
                  alt={media.name}
                  className='aspect-[4/5] w-full object-cover'
                />
                <figcaption className='p-2 text-xs font-semibold text-foreground-muted'>
                  {media.name}
                </figcaption>
              </figure>
            ))}

            <div className='flex min-h-48 items-center justify-center rounded-lg border border-dashed border-primary-soft bg-card text-center'>
              <div>
                <ImagePlus className='mx-auto size-6 text-primary' aria-hidden />
                <p className='mt-2 text-xs font-bold text-foreground'>AI image prompt</p>
                <p className='mt-1 px-4 text-xs text-foreground-muted'>
                  Product shot, minimal streetwear, neutral background.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-primary-soft bg-background-light p-4'>
          <p className='text-sm font-extrabold text-foreground'>
            Data Q&A mẫu cho agent rep comment
          </p>
          <div className='mt-4 overflow-hidden rounded-lg border border-primary-soft bg-card'>
            <table className='w-full text-left text-sm'>
              <thead className='border-b border-primary-soft bg-muted text-xs text-foreground-muted'>
                <tr>
                  <th className='px-3 py-2 font-bold'>Câu hỏi</th>
                  <th className='px-3 py-2 font-bold'>Câu trả lời mẫu</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-primary-soft'>
                {campaign.commentReplyExamples.map((item) => (
                  <tr key={item.id}>
                    <td className='px-3 py-3 text-xs font-bold text-primary'>
                      {item.question}
                    </td>
                    <td className='px-3 py-3 text-xs leading-5 text-foreground-muted'>
                      {item.answer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
