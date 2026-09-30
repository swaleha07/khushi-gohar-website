import fs from 'fs';
import path from 'path';
import { AuthUser, SavedAddress } from '@/types';

const USERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'users.json');
const TMP_USERS_FILE_PATH = path.join('/tmp', 'khushi_users.json');

// In-memory cache to persist across warm lambda invocations
let memoryUsersCache: AuthUser[] | null = null;

function readUsersFromFile(): AuthUser[] {
  if (memoryUsersCache) {
    return memoryUsersCache;
  }

  // 1. Try reading from writable /tmp path first (for serverless persisted updates)
  try {
    if (fs.existsSync(TMP_USERS_FILE_PATH)) {
      const content = fs.readFileSync(TMP_USERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryUsersCache = parsed;
        return memoryUsersCache;
      }
    }
  } catch {
    // Fall back to bundled store
  }

  // 2. Read from bundled src/data/users.json
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const content = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryUsersCache = parsed;
        return memoryUsersCache;
      }
    }
  } catch (err) {
    console.error('Failed to read users.json:', err);
  }

  memoryUsersCache = [];
  return memoryUsersCache;
}

function writeUsersToFile(users: AuthUser[]) {
  memoryUsersCache = users;

  // 1. Try writing to bundled file path (works in local development)
  let wroteToBundled = false;
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
    wroteToBundled = true;
  } catch {
    // Read-only filesystem on Vercel runtime
  }

  // 2. Write to /tmp path (always writable in AWS Lambda / Vercel Serverless)
  try {
    fs.writeFileSync(TMP_USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    if (!wroteToBundled) {
      console.warn('Could not write users to /tmp on serverless runtime:', err);
    }
  }
}

/**
 * Normalize phone to clean digits (last 10 for India, or complete digits)
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function getUserByPhone(phone: string): AuthUser | undefined {
  const users = readUsersFromFile();
  const clean = normalizePhoneNumber(phone);
  const clean10 = clean.slice(-10);

  return users.find((u) => {
    const uClean = normalizePhoneNumber(u.phone);
    const uNat = normalizePhoneNumber(u.nationalNumber);
    return (
      uClean === clean ||
      uNat === clean ||
      uClean.slice(-10) === clean10 ||
      uNat.slice(-10) === clean10
    );
  });
}

export function getUserById(id: string, fallbackPhone?: string): AuthUser | undefined {
  const users = readUsersFromFile();
  const found = users.find((u) => u.id === id);
  if (found) return found;

  // Reconstitute basic verified member object from valid signed token if store was evicted
  if (fallbackPhone) {
    const cleanNat = normalizePhoneNumber(fallbackPhone).slice(-10);
    return {
      id,
      phone: fallbackPhone.startsWith('+') ? fallbackPhone : `+${fallbackPhone}`,
      countryCode: '+91',
      nationalNumber: cleanNat,
      createdAt: new Date().toISOString(),
      savedAddresses: [],
    };
  }

  return undefined;
}

export function createUser(
  phone: string,
  countryCode: string,
  nationalNumber: string,
  name?: string
): AuthUser {
  const users = readUsersFromFile();
  const cleanPhone = phone.startsWith('+') ? phone : `+${phone}`;
  const cleanNat = nationalNumber.replace(/\D/g, '');

  const newUser: AuthUser = {
    id: `usr_${cleanNat || Date.now()}`,
    phone: cleanPhone,
    countryCode,
    nationalNumber: cleanNat,
    name: name?.trim() || undefined,
    createdAt: new Date().toISOString(),
    savedAddresses: [],
  };

  users.push(newUser);
  writeUsersToFile(users);
  return newUser;
}

export function updateUser(id: string, updates: Partial<AuthUser>): AuthUser | undefined {
  const users = readUsersFromFile();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return undefined;

  const existing = users[index];
  const updated: AuthUser = {
    ...existing,
    ...updates,
    id: existing.id, // Immutable ID
    phone: existing.phone, // Phone remains verified
    countryCode: existing.countryCode,
    nationalNumber: existing.nationalNumber,
    createdAt: existing.createdAt,
  };

  users[index] = updated;
  writeUsersToFile(users);
  return updated;
}

export function addSavedAddress(
  userId: string,
  address: Omit<SavedAddress, 'id'>
): AuthUser | undefined {
  const users = readUsersFromFile();
  const user = users.find((u) => u.id === userId);
  if (!user) return undefined;

  const newAddress: SavedAddress = {
    ...address,
    id: `addr_${Date.now()}`,
    isDefault: address.isDefault || user.savedAddresses.length === 0,
  };

  // If new address is marked default, un-default other addresses
  if (newAddress.isDefault) {
    user.savedAddresses = user.savedAddresses.map((a) => ({ ...a, isDefault: false }));
  }

  user.savedAddresses.push(newAddress);
  writeUsersToFile(users);
  return user;
}

export function deleteSavedAddress(userId: string, addressId: string): AuthUser | undefined {
  const users = readUsersFromFile();
  const user = users.find((u) => u.id === userId);
  if (!user) return undefined;

  user.savedAddresses = user.savedAddresses.filter((a) => a.id !== addressId);
  if (user.savedAddresses.length > 0 && !user.savedAddresses.some((a) => a.isDefault)) {
    user.savedAddresses[0].isDefault = true;
  }

  writeUsersToFile(users);
  return user;
}

export function setDefaultSavedAddress(userId: string, addressId: string): AuthUser | undefined {
  const users = readUsersFromFile();
  const user = users.find((u) => u.id === userId);
  if (!user) return undefined;

  user.savedAddresses = user.savedAddresses.map((a) => ({
    ...a,
    isDefault: a.id === addressId,
  }));

  writeUsersToFile(users);
  return user;
}
