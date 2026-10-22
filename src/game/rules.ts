/**
 * Pure business logic and calculation helpers for Flags War Arena.
 * Decoupled from DOM/Canvas for deterministic unit testing.
 */

export interface CountryVote {
  code: string;
  name: string;
  votes: number;
}

export function calculateRemaining(total: number, eliminatedCount: number): number {
  return Math.max(0, total - eliminatedCount);
}

export function formatEliminationText(countryName: string): string {
  return `${countryName} is out!`;
}

export function formatShieldText(countryName: string): string {
  return `${countryName} activating protective shield!`;
}

export const ENGAGEMENT_CALLOUTS = [
  "Which country are you watching from? Comment your country below!",
  "Comment your country name right now to save them from elimination!",
  "Like and subscribe to support your country and activate free shields!"
];

export function getNextEngagementCallout(currentIndex: number): { text: string; nextIndex: number } {
  const index = currentIndex % ENGAGEMENT_CALLOUTS.length;
  return {
    text: ENGAGEMENT_CALLOUTS[index],
    nextIndex: (index + 1) % ENGAGEMENT_CALLOUTS.length
  };
}

export function toggleLoopState(currentLoop: boolean): boolean {
  return !currentLoop;
}

export function formatLoopButtonText(isLoop: boolean): string {
  return isLoop ? 'LOOP: ON' : 'LOOP: OFF';
}

/**
 * Calculates midpoint door aperture (0.0 = completely closed, 1.0 = fully open)
 * Opens when countdown reaches 1 or 0 during elimination interval.
 */
export function calculateDoorAperture(countdownSeconds: number, isDoorActive: boolean): number {
  if (isDoorActive || countdownSeconds <= 1) {
    return 1.0;
  }
  return 0.0;
}

/**
 * Parses incoming live stream chat message for any country name or ISO code.
 */
export function parseChatMessageForCountry(
  message: string,
  countries: Array<{ code: string; name: string }>
): { code: string; name: string } | null {
  if (!message) return null;
  const cleaned = message.trim().toLowerCase();

  // 1. Direct name or code match
  const direct = countries.find(
    c => c.name.toLowerCase() === cleaned || c.code.toLowerCase() === cleaned
  );
  if (direct) return direct;

  // 2. Word boundary match in sentence (e.g. "Vote for India!", "support brazil pls")
  const words = cleaned.replace(/[^a-z\s]/g, ' ').split(/\s+/);
  for (const w of words) {
    if (w.length < 2) continue;
    const match = countries.find(
      c => c.name.toLowerCase() === w || c.code.toLowerCase() === w
    );
    if (match) return match;
  }

  return null;
}

export function checkShieldThreshold(chats: number, threshold = 20): boolean {
  return chats >= threshold;
}

export function checkReviveThreshold(chats: number, threshold = 40): boolean {
  return chats >= threshold;
}

export function getNextCycle(currentCycle: number): number {
  return currentCycle + 1;
}

export function sortLeaderboard(votes: Record<string, { name: string; count: number }>): CountryVote[] {
  return Object.entries(votes)
    .map(([code, item]) => ({
      code,
      name: item.name,
      votes: item.count,
    }))
    .sort((a, b) => b.votes - a.votes);
}

export function filterFemaleVoice(voices: Array<{ name: string; lang: string }>): { name: string; lang: string } | null {
  if (!voices || voices.length === 0) return null;
  
  const femaleKeywords = ['female', 'samantha', 'zira', 'karen', 'victoria', 'google us english', 'natural', 'hazel', 'susan'];
  
  const found = voices.find(v => {
    const nameLower = v.name.toLowerCase();
    return v.lang.startsWith('en') && femaleKeywords.some(kw => nameLower.includes(kw));
  });

  return found || voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
}

export function cycleSpeedMultiplier(currentSpeed: number): number {
  if (currentSpeed === 0.5) return 1.0;
  if (currentSpeed === 1.0) return 1.5;
  if (currentSpeed === 1.5) return 2.0;
  return 0.5;
}

export function formatSpeedText(speed: number): string {
  return `${speed}x`;
}
