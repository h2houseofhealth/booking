const fs = require('fs');
const https = require('https');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const Razorpay = require('razorpay');
const multer = require('multer');

loadEnvFromFile(path.join(__dirname, '.env'));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_change_me';
const IS_PRODUCTION = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
const TOKEN_COOKIE = 'booking_portal_token';
const ALLOWED_SLOT_START_TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
const MAX_BOOKINGS_PER_SLOT_HYDROGEN = 8;
const MAX_BOOKINGS_PER_SLOT_IV = 2;
const OTP_TTL_MINUTES = 10;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const SENDGRID_API_KEY = String(process.env.SENDGRID_API_KEY || '').trim();
const SENDGRID_OTP_TEMPLATE_ID = String(process.env.SENDGRID_OTP_TEMPLATE_ID || '').trim();
const SENDGRID_FROM_EMAIL = String(
  process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER || ''
).trim();
const AVATAR_MAX_SIZE_BYTES = 10 * 1024 * 1024;
const SEED_DEMO_DOCTORS = String(process.env.SEED_DEMO_DOCTORS || 'false').toLowerCase() === 'true';
const SES_API_REGION = (
  process.env.SES_API_REGION ||
  process.env.AWS_REGION ||
  regionFromSmtpHost(process.env.SMTP_HOST) ||
  'ap-southeast-2'
).trim();
const SES_API_ACCESS_KEY_ID = (process.env.SES_API_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '').trim();
const SES_API_SECRET_ACCESS_KEY = (
  process.env.SES_API_SECRET_ACCESS_KEY ||
  process.env.AWS_SECRET_ACCESS_KEY ||
  ''
).trim();
const SES_API_SESSION_TOKEN = (process.env.SES_API_SESSION_TOKEN || process.env.AWS_SESSION_TOKEN || '').trim();

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}
const SERVICE_CATALOG = [
  {
    category: 'HYDROGEN SESSION',
    name: 'H2 Single Session',
    priceInr: 4800,
    nonMemberPriceInr: 9500,
    memberPriceInr: 4800,
    includes: '1 Hydrogen Session',
    description:
      'Single hydrogen session for immediate recovery and cellular wellness support. Non-member pricing: Rs. 9,500.',
  },
  {
    category: 'HYDROGEN SESSION',
    name: 'H2 1 Week Program (4 Sessions)',
    priceInr: 12000,
    nonMemberPriceInr: 28000,
    memberPriceInr: 12000,
    includes: '4 Hydrogen Sessions in 1 week',
    description:
      'Structured weekly session plan designed for consistency and better recovery outcomes. Non-member pricing: Rs. 28,000.',
  },
  {
    category: 'HYDROGEN SESSION',
    name: 'H2 2 Week Program (8 Sessions)',
    priceInr: 22000,
    nonMemberPriceInr: 48000,
    memberPriceInr: 22000,
    includes: '8 Hydrogen Sessions in 2 weeks',
    description:
      'Enhanced two-week protocol to support sustained detox and energy optimization. Non-member pricing: Rs. 48,000.',
  },
  {
    category: 'HYDROGEN SESSION',
    name: 'H2 1 Month Program (16 Sessions)',
    priceInr: 32000,
    nonMemberPriceInr: 64000,
    memberPriceInr: 32000,
    includes: '16 Hydrogen Sessions in 1 month',
    description:
      'Monthly core plan for ongoing metabolic, inflammation, and vitality support. Non-member pricing: Rs. 64,000.',
  },
  {
    category: 'HYDROGEN SESSION',
    name: 'H2 Intensive 1 Month (30 Sessions)',
    priceInr: 46000,
    nonMemberPriceInr: 90000,
    memberPriceInr: 46000,
    includes: '30 Hydrogen Sessions in 1 month',
    description:
      'High-frequency monthly program for users seeking accelerated therapeutic benefits. Non-member pricing: Rs. 90,000.',
  },
  {
    category: 'HYDROGEN SESSION',
    name: 'H2 Intensive 3 Month (90 Sessions)',
    priceInr: 100000,
    nonMemberPriceInr: 150000,
    memberPriceInr: 100000,
    includes: '90 Hydrogen Sessions in 3 months',
    description:
      'Long-cycle intensive plan built for deep and sustained wellness transformation. Non-member pricing: Rs. 1,50,000.',
  },
  {
    category: 'IV THERAPIES',
    name: 'Gym Hero',
    priceInr: 4800,
    includes: 'Normal saline, B1, B2, B6, B12, Vitamin C, Magnesium, Glutathione',
    description:
      'Designed for fitness enthusiasts to support muscle recovery, hydration, energy production, and antioxidant support after intense workouts.',
  },
  {
    category: 'IV THERAPIES',
    name: 'Skin Luminosity',
    priceInr: 5900,
    includes: 'B1, B2, B6, B12, Vitamin C, Biotin, Zinc, Glutathione',
    description:
      'Promotes brighter, clearer skin by supporting collagen production, antioxidant protection, and overall skin health.',
  },
  {
    category: 'IV THERAPIES',
    name: 'Ultimate Immunity',
    priceInr: 6500,
    includes: 'Vitamin C, N-Acetyl Cysteine (NAC), Zinc, B1, B2, B6, B12, Alpha Lipoic Acid, Glutathione',
    description:
      'A powerful immune support blend that helps fight infections, reduce oxidative stress, and improve overall wellness.',
  },
  {
    category: 'IV THERAPIES',
    name: 'Hangover Cure',
    priceInr: 4500,
    includes: 'Normal saline, B1, B2, B6, B12, Glutathione, Magnesium, Ketorol, Ondansetron',
    description:
      'Rehydrates the body, relieves nausea and headache, and restores energy levels after alcohol consumption.',
  },
  {
    category: 'IV THERAPIES',
    name: 'Migraine',
    priceInr: 4500,
    includes: 'B1, B2, B6, B12, Magnesium, Ondansetron, Ketorol',
    description:
      'Helps reduce migraine intensity by easing pain, correcting deficiencies, and relieving nausea.',
  },
  {
    category: 'IV THERAPIES',
    name: 'Stress Buster',
    priceInr: 4500,
    includes: 'B1, B2, B6, B12, Vitamin C, Magnesium, Zinc',
    description:
      'Supports nervous system balance, reduces fatigue, and helps manage physical and mental stress.',
  },
  {
    category: 'IV THERAPIES',
    name: 'The House Drip',
    priceInr: 7500,
    includes:
      'B1, B2, B6, B12, Folic Acid, Vitamin C, Magnesium, Alpha Lipoic Acid, N-Acetyl Cysteine, Zinc, Biotin, L-Arginine, L-Carnitine',
    description:
      'A comprehensive wellness infusion designed for energy, immunity, detox support, metabolism, and overall vitality.',
  },
  {
    category: 'IV SHOTS',
    name: 'Recharge',
    priceInr: 2300,
    includes: 'B1, B2, B6, B12, Vitamin C',
    description: 'Quick energy booster that helps reduce fatigue and improve daily performance.',
  },
  {
    category: 'IV SHOTS',
    name: 'Focus',
    priceInr: 2900,
    includes: 'B1, B2, B6, B12, Glutathione',
    description: 'Supports mental clarity, concentration, and antioxidant protection.',
  },
  {
    category: 'IV SHOTS',
    name: 'Relax',
    priceInr: 2400,
    includes: 'Magnesium, Zinc, B1, B2, B6',
    description: 'Helps calm the nervous system, ease muscle tension, and promote relaxation.',
  },
  {
    category: 'IV SHOTS',
    name: 'Beauty',
    priceInr: 3800,
    includes: 'B1, B2, B3, B5, B6, Biotin, Vitamin C, Zinc, Glutathione',
    description: 'Enhances skin glow, supports hair and nail strength, and provides antioxidant benefits.',
  },
  {
    category: 'IV SHOTS',
    name: 'Gym Pump',
    priceInr: 3300,
    includes: 'B1, B2, B6, Glutathione, L-Arginine, L-Carnitine',
    description: 'Improves blood flow, endurance, and workout performance.',
  },
  {
    category: 'IV SHOTS',
    name: 'Detox',
    priceInr: 3800,
    includes: 'Vitamin C, N-Acetyl Cysteine, Zinc, Glutathione',
    description: 'Supports liver function, detoxification pathways, and cellular antioxidant defense.',
  },
  {
    category: 'IV SHOTS',
    name: 'Immunity Boost',
    priceInr: 3900,
    includes: 'B1, B2, B6, Vitamin C, N-Acetyl Cysteine, Zinc, Glutathione',
    description: 'Strengthens immune response and helps protect against infections.',
  },
  {
    category: 'IV SHOTS',
    name: 'The House Push',
    priceInr: 4800,
    includes: 'B1, B2, B6, B12, Vitamin C, Biotin, N-Acetyl Cysteine, Zinc, Glutathione',
    description: 'A premium wellness shot designed for full-body support, energy enhancement, and immune strengthening.',
  },
];

const MEMBERSHIP_PLANS = [
  {
    id: 'h2_single',
    name: '1 Person Membership',
    peopleCount: 1,
    priceInr: 84000,
    validityDays: 365,
    h2SessionsIncluded: 16,
    perks: 'Includes labs, imaging, genome testing, concierge primary care, radiology and 16 H2 sessions.',
  },
  {
    id: 'h2_two',
    name: '2 Person Membership',
    peopleCount: 2,
    priceInr: 160000,
    validityDays: 365,
    h2SessionsIncluded: 32,
    perks: 'Family-focused plan with all membership perks and hydrogen pricing benefits.',
  },
  {
    id: 'h2_four',
    name: '4 Person Membership',
    peopleCount: 4,
    priceInr: 288000,
    validityDays: 365,
    h2SessionsIncluded: 64,
    perks: 'Best value for larger families with full annual membership access.',
  },
  {
    id: 'h2_add_person',
    name: 'Add Person',
    peopleCount: 1,
    priceInr: 78000,
    validityDays: 365,
    h2SessionsIncluded: 16,
    perks: 'Add one more member to an existing plan with full hydrogen pricing benefits.',
  },
];
const MEMBERSHIP_VALIDITY_DAYS = Number(MEMBERSHIP_PLANS.find((plan) => plan.id === 'h2_single')?.validityDays || 365);

const app = express();
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'booking.db');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
const razorpay = RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  : null;

migrate();
seedAdmin();

const requestCounters = new Map();

function loadEnvFromFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = String(rawLine || '').trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(uploadsDir));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      cb(null, `avatar_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  }),
  limits: {
    fileSize: AVATAR_MAX_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG, or WEBP images are allowed'), ok);
  },
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', rateLimit({ windowMs: 60_000, max: 40 }));

app.post('/api/auth/register/start', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!name || !email) {
    return res.status(400).json({ message: 'name and email are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'valid email is required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ message: 'email already registered' });
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();
  const placeholderPasswordHash = bcrypt.hashSync(crypto.randomBytes(24).toString('hex'), 10);
  db.prepare(
    `INSERT INTO pending_registrations (email, name, password_hash, otp_hash, expires_at, attempts_left, otp_verified, created_at)
     VALUES (?, ?, ?, ?, ?, 5, 0, datetime('now'))
     ON CONFLICT(email) DO UPDATE SET
       name = excluded.name,
       password_hash = excluded.password_hash,
       otp_hash = excluded.otp_hash,
       expires_at = excluded.expires_at,
       attempts_left = 5,
       otp_verified = 0,
       created_at = datetime('now')`
  ).run(email, name, placeholderPasswordHash, otpHash, expiresAt);

  const mailResult = await sendOtpEmail(email, otp);
  if (!mailResult.ok) {
    return res.status(mailResult.statusCode || 500).json({ message: mailResult.message });
  }

  return res.status(200).json({
    message: `Signup OTP sent to ${email}. It expires in ${OTP_TTL_MINUTES} minutes.`,
    otpRequired: true,
    verificationRequired: true,
  });
});

app.post('/api/auth/register', async (_req, res) => {
  return res.status(410).json({
    message: 'Signup flow changed. Use /api/auth/register/start, /api/auth/register/verify, and /api/auth/register/complete.',
  });
});

app.post('/api/auth/register/verify-email', async (req, res) => {
  return res.status(410).json({
    message: 'Use /api/auth/register/start with name and email to begin signup.',
  });
});

app.post('/api/auth/register/verify', (req, res) => {
  const { email, otp } = req.body || {};
  if (!email || !otp) {
    return res.status(400).json({ message: 'email and otp are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const pending = db.prepare(
    `SELECT email, name, otp_hash AS otpHash, expires_at AS expiresAt, attempts_left AS attemptsLeft, otp_verified AS otpVerified
     FROM pending_registrations
     WHERE email = ?`
  ).get(normalizedEmail);

  if (!pending) {
    return res.status(404).json({ message: 'No pending registration found. Please register again.' });
  }

  if (Number(pending.otpVerified) === 1) {
    return res.json({
      verified: true,
      verificationStatus: 'SUCCESS',
      message: 'OTP already verified. Please set your password to complete signup.',
    });
  }

  if (new Date(pending.expiresAt).getTime() < Date.now()) {
    db.prepare('DELETE FROM pending_registrations WHERE email = ?').run(normalizedEmail);
    return res.status(400).json({ message: 'OTP expired. Please register again.' });
  }

  const isOtpValid = hashOtp(String(otp).trim()) === pending.otpHash;
  if (!isOtpValid) {
    db.prepare(
      'UPDATE pending_registrations SET attempts_left = attempts_left - 1 WHERE email = ?'
    ).run(normalizedEmail);

    const updated = db
      .prepare('SELECT attempts_left AS attemptsLeft FROM pending_registrations WHERE email = ?')
      .get(normalizedEmail);

    if (!updated || updated.attemptsLeft <= 0) {
      db.prepare('DELETE FROM pending_registrations WHERE email = ?').run(normalizedEmail);
      return res.status(400).json({ message: 'Too many invalid OTP attempts. Please register again.' });
    }

    return res.status(400).json({ message: `Invalid OTP. ${updated.attemptsLeft} attempts left.` });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existingUser) {
    db.prepare('DELETE FROM pending_registrations WHERE email = ?').run(normalizedEmail);
    return res.status(409).json({ message: 'email already registered' });
  }

  db.prepare(
    `UPDATE pending_registrations
     SET otp_verified = 1, otp_hash = '', expires_at = datetime('now'), attempts_left = 0
     WHERE email = ?`
  ).run(normalizedEmail);

  return res.json({
    verified: true,
    verificationStatus: 'SUCCESS',
    message: 'OTP verified. Now set your password to complete signup.',
  });
});

app.post('/api/auth/register/complete', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  if (String(password).length < 8) {
    return res.status(400).json({ message: 'password must be at least 8 characters' });
  }

  const pending = db.prepare(
    `SELECT email, name, otp_verified AS otpVerified
     FROM pending_registrations
     WHERE email = ?`
  ).get(email);
  if (!pending) {
    return res.status(404).json({ message: 'No pending signup found. Start registration again.' });
  }

  if (Number(pending.otpVerified) !== 1) {
    return res.status(400).json({ message: 'Please verify signup OTP first.' });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    db.prepare('DELETE FROM pending_registrations WHERE email = ?').run(email);
    return res.status(409).json({ message: 'email already registered' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, role, created_at)
       VALUES (?, ?, ?, 'user', datetime('now'))`
    )
    .run(String(pending.name || '').trim() || 'User', email, passwordHash);

  db.prepare('DELETE FROM pending_registrations WHERE email = ?').run(email);

  const user = {
    id: Number(result.lastInsertRowid),
    name: String(pending.name || 'User'),
    email,
    role: 'user',
    membershipStatus: 'inactive',
    membershipPlan: '',
    membershipStartedAt: null,
    membershipExpiresAt: null,
    membershipPeopleCount: null,
  };

  setAuthCookie(res, user);
  return res.status(201).json({ user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db
    .prepare(
      `SELECT id, name, email, password_hash, role, age, gender, mobile, avatar_url AS avatarUrl,
              membership_status AS membershipStatus, membership_plan AS membershipPlan,
              membership_started_at AS membershipStartedAt, membership_expires_at AS membershipExpiresAt,
              membership_people_count AS membershipPeopleCount
       FROM users
       WHERE email = ?`
    )
    .get(normalizedEmail);

  if (!user) {
    return res.status(404).json({ message: 'User not found. Please register.' });
  }

  if (!bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ message: 'Invalid password.' });
  }

  const authUser = {
    id: Number(user.id),
    name: String(user.name),
    email: String(user.email),
    role: String(user.role || 'user'),
    age: user.age ?? null,
    gender: user.gender || '',
    mobile: user.mobile || '',
    avatarUrl: user.avatarUrl || '',
    membershipStatus: user.membershipStatus || 'inactive',
    membershipPlan: user.membershipPlan || '',
    membershipStartedAt: user.membershipStartedAt || null,
    membershipExpiresAt: user.membershipExpiresAt || null,
    membershipPeopleCount: user.membershipPeopleCount ?? null,
  };

  setAuthCookie(res, authUser);
  return res.json({ user: authUser });
});

app.post('/api/auth/login/verify', (req, res) => {
  return res.status(410).json({ message: 'Login OTP flow is disabled. Please login using email and password.' });
});

app.post('/api/auth/password/forgot', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ message: 'email is required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'valid email is required' });
  }

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();
  db.prepare(
    `INSERT INTO pending_password_resets (email, otp_hash, expires_at, attempts_left, verified, created_at)
     VALUES (?, ?, ?, 5, 0, datetime('now'))
     ON CONFLICT(email) DO UPDATE SET
       otp_hash = excluded.otp_hash,
       expires_at = excluded.expires_at,
       attempts_left = 5,
       verified = 0,
       created_at = datetime('now')`
  ).run(email, otpHash, expiresAt);

  const mailResult = await sendOtpEmail(email, otp);
  if (!mailResult.ok) {
    return res.status(mailResult.statusCode || 500).json({ message: mailResult.message });
  }

  return res.json({
    message: `Password reset OTP sent to ${email}. It expires in ${OTP_TTL_MINUTES} minutes.`,
  });
});

app.post('/api/auth/password/verify', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const otp = String(req.body?.otp || '').trim();
  if (!email || !otp) {
    return res.status(400).json({ message: 'email and otp are required' });
  }

  const pending = db
    .prepare(
      `SELECT email, otp_hash AS otpHash, expires_at AS expiresAt, attempts_left AS attemptsLeft, verified
       FROM pending_password_resets
       WHERE email = ?`
    )
    .get(email);

  if (!pending) {
    return res.status(404).json({ message: 'No pending password reset found. Request OTP again.' });
  }

  if (Number(pending.verified) === 1) {
    return res.json({ verified: true, message: 'OTP already verified. Set your new password.' });
  }

  if (new Date(pending.expiresAt).getTime() < Date.now()) {
    db.prepare('DELETE FROM pending_password_resets WHERE email = ?').run(email);
    return res.status(400).json({ message: 'OTP expired. Request a new one.' });
  }

  if (hashOtp(otp) !== pending.otpHash) {
    db.prepare('UPDATE pending_password_resets SET attempts_left = attempts_left - 1 WHERE email = ?').run(email);
    const updated = db
      .prepare('SELECT attempts_left AS attemptsLeft FROM pending_password_resets WHERE email = ?')
      .get(email);
    if (!updated || updated.attemptsLeft <= 0) {
      db.prepare('DELETE FROM pending_password_resets WHERE email = ?').run(email);
      return res.status(400).json({ message: 'Too many invalid OTP attempts. Request a new one.' });
    }
    return res.status(400).json({ message: `Invalid OTP. ${updated.attemptsLeft} attempts left.` });
  }

  db.prepare(
    `UPDATE pending_password_resets
     SET verified = 1, otp_hash = '', expires_at = datetime('now'), attempts_left = 0
     WHERE email = ?`
  ).run(email);

  return res.json({ verified: true, message: 'OTP verified. Set your new password.' });
});

