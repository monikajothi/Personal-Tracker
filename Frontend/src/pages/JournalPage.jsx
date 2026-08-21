// import React, {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import { SectionTitle } from "../components/ui.jsx";
// import { starsApi } from "../api/index.js";
// import { resizeImageFile } from "../utils/image.js";

// const STAR_COLORS = [
//   { id: "pink", color: "#ef9caf", soft: "#fbe1e7", label: "Pink", emoji: "🌸" },
//   { id: "sage", color: "#a9c6a2", soft: "#e4eee1", label: "Sage", emoji: "🌿" },
//   { id: "blue", color: "#94bfe1", soft: "#e1eef8", label: "Blue", emoji: "💙" },
//   { id: "yellow", color: "#e6c86f", soft: "#faf1c9", label: "Yellow", emoji: "💛" },
//   { id: "purple", color: "#bca6d4", soft: "#eee5f5", label: "Purple", emoji: "💜" },
// ];

// const PROMPTS = [
//   "What made today a little better?",
//   "What made you smile today?",
//   "What are you proud of today?",
//   "What would you like to remember from today?",
//   "Who made your day a little nicer?",
//   "What is one tiny thing you're grateful for?",
//   "What moment would you happily experience again?",
// ];

// function getColor(id) {
//   return STAR_COLORS.find((c) => c.id === id) || STAR_COLORS[0];
// }

// function formatDate(date) {
//   return new Intl.DateTimeFormat("en-IN", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   }).format(new Date(date));
// }

// function PaperStar({ color = "pink", style = {}, className = "", onClick }) {
//   const c = getColor(color);
//   return (
//     <span
//       className={`paper-star ${className}`}
//       onClick={onClick}
//       role="button"
//       tabIndex={0}
//       onKeyDown={(event) => {
//         if (event.key === "Enter" || event.key === " ") {
//           event.preventDefault();
//           onClick?.(event);
//         }
//       }}
//       style={{ ...style, "--star-color": c.color, "--star-soft": c.soft }}
//       aria-label="Memory star"
//     >
//       <span>★</span>
//     </span>
//   );
// }

// function TornPaper({ children, className = "", style = {}, tape = true, tapeColor = "#d9ad5b" }) {
//   return (
//     <div className={`torn-paper ${className}`} style={style}>
//       <div className="torn-paper-texture" />
//       {tape && <div className="torn-paper-tape" style={{ background: tapeColor }} />}
//       <div className="torn-paper-content">{children}</div>
//     </div>
//   );
// }

// function Jar({ stars, onTap, dropping }) {
//   const visibleStars = stars.slice(0, 24);

//   const positions = [
//     [21, 67, -12], [43, 72, 8], [65, 67, -6], [31, 53, 14], [54, 52, -15], [73, 50, 10],
//     [20, 43, 8], [45, 39, -10], [65, 39, 14], [35, 29, -5], [56, 28, 9], [74, 31, -12],
//     [28, 20, 15], [47, 19, -8], [66, 21, 6], [38, 12, -14], [57, 11, 10], [75, 14, -5],
//     [25, 59, 5], [58, 61, -10], [37, 44, 11], [70, 42, -8], [48, 61, 5], [62, 26, -10],
//   ];

//   return (
//     <div
//       className="jar-wrapper"
//       onClick={onTap}
//       onKeyDown={(event) => {
//         if (event.key === "Enter" || event.key === " ") {
//           event.preventDefault();
//           onTap?.(event);
//         }
//       }}
//       role="button"
//       tabIndex={0}
//       aria-label="Open a random memory"
//       style={{ cursor: "pointer" }}
//     >
//       <div className="jar-glow" />
//       <div className="jar-lid">
//         <div className="jar-lid-lines" />
//       </div>
//       <div className="jar-body">
//         <div className="jar-shine" />
//         {visibleStars.map((star, index) => {
//           const p = positions[index % positions.length];
//           return (
//             <PaperStar
//               key={star._id}
//               color={star.color}
//               className={dropping && index === 0 ? "star-drop" : ""}
//               style={{
//                 left: `${p[0]}%`,
//                 bottom: `${p[1]}%`,
//                 transform: `rotate(${p[2]}deg)`,
//               }}
//             />
//           );
//         })}
//         {stars.length === 0 && <div className="empty-jar-heart">✦</div>}
//       </div>
//       <div className="jar-base" />
//     </div>
//   );
// }

// function AddStarModal({ onClose, onCreated }) {
//   const [text, setText] = useState("");
//   const [color, setColor] = useState("pink");
//   const [photo, setPhoto] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const fileRef = useRef(null);

//   const handlePhoto = (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;
//     if (file.size > 10 * 1024 * 1024) {
//       setError("Please choose a photo smaller than 10 MB.");
//       return;
//     }
//     setPhoto(file);
//     setPreview(URL.createObjectURL(file));
//   };

//   const submit = async () => {
//     if (!text.trim()) {
//       setError("Write one little memory first 🌱");
//       return;
//     }
//     try {
//       setSaving(true);
//       setError("");
//       let photoUrl = null;
//       if (photo) {
//         photoUrl = await resizeImageFile(photo, { maxWidth: 1200, quality: 0.72 });
//       }
//       const star = await starsApi.create({ text: text.trim(), color, photoUrl });
//       onCreated(star);
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Couldn't save your star.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="star-overlay">
//       <TornPaper className="paper-modal torn-paper-modal">
//         <button className="paper-close" onClick={onClose}>×</button>
//         <div className="paper-title">add a star</div>
//         <div className="paper-prompt">{PROMPTS[new Date().getDate() % PROMPTS.length]}</div>

//         <textarea
//           autoFocus
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           maxLength={1000}
//           placeholder="Write a little moment..."
//           className="star-textarea"
//         />
//         <div className="character-count">{text.length}/1000</div>

//         <div className="color-title">choose your star</div>
//         <div className="color-row">
//           {STAR_COLORS.map((c) => (
//             <button
//               key={c.id}
//               onClick={() => setColor(c.id)}
//               className={`color-choice ${color === c.id ? "selected" : ""}`}
//               style={{ "--choice": c.color }}
//             >
//               ★
//             </button>
//           ))}
//         </div>

//         {preview && (
//           <div className="photo-preview">
//             <img src={preview} alt="" />
//             <button onClick={() => { setPhoto(null); setPreview(null); }}>×</button>
//           </div>
//         )}

//         <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
//         <button className="photo-button" onClick={() => fileRef.current?.click()}>📷 add a picture</button>

//         {error && <div className="star-error">{error}</div>}

//         <button className="drop-button" disabled={saving} onClick={submit}>
//           {saving ? "folding your star..." : "⭐ drop it in the jar"}
//         </button>
//       </TornPaper>
//     </div>
//   );
// }

// function MemoryModal({ star, onClose, onAnother }) {
//   if (!star) return null;
//   const c = getColor(star.color);

//   return (
//     <div className="star-overlay">
//       <TornPaper className="memory-paper torn-paper-modal" style={{ "--paper-color": c.soft }}>
//         <button className="paper-close" onClick={onClose}>×</button>
//         <div className="memory-text">"{star.text}"</div>
//         {star.photoUrl && <img className="memory-photo" src={star.photoUrl} alt="" />}
//         <div className="memory-date">{formatDate(star.createdAt)}</div>
//         <div className="memory-actions">
//           <button onClick={onClose}>↩ tuck it back</button>
//           <button onClick={onAnother}>⭐ unfold another</button>
//         </div>
//       </TornPaper>
//     </div>
//   );
// }

// function AllStarsModal({ stars, onClose, onEdit, onDelete }) {
//   const [search, setSearch] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [filterColor, setFilterColor] = useState("all");

//   const filtered = useMemo(() => {
//     return stars.filter((star) => {
//       const text = (star.text || "").toLowerCase();
//       const dateText = formatDate(star.createdAt).toLowerCase();
//       const normalizedSearch = search.toLowerCase();

//       const matchesText =
//         !normalizedSearch ||
//         text.includes(normalizedSearch) ||
//         dateText.includes(normalizedSearch);

//       const starDate = new Date(star.createdAt);
//       const dateMatch =
//         !selectedDate || starDate.toISOString().slice(0, 10) === selectedDate;

//       const matchesColor = filterColor === "all" || star.color === filterColor;

//       return matchesText && dateMatch && matchesColor;
//     });
//   }, [stars, search, selectedDate, filterColor]);

//   return (
//     <div className="star-overlay">
//       <TornPaper className="all-stars-panel torn-paper-modal">
//         <button className="panel-back" onClick={onClose}>← back to jar</button>
//         <div className="all-stars-title">your paper stars</div>
//         <div className="all-stars-count">{stars.length} folded and kept.</div>

//         <div className="search-row">
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="🔎 search memories..."
//             className="star-search"
//           />
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="date-search"
//             aria-label="Filter by date"
//           />
//         </div>

//         <div className="filter-row">
//           <button
//             className={filterColor === "all" ? "filter-active" : ""}
//             onClick={() => setFilterColor("all")}
//           >
//             all
//           </button>
//           {STAR_COLORS.map((c) => (
//             <button
//               key={c.id}
//               className={filterColor === c.id ? "filter-active" : ""}
//               onClick={() => setFilterColor(c.id)}
//             >
//               {c.emoji}
//             </button>
//           ))}
//         </div>

//         {filtered.length === 0 ? (
//           <div className="no-stars">No little memories found. 🌱</div>
//         ) : (
//           <div className="stars-grid">
//             {filtered.map((star) => {
//               const c = getColor(star.color);
//               return (
//                 <div key={star._id} className="memory-card" style={{ "--card-bg": c.soft }}>
//                   {star.photoUrl && <img src={star.photoUrl} alt="" />}
//                   <div className="memory-card-text">{star.text}</div>
//                   <div className="memory-card-date">{formatDate(star.createdAt)}</div>
//                   <div className="memory-card-actions">
//                     <button onClick={() => onEdit(star)}>Edit</button>
//                     <button onClick={() => onDelete(star)}>Delete</button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </TornPaper>
//     </div>
//   );
// }

