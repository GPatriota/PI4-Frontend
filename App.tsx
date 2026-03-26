import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { runMigrations } from './src/database/database';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    runMigrations();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
