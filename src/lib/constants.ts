import type { BookStatus, Category } from "./types";

export const STATUS_LABELS: Record<BookStatus, string> = {
  unread: "Unread",
  reading: "Reading",
  done: "Read",
  paused: "Paused",
};

export const STATUSES: BookStatus[] = ["unread", "reading", "done", "paused"];

const EMOJI_MAP: Record<string, string> = {
  mindset: "\u{1F9E0}",
  psychology: "\u{1F52C}",
  money: "\u{1F4B0}",
  productivity: "⚡",
  influence: "\u{1F5E3}️",
  trading: "\u{1F4C8}",
  business: "\u{1F3D9}️",
  strategy: "♟️",
  leadership: "\u{1F3DB}️",
  default: "\u{1F4D6}",
};

export function catEmoji(id: string | null | undefined): string {
  if (!id) return EMOJI_MAP.default;
  const lower = id.toLowerCase();
  const key = Object.keys(EMOJI_MAP).find((k) => lower.includes(k));
  return key ? EMOJI_MAP[key] : EMOJI_MAP.default;
}

const COVER_COLORS = [
  "#f0eeeb",
  "#e8e6e2",
  "#ede8e0",
  "#e6e8ec",
  "#e8ece6",
  "#ece6e8",
  "#e8ece8",
  "#f0ebe8",
];

export function bookColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return COVER_COLORS[hash % COVER_COLORS.length];
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "mindset", name: "Mindset & self-mastery" },
  { id: "psychology", name: "Psychology & cognitive science" },
  { id: "money", name: "Money, wealth & investing" },
  { id: "productivity", name: "Productivity & habits" },
  { id: "influence", name: "Influence & communication" },
  { id: "trading", name: "Trading & market mastery" },
  { id: "business", name: "Business & entrepreneurship" },
  { id: "strategy", name: "Strategy & power" },
  { id: "leadership", name: "Leadership" },
];

export interface SeedBook {
  title: string;
  author: string;
  cat: string;
  status: BookStatus;
  star: boolean;
  owned?: boolean;
  note?: string;
}

