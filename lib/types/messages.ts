export type ConversationType = "BUYER_SELLER" | "SELLER_ADMIN" | "BUYER_ADMIN";
export type MessageType = "TEXT" | "IMAGE" | "FILE" | "VOICE" | "SYSTEM";
export type MessageStatus = "SENT" | "DELIVERED" | "READ";
export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface ConversationParticipant {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  storeName?: string;
  storeSlug?: string;
  isVerified?: boolean;
  isOnline: boolean;
  lastSeenAt: string | null;
}

export interface ConversationPreview {
  id: string;
  type: ConversationType;
  subject: string | null;
  orderId: string | null;
  otherParticipant: ConversationParticipant;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    role: UserRole;
  };
  type: MessageType;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  audioDuration: number | null;
  status: MessageStatus;
  readAt: string | null;
  createdAt: string;
}

export interface StartConversationPayload {
  targetUserId: string;
  subject?: string;
  orderId?: string;
}

export interface VoiceUploadResponse {
  url: string;
  duration: number;
}

export interface AdminInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}
