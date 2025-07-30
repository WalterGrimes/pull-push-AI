import type { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  email?: string;
  pushupRecord?: number;
  pullupRecord?: number;
  lastWorkoutDate?: Date;
}

export type AuthUser = User;