import { atom } from 'nanostores';

export const selectedConversationId = atom<string | null>(null);

export const selectConversation = (id: string | null) => {
  selectedConversationId.set(id);
}

