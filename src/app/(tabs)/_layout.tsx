import { colors } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

const tabs = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'yourStack', title: 'Your Stack', icon: 'prism' },
  { name: 'add2stack', title: 'Add-2-stack', icon: 'add-circle' },
  { name: 'account', title: 'Account', icon: 'person-sharp' },
];

export default function TabLayout() {
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
            tabBarIcon: ({ size }) => (
              <Ionicons name={tab.icon as any} size={size} color={colors.themeBlue} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
