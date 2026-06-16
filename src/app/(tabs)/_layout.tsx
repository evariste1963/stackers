import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const tabs = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'portfolio', title: 'Portfolio', icon: 'wallet' },
  { name: 'yourStack', title: 'Your Stack', icon: 'prism' },
  { name: 'add2stack', title: 'Add-2-stack', icon: 'add-circle' },
  { name: 'account', title: 'Account', icon: 'person-sharp' },
];

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.themeGrey,
        },
        tabBarActiveTintColor: colors.themeBlue,
        tabBarInactiveTintColor: colors.gold,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={tab.icon as any} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}