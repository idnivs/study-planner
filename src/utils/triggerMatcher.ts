export function shouldTrigger(triggerType: string | null, date: Date = new Date()): boolean {
  if (!triggerType) return false;

  if (triggerType === 'daily') return true;

  if (triggerType.startsWith('weekly,')) {
    const day = parseInt(triggerType.split(',')[1], 10);
    // Python: 0=Mon, 6=Sun; JS getDay(): 0=Sun, 1=Mon
    const jsDow = date.getDay();
    const pyDow = jsDow === 0 ? 6 : jsDow - 1;
    return pyDow === day;
  }

  if (triggerType.startsWith('monthly,')) {
    const dom = parseInt(triggerType.split(',')[1], 10);
    return date.getDate() === dom;
  }

  return false;
}
