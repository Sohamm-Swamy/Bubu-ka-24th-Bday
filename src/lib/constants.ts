// ============================================================
// EDIT THESE VALUES TO CUSTOMIZE THE GAME
// ============================================================

export const RAPIDO_PHONE_NUMBER = "+918169584844"; // ← INSERT REAL NUMBER

export const OTP_CODE = "1105"; // ← The 4-digit OTP to reveal

export const LOCATIONS = [
  {
    id: 1,
    name: "Fun Art at Upvan Lake",
    clue: `🎨 Not Paris, but close enough for two.
Brushes, clay, and a peaceful view.
Paint my face, I'll sculpt yours too —
Our messy masterpiece is overdue!`,
    coordinates: { lat: 19.222114111157563, lng: 72.95507754626173 },
    answer: "upvan lake",
    alternateAnswers: ["upvan", "upvan lake", "art", "fun art", "fun art upvan", "lake"],
    mapZoom: 18,
  },
  {
    id: 2,
    name: "Lake Shore Mall",
    clue: `🎳 Knock ten soldiers down, then switch the game —
Three stores, five minutes, find the weirdest frame.
Bowling shoes and shopping bags in hand,
Bet you can't out-weird me... or can you? 😏`,
    coordinates: { lat: 19.209009, lng: 72.971607 },
    answer: "Lake Shore Mall",
    alternateAnswers: ["bowling alley", "bowl", "bowling", "lake shore", "lakeshore", "lakeshore mall", "lake shore mall", "mall"],
    mapZoom: 18,
  },
  {
    id: 3,
    name: "Gremy All Day Cafe",
    clue: `🎂 Gifts on the table, cards in the deck,
24 questions, birthday girl — what comes next?
An "all day" spot with aesthetic views,
Good food, surprises, and zero bad news!`,
    coordinates: { lat: 19.25154638638015, lng: 72.98284015442815 },
    answer: "gremy all day cafe",
    alternateAnswers: ["gremy", "gremy cafe", "cafe", "birthday dinner", "aesthetic cafe", "gremy all day"],
    mapZoom: 18,
  },
];

export const BONUS_SERVICES = [
  "One full day of zero teasing — absolute peace 😇",
  "A song I have to record and post the day you tell me too 🌙",
  "A day of your choice where we eat Chinese on the street without any complaints 🥡",
  "3 sleepovers any day you want, with no questions asked 🛌",
  "An exclusive shopping spree and we buy whatever you want to see me in (within reason, of course) 🛍️",
];

export const ARRIVAL_RADIUS_METERS = 50; // GPS accuracy threshold
export const CLUE_TIMER_SECONDS = 60;    // Countdown before map hint appears
export const KISSES_REQUIRED = 24;       // For the OTP reveal message

// Your email address to receive the selected rewards
export const YOUR_EMAIL = "sohamm746@gmail.com";

// ============================================================
// DEV MODE SETTINGS
// ============================================================
export const DEV_MODE_ENABLED = false; // Set to TRUE for testing, FALSE for production
