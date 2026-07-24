export type InitialRoute = '/(first-launch)' | '/(tabs)';

export function getInitialRoute(firstLaunchDone: boolean): InitialRoute {
  return firstLaunchDone ? '/(tabs)' : '/(first-launch)';
}
