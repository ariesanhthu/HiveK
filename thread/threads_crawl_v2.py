# import json
# import time
# import os
# import re
# import hashlib
# from datetime import datetime
# from playwright.sync_api import sync_playwright

# # --- CẤU HÌNH ---
# OUTPUT_FILE = "threads_keyword_dataset.jsonl"
# KEYWORD = "lamoon"  # Từ khóa tìm kiếm
# MAX_POSTS_TO_SEARCH = 10 # Số lượng bài viết muốn cào từ kết quả search
# MAX_COMMENTS_PER_POST = 5
# MAX_SCROLL_ATTEMPTS = 10

# NOISE_WORDS = ['Dịch', 'Tác giả', 'Trả lời', 'Xem thêm', 'Ẩn bớt', 'Reply', 'Like', 'Thích']
# VIETNAMESE_PATTERN = re.compile(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]')

# def generate_id(prefix, text):
#     hash_object = hashlib.md5(text.encode())
#     return f"{prefix}_{hash_object.hexdigest()[:10]}"

# def clean_comment_text(text):
#     for word in NOISE_WORDS:
#         text = re.sub(rf'\b{word}\b', '', text, flags=re.IGNORECASE)
#     text = re.sub(r'\s+', ' ', text).strip()
#     return text

# def is_valid_comment(text):
#     text = clean_comment_text(text)
#     if not text or len(text.split()) < 3: return False, ""
#     if not VIETNAMESE_PATTERN.search(text.lower()): return False, ""
#     return True, text

# def clean_context(raw_context):
#     lines = [l.strip() for l in raw_context.split('\n') if l.strip() and l.strip() not in NOISE_WORDS]
#     return ' '.join(lines[:5]) # Lấy đoạn ngắn đầu bài làm context

# def search_threads(page, keyword, max_posts):
#     """Tìm kiếm bài viết theo từ khóa và trả về danh sách URL"""
#     search_url = f"https://www.threads.net/search?q={keyword}"
#     print(f"🔍 Đang tìm kiếm bài viết cho từ khóa: '{keyword}'...")
#     page.goto(search_url, wait_until="networkidle")
#     time.sleep(5) # Chờ kết quả render

#     post_urls = set()
#     attempts = 0
#     while len(post_urls) < max_posts and attempts < 10:
#         # Tìm tất cả các link có định dạng /post/
#         links = page.locator('a[href*="/post/"]').all()
#         for link in links:
#             href = link.get_attribute("href")
#             if href:
#                 full_url = f"https://www.threads.net{href.split('?')[0]}"
#                 post_urls.add(full_url)
#                 if len(post_urls) >= max_posts: break
        
#         if len(post_urls) < max_posts:
#             page.mouse.wheel(0, 2000)
#             time.sleep(3)
#             attempts += 1
            
#     return list(post_urls)

# def crawl_by_keyword():
#     with sync_playwright() as p:
#         browser = p.chromium.launch(headless=False) # Để False để theo dõi/vượt captcha nếu có
#         context = browser.new_context(
#             user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
#         )
#         page = context.new_page()

#         # Bước 1: Tìm kiếm bài viết
#         target_urls = search_threads(page, KEYWORD, MAX_POSTS_TO_SEARCH)
#         print(f"✅ Tìm thấy {len(target_urls)} bài viết liên quan.")

#         # Bước 2: Lặp qua từng bài để cào comment (Logic cũ của bạn)
#         seen_ids = set() 
#         total_saved = 0

#         for url in target_urls:
#             try:
#                 print(f"\n🔗 Đang cào bài: {url}")
#                 page.goto(url, wait_until="domcontentloaded", timeout=60000)
#                 time.sleep(4)

#                 # Lấy Context (Nội dung bài gốc)
#                 try:
#                     main_post = page.locator('div[data-pressable-container="true"]').first
#                     post_context = clean_context(main_post.inner_text())
#                 except:
#                     continue

#                 # Cào comment
#                 post_saved_count = 0
#                 for _ in range(MAX_SCROLL_ATTEMPTS):
#                     elements = page.locator('div[data-pressable-container="true"]').all()
                    
#                     for el in elements[1:]: # Bỏ qua cái đầu là bài gốc
#                         if post_saved_count >= MAX_COMMENTS_PER_POST: break
                        
#                         raw_text = el.inner_text()
#                         is_valid, cleaned = is_valid_comment(raw_text.split('\n')[0]) # Lấy dòng đầu của cmt
                        
#                         if is_valid:
#                             cmt_id = generate_id("th", cleaned)
#                             if cmt_id not in seen_ids:
#                                 record = {
#                                     "id": cmt_id,
#                                     "keyword": KEYWORD,
#                                     "text": cleaned,
#                                     "context": post_context,
#                                     "url": url
#                                 }
#                                 with open(OUTPUT_FILE, 'a', encoding='utf-8') as f:
#                                     f.write(json.dumps(record, ensure_ascii=False) + '\n')
#                                 seen_ids.add(cmt_id)
#                                 post_saved_count += 1
#                                 total_saved += 1

#                     if post_saved_count >= MAX_COMMENTS_PER_POST: break
#                     page.mouse.wheel(0, 1000)
#                     time.sleep(2)

#             except Exception as e:
#                 print(f"❌ Lỗi tại {url}: {e}")
#                 continue

#         print(f"\n🎉 Hoàn thành! Đã lưu {total_saved} records vào {OUTPUT_FILE}")
#         browser.close()

# if __name__ == "__main__":
#     crawl_by_keyword()