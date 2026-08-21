// import React from "react";
// import { Row, Stepper, StarRating, Toggle, Chip, inputStyle, TimeInput, emojiPick, SliderRow } from "./ui.jsx";
// import { MOODS } from "../constants.js";

// export function SleepForm({ data, onChange, theme }) {
//   const d = data || {};
//   const calcDuration = (bed, wake) => {
//     if (!bed || !wake) return null;
//     let [bh, bm] = bed.split(":").map(Number);
//     let [wh, wm] = wake.split(":").map(Number);
//     let start = bh * 60 + bm, end = wh * 60 + wm;
//     if (end <= start) end += 24 * 60;
//     return Math.round(((end - start) / 60) * 10) / 10;
//   };
//   const set = (patch) => {
//     const next = { ...d, ...patch };
//     next.duration = calcDuration(next.bed, next.wake);
//     onChange(next);
//   };
//   return (
//     <div style={{ display: "grid", gap: 14 }}>
//       <Row label="Bedtime 🛏️" theme={theme}><TimeInput value={d.bed || ""} onChange={(t) => set({ bed: t })} theme={theme} /></Row>
//       <Row label="Wake-up ⏰" theme={theme}><TimeInput value={d.wake || ""} onChange={(t) => set({ wake: t })} theme={theme} /></Row>
//       {d.duration != null && <div style={{ fontSize: 13, color: theme.ink, opacity: 0.7 }}>💤 Total sleep: <b>{d.duration}h</b></div>}
//       <Row label="Sleep quality ⭐" theme={theme}><StarRating value={d.quality || 0} onChange={(v) => set({ quality: v })} theme={theme} /></Row>
//       <Row label="Night awakenings" theme={theme}><Stepper value={d.awakenings || 0} onChange={(v) => set({ awakenings: v })} theme={theme} max={20} /></Row>
//       <Row label="Energy after waking" theme={theme}>
//         <div style={{ display: "flex", gap: 6 }}>
//           {["😴", "🙂", "⚡"].map((e, i) => <button key={i} onClick={() => set({ energy: i })} style={emojiPick(theme, d.energy === i)}>{e}</button>)}
//         </div>
//       </Row>
//     </div>
//   );
// }

// export function WaterForm({ data, onChange, theme, target, onTargetChange, hydrationTargetMl }) {
//   const glasses = data?.glasses || 0;
//   const pct = Math.min(1, glasses / (target || 8));
//   const stage = pct >= 1 ? "🩵" : pct >= 0.5 ? "💧" : "🥛";
//   const glassMl = Math.round((Number(hydrationTargetMl) || 2000) / 8);
//   return (
//     <div style={{ display: "grid", gap: 14 }}>
//       <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
//         <div style={{ fontSize: 40 }}>{stage}</div>
//         <div style={{ flex: 1 }}>
//           <div style={{ height: 10, borderRadius: 999, background: theme.soft, overflow: "hidden" }}>
//             <div style={{ width: `${pct * 100}%`, height: "100%", background: theme.accent2, transition: "width 0.3s" }} />
//           </div>
//           <div style={{ fontSize: 12.5, marginTop: 4, opacity: 0.7 }}>{glasses} / {target} glasses today</div>
//           <div style={{ fontSize: 11.5, marginTop: 2, opacity: 0.58 }}>1 glass = {glassMl} ml</div>
//         </div>
//       </div>
//       <Stepper value={glasses} onChange={(v) => onChange({ glasses: v })} theme={theme} unit="glasses" max={40} />
//       <Row label="Daily target 🎯" theme={theme}><Stepper value={target} onChange={onTargetChange} theme={theme} unit="glasses" min={1} max={30} /></Row>
//     </div>
//   );
// }

// export function MovementForm({ data, onChange, theme }) {
//   const d = data || {};
//   return (
//     <div style={{ display: "grid", gap: 14 }}>
//       <Row label="Rest day 🌙" theme={theme}><Toggle on={!!d.rest} onClick={() => onChange({ ...d, rest: !d.rest })} theme={theme} /></Row>
//       {!d.rest && (
//         <>
//           <Row label="Type" theme={theme}><input placeholder="walk, gym, yoga, dance…" value={d.type || ""} onChange={(e) => onChange({ ...d, type: e.target.value })} style={inputStyle(theme)} /></Row>
//           <Row label="Duration (min) ⏱️" theme={theme}><Stepper value={d.minutes || 0} onChange={(v) => onChange({ ...d, minutes: v })} theme={theme} unit="min" max={600} /></Row>
//           <Row label="Steps 👣" theme={theme}><input type="number" placeholder="optional" value={d.steps ?? ""} onChange={(e) => onChange({ ...d, steps: e.target.value ? Number(e.target.value) : "" })} style={inputStyle(theme)} /></Row>
//         </>
//       )}
//     </div>
//   );
// }

