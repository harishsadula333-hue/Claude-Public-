// Business settings and service catalogue. Edit this file to change what the bot offers.

export const BUSINESS = {
  name: 'Sundarlysh Events',
  tagline: 'Care with Style ✨',
  instagram: '@sundarlyshevents',
  cities: ['Bengaluru', 'Hyderabad'],
  responseTime: 'within 24 hours',
  timezone: 'Asia/Kolkata',
};

// kind: controls wording ("guests" vs "participants").
// List limits (WhatsApp): row title ≤ 24 chars, description ≤ 72 chars, ≤ 10 rows in one list.
export const CATEGORIES = [
  { id: 'wedding', title: 'Weddings' },
  { id: 'bars', title: 'Experience Bars' },
  { id: 'workshops', title: 'Workshops (all ages)' },
  { id: 'christmas', title: 'Christmas Specials' },
];

export const SERVICES = [
  { id: 'wedding_planning', category: 'wedding', kind: 'event', title: 'Wedding Planning & Décor',
    desc: 'Planning, décor, vendors, guest management & on-day execution' },
  { id: 'ubtan_bar', category: 'bars', kind: 'event', title: 'The Ubtan Bar',
    desc: 'A DIY haldi glow ritual for wedding & party guests' },
  { id: 'mehendi_glitter', category: 'bars', kind: 'event', title: 'Mehendi & Glitter Bar',
    desc: 'Kundan mehendi art + faux freckles & glitter bar for the ladies' },
  { id: 'decoden_bar', category: 'bars', kind: 'event', title: 'Decoden Frosting Bar',
    desc: 'Whipped-cream art for phone cases & keepsakes' },
  { id: 'sand_candle', category: 'workshops', kind: 'workshop', title: 'Sand Candle Making',
    desc: 'Pour, layer & take home your own candle. All ages' },
  { id: 'bedazzle', category: 'workshops', kind: 'workshop', title: 'Bedazzle Workshop',
    desc: 'Add sparkle to jackets, bags & more. All ages' },
  { id: 'art_3d', category: 'workshops', kind: 'workshop', title: '3D Art Workshop',
    desc: 'Textured art sessions, perfect for cafés' },
  { id: 'cake_paint', category: 'christmas', kind: 'workshop', title: 'Cake & Paint',
    desc: 'Paint your own Christmas cake. All ages' },
  { id: 'canvas_tree', category: 'christmas', kind: 'workshop', title: 'Mini Canvas Tree Lights',
    desc: 'Paint a mini canvas tree, then light it up. Christmas only' },
  { id: 'pipe_tree', category: 'christmas', kind: 'workshop', title: 'Pipe-Cleaner Xmas Trees',
    desc: 'Twist & shape your own Christmas tree. Christmas only' },
];

export const TIME_SLOTS = [
  { id: 'morning', title: 'Morning' },
  { id: 'afternoon', title: 'Afternoon' },
  { id: 'evening', title: 'Evening' },
];

export const GUEST_RANGES = [
  { id: 'upto25', title: 'Up to 25' },
  { id: '26_50', title: '26 – 50' },
  { id: '51_100', title: '51 – 100' },
  { id: '101_250', title: '101 – 250' },
  { id: '250plus', title: '250+' },
];

export const SESSION_TIMEOUT_MIN = 60;      // abandon a half-finished booking after this
export const HANDOFF_HOURS = 12;            // bot stays quiet after "Talk to us"

export function env() {
  const e = process.env;
  return {
    port: Number(e.PORT || 3000),
    verifyToken: e.WHATSAPP_VERIFY_TOKEN || '',
    accessToken: e.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: e.WHATSAPP_PHONE_NUMBER_ID || '',
    appSecret: e.WHATSAPP_APP_SECRET || '',
    graphVersion: e.GRAPH_API_VERSION || 'v24.0',
    adminNumbers: (e.ADMIN_NUMBERS || '').split(',').map((s) => s.replace(/\D/g, '')).filter(Boolean),
    adminToken: e.ADMIN_DASHBOARD_TOKEN || '',
    dbPath: e.DB_PATH || './data/bookings.db',
    adminTemplate: e.ADMIN_ALERT_TEMPLATE || '',          // optional approved template for alerts
    customerTemplate: e.CUSTOMER_UPDATE_TEMPLATE || '',   // optional approved template for updates
    templateLang: e.TEMPLATE_LANGUAGE || 'en',
  };
}
