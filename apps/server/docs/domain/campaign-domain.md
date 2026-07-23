# Campaign & Campaign Participant Domain

This document outlines the business rules, state machines, domain aggregates, database models, and CQRS commands/queries for the Campaign and Campaign Participant domains.

---

## 1. Domain Overview

The Campaign domain connects Enterprises with KOLs/KOCs.

- **Campaigns** are created by Enterprises (or platform administrators) to recruit KOLs, outline target channels (platform targets), manage budgets, and define collaborator access.
- **Campaign Participants** are nested entities (`CampaignParticipantEntity`) managed inside the **`CampaignRoot`** aggregate. They track the onboarding status and deliverables of a specific KOL/KOC inside a campaign.
- **Campaign Schedule & Outputs** are nested inside `CampaignRoot` to organize and track deliverables (`CampaignKOLOutputEntity` and `CampaignEnterpriseOutputEntity`) on a scheduled calendar timeline.

---

## 2. State Machines & Status Transitions

### A. Campaign Status (`ECampaignStatus`)

A campaign follows a linear state transition, with optional cancellation.

```
       +------------------+
       |      DRAFT       | <------+ (Can be updated/deleted here)
       +------------------+
         |              |
         | (Activate)   | (Cancel)
         v              v
+-------------+   +-----------+
| FINDING_KOL |-->| CANCELLED |
+-------------+   +-----------+
         |
         | (Start)
         v
+-------------+ 
| IN_PROGRESS |
+-------------+
         |
         | (Complete)
         v
+-------------+
|  COMPLETED  |
+-------------+
```

- **Allowed Status Transitions**:
  - `DRAFT` $\rightarrow$ `FINDING_KOL` (Publish campaign for recruitment)
  - `FINDING_KOL` $\rightarrow$ `IN_PROGRESS` (Start campaign execution)
  - `IN_PROGRESS` $\rightarrow$ `COMPLETED` (Campaign successfully wrapped up)
  - `DRAFT` or `FINDING_KOL` $\rightarrow$ `CANCELLED` (Abort campaign before/during recruitment)
- **Constraints**:
  - Campaign updates (`update()`) are only permitted while the status is `DRAFT`.
  - Soft-delete (`softDelete()`) is only allowed in `DRAFT` or `CANCELLED` status.
  - **Active Participants Guard**: A campaign cannot be soft-deleted if it has active (`JOINED` / `COMPLETED`) participants or any outputs that have been `PUBLISHED`.

### B. Campaign Participant Status (`EParticipantStatus`)

Manages a KOL's application or invitation lifecycle. These status transitions are invoked by calling participant lifecycle methods on the parent `CampaignRoot`.

```
      +--------------------+
      |  PENDING_APPROVAL  |
      +--------------------+
        /                \
       / (Join)           \ (Reject)
      v                    v
 +--------+           +----------+
 | JOINED |           | REJECTED |
 +--------+           +----------+
      |
      | (Complete)
      v
+-----------+
| COMPLETED |
+-----------+
```

- **Transitions**:
  - `joinParticipant()`: `PENDING_APPROVAL` $\rightarrow$ `JOINED`. Records `joinedAt` timestamp.
  - `rejectParticipant()`: `PENDING_APPROVAL` or `JOINED` $\rightarrow$ `REJECTED`.
  - `completeParticipant()`: `JOINED` $\rightarrow$ `COMPLETED`.
  - `removeParticipant()`: Permitted only if the participant's status is `REJECTED`. Removes the participant entity from the list.
- **Constraints**:
  - **Published Outputs Guard**: A participant cannot be rejected or soft-deleted if they have already published outputs (status `PUBLISHED`) in the schedule.

### C. Output Status (`EOutputStatus`)

Deliverable workflow for content posted by KOLs or Enterprise collaborators.

- `DRAFT`: Created but not yet processed.
- `SCHEDULED`: Deliverable is finalized and scheduled for future posting (needs `scheduledAt` date).
- `PUBLISHED`: Deliverable is live on the target platform (requires `url` and `postedAt` timestamp).
- `FAILED`: Delivery failure.

---

## 3. Core Aggregate & Entities

### A. CampaignRoot (`src/core/aggregate-roots/campaign.aggregate.ts`)

The root aggregate that encapsulates campaign metadata, target metrics, collaborator permissions, the schedule timeline, and the list of participants.

