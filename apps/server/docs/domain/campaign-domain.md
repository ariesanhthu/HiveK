# Campaign & Campaign Participant Domain

This document outlines the business rules, state machines, domain aggregates, database models, and CQRS commands/queries for the Campaign and Campaign Participant domains.

---

## 1. Domain Overview

The Campaign domain connects Enterprises with KOLs/KOCs. 
*   **Campaigns** are created by Enterprises (or platform administrators) to recruit KOLs, outline target channels (platform targets), manage budgets, and define collaborator access.
*   **Campaign Participants** represent the assignment and performance tracking of a specific KOL/KOC inside a campaign. This includes scheduling, submitting, and publishing deliverables (outputs) like posts or videos.

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

*   **Allowed Status Transitions**:
    *   `DRAFT` $\rightarrow$ `FINDING_KOL` (Publish campaign for recruitment)
    *   `FINDING_KOL` $\rightarrow$ `IN_PROGRESS` (Start campaign execution)
    *   `IN_PROGRESS` $\rightarrow$ `COMPLETED` (Campaign successfully wrapped up)
    *   `DRAFT` or `FINDING_KOL` $\rightarrow$ `CANCELLED` (Abort campaign before/during recruitment)
*   **Constraints**:
    *   Campaign updates (`update()`) are only permitted while the status is `DRAFT`.
    *   Soft-delete (`softDelete()`) is only allowed in `DRAFT` or `CANCELLED` status.

### B. Campaign Participant Status (`EParticipantStatus`)

Manages a KOL's application or invitation lifecycle inside a campaign.

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

*   **Transitions**:
    *   `join()`: `PENDING_APPROVAL` $\rightarrow$ `JOINED`. Records `joinedAt` timestamp.
    *   `reject()`: `PENDING_APPROVAL` or `JOINED` $\rightarrow$ `REJECTED`.
    *   `complete()`: `JOINED` $\rightarrow$ `COMPLETED`.

### C. Output Status (`EOutputStatus`)

Deliverable workflow for content posted by KOLs.

*   `DRAFT`: Created but not yet processed.
*   `SCHEDULED`: Deliverable is finalized and scheduled for future posting (needs `scheduledAt` date).
*   `PUBLISHED`: Deliverable is live on the target platform (requires `url` and `postedAt` timestamp).
*   `FAILED`: Delivery failure.

---

## 3. Core Aggregate Roots

### A. CampaignRoot (`src/core/aggregate-roots/campaign.aggregate.ts`)

Encapsulates metadata, target metrics, and collaborator permissions.

*   **Properties**:
    *   `ownerId` (string): User ID of the campaign owner.
    *   `enterpriseId` (string | null): The target enterprise.
    *   `budget` (number): Allocated campaign budget.
    *   `financialTarget` (Record): Target conversions, sales, or clicks.
    *   `description` (string): Description and guidelines.
    *   `platformTarget` (Array): Target platforms, follower ranges (`minFollowers`, `maxFollowers`), and custom criteria.
    *   `collaboratorIds` (string[]): Collaborator User IDs. Starts with `[ownerId]`.
    *   `rawContents` (Array): Scraped documents or briefs (`fileId`, `rawContent`).
*   **Business Methods**:
    *   `update(props)`: Restricts modification if campaign status is not `DRAFT`.
    *   `updateStatus(newStatus)`: Asserts valid state transitions.
    *   `inviteCollaborator(userId, requestedBy)`: Allows the campaign owner to add collaborators.
    *   `revokeCollaborator(userId, requestedBy)`: Allows the owner to remove collaborators (owner cannot be revoked).

### B. CampaignParticipantRoot (`src/core/aggregate-roots/campaign-participant.aggregate.ts`)

Represents the contractual link between a Campaign and a KOL profile.

*   **Properties**:
    *   `campaignId` (string)
    *   `kolProfileId` (string)
    *   `status` (`EParticipantStatus`)
    *   `joinedAt` (Date | null)
    *   `outputs` (`CampaignOutput[]`): Sub-entities containing deliverables.
*   **Business Methods**:
    *   `join()` / `reject()` / `complete()`: Transitions the participant state.
    *   `addOutput(output)`: Inserts a deliverable. Automatically defaults status to `SCHEDULED` if scheduled, or `PUBLISHED` if immediately live.
    *   `publishOutput(outputId, url)`: Publishes a previously scheduled output.
    *   `setOutputFileId(outputId, fileId)`: Links an uploaded media artifact to the output.
    *   `update(props)` / `softDelete(deletedBy)` / `updateOutputs(outputs)`:
        *   **Critical Guard Rule**: Once any output in the participant's records transitions to `PUBLISHED`, the participant properties, outputs, and deletion states are locked. Modifications/deletions of published outputs will throw an `InvalidOperationException`.

---

## 4. CQRS Commands & Queries

### A. Commands (Write Operations)

| Component | Command Class | Responsibility |
| :--- | :--- | :--- |
| **Campaign** | `CreateCampaignCommand` | Creates a new campaign in `DRAFT` status. |
| | `UpdateCampaignCommand` | Updates draft campaign properties. |
| | `UpdateCampaignStatusCommand` | Transitions campaign status (e.g., to `FINDING_KOL`). |
| | `InviteCampaignCollaboratorCommand` | Invites a user as a collaborator. |
| | `RevokeCampaignCollaboratorCommand` | Revokes a collaborator's access. |
| | `SoftDeleteCampaignCommand` | Flags a campaign as deleted (draft/cancelled only). |
| | `RestoreCampaignCommand` | Recovers a soft-deleted campaign. |
| **Participant** | `CreateCampaignParticipantCommand` | Registers a KOL to a campaign (must be in recruitment state). |
| | `UpdateCampaignParticipantCommand` | Updates participant metadata/outputs. |
| | `UpdateCampaignParticipantStatusCommand` | Links or transitions states (Join/Reject/Complete). |
| | `SoftDeleteCampaignParticipantCommand` | Soft deletes participant if no outputs are published. |
| | `RestoreCampaignParticipantCommand` | Recovers a soft-deleted participant record. |

### B. Queries (Read Operations)

*   `GetCampaignByIdQuery` / `ListCampaignsQuery`
*   `GetCampaignParticipantByIdQuery` / `ListCampaignParticipantsQuery`

*Note: All queries bypass the repositories and directly call `MongoCampaignReadService` or `MongoCampaignParticipantReadService` to fetch flat DTO schemas (e.g. `CampaignDetailDto`, `CampaignParticipantDto`).*

---

## 5. Persistence Models (Mongoose)

### A. Campaign Schema (`src/infrastructure/mongo/schemas/campaign.schema.ts`)
Maps `CampaignRoot` parameters to the `campaigns` collection. Sub-models include `PlatformTargetItemModel` and `RawContentItemModel`.

### B. Campaign Participant Schema (`src/infrastructure/mongo/schemas/campaign-participant.schema.ts`)
Maps `CampaignParticipantRoot` to the `campaign_participants` collection. Houses the subschema `CampaignOutputSchema` representing the list of outputs.
