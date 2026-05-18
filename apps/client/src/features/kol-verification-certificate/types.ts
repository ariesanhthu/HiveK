export type VerificationCompetency = {
  key: "authentic" | "impact" | "history";
  title: string;
  subtext: string;
};

export type VerificationCheckItem = {
  id: string;
  label: string;
  passed: boolean;
};

export type PartnerFeedback = {
  id: string;
  quote: string;
  partnerName: string;
  rating: string;
};

export type KolVerificationCertificate = {
  slug: string;
  displayName: string;
  roleLabel: string;
  verificationId: string;
  issueDateLabel: string;
  aggregateRating: number;
  avatarUrl: string;
  competencies: VerificationCompetency[];
  checks: VerificationCheckItem[];
  partnerFeedback: PartnerFeedback[];
  issuingAuthority: string;
  digitalSignatureLabel: string;
  signatureHash: string;
};