app.post('/api/auth/password/reset', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'password must be at least 8 characters' });
  }

  const pending = db
    .prepare('SELECT email, verified FROM pending_password_resets WHERE email = ?')
    .get(email);
  if (!pending) {
    return res.status(404).json({ message: 'No pending password reset found. Request OTP again.' });
  }

  if (Number(pending.verified) !== 1) {
    return res.status(400).json({ message: 'Please verify OTP first.' });
  }

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) {
    db.prepare('DELETE FROM pending_password_resets WHERE email = ?').run(email);
    return res.status(404).json({ message: 'User not found.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, email);
  db.prepare('DELETE FROM pending_password_resets WHERE email = ?').run(email);
  db.prepare('DELETE FROM pending_login_otps WHERE email = ?').run(email);

  return res.json({ message: 'Password reset successful. Please login with your new password.' });
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie(TOKEN_COOKIE);
  res.status(204).send();
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/profile', requireAuth, (req, res) => {
  const profile = db.prepare(
    `SELECT id, name, role, age, gender, mobile, avatar_url AS avatarUrl,
            membership_status AS membershipStatus, membership_plan AS membershipPlan,
            membership_started_at AS membershipStartedAt, membership_expires_at AS membershipExpiresAt,
            membership_people_count AS membershipPeopleCount
     FROM users
     WHERE id = ?`
  ).get(req.user.id);

  res.json({ profile });
});

app.get('/api/doctor/profile', requireAuth, requireDoctor, (req, res) => {
  const doctor = db
    .prepare(
      `SELECT id, user_id AS userId, name, specialty, bio, experience_years AS experienceYears,
              consultation_fee AS consultationFee, available_days AS availableDays,
              approval_status AS approvalStatus, created_at AS createdAt
       FROM doctors
       WHERE user_id = ?`
    )
    .get(req.user.id);

  res.json({ doctor: doctor || null });
});

app.put('/api/doctor/profile', requireAuth, requireDoctor, (req, res) => {
  const payload = validateDoctorSelfProfilePayload(req.body);
  if (payload.error) return res.status(400).json({ message: payload.error });

  const existing = db
    .prepare('SELECT id FROM doctors WHERE user_id = ?')
    .get(req.user.id);

  if (existing) {
    db.prepare(
      `UPDATE doctors
       SET name = ?, specialty = ?, bio = ?, experience_years = ?, consultation_fee = ?, available_days = ?, approval_status = 'pending'
       WHERE id = ?`
    ).run(
      req.user.name,
      payload.data.specialty,
      payload.data.bio,
      payload.data.experienceYears,
      payload.data.consultationFee,
      payload.data.availableDays,
      existing.id
    );
  } else {
    db.prepare(
      `INSERT INTO doctors (
        user_id, name, specialty, bio, experience_years, consultation_fee, available_days, approval_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`
    ).run(
      req.user.id,
      req.user.name,
      payload.data.specialty,
      payload.data.bio,
      payload.data.experienceYears,
      payload.data.consultationFee,
      payload.data.availableDays
    );
  }

  const doctor = db
    .prepare(
      `SELECT id, user_id AS userId, name, specialty, bio, experience_years AS experienceYears,
              consultation_fee AS consultationFee, available_days AS availableDays,
              approval_status AS approvalStatus, created_at AS createdAt
       FROM doctors
       WHERE user_id = ?`
    )
    .get(req.user.id);

  res.json({ doctor });
});

app.put('/api/profile', requireAuth, (req, res) => {
  const hasAvatarField = Object.prototype.hasOwnProperty.call(req.body || {}, 'avatarUrl');
  const name = String(req.body?.name || '').trim();
  const ageRaw = String(req.body?.age ?? '').trim();
  const gender = String(req.body?.gender || '').trim().toLowerCase();
  const mobile = String(req.body?.mobile || '').trim();
  const avatarUrl = hasAvatarField ? String(req.body?.avatarUrl || '').trim() : null;

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  let age = null;
  if (ageRaw) {
    const parsed = Number(ageRaw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 120) {
      return res.status(400).json({ message: 'age must be a valid number between 1 and 120' });
    }
    age = parsed;
  }

  const allowedGenders = ['', 'male', 'female', 'other', 'prefer_not_to_say'];
  if (!allowedGenders.includes(gender)) {
    return res.status(400).json({ message: 'invalid gender' });
  }

  if (mobile && !/^[0-9+\-\s()]{7,20}$/.test(mobile)) {
    return res.status(400).json({ message: 'invalid mobile number' });
  }

  if (hasAvatarField && avatarUrl && !/^https?:\/\/.+/i.test(avatarUrl) && !avatarUrl.startsWith('/uploads/')) {
    return res.status(400).json({ message: 'avatarUrl must be a valid http/https URL or /uploads path' });
  }

  const current = db
    .prepare('SELECT avatar_url AS avatarUrl FROM users WHERE id = ?')
    .get(req.user.id);
  const nextAvatarUrl = hasAvatarField ? (avatarUrl || null) : (current?.avatarUrl || null);

  db.prepare(
    `UPDATE users
     SET name = ?, age = ?, gender = ?, mobile = ?, avatar_url = ?
     WHERE id = ?`
  ).run(name, age, gender || null, mobile || null, nextAvatarUrl, req.user.id);

  const profile = db.prepare(
    `SELECT id, name, role, age, gender, mobile, avatar_url AS avatarUrl,
            membership_status AS membershipStatus, membership_plan AS membershipPlan,
            membership_started_at AS membershipStartedAt, membership_expires_at AS membershipExpiresAt,
            membership_people_count AS membershipPeopleCount
     FROM users
     WHERE id = ?`
  ).get(req.user.id);

  res.json({ profile });
});

app.post('/api/profile/avatar', requireAuth, (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Max size is 10MB.' });
      }
      return res.status(400).json({ message: err.message || 'Image upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'avatar file is required' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, req.user.id);

    const profile = db.prepare(
      `SELECT id, name, role, age, gender, mobile, avatar_url AS avatarUrl,
              membership_status AS membershipStatus, membership_plan AS membershipPlan,
              membership_started_at AS membershipStartedAt, membership_expires_at AS membershipExpiresAt,
              membership_people_count AS membershipPeopleCount
       FROM users
       WHERE id = ?`
    ).get(req.user.id);

    return res.json({ profile });
  });
});

app.post('/api/admin/ses/verify-recipient', requireAuth, requireAdmin, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'valid email is required' });
  }

  const verification = await requestSesRecipientVerification(email);
  if (!verification.ok) {
    return res.status(400).json({
      message: verification.message,
      configured: Boolean(verification.configured),
    });
  }

  return res.json({
    email,
    verificationStatus: verification.status,
    message: 'Verification email requested. Ask recipient to click the SES verification link.',
  });
});

app.get('/api/admin/ses/identity-status', requireAuth, requireAdmin, async (req, res) => {
  const email = String(req.query?.email || '').trim().toLowerCase();
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'valid email query param is required' });
  }

  const statusResult = await getSesIdentityStatus(email);
  if (!statusResult.ok) {
    return res.status(statusResult.statusCode || 400).json({ message: statusResult.message });
  }

  return res.json({
    email,
    verificationStatus: statusResult.status,
  });
});

app.get('/api/services', requireAuth, (req, res) => {
  const services = SERVICE_CATALOG.map((service) => toServiceResponse(service, req.user));
  res.json({ services, membershipActive: isMembershipActiveForUser(req.user) });
});

app.get('/api/services/availability', requireAuth, (req, res) => {
  const bookingDate = String(req.query?.bookingDate || '').trim();
  const category = String(req.query?.category || '').trim().toUpperCase();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
    return res.status(400).json({ message: 'bookingDate query must be in YYYY-MM-DD format' });
  }

  const selectedDate = new Date(`${bookingDate}T00:00:00`);
  if (Number.isNaN(selectedDate.getTime())) {
    return res.status(400).json({ message: 'bookingDate is invalid' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return res.status(400).json({ message: 'bookingDate cannot be in the past' });
  }

  const allServices = SERVICE_CATALOG.filter((service) => {
    if (!category) return true;
    return String(service.category || '').toUpperCase() === category;
  });

  const availability = {};
  for (const service of allServices) {
    availability[service.name] = {};
    for (const slot of ALLOWED_SLOT_START_TIMES) {
      availability[service.name][slot] = 0;
    }
  }

  if (allServices.length > 0) {
    const placeholders = allServices.map(() => '?').join(', ');
    const params = [bookingDate, ...allServices.map((service) => service.name)];
    const rows = db
      .prepare(
        `SELECT service_name AS serviceName, booking_time AS bookingTime, COUNT(*) AS total
         FROM bookings
         WHERE booking_date = ?
           AND status IN ('pending', 'booked', 'confirmed')
           AND service_name IN (${placeholders})
         GROUP BY service_name, booking_time`
      )
      .all(...params);

    for (const row of rows) {
      const serviceName = String(row.serviceName || '');
      const bookingTime = String(row.bookingTime || '');
      if (!availability[serviceName] || !ALLOWED_SLOT_START_TIMES.includes(bookingTime)) continue;
      availability[serviceName][bookingTime] = Number(row.total || 0);
    }
  }

  return res.json({
    bookingDate,
    category,
    maxPerSlot: MAX_BOOKINGS_PER_SLOT_HYDROGEN,
    slotCapacityByService: Object.fromEntries(
      allServices.map((service) => [service.name, getSlotCapacityForServiceName(service.name)])
    ),
    slots: ALLOWED_SLOT_START_TIMES,
    availability,
  });
});

app.get('/api/membership/plans', requireAuth, (req, res) => {
  const active = isMembershipActiveForUser(req.user);
  return res.json({
    active,
    current: {
      status: req.user.membershipStatus || 'inactive',
      plan: req.user.membershipPlan || '',
      startedAt: req.user.membershipStartedAt || null,
      expiresAt: req.user.membershipExpiresAt || null,
      peopleCount: req.user.membershipPeopleCount ?? null,
    },
    plans: MEMBERSHIP_PLANS,
  });
});

app.post('/api/membership/subscribe', requireAuth, (req, res) => {
  return res.status(410).json({
    message: 'Direct membership activation is disabled. Use /api/membership/create-order and /api/membership/verify.',
  });
});

app.post('/api/membership/create-order', requireAuth, async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Only users can subscribe to membership.' });
  }
  if (!razorpay) {
    return res.status(503).json({ message: 'Razorpay is not configured' });
  }

  const planId = String(req.body?.planId || '').trim();
  const plan = MEMBERSHIP_PLANS.find((item) => item.id === planId);
  if (!plan) {
    return res.status(400).json({ message: 'Invalid membership plan selected.' });
  }

  const userRow = db
    .prepare(
      `SELECT membership_status AS membershipStatus, membership_plan AS membershipPlan,
              membership_started_at AS membershipStartedAt, membership_expires_at AS membershipExpiresAt,
              membership_people_count AS membershipPeopleCount
       FROM users
       WHERE id = ?`
    )
    .get(req.user.id);
  const hasActiveMembership = isMembershipActiveForUser({
    membershipStatus: userRow?.membershipStatus || req.user.membershipStatus,
    membershipExpiresAt: userRow?.membershipExpiresAt || req.user.membershipExpiresAt,
  });

  if (planId === 'h2_add_person' && !hasActiveMembership) {
    return res.status(409).json({ message: 'Add Person is available only for active memberships.' });
  }

  const targetPeopleCount =
    planId === 'h2_add_person'
      ? Number(userRow?.membershipPeopleCount || req.user.membershipPeopleCount || 1) + 1
      : Number(plan.peopleCount || 1);
  const amountInPaise = Math.max(100, Math.round(Number(plan.priceInr || 0) * 100));

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `membership_${req.user.id}_${Date.now()}`,
      notes: {
        userId: String(req.user.id),
        planId: String(plan.id),
        peopleCount: String(targetPeopleCount),
      },
    });

    db.prepare(
      `INSERT OR REPLACE INTO membership_payment_orders (
        order_id, user_id, plan_id, people_count, amount_paise, status, payment_reference, created_at
      ) VALUES (?, ?, ?, ?, ?, 'pending', NULL, datetime('now'))`
    ).run(order.id, req.user.id, plan.id, targetPeopleCount, amountInPaise);

    return res.json({
      keyId: RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: {
        id: plan.id,
        name: plan.name,
        priceInr: plan.priceInr,
        peopleCount: targetPeopleCount,
        validityDays: plan.validityDays,
      },
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch {
    return res.status(500).json({ message: 'Unable to create membership order' });
  }
});

