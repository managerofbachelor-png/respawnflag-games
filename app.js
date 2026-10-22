/**
 * Flags War Arena - Production Live Stream Platform
 * YouTube Channel: Respawn Tahmid
 * 
 * Major Features:
 * 1. 64 Countries Database & High-Res Flag Spheres
 * 2. Visual Arena Layout:
 *    - 4 Rotating Spoke Paddles originating from the BIGGER OUTER CIRCLE and extending inward
 *    - Midpoint Hazard Door: A mechanical energy shield door that remains CLOSED for 5s (bouncing balls),
 *      and OPENS every 5 seconds to suck in and eliminate exactly one country, then slams shut!
 * 3. StreamElements Realtime Chat Sync:
 *    - Direct Socket.io connection to StreamElements realtime servers using overlay token
 *    - Automatic chat parser categorizing country votes in real-time
 * 4. Dual Audio System & BGM Loop:
 *    - Default BGM track set to user's uploaded song (/assets/aistudio/CHAOTIC_FUN__CHALLENGE_1_d05e44df.mp3)
 *    - [ 🔁 LOOP: ON/OFF ] button in stream control bar with persistent looping
 *    - BGM Master Volume Slider & Mute Toggle
 *    - Natural Female Voice Commentary & 10s Periodic Viewer Retention Prompts
 * 5. Streamer Controls: [ ⏸️ PAUSE / ▶️ START ], [ 🔄 RESET ], [ 🎵 BGM ], [ 🔁 LOOP ], [ 🎙️ VOICE ]
 */

// ==========================================================
// 1. 64 COUNTRIES DATABASE & PRELOADER
// ==========================================================
const COUNTRIES_DATA = [
  { code: 'in', name: 'India' },
  { code: 'bd', name: 'Bangladesh' },
  { code: 'np', name: 'Nepal' },
  { code: 'us', name: 'United States' },
  { code: 'br', name: 'Brazil' },
  { code: 'ar', name: 'Argentina' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'jp', name: 'Japan' },
  { code: 'kr', name: 'South Korea' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'mx', name: 'Mexico' },
  { code: 'it', name: 'Italy' },
  { code: 'es', name: 'Spain' },
  { code: 'pt', name: 'Portugal' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'cn', name: 'China' },
  { code: 'ru', name: 'Russia' },
  { code: 'tr', name: 'Turkey' },
  { code: 'id', name: 'Indonesia' },
  { code: 'pk', name: 'Pakistan' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'eg', name: 'Egypt' },
  { code: 'za', name: 'South Africa' },
  { code: 'vn', name: 'Vietnam' },
  { code: 'th', name: 'Thailand' },
  { code: 'ph', name: 'Philippines' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'ir', name: 'Iran' },
  { code: 'co', name: 'Colombia' },
  { code: 'cl', name: 'Chile' },
  { code: 'pe', name: 'Peru' },
  { code: 'pl', name: 'Poland' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'se', name: 'Sweden' },
  { code: 'no', name: 'Norway' },
  { code: 'dk', name: 'Denmark' },
  { code: 'fi', name: 'Finland' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'be', name: 'Belgium' },
  { code: 'at', name: 'Austria' },
  { code: 'ma', name: 'Morocco' },
  { code: 'gh', name: 'Ghana' },
  { code: 'ke', name: 'Kenya' },
  { code: 'ug', name: 'Uganda' },
  { code: 'tz', name: 'Tanzania' },
  { code: 'ao', name: 'Angola' },
  { code: 'dz', name: 'Algeria' },
  { code: 'gr', name: 'Greece' },
  { code: 'ie', name: 'Ireland' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'hr', name: 'Croatia' },
  { code: 'uy', name: 'Uruguay' },
  { code: 'cz', name: 'Czechia' },
  { code: 'ro', name: 'Romania' },
  { code: 'hu', name: 'Hungary' },
  { code: 'jm', name: 'Jamaica' },
  { code: 'cu', name: 'Cuba' },
  { code: 'il', name: 'Israel' },
  { code: 'sg', name: 'Singapore' },
  { code: 'my', name: 'Malaysia' },
  { code: 'qa', name: 'Qatar' }
];

const flagImages = new Map();
function preloadFlags() {
  COUNTRIES_DATA.forEach(c => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `https://flagcdn.com/w80/${c.code}.png`;
    flagImages.set(c.code, img);
  });
}
preloadFlags();

// ==========================================================
// 2. STREAMELEMENTS REALTIME CHAT INTEGRATION
// ==========================================================
const streamElementsConfig = {
  overlayId: "6ada2bab60f91cd5e7bd8e56",
  jwtToken: "dlcdb4E6wvj6PARvsNtsJXcyUcQgj0zpwm0AyJsT8vXpM9Oq",
  connected: false,
  socket: null
};

function initStreamElements() {
  if (typeof io === 'undefined') {
    console.log("Socket.io loading...");
    return;
  }

  const badge = document.getElementById('se-status-badge');
  try {
    const socket = io('https://realtime.streamelements.com', {
      transports: ['websocket']
    });
    streamElementsConfig.socket = socket;

    socket.on('connect', () => {
      console.log("⚡ Connecting to StreamElements Realtime Gateway...");
      socket.emit('authenticate', {
        method: 'jwt',
        token: streamElementsConfig.jwtToken
      });
    });

    socket.on('authenticated', () => {
      streamElementsConfig.connected = true;
      if (badge) {
        badge.textContent = "🟢 LIVE SYNCED";
        badge.style.color = "#34d399";
        badge.style.background = "rgba(16,185,129,0.25)";
      }
      console.log("🔥 StreamElements Realtime Chat LIVE connected successfully!");
    });

    socket.on('unauthorized', (err) => {
      console.warn("StreamElements auth notice:", err);
      if (badge) {
        badge.textContent = "🟡 READY";
        badge.style.color = "#f59e0b";
      }
    });

    // Listen to real YouTube live stream chat messages through StreamElements
    socket.on('event', (data) => {
      handleIncomingStreamElementsEvent(data);
    });

    socket.on('chatMessage', (data) => {
      if (data && data.data && data.data.message) {
        handleChatMessageText(data.data.message, data.data.displayName || "Viewer");
      }
    });

  } catch (err) {
    console.warn("StreamElements connection initialization:", err);
  }
}

