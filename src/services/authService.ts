import * as SecureStore from 'expo-secure-store';

const PIN_KEY = 'user_pin';
const PIN_HASH_PREFIX = 'pin_hash_';

function simpleHash(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return PIN_HASH_PREFIX + Math.abs(hash).toString(16);
}

export async function setPin(pin: string): Promise<void> {
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits');
  }
  const hash = simpleHash(pin);
  await SecureStore.setItemAsync(PIN_KEY, hash);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = await SecureStore.getItemAsync(PIN_KEY);
  if (!storedHash) return false;
  
  const inputHash = simpleHash(pin);
  return storedHash === inputHash;
}

export async function hasPin(): Promise<boolean> {
  const storedHash = await SecureStore.getItemAsync(PIN_KEY);
  return storedHash !== null;
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_KEY);
}

export async function changePin(currentPin: string, newPin: string): Promise<boolean> {
  const isValid = await verifyPin(currentPin);
  if (!isValid) return false;
  
  await setPin(newPin);
  return true;
}