// function ShareModal({ onClose }) {
//   const [loading, setLoading] = useState(true);
//   const [link, setLink] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let active = true;
//     starsApi
//       .shareLink()
//       .then(({ shareToken }) => {
//         if (!active) return;
//         setLink(`${window.location.origin}/share/jar/${shareToken}`);
//       })
//       .catch((err) => {
//         console.error(err);
//         if (active) setError("Couldn't create your share link.");
//       })
//       .finally(() => {
//         if (active) setLoading(false);
//       });
//     return () => { active = false; };
//   }, []);

//   const copy = async () => {
//     try {
//       await navigator.clipboard.writeText(link);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch {
//       setError("Couldn't copy the link.");
//     }
//   };

//   const share = async () => {
//     if (!link) return;
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: "My little jar of stars ✨",
//           text: "A few happy moments I've kept.",
//           url: link,
//         });
//       } catch {
//         // user cancelled
//       }
//     } else {
//       copy();
//     }
//   };

//   return (
//     <div className="star-overlay">
//       <TornPaper className="share-paper torn-paper-modal">
//         <button className="paper-close" onClick={onClose}>×</button>
//         <div className="paper-title">your jar is ready ✨</div>
//         <p>Share your little collection of happy memories with someone.</p>

//         {loading ? (
//           <div className="share-loading">preparing your jar...</div>
//         ) : error ? (
//           <div className="star-error">{error}</div>
//         ) : (
//           <>
//             <div className="share-link">{link}</div>
//             <button className="drop-button" onClick={copy}>
//               {copied ? "✓ Link copied!" : "Copy link"}
//             </button>
//             <button className="photo-button" onClick={share}>🔗 Share jar</button>
//           </>
//         )}
//       </TornPaper>
//     </div>
//   );
// }

// function EditStarModal({ star, onClose, onSaved }) {
//   const [text, setText] = useState(star.text);
//   const [color, setColor] = useState(star.color);
//   const [saving, setSaving] = useState(false);

//   const save = async () => {
//     if (!text.trim()) return;
//     try {
//       setSaving(true);
//       const updated = await starsApi.update(star._id, {
//         text: text.trim(),
//         color,
//         photoUrl: star.photoUrl,
//       });
//       onSaved(updated);
//     } catch (err) {
//       console.error(err);
//       alert("Couldn't update the star.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="star-overlay">
//       <TornPaper className="paper-modal torn-paper-modal">
//         <button className="paper-close" onClick={onClose}>×</button>
//         <div className="paper-title">unfold & edit</div>

//         <textarea
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           className="star-textarea"
//         />

//         <div className="color-title">star color</div>
//         <div className="color-row">
//           {STAR_COLORS.map((c) => (
//             <button
//               key={c.id}
//               onClick={() => setColor(c.id)}
//               className={`color-choice ${color === c.id ? "selected" : ""}`}
//               style={{ "--choice": c.color }}
//             >
//               ★
//             </button>
//           ))}
//         </div>

//         <button className="drop-button" disabled={saving} onClick={save}>
//           {saving ? "saving..." : "save changes ✨"}
//         </button>
//       </TornPaper>
//     </div>
//   );
// }

// export default function JournalView({ theme }) {
//   // Falls back to the jar's own signature colors if theme isn't passed —
//   // but the header now uses whatever accent/ink the active app theme has,
//   // so this page reads as "part of the tracker," not a bolted-on separate app.
//   const t = theme || { accent: "#3478b9", ink: "#423934" };

//   const [stars, setStars] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [showAdd, setShowAdd] = useState(false);
//   const [showAll, setShowAll] = useState(false);
//   const [showShare, setShowShare] = useState(false);
//   const [memoryStar, setMemoryStar] = useState(null);
//   const [editingStar, setEditingStar] = useState(null);
//   const [dropping, setDropping] = useState(false);

//   const loadStars = async () => {
//     try {
//       setLoading(true);
//       const data = await starsApi.list();
//       setStars(data);
//     } catch (err) {
//       console.error(err);
//       setError("Couldn't load your little jar.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadStars();
//   }, []);

//   const addStar = (star) => {
//     setStars((prev) => [star, ...prev]);
//     setShowAdd(false);
//     setDropping(true);
//     setTimeout(() => setDropping(false), 1100);
//   };

//   const openRandomMemory = () => {
//     if (!stars.length) {
//       setShowAdd(true);
//       return;
//     }
//     const random = stars[Math.floor(Math.random() * stars.length)];
//     setMemoryStar(random);
//   };

//   const unfoldAnother = () => {
//     if (stars.length <= 1) return;
//     let next = memoryStar;
//     while (next?._id === memoryStar?._id) {
//       next = stars[Math.floor(Math.random() * stars.length)];
//     }
//     setMemoryStar(next);
//   };

//   const deleteStar = async (star) => {
//     const confirmed = window.confirm("Let this little memory leave the jar?");
//     if (!confirmed) return;
//     try {
//       await starsApi.remove(star._id);
//       setStars((prev) => prev.filter((s) => s._id !== star._id));
//     } catch (err) {
//       console.error(err);
//       alert("Couldn't delete the star.");
//     }
//   };

//   const saveEditedStar = (updated) => {
//     setStars((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
//     setEditingStar(null);
//   };

//   if (loading) {
//     return <div className="star-page-loading">✨ Filling your little jar...</div>;
//   }

//   return (
//     <div className="star-jar-page">
//       <style>{`
//         /*
//           IMPORTANT: this component intentionally does NOT set its own
//           page-level background/text color anymore. It used to (via
//           --journal-bg / --journal-ink on .star-jar-page), which fought
//           with the tracker's own theme background and made this page
//           render as a visually separate app inside a dark/light shell
//           that didn't match. The parent App.jsx already provides the
//           real page background — this component now just sits inside it,
//           the same way every other page (Dashboard, Garden, etc.) does.

//           The jar + torn-paper cards keep their own warm cream/kraft
//           palette on purpose — that's the "physical scrapbook" identity
//           of this feature — but the page itself no longer overrides the
//           shell around it.
//         */
//         .star-jar-page {
//           position: relative;
//           font-family: Georgia, serif;
//         }

//         .star-jar-header {
//           text-align: center;
//           position: relative;
//           z-index: 2;
//           margin-bottom: 10px;
//         }

//         .star-jar-prompt {
//           font-family: "Courier New", monospace;
//           color: ${t.accent};
//           font-size: clamp(17px, 5vw, 23px);
//           margin-bottom: 7px;
//         }

//         .star-jar-count {
//           font-family: "Courier New", monospace;
//           color: ${t.ink};
//           font-size: 13px;
//         }

//         .jar-wrapper {
//           display: block;
//           position: relative;
//           width: min(240px, 66vw);
//           height: min(300px, 40vh);
//           margin: 12px auto 16px;
//           border: 0;
//           background: transparent;
//           cursor: pointer;
//           padding: 0;
//         }

//         .jar-glow {
//           position: absolute;
//           inset: 35px 10px 0;
//           border-radius: 50%;
//           background: radial-gradient(circle, rgba(255,255,255,.9), rgba(244,221,205,.2) 55%, transparent 72%);
//           filter: blur(10px);
//         }

//         .jar-lid {
//           position: absolute;
//           top: 2px;
//           left: 50%;
//           transform: translateX(-50%);
//           width: 130px;
//           height: 34px;
//           border: 3px solid rgba(130,130,130,.65);
//           border-radius: 12px 12px 8px 8px;
//           background: linear-gradient(rgba(245,245,245,.88), rgba(190,190,190,.35));
//           box-shadow: 0 4px 8px rgba(50,40,30,.12), inset 0 2px 4px rgba(255,255,255,.9);
//           z-index: 3;
//         }

//         .jar-lid-lines {
//           position: absolute;
//           inset: 8px 8px;
//           border-top: 2px solid rgba(100,100,100,.35);
//           border-bottom: 2px solid rgba(100,100,100,.25);
//           opacity: .7;
//         }

//         .jar-body {
//           position: absolute;
//           top: 28px;
//           bottom: 18px;
//           left: 18px;
//           right: 18px;
//           border: 3px solid rgba(150,150,150,.42);
//           border-radius: 48px 48px 65px 65px;
//           background: linear-gradient(90deg, rgba(255,255,255,.58), rgba(235,245,248,.18) 18%, rgba(255,255,255,.15) 50%, rgba(205,225,232,.2) 82%, rgba(255,255,255,.6));
//           box-shadow: inset 7px 0 10px rgba(255,255,255,.7), inset -8px 0 15px rgba(120,150,160,.08), 0 12px 30px rgba(80,70,60,.13);
//           overflow: hidden;
//         }

//         .jar-body::after {
//           content: "";
//           position: absolute;
//           inset: 0;
//           border-radius: inherit;
//           background: linear-gradient(90deg, rgba(255,255,255,.6), transparent 15%, transparent 80%, rgba(255,255,255,.4));
//           pointer-events: none;
//           z-index: 4;
//         }

//         .jar-shine {
//           position: absolute;
//           top: 25px;
//           left: 20px;
//           width: 16px;
//           height: 230px;
//           border-radius: 50%;
//           background: rgba(255,255,255,.38);
//           filter: blur(3px);
//           z-index: 5;
//           pointer-events: none;
//         }

//         .jar-base {
//           position: absolute;
//           bottom: 4px;
//           left: 50%;
//           transform: translateX(-50%);
//           width: 160px;
//           height: 14px;
//           border-radius: 50%;
//           background: rgba(120,100,90,.12);
//           filter: blur(3px);
//         }

