import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { PinPad } from '@/components/PinPad';

export default function LockScreen() {
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm' | 'change' | 'verify'>('verify');
  const [confirmPin, setConfirmPin] = useState('');
  const { login, userSetPin, isLoading, isAuthenticated, hasPinSet } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && hasPinSet) {
      router.replace('/');
    }
  }, [isAuthenticated, hasPinSet]);

  const handlePinComplete = async (enteredPin: string) => {
    if (step === 'verify') {
      const result = await login(enteredPin);
      if (!result.success) {
        if (result.lockedUntil) {
          const remaining = Math.ceil((result.lockedUntil - Date.now()) / 1000);
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          Alert.alert('Locked Out', `Too many failed attempts. Try again in ${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          Alert.alert('Error', 'Incorrect PIN');
        }
        setPin('');
      }
    } else if (step === 'enter') {
      setConfirmPin(enteredPin);
      setPin('');
      setStep('confirm');
    } else if (step === 'confirm') {
      if (enteredPin === confirmPin) {
        await userSetPin(enteredPin);
      } else {
        Alert.alert('Error', 'PINs do not match');
        setPin('');
        setStep('enter');
        setConfirmPin('');
      }
    } else if (step === 'change') {
      const result = await login(enteredPin);
      if (result.success) {
        setPin('');
        setStep('enter');
      } else {
        Alert.alert('Error', 'Incorrect PIN');
        setPin('');
      }
    }
  };

  const getTitle = () => {
    if (step === 'verify') return 'Enter PIN';
    if (step === 'enter') return 'Set PIN';
    if (step === 'confirm') return 'Confirm PIN';
    if (step === 'change') return 'Enter Current PIN';
    return 'PIN';
  };

  const getSubtitle = () => {
    if (step === 'verify') return 'Enter your 4-digit PIN to unlock';
    if (step === 'enter') return 'Choose a 4-digit PIN';
    if (step === 'confirm') return 'Re-enter your PIN';
    return '';
  };

  if (isLoading) {
    return null;
  }

  return (
    <PinPad
      title={getTitle()}
      subtitle={getSubtitle()}
      pin={pin}
      onComplete={(pin) => { void handlePinComplete(pin); }}
      onPinChange={setPin}
    />
  );
}