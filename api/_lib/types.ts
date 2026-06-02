// Shared backend types — mirror of src/types/index.ts so the API and the
// frontend agree on the data shape.

export interface Team {
  id?: number;
  name: string;
  shortName: string;
  logo: string;
}

// Recent-form summary for a team, derived from its last N finished games.
export interface TeamForm {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  // 0–100 score weighting the most recent games more heavily.
  formScore: number;
  // Compact recent sequence, most recent last, e.g. "V V E D V".
  sequence: string;
}

// AI-style suggestion produced from statistical form (+ market odds when known).
export interface Prediction {
  pick: 'home' | 'draw' | 'away';
  label: string; // e.g. "Vitória do Flamengo"
  confidence: number; // 0–100
  house: string; // recommended bookmaker (best odd for the pick)
  odd: number; // best odd for the pick (0 when odds unavailable)
  reasoning: string; // natural-language explanation in PT-BR
}

export interface MatchAnalysis {
  homeForm: TeamForm | null;
  awayForm: TeamForm | null;
  // Only set when confidence passes the threshold; otherwise null.
  prediction: Prediction | null;
}

export interface BettingHouseOdd {
  house: string;
  logo: string;
  homeOdd: number;
  drawOdd: number;
  awayOdd: number;
  bonus?: string;
  isBest: boolean;
}

export interface Match {
  id: number;
  league: string;
  leagueIcon: string;
  homeTeam: Team;
  awayTeam: Team;
  homeProb: number;
  drawProb: number;
  awayProb: number;
  homeOdd: number;
  drawOdd: number;
  awayOdd: number;
  valueBet: string | null;
  valueBetOdd: number | null;
  valueBetHouse: string;
  valueBetAdvantage: string;
  kickoff: string;
  status: 'live' | 'upcoming' | 'today' | 'finished';
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  expectedGoals: number;
  oddsComparison: BettingHouseOdd[];
  analysis?: MatchAnalysis;
}

export interface ApiResponse<T> {
  data: T;
  source: 'live' | 'cache' | 'fallback';
  updatedAt: string;
  notice?: string;
}
