# Chỗ này để giải thích đã demo được gì
---
## 0. crawl data
- Hiện tại đang dùng script crawl threads do threads dễ crawl hơn. Pipeline đang khá nguyên thủy là paste link bài cần crawl vô.
- Script này đang cào theo pipeline cũ (focus vào dư luận - comment)
## 1. data_collecting.py
- Nhận dữ liệu từ file JSONL hiện có (và dễ mở rộng thêm platform khác).
- Chuẩn hóa schema chung cho pipeline.
## 2. data_processing.py
- Làm sạch noise/spam/emoji không mang nghĩa.
- Chuẩn hóa viết tắt + teencode qua từ điển mapping (chỗ này mới demo 1 vài từ thui).
## 3. semantic_understanding.py
- Dùng PhoBERT tạo embedding cho text.
- Dựa trên embedding similarity để suy ra:
    - sentiment (positive/neutral/negative), topic, mentioned entity (subject).
## 4. evaluation.py
- Tính 4 độ đo: Sentiment, Engagement Quality, Topic Authority, Controversy Risk.
- Tính KOL Score theo công thức: KOL Score = w1 * Sentiment Score
                                            w2 * Engagement Quality
                                            w3 * Topic Authority (tên cũ)
                                            w4 * Controversy Risk

## 5. run_pipeline.py
- chạy toàn bộ pipeline (= command của README_pipeline)
## 6. meaning kết quả KOL score
- sentiment score > 0 là tích cực > tiêu cực (có neutral trỏng nữa)
- engagement quality: tính như mô tả trong tin nhắn (volumne: định lượng với quality: hiện tại là cmt length với reply)
- topic authority: topic xuất hiện nhiều nhất / tổng topic 
- controversy risk (100 - risk) nên càng thấp càng gud
- kol score tính theo công thức trên (hiện đang gán cứng w1, w2, w3, w4)