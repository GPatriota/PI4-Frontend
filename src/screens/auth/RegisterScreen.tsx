import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';

type Props = {
  navigation: StackNavigationProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Conta</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../../../assets/LogoElectro.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Junte-se a nós</Text>
        <Text style={styles.tagline}>Sua jornada tecnológica começa aqui.</Text>

        {/* Nome Completo */}
        <Text style={styles.label}>Nome Completo</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ex: João Silva"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
        </View>

        {/* E-mail */}
        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Senha */}
        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeIcon}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        {/* Confirmar Senha */}
        <Text style={styles.label}>Confirmar Senha</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeIcon}>
            <Ionicons
              name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        {/* Hint */}
        <View style={styles.hintRow}>
          <Ionicons name="information-circle-outline" size={14} color="#9CA3AF" />
          <Text style={styles.hintText}> Mínimo de 8 caracteres e um número</Text>
        </View>

        {/* Cadastrar button */}
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Cadastrar  →</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU CONTINUE COM</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
            <Text style={styles.socialButtonText}>🇧🇷  Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
            <Text style={styles.socialButtonText}>🍎  Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>Entrar agora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  eyeIcon: {
    padding: 4,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  hintText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  socialButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
});
