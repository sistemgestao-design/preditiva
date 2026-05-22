export interface StoryAlert {
  id: number;
  type: 'football' | 'lottery';
  icon: string;
  title: string;
  description: string;
  time: string;
  urgency: 'critical' | 'high' | 'medium';
}

export interface Team {
  name: string;
  shortName: string;
  logo: string;
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
  status: 'live' | 'upcoming' | 'today';
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  expectedGoals: number;
  oddsComparison: BettingHouseOdd[];
}

export interface Lottery {
  id: number;
  name: string;
  prize: string;
  prizeValue: number;
  nextDraw: string;
  accumulated: boolean;
  numbersRange: number;
  pickCount: number;
  hotNumbers: number[];
  coldNumbers: number[];
  lastResults: number[][];
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

export interface FeedAlert {
  id: number;
  type: 'football' | 'lottery' | 'arbitrage';
  icon: string;
  message: string;
  time: string;
  importance: 'high' | 'medium' | 'low';
}
