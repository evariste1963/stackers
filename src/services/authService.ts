import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const PIN_KEY = 'user_pin';
const SALT_KEY = 'user_pin_salt';
const FAILED_ATTEMPTS_KEY = 'failed_pin_attempts';
const LOCKOUT_KEY = 'pin_lockout_until';

const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 5 * 60 * 1000;

interface FailedAttempts {
  count: number;
  lastAttempt: number;
}

async function getFailedAttempts(): Promise<FailedAttempts> {
  try {
    const data = await SecureStore.getItemAsync(FAILED_ATTEMPTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  return { count: 0, lastAttempt: 0 };
}

async function setFailedAttempts(count: number): Promise<void> {
  const data: FailedAttempts = { count, lastAttempt: Date.now() };
  await SecureStore.setItemAsync(FAILED_ATTEMPTS_KEY, JSON.stringify(data));
}

async function clearFailedAttempts(): Promise<void> {
  await SecureStore.deleteItemAsync(FAILED_ATTEMPTS_KEY);
}

async function getLockoutEnd(): Promise<number> {
  try {
    const data = await SecureStore.getItemAsync(LOCKOUT_KEY);
    return data ? parseInt(data, 10) : 0;
  } catch {
    return 0;
  }
}

async function setLockoutEnd(attempts: number): Promise<number> {
  const lockoutMs = BASE_LOCKOUT_MS * Math.pow(2, attempts - MAX_ATTEMPTS);
  const lockoutEnd = Date.now() + lockoutMs;
  await SecureStore.setItemAsync(LOCKOUT_KEY, lockoutEnd.toString());
  return lockoutEnd;
}

async function clearLockout(): Promise<void> {
  await SecureStore.deleteItemAsync(LOCKOUT_KEY);
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const normalized = pin + salt;
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    normalized,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  return digest;
}

async function generateSalt(): Promise<string> {
  const uuid = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Math.random().toString() + Date.now().toString(),
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  return uuid;
}

export async function setPin(pin: string): Promise<void> {
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits');
  }
  const salt = await generateSalt();
  const hash = await hashPin(pin, salt);
  await SecureStore.setItemAsync(PIN_KEY, hash);
  await SecureStore.setItemAsync(SALT_KEY, salt);
}

export async function verifyPin(pin: string): Promise<{ success: boolean; lockedUntil?: number }> {
  const lockoutEnd = await getLockoutEnd();
  if (lockoutEnd > Date.now()) {
    return { success: false, lockedUntil: lockoutEnd };
  }

  const storedHash = await SecureStore.getItemAsync(PIN_KEY);
  const salt = await SecureStore.getItemAsync(SALT_KEY);
  if (!storedHash || !salt) return { success: false };
  
  const inputHash = await hashPin(pin, salt);
  const isValid = storedHash === inputHash;
  
  if (isValid) {
    await clearFailedAttempts();
    await clearLockout();
    return { success: true };
  }
  
  const attempts = await getFailedAttempts();
  const newCount = attempts.count + 1;
  
  if (newCount >= MAX_ATTEMPTS) {
    const lockoutEnd = await setLockoutEnd(newCount);
    return { success: false, lockedUntil: lockoutEnd };
  }
  
  await setFailedAttempts(newCount);
  return { success: false };
}

export async function getRemainingLockout(): Promise<number> {
  const lockoutEnd = await getLockoutEnd();
  if (lockoutEnd > Date.now()) {
    return Math.ceil((lockoutEnd - Date.now()) / 1000);
  }
  return 0;
}

export async function hasPin(): Promise<boolean> {
  const storedHash = await SecureStore.getItemAsync(PIN_KEY);
  return storedHash !== null;
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_KEY);
  await SecureStore.deleteItemAsync(SALT_KEY);
}

export async function changePin(currentPin: string, newPin: string): Promise<boolean> {
  const result = await verifyPin(currentPin);
  if (!result.success) return false;
  
  await setPin(newPin);
  return true;
}