// export function MoodForm({ data, onChange, theme }) {
//   const d = data || {};
//   return (
//     <div style={{ display: "grid", gap: 14 }}>
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
//         {MOODS.map((m) => (
//           <button key={m.v} onClick={() => onChange({ ...d, mood: m.v })} style={{
//             display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px",
//             borderRadius: 14, border: `1.5px solid ${d.mood === m.v ? theme.accent : theme.border}`,
//             background: d.mood === m.v ? theme.soft : theme.paper, cursor: "pointer",
//           }}>
//             <span style={{ fontSize: 22 }}>{m.e}</span>
//             <span style={{ fontSize: 10.5, fontWeight: 700, color: theme.ink }}>{m.label}</span>
//           </button>
//         ))}
//       </div>
//       <Row label="Energy ⚡" theme={theme}><SliderRow value={d.energy ?? 2} onChange={(v) => onChange({ ...d, energy: v })} theme={theme} /></Row>
//       <Row label="Stress 🧠" theme={theme}><SliderRow value={d.stress ?? 2} onChange={(v) => onChange({ ...d, stress: v })} theme={theme} /></Row>
//       <textarea placeholder="Optional note…" value={d.note || ""} onChange={(e) => onChange({ ...d, note: e.target.value })} style={{ ...inputStyle(theme), minHeight: 60, resize: "vertical" }} />
//     </div>
//   );
// }

// export function CycleForm({ data, onChange, theme }) {
//   const d = data || {};
//   return (
//     <div style={{ display: "grid", gap: 14 }}>
//       <Row label="Period today? 🩸" theme={theme}><Toggle on={!!d.isPeriod} onClick={() => onChange({ ...d, isPeriod: !d.isPeriod })} theme={theme} /></Row>
//       {d.isPeriod && (
//         <>
//           <Row label="Flow" theme={theme}>
//             <div style={{ display: "flex", gap: 6 }}>{["Light", "Medium", "Heavy"].map((f) => <Chip key={f} theme={theme} active={d.flow === f} onClick={() => onChange({ ...d, flow: f })}>{f}</Chip>)}</div>
//           </Row>
//           <Row label="Cramps 😣" theme={theme}>
//             <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["None", "Mild", "Moderate", "Severe"].map((c) => <Chip key={c} theme={theme} active={d.cramps === c} onClick={() => onChange({ ...d, cramps: c })}>{c}</Chip>)}</div>
//           </Row>
//         </>
//       )}
//       <textarea placeholder="Optional note…" value={d.note || ""} onChange={(e) => onChange({ ...d, note: e.target.value })} style={{ ...inputStyle(theme), minHeight: 50 }} />
//       <p style={{ fontSize: 11.5, opacity: 0.55, margin: 0 }}>This section is private and can be hidden from Settings.</p>
//     </div>
//   );
// }

// export function FoodForm({ data, onChange, theme }) {
//   const d = data || {};
//   const boxes = [["veg", "🥬 Vegetables"], ["fruit", "🍎 Fruit"], ["protein", "🥚 Protein"], ["fiber", "🌾 Fiber-rich"]];
//   return (
//     <div style={{ display: "grid", gap: 12 }}>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{boxes.map(([k, label]) => <Chip key={k} theme={theme} active={!!d[k]} onClick={() => onChange({ ...d, [k]: !d[k] })}>{label}</Chip>)}</div>
//       <textarea placeholder="What did I eat today? (brief is fine)" value={d.note || ""} onChange={(e) => onChange({ ...d, note: e.target.value })} style={{ ...inputStyle(theme), minHeight: 70 }} />
//     </div>
//   );
// }

// export function SelfcareForm({ data, onChange, theme }) {
//   const d = data || {};
//   const items = [["am", "🧴 Skincare AM"], ["pm", "🌙 Skincare PM"], ["hair", "💆 Hair care"], ["dental", "🦷 Dental"], ["relax", "🧘 Relaxation"]];
//   return <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{items.map(([k, label]) => <Chip key={k} theme={theme} active={!!d[k]} onClick={() => onChange({ ...d, [k]: !d[k] })}>{label}</Chip>)}</div>;
// }

