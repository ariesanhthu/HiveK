import { MOCK_INBOX_CONVERSATIONS } from "@/features/inbox/data/mock-inbox";
import type { InboxAdapter, InboxMessage } from "@/features/inbox/types";

function copyConversations() {
  return MOCK_INBOX_CONVERSATIONS.map((conversation) => ({
    ...conversation,
    customer: { ...conversation.customer },
    capabilities: { ...conversation.capabilities },
    tags: [...conversation.tags],
    messages: conversation.messages.map((item) => ({
      ...item,
      evidence: item.evidence ? [...item.evidence] : undefined,
    })),
  }));
}

export const mockInboxAdapter: InboxAdapter = {
  async listConversations() {
    return copyConversations();
  },

  async sendMessage(input) {
    const isNote = input.mode === "note";
    const sentMessage: InboxMessage = {
      id: `message-${input.clientMessageId}`,
      clientMessageId: input.clientMessageId,
      authorType: isNote ? "internal_note" : "current_user",
      authorName: "Anh Thư",
      content: input.content,
      createdAt: new Date().toISOString(),
      deliveryStatus: "delivered",
    };
    return sentMessage;
  },
};