//         .paper-star {
//           position: absolute;
//           width: 31px;
//           height: 31px;
//           border: 0;
//           background: transparent;
//           padding: 0;
//           z-index: 2;
//           cursor: pointer;
//           filter: drop-shadow(1px 2px 2px rgba(60,40,30,.16));
//         }

//         .paper-star span {
//           display: block;
//           font-size: 30px;
//           color: var(--star-color);
//           text-shadow: 1px 1px 0 rgba(255,255,255,.7), -1px -1px 0 rgba(100,70,60,.12);
//           transform: rotate(-5deg);
//         }

//         .empty-jar-heart {
//           position: absolute;
//           left: 50%;
//           top: 47%;
//           transform: translate(-50%, -50%);
//           color: #e5a7b5;
//           font-size: 35px;
//           opacity: .6;
//         }

//         .star-drop {
//           animation: starDrop 1s cubic-bezier(.2,.8,.25,1);
//         }

//         @keyframes starDrop {
//           0% { opacity: 0; transform: translateY(-180px) rotate(-30deg) scale(.7); }
//           65% { opacity: 1; transform: translateY(12px) rotate(14deg) scale(1.08); }
//           82% { transform: translateY(-5px) rotate(-7deg) scale(.96); }
//           100% { transform: translateY(0) rotate(4deg) scale(1); }
//         }

//         .jar-wrapper:active { transform: scale(.985); }

//         .star-actions {
//           position: relative;
//           z-index: 3;
//           width: min(280px, 88vw);
//           margin: 0 auto;
//           display: grid;
//           gap: 8px;
//         }

//         .paper-button {
//           border: 0;
//           padding: 10px 14px;
//           background: #dfbb82;
//           color: #4d3826;
//           font-family: "Courier New", monospace;
//           font-size: 12px;
//           cursor: pointer;
//           box-shadow: 2px 3px 7px rgba(70,50,30,.15);
//           clip-path: polygon(0% 16%, 8% 8%, 18% 14%, 30% 5%, 42% 12%, 54% 4%, 64% 14%, 76% 7%, 90% 16%, 100% 20%, 98% 78%, 92% 90%, 82% 82%, 72% 94%, 60% 83%, 48% 96%, 34% 86%, 20% 97%, 9% 88%, 0% 82%);
//           transition: transform .18s ease;
//         }

//         .paper-button:hover { transform: translateY(-2px) rotate(-.5deg); }
//         .paper-button:active { transform: translateY(1px); }

//         .star-page-loading {
//           min-height: 40vh;
//           display: grid;
//           place-items: center;
//           font-family: "Courier New", monospace;
//           color: #7b7068;
//         }

//         .star-error {
//           background: #f8dddd;
//           color: #9a4b4b;
//           padding: 8px 10px;
//           border-radius: 8px;
//           font-size: 12px;
//           margin: 8px 0;
//         }

//         /* Every popup centers on the viewport — add, edit, memory,
//            all-stars, share all use this same overlay. */
//         .star-overlay {
//           position: fixed;
//           inset: 0;
//           z-index: 1000;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 16px;
//           background: rgba(55,45,40,.35);
//           backdrop-filter: blur(3px);
//           -webkit-backdrop-filter: blur(3px);
//           overflow-y: auto;
//         }

//         .torn-paper {
//           position: relative;
//           width: min(92vw, 420px);
//           max-height: calc(100dvh - 32px);
//           box-sizing: border-box;
//           background:
//             radial-gradient(circle at 20% 15%, rgba(255,255,255,.38), transparent 35%),
//             radial-gradient(circle at 85% 80%, rgba(190,170,160,.06), transparent 40%),
//             var(--paper, #f8f1d8);
//           box-shadow: 5px 8px 18px rgba(60,45,35,.16);
//           clip-path: polygon(
//             1% 2%, 8% 1%, 16% 2.2%, 25% 1.2%, 34% 2%, 43% 1%, 52% 2.2%, 61% 1.2%, 70% 2%, 79% 1%, 89% 2%, 98% 1.5%,
//             97% 10%, 98.5% 20%, 97% 30%, 98.3% 40%, 97% 50%, 98% 60%, 97% 70%, 98.2% 80%, 97% 90%, 98% 98%,
//             89% 97%, 80% 98.5%, 70% 97%, 60% 98%, 50% 97%, 40% 98.5%, 30% 97%, 20% 98%, 10% 97%, 2% 98%,
//             1% 90%, 2% 80%, 1% 70%, 2% 60%, 1% 50%, 2% 40%, 1% 30%, 2% 20%, 1% 10%
//           );
//           overflow: visible;
//         }

//         .torn-paper-texture {
//           position: absolute;
//           inset: 0;
//           pointer-events: none;
//           opacity: .15;
//           background-image: radial-gradient(rgba(100,80,70,.14) .5px, transparent .7px);
//           background-size: 5px 5px;
//           mix-blend-mode: multiply;
//         }

//         .torn-paper-content {
//           position: relative;
//           z-index: 2;
//           padding: 12px 18px 12px;
//         }

//         .torn-paper-tape {
//           position: absolute;
//           z-index: 8;
//           top: -5px;
//           left: 50%;
//           width: 105px;
//           height: 23px;
//           transform: translateX(-50%) rotate(-1deg);
//           opacity: .94;
//           box-shadow: 0 2px 4px rgba(70,50,30,.08);
//           clip-path: polygon(2% 8%, 15% 4%, 28% 7%, 42% 3%, 56% 7%, 70% 4%, 84% 7%, 98% 5%, 97% 93%, 84% 96%, 70% 93%, 56% 97%, 42% 93%, 28% 96%, 14% 93%, 2% 95%);
//           background-image: repeating-linear-gradient(90deg, rgba(255,255,255,.13) 0, rgba(255,255,255,.13) 1px, transparent 1px, transparent 4px);
//         }

//         .torn-paper-modal {
//           animation: tornPaperIn 0.32s cubic-bezier(.22,.8,.25,1);
//         }

//         @keyframes tornPaperIn {
//           from { opacity: 0; transform: translateY(15px) rotate(-1.5deg) scale(0.96); }
//           to { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
//         }

//         .paper-modal,
//         .memory-paper,
//         .share-paper {
//           position: relative;
//           width: min(300px, 100%);
//           max-height: 72vh;
//           overflow: auto;
//           padding: 18px 14px 14px;
//           background: #f5eeee;
//           box-shadow: 8px 12px 30px rgba(50,40,30,.2);
//           border: 1px solid rgba(150, 125, 105, 0.12);
//         }

//         .paper-close {
//           position: absolute;
//           top: 12px;
//           right: 15px;
//           border: 0;
//           background: transparent;
//           font-size: 24px;
//           cursor: pointer;
//           color: #555;
//           z-index: 3;
//         }

//         .paper-title {
//           font-family: Georgia, serif;
//           font-size: 22px;
//           color: #3e76b6;
//           text-align: center;
//           margin-bottom: 6px;
//         }

//         .paper-prompt {
//           text-align: center;
//           font-family: "Courier New", monospace;
//           font-size: 11px;
//           line-height: 1.4;
//           margin-bottom: 10px;
//           color: #4b403b;
//         }

//         .star-textarea {
//           width: 100%;
//           min-height: 120px;
//           resize: vertical;
//           box-sizing: border-box;
//           border: 0;
//           outline: 0;
//           padding: 12px;
//           background: repeating-linear-gradient(transparent 0, transparent 24px, rgba(90,120,150,.12) 25px);
//           font-family: "Courier New", monospace;
//           font-size: 14px;
//           line-height: 24px;
//           color: #423934;
//         }

//         .character-count {
//           text-align: right;
//           font-size: 10px;
//           color: #888;
//         }

//         .color-title {
//           font-family: "Courier New", monospace;
//           font-size: 12px;
//           margin: 14px 0 8px;
//         }

//         .color-row {
//           display: flex;
//           gap: 8px;
//           justify-content: center;
//           flex-wrap: wrap;
//         }

//         /* ✨ Animated star choices */
// .color-choice {
//   position: relative;
//   width: 40px;
//   height: 40px;
//   padding: 0;
//   border: none;
//   background: transparent;
//   color: var(--choice);
//   font-size: 27px;
//   line-height: 1;
//   cursor: pointer;

//   display: flex;
//   align-items: center;
//   justify-content: center;

//   filter:
//     drop-shadow(0 0 3px var(--choice))
//     drop-shadow(0 0 6px rgba(255,255,255,.35));

//   animation:
//     star-twinkle 2.2s ease-in-out infinite,
//     star-float 3s ease-in-out infinite;

//   transition:
//     transform .25s ease,
//     filter .25s ease;
// }
// .color-choice:nth-child(2).selected::before {
//   animation-delay: .3s;
// }

// .color-choice:nth-child(3).selected::before {
//   animation-delay: .7s;
// }

// .color-choice:nth-child(4).selected::before {
//   animation-delay: 1.1s;
// }

// .color-choice:nth-child(5).selected::before {
//   animation-delay: 1.5s;
// }

// .color-choice:nth-child(6).selected::before {
//   animation-delay: 1.9s;
// }
  
// /* ✨ Different timing = stars don't blink together */
// .color-choice:nth-child(2) {
//   animation-delay: .35s;
// }

// .color-choice:nth-child(3) {
//   animation-delay: .7s;
// }

// .color-choice:nth-child(4) {
//   animation-delay: 1.05s;
// }

// .color-choice:nth-child(5) {
//   animation-delay: 1.4s;
// }

// .color-choice:nth-child(6) {
//   animation-delay: 1.75s;
// }


// /* 🌟 Gentle blinking + glowing */
// @keyframes star-twinkle {
//   0%,
//   100% {
//     opacity: .65;
//     filter:
//       drop-shadow(0 0 2px var(--choice))
//       drop-shadow(0 0 4px rgba(255,255,255,.25));
//   }

