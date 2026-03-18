// ===== CONFIG =====
dayjs.extend(dayjs_plugin_utc);

const CONFIG = {
  storageKey: "subtrack_subscriptions",
  settingsKey: "subtrack_settings",
  defaultCurrency: "₴",
};

const POPULAR_SERVICES = [
  { name: "Netflix", category: "Стрімінг", price: 99 },
  { name: "Spotify", category: "Стрімінг", price: 69 },
  { name: "Apple Music", category: "Стрімінг", price: 69 },
  { name: "YouTube Premium", category: "Стрімінг", price: 99 },
  { name: "Disney+", category: "Стрімінг", price: 99 },
  { name: "iCloud+", category: "Хмарні сховища", price: 99 },
  { name: "Google Drive", category: "Хмарні сховища", price: 99 },
  { name: "Dropbox", category: "Хмарні сховища", price: 99 },
  { name: "Adobe Creative Cloud", category: "Робота", price: 299 },
  { name: "Microsoft 365", category: "Робота", price: 69 },
  { name: "Figma", category: "Робота", price: 99 },
  { name: "Notion", category: "Робота", price: 99 },
  { name: "Telegram Premium", category: "Інше", price: 49 },
  { name: "Canva Pro", category: "Робота", price: 99 },
  { name: "ChatGPT Plus", category: "Робота", price: 199 },
];
