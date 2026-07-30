/*
  Pure functions, easy to unit test — no Express or Mongoose types
  leak in here, they just take/return plain data.
*/

// Group consecutive period days into "cycles" and estimate the next start date.
export function predictNextCycle(entriesByDate) {
  const periodDates = Object.entries(entriesByDate)
    .filter(([, cats]) => cats?.cycle?.isPeriod)
    .map(([date]) => date)
    .sort();

  if (periodDates.length === 0) {
    return { hasEnoughData: false, message: "No period days logged yet." };
  }

  // Collapse consecutive dates into distinct period "starts"
  const starts = [];
  let prev = null;
  for (const d of periodDates) {
    if (!prev || daysBetween(prev, d) > 1) starts.push(d);
    prev = d;
  }

  if (starts.length < 2) {
    return {
      hasEnoughData: false,
      message: "Log at least two periods for a prediction.",
      lastStart: starts[0] || null,
    };
  }

  const cycleLengths = [];
  for (let i = 1; i < starts.length; i++) {
    cycleLengths.push(daysBetween(starts[i - 1], starts[i]));
  }
  const avgLength = Math.round(average(cycleLengths));
  const lastStart = starts[starts.length - 1];
  const predictedNext = addDaysISO(lastStart, avgLength);

  return {
    hasEnoughData: true,
    averageCycleLength: avgLength,
    minCycleLength: Math.min(...cycleLengths),
    maxCycleLength: Math.max(...cycleLengths),
    lastStart,
    predictedNext,
    disclaimer: "Estimate based on your own past entries only — not medical advice.",
  };
}

// Full per-cycle breakdown: each completed cycle's length, estimated ovulation
// day, estimated fertile window, and whether the length falls outside the
// typical 21–35 day range — plus the currently in-progress cycle, if any.
export function buildCycleHistory(entriesByDate) {
  const periodDates = Object.entries(entriesByDate)
    .filter(([, cats]) => cats?.cycle?.isPeriod)
    .map(([date]) => date)
    .sort();

  if (periodDates.length === 0) {
    return { hasData: false, message: "No period days logged yet." };
  }

  const runs = [];
  for (const d of periodDates) {
    const last = runs[runs.length - 1];
    if (last && daysBetween(last.end, d) === 1) {
      last.end = d;
    } else {
      runs.push({ start: d, end: d });
    }
  }

  const completedCycles = [];
  for (let i = 0; i < runs.length - 1; i++) {
    const start = runs[i].start;
    const nextStart = runs[i + 1].start;
    const length = daysBetween(start, nextStart);
    const ovulationDay = addDaysISO(nextStart, -14);
    completedCycles.push({
      start,
      periodEnd: runs[i].end,
      periodDates: periodDates.filter((date) => date >= runs[i].start && date <= runs[i].end),
      end: addDaysISO(nextStart, -1),
      length,
      abnormal: length < 21 || length > 35,
      ovulationDay,
      fertileWindowStart: addDaysISO(ovulationDay, -5),
      fertileWindowEnd: addDaysISO(ovulationDay, 1),
    });
  }

  const lastRun = runs[runs.length - 1];
  const today = new Date().toISOString().slice(0, 10);
  const currentCycle = {
    start: lastRun.start,
    periodEnd: lastRun.end,
    periodDates: periodDates.filter((date) => date >= lastRun.start && date <= lastRun.end),
    daysSoFar: daysBetween(lastRun.start, today) + 1,
  };

  const lengths = completedCycles.map((c) => c.length);
  const averageLength = lengths.length ? Math.round(average(lengths)) : null;

  if (averageLength) {
    const ovulationDay = addDaysISO(currentCycle.start, averageLength - 14);
    currentCycle.ovulationDay = ovulationDay;
    currentCycle.fertileWindowStart = addDaysISO(ovulationDay, -5);
    currentCycle.fertileWindowEnd = addDaysISO(ovulationDay, 1);
  }

  return {
    hasData: true,
    averageLength,
    cycles: completedCycles.slice().reverse(),
    currentCycle,
  };
}

// Pearson correlation between two metrics extracted from entries via getter functions.
// getA/getB take a day's categories object and return a number or null.
export function correlate(entriesByDate, getA, getB) {
  const pairs = Object.values(entriesByDate)
    .map((cats) => [getA(cats), getB(cats)])
    .filter(([a, b]) => typeof a === "number" && typeof b === "number" && !Number.isNaN(a) && !Number.isNaN(b));

  if (pairs.length < 5) {
    return { hasEnoughData: false, message: "Need at least 5 days with both metrics logged." };
  }

  const as = pairs.map((p) => p[0]);
  const bs = pairs.map((p) => p[1]);
  const meanA = average(as), meanB = average(bs);

  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < pairs.length; i++) {
    const da = as[i] - meanA, db = bs[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const denom = Math.sqrt(denA * denB);
  const r = denom === 0 ? 0 : num / denom;

  return {
    hasEnoughData: true,
    sampleSize: pairs.length,
    coefficient: Math.round(r * 100) / 100,
    strength: describeStrength(r),
  };
}

function describeStrength(r) {
  const abs = Math.abs(r);
  if (abs < 0.2) return "little to no relationship";
  if (abs < 0.4) return "a weak relationship";
  if (abs < 0.6) return "a moderate relationship";
  return "a fairly strong relationship";
}

// Plain-language weekly summary from the last 7 days of entries.
export function buildWeeklySummary(last7Entries) {
  const days = Object.values(last7Entries);
  const lines = [];

  const waterDays = days.filter((d) => (d?.water?.glasses || 0) > 0).length;
  if (waterDays > 0) lines.push(`Logged water on ${waterDays} of the last 7 days.`);

  const sleepVals = days.map((d) => d?.sleep?.duration).filter((v) => typeof v === "number");
  if (sleepVals.length) lines.push(`Average sleep this week: ${round1(average(sleepVals))}h.`);

  const moodCounts = {};
  for (const d of days) if (d?.mood?.mood) moodCounts[d.mood.mood] = (moodCounts[d.mood.mood] || 0) + 1;
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  if (topMood) lines.push(`Most common mood this week: ${topMood[0]} (${topMood[1]} day${topMood[1] === 1 ? "" : "s"}).`);

  const movedDays = days.filter((d) => d?.movement && !d.movement.rest && (d.movement.minutes || d.movement.type)).length;
  if (movedDays > 0) lines.push(`Moved/exercised on ${movedDays} of the last 7 days.`);

  if (lines.length === 0) lines.push("Not enough data yet this week — keep logging!");
  return lines;
}

// function daysBetween(a, b) {
//   return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
// }
// function addDaysISO(dateStr, n) {
//   const d = new Date(dateStr + "T00:00:00");
//   d.setDate(d.getDate() + n);
//   return d.toISOString().slice(0, 10);
// }

function daysBetween(a, b) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}
function addDaysISO(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function round1(n) {
  return Math.round(n * 10) / 10;
}
