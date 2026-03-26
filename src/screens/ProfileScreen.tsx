import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const BLUE = '#2563EB';

type MenuRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  labelColor?: string;
};

function MenuRow({ icon, iconColor = '#6B7280', label, subtitle, rightElement, onPress, labelColor = '#111827' }: MenuRowProps) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.menuIconWrap, { backgroundColor: '#F3F4F6' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, { color: labelColor }]}>{label}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightElement ?? <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />}
    </TouchableOpacity>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const [adminMode, setAdminMode] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'US';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar & user info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
        </View>

        {/* Endereço principal */}
        {user?.address && (
          <>
            <SectionTitle title="ENDEREÇO PRINCIPAL" />
            <View style={styles.card}>
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={18} color="#6B7280" style={{ marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressLabel}>{user.address.label}</Text>
                  <Text style={styles.addressText}>{user.address.street}</Text>
                  <Text style={styles.addressText}>{user.address.city}</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.alterar}>Alterar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Atividades e conta */}
        <SectionTitle title="ATIVIDADES E CONTA" />
        <View style={styles.card}>
          <MenuRow
            icon="cube-outline"
            label="Meus Pedidos"
            subtitle="Histórico e rastreamento"
          />
          <View style={styles.divider} />
          <MenuRow
            icon="card-outline"
            label="Métodos de Pagamento"
            subtitle="Cartões e PIX salvos"
          />
          <View style={styles.divider} />
          <MenuRow
            icon="notifications-outline"
            label="Notificações"
            subtitle="Promoções e alertas de estoque"
          />
        </View>

        {/* Configurações */}
        <SectionTitle title="CONFIGURAÇÕES" />
        <View style={styles.card}>
          <MenuRow
            icon="shield-outline"
            label="Modo Administrador"
            subtitle="Acesso ao painel de gestão"
            rightElement={
              <Switch
                value={adminMode}
                onValueChange={setAdminMode}
                trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
                thumbColor={adminMode ? BLUE : '#9CA3AF'}
              />
            }
          />
          <View style={styles.divider} />
          <MenuRow
            icon="help-circle-outline"
            label="Suporte e Ajuda"
          />
          <View style={styles.divider} />
          <MenuRow
            icon="log-out-outline"
            iconColor="#EF4444"
            label="Sair"
            labelColor="#EF4444"
            rightElement={<View />}
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>ElectroShop v2.4.0 • 2024</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  addressRow: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'flex-start',
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
  alterar: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 58,
  },
  footer: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
