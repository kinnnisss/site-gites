/** Illustration décorative vectorielle, sans photographie d’un bien réel. */
export function CottageIllustration({
  palette = "olive",
  className = "",
}: {
  palette?: "olive" | "clay" | "sage";
  className?: string;
}) {
  const colors = {
    olive: {
      sky: "#e8dfc8",
      hill: "#a6ac83",
      roof: "#a76548",
      shutters: "#52664b",
    },
    clay: {
      sky: "#eddacc",
      hill: "#adae8c",
      roof: "#845d4d",
      shutters: "#57787e",
    },
    sage: {
      sky: "#dde3d7",
      hill: "#94aa88",
      roof: "#aa7358",
      shutters: "#657969",
    },
  }[palette];
  return (
    <svg
      viewBox="0 0 800 620"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path fill={colors.sky} d="M0 0h800v620H0z" />
      <circle cx="610" cy="133" r="63" fill="#f9edcb" />
      <path d="M0 300Q160 180 360 310T800 260V620H0Z" fill={colors.hill} />
      <path d="M0 400Q200 250 460 390T800 355V620H0Z" fill="#7e9069" />
      <path d="M0 495Q190 386 420 453T800 433V620H0Z" fill="#b6b48a" />
      <path d="M404 420Q410 508 610 620H325Q327 510 365 420" fill="#e5cfaa" />
      <path d="M204 276h345v192H204z" fill="#eddec1" />
      <path d="M549 276l82 54v138h-82z" fill="#d6c2a0" />
      <path d="M170 283l185-139 217 139z" fill={colors.roof} />
      <path d="M355 144h92l214 186h-92z" fill="#754f3e" />
      <path d="M479 160h29v67h-29z" fill="#d7c1a2" />
      <path d="M343 468v-91a34 34 0 0 1 68 0v91" fill="#775e46" />
      <path d="M245 330h56v70h-56zM453 330h56v70h-56z" fill="#504f3e" />
      <path
        d="M233 328h14v74h-14zM299 328h14v74h-14zM441 328h14v74h-14zM507 328h14v74h-14z"
        fill={colors.shutters}
      />
      <path
        d="M272 330v70m-27-35h56m180-35v70m-28-35h56"
        stroke="#efdfbb"
        strokeWidth="4"
      />
      <path
        d="M125 443V246m-5 104-44-42m49 2 41-37M689 465V304"
        stroke="#6e7050"
        strokeWidth="13"
      />
      <ellipse cx="117" cy="239" rx="85" ry="104" fill="#657953" />
      <ellipse cx="78" cy="285" rx="56" ry="65" fill="#72865f" />
      <ellipse cx="157" cy="288" rx="55" ry="70" fill="#7c8c64" />
      <ellipse cx="690" cy="299" rx="48" ry="108" fill="#526d50" />
      <path d="M183 470q25-52 51 0m272 0q29-65 58 0" fill="#687a53" />
      <g stroke="#817d58" strokeWidth="3">
        <path d="m74 563 9-36m-9 22-12-12m21 2 13-12m600 47 9-36m-9 22-12-12m21 2 13-12" />
      </g>
      <path d="M210 500h130m102 0h128" stroke="#a29d75" strokeWidth="3" />
    </svg>
  );
}