function handleIncomingStreamElementsEvent(event) {
  if (!event) return;
  // If event is chat message or tip/cheer
  if (event.type === 'message' || event.listener === 'chat') {
    const msg = event.data?.text || event.data?.message;
    if (msg) handleChatMessageText(msg, event.data?.username || "Viewer");
  } else if (event.type === 'subscriber' || event.type === 'superchat') {
    // Free power perk on subscribe
    audio.speak("Super chat received! Activating random country shield!");
    activateRandomShield();
  }
}

function handleChatMessageText(text, user = "Viewer") {
  const match = parseChatMessage(text);
  if (match) {
    castVote(match.code);
    showChatVoteFlash(`${user}: ${match.name}`);
  }
}

function parseChatMessage(message) {
  if (!message) return null;
  const cleaned = message.trim().toLowerCase();

  const direct = COUNTRIES_DATA.find(
    c => c.name.toLowerCase() === cleaned || c.code.toLowerCase() === cleaned
  );
  if (direct) return direct;

  const words = cleaned.replace(/[^a-z\s]/g, ' ').split(/\s+/);
  for (const w of words) {
    if (w.length < 2) continue;
    const found = COUNTRIES_DATA.find(
      c => c.name.toLowerCase() === w || c.code.toLowerCase() === w
    );
    if (found) return found;
  }
  return null;
}

function showChatVoteFlash(text) {
  const banner = document.getElementById('engagement-callout-text');
  if (banner) {
    banner.textContent = `💬 ${text} voted!`;
  }
}

// ==========================================================
// 3. DUAL AUDIO SYSTEM & BGM LOOP
// ==========================================================
class DualAudioSystem {
  constructor() {
    this.ctx = null;
    this.unlocked = false;
    this.bgmEnabled = true;
    this.bgmVolume = 0.45;
    this.bgmLoop = true; // Default Loop = ON
    this.voiceEnabled = true;
    this.femaleVoice = null;
    this.defaultSongUrl = '/assets/aistudio/CHAOTIC_FUN__CHALLENGE_1_d05e44df.mp3';

    this.audioElement = document.getElementById('bgm-audio-player');
    this.usingCustomAudio = false;

    if (this.audioElement) {
      this.audioElement.src = this.defaultSongUrl;
      this.audioElement.loop = this.bgmLoop;
    }

    this.initVoices();
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }
    } catch (_) {}

    this.playBGM();
  }

  playBGM() {
    if (this.audioElement) {
      this.audioElement.volume = this.bgmEnabled ? this.bgmVolume : 0;
      this.audioElement.loop = this.bgmLoop;
      if (this.bgmEnabled) {
        this.audioElement.play().catch(e => {
          console.log("Audio waiting for user gesture:", e);
        });
      } else {
        this.audioElement.pause();
      }
    }
  }

  toggleBGM() {
    this.bgmEnabled = !this.bgmEnabled;
    this.setBGMVolume(this.bgmVolume);
    this.playBGM();
    return this.bgmEnabled;
  }

  toggleLoop() {
    this.bgmLoop = !this.bgmLoop;
    if (this.audioElement) {
      this.audioElement.loop = this.bgmLoop;
    }
    return this.bgmLoop;
  }

  setBGMVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.audioElement) {
      this.audioElement.volume = this.bgmEnabled ? this.bgmVolume : 0;
    }
  }

  restoreDefaultSong() {
    this.usingCustomAudio = false;
    if (this.audioElement) {
      this.audioElement.src = this.defaultSongUrl;
      this.audioElement.loop = this.bgmLoop;
      this.audioElement.currentTime = 0;
      this.playBGM();
    }
  }

  loadCustomAudio(file) {
    if (!this.audioElement || !file) return;
    this.usingCustomAudio = true;
    const url = URL.createObjectURL(file);
    this.audioElement.src = url;
    this.audioElement.loop = this.bgmLoop;
    this.audioElement.currentTime = 0;
    this.playBGM();
  }

  initVoices() {
    if (!('speechSynthesis' in window)) return;
    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      const femaleKws = ['female', 'samantha', 'zira', 'karen', 'victoria', 'google us english', 'natural', 'hazel', 'susan'];
      const found = voices.find(v => 
        v.lang.startsWith('en') && femaleKws.some(kw => v.name.toLowerCase().includes(kw))
      );
      this.femaleVoice = found || voices.find(v => v.lang.startsWith('en')) || voices[0];
    };

    findVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = findVoice;
    }
  }

  speak(text) {
    if (!this.voiceEnabled || !this.unlocked || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (this.femaleVoice) u.voice = this.femaleVoice;
      u.rate = 1.02;
      u.pitch = 1.15;
      u.volume = 1.0;
      window.speechSynthesis.speak(u);
    } catch (_) {}
  }

  playBounce() {
    if (!this.unlocked || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch (_) {}
  }

  playTick() {
    if (!this.unlocked || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (_) {}
  }

  playDoorOpen() {
    if (!this.unlocked || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(420, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (_) {}
  }

  playDoorClose() {
    if (!this.unlocked || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (_) {}
  }

  playElimination() {
    if (!this.unlocked || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (_) {}
  }

  playShield() {
    if (!this.unlocked || !this.ctx) return;
    try {
      [523, 659, 784, 1046].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.04 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.04);
        osc.stop(this.ctx.currentTime + idx * 0.04 + 0.15);
      });
    } catch (_) {}
  }

  playVictory() {
    if (!this.unlocked || !this.ctx) return;
    try {
      [523, 659, 784, 1046].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.16, this.ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.12);
        osc.stop(this.ctx.currentTime + idx * 0.12 + 0.4);
      });
    } catch (_) {}
  }
}

const audio = new DualAudioSystem();

