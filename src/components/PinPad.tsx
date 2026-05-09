import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/styles/global';

interface PinPadProps {
  title: string;
  subtitle?: string;
  pin: string;
  onComplete: (pin: string) => void;
  onPinChange?: (pin: string) => void;
  cancelButton?: React.ReactNode;
}

export function PinPad({ title, subtitle, pin, onComplete, onPinChange, cancelButton }: PinPadProps) {
  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + num;
    onPinChange?.(newPin);
    if (newPin.length === 4) {
      onComplete(newPin);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      onPinChange?.(pin.slice(0, -1));
    }
  };

  return (
    <View style={styles.container}>
      {cancelButton}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled]} />
        ))}
      </View>
      <View style={styles.keypad}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('1')}><Text style={styles.keyText}>1</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('2')}><Text style={styles.keyText}>2</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('3')}><Text style={styles.keyText}>3</Text></TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('4')}><Text style={styles.keyText}>4</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('5')}><Text style={styles.keyText}>5</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('6')}><Text style={styles.keyText}>6</Text></TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('7')}><Text style={styles.keyText}>7</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('8')}><Text style={styles.keyText}>8</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('9')}><Text style={styles.keyText}>9</Text></TouchableOpacity>
        </View>
        <View style={styles.row}>
          <View style={styles.key} />
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('0')}><Text style={styles.keyText}>0</Text></TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 80,
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