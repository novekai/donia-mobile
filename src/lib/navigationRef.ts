// Shared navigation ref so non-component code (push handlers, deep links, …)
// can navigate without going through useNavigation.
import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParams } from '../navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParams>();

export function safeNavigate<T extends keyof RootStackParams>(
  name: T,
  params?: RootStackParams[T],
): void {
  if (!navigationRef.isReady()) return;
  // The type-cast is needed because React Navigation's `navigate` overload
  // doesn't elegantly accept a generic name+params at the same time.
  (navigationRef.navigate as (n: T, p?: RootStackParams[T]) => void)(name, params);
}