//   45% {
//     opacity: 1;
//     filter:
//       drop-shadow(0 0 4px var(--choice))
//       drop-shadow(0 0 9px var(--choice))
//       drop-shadow(0 0 14px rgba(255,255,255,.45));
//   }

//   55% {
//     opacity: .82;
//   }

//   65% {
//     opacity: 1;
//     filter:
//       drop-shadow(0 0 5px var(--choice))
//       drop-shadow(0 0 12px var(--choice))
//       drop-shadow(0 0 18px rgba(255,255,255,.5));
//   }
// }


// /* 🌙 Tiny floating movement */
// @keyframes star-float {
//   0%,
//   100% {
//     transform: translateY(0) rotate(-3deg) scale(1);
//   }

//   50% {
//     transform: translateY(-3px) rotate(3deg) scale(1.05);
//   }
// }


// /* 💫 Little sparkle dots around every star */
// .color-choice::before,
// .color-choice::after {
//   content: "✦";
//   position: absolute;
//   font-size: 8px;
//   color: #fff;
//   pointer-events: none;

//   opacity: 0;
//   transform: scale(.3);
// }

// /* Left sparkle */
// .color-choice::before {
//   top: 3px;
//   left: 2px;
//   animation: mini-sparkle 2.4s ease-in-out infinite;
// }

// /* Right sparkle */
// .color-choice::after {
//   right: 1px;
//   bottom: 4px;
//   font-size: 6px;
//   animation: mini-sparkle 2.4s ease-in-out infinite .8s;
// }


// @keyframes mini-sparkle {
//   0%,
//   70%,
//   100% {
//     opacity: 0;
//     transform: scale(.3) rotate(0deg);
//   }

//   78% {
//     opacity: 1;
//     transform: scale(1.2) rotate(20deg);
//   }

//   86% {
//     opacity: .8;
//     transform: scale(.8) rotate(45deg);
//   }

//   92% {
//     opacity: 0;
//     transform: scale(.3) rotate(70deg);
//   }
// }


// /* ⭐ Selected star */
// .color-choice.selected {
//   transform: scale(1.18);
  
//   filter:
//     drop-shadow(0 0 5px var(--choice))
//     drop-shadow(0 0 12px var(--choice))
//     drop-shadow(0 0 20px rgba(255,255,255,.65));

//   animation:
//     selected-star-glow 1.4s ease-in-out infinite;
// }


// /* 🌟🌟 INTENSE MAGICAL SELECTED STAR */
// @keyframes selected-star-glow {
//   0%,
//   100% {
//     transform: scale(1.12) rotate(-3deg);

//     filter:
//       drop-shadow(0 0 5px var(--choice))
//       drop-shadow(0 0 12px var(--choice))
//       drop-shadow(0 0 22px var(--choice))
//       drop-shadow(0 0 32px rgba(255,255,255,.45));
//   }

//   20% {
//     transform: scale(1.22) rotate(3deg);

//     filter:
//       drop-shadow(0 0 7px var(--choice))
//       drop-shadow(0 0 16px var(--choice))
//       drop-shadow(0 0 28px var(--choice))
//       drop-shadow(0 0 40px rgba(255,255,255,.65));
//   }

//   35% {
//     transform: scale(1.30) rotate(-5deg);

//     filter:
//       drop-shadow(0 0 9px var(--choice))
//       drop-shadow(0 0 20px var(--choice))
//       drop-shadow(0 0 35px var(--choice))
//       drop-shadow(0 0 50px rgba(255,255,255,.8));
//   }

//   50% {
//     transform: scale(1.16) rotate(4deg);

//     filter:
//       drop-shadow(0 0 4px var(--choice))
//       drop-shadow(0 0 10px var(--choice))
//       drop-shadow(0 0 20px var(--choice));
//   }

//   65% {
//     transform: scale(1.32) rotate(-3deg);

//     filter:
//       drop-shadow(0 0 10px var(--choice))
//       drop-shadow(0 0 24px var(--choice))
//       drop-shadow(0 0 42px var(--choice))
//       drop-shadow(0 0 60px rgba(255,255,255,.9));
//   }

//   80% {
//     transform: scale(1.20) rotate(3deg);

//     filter:
//       drop-shadow(0 0 7px var(--choice))
//       drop-shadow(0 0 18px var(--choice))
//       drop-shadow(0 0 32px var(--choice))
//       drop-shadow(0 0 45px rgba(255,255,255,.65));
//   }
// }


// /* ✨ Hover */
// .color-choice:hover {
//   transform: scale(1.2) rotate(8deg);
//   filter:
//     drop-shadow(0 0 5px var(--choice))
//     drop-shadow(0 0 14px var(--choice))
//     drop-shadow(0 0 22px rgba(255,255,255,.6));
// }


// /* ⭐ Press */
// .color-choice:active {
//   transform: scale(.9);
// }

//         .photo-button {
//           display: block;
//           width: 100%;
//           margin-top: 13px;
//           padding: 11px;
//           border: 0;
//           border-radius: 10px;
//           background: rgba(255,255,255,.7);
//           color: #554940;
//           font-family: "Courier New", monospace;
//           cursor: pointer;
//         }

//         .photo-preview {
//           position: relative;
//           margin-top: 13px;
//         }

//         .photo-preview img {
//           display: block;
//           width: 100%;
//           max-height: 180px;
//           object-fit: cover;
//           border-radius: 10px;
//         }

//         .photo-preview button {
//           position: absolute;
//           right: 6px;
//           top: 6px;
//           border: 0;
//           border-radius: 50%;
//           width: 28px;
//           height: 28px;
//           background: rgba(0,0,0,.55);
//           color: white;
//           cursor: pointer;
//         }

//         .drop-button {
//           width: 100%;
//           margin-top: 10px;
//           padding: 10px;
//           border: 1px solid #bfa48f;
//           border-radius: 12px;
//           background: #eadbcb;
//           color: #514238;
//           font-family: Georgia, serif;
//           font-size: 13px;
//           cursor: pointer;
//           box-shadow: 3px 5px 10px rgba(70,50,30,.13);
//         }

//         .drop-button:disabled { opacity: .55; cursor: wait; }

//         .memory-paper {
//           background: var(--paper-color);
//           text-align: center;
//           padding: 20px 18px 14px;
//         }

//         .memory-text {
//           font-family: "Courier New", monospace;
//           font-size: 15px;
//           line-height: 1.55;
//           color: #443b37;
//           padding: 10px 6px 0;
//         }

//         .memory-photo {
//           width: 100%;
//           max-height: 180px;
//           object-fit: cover;
//           border-radius: 10px;
//           margin-top: 8px;
//         }

//         .memory-date {
//           margin-top: 10px;
//           font-family: "Courier New", monospace;
//           color: #776c65;
//           font-size: 11px;
//         }

//         .memory-actions {
//           display: flex;
//           gap: 8px;
//           margin-top: 12px;
//         }

//         .memory-actions button {
//           flex: 1;
//           padding: 8px 6px;
//           border: 0;
//           border-radius: 10px;
//           background: rgba(255,255,255,.65);
//           cursor: pointer;
//           font-family: "Courier New", monospace;
//           font-size: 10px;
//         }

//         .all-stars-panel {
//           position: relative;
//           width: min(760px, 100%);
//           max-height: 84vh;
//           overflow: auto;
//           padding: 20px 18px 18px;
//           background: #f9f5eb;
//           box-shadow: 8px 12px 35px rgba(50,40,30,.2);
//           border: 1px solid rgba(120, 105, 90, 0.12);
//         }

//         .panel-back {
//           border: 0;
//           background: transparent;
//           cursor: pointer;
//           font-family: "Courier New", monospace;
//           color: #5d5048;
//         }

//         .all-stars-title {
//           text-align: center;
//           font-family: Georgia, serif;
//           color: #3478b9;
//           font-size: 26px;
//           margin-top: 15px;
//         }

//         .all-stars-count {
//           text-align: center;
//           font-family: "Courier New", monospace;
//           margin: 7px 0 18px;
//           font-size: 12px;
//         }

//         .search-row {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 8px;
//           margin-top: 10px;
//         }

//         .star-search,
//         .date-search {
//           box-sizing: border-box;
//           padding: 10px 12px;
//           border: 1px solid rgba(127, 103, 81, 0.25);
//           border-radius: 10px;
//           background: rgba(255,255,255,0.74);
//           outline: none;
//           font-family: "Courier New", monospace;
//           color: #423934;
//         }

//         .star-search { flex: 1 1 160px; }
//         .date-search { flex: 1 1 140px; }

//         .filter-row {
//           display: flex;
//           gap: 7px;
//           margin: 10px 0 17px;
//           flex-wrap: wrap;
//         }

//         .filter-row button {
//           border: 1px solid rgba(127, 103, 81, 0.25);
//           background: rgba(255,255,255,0.7);
//           border-radius: 999px;
//           padding: 6px 11px;
//           cursor: pointer;
//           font-family: "Courier New", monospace;
//           color: #423934;
//         }

//         .filter-row .filter-active {
//           background: #ddc08e;
//           border-color: #c5a46c;
//         }

//         .stars-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
//           gap: 14px;
//         }

//         .memory-card {
//           position: relative;
//           padding: 14px 12px 12px;
//           background: var(--card-bg);
//           min-height: 140px;
//           border-radius: 16px;
//           box-shadow: 0 2px 8px rgba(70,50,30,.08);
//           border: 1px solid rgba(120, 101, 83, 0.12);
//         }

//         .memory-card img {
//           width: 100%;
//           max-height: 120px;
//           object-fit: cover;
//           border-radius: 10px;
//           margin-bottom: 8px;
//         }

//         .memory-card-text {
//           font-family: "Courier New", monospace;
//           font-size: 13px;
//           line-height: 1.5;
//         }

//         .memory-card-date {
//           font-size: 10px;
//           opacity: .55;
//           margin-top: 10px;
//         }

