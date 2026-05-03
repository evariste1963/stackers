import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const PIN_KEY = 'user_pin';
const SALT_KEY = 'user_pin_salt';

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray, byte => byte.toString(16).padStart(2, '0')).join('');
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
  const random = await Crypto.getRandomBytesAsync(16);
  return arrayBufferToHex(random.buffer);
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

export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = await SecureStore.getItemAsync(PIN_KEY);
  const salt = await SecureStore.getItemAsync(SALT_KEY);
  if (!storedHash || !salt) return false;
  
  const inputHash = await hashPin(pin, salt);
  return storedHash === inputHash;
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
  const isValid = await verifyPin(currentPin);
  if (!isValid) return false;
  
  await setPin(newPin);
  return true;
}