// ==========================================================
// 4. GAME STATE & MIDPOINT DOOR SPECIFICATION
// ==========================================================
const state = {
  cycle: 199,
  isPaused: false,
  countdownSeconds: 5,
  countdownTimer: null,
  engagementTimer: null,
  engagementIndex: 0,
  totalCountries: 64,
  remainingCountries: 64,
  eliminatedList: [],
  activeBalls: [],
  votes: {},
  simChatActive: true,
  speedMultiplier: 0.5,
  screenShake: 0,
  spokeAngle: 0,
  isEnding: false,

  // Midpoint Door State: 0.0 = completely closed, 1.0 = fully open
  doorAperture: 0.0,
  doorTargetAperture: 0.0,
  doorOpeningPulse: 0
};

// Seed initial votes
COUNTRIES_DATA.forEach(c => {
  state.votes[c.code] = { name: c.name, count: 0 };
});
state.votes['in'].count = 18;
state.votes['bd'].count = 10;
state.votes['np'].count = 4;

const ENGAGEMENT_PROMPTS = [
  "Which country are you watching from? Comment your country below!",
  "Comment your country name right now to save them from elimination!",
  "Like and subscribe to support your country and activate free shields!"
];

function startEngagementEngine() {
  if (state.engagementTimer) clearInterval(state.engagementTimer);
  state.engagementTimer = setInterval(() => {
    if (state.isPaused || state.isEnding) return;
    const text = ENGAGEMENT_PROMPTS[state.engagementIndex];
    state.engagementIndex = (state.engagementIndex + 1) % ENGAGEMENT_PROMPTS.length;

    const bannerText = document.getElementById('engagement-callout-text');
    if (bannerText) bannerText.textContent = text;
    audio.speak(text);
  }, 10000);
}

// ==========================================================
// 5. PHYSICS ENGINE: OUTER ROTOR & MIDPOINT DOOR CLOSING
// ==========================================================
const canvas = document.getElementById('physics-canvas');
const ctx = canvas.getContext('2d');

let arenaRadius = 150;
let arenaCenter = { x: 200, y: 200 };
let midpointDoorRadius = 32;
let particles = [];

function resizeArena() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);

  arenaCenter = { x: rect.width / 2, y: rect.height / 2 };
  arenaRadius = Math.min(rect.width, rect.height) * 0.46;
  midpointDoorRadius = arenaRadius * 0.22; // ~34px
}

function spawnBalls() {
  state.activeBalls = [];
  const ballR = Math.max(9.5, arenaRadius * 0.078);

  COUNTRIES_DATA.forEach((country, i) => {
    const ring = (i % 4) + 1;
    // Spawn in the wide donut area between the midpoint door and outer rim
    const r = midpointDoorRadius + 14 + ring * (arenaRadius - midpointDoorRadius - 26) * 0.25;
    const theta = (i / 16) * Math.PI * 2 + ring * 0.5;

    const x = arenaCenter.x + Math.cos(theta) * r;
    const y = arenaCenter.y + Math.sin(theta) * r;

    const speed = 1.6 + Math.random() * 1.3;
    const vAngle = theta + Math.PI / 2 + (Math.random() - 0.5) * 0.5;

    state.activeBalls.push({
      code: country.code,
      name: country.name,
      x,
      y,
      vx: Math.cos(vAngle) * speed,
      vy: Math.sin(vAngle) * speed,
      radius: ballR,
      shield: false,
      isSucking: false,
      suckScale: 1.0,
      eliminated: false
    });
  });

  state.remainingCountries = COUNTRIES_DATA.length;
  state.eliminatedList = [];
  state.doorAperture = 0.0;
  state.doorTargetAperture = 0.0;
  updateHeaderCounters();
  updateProgressUI();
  updateEliminatedGallery();
}

