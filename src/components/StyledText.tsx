import { Text, TextProps } from 'react-native';
import { globalStyles } from '@/styles/global';

interface StyledTextProps extends TextProps {
  children: React.ReactNode;
}

export function StyledText({ style, ...props }: StyledTextProps) {
  return (
    <Text style={[globalStyles.text, style as object]} {...props} />
  );
}