app.post('/api/membership/verify', requireAuth, (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Only users can subscribe to membership.' });
  }
  if (!razorpay || !RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: 'Razorpay is not configured' });
  }

  const planId = String(req.body?.planId || '').trim();
  const razorpayOrderId = String(req.body?.razorpay_order_id || '');
  const razorpayPaymentId = String(req.body?.razorpay_payment_id || '');
  const razorpaySignature = String(req.body?.razorpay_signature || '');
  if (!planId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ message: 'Invalid membership verification payload' });
  }

  const plan = MEMBERSHIP_PLANS.find((item) => item.id === planId);
  if (!plan) {
    return res.status(400).json({ message: 'Invalid membership plan selected.' });
  }

  const pendingOrder = db
    .prepare(
      `SELECT order_id AS orderId, user_id AS userId, plan_id AS planId, people_count AS peopleCount, status
       FROM membership_payment_orders
       WHERE order_id = ?`
    )
    .get(razorpayOrderId);

  if (!pendingOrder) {
    return res.status(404).json({ message: 'Membership order not found' });
  }
  if (Number(pendingOrder.userId) !== Number(req.user.id)) {
    return res.status(403).json({ message: 'forbidden' });
  }
  if (String(pendingOrder.planId) !== plan.id) {
    return res.status(400).json({ message: 'Plan mismatch for this order' });
  }
  if (String(pendingOrder.status) === 'paid') {
    return res.status(409).json({ message: 'Membership payment already verified for this order' });
  }

  const peopleCount = Number(pendingOrder.peopleCount || plan.peopleCount || 1);

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  const existingUser = db
    .prepare(
      `SELECT membership_status AS membershipStatus, membership_plan AS membershipPlan,
              membership_started_at AS membershipStartedAt, membership_expires_at AS membershipExpiresAt
       FROM users
       WHERE id = ?`
    )
    .get(req.user.id);
  const hasActiveMembership = isMembershipActiveForUser({
    membershipStatus: existingUser?.membershipStatus || req.user.membershipStatus,
    membershipExpiresAt: existingUser?.membershipExpiresAt || req.user.membershipExpiresAt,
  });

  if (plan.id === 'h2_add_person' && !hasActiveMembership) {
    return res.status(409).json({ message: 'Add Person is available only for active memberships.' });
  }

  const now = new Date();
  const startedAt =
    plan.id === 'h2_add_person' && existingUser?.membershipStartedAt ? existingUser.membershipStartedAt : now.toISOString();
  const expiresAt =
    plan.id === 'h2_add_person' && existingUser?.membershipExpiresAt
      ? existingUser.membershipExpiresAt
      : new Date(now.getTime() + Number(plan.validityDays || MEMBERSHIP_VALIDITY_DAYS) * 24 * 60 * 60 * 1000).toISOString();
  const membershipPlanId =
    plan.id === 'h2_add_person' ? String(existingUser?.membershipPlan || req.user.membershipPlan || 'h2_single') : plan.id;

  db.prepare(
    `UPDATE users
     SET membership_status = 'active',
         membership_plan = ?,
         membership_started_at = ?,
         membership_expires_at = ?,
         membership_people_count = ?
     WHERE id = ?`
  ).run(membershipPlanId, startedAt, expiresAt, peopleCount, req.user.id);

  db.prepare(
    `UPDATE membership_payment_orders
     SET status = 'paid',
         payment_reference = ?,
         paid_at = datetime('now')
     WHERE order_id = ?`
  ).run(razorpayPaymentId, razorpayOrderId);

  const profile = db.prepare(
    `SELECT id, name, role, age, gender, mobile, avatar_url AS avatarUrl,
            membership_status AS membershipStatus, membership_plan AS membershipPlan,
            membership_started_at AS membershipStartedAt, membership_expires_at AS membershipExpiresAt,
            membership_people_count AS membershipPeopleCount
     FROM users
     WHERE id = ?`
  ).get(req.user.id);

  return res.json({
    message:
      plan.id === 'h2_add_person'
        ? `Member added successfully. Current covered members: ${peopleCount}.`
        : `${plan.name} activated successfully.`,
    profile,
    paid: true,
  });
});

app.get('/api/doctors', requireAuth, (_req, res) => {
  return res.json({ doctors: [] });
});

app.get('/api/admin/doctors', requireAuth, requireAdmin, (_req, res) => {
  const doctors = db
    .prepare(
      `SELECT id, name, specialty, bio, experience_years AS experienceYears,
              consultation_fee AS consultationFee, available_days AS availableDays, created_at AS createdAt,
              approval_status AS approvalStatus,
              user_id AS userId
       FROM doctors
       ORDER BY id ASC`
    )
    .all();
  res.json({ doctors });
});

app.patch('/api/admin/doctors/:id/approval', requireAuth, requireAdmin, (req, res) => {
  const doctorId = Number(req.params.id);
  const approvalStatus = String(req.body?.approvalStatus || '').trim().toLowerCase();

  if (!Number.isInteger(doctorId)) {
    return res.status(400).json({ message: 'invalid doctor id' });
  }
  if (!['pending', 'approved', 'rejected'].includes(approvalStatus)) {
    return res.status(400).json({ message: 'approvalStatus must be pending/approved/rejected' });
  }

  const existing = db.prepare('SELECT id FROM doctors WHERE id = ?').get(doctorId);
  if (!existing) {
    return res.status(404).json({ message: 'doctor not found' });
  }

  db.prepare('UPDATE doctors SET approval_status = ? WHERE id = ?').run(approvalStatus, doctorId);
  const doctor = db
    .prepare(
      `SELECT id, user_id AS userId, name, specialty, bio, experience_years AS experienceYears,
              consultation_fee AS consultationFee, available_days AS availableDays,
              approval_status AS approvalStatus, created_at AS createdAt
       FROM doctors
       WHERE id = ?`
    )
    .get(doctorId);

  res.json({ doctor });
});

