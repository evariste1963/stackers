import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Image } from 'react-native';
import { colors, globalStyles } from '@/styles/global';

interface PageHeaderProps {
  title: string;
  style?: ViewStyle;
}

export default function PageHeader({ title, style }: PageHeaderProps) {
  return (
    <View style={[styles.outer, style]}>
      <View style={styles.inner}>
        <View style={globalStyles.logoContainer}>
          <Image source={require('../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
          <Text style={globalStyles.title}>{title}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingTop: 60,
    marginBottom: 20,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
});