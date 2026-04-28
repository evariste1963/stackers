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
        tabBarActiveTintColor: '#B8860B',
        tabBarInactiveTintColor: '#B8860B',
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ size }) => (
            <Ionicons name='home' size={size} color={colors.chartLine} />
          ),
        }}
      />
      <Tabs.Screen
        name='yourStack'
        options={{
          title: 'Your Stack',
          tabBarIcon: ({ size }) => (
            <Ionicons name='triangle' size={size} color={colors.chartLine} />
          ),
        }}
      />
      <Tabs.Screen
        name='add2stack'
        options={{
          title: 'Add-2-stack',
          tabBarIcon: ({ size }) => (
            <Ionicons name='add-circle' size={size} color={colors.chartLine} />
          ),
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon: ({ size }) => (
            <Ionicons name='settings-sharp' size={size} color={colors.chartLine} />
          ),
        }}
      />
    </Tabs>
  );
}
