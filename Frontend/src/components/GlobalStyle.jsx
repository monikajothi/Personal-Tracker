import React from "react";

export const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Nunito:wght@400;600;700;800&family=Caveat:wght@500;600;700&display=swap');

    .mwt * { box-sizing: border-box; }
    .mwt { font-family: 'Nunito', sans-serif; }
    .mwt .font-display { font-family: 'Fraunces', serif; }
    .mwt .font-hand { font-family: 'Caveat', cursive; }

    .mwt-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
    .mwt-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }

    @keyframes mwt-pop { 0% { transform: scale(0.85); opacity: 0; } 60% { transform: scale(1.05); opacity: 1;} 100% { transform: scale(1); } }
    @keyframes mwt-float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
    @keyframes mwt-drift { 0% { transform: translateX(-10vw); } 100% { transform: translateX(110vw); } }
    @keyframes mwt-sway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
    @keyframes mwt-fadeup { 0% { opacity: 0; transform: translateY(8px);} 100% { opacity: 1; transform: translateY(0);} }
    @keyframes mwt-fade-down { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(10px); } }

    .mwt-anim .mwt-pop { animation: mwt-pop 0.35s ease-out; }
    .mwt-anim .mwt-float { animation: mwt-float 3.5s ease-in-out infinite; }
    .mwt-anim .mwt-sway { animation: mwt-sway 4s ease-in-out infinite; transform-origin: bottom center; }
    .mwt-fadeup { animation: mwt-fadeup 0.4s ease-out; }
    .mwt-fade-down { animation: mwt-fade-down 0.9s ease-out forwards; }
    
    @keyframes mwt-burst {
  0% { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--dist)) scale(0.5); opacity: 0; }
}
    .mwt-anim .mwt-drift { animation: mwt-drift 22s linear infinite; }

    .mwt-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
    .mwt-card:hover { transform: translateY(-2px); }
    .mwt-scrollbar-none::-webkit-scrollbar { display: none; }

    .mwt-cycle-history-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(180, 130, 150, 0.35) transparent;
}

.mwt-cycle-history-scroll::-webkit-scrollbar {
  width: 5px;
}

.mwt-cycle-history-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.mwt-cycle-history-scroll::-webkit-scrollbar-thumb {
  background: rgba(180, 130, 150, 0.28);
  border-radius: 999px;
}

.mwt-cycle-history-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(180, 130, 150, 0.48);
}
  `}</style>
);
