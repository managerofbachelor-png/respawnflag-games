import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRemaining,
  formatEliminationText,
  formatShieldText,
  getNextEngagementCallout,
  ENGAGEMENT_CALLOUTS,
  toggleLoopState,
  formatLoopButtonText,
  calculateDoorAperture,
  parseChatMessageForCountry,
  checkShieldThreshold,
  checkReviveThreshold,
  getNextCycle,
  sortLeaderboard,
  filterFemaleVoice
} from './rules';

test('calculateRemaining calculates correct remaining country count', () => {
  assert.equal(calculateRemaining(64, 0), 64);
  assert.equal(calculateRemaining(64, 9), 55);
  assert.equal(calculateRemaining(64, 64), 0);
});

test('calculateDoorAperture returns 0 when door closed, 1 when opening at countdown <= 1', () => {
  assert.equal(calculateDoorAperture(5, false), 0.0);
  assert.equal(calculateDoorAperture(4, false), 0.0);
  assert.equal(calculateDoorAperture(3, false), 0.0);
  assert.equal(calculateDoorAperture(2, false), 0.0);
  assert.equal(calculateDoorAperture(1, false), 1.0);
  assert.equal(calculateDoorAperture(0, false), 1.0);
  assert.equal(calculateDoorAperture(5, true), 1.0);
});

test('parseChatMessageForCountry parses live stream comments accurately', () => {
  const sampleCountries = [
    { code: 'in', name: 'India' },
    { code: 'bd', name: 'Bangladesh' },
    { code: 'br', name: 'Brazil' },
    { code: 'us', name: 'United States' }
  ];

  assert.equal(parseChatMessageForCountry('India', sampleCountries)?.code, 'in');
  assert.equal(parseChatMessageForCountry('support brazil please!!', sampleCountries)?.code, 'br');
  assert.equal(parseChatMessageForCountry('bd', sampleCountries)?.code, 'bd');
  assert.equal(parseChatMessageForCountry('hello world', sampleCountries), null);
});

test('toggleLoopState properly toggles boolean state', () => {
  assert.equal(toggleLoopState(true), false);
  assert.equal(toggleLoopState(false), true);
});

test('formatLoopButtonText returns human-readable label', () => {
  assert.equal(formatLoopButtonText(true), 'LOOP: ON');
  assert.equal(formatLoopButtonText(false), 'LOOP: OFF');
});

test('checkShieldThreshold accurately checks 20 chat requirement', () => {
  assert.equal(checkShieldThreshold(19, 20), false);
  assert.equal(checkShieldThreshold(20, 20), true);
});

test('sortLeaderboard returns sorted countries descending by vote count', () => {
  const votes = {
    BD: { name: 'Bangladesh', count: 10 },
    IN: { name: 'India', count: 18 },
  };
  const leaderboard = sortLeaderboard(votes);
  assert.equal(leaderboard[0].name, 'India');
  assert.equal(leaderboard[0].votes, 18);
});

test('filterFemaleVoice prioritizes female English voice', () => {
  const mockVoices = [
    { name: 'David (Desktop)', lang: 'en-US' },
    { name: 'Google US English Female', lang: 'en-US' },
  ];
  const selected = filterFemaleVoice(mockVoices);
  assert.ok(selected);
  assert.equal(selected.name, 'Google US English Female');
});

test('cycleSpeedMultiplier cycles correctly from 0.5x to 2x and back to 0.5x', async () => {
  const { cycleSpeedMultiplier, formatSpeedText } = await import('./rules.js');
  assert.equal(cycleSpeedMultiplier(0.5), 1.0);
  assert.equal(cycleSpeedMultiplier(1.0), 1.5);
  assert.equal(cycleSpeedMultiplier(1.5), 2.0);
  assert.equal(cycleSpeedMultiplier(2.0), 0.5);
  assert.equal(formatSpeedText(0.5), '0.5x');
  assert.equal(formatSpeedText(1), '1x');
});

