
---

### 1. Lấy danh sách ID trên các nền tảng của KOL
* **Endpoint:** `GET https://hivek-main-backend-54ef5f252bc1.herokuapp.com/hivek/api/kol-profiles/platforms`
* **Query Parameters:**
  * `cursor` (string, optional): MongoDB `_id` của KOL trước đó.
  * `limit` (number, default: 10): Số lượng KOL cần lấy.
* **Trả về:**
  ```json
  {
    "data": [
      {
        "_id": "65b8d4f322399076ba3e79dd",
        "tiktok": "xiaomi_iraq_official",
        "youtube": "XiaomiIraqOfficial"
      }
    ],
    "cursor": "65b8d4f322399076ba3e7900"
  }
  ```

---

### 2. Cập nhật thông tin KOL

* **Endpoint:** `PATCH https://hivek-main-backend-54ef5f252bc1.herokuapp.com/hivek/api/kol-profiles/:id`
* **Content-Type:** `application/json`
* **Body parameters:**
  * `gender` (string, optional): Giới tính của KOL.
  * `bio` (string, optional): Mô tả về KOL.
  * `scores` (object, optional): Điểm số của KOL.
* **Example Request Body:**
  ```json
  {
    "gender": "male",
    "bio": "Tech enthusiast and content creator",
    "scores": {
      "engagement": 85,
      "reputation": 92.5
    }
  }
  ```

### 3. Tìm kiếm và Lấy danh sách thông tin đầy đủ của KOL

* **Endpoint:** `GET https://hivek-main-backend-54ef5f252bc1.herokuapp.com/hivek/api/kol-profiles`
* **Query Parameters:**
  * `cursor` (string, optional): MongoDB `_id` của KOL trước đó (cho phân trang cursor).
  * `limit` (number, default: 10): Số lượng bản ghi trả về.
* **Trả về:**
  ```json
  {
    "data": [
      {
        "id": "65b8d4f322399076ba3e79dd",
        "name": "Kênh 7 Tech",
        "location": "Vietnam",
        "gender": "unspecified",
        "bio": "Review công nghệ mới nhất...",
        "email": "contact@7tech.vn",
        "phone": "0987654321",
        "isVerified": true,
        "scores": {
          "engagement": 85
        },
        "platforms": [
          {
            "platformId": "65b8c2a39281a938de1203b8",
            "uniqueId": "kenh_7_tech",
            "externalId": "65b8c2ab9281a938de1203bc",
            "followerCount": 120000,
            "avgEngagement": 4.2,
            "topTags": ["tech", "review"],
            "categories": ["Technology"]
          }
        ]
      }
    ],
    "cursor": "65b8d4f322399076ba3e79e2"
  }
  ```

---

### 4. Lấy chi tiết thông tin một KOL theo ID

* **Endpoint:** `GET https://hivek-main-backend-54ef5f252bc1.herokuapp.com/hivek/api/kol-profiles/:id`
* **Trả về:**
  ```json
  {
    "id": "65b8d4f322399076ba3e79dd",
    "name": "Kênh 7 Tech",
    "location": "Vietnam",
    "gender": "unspecified",
    "bio": "Review công nghệ mới nhất...",
    "email": "contact@7tech.vn",
    "phone": "0987654321",
    "isVerified": true,
    "scores": {
      "engagement": 85
    },
    "platforms": [
      {
        "platformId": "65b8c2a39281a938de1203b8",
        "uniqueId": "kenh_7_tech",
        "externalId": "65b8c2ab9281a938de1203bc",
        "followerCount": 120000,
        "avgEngagement": 4.2,
        "topTags": ["tech", "review"],
        "categories": ["Technology"]
      }
    ]
  }
  ```

### 5. Lấy danh sách platform 

* **Endpoint:** `GET https://hivek-main-backend-54ef5f252bc1.herokuapp.com/hivek/api/platforms`
* **Query Parameters:**
  * `cursor` (string, optional): MongoDB `_id` của platform trước đó (cho phân trang cursor).
  * `limit` (number, default: 10): Số lượng bản ghi trả về.
* **Trả về:**
  ```json
  {
    "cursor": null,
    "data": [
      {
        "id": "6a0b1b3a2d7f1ee123555dee",
        "name": "tiktok",
        "baseUrl": "https://tiktok.com",
        "apiStatus": "stable",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/3046/3046121.png"
      },
      {
        "id": "69e0f37b06d9cacce25c4041",
        "name": "youtube",
        "baseUrl": "http://youtube.com",
        "apiStatus": "stable",
        "iconUrl": "https://www.youtube.com/favicon.ico"
      }
    ]
  }
  ```

---
