import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { colors } from '@/styles/global';
import { useTheme } from '@/contexts/ThemeContext';

interface PinPadProps {
  title: string;
  subtitle?: string;
  pin: string;
  onComplete: (pin: string) => void;
  onPinChange?: (pin: string) => void;
  cancelButton?: React.ReactNode;
}

export function PinPad({ title, subtitle, pin, onComplete, onPinChange, cancelButton }: PinPadProps) {
  const { colors: themeColors } = useTheme();
  const s = useMemo(() => createStyles(themeColors), [themeColors]);

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
    <View style={s.container}>
      {cancelButton}
      <View style={s.header}>
        <Text style={s.title}>{title}</Text>
        {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      </View>
      <View style={s.dotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[s.dot, pin.length > i && s.dotFilled]} />
        ))}
      </View>
      <View style={s.keypad}>
        <View style={s.row}>
          <TouchableOpacity style={s.key} onPress={() => handleKeyPress('1')}><Text style={s.keyText}>1</Text></TouchableOpacity>
          <TouchableOpacity style={s.key} onPress={() => handleKeyPress('2')}><Text style={s.keyText}>2</Text></TouchableOpacity>
          <TouchableOpacity style={s.key} onPress={() => handleKeyPress('3')}><Text style={s.keyText}>3</Text></TouchableOpacity>
        </View>
        <View style={s.row}>
          <TouchableOpacity style={s.key} onPress={() => handleKeyPress('4')}><Text style={s.keyText}>4</Text></TouchableOpacity>
          <TouchableOpacity style={s.key} onPress={() => handleKeyPress('5')}><Text style={s.keyText}>5</Text></TouchableOpacity>
          <TouchableOpacity style={s.key} onPress={() => handleKeyPress('6')}><Text style={s.keyText}>6</Text></TouchableOpacity>
        </View>
        <View style={s.row}>
          <TouchableOpacity style={s.key} onPress={() => handleKeyPress('7')}><Text style={s.keyText}>7</Text></TouchableOpacity>
          <TouchableOpacity style={s.key} onPress={() => handleKeyPress('8')}><Text style={s.keyText}>8</Text></TouchableOpacity>
          <TouchableOpacity style={s.key} onPress={() => handleKeyPress('9')}><Text style={s.keyText}>9</Text></TouchableOpacity>
        </View>
        <View style={s.row}>
          <View style={s.key} />
          <TouchableOpacity style={s.key} onPress={() => handleKeyPress('0')}><Text style={s.keyText}>0</Text></TouchableOpacity>
          <TouchableOpacity style={s.key} onPress={handleDelete}><Text style={s.keyText}>⌫</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function createStyles(c: typeof colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
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
      color: c.gold,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: c.grey,
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
      borderColor: c.gold,
      marginHorizontal: 10,
    },
    dotFilled: {
      backgroundColor: c.gold,
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
      backgroundColor: c.themeGrey,
      justifyContent: 'center',
      alignItems: 'center',
    },
    keyText: {
      fontSize: 28,
      color: c.text,
      fontWeight: '500',
    },
  });
}
