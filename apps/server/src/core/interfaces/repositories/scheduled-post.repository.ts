import { IBaseRepository } from '../../common';
import { ScheduledPostRoot } from '../../aggregate-roots/scheduled-post.aggregate';

export interface IScheduledPostRepository extends IBaseRepository<ScheduledPostRoot> {
  findDueForPublishing(now: Date, limit: number): Promise<ScheduledPostRoot[]>;
  findByEnterpriseId(enterpriseId: string): Promise<ScheduledPostRoot[]>;
}

export const SCHEDULED_POST_REPOSITORY = Symbol('IScheduledPostRepository');