- **Properties**:
  - `ownerId` (string): User ID of the campaign owner.
  - `enterpriseId` (string): The target enterprise.
  - `budget` (number): Allocated campaign budget.
  - `financialTarget` (Record): Target conversions, sales, or clicks.
  - `description` (string): Description and guidelines.
  - `platformTarget` (Array): Target platforms, follower ranges (`minFollowers`, `maxFollowers`), and custom criteria.
  - `collaboratorIds` (string[]): Collaborator User IDs.
  - `rawContents` (Array): Scraped documents or briefs (`fileId`, `rawContent`).
  - `participants` (`CampaignParticipantEntity[]`): Array of nested participant entities.
  - `schedule` (`CampaignSchedule`): Nested schedule timeline consisting of days and individual platform posts.
- **Domain Actions**:
  - `update(props)`: Restricts modification if campaign status is not `DRAFT`.
  - `updateStatus(newStatus)`: Asserts valid state transitions.
  - `inviteCollaborator(userId, requestedBy)` / `revokeCollaborator(userId, requestedBy)`: Manages collaborators.
  - `addParticipant(...)` / `joinParticipant(...)` / `rejectParticipant(...)` / `completeParticipant(...)`: Mutates nested participant states.
  - `updateKOLOutputs(...)` / `publishOutput(...)` / `setOutputFileId(...)` / `updateTrackingStatus(...)`: Modifies the schedule timeline posts and updates deliverable states. Ensures that published deliverables cannot be deleted.

### B. CampaignParticipantEntity (`src/core/entities/campaign-participant.entity.ts`)

A local entity representing a KOL's relationship and active work scope within the campaign.

- **Properties**:
  - `kolProfileId` (string)
  - `status` (`EParticipantStatus`)
  - `joinedAt` (Date | null)

### C. CampaignKOLOutputEntity (`src/core/entities/campaign-kol-output.entity.ts`)

A local entity representing a specific deliverable to be published by the KOL/KOC.

- **Properties**:
  - `campaignParticipantId` (string)
  - `platformId` (string)
  - `uniqueId` (string | null): The analytics or platform unique identifier for tracking.
  - `outputType` (`EOutputType`): E.g., `video`, `short_video`, `image`.
  - `title` (string)
  - `isScheduleForPost` (boolean)
  - `scheduledAt` (Date | null)
  - `fileId` (string | null): File upload ID.
  - `status` (`EOutputStatus`)
  - `url` (string | null)
  - `postedAt` (Date | null)
  - `isTrackingActive` (boolean)

---

## 4. CQRS Commands & Queries

### A. Commands (Write Operations)

_All participant command handlers fetch the parent `CampaignRoot` via the `CampaignRepository` and delegate mutations directly to the aggregate methods before saving._

| Component       | Command Class                            | Responsibility                                                     |
| :-------------- | :--------------------------------------- | :----------------------------------------------------------------- |
| **Campaign**    | `CreateCampaignCommand`                  | Creates a new campaign in `DRAFT` status.                          |
|                 | `UpdateCampaignCommand`                  | Updates draft campaign properties.                                 |
|                 | `UpdateCampaignStatusCommand`            | Transitions campaign status (e.g., to `FINDING_KOL`).              |
|                 | `InviteCampaignCollaboratorCommand`      | Invites a user as a collaborator.                                  |
|                 | `RevokeCampaignCollaboratorCommand`      | Revokes a collaborator's access.                                   |
|                 | `SoftDeleteCampaignCommand`              | Flags a campaign as deleted (draft/cancelled only).                |
|                 | `RestoreCampaignCommand`                 | Recovers a soft-deleted campaign.                                  |
| **Participant** | `CreateCampaignParticipantCommand`       | Registers a KOL to a campaign (initial state `PENDING_APPROVAL`).  |
|                 | `UpdateCampaignParticipantCommand`       | Updates nested outputs (`updateKOLOutputs`) or participant status. |
|                 | `UpdateCampaignParticipantStatusCommand` | Directly triggers status transition (Join/Reject/Complete).        |
|                 | `SoftDeleteCampaignParticipantCommand`   | Soft deletes participant if no outputs are published.              |
|                 | `RestoreCampaignParticipantCommand`      | Recovers a soft-deleted participant record.                        |

### B. Queries (Read Operations)