function updatePhysics() {
  if (state.isPaused) return;

  const dt = state.speedMultiplier;
  const rotorSpeed = 0.015 * dt;
  state.spokeAngle = (state.spokeAngle + rotorSpeed) % (Math.PI * 2);

  // Smooth midpoint door opening/closing animation
  state.doorAperture += (state.doorTargetAperture - state.doorAperture) * 0.15;
  state.doorOpeningPulse += 0.06;

  // Paddles extend inward FROM THE BIGGER CIRCLE, leaving center wide open!
  const outerPaddleR = arenaRadius - 6;
  const innerPaddleR = arenaRadius * 0.50; // Stops well outside midpoint door!
  const halfPaddleThickness = 4.5;

  for (let i = 0; i < state.activeBalls.length; i++) {
    const ball = state.activeBalls[i];
    if (ball.eliminated) continue;

    // Ball being sucked into open midpoint door:
    if (ball.isSucking) {
      const dx = arenaCenter.x - ball.x;
      const dy = arenaCenter.y - ball.y;
      ball.x += dx * 0.24;
      ball.y += dy * 0.24;
      ball.suckScale *= 0.80;
      if (ball.suckScale < 0.04) {
        completeBallElimination(ball);
      }
      continue;
    }

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    ball.vx *= 0.999;
    ball.vy *= 0.999;

    const currentSpeed = Math.hypot(ball.vx, ball.vy);
    if (currentSpeed < 1.2) {
      const boost = Math.random() * Math.PI * 2;
      ball.vx += Math.cos(boost) * 0.5;
      ball.vy += Math.sin(boost) * 0.5;
    } else if (currentSpeed > 5.5) {
      ball.vx = (ball.vx / currentSpeed) * 5.5;
      ball.vy = (ball.vy / currentSpeed) * 5.5;
    }

    // Midpoint Door Collision & Suction
    const cdx = arenaCenter.x - ball.x;
    const cdy = arenaCenter.y - ball.y;
    const distToCenter = Math.hypot(cdx, cdy);

    // If door is OPEN: balls inside suction horizon get pulled into singularity!
    if (state.doorAperture > 0.4) {
      if (distToCenter < midpointDoorRadius * 1.3) {
        const suctionForce = 0.08 / Math.max(10, distToCenter * 0.2);
        ball.vx += (cdx / distToCenter) * suctionForce * dt;
        ball.vy += (cdy / distToCenter) * suctionForce * dt;
      }
    } else {
      // If door is CLOSED: Midpoint is protected by a solid energy shield door!
      // Balls bounce off the closed door!
      if (distToCenter < midpointDoorRadius + ball.radius) {
        const nx = -cdx / distToCenter; // points outward
        const ny = -cdy / distToCenter;
        ball.x = arenaCenter.x + nx * (midpointDoorRadius + ball.radius);
        ball.y = arenaCenter.y + ny * (midpointDoorRadius + ball.radius);

        const dot = ball.vx * nx + ball.vy * ny;
        if (dot < 0) {
          ball.vx = ball.vx - 1.9 * dot * nx;
          ball.vy = ball.vy - 1.9 * dot * ny;
          audio.playBounce();
          createSpark(ball.x, ball.y, 2, '#00f3ff');
        }
      }
    }

    // Outer Circular Boundary Bounce
    if (distToCenter > arenaRadius - ball.radius) {
      const nx = cdx / distToCenter;
      const ny = cdy / distToCenter;
      ball.x = arenaCenter.x - nx * (arenaRadius - ball.radius);
      ball.y = arenaCenter.y - ny * (arenaRadius - ball.radius);

      const dot = ball.vx * nx + ball.vy * ny;
      if (dot < 0) {
        ball.vx = ball.vx - 1.9 * dot * nx;
        ball.vy = ball.vy - 1.9 * dot * ny;
        ball.vx += -ny * (Math.random() - 0.5) * 0.5;
        ball.vy += nx * (Math.random() - 0.5) * 0.5;
        createSpark(ball.x, ball.y, 2, '#00f3ff');
      }
    }

    // 4 Rotating Sector Blades (Attached to Bigger Circle extending Inward)
    for (let s = 0; s < 4; s++) {
      const spokeTh = state.spokeAngle + (s * Math.PI) / 2;
      const cosTh = Math.cos(spokeTh);
      const sinTh = Math.sin(spokeTh);

      const bx = ball.x - arenaCenter.x;
      const by = ball.y - arenaCenter.y;

      const u = bx * cosTh + by * sinTh;
      const w = -bx * sinTh + by * cosTh;

      // Only collides along the outer segment!
      if (u >= innerPaddleR - ball.radius && u <= outerPaddleR + ball.radius) {
        const clampedU = Math.max(innerPaddleR, Math.min(outerPaddleR, u));
        const distToPaddle = Math.abs(w);
        const minDist = ball.radius + halfPaddleThickness;

        if (distToPaddle < minDist) {
          const sign = w >= 0 ? 1 : -1;
          const paddleNormX = -sinTh * sign;
          const paddleNormY = cosTh * sign;

          ball.x = arenaCenter.x + cosTh * clampedU + paddleNormX * (minDist + 0.5);
          ball.y = arenaCenter.y + sinTh * clampedU + paddleNormY * (minDist + 0.5);

          const paddleVx = -sinTh * clampedU * rotorSpeed * 60;
          const paddleVy = cosTh * clampedU * rotorSpeed * 60;

          const relVx = ball.vx - paddleVx;
          const relVy = ball.vy - paddleVy;
          const relDot = relVx * paddleNormX + relVy * paddleNormY;

          if (relDot < 0) {
            const restitution = 1.35;
            ball.vx = ball.vx - (1 + restitution) * relDot * paddleNormX + paddleVx * 0.4;
            ball.vy = ball.vy - (1 + restitution) * relDot * paddleNormY + paddleVy * 0.4;
            audio.playBounce();
            createSpark(ball.x, ball.y, 3, '#818cf8');
          }
        }
      }
    }
  }

  // Circle-to-Circle Elastic Collisions
  for (let i = 0; i < state.activeBalls.length; i++) {
    const b1 = state.activeBalls[i];
    if (b1.eliminated || b1.isSucking) continue;

    for (let j = i + 1; j < state.activeBalls.length; j++) {
      const b2 = state.activeBalls[j];
      if (b2.eliminated || b2.isSucking) continue;

      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const dist = Math.hypot(dx, dy);
      const minDist = b1.radius + b2.radius;

      if (dist < minDist && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;

        const overlap = (minDist - dist) * 0.5;
        b1.x -= nx * overlap;
        b1.y -= ny * overlap;
        b2.x += nx * overlap;
        b2.y += ny * overlap;

        const kx = b1.vx - b2.vx;
        const ky = b1.vy - b2.vy;
        const p = 2 * (nx * kx + ny * ky) / 2;

        b1.vx -= p * nx * 0.95;
        b1.vy -= p * ny * 0.95;
        b2.vx += p * nx * 0.95;
        b2.vy += p * ny * 0.95;
      }
    }
  }
}

function createSpark(x, y, count = 2, color = '#ffd200') {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1.5,
      color,
      alpha: 1,
      decay: 0.08
    });
  }
  if (particles.length > 60) particles.splice(0, particles.length - 60);
}

function createShockwave(x, y, color = '#00f3ff') {
  state.screenShake = 8;
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2.2,
      color,
      alpha: 1,
      decay: 0.04
    });
  }
}

