import { AutoReplyRuleDto } from '@/application/dtos';
import { AutoReplyRuleRoot } from '@/core/aggregate-roots';

export class AutoReplyRuleMapper {
  static toDto(root: AutoReplyRuleRoot): AutoReplyRuleDto {
    return {
      id: root.id!,
      enterpriseId: root.enterpriseId,
      socialPageId: root.socialPageId,
      name: root.name,
      isEnabled: root.isEnabled,
      keywords: root.keywords,
      replyContent: root.replyContent,
      createdAt: root.createdAt,
      updatedAt: root.updatedAt,
    };
  }

  static toListDto(roots: AutoReplyRuleRoot[]): AutoReplyRuleDto[] {
    return roots.map((root) => this.toDto(root));
  }
}
