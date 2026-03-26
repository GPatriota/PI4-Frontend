import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TabParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const BLUE = '#2563EB';
const GRAY = '#9CA3AF';

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Perfil"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: BLUE,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: focused ? 'home' : 'home-outline',
            Carrinho: focused ? 'cart' : 'cart-outline',
            Pedidos: focused ? 'list' : 'list-outline',
            Perfil: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Carrinho" component={CartScreen} />
      <Tab.Screen name="Pedidos" component={OrdersScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
