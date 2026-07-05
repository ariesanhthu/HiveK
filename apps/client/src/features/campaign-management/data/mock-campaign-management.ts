import type {
  CampaignBrief,
  CampaignCreatorSuggestion,
  CampaignParticipant,
} from "@/features/campaign-management/types";

const now = new Date().toISOString();

export const initialCampaigns: CampaignBrief[] = [
  {
    id: "ontop-fashion-windbreaker",
    name: "ON TOP Jacket Drop",
    status: "reviewing",
    objective: "sales",
    platforms: ["facebook", "threads", "instagram"],
    accountIds: ["fb-ontop", "threads-ontop", "ig-ontop"],
    productIds: ["lightweight-windbreaker"],
    productName: "Áo khoác gió ON TOP",
    description:
      "Chiến dịch ra mắt áo khoác gió ON TOP dành cho người trẻ cần một item gọn, dễ phối, đi học đi làm đi chơi đều dùng được.",
    keyMessage:
      "Một chiếc áo khoác nhẹ nhưng đủ chỉn chu: cản gió, hạn chế thấm nhẹ, phối được nhiều outfit hằng ngày.",
    targetAudience:
      "Nam nữ 18-28 tuổi tại thành phố, thích streetwear tối giản, cần áo khoác tiện dụng khi di chuyển bằng xe máy hoặc đi chơi cuối tuần.",
    customerInsight:
      "Khách muốn áo khoác nhìn gọn, không quá thể thao, mặc lên ảnh đẹp nhưng vẫn hữu dụng khi trời nắng, gió hoặc mưa nhẹ.",
    usp: "Form unisex dễ mặc, chất liệu nhẹ, bề mặt cản gió và chống thấm nhẹ, màu trung tính dễ phối.",
    offer: "Freeship cho đơn đầu tiên và tặng voucher 10% cho khách comment đúng mã OTOP10.",
    cta: "Comment size hoặc nhắn tin để được tư vấn phối đồ",
    landingUrl: "https://www.threads.com/@ontop.brand",
    tone: {
      preset: "youthful",
      formality: 2,
      emojiLevel: "low",
      language: "vi",
      perspective: "brand",
      requiredKeywords: ["áo khoác gió", "unisex", "dễ phối", "ON TOP"],
      bannedKeywords: ["rẻ nhất", "cam kết tuyệt đối", "chống nước 100%"],
      suggestedHashtags: ["#ONTOP", "#OOTD", "#StreetwearVietnam", "#Aokhoacgio"],
    },
    media: [
      {
        id: "fashion-hero-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
        name: "Lookbook streetwear ngoài phố",
        role: "lifestyle",
        alt: "Người mẫu mặc outfit streetwear tối giản ngoài phố",
      },
      {
        id: "fashion-product-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
        name: "Flatlay áo khoác và phụ kiện",
        role: "product",
        alt: "Ảnh flatlay thời trang với áo khoác và phụ kiện",
      },
    ],
    platformContent: [
      {
        platform: "facebook",
        postingStyle: "Bài bán hàng có storytelling ngắn, rõ lợi ích và CTA comment size.",
        primaryFormat: "Album 4 ảnh + caption dài vừa phải",
        contentAngle: "Một item cho ngày đi học, đi làm và đi chơi cuối tuần.",
        mediaDirection:
          "Ảnh 1 hero outfit, ảnh 2 chất liệu gần, ảnh 3 phối đồ nam/nữ, ảnh 4 CTA voucher.",
        caption:
          "Có những ngày chỉ cần một chiếc áo khoác gọn là outfit nhìn chỉn chu hơn hẳn. ON TOP Jacket nhẹ, dễ phối, hợp đi học, đi làm lẫn cafe cuối tuần. Comment chiều cao/cân nặng, tụi mình gợi ý size và cách phối phù hợp.",
        hashtags: ["#ONTOP", "#Aokhoacgio", "#StreetwearVietnam"],
      },
      {
        platform: "threads",
        postingStyle: "Conversation-first, ngắn, giống một lời gợi chuyện để kéo comment.",
        primaryFormat: "Text post + 1 ảnh outfit",
        contentAngle: "Áo khoác nào mặc được cả tuần mà không bị nhàm?",
        mediaDirection: "Một ảnh outfit tối giản, nền sạch, màu áo nổi rõ.",
        caption:
          "Một chiếc áo khoác gió dễ phối có thể cứu khá nhiều ngày không biết mặc gì. Team bạn thích màu basic hay màu nổi hơn?",
        hashtags: ["#ONTOP", "#OOTD"],
      },
      {
        platform: "instagram",
        postingStyle: "Visual-first, caption gọn, ưu tiên hook 1 dòng và CTA lưu bài/DM.",
        primaryFormat: "Carousel 5 ảnh hoặc Reels 12 giây",
        contentAngle: "3 cách phối áo khoác gió ON TOP.",
        mediaDirection:
          "Carousel: full outfit, detail khóa/túi, phối jeans, phối short, ảnh CTA DM.",
        caption:
          "3 outfit với một chiếc jacket nhẹ. Lưu lại cho ngày không biết mặc gì và DM ONTOP để tụi mình tư vấn size.",
        hashtags: ["#ONTOP", "#OOTDVietnam", "#MinimalStreetwear"],
      },
    ],
    commentReplyExamples: [
      {
        id: "qa-size",
        intent: "size",
        question: "Mình cao 1m68 nặng 58kg mặc size nào?",
        answer:
          "Bạn có thể tham khảo size M nếu thích form vừa, hoặc L nếu muốn mặc oversize nhẹ. Bạn gửi thêm số đo vai/ngực, ON TOP check kỹ hơn cho bạn nha.",
      },
      {
        id: "qa-material",
        intent: "material",
        question: "Áo này có chống nước không shop?",
        answer:
          "Áo có bề mặt chống thấm nhẹ, phù hợp mưa nhỏ hoặc đi đường gió. Nếu gặp mưa lớn lâu thì mình vẫn khuyên dùng áo mưa chuyên dụng nhé.",
      },
      {
        id: "qa-styling",
        intent: "styling",
        question: "Phối với quần gì đẹp?",
        answer:
          "Áo hợp với jeans xanh, quần dù đen hoặc short basic. Nếu bạn thích style tối giản, phối áo thun trắng + jeans + jacket là rất ổn.",
      },
      {
        id: "qa-price",
        intent: "pricing",
        question: "Giá bao nhiêu và có mã giảm không?",
        answer:
          "Bạn comment mã OTOP10 hoặc nhắn tin cho ON TOP, tụi mình gửi giá hiện tại kèm voucher đơn đầu tiên cho bạn.",
      },
    ],
    postingPlan: [
      {
        day: 1,
        dateLabel: "Thứ 2 · Tuần ra mắt",
        posts: [
          {
            id: "post-fb-teaser",
            title: "Teaser jacket mới",
            platform: "facebook",
            contentType: "album",
            status: "approved",
            time: "09:00",
            owner: "Content team",
            angle: "Một item gọn cho ngày không biết mặc gì.",
          },
          {
            id: "post-threads-question",
            title: "Gợi chuyện chọn màu",
            platform: "threads",
            contentType: "thread",
            status: "scheduled",
            time: "12:30",
            owner: "Agent AI",
            angle: "Team basic hay màu nổi?",
          },
        ],
      },
      {
        day: 2,
        dateLabel: "Thứ 4 · Đẩy cân nhắc",
        posts: [
          {
            id: "post-ig-carousel",
            title: "3 cách phối jacket",
            platform: "instagram",
            contentType: "carousel",
            status: "needs-review",
            time: "19:30",
            owner: "Designer",
            angle: "Carousel phối đồ đi học, đi làm, cafe.",
          },
          {
            id: "post-fb-material",
            title: "Detail chất liệu",
            platform: "facebook",
            contentType: "caption",
            status: "draft",
            time: "20:15",
            owner: "Agent AI",
            angle: "Cản gió, chống thấm nhẹ, form unisex.",
          },
        ],
      },
      {
        day: 3,
        dateLabel: "Thứ 6 · Chốt chuyển đổi",
        posts: [
          {
            id: "post-ig-reels",
            title: "Reels thay outfit nhanh",
            platform: "instagram",
            contentType: "reels",
            status: "draft",
            time: "11:00",
            owner: "KOC",
            angle: "One jacket, three looks.",
          },
          {
            id: "post-fb-offer",
            title: "Mã OTOP10",
            platform: "facebook",
            contentType: "caption",
            status: "draft",
            time: "20:00",
            owner: "Sales team",
            angle: "Comment mã nhận voucher đơn đầu tiên.",
          },
        ],
      },
    ],
    tracking: {
      impressions: 128400,
      reach: 64200,
      engagementRate: 5.8,
      clicks: 3420,
      comments: 486,
      leads: 214,
      conversionRate: 3.4,
      spend: 18500000,
      revenue: 62400000,
    },
    aiConfig: {
      numberOfPosts: 9,
      variantsPerPost: 3,
      creativity: 4,
      contentStrategies: ["awareness", "education", "storytelling", "sales", "ugc"],
      generateCaption: true,
      generateHashtags: true,
      generateCta: true,
      generateMediaPrompt: true,
      generateSchedule: true,
      suggestCreators: true,
      approvalMode: "per_post",
    },
    invite: {
      enabled: true,
      defaultCode: "ONTOP10",
      inviteLink: "/campaigns/ontop-fashion-windbreaker/invite?code=ONTOP10",
      permissions: ["view_brief", "upload_media", "submit_draft", "view_schedule"],
    },
    createdAt: now,
    updatedAt: now,
  },
];

