import json
import time
import os
import re
import hashlib
from datetime import datetime
from playwright.sync_api import sync_playwright

# --- CẤU HÌNH ---
OUTPUT_FILE = "threads_dataset.jsonl"
MAX_COMMENTS_PER_POST = 10
MAX_SCROLL_ATTEMPTS = 15


NOISE_WORDS = [
    'Dịch', 'Tác giả', 'Trả lời', 'Xem thêm', 'Ẩn bớt', 'Reply', 
    'See translation', 'Thích', 'Like', 'Đã thích', 'Liked', 
    'Xem bản dịch', 'Tác giả gốc', 'Bình luận', 'Chia sẻ', 
    'Comment', 'Share'
]

EMOJI_PATTERN = re.compile("["
    u"\U0001F600-\U0001F64F"  
    u"\U0001F300-\U0001F5FF"  
    u"\U0001F680-\U0001F6FF"  
    u"\U0001F1E0-\U0001F1FF"  
    u"\U00002702-\U000027B0"
    u"\U000024C2-\U0001F251"
    u"\U0001f926-\U0001f937"
    u"\U00010000-\U0010ffff"
    u"\u2640-\u2642"
    u"\u2600-\u2B55"
    u"\u200d"
    u"\u23cf"
    u"\u23e9"
    u"\u231a"
    u"\ufe0f"
    u"\u3030"
    "]+", flags=re.UNICODE)

VIETNAMESE_PATTERN = re.compile(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]')
TIME_PATTERN = re.compile(r'\b\d+\s*(h|d|w|mo|y|giờ|ngày|tuần|tháng|năm)\b', flags=re.IGNORECASE)

TARGET_URLS = [
    "https://www.threads.com/@hoang.ngya/post/DWXYTCeE1SO",
    "https://www.threads.com/@nml.bac/post/DWNGh8qiKBR",
    "https://www.threads.com/@phuonglinxin/post/DWK-gvcE8WW",
    "https://www.threads.com/@yulmao.o/post/DWOwJkpAbPS",
    "https://www.threads.com/@hellohieu2802/post/DVBZXkvEvUw",
    "https://www.threads.com/@phuochoai585/post/DWOej63E01Y",
    "https://www.threads.com/@beox.nyuw_/post/DWL-RJGid07",
    "https://www.threads.com/@hwangtuann_/post/DWO49QvmL0A",
    "https://www.threads.com/@be_vet_dang_iu/post/DV9CVPrj_Hy",
    "https://www.threads.com/@doubleb.sof/post/DNtX4pO5g-V",
    "https://www.threads.com/@shiningmo_on2401/post/DWYHXdekea6",
    "https://www.threads.com/@menodora_18/post/DWNeqI_Evrj",
    "https://www.threads.com/@sayyousweet/post/DK6H3XlPm9A",
    "https://www.threads.com/@bongbongmunn/post/DWOwn_nkbRR",
    "https://www.threads.com/@yftidtidxigk/post/DObRZM1ExmM",
    "https://www.threads.com/@bbibo____/post/DNtLwi_5OF0",
    "https://www.threads.com/@kitzie912/post/DWO1fLagbrk",
    "https://www.threads.com/@andynguyen.1209/post/DWNC205kzhr",
    "https://www.threads.com/@wildestdream.in.me/post/DUdv0enAUi5",
    "https://www.threads.com/@gianghleee/post/DOnrhizkZ1R"
]

def generate_id(prefix, text):
    hash_object = hashlib.md5(text.encode())
    return f"{prefix}_{hash_object.hexdigest()[:10]}"

