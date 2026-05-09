/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Page = 'login' | 'dashboard' | 'inventory' | 'staff' | 'settings';

export interface User {
  name: string;
  role: string;
  avatar: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  status: 'Available' | 'Loaned' | 'Missing';
  category: string;
  year: number;
  cover?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  dateJoined: string;
  initials: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: { toDate: () => Date };
  color: string;
}

export interface Admin {
  id: string;
  email: string;
  addedAt: { toDate: () => Date } | null;
}
