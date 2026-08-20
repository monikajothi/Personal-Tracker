export const HYDRATION_GLASSES_PER_DAY = 8;

export function getHydrationTargetMl(settings) {
  return Number(settings?.hydration?.targetMl) || 2000;
}

export function getHydrationGlassMl(settings) {
  return Number(settings?.hydration?.cupMl) || 200;
}

export function glassesToMl(glasses, settings) {
  return (Number(glasses) || 0) * getHydrationGlassMl(settings);
}

export function mlToGlasses(ml, settings) {
  const glassMl = getHydrationGlassMl(settings);
  if (!glassMl) return 0;
  return (Number(ml) || 0) / glassMl;
}
