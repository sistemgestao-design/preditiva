import { useState } from 'react';
import type { Team } from '../types';

interface TeamLogoProps {
  team: Pick<Team, 'name' | 'shortName' | 'logo'>;
  /** Sizing/utility classes applied to the rendered element (img or fallback). */
  className?: string;
}

// Derive up to 3 uppercase initials for the textual fallback.
function initials(team: Pick<Team, 'name' | 'shortName'>): string {
  const base = (team.shortName || team.name || '?').trim();
  if (!base) return '?';
  const words = base.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/**
 * Team crest with two layers of resilience so a logo is ALWAYS shown:
 *  - `referrerPolicy="no-referrer"` avoids hotlink/referrer blocking by the
 *    api-sports.io CDN, which is what made crests vanish on some networks.
 *  - On load error (or missing URL) we render the team initials in a circle
 *    instead of a broken-image icon.
 */
export default function TeamLogo({ team, className = '' }: TeamLogoProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = failed || !team.logo;

  if (showFallback) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-[#1f2633] text-[#34e3ff] font-extrabold ${className}`}
        title={team.name}
        aria-label={team.name}
      >
        <span className="text-[0.6em] leading-none">{initials(team)}</span>
      </span>
    );
  }

  return (
    <img
      src={team.logo}
      alt={team.name}
      title={team.name}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
