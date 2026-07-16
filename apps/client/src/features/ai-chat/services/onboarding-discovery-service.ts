import type {
  BusinessDetails,
  DiscoverySource,
  DiscoverySourceKind,
} from "../types/onboarding-types";

export type OnboardingDiscoveryResponse =
  | {
      matched: true;
      query: string;
      sources: DiscoverySource[];
      details: BusinessDetails;
      summary: string;
    }
  | {
      matched: false;
      query: string;
      reason: string;
    };

const MIN_DISCOVERY_TIME_MS = 900;

function delay(duration: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function isTutorXQuery(query: string): boolean {
  const normalized = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return (
    normalized.includes("thetutorx") ||
    normalized.includes("the tutorx") ||
    normalized.includes("tutorx")
  );
}

function sourceKind(sourceId: string): DiscoverySourceKind {
  if (sourceId.includes("website")) return "website";
  if (sourceId.includes("facebook")) return "facebook";
  if (sourceId.includes("tiktok")) return "tiktok";
  if (sourceId.includes("youtube")) return "youtube";
  if (sourceId.includes("linkedin")) return "linkedin";
  if (sourceId.includes("-x")) return "x";
  return "other";
}

function findFact(
  facts: ReadonlyArray<{ id: string; value: string }>,
  id: string
): string {
  return facts.find((fact) => fact.id === id)?.value ?? "";
}

/**
 * Loads the supplied workspace JSON and exposes only public-source discovery.
 * Account authorization, private insights and publishing are deliberately not
 * represented as connected because this prototype has no OAuth connector.
 */
export async function discoverOnboardingWorkspace(
  rawQuery: string
): Promise<OnboardingDiscoveryResponse> {
  const query = rawQuery.trim();

  console.group("[HIVE-K onboarding] Tìm nguồn khởi tạo");
  console.info("Truy vấn:", query || "(trống)");

  try {
    const [seedModule] = await Promise.all([
      import("../data/the-tutorx-workspace.json"),
      delay(MIN_DISCOVERY_TIME_MS),
    ]);

    if (!query || !isTutorXQuery(query)) {
      console.info("Không tìm thấy workspace tương ứng trong dữ liệu nguồn.");
      return {
        matched: false,
        query,
        reason:
          "Tôi chưa xác định được nguồn công khai đủ tin cậy từ thông tin này.",
      };
    }

    const seed = seedModule.default;
    const facts = seed.brand.facts;
    const checkedAt = new Date().toISOString();
    const details: BusinessDetails = {
      businessName: seed.workspace.name,
      websiteUrl: seed.workspace.websiteUrl,
      industry: seed.workspace.industry,
      summary: findFact(facts, "fact-mission"),
      address: findFact(facts, "fact-address"),
      phone: findFact(facts, "fact-phone"),
      email: findFact(facts, "fact-email"),
      primaryMarket: "Việt Nam",
      targetAudiences: [
        findFact(facts, "fact-audience-parent"),
        findFact(facts, "fact-audience-tutor"),
      ].filter(Boolean),
      services: [
        findFact(facts, "fact-service-11"),
        findFact(facts, "fact-service-exam"),
      ].filter(Boolean),
      brandVoiceNotes: findFact(facts, "fact-voice"),
    };

    const detailFields = [
      { key: "businessName", label: "Tên thương hiệu", value: details.businessName },
      { key: "websiteUrl", label: "Website", value: details.websiteUrl },
      { key: "industry", label: "Lĩnh vực", value: details.industry },
      { key: "summary", label: "Định hướng", value: details.summary },
      { key: "address", label: "Địa chỉ", value: details.address },
      { key: "phone", label: "Hotline", value: details.phone },
      { key: "email", label: "Email", value: details.email },
      { key: "primaryMarket", label: "Thị trường", value: details.primaryMarket },
      {
        key: "targetAudiences",
        label: "Khách hàng",
        value: details.targetAudiences.join("\n"),
      },
      { key: "services", label: "Dịch vụ", value: details.services.join("\n") },
      {
        key: "brandVoiceNotes",
        label: "Giọng thương hiệu",
        value: details.brandVoiceNotes,
      },
    ];

    const sources: DiscoverySource[] = seed.sources.map((source, index) => ({
      id: source.id,
      kind: sourceKind(source.id),
      label: source.name,
      url: source.url,
      handle: source.url ? source.url.split("/").filter(Boolean).at(-1) ?? null : null,
      status: "found_public",
      connectionCapability: "public_read",
      discoveredFields: index === 0 ? detailFields : [],
      statusMessage:
        "Có thể đọc nội dung công khai; chưa có quyền xem insights hoặc xuất bản.",
      checkedAt,
    }));

    console.info(
      `Đã đọc JSON và tìm thấy ${sources.length} nguồn công khai, ${facts.length} dữ kiện.`
    );

    return {
      matched: true,
      query,
      sources,
      details,
      summary: `Tìm thấy ${sources.length} nguồn công khai liên quan đến ${seed.workspace.name}.`,
    };
  } finally {
    console.groupEnd();
  }
}

export function detailsFromDiscoverySources(
  sources: DiscoverySource[]
): Partial<BusinessDetails> {
  const values = new Map<string, string>();
  for (const source of sources) {
    for (const field of source.discoveredFields) {
      if (!values.has(field.key)) values.set(field.key, field.value);
    }
  }

  const lines = (key: string): string[] =>
    (values.get(key) ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  return {
    businessName: values.get("businessName") ?? "",
    websiteUrl: values.get("websiteUrl") ?? "",
    industry: values.get("industry") ?? "",
    summary: values.get("summary") ?? "",
    address: values.get("address") ?? "",
    phone: values.get("phone") ?? "",
    email: values.get("email") ?? "",
    primaryMarket: values.get("primaryMarket") ?? "",
    targetAudiences: lines("targetAudiences"),
    services: lines("services"),
    brandVoiceNotes: values.get("brandVoiceNotes") ?? "",
  };
}