- `GetCampaignByIdQuery` / `ListCampaignsQuery`
- `GetCampaignParticipantByIdQuery` / `ListCampaignParticipantsQuery`

_Note: All queries bypass the repositories and directly call `MongoCampaignReadService` or `MongoCampaignParticipantReadService` to fetch flat DTO schemas (e.g. `CampaignDetailDto`, `CampaignParticipantDto`). The participant read service queries the unified `campaigns` collection utilizing MongoDB aggregation pipelines._

---

## 5. Persistence Models (Mongoose)

### Campaign Schema (`src/infrastructure/mongo/schemas/campaign.schema.ts`)

Maps the complete `CampaignRoot` aggregate to the `campaigns` collection. Sub-schemas are nested directly within the document schema:

- **`CampaignParticipantSubSchema`**: Represents individual participants.
- **`CampaignKOLOutputSubSchema`** & **`CampaignEnterpriseOutputSubSchema`**: Represent individual deliverables.
- **`SchedulePostSchema`** & **`ScheduleDaySchema`**: Define the timeline structure.

---

## 6. Comprehensive Persistence Example (JSON representation)

Below is an example of a serialized campaign document showing nested participants, schedule structure, and deliverables:

```json
{
  "_id": "64f7b2c9e8b3c9001f3e4e00",
  "ownerId": "64f7b2c9e8b3c9001f3e4e01",
  "enterpriseId": "64f7b2c9e8b3c9001f3e4e02",
  "budget": 5000,
  "financialTarget": {
    "conversions": 150,
    "targetCTR": 0.05
  },
  "description": "Summer 2026 Promo Campaign for HiveK Platform",
  "platformTarget": [
    {
      "platformId": "64f7b2c9e8b3c9001f3e4e03",
      "minFollowers": 10000,
      "maxFollowers": 100000,
      "note": "TikTok focused creators preferred"
    }
  ],
  "status": "in_progress",
  "collaboratorIds": [ // The Enterprise's collaborator Ids
    "64f7b2c9e8b3c9001f3e4e01",
    "64f7b2c9e8b3c9001f3e4e04"
  ],
  "rawContents": [
    {
      "fileId": "64f7b2c9e8b3c9001f3e4e05",
      "rawContent": "Please read our brand guidelines before drafting videos."
    }
  ],
  "deleteAt": null,
  "deleteBy": null,
  "createdAt": "2026-06-10T08:00:00.000Z",
  "updatedAt": "2026-06-11T09:00:00.000Z",
  "participants": [ // KOLs that join this campaign
    {
      "_id": "64f7b2c9e8b3c9001f3e4e10",
      "kolProfileId": "64f7b2c9e8b3c9001f3e4e11",
      "status": "joined",
      "joinedAt": "2026-06-10T10:30:00.000Z",
      "deleteAt": null,
      "deleteBy": null
    }
  ],
  "schedule": {
    "timeline": [
      {
        "date": "2026-06-15T00:00:00.000Z",
        "label": "Launch Day Posts",
        "posts": [
          {
            "scheduledTime": "2026-06-15T09:00:00.000Z",
            "platformId": "64f7b2c9e8b3c9001f3e4e03",
            "status": "published",
            "campaignKOLOutputs": [
              {
                "_id": "64f7b2c9e8b3c9001f3e4e20",
                "campaignParticipantId": "64f7b2c9e8b3c9001f3e4e10",
                "platformId": "64f7b2c9e8b3c9001f3e4e03",
                "uniqueId": "tiktok_video_789456123",
                "outputType": "short_video",
                "title": "HiveK Summer Unboxing Video",
                "isScheduleForPost": false,
                "scheduledAt": "2026-06-15T09:00:00.000Z",
                "fileId": "64f7b2c9e8b3c9001f3e4e21",
                "status": "published",
                "url": "link_post",
                "postedAt": "2026-06-15T09:05:00.000Z",
                "isTrackingActive": true,
                "createdAt": "2026-06-11T08:30:00.000Z",
                "updatedAt": "2026-06-11T09:00:00.000Z"
              }
            ],
            "campaignEnterpriseOutputs": []
          }
        ]
      }
    ],
    "createdAt": "2026-06-10T08:30:00.000Z",
    "updatedAt": "2026-06-11T09:00:00.000Z"
  }
}
```
