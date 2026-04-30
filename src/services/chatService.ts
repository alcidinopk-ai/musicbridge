/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabase';
import { Message } from '../types';

export const chatService = {
  async sendMessage(senderId: string, recipientId: string, text: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        text,
        timestamp: Date.now()
      });
    if (error) throw error;
    return data;
  },

  subscribeToMessages(userId: string, onMessage: (message: Message) => void) {
    return supabase
      .channel('chat_room')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .subscribe();
  }
};
