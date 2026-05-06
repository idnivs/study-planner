export function formatDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatDateDisplay(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const wd = weekdays[date.getDay()];
  return `${y}/${m}/${d}  周${wd}`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function today(): string {
  return formatDate();
}
