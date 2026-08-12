import React, {
  useEffect,
  useState,
} from "react";

const STAR_COLORS = {
  pink: "#ef9caf",
  sage: "#a9c6a2",
  blue: "#94bfe1",
  yellow: "#e6c86f",
  purple: "#bca6d4",
};

export default function SharedJarPage({
  token,
}) {
  const [data, setData] =
    useState(null);

  const [selected, setSelected] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetch(
      `/api/stars/share/${token}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Shared jar not found"
          );
        }

        return res.json();
      })
      .then(setData)
      .catch(console.error)
      .finally(() =>
        setLoading(false)
      );
  }, [token]);

  const openRandom = () => {
    if (!data?.stars?.length) return;

    const star =
      data.stars[
        Math.floor(
          Math.random() *
            data.stars.length
        )
      ];

    setSelected(star);
  };

  if (loading) {
    return (
      <div className="shared-loading">
        ✨ opening the little jar...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="shared-loading">
        This jar couldn't be found. 🌱
      </div>
    );
  }

  return (
    <div className="shared-jar">
      <style>{`
        .shared-jar {
          min-height: 100vh;
          background: #f9f6ee;
          color: #423934;
          padding: 40px 20px;
          text-align: center;
          font-family: Georgia, serif;
        }

        .shared-title {
          color: #3478b9;
          font-size: 30px;
          margin-bottom: 8px;
        }

        .shared-count {
          font-family: "Courier New", monospace;
          font-size: 13px;
          margin-bottom: 25px;
        }

        .shared-jar-icon {
          width: 260px;
          height: 320px;
          margin: auto;
          border: 3px solid rgba(140,140,140,.45);
          border-radius: 45px 45px 65px 65px;
          background: rgba(255,255,255,.45);
          box-shadow:
            inset 10px 0 20px rgba(255,255,255,.7),
            0 15px 35px rgba(80,60,50,.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 70px;
          cursor: pointer;
          transition: transform .2s ease;
        }

        .shared-jar-icon:active {
          transform: scale(.97);
        }

        .shared-prompt {
          margin-top: 18px;
          font-family: "Courier New", monospace;
          color: #3478b9;
        }

        .shared-memory {
          position: fixed;
          inset: 0;
          background: rgba(40,30,25,.3);
          backdrop-filter: blur(4px);
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .shared-paper {
          max-width: 440px;
          width: 100%;
          padding: 35px 25px;
          background: #f2e7e7;
          box-shadow: 8px 12px 30px rgba(0,0,0,.18);
        }

        .shared-paper-star {
          font-size: 40px;
          margin-bottom: 15px;
        }

        .shared-memory-text {
          font-family: "Courier New", monospace;
          font-size: 17px;
          line-height: 1.7;
        }

        .shared-memory img {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          border-radius: 10px;
          margin-top: 15px;
        }

        .shared-close {
          margin-top: 20px;
          border: 0;
          padding: 10px 18px;
          border-radius: 10px;
          cursor: pointer;
        }

        .shared-loading {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #f9f6ee;
          font-family: "Courier New", monospace;
        }
      `}</style>

      <div className="shared-title">
        ✨ {data.ownerName}'s little jar
      </div>

      <div className="shared-count">
        {data.starCount}{" "}
        {data.starCount === 1
          ? "star"
          : "stars"}{" "}
        captured inside.
      </div>

      <div
        className="shared-jar-icon"
        onClick={openRandom}
      >
        🫙
      </div>

      <div className="shared-prompt">
        tap the jar
      </div>

      {selected && (
        <div className="shared-memory">
          <div
            className="shared-paper"
            style={{
              background:
                selected.color
                  ? `${STAR_COLORS[selected.color]}33`
                  : "#f2e7e7",
            }}
          >
            <div
              className="shared-paper-star"
              style={{
                color:
                  STAR_COLORS[
                    selected.color
                  ],
              }}
            >
              ★
            </div>

            <div className="shared-memory-text">
              “{selected.text}”
            </div>

            {selected.photoUrl && (
              <img
                src={selected.photoUrl}
                alt=""
              />
            )}

            <button
              className="shared-close"
              onClick={() =>
                setSelected(null)
              }
            >
              tuck it back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}