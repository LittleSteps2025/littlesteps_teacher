// teacher/tabs/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>

    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 80,
          paddingTop: 16,
          paddingBottom: 16,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopWidth: 0,
          elevation: 8,
        },
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >


<Tabs.Screen
  name="profiles"
  options={{
    title: 'Children', // ✅ Not "profiles"
    tabBarIcon: ({ color }) => (
      <Ionicons name="people" size={24} color={color} />
    ),
  }}
/>

          
<Tabs.Screen
  name="child-reports"
  options={{
    title: 'Reports ',
    tabBarIcon: ({ color }) => (
      <Ionicons name="document-text" size={24} color={color} />
    ),
  }}
/>

      </Tabs>
      </ SafeAreaView >

  );
}
