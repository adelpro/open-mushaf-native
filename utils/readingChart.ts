import { isRTL } from './isRTL';
import { isWeb } from './isWeb';

const AR_WEEKDAYS = ['أحد', 'إثنين', 'ثلاث', 'أربع', 'خميس', 'جمعة', 'سبت'];

export function formatLabel(dateStr: string, period: number): string {
  const d = new Date(dateStr);
  if (period <= 7) return AR_WEEKDAYS[d.getDay()];
  if (period <= 30) return d.getDate().toString();
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function shouldShowLabel(
  dateStr: string,
  index: number,
  period: number,
): boolean {
  if (period <= 7) return true;
  if (period <= 30)
    return index % 5 === 0 || index === 0 || index === period - 1;
  const d = new Date(dateStr);
  return d.getDate() === 1 || d.getDate() === 15 || index === period - 1;
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toDateString();
}

export const getPosStyle = (x: number) => {
  if (isWeb) return { left: x };
  return isRTL ? { right: x } : { left: x };
};
