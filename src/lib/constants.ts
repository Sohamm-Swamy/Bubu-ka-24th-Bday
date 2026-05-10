// ============================================================
// EDIT THESE VALUES TO CUSTOMIZE THE GAME
// ============================================================

export const RAPIDO_PHONE_NUMBER = "+918169584844"; // ← INSERT REAL NUMBER

export const OTP_CODE = "1105"; // ← The 4-digit OTP to reveal

export const LOCATIONS = [
  {
    id: 1,
    name: "Photo Booth",
    clue: "Our memories are frozen in time here, one flash at a time. Where smiles become permanent and laughter echoes on paper. Find where we capture our best moments together!",
    coordinates: { lat: 0.0, lng: 0.0 }, // ← INSERT REAL COORDS
    answer: "photo booth", // ← case-insensitive match
    alternateAnswers: ["photobooth", "photo"], // ← also accepted
    mapZoom: 18,
  },
  {
    id: 2,
    name: "Bowling",
    clue: "Knock them all down, one pin at a time. This is where friendly competition becomes our love language. Lace up and let the good times roll!",
    coordinates: { lat: 19.209009, lng: 72.971607 }, // ← INSERT REAL COORDS
    answer: "bowling",
    alternateAnswers: ["bowling alley", "bowl", "bowling"],
    mapZoom: 18,
  },
  {
    id: 3,
    name: "Cafe",
    clue: "The aroma of warmth fills the air here. Where conversations flow as smoothly as the drinks. Our favorite corner table is waiting for us!",
    coordinates: { lat: 0.0, lng: 0.0 }, // ← INSERT REAL COORDS
    answer: "cafe",
    alternateAnswers: ["coffee", "coffee shop", "café", "aesthetic cafe"],
    mapZoom: 18,
  },
];

export const BONUS_SERVICES = [
  "One surprise breakfast in bed (date TBD by you)",
  "A full movie night of YOUR choice, no complaints",
  "One full day of zero teasing — absolute peace",
  "A customized playlist made just for you",
  "One free 'I was wrong' — no questions asked",
];

export const ARRIVAL_RADIUS_METERS = 50; // GPS accuracy threshold
export const CLUE_TIMER_SECONDS = 60;    // Countdown before map hint appears
export const KISSES_REQUIRED = 24;       // For the OTP reveal message
