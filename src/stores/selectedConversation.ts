import { atom } from 'nanostores';

// 建立一個 "atom" (原子狀態)
// 佢會儲存目前被選中嘅 conversation 嘅 ID (string)
// 初始值係 undefined
export const selectedConversationId = atom<string | null>(null);

// (可選) 我哋可以建立一個 action (動作) 嚟方便修改佢
export const selectConversation = (id: string | null) => {
  selectedConversationId.set(id);
}

