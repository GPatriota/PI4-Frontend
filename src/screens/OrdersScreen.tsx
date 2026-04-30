import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../contexts/AuthContext';
import { getOrderById, getOrders } from '../api/e2e';
import type { AppStackParamList, Order, OrderWithItems } from '../types';

type Nav = StackNavigationProp<AppStackParamList>;

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
};

const STATUS_COLOR: Record<Order['status'], string> = {
  pending: '#F59E0B',
  confirmed: '#16A34A',
  cancelled: '#EF4444',
};

export default function OrdersScreen() {
  const navigation = useNavigation<Nav>();
  const { accessToken, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [detail, setDetail] = useState<OrderWithItems | null>(null);

  const load = useCallback(async () => {
    if (!user || !accessToken) return;
    const data = await getOrders(accessToken);
    setOrders(data);
  }, [accessToken, user]);

  useEffect(() => {
    load().catch(() => setOrders([]));
  }, [load]);

  async function handleExpand(id: number) {
    if (expanded === id) {
      setExpanded(null);
      setDetail(null);
    } else {
      setExpanded(id);
      if (!accessToken) return;
      const data = await getOrderById(accessToken, id);
      setDetail(data);
    }
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meus Pedidos</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Nenhum pedido ainda</Text>
          <Text style={styles.emptyText}>Seus pedidos aparecerão aqui após a compra</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Main', { screen: 'Home' } as never)}
          >
            <Text style={styles.shopButtonText}>Explorar produtos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Pedidos</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isExpanded = expanded === item.id;
          return (
            <View style={styles.orderCard}>
              <TouchableOpacity onPress={() => { handleExpand(item.id).catch(() => undefined); }} activeOpacity={0.85}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>Pedido #{item.id}</Text>
                    <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                  </View>
                  <View style={styles.orderRight}>
                    <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[item.status]}20` }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                        {STATUS_LABEL[item.status]}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#9CA3AF"
                    />
                  </View>
                </View>
                <View style={styles.orderSummaryRow}>
                  <Text style={styles.orderTotal}>{formatPrice(item.total)}</Text>
                  {item.shipping === 0 && (
                    <View style={styles.freeShippingPill}>
                      <Text style={styles.freeShippingText}>Frete Grátis</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {isExpanded && detail && (
                <View style={styles.itemsList}>
                  <View style={styles.divider} />
                  {detail.items.map((oi) => (
                    <View key={oi.id} style={styles.orderItem}>
                      <View style={styles.orderItemLeft}>
                        <Ionicons name="cube-outline" size={16} color="#6B7280" />
                        <Text style={styles.orderItemName} numberOfLines={1}>{oi.product.name}</Text>
                      </View>
                      <Text style={styles.orderItemDetails}>
                        {oi.quantity}x {formatPrice(oi.unitPrice)}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.orderTotals}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Subtotal</Text>
                      <Text style={styles.totalValue}>{formatPrice(item.subtotal)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Frete</Text>
                      <Text style={[styles.totalValue, item.shipping === 0 && styles.greenText]}>
                        {item.shipping === 0 ? 'Grátis' : formatPrice(item.shipping)}
                      </Text>
                    </View>
                    <View style={[styles.totalRow, styles.grandTotalRow]}>
                      <Text style={styles.grandTotalLabel}>Total</Text>
                      <Text style={styles.grandTotalValue}>{formatPrice(item.total)}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 12 },
  emptyText: { fontSize: 14, color: '#6B7280' },
  shopButton: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  shopButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  orderId: { fontSize: 14, fontWeight: '700', color: '#111827' },
  orderDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  orderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  orderSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderTotal: { fontSize: 18, fontWeight: '800', color: '#111827' },
  freeShippingPill: { backgroundColor: '#DCFCE7', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  freeShippingText: { fontSize: 11, color: '#16A34A', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  itemsList: {},
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  orderItemName: { fontSize: 13, color: '#374151', flex: 1 },
  orderItemDetails: { fontSize: 13, fontWeight: '600', color: '#111827' },
  orderTotals: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  totalLabel: { fontSize: 13, color: '#6B7280' },
  totalValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  greenText: { color: '#16A34A' },
  grandTotalRow: { marginTop: 4 },
  grandTotalLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  grandTotalValue: { fontSize: 15, fontWeight: '800', color: '#2563EB' },
});
