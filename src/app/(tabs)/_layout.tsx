import { colors } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.surface,
        },
        tabBarActiveTintColor: colors.themeColorPrimary,
        tabBarInactiveTintColor: '#B8860B',
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ size }) => (
            <Ionicons name='home' size={size} color={colors.themeColorPrimary} />
          ),
        }}
      />
      <Tabs.Screen
        name='yourStack'
        options={{
          title: 'Your Stack',
          tabBarIcon: ({ size }) => (
            <Ionicons name='prism' size={size} color={colors.themeColorPrimary} />
          ),
        }}
      />
      <Tabs.Screen
        name='add2stack'
        options={{
          title: 'Add-2-stack',
          tabBarIcon: ({ size }) => (
            <Ionicons name='add-circle' size={size} color={colors.themeColorPrimary} />
          ),
        }}
      />
      <Tabs.Screen
        name='account'
        options={{
          title: 'Account',
          tabBarIcon: ({ size }) => (
            <Ionicons name='person-sharp' size={size} color={colors.themeColorPrimary} />
          ),
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