//         .memory-card-actions {
//           display: flex;
//           gap: 7px;
//           margin-top: 10px;
//         }

//         .memory-card-actions button {
//           border: 0;
//           background: rgba(255,255,255,.55);
//           padding: 5px 8px;
//           border-radius: 7px;
//           cursor: pointer;
//           font-size: 10px;
//         }

//         .no-stars {
//           text-align: center;
//           padding: 60px 20px;
//           color: #82766d;
//           font-family: "Courier New", monospace;
//         }

//         .share-paper { text-align: center; }

//         .share-paper p {
//           font-family: "Courier New", monospace;
//           font-size: 13px;
//           line-height: 1.6;
//         }

//         .share-link {
//           word-break: break-all;
//           padding: 12px;
//           border-radius: 10px;
//           background: white;
//           font-family: "Courier New", monospace;
//           font-size: 11px;
//           margin: 15px 0;
//         }

//         .share-loading {
//           padding: 25px;
//           font-family: "Courier New", monospace;
//           font-size: 12px;
//         }

//         @media (max-width: 420px) {
//           .paper-modal, .memory-paper, .share-paper, .all-stars-panel {
//             padding-left: 14px;
//             padding-right: 14px;
//           }
//           .search-row { flex-direction: column; }
//           .star-search, .date-search { flex: 1 1 auto; width: 100%; }
//         }
//       `}</style>

//       <SectionTitle theme={t} sub="Keep the little moments that made your day.">
//         ⭐ Little Jar of Stars
//       </SectionTitle>

//       <div className="star-jar-header">
//         <div className="star-jar-prompt">tap the jar</div>
//         <div className="star-jar-count">
//           {stars.length} {stars.length === 1 ? "star" : "stars"} captured inside.
//         </div>
//       </div>

//       {error && (
//         <div className="star-error" style={{ maxWidth: 350, margin: "10px auto" }}>
//           {error}
//         </div>
//       )}

//       <Jar stars={stars} onTap={openRandomMemory} dropping={dropping} />

//       <div className="star-actions">
//         <button className="paper-button" onClick={() => setShowAdd(true)}>+ add a star</button>
//         <button className="paper-button" onClick={() => setShowAll(true)}>★ view all stars</button>
//         {/* <button className="paper-button" onClick={() => setShowShare(true)}>🔗 share jar</button> */}
//       </div>

//       {showAdd && <AddStarModal onClose={() => setShowAdd(false)} onCreated={addStar} />}

//       {memoryStar && (
//         <MemoryModal star={memoryStar} onClose={() => setMemoryStar(null)} onAnother={unfoldAnother} />
//       )}

//       {showAll && (
//         <AllStarsModal
//           stars={stars}
//           onClose={() => setShowAll(false)}
//           onEdit={(star) => { setShowAll(false); setEditingStar(star); }}
//           onDelete={deleteStar}
//         />
//       )}

//       {editingStar && (
//         <EditStarModal star={editingStar} onClose={() => setEditingStar(null)} onSaved={saveEditedStar} />
//       )}

//       {showShare && <ShareModal onClose={() => setShowShare(false)} />}
//     </div>
//   );
// }

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { SectionTitle } from "../components/ui.jsx";
import { starsApi } from "../api/index.js";
import { resizeImageFile } from "../utils/image.js";
import { getStarsCache, setStarsCache } from "../utils/localStore.js";

const STAR_COLORS = [
  { id: "pink", color: "#ef9caf", soft: "#fbe1e7", label: "Pink", emoji: "🌸" },
  { id: "sage", color: "#a9c6a2", soft: "#e4eee1", label: "Sage", emoji: "🌿" },
  { id: "blue", color: "#94bfe1", soft: "#e1eef8", label: "Blue", emoji: "💙" },
  { id: "yellow", color: "#e6c86f", soft: "#faf1c9", label: "Yellow", emoji: "💛" },
  { id: "purple", color: "#bca6d4", soft: "#eee5f5", label: "Purple", emoji: "💜" },
];

const PROMPTS = [
  "What made today a little better?",
  "What made you smile today?",
  "What are you proud of today?",
  "What would you like to remember from today?",
  "Who made your day a little nicer?",
  "What is one tiny thing you're grateful for?",
  "What moment would you happily experience again?",
];

