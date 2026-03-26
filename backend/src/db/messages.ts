import prisma from "../lib/prisma";

export type PublicMessage = {
  id: string;
  content: string;
  type: string;
  senderEmail: string;
  senderName: string;
  createdAt: string;
};

function toPublicMessage(msg: {
  id: string;
  content: string;
  type: string;
  createdAt: Date;
  sender: { email: string; displayName: string | null };
}): PublicMessage {
  return {
    id: msg.id,
    content: msg.content,
    type: msg.type,
    senderEmail: msg.sender.email,
    senderName: msg.sender.displayName || msg.sender.email,
    createdAt: msg.createdAt.toISOString(),
  };
}

const PAGE_SIZE = 50;

export async function getMessages(
  before?: string,
): Promise<{ messages: PublicMessage[]; hasMore: boolean }> {
  let createdAtCursor: Date | undefined;

  if (before) {
    const cursor = await prisma.message.findUnique({ where: { id: before } });
    if (cursor) createdAtCursor = cursor.createdAt;
  }

  const rows = await prisma.message.findMany({
    where: createdAtCursor ? { createdAt: { lt: createdAtCursor } } : undefined,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    include: {
      sender: { select: { email: true, displayName: true } },
    },
  });

  return {
    messages: rows.reverse().map(toPublicMessage),
    hasMore: rows.length === PAGE_SIZE,
  };
}

export async function createMessage(
  senderId: string,
  content: string,
): Promise<PublicMessage> {
  const message = await prisma.message.create({
    data: { senderId, content },
    include: {
      sender: { select: { email: true, displayName: true } },
    },
  });
  return toPublicMessage(message);
}
