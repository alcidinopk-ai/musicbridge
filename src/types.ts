/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string;
}

export interface ChordNote {
  note: string;
  timestamp: number;
  duration: number;
}

export interface Score {
  id: string;
  title: string;
  artist: string;
  youtube_url: string;
  chords: ChordNote[];
  created_at: string;
}

export interface Class {
  id: string;
  teacher_id: string;
  title: string;
  description: string;
  students: string[];
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  text: string;
  timestamp: number;
}