def clean_comment_text(text):
    """Làm sạch text comment"""
    text = EMOJI_PATTERN.sub('', text)
    
    for word in NOISE_WORDS:
        text = re.sub(rf'\b{word}\b', '', text, flags=re.IGNORECASE)
    
    text = TIME_PATTERN.sub('', text)
    text = re.sub(r'[\\\/]{2,}', ' ', text)
    text = re.sub(r'^[\\\/\s]+|[\\\/\s]+$', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def is_valid_comment(text):
    """Bộ lọc: >=5 từ, không quảng cáo, phải có tiếng Việt"""
    text = clean_comment_text(text)
    
    if not text or "http" in text or ".com" in text:
        return False, ""
    
    if len(text.split()) < 5 or re.match(r'^[\d\W\s]+$', text):
        return False, ""
    
    if text in NOISE_WORDS or not VIETNAMESE_PATTERN.search(text.lower()):
        return False, ""
    
    return True, text

def load_existing_ids(file_path):
    """Đọc file jsonl cũ để lấy danh sách ID đã crawl"""
    seen = set()
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    record = json.loads(line.strip())
                    seen.add(record.get("id"))
                except:
                    pass
    return seen

def clean_context(raw_context):
    """Lọc context: bỏ tên tác giả, ngày, số like/comment/share"""
    clean_lines = []
    
    for line in raw_context.split('\n'):
        line = line.strip()
        if not line or line in NOISE_WORDS:
            continue
        
        # Bỏ: username, ngày tháng, số like/share/comment
        if (re.match(r'^[\w._]+$', line) and len(line) < 30) or \
           re.match(r'^\d{1,2}/\d{1,2}/\d{4}$', line) or \
           re.match(r'^\d{4}-\d{2}-\d{2}', line) or \
           re.match(r'^[\d,.\s]+[KkMm]?$', line):
            continue
            
        clean_lines.append(line)
    
    result = ' '.join(clean_lines)
    result = re.sub(r'\s+[\d,]+[KkMm]?\s+[\d,]+\s+[\d,]+\s*[\d,]*\s*$', '', result)
    
    return result.strip()

def crawl_multiple_posts(urls):
    seen_ids = load_existing_ids(OUTPUT_FILE)

    with sync_playwright() as p:
        print(f"🚀 Bắt đầu crawl (Max {MAX_COMMENTS_PER_POST} cmt/bài)...")
        browser = p.chromium.launch(
            headless=False,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox'
            ]
        )
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            locale='vi-VN'
        )
        page = context.new_page()

        def block_resources(route):
            if route.request.resource_type in ['image', 'media', 'font']:
                route.abort()
            else:
                route.continue_()

        page.route("**/*", block_resources)

        total_saved_all = 0

        for url in urls:
            try:
                print(f"\n🔗 Xử lý: {url}")
                
                # Retry logic với xử lý lỗi tốt hơn
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        response = page.goto(url, wait_until="domcontentloaded", timeout=30000)
                        if response and response.status >= 400:
                            print(f"   ⚠️ HTTP {response.status} - Bài viết có thể đã bị xóa.")
                            raise Exception(f"HTTP {response.status}")
                        break
                    except Exception as nav_error:
                        if attempt < max_retries - 1:
                            print(f"   🔄 Thử lại lần {attempt + 2}...")
                            time.sleep(2)
                        else:
                            raise nav_error
                
                time.sleep(3)  # Chờ trang load đầy đủ
                
                # 1. Lấy Context
                try:
                    page.wait_for_selector('div[data-pressable-container="true"]', timeout=10000)
                    main_post_el = page.locator('div[data-pressable-container="true"]').first
                    raw_context = main_post_el.inner_text()
                    post_context = clean_context(raw_context)  # <-- Dùng hàm lọc mới
                    print(f"   📝 Context: {post_context[:60]}...")
                except:
                    print("   ⚠️ Lỗi load bài. Bỏ qua.")
                    continue

                # 2. Cuộn và lấy comment
                print("   📜 Đang tải và lọc comment...")
                post_saved_count = 0
                scroll_attempts = 0
                
                while post_saved_count < MAX_COMMENTS_PER_POST and scroll_attempts < MAX_SCROLL_ATTEMPTS:
                    # Dùng evaluate để lấy text an toàn hơn
                    all_texts = page.evaluate('''() => {
                        const elements = document.querySelectorAll('div[data-pressable-container="true"]');
                        return Array.from(elements).map(el => ({
                            text: el.innerText,
                            time: el.querySelector('time')?.getAttribute('datetime') || null
                        }));
                    }''')
                    
                    # Bỏ qua phần tử đầu tiên (bài gốc)
                    for i, item in enumerate(all_texts[1:], start=1):
                        if post_saved_count >= MAX_COMMENTS_PER_POST:
                            break

                        raw_text = item['text']
                        lines = raw_text.split('\n')
                        
                        clean_text = ""
                        found_valid = False
                        
                        for line in lines:
                            line = line.strip()
                            is_valid, cleaned = is_valid_comment(line)  # <-- Cập nhật
                            if is_valid and cleaned not in post_context:
                                clean_text = cleaned  # <-- Dùng text đã làm sạch
                                found_valid = True
                                break
                        
                        if not found_valid: 
                            continue

                        cmt_id = generate_id("th", clean_text)
                        if cmt_id in seen_ids:
                            continue

                        created_at = item['time'] or datetime.now().isoformat()

                        record = {
                            "id": cmt_id,
                            "platform": "threads",
                            "text": clean_text,
                            "context": post_context,
                            "created_at": created_at,
                            "metadata": {"source": url}
                        }

                        with open(OUTPUT_FILE, 'a', encoding='utf-8') as f:
                            f.write(json.dumps(record, ensure_ascii=False) + '\n')
                        
                        seen_ids.add(cmt_id)
                        post_saved_count += 1
                        print(f"     + [{post_saved_count}/{MAX_COMMENTS_PER_POST}] Saved: {clean_text[:40]}...")
                    
                    if post_saved_count >= MAX_COMMENTS_PER_POST:
                        print(f"   ✅ Đã đủ {MAX_COMMENTS_PER_POST} comment.")
                        break
                    
                    # Cuộn trang
                    page.evaluate('window.scrollBy(0, 1500)')
                    time.sleep(2)
                    scroll_attempts += 1
                    print(f"   🔄 Cuộn trang lần {scroll_attempts}... (Đã lấy: {post_saved_count})")

                if post_saved_count == 0:
                    print(f"   ⚠️ Không lấy được comment nào (filter quá chặt hoặc ít comment).")

                total_saved_all += post_saved_count

            except Exception as e:
                error_msg = str(e)
                if "ERR_ABORTED" in error_msg or "net::" in error_msg:
                    print(f"   ❌ Không thể truy cập URL (bài viết có thể đã bị xóa hoặc ẩn)")
                elif "Timeout" in error_msg:
                    print(f"   ❌ Timeout - mạng chậm hoặc trang không phản hồi")
                else:
                    print(f"   ❌ Lỗi: {e}")
                continue
        
        print(f"\n🎉 TỔNG KẾT: Đã lưu {total_saved_all} comment vào file {OUTPUT_FILE}")
        browser.close()

if __name__ == "__main__":
    crawl_multiple_posts(TARGET_URLS)