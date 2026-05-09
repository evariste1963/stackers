import { useState, useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/global';
import { PinPad } from '@/components/PinPad';

type Step = 'current' | 'new' | 'confirm';
type Mode = 'set' | 'change' | 'remove';

export default function PinManagementScreen() {
  const { mode } = useLocalSearchParams<{ mode: Mode }>();
  const router = useRouter();
  const [step, setStep] = useState<Step>('current');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const { login, userSetPin, userChangePin, userRemovePin } = useAuth();

  const activeMode: Mode = mode || 'set';

  useEffect(() => {
    if (activeMode === 'set') {
      setStep('new');
    }
  }, [activeMode]);

  const handlePinComplete = async (enteredPin: string) => {
    if (activeMode === 'remove') {
      Alert.alert(
        'Remove PIN',
        'Are you sure you want to remove your PIN?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              const success = await userRemovePin(enteredPin);
              if (success) {
                Alert.alert('Success', 'PIN removed');
                router.back();
              } else {
                Alert.alert('Error', 'Incorrect PIN');
                setPin('');
              }
            },
          },
        ]
      );
      setPin('');
    } else if (activeMode === 'set') {
      if (step === 'new') {
        setNewPin(enteredPin);
        setPin('');
        setStep('confirm');
      } else if (step === 'confirm') {
        if (enteredPin === newPin) {
          await userSetPin(enteredPin);
          Alert.alert('Success', 'PIN set successfully');
          router.back();
        } else {
          Alert.alert('Error', 'PINs do not match');
          setPin('');
          setStep('new');
          setNewPin('');
        }
      }
    } else {
      if (step === 'current') {
        const success = await login(enteredPin);
        if (success) {
          setPin('');
          setStep('new');
        } else {
          Alert.alert('Error', 'Incorrect PIN');
          setPin('');
        }
      } else if (step === 'new') {
        setNewPin(enteredPin);
        setPin('');
        setStep('confirm');
      } else if (step === 'confirm') {
        if (enteredPin === newPin) {
          const success = await userChangePin(newPin, enteredPin);
          if (success) {
            Alert.alert('Success', 'PIN changed successfully');
            router.back();
          }
        } else {
          Alert.alert('Error', 'PINs do not match');
          setPin('');
          setStep('new');
          setNewPin('');
        }
      }
    }
  };

  const getTitle = () => {
    if (activeMode === 'set') {
      return step === 'new' ? 'Set PIN' : 'Confirm PIN';
    }
    if (activeMode === 'remove') return 'Enter Current PIN';
    if (step === 'current') return 'Enter Current PIN';
    if (step === 'new') return 'Enter New PIN';
    return 'Confirm New PIN';
  };

  const getSubtitle = () => {
    if (activeMode === 'set') {
      return step === 'new' ? 'Choose a 4-digit PIN' : 'Re-enter your PIN';
    }
    if (activeMode === 'remove') return 'Enter your PIN to remove';
    if (step === 'current') return 'Enter your current PIN';
    if (step === 'new') return 'Choose a new 4-digit PIN';
    return 'Re-enter your new PIN';
  };

  return (
    <PinPad
      title={getTitle()}
      subtitle={getSubtitle()}
      pin={pin}
      onComplete={(pin) => { void handlePinComplete(pin); }}
      onPinChange={setPin}
      cancelButton={
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  cancelButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  cancelText: {
    color: colors.gold,
    fontSize: 16,
  },
});