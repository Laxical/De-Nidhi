import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          headerShown:false,
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
          tabBarLabelStyle: { color: '#FFFFFF' },
        }}
      />

      <Tabs.Screen
        name="profile"
        
        options={{
          headerShown:false,

          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
          tabBarLabelStyle: { color: '#FFFFFF' },
        }}
      />
            <Tabs.Screen
        name="transactions"
        options={{
          headerShown:false,
          title: 'About',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size} />
          ),
          tabBarLabelStyle: { color: '#FFFFFF' },
        }}
      />
    </Tabs>
  );
}
