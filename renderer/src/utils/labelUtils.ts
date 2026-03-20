const normalizeName = (name: string): string =>
  (name || "").replace(/\s+/g, " ").trim();

const pickOneWordFromTwo = (name: string, avoid?: string): string => {
  const words = normalizeName(name).split(" ").filter(Boolean);
  if (words.length !== 2) return normalizeName(name);
  const last = words[1] || words[0] || name;
  const first = words[0] || last;
  if (avoid && last.toLowerCase() === avoid.toLowerCase()) return first;
  return last;
};

export const shortenNameForDisplay = (name: string, maxLen: number = 14): string => {
  const n = normalizeName(name);
  if (!n) return n;
  if (n.length <= maxLen) return n;

  const words = n.split(" ").filter(Boolean);
  const candidate =
    (words.length >= 2 ? words[words.length - 1] : words[0]) || n;

  const base = candidate.length <= maxLen ? candidate : candidate.slice(0, maxLen);
  return base.length < n.length ? `${base}…` : base;
};

export const makeCompactOutcomeLabel = (opts: {
  label: string;
  homeTeam?: string;
  awayTeam?: string;
  maxTeamLen?: number;
  maxTotalLen?: number;
}): string => {
  const {
    label,
    homeTeam,
    awayTeam,
    maxTeamLen = 14,
    maxTotalLen = 18,
  } = opts;

  let s = (label || "").trim();
  if (!s) return s;

  const homeNorm = homeTeam ? normalizeName(homeTeam) : "";
  const awayNorm = awayTeam ? normalizeName(awayTeam) : "";

  // Special case: exactly 2-word team names → show 1 word,
  // but keep them distinct if both would end up the same.
  const homeTwoWord =
    homeNorm && homeNorm.split(" ").filter(Boolean).length === 2;
  const awayTwoWord =
    awayNorm && awayNorm.split(" ").filter(Boolean).length === 2;

  let homeShort = homeNorm ? shortenNameForDisplay(homeNorm, maxTeamLen) : "";
  let awayShort = awayNorm ? shortenNameForDisplay(awayNorm, maxTeamLen) : "";

  if (homeTwoWord) homeShort = pickOneWordFromTwo(homeNorm);
  if (awayTwoWord) awayShort = pickOneWordFromTwo(awayNorm);

  // If both shorten to same single word, adjust away first (then home) to keep unique.
  if (
    homeTwoWord &&
    awayTwoWord &&
    homeShort &&
    awayShort &&
    homeShort.toLowerCase() === awayShort.toLowerCase()
  ) {
    awayShort = pickOneWordFromTwo(awayNorm, homeShort);
    if (awayShort.toLowerCase() === homeShort.toLowerCase()) {
      homeShort = pickOneWordFromTwo(homeNorm, awayShort);
    }
  }

  // Apply replacements (display only).
  if (homeTeam && s.includes(homeTeam)) {
    s = s.split(homeTeam).join(homeShort || shortenNameForDisplay(homeNorm, maxTeamLen));
  }
  if (awayTeam && s.includes(awayTeam)) {
    s = s.split(awayTeam).join(awayShort || shortenNameForDisplay(awayNorm, maxTeamLen));
  }

  s = s.replace(/\s+or\s+/gi, " / ");

  if (s.length > maxTotalLen) return `${s.slice(0, maxTotalLen)}…`;
  return s;
};

