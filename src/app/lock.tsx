import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/global';
import { useRouter } from 'expo-router';

export default function LockScreen() {
  const [pin, setPin] = useState('');
  const [isNewPin, setIsNewPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm' | 'change' | 'verify'>('verify');
  const { login, userSetPin, isLoading, isAuthenticated, hasPinSet } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && hasPinSet) {
      router.replace('/');
    }
  }, [isAuthenticated, hasPinSet]);

  const handlePress = (num: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      handlePinComplete(newPin);
    }
  };

  const handlePinComplete = async (enteredPin: string) => {
    if (step === 'verify') {
      const success = await login(enteredPin);
      if (!success) {
        Alert.alert('Error', 'Incorrect PIN');
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
      const success = await login(enteredPin);
      if (success) {
        setPin('');
        setStep('enter');
      } else {
        Alert.alert('Error', 'Incorrect PIN');
        setPin('');
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
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
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
      </View>

      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              pin.length > i && styles.dotFilled,
            ]}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('1')}>
            <Text style={styles.keyText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('2')}>
            <Text style={styles.keyText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('3')}>
            <Text style={styles.keyText}>3</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('4')}>
            <Text style={styles.keyText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('5')}>
            <Text style={styles.keyText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('6')}>
            <Text style={styles.keyText}>6</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('7')}>
            <Text style={styles.keyText}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('8')}>
            <Text style={styles.keyText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('9')}>
            <Text style={styles.keyText}>9</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <View style={styles.key} />
          <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={handleDelete}>
            <Text style={styles.keyText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey,
  },
  loadingText: {
    color: colors.gold,
    fontSize: 18,
  },
  dotsContainer: {
    flexDirection: 'row',
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