app.post('/api/admin/doctors', requireAuth, requireAdmin, (req, res) => {
  const payload = validateDoctorPayload(req.body);
  if (payload.error) return res.status(400).json({ message: payload.error });

  const result = db
    .prepare(
      `INSERT INTO doctors (
        name, specialty, bio, experience_years, consultation_fee, available_days, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .run(
      payload.data.name,
      payload.data.specialty,
      payload.data.bio,
      payload.data.experienceYears,
      payload.data.consultationFee,
      payload.data.availableDays
    );

  const doctor = db
    .prepare(
      `SELECT id, name, specialty, bio, experience_years AS experienceYears,
              consultation_fee AS consultationFee, available_days AS availableDays, created_at AS createdAt
       FROM doctors WHERE id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json({ doctor });
});

app.put('/api/admin/doctors/:id', requireAuth, requireAdmin, (req, res) => {
  const doctorId = Number(req.params.id);
  if (!Number.isInteger(doctorId)) {
    return res.status(400).json({ message: 'invalid doctor id' });
  }

  const existing = db.prepare('SELECT id FROM doctors WHERE id = ?').get(doctorId);
  if (!existing) {
    return res.status(404).json({ message: 'doctor not found' });
  }

  const payload = validateDoctorPayload(req.body);
  if (payload.error) return res.status(400).json({ message: payload.error });

  db.prepare(
    `UPDATE doctors
     SET name = ?, specialty = ?, bio = ?, experience_years = ?, consultation_fee = ?, available_days = ?
     WHERE id = ?`
  ).run(
    payload.data.name,
    payload.data.specialty,
    payload.data.bio,
    payload.data.experienceYears,
    payload.data.consultationFee,
    payload.data.availableDays,
    doctorId
  );

  const doctor = db
    .prepare(
      `SELECT id, name, specialty, bio, experience_years AS experienceYears,
              consultation_fee AS consultationFee, available_days AS availableDays, created_at AS createdAt
       FROM doctors WHERE id = ?`
    )
    .get(doctorId);

  res.json({ doctor });
});

app.delete('/api/admin/doctors/:id', requireAuth, requireAdmin, (req, res) => {
  const doctorId = Number(req.params.id);
  if (!Number.isInteger(doctorId)) {
    return res.status(400).json({ message: 'invalid doctor id' });
  }

  const existing = db.prepare('SELECT id FROM doctors WHERE id = ?').get(doctorId);
  if (!existing) {
    return res.status(404).json({ message: 'doctor not found' });
  }

  const activeBooking = db
    .prepare(
      `SELECT id
       FROM bookings
       WHERE doctor_id = ?
         AND status IN ('pending', 'booked', 'confirmed')
       LIMIT 1`
    )
    .get(doctorId);

  if (activeBooking) {
    return res.status(409).json({ message: 'cannot delete doctor with active bookings' });
  }

  db.prepare('DELETE FROM doctors WHERE id = ?').run(doctorId);
  res.status(204).send();
});

app.get('/api/bookings', requireAuth, (req, res) => {
  const baseQuery = `
    SELECT b.id,
           b.user_id AS userId,
           u.name AS clientName,
           u.email AS clientEmail,
           u.mobile AS clientMobile,
           u.age AS clientAge,
           u.gender AS clientGender,
           b.service_name AS serviceName,
           b.booking_date AS bookingDate,
           b.booking_time AS bookingTime,
           b.status,
           b.payment_status AS paymentStatus,
           b.paid_at AS paidAt,
           b.notes,
           b.created_at AS createdAt
    FROM bookings b
    JOIN users u ON u.id = b.user_id
  `;

  const rows = req.user.role === 'admin'
    ? db.prepare(`${baseQuery} ORDER BY b.booking_date, b.booking_time`).all()
    : db
        .prepare(`${baseQuery} WHERE b.user_id = ? ORDER BY b.booking_date, b.booking_time`)
        .all(req.user.id);

  res.json({ bookings: rows });
});

app.get('/api/doctor/bookings', requireAuth, requireDoctor, (req, res) => {
  return res.status(410).json({ message: 'Doctor bookings are currently disabled.' });
});

app.post('/api/bookings', requireAuth, (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'only users can create bookings' });
  }

  const payload = validateBookingPayload(req.body);
  if (payload.error) return res.status(400).json({ message: payload.error });

  const slotCapacityReached = isSlotCapacityReached(payload.data.serviceName, payload.data.bookingDate, payload.data.bookingTime);
  if (slotCapacityReached) {
    const maxPerSlot = getSlotCapacityForServiceName(payload.data.serviceName);
    return res.status(409).json({ message: `This slot is full. Maximum ${maxPerSlot} bookings are allowed.` });
  }

  const result = db
    .prepare(
      `INSERT INTO bookings (
        user_id, doctor_id, client_name, client_email, client_phone,
        service_name, booking_date, booking_time, assigned_staff, status, payment_status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?, datetime('now'))`
    )
    .run(
      req.user.id,
      null,
      req.user.name,
      req.user.email,
      req.user.mobile || '-',
      payload.data.serviceName,
      payload.data.bookingDate,
      payload.data.bookingTime,
      'H2 House Of Health',
      payload.data.notes
    );

  const booking = db
    .prepare(
      `SELECT b.id,
              b.user_id AS userId,
              u.name AS clientName,
              u.email AS clientEmail,
              u.mobile AS clientMobile,
              b.service_name AS serviceName,
              b.booking_date AS bookingDate,
              b.booking_time AS bookingTime,
              b.status,
              b.payment_status AS paymentStatus,
              b.paid_at AS paidAt,
              b.notes,
              b.created_at AS createdAt
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       WHERE b.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json({ booking });
});

app.post('/api/hydrogen/create-order', requireAuth, async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'only users can create hydrogen bookings' });
  }
  if (!razorpay) {
    return res.status(503).json({ message: 'Razorpay is not configured' });
  }

  const serviceName = String(req.body?.serviceName || '').trim();
  const service = getServiceByName(serviceName);
  if (!service || String(service.category || '').toUpperCase() !== 'HYDROGEN SESSION') {
    return res.status(400).json({ message: 'Invalid hydrogen package selected.' });
  }

  const packageSessions = getHydrogenSessionCountFromServiceName(service.name);
  const extraSessions = Number(req.body?.extraSessions ?? 0);
  if (!Number.isInteger(extraSessions) || extraSessions < 0) {
    return res.status(400).json({ message: 'extraSessions must be a non-negative integer' });
  }

  const totalSessions = packageSessions + extraSessions;
  const slots = Array.isArray(req.body?.slots) ? req.body.slots : [];
  if (slots.length !== totalSessions) {
    return res.status(400).json({ message: `Please select exactly ${totalSessions} slots.` });
  }

  const normalizedSlots = [];
  for (const slot of slots) {
    const bookingDate = String(slot?.bookingDate || '').trim();
    const bookingTime = String(slot?.bookingTime || '').trim();
    const selectedDate = new Date(`${bookingDate}T00:00:00`);
    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: `Invalid bookingDate: ${bookingDate}` });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ message: 'bookingDate cannot be in the past' });
    }
    if (!ALLOWED_SLOT_START_TIMES.includes(bookingTime)) {
      return res.status(400).json({ message: `Invalid bookingTime: ${bookingTime}` });
    }
    normalizedSlots.push({ bookingDate, bookingTime });
  }

  const packagePriceInr = getEffectiveServicePriceInr(service, req.user);
  const singleSessionService =
    SERVICE_CATALOG.find(
      (item) =>
        String(item.category || '').toUpperCase() === 'HYDROGEN SESSION' &&
        getHydrogenSessionCountFromServiceName(item.name) === 1
    ) || service;
  const extraSessionPriceInr = getEffectiveServicePriceInr(singleSessionService, req.user);
  const totalAmountInr = Number(packagePriceInr || 0) + Number(extraSessionPriceInr || 0) * extraSessions;
  const amountInPaise = Math.max(100, Math.round(totalAmountInr * 100));

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `hydrogen_${req.user.id}_${Date.now()}`,
      notes: {
        userId: String(req.user.id),
        serviceName: service.name,
        sessions: String(totalSessions),
      },
    });

    const insertBooking = db.prepare(
      `INSERT INTO bookings (
        user_id, doctor_id, client_name, client_email, client_phone,
        service_name, booking_date, booking_time, assigned_staff, status, payment_status, payment_order_id, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'payment_pending', ?, ?, datetime('now'))`
    );
    const countActiveForSlot = db.prepare(
      `SELECT COUNT(*) AS total
       FROM bookings
       WHERE service_name = ?
         AND booking_date = ?
         AND booking_time = ?
         AND status IN ('pending', 'booked', 'confirmed')`
    );
    const maxPerSlot = getSlotCapacityForServiceName(service.name);
    const inRequestCounter = new Map();

    const txn = db.transaction((entries) => {
      for (const entry of entries) {
        const key = `${entry.bookingDate}|${entry.bookingTime}`;
        const alreadyInRequest = Number(inRequestCounter.get(key) || 0);
        const existing = Number(countActiveForSlot.get(service.name, entry.bookingDate, entry.bookingTime)?.total || 0);
        if (existing + alreadyInRequest >= maxPerSlot) {
          throw new Error(`Slot full for ${entry.bookingDate} ${entry.bookingTime}`);
        }
        inRequestCounter.set(key, alreadyInRequest + 1);

        insertBooking.run(
          req.user.id,
          null,
          req.user.name,
          req.user.email,
          req.user.mobile || '-',
          service.name,
          entry.bookingDate,
          entry.bookingTime,
          'H2 House Of Health',
          order.id,
          `Hydrogen package ${packageSessions} + extra ${extraSessions}`
        );
      }
    });

    txn(normalizedSlots);

    return res.json({
      keyId: RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      totalSessions,
      amountInr: totalAmountInr,
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    return res.status(409).json({ message: error?.message || 'Unable to prepare hydrogen order' });
  }
});

app.post('/api/hydrogen/book-pack', requireAuth, (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'only users can create hydrogen bookings' });
  }

  const serviceName = String(req.body?.serviceName || '').trim();
  const service = getServiceByName(serviceName);
  if (!service || String(service.category || '').toUpperCase() !== 'HYDROGEN SESSION') {
    return res.status(400).json({ message: 'Invalid hydrogen package selected.' });
  }

  const packageSessions = getHydrogenSessionCountFromServiceName(service.name);
  const extraSessions = Number(req.body?.extraSessions ?? 0);
  if (!Number.isInteger(extraSessions) || extraSessions < 0) {
    return res.status(400).json({ message: 'extraSessions must be a non-negative integer' });
  }

  const totalSessions = packageSessions + extraSessions;
  const slots = Array.isArray(req.body?.slots) ? req.body.slots : [];
  if (slots.length !== totalSessions) {
    return res.status(400).json({ message: `Please select exactly ${totalSessions} slots.` });
  }

  const normalizedSlots = [];
  for (const slot of slots) {
    const bookingDate = String(slot?.bookingDate || '').trim();
    const bookingTime = String(slot?.bookingTime || '').trim();
    const selectedDate = new Date(`${bookingDate}T00:00:00`);
    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: `Invalid bookingDate: ${bookingDate}` });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ message: 'bookingDate cannot be in the past' });
    }
    if (!ALLOWED_SLOT_START_TIMES.includes(bookingTime)) {
      return res.status(400).json({ message: `Invalid bookingTime: ${bookingTime}` });
    }
    normalizedSlots.push({ bookingDate, bookingTime });
  }

  const packagePriceInr = getEffectiveServicePriceInr(service, req.user);
  const singleSessionService =
    SERVICE_CATALOG.find(
      (item) =>
        String(item.category || '').toUpperCase() === 'HYDROGEN SESSION' &&
        getHydrogenSessionCountFromServiceName(item.name) === 1
    ) || service;
  const extraSessionPriceInr = getEffectiveServicePriceInr(singleSessionService, req.user);
  const totalAmountInr = Number(packagePriceInr || 0) + Number(extraSessionPriceInr || 0) * extraSessions;

  try {
    const insertBooking = db.prepare(
      `INSERT INTO bookings (
        user_id, doctor_id, client_name, client_email, client_phone,
        service_name, booking_date, booking_time, assigned_staff, status, payment_status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?, datetime('now'))`
    );
    const countActiveForSlot = db.prepare(
      `SELECT COUNT(*) AS total
       FROM bookings
       WHERE service_name = ?
         AND booking_date = ?
         AND booking_time = ?
         AND status IN ('pending', 'booked', 'confirmed')`
    );
    const maxPerSlot = getSlotCapacityForServiceName(service.name);
    const inRequestCounter = new Map();
    const createdIds = [];

    const txn = db.transaction((entries) => {
      for (const entry of entries) {
        const key = `${entry.bookingDate}|${entry.bookingTime}`;
        const alreadyInRequest = Number(inRequestCounter.get(key) || 0);
        const existing = Number(countActiveForSlot.get(service.name, entry.bookingDate, entry.bookingTime)?.total || 0);
        if (existing + alreadyInRequest >= maxPerSlot) {
          throw new Error(`Slot full for ${entry.bookingDate} ${entry.bookingTime}`);
        }
        inRequestCounter.set(key, alreadyInRequest + 1);

        const result = insertBooking.run(
          req.user.id,
          null,
          req.user.name,
          req.user.email,
          req.user.mobile || '-',
          service.name,
          entry.bookingDate,
          entry.bookingTime,
          'H2 House Of Health',
          `Hydrogen package ${packageSessions} + extra ${extraSessions}`
        );
        createdIds.push(Number(result.lastInsertRowid));
      }
    });

    txn(normalizedSlots);

    const bookings = db
      .prepare(
        `SELECT b.id, b.service_name AS serviceName, b.booking_date AS bookingDate, b.booking_time AS bookingTime, b.status, b.payment_status AS paymentStatus
         FROM bookings b
         WHERE b.id IN (${createdIds.map(() => '?').join(', ')})
         ORDER BY b.booking_date, b.booking_time`
      )
      .all(...createdIds);

    return res.status(201).json({
      message: 'Hydrogen bookings saved successfully.',
      summary: {
        serviceName: service.name,
        packageSessions,
        extraSessions,
        totalSessions,
        totalAmountInr,
      },
      bookings,
    });
  } catch (error) {
    return res.status(409).json({ message: error?.message || 'Unable to save hydrogen bookings' });
  }
});

app.post('/api/hydrogen/verify', requireAuth, (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'only users can verify hydrogen payment' });
  }
  if (!razorpay || !RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: 'Razorpay is not configured' });
  }

  const razorpayOrderId = String(req.body?.razorpay_order_id || '');
  const razorpayPaymentId = String(req.body?.razorpay_payment_id || '');
  const razorpaySignature = String(req.body?.razorpay_signature || '');
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ message: 'Invalid payment verification payload' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  const bookings = db
    .prepare(
      `SELECT id
       FROM bookings
       WHERE user_id = ?
         AND payment_order_id = ?`
    )
    .all(req.user.id, razorpayOrderId);
  if (!bookings.length) {
    return res.status(404).json({ message: 'Hydrogen order bookings not found' });
  }

  db.prepare(
    `UPDATE bookings
     SET payment_status = 'paid',
         paid_at = CASE WHEN paid_at IS NULL THEN datetime('now') ELSE paid_at END,
         payment_reference = ?,
         status = CASE WHEN status = 'pending' THEN 'booked' ELSE status END
     WHERE user_id = ?
       AND payment_order_id = ?`
  ).run(razorpayPaymentId, req.user.id, razorpayOrderId);

  return res.json({ paid: true, bookingCount: bookings.length });
});

app.put('/api/bookings/:id', requireAuth, (req, res) => {
  const bookingId = Number(req.params.id);
  if (!Number.isInteger(bookingId)) {
    return res.status(400).json({ message: 'invalid booking id' });
  }

  const existing = db
    .prepare('SELECT id, user_id AS userId, status FROM bookings WHERE id = ?')
    .get(bookingId);

  if (!existing) {
    return res.status(404).json({ message: 'booking not found' });
  }

  if (!canAccessBooking(req.user, existing.userId)) {
    return res.status(403).json({ message: 'forbidden' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'user') {
    return res.status(403).json({ message: 'forbidden' });
  }

  if (req.user.role !== 'admin' && ['confirmed', 'completed'].includes(String(existing.status))) {
    return res.status(409).json({ message: 'confirmed/completed booking cannot be edited by user' });
  }

  const payload = validateBookingPayload(req.body);
  if (payload.error) return res.status(400).json({ message: payload.error });

  const slotCapacityReached = isSlotCapacityReached(
    payload.data.serviceName,
    payload.data.bookingDate,
    payload.data.bookingTime,
    bookingId
  );
  if (slotCapacityReached) {
    const maxPerSlot = getSlotCapacityForServiceName(payload.data.serviceName);
    return res.status(409).json({ message: `This slot is full. Maximum ${maxPerSlot} bookings are allowed.` });
  }

  const nextStatus = req.user.role === 'admin'
    ? String(req.body?.status || existing.status).toLowerCase()
    : String(existing.status || 'pending');

  if (!isValidStatus(nextStatus)) {
    return res.status(400).json({ message: 'invalid status' });
  }

  db.prepare(
    `UPDATE bookings SET
      doctor_id = NULL,
      service_name = ?,
      booking_date = ?,
      booking_time = ?,
      assigned_staff = 'H2 House Of Health',
      notes = ?,
      status = ?
    WHERE id = ?`
  ).run(
    payload.data.serviceName,
    payload.data.bookingDate,
    payload.data.bookingTime,
    payload.data.notes,
    nextStatus,
    bookingId
  );

  const booking = db
    .prepare(
      `SELECT b.id,
              b.user_id AS userId,
              u.name AS clientName,
              u.email AS clientEmail,
              u.mobile AS clientMobile,
              b.service_name AS serviceName,
              b.booking_date AS bookingDate,
              b.booking_time AS bookingTime,
              b.status,
              b.payment_status AS paymentStatus,
              b.paid_at AS paidAt,
              b.notes,
              b.created_at AS createdAt
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       WHERE b.id = ?`
    )
    .get(bookingId);

  res.json({ booking });
});

app.get('/api/payments/config', requireAuth, (_req, res) => {
  if (!RAZORPAY_KEY_ID) {
    return res.status(503).json({ message: 'Razorpay is not configured' });
  }

  return res.json({ keyId: RAZORPAY_KEY_ID, currency: 'INR' });
});

app.post('/api/payments/create-order', requireAuth, async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ message: 'Razorpay is not configured' });
  }

  const bookingId = Number(req.body?.bookingId);
  if (!Number.isInteger(bookingId)) {
    return res.status(400).json({ message: 'bookingId is required' });
  }

  const booking = db.prepare(
    `SELECT b.id, b.user_id AS userId, b.status, b.payment_status AS paymentStatus,
            b.service_name AS serviceName, b.booking_date AS bookingDate, b.booking_time AS bookingTime
     FROM bookings b
     WHERE b.id = ?`
  ).get(bookingId);

  if (!booking) {
    return res.status(404).json({ message: 'booking not found' });
  }

  if (!canAccessBooking(req.user, booking.userId)) {
    return res.status(403).json({ message: 'forbidden' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'cannot pay for a cancelled booking' });
  }

  if (booking.paymentStatus === 'paid') {
    return res.status(409).json({ message: 'booking is already paid' });
  }

  const service = getServiceByName(booking.serviceName);
  if (!service) {
    return res.status(400).json({ message: 'Invalid service configured on booking' });
  }

  const bookingOwner = db
    .prepare(
      `SELECT membership_status AS membershipStatus, membership_expires_at AS membershipExpiresAt
       FROM users
       WHERE id = ?`
    )
    .get(booking.userId);
  const pricingUser = {
    membershipStatus: bookingOwner?.membershipStatus || req.user.membershipStatus || 'inactive',
    membershipExpiresAt: bookingOwner?.membershipExpiresAt || req.user.membershipExpiresAt || null,
  };
  const effectivePriceInr = getEffectiveServicePriceInr(service, pricingUser);
  const amountInPaise = Math.max(100, Math.round(Number(effectivePriceInr) * 100));

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${booking.id}_${Date.now()}`,
      notes: {
        bookingId: String(booking.id),
        userId: String(booking.userId),
      },
    });

    db.prepare(
      `UPDATE bookings
       SET payment_status = CASE WHEN payment_status = 'unpaid' THEN 'payment_pending' ELSE payment_status END,
           payment_order_id = ?
       WHERE id = ?`
    ).run(order.id, booking.id);

    return res.json({
      keyId: RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking.id,
      booking: {
        serviceName: booking.serviceName,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        amountInr: effectivePriceInr,
      },
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch {
    return res.status(500).json({ message: 'Unable to create Razorpay order' });
  }
});

