// Birthdays — liste des proches qui fêtent leur anniversaire J / J+1 / J+2.
import { apiGet } from './client';

export type BirthdayPerson = {
  id: string;
  name: string;
  initial: string;
  avatarUrl: string | null;
  phone: string;
  day: 'today' | 'tomorrow' | 'after';
  variant: 'coral' | 'pink' | 'mint' | 'mango' | 'indigo' | 'plum';
};

export function listBirthdays(): Promise<{ people: BirthdayPerson[] }> {
  return apiGet<{ people: BirthdayPerson[] }>('/v1/birthdays');
}
