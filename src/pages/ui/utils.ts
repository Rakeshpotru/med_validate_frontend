export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
import { type ClassValue, clsx } from 'clsx';

export function cn1(...inputs: ClassValue[]) {
  return clsx(inputs);
}