app.post('/api/payments/verify', requireAuth, (req, res) => {
  const bookingId = Number(req.body?.bookingId);
  const razorpayOrderId = String(req.body?.razorpay_order_id || '');
  const razorpayPaymentId = String(req.body?.razorpay_payment_id || '');
  const razorpaySignature = String(req.body?.razorpay_signature || '');

  if (!razorpay || !RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: 'Razorpay is not configured' });
  }

  if (!Number.isInteger(bookingId) || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ message: 'Invalid payment verification payload' });
  }

  const booking = db
    .prepare('SELECT id, user_id AS userId, payment_order_id AS paymentOrderId FROM bookings WHERE id = ?')
    .get(bookingId);

  if (!booking) {
    return res.status(404).json({ message: 'booking not found' });
  }

  if (!canAccessBooking(req.user, booking.userId)) {
    return res.status(403).json({ message: 'forbidden' });
  }

  if (booking.paymentOrderId && booking.paymentOrderId !== razorpayOrderId) {
    return res.status(400).json({ message: 'Order mismatch' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  markBookingPaid(bookingId, razorpayOrderId, razorpayPaymentId);
  return res.json({ bookingId, paid: true });
});

app.patch('/api/bookings/:id/status', requireAuth, (req, res) => {
  const bookingId = Number(req.params.id);
  const status = String(req.body?.status || '').toLowerCase();

  if (!Number.isInteger(bookingId)) {
    return res.status(400).json({ message: 'invalid booking id' });
  }

  if (!isValidStatus(status)) {
    return res.status(400).json({ message: 'invalid status' });
  }

  const existing = db
    .prepare('SELECT id, user_id AS userId, payment_status AS paymentStatus FROM bookings WHERE id = ?')
    .get(bookingId);

  if (!existing) {
    return res.status(404).json({ message: 'booking not found' });
  }

  if (!canAccessBooking(req.user, existing.userId)) {
    return res.status(403).json({ message: 'forbidden' });
  }

  if (req.user.role !== 'admin' && status !== 'cancelled') {
    return res.status(403).json({ message: 'only admin can set this status' });
  }

  if (status === 'confirmed' && existing.paymentStatus !== 'paid') {
    return res.status(400).json({ message: 'booking must be paid before confirming' });
  }

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, bookingId);
  res.status(204).send();
});

app.post('/api/bookings/:id/pay', requireAuth, (req, res) => {
  return res.status(410).json({ message: 'Use /api/payments/create-order and /api/payments/verify for Razorpay.' });
});

app.delete('/api/bookings/:id', requireAuth, (req, res) => {
  const bookingId = Number(req.params.id);
  if (!Number.isInteger(bookingId)) {
    return res.status(400).json({ message: 'invalid booking id' });
  }

  const existing = db
    .prepare('SELECT id, user_id AS userId FROM bookings WHERE id = ?')
    .get(bookingId);

  if (!existing) {
    return res.status(404).json({ message: 'booking not found' });
  }

  if (!canAccessBooking(req.user, existing.userId)) {
    return res.status(403).json({ message: 'forbidden' });
  }

  db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
  res.status(204).send();
});

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

function canAccessBooking(user, ownerId) {
  return user.role === 'admin' || user.id === Number(ownerId);
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'admin only' });
  }
  return next();
}

function requireDoctor(req, res, next) {
  if (req.user?.role !== 'doctor') {
    return res.status(403).json({ message: 'doctor only' });
  }
  return next();
}

function isSlotCapacityReached(serviceName, bookingDate, bookingTime, excludeBookingId = null) {
  const maxPerSlot = getSlotCapacityForServiceName(serviceName);
  if (excludeBookingId) {
    const row = db
      .prepare(
        `SELECT COUNT(*) AS total
         FROM bookings
         WHERE service_name = ?
           AND booking_date = ?
           AND booking_time = ?
           AND status IN ('pending', 'booked', 'confirmed')
           AND id <> ?`
      )
      .get(serviceName, bookingDate, bookingTime, excludeBookingId);
    return Number(row?.total || 0) >= maxPerSlot;
  }

  const row = db
    .prepare(
      `SELECT COUNT(*) AS total
       FROM bookings
       WHERE service_name = ?
         AND booking_date = ?
         AND booking_time = ?
         AND status IN ('pending', 'booked', 'confirmed')`
    )
    .get(serviceName, bookingDate, bookingTime);
  return Number(row?.total || 0) >= maxPerSlot;
}

function getSlotCapacityForServiceName(serviceName) {
  const service = getServiceByName(serviceName);
  const category = String(service?.category || '').toUpperCase();
  if (category === 'HYDROGEN SESSION') return MAX_BOOKINGS_PER_SLOT_HYDROGEN;
  if (category === 'IV THERAPIES' || category === 'IV SHOTS') return MAX_BOOKINGS_PER_SLOT_IV;
  return MAX_BOOKINGS_PER_SLOT_HYDROGEN;
}