function getColor(id) {
  return STAR_COLORS.find((c) => c.id === id) || STAR_COLORS[0];
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function PaperStar({ color = "pink", style = {}, className = "", onClick }) {
  const c = getColor(color);
  return (
    <span
      className={`paper-star ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.(event);
        }
      }}
      style={{ ...style, "--star-color": c.color, "--star-soft": c.soft }}
      aria-label="Memory star"
    >
      <span>★</span>
    </span>
  );
}

function TornPaper({ children, className = "", style = {}, tape = true, tapeColor = "#d9ad5b" }) {
  return (
    <div className={`torn-paper ${className}`} style={style}>
      <div className="torn-paper-texture" />
      {tape && <div className="torn-paper-tape" style={{ background: tapeColor }} />}
      <div className="torn-paper-content">{children}</div>
    </div>
  );
}

function Jar({ stars, onTap, dropping }) {
  const visibleStars = stars.slice(0, 24);

  const positions = [
    [21, 67, -12], [43, 72, 8], [65, 67, -6], [31, 53, 14], [54, 52, -15], [73, 50, 10],
    [20, 43, 8], [45, 39, -10], [65, 39, 14], [35, 29, -5], [56, 28, 9], [74, 31, -12],
    [28, 20, 15], [47, 19, -8], [66, 21, 6], [38, 12, -14], [57, 11, 10], [75, 14, -5],
    [25, 59, 5], [58, 61, -10], [37, 44, 11], [70, 42, -8], [48, 61, 5], [62, 26, -10],
  ];

  return (
    <div
      className="jar-wrapper"
      onClick={onTap}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onTap?.(event);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Open a random memory"
      style={{ cursor: "pointer" }}
    >
      <div className="jar-glow" />
      <div className="jar-lid">
        <div className="jar-lid-lines" />
      </div>
      <div className="jar-body">
        <div className="jar-shine" />
        {visibleStars.map((star, index) => {
          const p = positions[index % positions.length];
          return (
            <PaperStar
              key={star._id}
              color={star.color}
              className={dropping && index === 0 ? "star-drop" : ""}
              style={{
                left: `${p[0]}%`,
                bottom: `${p[1]}%`,
                transform: `rotate(${p[2]}deg)`,
              }}
            />
          );
        })}
        {stars.length === 0 && <div className="empty-jar-heart">✦</div>}
      </div>
      <div className="jar-base" />
    </div>
  );
}

function AddStarModal({ onClose, onCreated }) {
  const [text, setText] = useState("");
  const [color, setColor] = useState("pink");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Please choose a photo smaller than 10 MB.");
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!text.trim()) {
      setError("Write one little memory first 🌱");
      return;
    }
    try {
      setSaving(true);
      setError("");
      let photoUrl = null;
      if (photo) {
        photoUrl = await resizeImageFile(photo, { maxWidth: 1200, quality: 0.72 });
      }
      const star = await starsApi.create({ text: text.trim(), color, photoUrl });
      onCreated(star);
    } catch (err) {
      console.error(err);
      setError(err.message || "Couldn't save your star.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="star-overlay">
      <TornPaper className="paper-modal torn-paper-modal">
        <button className="paper-close" onClick={onClose}>×</button>
        <div className="paper-title">add a star</div>
        <div className="paper-prompt">{PROMPTS[new Date().getDate() % PROMPTS.length]}</div>

        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          placeholder="Write a little moment..."
          className="star-textarea"
        />
        <div className="character-count">{text.length}/1000</div>

        <div className="color-title">choose your star</div>
        <div className="color-row">
          {STAR_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              className={`color-choice ${color === c.id ? "selected" : ""}`}
              style={{ "--choice": c.color }}
            >
              ★
            </button>
          ))}
        </div>

        {preview && (
          <div className="photo-preview">
            <img src={preview} alt="" />
            <button onClick={() => { setPhoto(null); setPreview(null); }}>×</button>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
        <button className="photo-button" onClick={() => fileRef.current?.click()}>📷 add a picture</button>

        {error && <div className="star-error">{error}</div>}

        <button className="drop-button" disabled={saving} onClick={submit}>
          {saving ? "folding your star..." : "⭐ drop it in the jar"}
        </button>
      </TornPaper>
    </div>
  );
}

function MemoryModal({ star, onClose, onAnother }) {
  if (!star) return null;
  const c = getColor(star.color);

  return (
    <div className="star-overlay">
      <TornPaper className="memory-paper torn-paper-modal" style={{ "--paper-color": c.soft }}>
        <button className="paper-close" onClick={onClose}>×</button>
        <div className="memory-text">"{star.text}"</div>
        {star.photoUrl && <img className="memory-photo" src={star.photoUrl} alt="" />}
        <div className="memory-date">{formatDate(star.createdAt)}</div>
        <div className="memory-actions">
          <button onClick={onClose}>↩ tuck it back</button>
          <button onClick={onAnother}>⭐ unfold another</button>
        </div>
      </TornPaper>
    </div>
  );
}

function AllStarsModal({ stars, onClose, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [filterColor, setFilterColor] = useState("all");

  const filtered = useMemo(() => {
    return stars.filter((star) => {
      const text = (star.text || "").toLowerCase();
      const dateText = formatDate(star.createdAt).toLowerCase();
      const normalizedSearch = search.toLowerCase();

      const matchesText =
        !normalizedSearch ||
        text.includes(normalizedSearch) ||
        dateText.includes(normalizedSearch);

      const starDate = new Date(star.createdAt);
      const dateMatch =
        !selectedDate || starDate.toISOString().slice(0, 10) === selectedDate;

      const matchesColor = filterColor === "all" || star.color === filterColor;

      return matchesText && dateMatch && matchesColor;
    });
  }, [stars, search, selectedDate, filterColor]);

  return (
    <div className="star-overlay">
      <TornPaper className="all-stars-panel torn-paper-modal">
        <button className="panel-back" onClick={onClose}>← back to jar</button>
        <div className="all-stars-title">your paper stars</div>
        <div className="all-stars-count">{stars.length} folded and kept.</div>

        <div className="search-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔎 search memories..."
            className="star-search"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-search"
            aria-label="Filter by date"
          />
        </div>

        <div className="filter-row">
          <button
            className={filterColor === "all" ? "filter-active" : ""}
            onClick={() => setFilterColor("all")}
          >
            all
          </button>
          {STAR_COLORS.map((c) => (
            <button
              key={c.id}
              className={filterColor === c.id ? "filter-active" : ""}
              onClick={() => setFilterColor(c.id)}
            >
              {c.emoji}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="no-stars">No little memories found. 🌱</div>
        ) : (
          <div className="stars-grid">
            {filtered.map((star) => {
              const c = getColor(star.color);
              return (
                <div key={star._id} className="memory-card" style={{ "--card-bg": c.soft }}>
                  {star.photoUrl && <img src={star.photoUrl} alt="" />}
                  <div className="memory-card-text">{star.text}</div>
                  <div className="memory-card-date">{formatDate(star.createdAt)}</div>
                  <div className="memory-card-actions">
                    <button onClick={() => onEdit(star)}>Edit</button>
                    <button onClick={() => onDelete(star)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </TornPaper>
    </div>
  );
}

function ShareModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    starsApi
      .shareLink()
      .then(({ shareToken }) => {
        if (!active) return;
        setLink(`${window.location.origin}/share/jar/${shareToken}`);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError("Couldn't create your share link.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy the link.");
    }
  };

  const share = async () => {
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My little jar of stars ✨",
          text: "A few happy moments I've kept.",
          url: link,
        });
      } catch {
        // user cancelled
      }
    } else {
      copy();
    }
  };

  return (
    <div className="star-overlay">
      <TornPaper className="share-paper torn-paper-modal">
        <button className="paper-close" onClick={onClose}>×</button>
        <div className="paper-title">your jar is ready ✨</div>
        <p>Share your little collection of happy memories with someone.</p>

        {loading ? (
          <div className="share-loading">preparing your jar...</div>
        ) : error ? (
          <div className="star-error">{error}</div>
        ) : (
          <>
            <div className="share-link">{link}</div>
            <button className="drop-button" onClick={copy}>
              {copied ? "✓ Link copied!" : "Copy link"}
            </button>
            <button className="photo-button" onClick={share}>🔗 Share jar</button>
          </>
        )}
      </TornPaper>
    </div>
  );
}

function EditStarModal({ star, onClose, onSaved }) {
  const [text, setText] = useState(star.text);
  const [color, setColor] = useState(star.color);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!text.trim()) return;
    try {
      setSaving(true);
      const updated = await starsApi.update(star._id, {
        text: text.trim(),
        color,
        photoUrl: star.photoUrl,
      });
      onSaved(updated);
    } catch (err) {
      console.error(err);
      alert("Couldn't update the star.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="star-overlay">
      <TornPaper className="paper-modal torn-paper-modal">
        <button className="paper-close" onClick={onClose}>×</button>
        <div className="paper-title">unfold & edit</div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="star-textarea"
        />

        <div className="color-title">star color</div>
        <div className="color-row">
          {STAR_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              className={`color-choice ${color === c.id ? "selected" : ""}`}
              style={{ "--choice": c.color }}
            >
              ★
            </button>
          ))}
        </div>

        <button className="drop-button" disabled={saving} onClick={save}>
          {saving ? "saving..." : "save changes ✨"}
        </button>
      </TornPaper>
    </div>
  );
}

export default function JournalView({ theme, userId }) {
  // Falls back to the jar's own signature colors if theme isn't passed —
  // but the header now uses whatever accent/ink the active app theme has,
  // so this page reads as "part of the tracker," not a bolted-on separate app.
  const t = theme || { accent: "#3478b9", ink: "#423934" };

  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [memoryStar, setMemoryStar] = useState(null);
  const [editingStar, setEditingStar] = useState(null);
  const [dropping, setDropping] = useState(false);

  const loadStars = async () => {
    const cached = userId ? getStarsCache(userId) : null;

    // Render the cached jar immediately. Network refresh happens underneath.
    if (cached) {
      setStars(cached);
      setLoading(false);
    }

    try {
      const data = await starsApi.list();
      const next = Array.isArray(data) ? data : [];
      setStars(next);
      if (userId) setStarsCache(userId, next);
      setError("");
    } catch (err) {
      console.error(err);
      if (!cached) setError("Couldn't load your little jar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStars();
  }, [userId]);

  const addStar = (star) => {
    setStars((prev) => {
      const next = [star, ...prev];
      if (userId) setStarsCache(userId, next);
      return next;
    });
    setShowAdd(false);
    setDropping(true);
    setTimeout(() => setDropping(false), 1100);
  };

  const openRandomMemory = () => {
    if (!stars.length) {
      setShowAdd(true);
      return;
    }
    const random = stars[Math.floor(Math.random() * stars.length)];
    setMemoryStar(random);
  };

  const unfoldAnother = () => {
    if (stars.length <= 1) return;
    let next = memoryStar;
    while (next?._id === memoryStar?._id) {
      next = stars[Math.floor(Math.random() * stars.length)];
    }
    setMemoryStar(next);
  };

  const deleteStar = async (star) => {
    const confirmed = window.confirm("Let this little memory leave the jar?");
    if (!confirmed) return;
    try {
      await starsApi.remove(star._id);
      setStars((prev) => {
        const next = prev.filter((s) => s._id !== star._id);
        if (userId) setStarsCache(userId, next);
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("Couldn't delete the star.");
    }
  };

  const saveEditedStar = (updated) => {
    setStars((prev) => {
      const next = prev.map((s) => (s._id === updated._id ? updated : s));
      if (userId) setStarsCache(userId, next);
      return next;
    });
    setEditingStar(null);
  };

  if (loading) {
    return <div className="star-page-loading">✨ Filling your little jar...</div>;
  }

  return (
    <div className="star-jar-page">
      <style>{`
        /*
          IMPORTANT: this component intentionally does NOT set its own
          page-level background/text color anymore. It used to (via
          --journal-bg / --journal-ink on .star-jar-page), which fought
          with the tracker's own theme background and made this page
          render as a visually separate app inside a dark/light shell
          that didn't match. The parent App.jsx already provides the
          real page background — this component now just sits inside it,
          the same way every other page (Dashboard, Garden, etc.) does.

          The jar + torn-paper cards keep their own warm cream/kraft
          palette on purpose — that's the "physical scrapbook" identity
          of this feature — but the page itself no longer overrides the
          shell around it.
        */
        .star-jar-page {
          position: relative;
          font-family: Georgia, serif;
        }

        .star-jar-header {
          text-align: center;
          position: relative;
          z-index: 2;
          margin-bottom: 10px;
        }

        .star-jar-prompt {
          font-family: "Courier New", monospace;
          color: ${t.accent};
          font-size: clamp(17px, 5vw, 23px);
          margin-bottom: 7px;
        }

        .star-jar-count {
          font-family: "Courier New", monospace;
          color: ${t.ink};
          font-size: 13px;
        }

        .jar-wrapper {
          display: block;
          position: relative;
          width: min(240px, 66vw);
          height: min(300px, 40vh);
          margin: 12px auto 16px;
          border: 0;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }

        .jar-glow {
          position: absolute;
          inset: 35px 10px 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,.9), rgba(244,221,205,.2) 55%, transparent 72%);
          filter: blur(10px);
        }

        .jar-lid {
          position: absolute;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 130px;
          height: 34px;
          border: 3px solid rgba(130,130,130,.65);
          border-radius: 12px 12px 8px 8px;
          background: linear-gradient(rgba(245,245,245,.88), rgba(190,190,190,.35));
          box-shadow: 0 4px 8px rgba(50,40,30,.12), inset 0 2px 4px rgba(255,255,255,.9);
          z-index: 3;
        }

        .jar-lid-lines {
          position: absolute;
          inset: 8px 8px;
          border-top: 2px solid rgba(100,100,100,.35);
          border-bottom: 2px solid rgba(100,100,100,.25);
          opacity: .7;
        }

        .jar-body {
          position: absolute;
          top: 28px;
          bottom: 18px;
          left: 18px;
          right: 18px;
          border: 3px solid rgba(150,150,150,.42);
          border-radius: 48px 48px 65px 65px;
          background: linear-gradient(90deg, rgba(255,255,255,.58), rgba(235,245,248,.18) 18%, rgba(255,255,255,.15) 50%, rgba(205,225,232,.2) 82%, rgba(255,255,255,.6));
          box-shadow: inset 7px 0 10px rgba(255,255,255,.7), inset -8px 0 15px rgba(120,150,160,.08), 0 12px 30px rgba(80,70,60,.13);
          overflow: hidden;
        }

        .jar-body::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(90deg, rgba(255,255,255,.6), transparent 15%, transparent 80%, rgba(255,255,255,.4));
          pointer-events: none;
          z-index: 4;
        }

        .jar-shine {
          position: absolute;
          top: 25px;
          left: 20px;
          width: 16px;
          height: 230px;
          border-radius: 50%;
          background: rgba(255,255,255,.38);
          filter: blur(3px);
          z-index: 5;
          pointer-events: none;
        }

        .jar-base {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 160px;
          height: 14px;
          border-radius: 50%;
          background: rgba(120,100,90,.12);
          filter: blur(3px);
        }

        .paper-star {
          position: absolute;
          width: 31px;
          height: 31px;
          border: 0;
          background: transparent;
          padding: 0;
          z-index: 2;
          cursor: pointer;
          filter: drop-shadow(1px 2px 2px rgba(60,40,30,.16));
        }

        .paper-star span {
          display: block;
          font-size: 30px;
          color: var(--star-color);
          text-shadow: 1px 1px 0 rgba(255,255,255,.7), -1px -1px 0 rgba(100,70,60,.12);
          transform: rotate(-5deg);
        }

        .empty-jar-heart {
          position: absolute;
          left: 50%;
          top: 47%;
          transform: translate(-50%, -50%);
          color: #e5a7b5;
          font-size: 35px;
          opacity: .6;
        }

        .star-drop {
          animation: starDrop 1s cubic-bezier(.2,.8,.25,1);
        }

        @keyframes starDrop {
          0% { opacity: 0; transform: translateY(-180px) rotate(-30deg) scale(.7); }
          65% { opacity: 1; transform: translateY(12px) rotate(14deg) scale(1.08); }
          82% { transform: translateY(-5px) rotate(-7deg) scale(.96); }
          100% { transform: translateY(0) rotate(4deg) scale(1); }
        }

        .jar-wrapper:active { transform: scale(.985); }

        .star-actions {
          position: relative;
          z-index: 3;
          width: min(280px, 88vw);
          margin: 0 auto;
          display: grid;
          gap: 8px;
        }

        .paper-button {
          border: 0;
          padding: 10px 14px;
          background: #dfbb82;
          color: #4d3826;
          font-family: "Courier New", monospace;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 2px 3px 7px rgba(70,50,30,.15);
          clip-path: polygon(0% 16%, 8% 8%, 18% 14%, 30% 5%, 42% 12%, 54% 4%, 64% 14%, 76% 7%, 90% 16%, 100% 20%, 98% 78%, 92% 90%, 82% 82%, 72% 94%, 60% 83%, 48% 96%, 34% 86%, 20% 97%, 9% 88%, 0% 82%);
          transition: transform .18s ease;
        }

        .paper-button:hover { transform: translateY(-2px) rotate(-.5deg); }
        .paper-button:active { transform: translateY(1px); }

        .star-page-loading {
          min-height: 40vh;
          display: grid;
          place-items: center;
          font-family: "Courier New", monospace;
          color: #7b7068;
        }

        .star-error {
          background: #f8dddd;
          color: #9a4b4b;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 12px;
          margin: 8px 0;
        }

        /* Every popup centers on the viewport — add, edit, memory,
           all-stars, share all use this same overlay. */
        .star-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(55,45,40,.35);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          overflow-y: auto;
        }

        .torn-paper {
          position: relative;
          width: min(92vw, 420px);
          max-height: calc(100dvh - 32px);
          box-sizing: border-box;
          background:
            radial-gradient(circle at 20% 15%, rgba(255,255,255,.38), transparent 35%),
            radial-gradient(circle at 85% 80%, rgba(190,170,160,.06), transparent 40%),
            var(--paper, #f8f1d8);
          box-shadow: 5px 8px 18px rgba(60,45,35,.16);
          clip-path: polygon(
            1% 2%, 8% 1%, 16% 2.2%, 25% 1.2%, 34% 2%, 43% 1%, 52% 2.2%, 61% 1.2%, 70% 2%, 79% 1%, 89% 2%, 98% 1.5%,
            97% 10%, 98.5% 20%, 97% 30%, 98.3% 40%, 97% 50%, 98% 60%, 97% 70%, 98.2% 80%, 97% 90%, 98% 98%,
            89% 97%, 80% 98.5%, 70% 97%, 60% 98%, 50% 97%, 40% 98.5%, 30% 97%, 20% 98%, 10% 97%, 2% 98%,
            1% 90%, 2% 80%, 1% 70%, 2% 60%, 1% 50%, 2% 40%, 1% 30%, 2% 20%, 1% 10%
          );
          overflow: visible;
        }

        .torn-paper-texture {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .15;
          background-image: radial-gradient(rgba(100,80,70,.14) .5px, transparent .7px);
          background-size: 5px 5px;
          mix-blend-mode: multiply;
        }

        .torn-paper-content {
          position: relative;
          z-index: 2;
          padding: 12px 18px 12px;
        }

        .torn-paper-tape {
          position: absolute;
          z-index: 8;
          top: -5px;
          left: 50%;
          width: 105px;
          height: 23px;
          transform: translateX(-50%) rotate(-1deg);
          opacity: .94;
          box-shadow: 0 2px 4px rgba(70,50,30,.08);
          clip-path: polygon(2% 8%, 15% 4%, 28% 7%, 42% 3%, 56% 7%, 70% 4%, 84% 7%, 98% 5%, 97% 93%, 84% 96%, 70% 93%, 56% 97%, 42% 93%, 28% 96%, 14% 93%, 2% 95%);
          background-image: repeating-linear-gradient(90deg, rgba(255,255,255,.13) 0, rgba(255,255,255,.13) 1px, transparent 1px, transparent 4px);
        }

        .torn-paper-modal {
          animation: tornPaperIn 0.32s cubic-bezier(.22,.8,.25,1);
        }

        @keyframes tornPaperIn {
          from { opacity: 0; transform: translateY(15px) rotate(-1.5deg) scale(0.96); }
          to { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
        }

        .paper-modal,
        .memory-paper,
        .share-paper {
          position: relative;
          width: min(300px, 100%);
          max-height: 72vh;
          overflow: auto;
          padding: 18px 14px 14px;
          background: #f5eeee;
          box-shadow: 8px 12px 30px rgba(50,40,30,.2);
          border: 1px solid rgba(150, 125, 105, 0.12);
        }

        .paper-close {
          position: absolute;
          top: 12px;
          right: 15px;
          border: 0;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
          color: #555;
          z-index: 3;
        }

        .paper-title {
          font-family: Georgia, serif;
          font-size: 22px;
          color: #3e76b6;
          text-align: center;
          margin-bottom: 6px;
        }

        .paper-prompt {
          text-align: center;
          font-family: "Courier New", monospace;
          font-size: 11px;
          line-height: 1.4;
          margin-bottom: 10px;
          color: #4b403b;
        }

        .star-textarea {
          width: 100%;
          min-height: 120px;
          resize: vertical;
          box-sizing: border-box;
          border: 0;
          outline: 0;
          padding: 12px;
          background: repeating-linear-gradient(transparent 0, transparent 24px, rgba(90,120,150,.12) 25px);
          font-family: "Courier New", monospace;
          font-size: 14px;
          line-height: 24px;
          color: #423934;
        }

        .character-count {
          text-align: right;
          font-size: 10px;
          color: #888;
        }

        .color-title {
          font-family: "Courier New", monospace;
          font-size: 12px;
          margin: 14px 0 8px;
        }

        .color-row {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* ✨ Animated star choices */
.color-choice {
  position: relative;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--choice);
  font-size: 27px;
  line-height: 1;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  filter:
    drop-shadow(0 0 3px var(--choice))
    drop-shadow(0 0 6px rgba(255,255,255,.35));

  animation:
    star-twinkle 2.2s ease-in-out infinite,
    star-float 3s ease-in-out infinite;

  transition:
    transform .25s ease,
    filter .25s ease;
}
.color-choice:nth-child(2).selected::before {
  animation-delay: .3s;
}

.color-choice:nth-child(3).selected::before {
  animation-delay: .7s;
}

.color-choice:nth-child(4).selected::before {
  animation-delay: 1.1s;
}

.color-choice:nth-child(5).selected::before {
  animation-delay: 1.5s;
}

.color-choice:nth-child(6).selected::before {
  animation-delay: 1.9s;
}
  
/* ✨ Different timing = stars don't blink together */
.color-choice:nth-child(2) {
  animation-delay: .35s;
}

.color-choice:nth-child(3) {
  animation-delay: .7s;
}

.color-choice:nth-child(4) {
  animation-delay: 1.05s;
}

.color-choice:nth-child(5) {
  animation-delay: 1.4s;
}

.color-choice:nth-child(6) {
  animation-delay: 1.75s;
}


/* 🌟 Gentle blinking + glowing */
@keyframes star-twinkle {
  0%,
  100% {
    opacity: .65;
    filter:
      drop-shadow(0 0 2px var(--choice))
      drop-shadow(0 0 4px rgba(255,255,255,.25));
  }

  45% {
    opacity: 1;
    filter:
      drop-shadow(0 0 4px var(--choice))
      drop-shadow(0 0 9px var(--choice))
      drop-shadow(0 0 14px rgba(255,255,255,.45));
  }

  55% {
    opacity: .82;
  }

  65% {
    opacity: 1;
    filter:
      drop-shadow(0 0 5px var(--choice))
      drop-shadow(0 0 12px var(--choice))
      drop-shadow(0 0 18px rgba(255,255,255,.5));
  }
}


/* 🌙 Tiny floating movement */
@keyframes star-float {
  0%,
  100% {
    transform: translateY(0) rotate(-3deg) scale(1);
  }

  50% {
    transform: translateY(-3px) rotate(3deg) scale(1.05);
  }
}


/* 💫 Little sparkle dots around every star */
.color-choice::before,
.color-choice::after {
  content: "✦";
  position: absolute;
  font-size: 8px;
  color: #fff;
  pointer-events: none;

  opacity: 0;
  transform: scale(.3);
}

/* Left sparkle */
.color-choice::before {
  top: 3px;
  left: 2px;
  animation: mini-sparkle 2.4s ease-in-out infinite;
}

/* Right sparkle */
.color-choice::after {
  right: 1px;
  bottom: 4px;
  font-size: 6px;
  animation: mini-sparkle 2.4s ease-in-out infinite .8s;
}


@keyframes mini-sparkle {
  0%,
  70%,
  100% {
    opacity: 0;
    transform: scale(.3) rotate(0deg);
  }

  78% {
    opacity: 1;
    transform: scale(1.2) rotate(20deg);
  }

  86% {
    opacity: .8;
    transform: scale(.8) rotate(45deg);
  }

  92% {
    opacity: 0;
    transform: scale(.3) rotate(70deg);
  }
}


/* ⭐ Selected star */
.color-choice.selected {
  transform: scale(1.18);
  
  filter:
    drop-shadow(0 0 5px var(--choice))
    drop-shadow(0 0 12px var(--choice))
    drop-shadow(0 0 20px rgba(255,255,255,.65));

  animation:
    selected-star-glow 1.4s ease-in-out infinite;
}


/* 🌟🌟 INTENSE MAGICAL SELECTED STAR */
@keyframes selected-star-glow {
  0%,
  100% {
    transform: scale(1.12) rotate(-3deg);

    filter:
      drop-shadow(0 0 5px var(--choice))
      drop-shadow(0 0 12px var(--choice))
      drop-shadow(0 0 22px var(--choice))
      drop-shadow(0 0 32px rgba(255,255,255,.45));
  }

  20% {
    transform: scale(1.22) rotate(3deg);

    filter:
      drop-shadow(0 0 7px var(--choice))
      drop-shadow(0 0 16px var(--choice))
      drop-shadow(0 0 28px var(--choice))
      drop-shadow(0 0 40px rgba(255,255,255,.65));
  }

  35% {
    transform: scale(1.30) rotate(-5deg);

    filter:
      drop-shadow(0 0 9px var(--choice))
      drop-shadow(0 0 20px var(--choice))
      drop-shadow(0 0 35px var(--choice))
      drop-shadow(0 0 50px rgba(255,255,255,.8));
  }

  50% {
    transform: scale(1.16) rotate(4deg);

    filter:
      drop-shadow(0 0 4px var(--choice))
      drop-shadow(0 0 10px var(--choice))
      drop-shadow(0 0 20px var(--choice));
  }

  65% {
    transform: scale(1.32) rotate(-3deg);

    filter:
      drop-shadow(0 0 10px var(--choice))
      drop-shadow(0 0 24px var(--choice))
      drop-shadow(0 0 42px var(--choice))
      drop-shadow(0 0 60px rgba(255,255,255,.9));
  }

  80% {
    transform: scale(1.20) rotate(3deg);

    filter:
      drop-shadow(0 0 7px var(--choice))
      drop-shadow(0 0 18px var(--choice))
      drop-shadow(0 0 32px var(--choice))
      drop-shadow(0 0 45px rgba(255,255,255,.65));
  }
}


/* ✨ Hover */
.color-choice:hover {
  transform: scale(1.2) rotate(8deg);
  filter:
    drop-shadow(0 0 5px var(--choice))
    drop-shadow(0 0 14px var(--choice))
    drop-shadow(0 0 22px rgba(255,255,255,.6));
}


/* ⭐ Press */
.color-choice:active {
  transform: scale(.9);
}

        .photo-button {
          display: block;
          width: 100%;
          margin-top: 13px;
          padding: 11px;
          border: 0;
          border-radius: 10px;
          background: rgba(255,255,255,.7);
          color: #554940;
          font-family: "Courier New", monospace;
          cursor: pointer;
        }

        .photo-preview {
          position: relative;
          margin-top: 13px;
        }

        .photo-preview img {
          display: block;
          width: 100%;
          max-height: 180px;
          object-fit: cover;
          border-radius: 10px;
        }

        .photo-preview button {
          position: absolute;
          right: 6px;
          top: 6px;
          border: 0;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          background: rgba(0,0,0,.55);
          color: white;
          cursor: pointer;
        }

        .drop-button {
          width: 100%;
          margin-top: 10px;
          padding: 10px;
          border: 1px solid #bfa48f;
          border-radius: 12px;
          background: #eadbcb;
          color: #514238;
          font-family: Georgia, serif;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 3px 5px 10px rgba(70,50,30,.13);
        }

        .drop-button:disabled { opacity: .55; cursor: wait; }

        .memory-paper {
          background: var(--paper-color);
          text-align: center;
          padding: 20px 18px 14px;
        }

        .memory-text {
          font-family: "Courier New", monospace;
          font-size: 15px;
          line-height: 1.55;
          color: #443b37;
          padding: 10px 6px 0;
        }

        .memory-photo {
          width: 100%;
          max-height: 180px;
          object-fit: cover;
          border-radius: 10px;
          margin-top: 8px;
        }

        .memory-date {
          margin-top: 10px;
          font-family: "Courier New", monospace;
          color: #776c65;
          font-size: 11px;
        }

        .memory-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .memory-actions button {
          flex: 1;
          padding: 8px 6px;
          border: 0;
          border-radius: 10px;
          background: rgba(255,255,255,.65);
          cursor: pointer;
          font-family: "Courier New", monospace;
          font-size: 10px;
        }

        .all-stars-panel {
          position: relative;
          width: min(760px, 100%);
          max-height: 84vh;
          overflow: auto;
          padding: 20px 18px 18px;
          background: #f9f5eb;
          box-shadow: 8px 12px 35px rgba(50,40,30,.2);
          border: 1px solid rgba(120, 105, 90, 0.12);
        }

        .panel-back {
          border: 0;
          background: transparent;
          cursor: pointer;
          font-family: "Courier New", monospace;
          color: #5d5048;
        }

        .all-stars-title {
          text-align: center;
          font-family: Georgia, serif;
          color: #3478b9;
          font-size: 26px;
          margin-top: 15px;
        }

        .all-stars-count {
          text-align: center;
          font-family: "Courier New", monospace;
          margin: 7px 0 18px;
          font-size: 12px;
        }

        .search-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .star-search,
        .date-search {
          box-sizing: border-box;
          padding: 10px 12px;
          border: 1px solid rgba(127, 103, 81, 0.25);
          border-radius: 10px;
          background: rgba(255,255,255,0.74);
          outline: none;
          font-family: "Courier New", monospace;
          color: #423934;
        }

        .star-search { flex: 1 1 160px; }
        .date-search { flex: 1 1 140px; }

        .filter-row {
          display: flex;
          gap: 7px;
          margin: 10px 0 17px;
          flex-wrap: wrap;
        }

        .filter-row button {
          border: 1px solid rgba(127, 103, 81, 0.25);
          background: rgba(255,255,255,0.7);
          border-radius: 999px;
          padding: 6px 11px;
          cursor: pointer;
          font-family: "Courier New", monospace;
          color: #423934;
        }

        .filter-row .filter-active {
          background: #ddc08e;
          border-color: #c5a46c;
        }

        .stars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 14px;
        }

        .memory-card {
          position: relative;
          padding: 14px 12px 12px;
          background: var(--card-bg);
          min-height: 140px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(70,50,30,.08);
          border: 1px solid rgba(120, 101, 83, 0.12);
        }

        .memory-card img {
          width: 100%;
          max-height: 120px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .memory-card-text {
          font-family: "Courier New", monospace;
          font-size: 13px;
          line-height: 1.5;
        }

        .memory-card-date {
          font-size: 10px;
          opacity: .55;
          margin-top: 10px;
        }

        .memory-card-actions {
          display: flex;
          gap: 7px;
          margin-top: 10px;
        }

        .memory-card-actions button {
          border: 0;
          background: rgba(255,255,255,.55);
          padding: 5px 8px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 10px;
        }

        .no-stars {
          text-align: center;
          padding: 60px 20px;
          color: #82766d;
          font-family: "Courier New", monospace;
        }

        .share-paper { text-align: center; }

        .share-paper p {
          font-family: "Courier New", monospace;
          font-size: 13px;
          line-height: 1.6;
        }

        .share-link {
          word-break: break-all;
          padding: 12px;
          border-radius: 10px;
          background: white;
          font-family: "Courier New", monospace;
          font-size: 11px;
          margin: 15px 0;
        }

        .share-loading {
          padding: 25px;
          font-family: "Courier New", monospace;
          font-size: 12px;
        }

        @media (max-width: 420px) {
          .paper-modal, .memory-paper, .share-paper, .all-stars-panel {
            padding-left: 14px;
            padding-right: 14px;
          }
          .search-row { flex-direction: column; }
          .star-search, .date-search { flex: 1 1 auto; width: 100%; }
        }
      `}</style>

      <SectionTitle theme={t} sub="Keep the little moments that made your day.">
        ⭐ Little Jar of Stars
      </SectionTitle>

      <div className="star-jar-header">
        <div className="star-jar-prompt">tap the jar</div>
        <div className="star-jar-count">
          {stars.length} {stars.length === 1 ? "star" : "stars"} captured inside.
        </div>
      </div>

      {error && (
        <div className="star-error" style={{ maxWidth: 350, margin: "10px auto" }}>
          {error}
        </div>
      )}

      <Jar stars={stars} onTap={openRandomMemory} dropping={dropping} />

      <div className="star-actions">
        <button className="paper-button" onClick={() => setShowAdd(true)}>+ add a star</button>
        <button className="paper-button" onClick={() => setShowAll(true)}>★ view all stars</button>
        {/* <button className="paper-button" onClick={() => setShowShare(true)}>🔗 share jar</button> */}
      </div>

      {showAdd && <AddStarModal onClose={() => setShowAdd(false)} onCreated={addStar} />}

      {memoryStar && (
        <MemoryModal star={memoryStar} onClose={() => setMemoryStar(null)} onAnother={unfoldAnother} />
      )}

      {showAll && (
        <AllStarsModal
          stars={stars}
          onClose={() => setShowAll(false)}
          onEdit={(star) => { setShowAll(false); setEditingStar(star); }}
          onDelete={deleteStar}
        />
      )}

      {editingStar && (
        <EditStarModal star={editingStar} onClose={() => setEditingStar(null)} onSaved={saveEditedStar} />
      )}

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </div>
  );
}