// export function LearningForm({ data, onChange, theme }) {
//   const d = data || {};
//   return (
//     <div style={{ display: "grid", gap: 14 }}>
//       <Row label="Completed today? ✓" theme={theme}><Toggle on={!!d.done} onClick={() => onChange({ ...d, done: !d.done })} theme={theme} /></Row>
//       <Row label="Time spent (min)" theme={theme}><Stepper value={d.minutes || 0} onChange={(v) => onChange({ ...d, minutes: v })} theme={theme} unit="min" max={600} /></Row>
//       <input placeholder="e.g. DSA, interview prep, project…" value={d.note || ""} onChange={(e) => onChange({ ...d, note: e.target.value })} style={inputStyle(theme)} />
//     </div>
//   );
// }

// export const CATEGORY_FORMS = { sleep: SleepForm, movement: MovementForm, mood: MoodForm, cycle: CycleForm, food: FoodForm, selfcare: SelfcareForm, learning: LearningForm };
import React from "react";
import { Row, Stepper, StarRating, Toggle, Chip, inputStyle, TimeInput, emojiPick, SliderRow } from "./ui.jsx";
import { MOODS } from "../constants.js";

export function SleepForm({ data, onChange, theme }) {
  const d = data || {};
  const calcDuration = (bed, wake) => {
    if (!bed || !wake) return null;
    let [bh, bm] = bed.split(":").map(Number);
    let [wh, wm] = wake.split(":").map(Number);
    let start = bh * 60 + bm, end = wh * 60 + wm;
    if (end <= start) end += 24 * 60;
    return Math.round(((end - start) / 60) * 10) / 10;
  };
  const set = (patch) => {
    const next = { ...d, ...patch };
    next.duration = calcDuration(next.bed, next.wake);
    onChange(next);
  };
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Row label="Bedtime 🛏️" theme={theme}><TimeInput value={d.bed || ""} onChange={(t) => set({ bed: t })} theme={theme} /></Row>
      <Row label="Wake-up ⏰" theme={theme}><TimeInput value={d.wake || ""} onChange={(t) => set({ wake: t })} theme={theme} /></Row>
      {d.duration != null && <div style={{ fontSize: 13, color: theme.ink, opacity: 0.7 }}>💤 Total sleep: <b>{d.duration}h</b></div>}
      <Row label="Sleep quality ⭐" theme={theme}><StarRating value={d.quality || 0} onChange={(v) => set({ quality: v })} theme={theme} /></Row>
      <Row label="Night awakenings" theme={theme}><Stepper value={d.awakenings || 0} onChange={(v) => set({ awakenings: v })} theme={theme} max={20} /></Row>
      <Row label="Energy after waking" theme={theme}>
        <div style={{ display: "flex", gap: 6 }}>
          {["😴", "🙂", "⚡"].map((e, i) => <button key={i} onClick={() => set({ energy: i })} style={emojiPick(theme, d.energy === i)}>{e}</button>)}
        </div>
      </Row>
    </div>
  );
}

export function MovementForm({ data, onChange, theme }) {
  const d = data || {};
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Row label="Rest day 🌙" theme={theme}><Toggle on={!!d.rest} onClick={() => onChange({ ...d, rest: !d.rest })} theme={theme} /></Row>
      {!d.rest && (
        <>
          <Row label="Type" theme={theme}><input placeholder="walk, gym, yoga, dance…" value={d.type || ""} onChange={(e) => onChange({ ...d, type: e.target.value })} style={inputStyle(theme)} /></Row>
          <Row label="Duration (min) ⏱️" theme={theme}><Stepper value={d.minutes || 0} onChange={(v) => onChange({ ...d, minutes: v })} theme={theme} unit="min" max={600} /></Row>
          <Row label="Steps 👣" theme={theme}><input type="number" placeholder="optional" value={d.steps ?? ""} onChange={(e) => onChange({ ...d, steps: e.target.value ? Number(e.target.value) : "" })} style={inputStyle(theme)} /></Row>
        </>
      )}
    </div>
  );
}