function getHydrogenSessionCountFromServiceName(serviceName) {
  const raw = String(serviceName || '').trim();
  const normalized = raw.toLowerCase();
  if (normalized.includes('single')) return 1;

  let match = raw.match(/\((\d+)\s*session/i);
  if (match) return Number(match[1]);

  match = raw.match(/\b(\d+)\s*session/i);
  if (match) return Number(match[1]);

  const cleaned = normalized.replace(/\bh2\b/g, ' ');
  match = cleaned.match(/\b(\d+)\b/);
  return match ? Number(match[1]) : 1;
}

function markBookingPaid(bookingId, paymentOrderId, paymentRef) {
  if (!Number.isInteger(Number(bookingId))) return;

  const orderId = String(paymentOrderId || '');
  const paymentId = String(paymentRef || '');
  db.prepare(
    `UPDATE bookings
     SET payment_status = 'paid',
         paid_at = CASE WHEN paid_at IS NULL THEN datetime('now') ELSE paid_at END,
         payment_order_id = CASE WHEN ? <> '' THEN ? ELSE payment_order_id END,
         payment_reference = CASE WHEN ? <> '' THEN ? ELSE payment_reference END,
         status = CASE WHEN status = 'pending' THEN 'booked' ELSE status END
     WHERE id = ?`
  ).run(orderId, orderId, paymentId, paymentId, Number(bookingId));
}

function setAuthCookie(res, user) {
  const token = jwt.sign(
    { sub: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function requireAuth(req, res, next) {
  const token = req.cookies[TOKEN_COOKIE];
  if (!token) return res.status(401).json({ message: 'unauthorized' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db
      .prepare(
        `SELECT id, name, email, role, age, gender, mobile, avatar_url AS avatarUrl,
                membership_status AS membershipStatus, membership_plan AS membershipPlan,
                membership_started_at AS membershipStartedAt, membership_expires_at AS membershipExpiresAt,
                membership_people_count AS membershipPeopleCount
         FROM users
         WHERE id = ?`
      )
      .get(Number(payload.sub));

    if (!user) return res.status(401).json({ message: 'unauthorized' });

    req.user = {
      id: Number(user.id),
      name: String(user.name),
      email: String(user.email),
      role: String(user.role || 'user'),
      age: user.age ?? null,
      gender: user.gender || '',
      mobile: user.mobile || '',
      avatarUrl: user.avatarUrl || '',
      membershipStatus: user.membershipStatus || 'inactive',
      membershipPlan: user.membershipPlan || '',
      membershipStartedAt: user.membershipStartedAt || null,
      membershipExpiresAt: user.membershipExpiresAt || null,
      membershipPeopleCount: user.membershipPeopleCount ?? null,
    };

    return next();
  } catch {
    return res.status(401).json({ message: 'unauthorized' });
  }
}

function validateBookingPayload(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'invalid payload' };
  }

  const serviceName = String(body.serviceName || '').trim();
  const bookingDate = String(body.bookingDate || '').trim();
  const bookingTime = String(body.bookingTime || '').trim();
  const notes = String(body.notes || '').trim();

  if (!serviceName || !bookingDate || !bookingTime) {
    return { error: 'serviceName, bookingDate, bookingTime are required' };
  }

  if (!getServiceByName(serviceName)) {
    return { error: 'Invalid service selected.' };
  }

  const selectedDate = new Date(`${bookingDate}T00:00:00`);
  if (Number.isNaN(selectedDate.getTime())) {
    return { error: 'bookingDate is invalid' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return { error: 'bookingDate cannot be in the past' };
  }

  if (!ALLOWED_SLOT_START_TIMES.includes(bookingTime)) {
    return { error: 'bookingTime must be one of the allowed 1-hour slots' };
  }

  return {
    data: {
      serviceName,
      bookingDate,
      bookingTime,
      notes,
    },
  };
}

function isMembershipActiveForUser(user) {
  if (!user) return false;
  if (String(user.membershipStatus || '').toLowerCase() !== 'active') return false;
  const expiresAt = user.membershipExpiresAt ? new Date(user.membershipExpiresAt).getTime() : null;
  if (!expiresAt) return false;
  return expiresAt > Date.now();
}

function getEffectiveServicePriceInr(service, user) {
  if (!service) return 0;
  const category = String(service.category || '').toUpperCase();
  const isHydrogen = category === 'HYDROGEN SESSION';
  const membershipActive = isMembershipActiveForUser(user);

  if (isHydrogen && membershipActive && Number(service.memberPriceInr) > 0) {
    return Number(service.memberPriceInr);
  }

  if (isHydrogen && Number(service.nonMemberPriceInr) > 0) {
    return Number(service.nonMemberPriceInr);
  }

  return Number(service.priceInr || 0);
}

function toServiceResponse(service, user) {
  const membershipActive = isMembershipActiveForUser(user);
  const effectivePriceInr = getEffectiveServicePriceInr(service, user);
  return {
    ...service,
    effectivePriceInr,
    membershipActive,
  };
}

function getServiceByName(name) {
  const normalized = String(name || '').trim().toLowerCase();
  return SERVICE_CATALOG.find((service) => service.name.toLowerCase() === normalized) || null;
}

function validateDoctorPayload(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'invalid payload' };
  }

  const data = {
    name: String(body.name || '').trim(),
    specialty: String(body.specialty || '').trim(),
    bio: String(body.bio || '').trim(),
    experienceYears: Number(body.experienceYears),
    consultationFee: Number(body.consultationFee),
    availableDays: String(body.availableDays || '').trim(),
  };

  if (!data.name || !data.specialty || !data.bio || !data.availableDays) {
    return { error: 'name, specialty, bio, and availableDays are required' };
  }
  if (!Number.isInteger(data.experienceYears) || data.experienceYears < 0 || data.experienceYears > 80) {
    return { error: 'experienceYears must be between 0 and 80' };
  }
  if (!Number.isFinite(data.consultationFee) || data.consultationFee <= 0 || data.consultationFee > 100000) {
    return { error: 'consultationFee must be a valid positive number' };
  }
  const days = normalizeAvailableDays(data.availableDays);
  if (days.error) return days;
  data.availableDays = days.value;

  return { data };
}

function validateDoctorSelfProfilePayload(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'invalid payload' };
  }

  const data = {
    specialty: String(body.specialty || '').trim(),
    bio: String(body.bio || '').trim(),
    experienceYears: Number(body.experienceYears),
    consultationFee: Number(body.consultationFee),
    availableDays: String(body.availableDays || '').trim(),
  };

  if (!data.specialty || !data.bio || !data.availableDays) {
    return { error: 'specialty, bio, and availableDays are required' };
  }
  if (!Number.isInteger(data.experienceYears) || data.experienceYears < 0 || data.experienceYears > 80) {
    return { error: 'experienceYears must be between 0 and 80' };
  }
  if (!Number.isFinite(data.consultationFee) || data.consultationFee <= 0 || data.consultationFee > 100000) {
    return { error: 'consultationFee must be a valid positive number' };
  }
  const days = normalizeAvailableDays(data.availableDays);
  if (days.error) return days;
  data.availableDays = days.value;

  return { data };
}

function normalizeAvailableDays(availableDays) {
  const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const valid = new Set(order);
  const selected = new Set(
    String(availableDays || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  );

  if (selected.size === 0) {
    return { error: 'please select at least one available day' };
  }

  for (const day of selected) {
    if (!valid.has(day)) {
      return { error: 'availableDays must be comma-separated weekday codes like Sun, Mon, Tue' };
    }
  }

  return {
    value: order.filter((day) => selected.has(day)).join(', '),
  };
}

function weekdayShortFromDate(dateISO) {
  const [year, month, day] = String(dateISO || '').split('-').map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return '';
  const date = new Date(year, month - 1, day);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()] || '';
}

function isDoctorAvailableOnDate(availableDays, bookingDate) {
  const weekday = weekdayShortFromDate(bookingDate);
  if (!weekday) return false;
  const allowed = new Set(
    String(availableDays || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  );
  return allowed.has(weekday);
}

function isValidStatus(status) {
  return ['pending', 'booked', 'confirmed', 'completed', 'cancelled'].includes(status);
}

function hasColumn(tableName, columnName) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.some((column) => column.name === columnName);
}

function hasTable(tableName) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(String(tableName || ''));
  return Boolean(row);
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function regionFromSmtpHost(host) {
  const match = String(host || '')
    .trim()
    .toLowerCase()
    .match(/^email-smtp\.([a-z0-9-]+)\.amazonaws\.com$/);
  return match?.[1] || '';
}

function hasSesApiCredentials() {
  return Boolean(SES_API_ACCESS_KEY_ID && SES_API_SECRET_ACCESS_KEY && SES_API_REGION);
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
}

function hmacSha256(key, value, encoding) {
  return crypto.createHmac('sha256', key).update(value, 'utf8').digest(encoding);
}

function amzDateParts(date = new Date()) {
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  return { amzDate, dateStamp: amzDate.slice(0, 8) };
}

