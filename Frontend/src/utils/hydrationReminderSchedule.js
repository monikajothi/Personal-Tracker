export function resolveHydrationRepeatMin(hydrationSettings = {}) {
  const explicitRepeat = Number(hydrationSettings?.repeatEveryMin);

  if (Number.isFinite(explicitRepeat) && explicitRepeat > 0) {
    return explicitRepeat;
  }

  const fallbackRepeat = Number(hydrationSettings?.minIntervalMin);

  if (Number.isFinite(fallbackRepeat) && fallbackRepeat > 0) {
    return fallbackRepeat;
  }

  return 30;
}