export function MoodForm({ data, onChange, theme }) {
  const d = data || {};
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {MOODS.map((m) => (
          <button key={m.v} onClick={() => onChange({ ...d, mood: m.v })} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px",
            borderRadius: 14, border: `1.5px solid ${d.mood === m.v ? theme.accent : theme.border}`,
            background: d.mood === m.v ? theme.soft : theme.paper, cursor: "pointer",
          }}>
            <span style={{ fontSize: 22 }}>{m.e}</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: theme.ink }}>{m.label}</span>
          </button>
        ))}
      </div>
      <Row label="Energy ⚡" theme={theme}><SliderRow value={d.energy ?? 2} onChange={(v) => onChange({ ...d, energy: v })} theme={theme} /></Row>
      <Row label="Stress 🧠" theme={theme}><SliderRow value={d.stress ?? 2} onChange={(v) => onChange({ ...d, stress: v })} theme={theme} /></Row>
      <textarea placeholder="Optional note…" value={d.note || ""} onChange={(e) => onChange({ ...d, note: e.target.value })} style={{ ...inputStyle(theme), minHeight: 60, resize: "vertical" }} />
    </div>
  );
}

export function CycleForm({ data, onChange, theme }) {
  const d = data || {};
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Row label="Period today? 🩸" theme={theme}><Toggle on={!!d.isPeriod} onClick={() => onChange({ ...d, isPeriod: !d.isPeriod })} theme={theme} /></Row>
      {d.isPeriod && (
        <>
          <Row label="Flow" theme={theme}>
            <div style={{ display: "flex", gap: 6 }}>{["Light", "Medium", "Heavy"].map((f) => <Chip key={f} theme={theme} active={d.flow === f} onClick={() => onChange({ ...d, flow: f })}>{f}</Chip>)}</div>
          </Row>
          <Row label="Cramps 😣" theme={theme}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["None", "Mild", "Moderate", "Severe"].map((c) => <Chip key={c} theme={theme} active={d.cramps === c} onClick={() => onChange({ ...d, cramps: c })}>{c}</Chip>)}</div>
          </Row>
        </>
      )}
      <textarea placeholder="Optional note…" value={d.note || ""} onChange={(e) => onChange({ ...d, note: e.target.value })} style={{ ...inputStyle(theme), minHeight: 50 }} />
      <p style={{ fontSize: 11.5, opacity: 0.55, margin: 0 }}>This section is private and can be hidden from Settings.</p>
    </div>
  );
}

export function FoodForm({ data, onChange, theme }) {
  const d = data || {};
  const boxes = [["veg", "🥬 Vegetables"], ["fruit", "🍎 Fruit"], ["protein", "🥚 Protein"], ["fiber", "🌾 Fiber-rich"]];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{boxes.map(([k, label]) => <Chip key={k} theme={theme} active={!!d[k]} onClick={() => onChange({ ...d, [k]: !d[k] })}>{label}</Chip>)}</div>
      <textarea placeholder="What did I eat today? (brief is fine)" value={d.note || ""} onChange={(e) => onChange({ ...d, note: e.target.value })} style={{ ...inputStyle(theme), minHeight: 70 }} />
    </div>
  );
}

export function SelfcareForm({ data, onChange, theme }) {
  const d = data || {};
  const items = [["am", "🧴 Skincare AM"], ["pm", "🌙 Skincare PM"], ["hair", "💆 Hair care"], ["dental", "🦷 Dental"], ["relax", "🧘 Relaxation"]];
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{items.map(([k, label]) => <Chip key={k} theme={theme} active={!!d[k]} onClick={() => onChange({ ...d, [k]: !d[k] })}>{label}</Chip>)}</div>;
}

export function LearningForm({ data, onChange, theme }) {
  const d = data || {};
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Row label="Completed today? ✓" theme={theme}><Toggle on={!!d.done} onClick={() => onChange({ ...d, done: !d.done })} theme={theme} /></Row>
      <Row label="Time spent (min)" theme={theme}><Stepper value={d.minutes || 0} onChange={(v) => onChange({ ...d, minutes: v })} theme={theme} unit="min" max={600} /></Row>
      <input placeholder="e.g. DSA, interview prep, project…" value={d.note || ""} onChange={(e) => onChange({ ...d, note: e.target.value })} style={inputStyle(theme)} />
    </div>
  );
}

export const CATEGORY_FORMS = { sleep: SleepForm, movement: MovementForm, mood: MoodForm, cycle: CycleForm, food: FoodForm, selfcare: SelfcareForm, learning: LearningForm };
