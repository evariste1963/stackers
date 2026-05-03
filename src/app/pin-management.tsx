import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/global';

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

  const handlePress = (num: string) => {
    if (pin.length >= 4) return;
    const newPinStr = pin + num;
    setPin(newPinStr);

    if (newPinStr.length === 4) {
      handlePinComplete(newPinStr);
    }
  };

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

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
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
    <View style={styles.container}>
      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
      </View>

      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled]} />
        ))}
      </View>

      <View style={styles.keypad}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('1')}><Text style={styles.keyText}>1</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('2')}><Text style={styles.keyText}>2</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('3')}><Text style={styles.keyText}>3</Text></TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('4')}><Text style={styles.keyText}>4</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('5')}><Text style={styles.keyText}>5</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('6')}><Text style={styles.keyText}>6</Text></TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('7')}><Text style={styles.keyText}>7</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('8')}><Text style={styles.keyText}>8</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('9')}><Text style={styles.keyText}>9</Text></TouchableOpacity>
        </View>
        <View style={styles.row}>
          <View style={styles.key} />
          <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}><Text style={styles.keyText}>0</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={handleDelete}><Text style={styles.keyText}>⌫</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gold,
    marginHorizontal: 10,
  },
  dotFilled: {
    backgroundColor: colors.gold,
  },
  keypad: {
    width: '100%',
    maxWidth: 280,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.themeGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '500',
  },
});