export const initialCreatorSuggestions: Record<string, CampaignCreatorSuggestion[]> = {
  "ontop-fashion-windbreaker": [
    {
      id: "creator-1",
      name: "Mina Outfit",
      type: "koc",
      platforms: ["instagram", "threads"],
      niche: ["fashion", "ootd", "minimal style"],
      followerRange: "30K - 50K",
      engagementRate: 4.8,
      audienceMatchScore: 89,
      estimatedCost: "1.500.000đ - 2.500.000đ",
      reason: [
        "Tệp người xem quan tâm outfit hằng ngày và streetwear tối giản.",
        "Nội dung thường có mirror selfie, carousel phối đồ, dễ gắn sản phẩm.",
        "Tone tự nhiên, hợp với chiến dịch cần comment hỏi size.",
      ],
      contactStatus: "not_contacted",
      contactInfo: { email: "mina.outfit@example.com", instagram: "@mina.outfit" },
    },
    {
      id: "creator-2",
      name: "Tú Mix Đồ",
      type: "creator",
      platforms: ["instagram", "facebook"],
      niche: ["men fashion", "streetwear review"],
      followerRange: "80K - 120K",
      engagementRate: 5.2,
      audienceMatchScore: 84,
      estimatedCost: "3.000.000đ - 5.000.000đ",
      reason: [
        "Có thế mạnh video ngắn dạng phối 3 outfit.",
        "Phù hợp nếu chiến dịch cần Instagram Reels và carousel.",
        "Nội dung review chất liệu thực tế, dễ nói rõ ưu điểm cản gió.",
      ],
      contactStatus: "not_contacted",
      contactInfo: { instagram: "@tumixdo" },
    },
    {
      id: "creator-3",
      name: "Hạ Studio",
      type: "kol",
      platforms: ["facebook", "threads"],
      niche: ["lifestyle", "young audience", "fashion"],
      followerRange: "100K+",
      engagementRate: 3.9,
      audienceMatchScore: 78,
      estimatedCost: "5.000.000đ - 8.000.000đ",
      reason: [
        "Phù hợp với nhóm khách hàng trẻ thích lifestyle tối giản.",
        "Phong cách nội dung mềm, dễ lồng ghép outfit thường ngày.",
        "Có thể hỗ trợ nhận diện thương hiệu ở giai đoạn đầu.",
      ],
      contactStatus: "not_contacted",
      contactInfo: { facebook: "maylifestyle" },
    },
  ],
};

export const initialParticipants: Record<string, CampaignParticipant[]> = {
  "ontop-fashion-windbreaker": [
    {
      id: "participant-owner",
      campaignId: "ontop-fashion-windbreaker",
      name: "Anh Thư",
      role: "owner",
      status: "joined",
      contactChannel: "email",
      contactValue: "owner@hivek.example",
      inviteCode: "OWNER",
      inviteLink: "/campaigns/ontop-fashion-windbreaker/invite?code=OWNER",
      permissions: ["view_brief", "manage_posts", "manage_participants"],
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ],
};
