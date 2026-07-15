import { InboxPage } from "@/features/inbox/components/inbox-page";

type InboxRouteProps = {
  params: Promise<{ conversationId?: string[] }>;
};

export default async function BusinessInboxRoute({ params }: InboxRouteProps) {
  const { conversationId } = await params;
  return <InboxPage initialConversationId={conversationId?.[0]} />;
}