export const DEFAULT_BOOKS: SeedBook[] = [
  { title: "The Power of Now", author: "Eckhart Tolle", cat: "mindset", status: "unread", star: false },
  { title: "The Courage to Be Disliked", author: "Ichiro Kishimi", cat: "mindset", status: "unread", star: true },
  { title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", cat: "mindset", status: "unread", star: true },
  { title: "12 Rules for Life", author: "Jordan Peterson", cat: "mindset", status: "unread", star: false },
  { title: "Ikigai", author: "Hector Garcia", cat: "mindset", status: "unread", star: false },
  { title: "Life's Amazing Secrets", author: "Gaur Gopal Das", cat: "mindset", status: "unread", star: false },
  { title: "The Power of Positive Thinking", author: "Norman Vincent Peale", cat: "mindset", status: "unread", star: false },
  { title: "The Power of Your Subconscious Mind", author: "Joseph Murphy", cat: "mindset", status: "done", star: false, owned: true },
  { title: "Do Epic Shit", author: "Ankur Warikoo", cat: "mindset", status: "unread", star: false },
  { title: "101 Essays That Will Change the Way You Think", author: "Brianna Wiest", cat: "mindset", status: "unread", star: false },
  { title: "Hell Yeah or No", author: "Derek Sivers", cat: "mindset", status: "unread", star: true },
  { title: "The Almanack of Naval Ravikant", author: "Eric Jorgenson", cat: "mindset", status: "done", star: false, owned: true },
  { title: "Quiet", author: "Susan Cain", cat: "psychology", status: "unread", star: false },
  { title: "Factfulness", author: "Hans Rosling", cat: "psychology", status: "unread", star: false },
  { title: "Misbelief", author: "Dan Ariely", cat: "psychology", status: "unread", star: false },
  { title: "Think Again", author: "Adam Grant", cat: "psychology", status: "unread", star: false },
  { title: "Flow", author: "Mihaly Csikszentmihalyi", cat: "psychology", status: "unread", star: false },
  { title: "Emotional Intelligence", author: "Daniel Goleman", cat: "psychology", status: "unread", star: false },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", cat: "psychology", status: "unread", star: false },
  { title: "The Art of Thinking Clearly", author: "Rolf Dobelli", cat: "psychology", status: "unread", star: false },
  { title: "The Intelligent Trap", author: "", cat: "psychology", status: "unread", star: false },
  { title: "The Psychology of Money", author: "Morgan Housel", cat: "money", status: "unread", star: true },
  { title: "The Richest Man in Babylon", author: "George S. Clason", cat: "money", status: "unread", star: false },
  { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", cat: "money", status: "done", star: true, owned: true },
  { title: "The Secrets of the Millionaire Mind", author: "T. Harv Eker", cat: "money", status: "unread", star: true },
  { title: "Think and Grow Rich", author: "Napoleon Hill", cat: "money", status: "unread", star: true },
  { title: "The Compound Effect", author: "Darren Hardy", cat: "money", status: "unread", star: false },
  { title: "I Will Teach You to Be Rich", author: "Ramit Sethi", cat: "money", status: "unread", star: false },
  { title: "The Millionaire Fastlane", author: "M. J. DeMarco", cat: "money", status: "unread", star: false, owned: true, note: "Up next" },
  { title: "The Bitcoin Standard", author: "Saifedean Ammous", cat: "money", status: "unread", star: false },
  { title: "Die with Zero", author: "Bill Perkins", cat: "money", status: "unread", star: true },
  { title: "Entrusted", author: "Andrew Howell", cat: "money", status: "unread", star: true },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", cat: "productivity", status: "done", star: true, owned: true },
  { title: "Atomic Habits", author: "James Clear", cat: "productivity", status: "unread", star: true },
  { title: "Getting Things Done", author: "David Allen", cat: "productivity", status: "unread", star: true },
  { title: "The ONE Thing", author: "Gary Keller", cat: "productivity", status: "unread", star: true },
  { title: "Focus on What Matters", author: "Darius Foroux", cat: "productivity", status: "unread", star: false },
  { title: "Someday Is Today", author: "Matthew Dicks", cat: "productivity", status: "unread", star: true },
  { title: "Buy Back Your Time", author: "Dan Martell", cat: "productivity", status: "unread", star: true },
  { title: "Deep Utopia", author: "Nick Bostrom", cat: "productivity", status: "unread", star: false },
  { title: "Never Split the Difference", author: "Chris Voss", cat: "influence", status: "unread", star: false, owned: true },
  { title: "How to Talk to Anyone", author: "Leil Lowndes", cat: "influence", status: "unread", star: false },
  { title: "How to Win Friends and Influence People", author: "Dale Carnegie", cat: "influence", status: "unread", star: false },
  { title: "How to Read a Person Like a Book", author: "Gerard I. Nierenberg", cat: "influence", status: "unread", star: false },
  { title: "Pitch Anything", author: "Oren Klaff", cat: "influence", status: "unread", star: false },
  { title: "Getting More", author: "Stuart Diamond", cat: "influence", status: "unread", star: false },
  { title: "Pre-Suasion", author: "Robert Cialdini", cat: "influence", status: "unread", star: false },
  { title: "Getting to Yes", author: "Fisher & Ury", cat: "influence", status: "unread", star: false },
  { title: "The Psychology of Persuasion", author: "Robert Cialdini", cat: "influence", status: "unread", star: false },
  { title: "The Diary of a CEO", author: "Steven Bartlett", cat: "influence", status: "unread", star: false },
  { title: "Trading in the Zone", author: "Mark Douglas", cat: "trading", status: "paused", star: false, owned: true, note: "Paused after Ch. 1" },
  { title: "The Disciplined Trader", author: "Mark Douglas", cat: "trading", status: "unread", star: false },
  { title: "Market Wizards", author: "Jack D. Schwager", cat: "trading", status: "unread", star: false },
  { title: "Rework", author: "Jason Fried", cat: "business", status: "unread", star: true },
  { title: "The E-Myth Revisited", author: "Michael E. Gerber", cat: "business", status: "unread", star: true },
  { title: "Zero to One", author: "Peter Thiel", cat: "business", status: "unread", star: true, owned: true },
  { title: "The Hard Thing About Hard Things", author: "Ben Horowitz", cat: "business", status: "unread", star: false },
  { title: "The Lean Startup", author: "Eric Ries", cat: "business", status: "unread", star: false },
  { title: "The $100 Startup", author: "Chris Guillebeau", cat: "business", status: "unread", star: false },
  { title: "The $100M Offers", author: "Alex Hormozi", cat: "business", status: "unread", star: false },
  { title: "The Millionaire Fastlane", author: "M. J. DeMarco", cat: "business", status: "unread", star: false, owned: true },
  { title: "The Personal MBA", author: "Josh Kaufman", cat: "business", status: "reading", star: false, owned: true },
  { title: "Traction", author: "Gabriel Weinberg", cat: "business", status: "unread", star: true },
  { title: "Good to Great", author: "Jim Collins", cat: "business", status: "unread", star: true },
  { title: "The Entrepreneur Revolution", author: "Daniel Priestley", cat: "business", status: "unread", star: true },
  { title: "80/20 Sales and Marketing", author: "Perry Marshall", cat: "business", status: "unread", star: false, owned: true },
  { title: "The First 20 Hours", author: "Josh Kaufman", cat: "business", status: "unread", star: false },
  { title: "The Art of War", author: "Sun Tzu", cat: "strategy", status: "unread", star: false },
  { title: "The 48 Laws of Power", author: "Robert Greene", cat: "strategy", status: "unread", star: false },
  { title: "Tools of Titans", author: "Tim Ferriss", cat: "strategy", status: "unread", star: true },
  { title: "The 4-Hour Workweek", author: "Tim Ferriss", cat: "strategy", status: "unread", star: true },
  { title: "The Third Door", author: "Alex Banayan", cat: "strategy", status: "unread", star: true },
  { title: "Reminiscences of a Stock Operator", author: "Edwin Lefèvre", cat: "trading", status: "unread", star: false },
  { title: "The Mental Game of Trading", author: "Jared Tendler", cat: "trading", status: "unread", star: false },
  { title: "Best Loser Wins", author: "Tom Hougaard", cat: "trading", status: "unread", star: false },
  { title: "The Intelligent Investor", author: "Benjamin Graham", cat: "trading", status: "unread", star: false },
  { title: "INSPIRED: How to Create Tech Products Customers Love", author: "Marty Cagan", cat: "business", status: "unread", star: false },
  { title: "Hooked: How to Build Habit-Forming Products", author: "Nir Eyal", cat: "business", status: "unread", star: false },
  { title: "Sprint", author: "Jake Knapp", cat: "business", status: "unread", star: false },
  { title: "Cracking the PM Interview", author: "Gayle Laakmann McDowell & Jackie Bavaro", cat: "business", status: "unread", star: false },
  { title: "Deep Work", author: "Cal Newport", cat: "productivity", status: "unread", star: false },
  { title: "Mental Models", author: "Peter Hollins", cat: "psychology", status: "unread", star: false },
  { title: "Your Next Five Moves", author: "Patrick Bet-David", cat: "business", status: "unread", star: false },
  { title: "The Laws of Human Nature", author: "Robert Greene", cat: "influence", status: "unread", star: false },
  { title: "Surrounded by Idiots", author: "Thomas Erikson", cat: "influence", status: "unread", star: false },
  { title: "The Black Swan", author: "Nassim Nicholas Taleb", cat: "trading", status: "unread", star: false },
  { title: "Antifragile", author: "Nassim Nicholas Taleb", cat: "trading", status: "unread", star: false },
  { title: "Meditations", author: "Marcus Aurelius", cat: "leadership", status: "unread", star: false, owned: false },
  { title: "Ego Is the Enemy", author: "Ryan Holiday", cat: "leadership", status: "unread", star: false, owned: false },
  { title: "Extreme Ownership", author: "Jocko Willink & Leif Babin", cat: "leadership", status: "unread", star: false, owned: false },
  { title: "Leaders Eat Last", author: "Simon Sinek", cat: "leadership", status: "unread", star: false, owned: false },
  { title: "The Obstacle Is the Way", author: "Ryan Holiday", cat: "leadership", status: "unread", star: false, owned: false },
  { title: "Mindset", author: "Carol Dweck", cat: "leadership", status: "unread", star: false, owned: false },
];
