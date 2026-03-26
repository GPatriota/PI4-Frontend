import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

export default function AppNavigator() {
  const { user } = useAuth();
  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
