# Ubiquitous Language Glossary

| Term | Domain | Definition | Class / Enum Representation |
|------|--------|------------|-----------------------------|
| Campaign | Campaign | A marketing collaboration between an Enterprise and KOLs | `CampaignRoot` |
| Campaign Participant | Campaign | A KOL's participation record within a campaign | `CampaignParticipantEntity` |
| Campaign Proposal | Campaign | A KOL's bid/proposal to join a campaign | `CampaignProposalRoot` |
| KOL / KOC | Auth | Key Opinion Leader / Key Opinion Consumer (content creator) | `KOLUserRoot`, `KolProfileRoot` |
| Enterprise | Enterprise | A brand or advertiser running campaigns | `EnterpriseRoot` |
| Enterprise User | Auth | A user belonging to an enterprise | `EnterpriseUserRoot` |
| Social Page | Social Page | A connected social media account (Facebook, Instagram, Threads) | `SocialPageRoot` |
| Scheduled Post | Scheduled Post | A content post scheduled for publication on a social platform | `ScheduledPostRoot` |
| Subscription | Subscription | A billing plan governing quota and feature access | `SubscriptionRoot` |
| Quota Usage | Subscription | Tracked consumption of subscription resources | `QuotaUsageRoot` |
| Credit Wallet | Subscription | Prepaid credit balance for pay-per-use billing | `CreditWalletRoot` |
| Bill | Billing | An invoice generated from subscription or credit usage | `BillRoot` |
| OTP | Auth | One-Time Password for email verification | `OtpRoot` |
| Public Review | Review | Public feedback/review from enterprises about KOLs | `PublicReviewRoot` |
| Auto Reply Rule | Social Page | Automated response rules for social media comments | `AutoReplyRuleRoot` |
| Platform | Platform | A supported social media platform (Facebook, Instagram, Threads) | `PlatformRoot` |
| Outbox | Tech | Transactional outbox for reliable event delivery | `OutboxModel` |