// ==========================================================
// 6. RENDER SCENE: MIDPOINT DOOR & OUTER ROTOR PADDLES
// ==========================================================
function render() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.save();

  if (state.screenShake > 0) {
    const sx = (Math.random() - 0.5) * state.screenShake;
    const sy = (Math.random() - 0.5) * state.screenShake;
    ctx.translate(sx, sy);
    state.screenShake *= 0.86;
    if (state.screenShake < 0.4) state.screenShake = 0;
  }

  // Dark Stadium Radial Background
  const bgGrad = ctx.createRadialGradient(
    arenaCenter.x, arenaCenter.y, midpointDoorRadius,
    arenaCenter.x, arenaCenter.y, arenaRadius
  );
  bgGrad.addColorStop(0, '#040711');
  bgGrad.addColorStop(0.5, '#080d1a');
  bgGrad.addColorStop(1, '#0c1322');
  ctx.beginPath();
  ctx.arc(arenaCenter.x, arenaCenter.y, arenaRadius, 0, Math.PI * 2);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Outer Glowing Cyan Ring
  ctx.beginPath();
  ctx.arc(arenaCenter.x, arenaCenter.y, arenaRadius, 0, Math.PI * 2);
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = '#00f3ff';
  ctx.shadowColor = 'rgba(0, 243, 255, 0.8)';
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 4 Rotating Spoke Paddles from the BIGGER CIRCLE (Stopping before center)
  const outerPaddleR = arenaRadius - 6;
  const innerPaddleR = arenaRadius * 0.50;
  const paddleW = 8;

  for (let s = 0; s < 4; s++) {
    const spokeTh = state.spokeAngle + (s * Math.PI) / 2;
    const cosTh = Math.cos(spokeTh);
    const sinTh = Math.sin(spokeTh);

    const x1 = arenaCenter.x + cosTh * innerPaddleR;
    const y1 = arenaCenter.y + sinTh * innerPaddleR;
    const x2 = arenaCenter.x + cosTh * outerPaddleR;
    const y2 = arenaCenter.y + sinTh * outerPaddleR;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = paddleW;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#818cf8';
    ctx.shadowColor = 'rgba(129, 140, 248, 0.7)';
    ctx.shadowBlur = 8;
    ctx.stroke();

    ctx.strokeStyle = '#c7d2fe';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================
  // MIDPOINT DOOR HAZARD: CLOSING SHIELD & OPENING INTERVAL
  // ==========================================================
  const doorR = midpointDoorRadius;
  const openAmount = state.doorAperture; // 0.0 = closed, 1.0 = open

  ctx.save();
  ctx.translate(arenaCenter.x, arenaCenter.y);

  // Singularity abyss background (visible through opening)
  ctx.beginPath();
  ctx.arc(0, 0, doorR, 0, Math.PI * 2);
  ctx.fillStyle = '#020408';
  ctx.fill();

  if (openAmount > 0.05) {
    // Glowing purple black hole singularity vortex when door opens
    const holeGrad = ctx.createRadialGradient(0, 0, doorR * 0.2, 0, 0, doorR * 1.3);
    holeGrad.addColorStop(0, '#ff007f');
    holeGrad.addColorStop(0.6, 'rgba(255, 0, 127, 0.4)');
    holeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = holeGrad;
    ctx.beginPath();
    ctx.arc(0, 0, doorR * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Swirling gravity particles
    for (let k = 0; k < 5; k++) {
      const angle = state.doorOpeningPulse * 2 + (k * Math.PI * 2) / 5;
      const r = doorR * (0.3 + (1 - openAmount) * 0.5);
      ctx.fillStyle = '#00f3ff';
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Iris Shutter Blades (Mechanical Door that closes the midpoint)
  const bladeCount = 6;
  const retraction = openAmount * (doorR + 6); // Blades retract outward when door opens

  for (let b = 0; b < bladeCount; b++) {
    const bladeAngle = (b / bladeCount) * Math.PI * 2;
    ctx.save();
    ctx.rotate(bladeAngle);

    // Mechanical blade segment
    ctx.beginPath();
    ctx.moveTo(retraction, -doorR * 0.4);
    ctx.lineTo(doorR + 4, -doorR * 0.4);
    ctx.lineTo(doorR + 4, doorR * 0.4);
    ctx.lineTo(retraction, doorR * 0.4);
    ctx.closePath();

    ctx.fillStyle = openAmount < 0.2 ? '#1e1b4b' : '#312e81';
    ctx.fill();

    // Luminous cyan/magenta energy seam lines on the closed door
    ctx.strokeStyle = openAmount < 0.2 ? '#00f3ff' : '#ff007f';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }

  // Protective Shield Overlay when door is CLOSED
  if (openAmount < 0.3) {
    ctx.beginPath();
    ctx.arc(0, 0, doorR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 243, 255, 0.12)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Glowing shield icon watermark in center
    ctx.fillStyle = '#00f3ff';
    ctx.font = 'bold 12px Montserrat';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛡️', 0, 0);
  }

  // Magenta Event Horizon Outer Ring
  ctx.beginPath();
  ctx.arc(0, 0, doorR + 2, 0, Math.PI * 2);
  ctx.strokeStyle = openAmount > 0.5 ? '#ff007f' : 'rgba(255, 0, 127, 0.6)';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ff007f';
  ctx.shadowBlur = openAmount > 0.5 ? 16 : 6;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();

  // Draw 64 Country Flag Balls
  for (let i = 0; i < state.activeBalls.length; i++) {
    const ball = state.activeBalls[i];
    if (ball.eliminated) continue;

    const r = ball.radius * ball.suckScale;
    if (r <= 0.5) continue;

    ctx.save();
    ctx.translate(ball.x, ball.y);

    if (ball.shield) {
      ctx.beginPath();
      ctx.arc(0, 0, r + 3.5, 0, Math.PI * 2);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    const img = flagImages.get(ball.code);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -r, -r, r * 2, r * 2);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Oswald';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ball.code.toUpperCase(), 0, 0);
    }

    const sphereGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 1, 0, 0, r);
    sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    sphereGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.08)');
    sphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  // Draw Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function mainLoop() {
  updatePhysics();
  render();
  requestAnimationFrame(mainLoop);
}

// ==========================================================
// 7. 5-SECOND COUNTDOWN CYCLE & MIDPOINT DOOR ELIMINATION
// ==========================================================
function startCountdown() {
  if (state.countdownTimer) clearInterval(state.countdownTimer);
  state.countdownSeconds = 5;
  state.doorTargetAperture = 0.0; // Door starts closed
  updateCountdownBadge();

  state.countdownTimer = setInterval(() => {
    if (state.isPaused) return;

    state.countdownSeconds--;
    audio.playTick();
    updateCountdownBadge();

    // At 1 second remaining: Door begins to open!
    if (state.countdownSeconds === 1) {
      audio.playDoorOpen();
      state.doorTargetAperture = 1.0;
    }

    // At 0 seconds: Door is wide open, exactly one country gets eliminated!
    if (state.countdownSeconds <= 0) {
      triggerDoorElimination();
      state.countdownSeconds = 5;
      updateCountdownBadge();
    }
  }, 1000 / state.speedMultiplier);
}

function updateCountdownBadge() {
  const el = document.getElementById('alert-circle-timer');
  if (el) el.textContent = state.countdownSeconds;
}

function triggerDoorElimination() {
  if (state.isEnding || state.isPaused) return;
  const remaining = state.activeBalls.filter(b => !b.eliminated && !b.isSucking);
  if (remaining.length <= 1) return;

  // Find country ball closest to or inside the midpoint door
  let candidate = null;
  let minDist = Infinity;

  remaining.forEach(b => {
    const d = Math.hypot(b.x - arenaCenter.x, b.y - arenaCenter.y);
    if (!b.shield && d < minDist) {
      minDist = d;
      candidate = b;
    }
  });

  if (!candidate && remaining.length > 0) {
    candidate = remaining[0];
  }

  if (candidate) {
    if (candidate.shield) {
      candidate.shield = false;
      audio.playShield();
      createShockwave(candidate.x, candidate.y, '#10b981');
      showShieldAnnouncement(`SHIELD SAVED • ${candidate.name.toUpperCase()}`);
      const outAngle = Math.atan2(candidate.y - arenaCenter.y, candidate.x - arenaCenter.x);
      candidate.vx = Math.cos(outAngle) * 5.5;
      candidate.vy = Math.sin(outAngle) * 5.5;
      // Close door
      closeMidpointDoor();
    } else {
      startBallSuction(candidate);
    }
  } else {
    closeMidpointDoor();
  }
}

function startBallSuction(ball) {
  ball.isSucking = true;
}

function closeMidpointDoor() {
  audio.playDoorClose();
  state.doorTargetAperture = 0.0; // Door closes and locks
}

function completeBallElimination(ball) {
  ball.eliminated = true;
  state.eliminatedList.unshift(ball);

  const activeCount = state.activeBalls.filter(b => !b.eliminated).length;
  state.remainingCountries = activeCount;

  // Close the midpoint door immediately after eliminating the ball!
  closeMidpointDoor();

  // Audio commentary & FX
  audio.playElimination();
  createShockwave(arenaCenter.x, arenaCenter.y, '#ff007f');
  audio.speak(`${ball.name} is out!`);

  showEliminationPopup(ball);
  updateHeaderCounters();
  updateProgressUI();
  updateEliminatedGallery();

  if (activeCount === 1) {
    handleVictory();
  }
}

function showEliminationPopup(ball) {
  const popup = document.getElementById('elimination-popup');
  const img = document.getElementById('elim-popup-flag');
  const name = document.getElementById('elim-popup-name');

  if (popup && img && name) {
    img.src = `https://flagcdn.com/w80/${ball.code}.png`;
    name.textContent = ball.name;
    popup.classList.add('active');

    setTimeout(() => {
      popup.classList.remove('active');
    }, 2800 / state.speedMultiplier);
  }
}

function showShieldAnnouncement(text) {
  const el = document.getElementById('shield-announcement');
  if (el) {
    el.textContent = text;
    el.classList.add('active');
    setTimeout(() => {
      el.classList.remove('active');
    }, 2400);
  }
}

function handleVictory() {
  state.isEnding = true;
  if (state.countdownTimer) clearInterval(state.countdownTimer);

  const winner = state.activeBalls.find(b => !b.eliminated);
  if (winner) {
    audio.playVictory();
    audio.speak(`Champion crowned: ${winner.name}!`);
    showShieldAnnouncement(`🏆 CHAMPION: ${winner.name.toUpperCase()} 🏆`);
  }

  setTimeout(() => {
    state.cycle++;
    const cycleEl = document.getElementById('cycle-indicator');
    if (cycleEl) cycleEl.textContent = `• CYCLE ${state.cycle} • LIVE`;
    audio.speak(`Battle cycle ${state.cycle} begins on Respawn Tahmid!`);
    state.isEnding = false;
    spawnBalls();
    startCountdown();
  }, 5000 / state.speedMultiplier);
}

// ==========================================================
// 8. HUD & LEADERBOARD UPDATES
// ==========================================================
function updateHeaderCounters() {
  const totalEl = document.getElementById('stat-total-countries');
  const remEl = document.getElementById('stat-remaining-countries');
  if (totalEl) totalEl.textContent = state.totalCountries;
  if (remEl) remEl.textContent = state.remainingCountries;
}

function updateProgressUI() {
  const count = state.eliminatedList.length;
  const pct = (count / state.totalCountries) * 100;
  const fill = document.getElementById('progress-bar-fill');
  const text = document.getElementById('progress-counter-text');

  if (fill) fill.style.width = `${pct}%`;
  if (text) text.textContent = `${count} / ${state.totalCountries} ELIMINATED`;
}

function updateEliminatedGallery() {
  const track = document.getElementById('eliminated-flags-track');
  if (!track) return;

  track.innerHTML = '';
  state.eliminatedList.slice(0, 16).forEach(c => {
    const bubble = document.createElement('div');
    bubble.className = 'elim-flag-bubble';
    bubble.title = c.name;
    const img = document.createElement('img');
    img.src = `https://flagcdn.com/w40/${c.code}.png`;
    img.alt = c.name;
    bubble.appendChild(img);
    track.appendChild(bubble);
  });
}

function updateChatSupportUI() {
  const list = document.getElementById('chat-support-list');
  if (!list) return;

  const sorted = Object.entries(state.votes)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  list.innerHTML = sorted.map(([code, item], idx) => `
    <div class="leaderboard-row">
      <span class="rank-num">${idx + 1}</span>
      <img src="https://flagcdn.com/w40/${code}.png" alt="${item.name}" class="flag-icon-mini" />
      <span class="country-name-mini">${item.name.toUpperCase()}</span>
      <span class="vote-tally">${item.count} 💬</span>
      <span class="shield-progress">🛡️${item.count}/20</span>
    </div>
  `).join('');
}

// ==========================================================
// 9. CHAT SIMULATION & PERKS (20 Chats -> Shield, 40 -> Revive)
// ==========================================================
function simulateChatVote() {
  if (!state.simChatActive || state.isPaused) return;
  const active = state.activeBalls.filter(b => !b.eliminated);
  if (active.length === 0) return;

  const rand = active[Math.floor(Math.random() * active.length)];
  castVote(rand.code);
}

function castVote(code) {
  if (!state.votes[code]) return;
  state.votes[code].count++;

  const cName = state.votes[code].name;
  const count = state.votes[code].count;

  // 20 Chats -> Shield
  if (count === 20) {
    const ball = state.activeBalls.find(b => b.code === code && !b.eliminated);
    if (ball && !ball.shield) {
      ball.shield = true;
      audio.playShield();
      audio.speak(`${cName} activating protective shield!`);
      showShieldAnnouncement(`SHIELDED • ${cName.toUpperCase()}`);
    }
  }

  // 40 Chats -> Revive
  if (count === 40) {
    const elim = state.eliminatedList.find(b => b.code === code);
    if (elim) {
      reviveCountry(elim);
    }
  }

  updateChatSupportUI();
}

function activateRandomShield() {
  const active = state.activeBalls.filter(b => !b.eliminated && !b.shield);
  if (active.length > 0) {
    const pick = active[Math.floor(Math.random() * active.length)];
    pick.shield = true;
    audio.playShield();
    showShieldAnnouncement(`SHIELDED • ${pick.name.toUpperCase()}`);
  }
}

function reviveCountry(c) {
  state.eliminatedList = state.eliminatedList.filter(b => b.code !== c.code);
  c.eliminated = false;
  c.isSucking = false;
  c.suckScale = 1.0;
  c.shield = true;

  const angle = Math.random() * Math.PI * 2;
  c.x = arenaCenter.x + Math.cos(angle) * (arenaRadius * 0.7);
  c.y = arenaCenter.y + Math.sin(angle) * (arenaRadius * 0.7);
  c.vx = (Math.random() - 0.5) * 3;
  c.vy = (Math.random() - 0.5) * 3;

  state.remainingCountries = state.activeBalls.filter(b => !b.eliminated).length;

  audio.playShield();
  audio.speak(`${c.name} has been revived by the chat!`);
  showShieldAnnouncement(`♻️ REVIVED • ${c.name.toUpperCase()}`);

  updateHeaderCounters();
  updateProgressUI();
  updateEliminatedGallery();
}

// ==========================================================
// 10. STREAM CONTROL TOOLBAR & USER EVENTS
// ==========================================================
function setupControls() {
  const audioPill = document.getElementById('audio-enable-pill');
  const unlockAudio = () => {
    audio.unlock();
    if (audioPill) audioPill.classList.add('hidden');
  };

  if (audioPill) {
    audioPill.addEventListener('click', () => {
      unlockAudio();
      audio.speak("Respawn Tahmid Flags Battle live stream online!");
    });
  }

  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('autostart') === '1') {
    unlockAudio();
  }

  // Start / Pause Cycle Button
  const btnPlayPause = document.getElementById('ctrl-play-pause');
  const playIcon = document.getElementById('ctrl-play-icon');
  const playLabel = document.getElementById('ctrl-play-label');
  const pauseBadge = document.getElementById('pause-overlay-badge');

  if (btnPlayPause) {
    btnPlayPause.addEventListener('click', () => {
      unlockAudio();
      state.isPaused = !state.isPaused;
      if (state.isPaused) {
        playIcon.textContent = '▶️';
        playLabel.textContent = 'START';
        btnPlayPause.style.borderColor = '#10b981';
        btnPlayPause.style.color = '#34d399';
        if (pauseBadge) pauseBadge.classList.remove('hidden');
      } else {
        playIcon.textContent = '⏸️';
        playLabel.textContent = 'PAUSE';
        btnPlayPause.style.borderColor = '#38bdf8';
        btnPlayPause.style.color = '#38bdf8';
        if (pauseBadge) pauseBadge.classList.add('hidden');
      }
    });
  }

  // Reset Match Button
  const btnReset = document.getElementById('ctrl-reset-match');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      unlockAudio();
      state.cycle++;
      const el = document.getElementById('cycle-indicator');
      if (el) el.textContent = `• CYCLE ${state.cycle} • LIVE`;
      state.isPaused = false;
      if (playIcon) playIcon.textContent = '⏸️';
      if (playLabel) playLabel.textContent = 'PAUSE';
      if (pauseBadge) pauseBadge.classList.add('hidden');
      audio.speak(`Match reset! Battle begins on Respawn Tahmid!`);
      spawnBalls();
      startCountdown();
    });
  }

  // BGM On/Off Toggle Button
  const btnBgm = document.getElementById('ctrl-toggle-bgm');
  const bgmLabel = document.getElementById('ctrl-bgm-label');
  if (btnBgm) {
    btnBgm.addEventListener('click', () => {
      unlockAudio();
      const isOn = audio.toggleBGM();
      bgmLabel.textContent = isOn ? 'BGM: ON' : 'BGM: OFF';
      btnBgm.classList.toggle('active', isOn);
    });
  }

  // BGM Loop Toggle Button
  const btnLoop = document.getElementById('ctrl-toggle-loop');
  const loopLabel = document.getElementById('ctrl-loop-label');
  if (btnLoop) {
    btnLoop.addEventListener('click', () => {
      unlockAudio();
      const isLoop = audio.toggleLoop();
      if (loopLabel) loopLabel.textContent = isLoop ? 'LOOP: ON' : 'LOOP: OFF';
      btnLoop.classList.toggle('active', isLoop);
    });
  }

  // BGM Volume Slider
  const bgmSlider = document.getElementById('ctrl-bgm-slider');
  if (bgmSlider) {
    bgmSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value) / 100;
      audio.setBGMVolume(vol);
    });
  }

  // Voice Commentary On/Off Toggle
  const btnVoice = document.getElementById('ctrl-toggle-voice');
  const voiceLabel = document.getElementById('ctrl-voice-label');
  if (btnVoice) {
    btnVoice.addEventListener('click', () => {
      audio.voiceEnabled = !audio.voiceEnabled;
      voiceLabel.textContent = audio.voiceEnabled ? 'VOICE: ON' : 'VOICE: OFF';
      btnVoice.classList.toggle('active', audio.voiceEnabled);
    });
  }

  // Restore Default Song Button
  const btnDefaultSong = document.getElementById('btn-default-song');
  if (btnDefaultSong) {
    btnDefaultSong.addEventListener('click', () => {
      unlockAudio();
      audio.restoreDefaultSong();
      audio.speak("Default background song restored!");
    });
  }

  // Custom BGM Song Upload File Picker
  const fileInput = document.getElementById('custom-audio-file');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        unlockAudio();
        audio.loadCustomAudio(file);
        audio.speak("Custom background music loaded!");
      }
    });
  }

  // StreamElements Token Update & Sync Button
  const btnConnectSE = document.getElementById('btn-connect-se');
  const seTokenInput = document.getElementById('se-token-input');
  if (btnConnectSE && seTokenInput) {
    btnConnectSE.addEventListener('click', () => {
      const token = seTokenInput.value.trim();
      if (token) {
        streamElementsConfig.jwtToken = token;
        initStreamElements();
        audio.speak("StreamElements synchronized!");
      }
    });
  }

  // StreamElements Chat Simulate Test Button
  const btnTestSE = document.getElementById('btn-test-se-chat');
  if (btnTestSE) {
    btnTestSE.addEventListener('click', () => {
      const sampleNames = ['India', 'Bangladesh', 'Nepal', 'United States', 'Brazil', 'Germany', 'Japan'];
      const pick = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      handleChatMessageText(`Vote for ${pick}!`, `Chatter_${Math.floor(Math.random() * 999)}`);
    });
  }

  // CTA Like Button
  const likeBtn = document.getElementById('like-country-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', (e) => {
      unlockAudio();
      audio.playTick();
      const rect = likeBtn.getBoundingClientRect();
      for (let i = 0; i < 5; i++) {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = ['❤️', '🔥', '👍', '⚡', '🏆'][Math.floor(Math.random() * 5)];
        heart.style.left = `${e.clientX - rect.left + (Math.random() - 0.5) * 60}px`;
        heart.style.top = `${e.clientY - rect.top}px`;
        heart.style.setProperty('--dx', `${(Math.random() - 0.5) * 50}px`);
        likeBtn.appendChild(heart);
        setTimeout(() => heart.remove(), 1200);
      }
    });
  }

  // Streamer Tools Drawer Toggle
  const toggleBtn = document.getElementById('toggle-tools-btn');
  const toolsDrawer = document.getElementById('streamer-tools');
  const toolsChevron = document.getElementById('tools-chevron');
  if (toggleBtn && toolsDrawer) {
    toggleBtn.addEventListener('click', () => {
      toolsDrawer.classList.toggle('collapsed');
      toolsChevron.textContent = toolsDrawer.classList.contains('collapsed') ? '▲' : '▼';
    });
  }

  const btnChatSim = document.getElementById('btn-toggle-chat-sim');
  if (btnChatSim) {
    btnChatSim.addEventListener('click', () => {
      state.simChatActive = !state.simChatActive;
      btnChatSim.textContent = `🤖 Sim Chat: ${state.simChatActive ? 'ON' : 'OFF'}`;
      btnChatSim.style.borderColor = state.simChatActive ? '#00f3ff' : '#64748b';
    });
  }

  const btnShield = document.getElementById('btn-force-shield');
  if (btnShield) {
    btnShield.addEventListener('click', () => {
      const sorted = Object.entries(state.votes).sort((a, b) => b[1].count - a[1].count);
      const topCode = sorted[0] ? sorted[0][0] : 'in';
      const ball = state.activeBalls.find(b => b.code === topCode && !b.eliminated);
      if (ball) {
        ball.shield = true;
        audio.playShield();
        showShieldAnnouncement(`SHIELDED • ${ball.name.toUpperCase()}`);
        audio.speak(`${ball.name} activating protective shield!`);
      }
    });
  }

  function setSpeedMultiplier(newSpeed) {
    state.speedMultiplier = newSpeed;
    const labelText = `${state.speedMultiplier}x`;
    const ctrlLabel = document.getElementById('ctrl-speed-label');
    if (ctrlLabel) ctrlLabel.textContent = labelText;
    const drawerBtn = document.getElementById('btn-speed-toggle');
    if (drawerBtn) drawerBtn.textContent = `⚡ Speed: ${labelText}`;

    if (state.countdownTimer) {
      clearInterval(state.countdownTimer);
      state.countdownTimer = setInterval(() => {
        if (state.isPaused) return;

        state.countdownSeconds--;
        audio.playTick();
        updateCountdownBadge();

        if (state.countdownSeconds === 1) {
          audio.playDoorOpen();
          state.doorTargetAperture = 1.0;
        }

        if (state.countdownSeconds <= 0) {
          triggerDoorElimination();
          state.countdownSeconds = 5;
          updateCountdownBadge();
        }
      }, 1000 / state.speedMultiplier);
    }
  }

  function cycleSpeed() {
    let next = 1.0;
    if (state.speedMultiplier === 0.5) next = 1.0;
    else if (state.speedMultiplier === 1.0) next = 1.5;
    else if (state.speedMultiplier === 1.5) next = 2.0;
    else next = 0.5;
    setSpeedMultiplier(next);
  }

  const ctrlSpeedBtn = document.getElementById('ctrl-toggle-speed');
  if (ctrlSpeedBtn) {
    ctrlSpeedBtn.addEventListener('click', cycleSpeed);
  }

  const btnSpeed = document.getElementById('btn-speed-toggle');
  if (btnSpeed) {
    btnSpeed.addEventListener('click', cycleSpeed);
  }

  const btnElim = document.getElementById('btn-trigger-elim');
  if (btnElim) {
    btnElim.addEventListener('click', () => {
      triggerDoorElimination();
    });
  }

  const manualInput = document.getElementById('manual-chat-input');
  const btnSendChat = document.getElementById('btn-send-chat');
  const sendVote = () => {
    const val = manualInput.value.trim().toLowerCase();
    if (!val) return;
    const match = COUNTRIES_DATA.find(c => c.name.toLowerCase() === val || c.code.toLowerCase() === val);
    if (match) {
      castVote(match.code);
      manualInput.value = '';
    }
  };

  if (btnSendChat) btnSendChat.addEventListener('click', sendVote);
  if (manualInput) {
    manualInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendVote();
    });
  }

  setInterval(simulateChatVote, 1300);
  window.addEventListener('resize', resizeArena);
}

// ==========================================================
// 11. INITIALIZATION ON LOAD
// ==========================================================
window.addEventListener('DOMContentLoaded', () => {
  initStreamElements();
  resizeArena();
  spawnBalls();
  startCountdown();
  startEngagementEngine();
  updateChatSupportUI();
  setupControls();

  requestAnimationFrame(mainLoop);
});