function awsSigV4Authorization({ method, host, canonicalUri, payloadHash, amzDate, dateStamp, includeContentHeaders = true }) {
  const service = 'ses';
  const credentialScope = `${dateStamp}/${SES_API_REGION}/${service}/aws4_request`;

  const baseHeaders = {
    host,
    'x-amz-date': amzDate,
  };
  if (includeContentHeaders) {
    baseHeaders['content-type'] = 'application/json';
    baseHeaders['x-amz-content-sha256'] = payloadHash;
  }
  if (SES_API_SESSION_TOKEN) {
    baseHeaders['x-amz-security-token'] = SES_API_SESSION_TOKEN;
  }

  const sortedHeaderKeys = Object.keys(baseHeaders).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map((key) => `${key}:${String(baseHeaders[key]).trim()}\n`)
    .join('');
  const signedHeaders = sortedHeaderKeys.join(';');
  const canonicalRequest = [
    method.toUpperCase(),
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const kDate = hmacSha256(`AWS4${SES_API_SECRET_ACCESS_KEY}`, dateStamp);
  const kRegion = hmacSha256(kDate, SES_API_REGION);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'aws4_request');
  const signature = hmacSha256(kSigning, stringToSign, 'hex');

  return {
    headers: {
      Host: baseHeaders.host,
      'X-Amz-Date': baseHeaders['x-amz-date'],
      ...(includeContentHeaders ? { 'Content-Type': baseHeaders['content-type'] } : {}),
      ...(includeContentHeaders ? { 'X-Amz-Content-Sha256': baseHeaders['x-amz-content-sha256'] } : {}),
      ...(SES_API_SESSION_TOKEN ? { 'X-Amz-Security-Token': SES_API_SESSION_TOKEN } : {}),
      Authorization:
        `AWS4-HMAC-SHA256 Credential=${SES_API_ACCESS_KEY_ID}/${credentialScope}, ` +
        `SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  };
}

async function sesApiRequest(method, pathName, payload = null) {
  if (!hasSesApiCredentials()) {
    return {
      ok: false,
      configured: false,
      message:
        'SES identity API is not configured. Set AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (or SES_API_* equivalents).',
    };
  }

  const host = `email.${SES_API_REGION}.amazonaws.com`;
  const canonicalUri = String(pathName || '/');
  const body = payload ? JSON.stringify(payload) : '';
  const payloadHash = sha256Hex(body);
  const includeContentHeaders = String(method || '').toUpperCase() !== 'GET';
  const { amzDate, dateStamp } = amzDateParts();
  const signed = awsSigV4Authorization({
    method,
    host,
    canonicalUri,
    payloadHash,
    amzDate,
    dateStamp,
    includeContentHeaders,
  });

  const headers = { ...signed.headers };
  if (body) {
    headers['Content-Length'] = String(Buffer.byteLength(body));
  }

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: host,
        port: 443,
        method,
        path: canonicalUri,
        headers,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let parsed = null;
          try {
            parsed = raw ? JSON.parse(raw) : {};
          } catch {
            parsed = { message: raw };
          }

          const statusCode = Number(res.statusCode || 500);
          if (statusCode >= 200 && statusCode < 300) {
            resolve({ ok: true, data: parsed, statusCode });
            return;
          }

          resolve({
            ok: false,
            statusCode,
            data: parsed,
            message: parsed?.message || parsed?.Message || `SES API request failed with ${statusCode}`,
          });
        });
      }
    );

    req.on('error', (error) => {
      resolve({
        ok: false,
        statusCode: 500,
        message: `SES API request failed: ${error.message}`,
      });
    });

    if (body) req.write(body);
    req.end();
  });
}

async function getSesIdentityStatus(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const result = await sesApiRequest('GET', `/v2/email/identities/${normalizedEmail}`);
  if (!result.ok) {
    if (!result.configured && result.message) {
      return { ok: false, statusCode: 400, message: result.message };
    }
    if (result.statusCode === 404) {
      return { ok: false, statusCode: 404, message: 'Email identity not found. Request verification first.' };
    }
    return { ok: false, statusCode: result.statusCode || 500, message: result.message || 'Unable to read SES identity status.' };
  }

  const status = String(result.data?.VerificationStatus || 'UNKNOWN').toUpperCase();
  return { ok: true, status };
}

async function requestSesRecipientVerification(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!hasSesApiCredentials()) {
    return {
      ok: false,
      configured: false,
      message:
        'SES identity API is not configured. Set AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (or SES_API_* equivalents).',
    };
  }

  const createResult = await sesApiRequest('POST', '/v2/email/identities', { EmailIdentity: normalizedEmail });
  const createMessage = String(createResult.message || '').toLowerCase();
  const identityAlreadyExists = createMessage.includes('already exist');
  if (!createResult.ok && createResult.statusCode !== 409 && !identityAlreadyExists) {
    return {
      ok: false,
      configured: true,
      message: createResult.message || 'Unable to request email verification.',
    };
  }

  return {
    ok: true,
    status: 'PENDING',
  };
}

async function sendSignupConfirmationEmail(toEmail, name) {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!transporter || !fromEmail) {
    return {
      ok: false,
      statusCode: 500,
      message: 'Email service is not configured. Please contact support.',
    };
  }

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: 'Signup Verification Check',
      text: `Hello ${name || 'User'}, your email has been verified and signup can continue.`,
    });
    return { ok: true };
  } catch (error) {
    const responseText = String(error?.response || '').toLowerCase();
    const isUnverified =
      Number(error?.responseCode) === 554 &&
      responseText.includes('email address is not verified');

    if (isUnverified) {
      return {
        ok: false,
        code: 'UNVERIFIED',
        statusCode: 400,
        message: 'Verification email sent. Click the verification link in your inbox, then sign up again.',
      };
    }

    return {
      ok: false,
      code: 'SEND_FAILED',
      statusCode: 500,
      message: 'Unable to send verification check email. Please try again.',
    };
  }
}

async function sendOtpEmail(toEmail, otp) {
  const normalizedToEmail = String(toEmail || '').trim().toLowerCase();

  if (!SENDGRID_API_KEY || !SENDGRID_OTP_TEMPLATE_ID || !SENDGRID_FROM_EMAIL) {
    return {
      ok: false,
      statusCode: 500,
      message: 'SendGrid is not configured. Please contact support.',
    };
  }

  try {
    await sgMail.send({
      to: normalizedToEmail,
      from: SENDGRID_FROM_EMAIL,
      templateId: SENDGRID_OTP_TEMPLATE_ID,
      dynamicTemplateData: {
        otp: String(otp),
        otpTtlMinutes: OTP_TTL_MINUTES,
      },
    });
    return { ok: true };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    const statusCode = Number(error?.code || error?.response?.statusCode || 500);
    const isUnauthorized = statusCode === 401 || statusCode === 403;

    return {
      ok: false,
      statusCode,
      message: isUnauthorized
        ? 'SendGrid authentication failed. Please contact support.'
        : 'Unable to send OTP email. Please try again.',
    };
  }
}

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      age INTEGER,
      gender TEXT,
      mobile TEXT,
      avatar_url TEXT,
      membership_status TEXT NOT NULL DEFAULT 'inactive',
      membership_plan TEXT,
      membership_started_at TEXT,
      membership_expires_at TEXT,
      membership_people_count INTEGER,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      bio TEXT NOT NULL,
      experience_years INTEGER NOT NULL,
      consultation_fee INTEGER NOT NULL,
      available_days TEXT NOT NULL,
      approval_status TEXT NOT NULL DEFAULT 'approved',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      doctor_id INTEGER REFERENCES doctors(id),
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      service_name TEXT NOT NULL,
      booking_date TEXT NOT NULL,
      booking_time TEXT NOT NULL,
      assigned_staff TEXT NOT NULL,
      status TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      paid_at TEXT,
      payment_order_id TEXT,
      payment_reference TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pending_registrations (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      attempts_left INTEGER NOT NULL,
      otp_verified INTEGER NOT NULL DEFAULT 0,
      registration_role TEXT NOT NULL DEFAULT 'user',
      doctor_profile_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pending_login_otps (
      email TEXT PRIMARY KEY,
      otp_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      attempts_left INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pending_password_resets (
      email TEXT PRIMARY KEY,
      otp_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      attempts_left INTEGER NOT NULL,
      verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS membership_payment_orders (
      order_id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      plan_id TEXT NOT NULL,
      people_count INTEGER NOT NULL DEFAULT 1,
      amount_paise INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_reference TEXT,
      paid_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_user_date
      ON bookings(user_id, booking_date, booking_time);
  `);

  if (!hasColumn('users', 'role')) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
  }

  if (!hasColumn('users', 'age')) {
    db.exec('ALTER TABLE users ADD COLUMN age INTEGER');
  }

  if (!hasColumn('users', 'gender')) {
    db.exec('ALTER TABLE users ADD COLUMN gender TEXT');
  }

  if (!hasColumn('users', 'mobile')) {
    db.exec('ALTER TABLE users ADD COLUMN mobile TEXT');
  }

  if (!hasColumn('users', 'avatar_url')) {
    db.exec('ALTER TABLE users ADD COLUMN avatar_url TEXT');
  }

  if (!hasColumn('users', 'membership_status')) {
    db.exec("ALTER TABLE users ADD COLUMN membership_status TEXT NOT NULL DEFAULT 'inactive'");
  }

  if (!hasColumn('users', 'membership_plan')) {
    db.exec('ALTER TABLE users ADD COLUMN membership_plan TEXT');
  }

  if (!hasColumn('users', 'membership_started_at')) {
    db.exec('ALTER TABLE users ADD COLUMN membership_started_at TEXT');
  }

  if (!hasColumn('users', 'membership_expires_at')) {
    db.exec('ALTER TABLE users ADD COLUMN membership_expires_at TEXT');
  }

  if (!hasColumn('users', 'membership_people_count')) {
    db.exec('ALTER TABLE users ADD COLUMN membership_people_count INTEGER');
  }

  if (!hasColumn('bookings', 'doctor_id')) {
    db.exec('ALTER TABLE bookings ADD COLUMN doctor_id INTEGER REFERENCES doctors(id)');
  }

  if (!hasColumn('doctors', 'user_id')) {
    db.exec('ALTER TABLE doctors ADD COLUMN user_id INTEGER');
  }

  if (!hasColumn('doctors', 'approval_status')) {
    db.exec("ALTER TABLE doctors ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'approved'");
  }

  if (!hasColumn('pending_registrations', 'registration_role')) {
    db.exec("ALTER TABLE pending_registrations ADD COLUMN registration_role TEXT NOT NULL DEFAULT 'user'");
  }

  if (!hasColumn('pending_registrations', 'doctor_profile_json')) {
    db.exec('ALTER TABLE pending_registrations ADD COLUMN doctor_profile_json TEXT');
  }

  if (!hasColumn('pending_registrations', 'otp_verified')) {
    db.exec("ALTER TABLE pending_registrations ADD COLUMN otp_verified INTEGER NOT NULL DEFAULT 0");
  }

  if (!hasColumn('pending_password_resets', 'verified')) {
    db.exec("ALTER TABLE pending_password_resets ADD COLUMN verified INTEGER NOT NULL DEFAULT 0");
  }

  if (hasTable('membership_payment_orders') && !hasColumn('membership_payment_orders', 'people_count')) {
    db.exec("ALTER TABLE membership_payment_orders ADD COLUMN people_count INTEGER NOT NULL DEFAULT 1");
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_user_id
      ON doctors(user_id)
      WHERE user_id IS NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_bookings_doctor_slot_active
      ON bookings(doctor_id, booking_date, booking_time)
      WHERE status IN ('pending', 'booked', 'confirmed');

    CREATE INDEX IF NOT EXISTS idx_bookings_service_slot_active
      ON bookings(service_name, booking_date, booking_time)
      WHERE status IN ('pending', 'booked', 'confirmed');

    CREATE INDEX IF NOT EXISTS idx_membership_payment_orders_user_status
      ON membership_payment_orders(user_id, status, created_at);
  `);

  if (!hasColumn('bookings', 'payment_status')) {
    db.exec("ALTER TABLE bookings ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid'");
  }

  if (!hasColumn('bookings', 'paid_at')) {
    db.exec('ALTER TABLE bookings ADD COLUMN paid_at TEXT');
  }

  if (!hasColumn('bookings', 'payment_reference')) {
    db.exec('ALTER TABLE bookings ADD COLUMN payment_reference TEXT');
  }

  if (!hasColumn('bookings', 'payment_order_id')) {
    db.exec('ALTER TABLE bookings ADD COLUMN payment_order_id TEXT');
  }

  db.exec(`
    UPDATE bookings
    SET payment_status = CASE
      WHEN status IN ('booked', 'confirmed', 'completed') THEN 'paid'
      ELSE 'unpaid'
    END
    WHERE payment_status IS NULL OR payment_status = '';
  `);

  db.exec("UPDATE users SET role = 'user' WHERE role IS NULL OR role = ''");
  db.exec("UPDATE users SET role = 'user' WHERE role = 'doctor'");
  db.exec("UPDATE users SET membership_status = 'inactive' WHERE membership_status IS NULL OR membership_status = ''");
  db.exec("UPDATE doctors SET approval_status = 'approved' WHERE approval_status IS NULL OR approval_status = ''");
}

function seedDoctors() {
  const existing = db.prepare('SELECT id FROM doctors LIMIT 1').get();
  if (existing) return;

  const now = new Date().toISOString();
  const insert = db.prepare(
    `INSERT INTO doctors (
      user_id, name, specialty, bio, experience_years, consultation_fee, available_days, approval_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const doctors = [
    [
      null,
      'Dr. Olivia Bennett',
      'Physiotherapy',
      'Focuses on sports injury recovery and postural correction plans.',
      11,
      90,
      'Mon, Wed, Fri',
      'approved',
      now,
    ],
    [
      null,
      'Dr. Ethan Brooks',
      'Chiropractic Care',
      'Specializes in spinal alignment and chronic lower-back pain treatment.',
      14,
      110,
      'Tue, Thu, Sat',
      'approved',
      now,
    ],
  ];

  const txn = db.transaction((rows) => {
    for (const row of rows) insert.run(...row);
  });

  txn(doctors);
}

function seedAdmin() {
  const email = 'admin@h2health.local';
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

  if (!existing) {
    const passwordHash = bcrypt.hashSync('Admin@12345', 10);
    db.prepare(
      `INSERT INTO users (name, email, password_hash, role, created_at)
       VALUES (?, ?, ?, 'admin', datetime('now'))`
    ).run('Portal Admin', email, passwordHash);
    return;
  }

  db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
}

function rateLimit({ windowMs, max }) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const row = requestCounters.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > row.resetAt) {
      row.count = 0;
      row.resetAt = now + windowMs;
    }

    row.count += 1;
    requestCounters.set(key, row);

    if (row.count > max) {
      return res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
    }

    return next();
  };
}
