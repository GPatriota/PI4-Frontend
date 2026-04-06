import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
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
import * as cartItemsDb from '../database/cartItems';
import * as ordersDb from '../database/orders';
import type { AppStackParamList, CartItemWithProduct } from '../types';

type Nav = StackNavigationProp<AppStackParamList>;

const FREE_SHIPPING_THRESHOLD = 499;

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CartScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);

  const loadCart = useCallback(() => {
    if (!user) return;
    setItems(cartItemsDb.findByUser(user.id));
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 19.9;
  const total = subtotal + shipping;

  function handleRemove(id: number) {
    cartItemsDb.remove(id);
    loadCart();
  }

  function handleUpdateQty(id: number, qty: number) {
    if (qty < 1) {
      cartItemsDb.remove(id);
    } else {
      cartItemsDb.updateQuantity(id, qty);
    }
    loadCart();
  }

  function handleCheckout() {
    if (!user || items.length === 0) return;
    Alert.alert('Finalizar Compra', `Total: ${formatPrice(total)}\nConfirmar pedido?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: () => {
          ordersDb.create(
            user.id,
            items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.product.price })),
            shipping
          );
          setItems([]);
          navigation.navigate('Main', { screen: 'Pedidos' } as never);
        },
      },
    ]);
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Carrinho</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
          <Text style={styles.emptyText}>Adicione produtos para continuar</Text>
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
        <Text style={styles.headerTitle}>Meu Carrinho</Text>
      </View>

      <View style={styles.infoBanner}>
        <Ionicons name="cube-outline" size={14} color="#2563EB" />
        <Text style={styles.infoBannerText}> Frete Grátis em compras {'>'} R$499  </Text>
        <Ionicons name="shield-checkmark-outline" size={14} color="#2563EB" />
        <Text style={styles.infoBannerText}> Compra 100% Segura</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            {item.product.imageUrl ? (
              <Image
                source={{ uri: item.product.imageUrl }}
                style={styles.itemImage}
                resizeMode="contain"
                accessibilityLabel={item.product.imageAlt ?? item.product.name}
              />
            ) : (
              <View style={[styles.itemImage, styles.noImage]}>
                <Ionicons name="image-outline" size={24} color="#D1D5DB" />
              </View>
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
              {item.product.originalPrice != null && item.product.originalPrice > item.product.price && (
                <Text style={styles.itemOriginalPrice}>{formatPrice(item.product.originalPrice)}</Text>
              )}
              <Text style={styles.itemPrice}>{formatPrice(item.product.price * item.quantity)}</Text>
              <View style={styles.itemActions}>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleUpdateQty(item.id, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={14} color="#374151" />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleUpdateQty(item.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={14} color="#374151" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => handleRemove(item.id)}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frete</Text>
              <Text style={[styles.summaryValue, shipping === 0 && styles.freeShipping]}>
                {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
              </Text>
            </View>
          </View>
        }
      />
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total da Compra</Text>
          <View>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            <Text style={styles.installmentHint}>EM ATÉ 12X SEM JUROS</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout} activeOpacity={0.85}>
          <Text style={styles.checkoutButtonText}>Finalizar Compra  →</Text>
        </TouchableOpacity>
      </View>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  infoBannerText: { fontSize: 12, color: '#2563EB', fontWeight: '500' },
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
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  itemImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#F9FAFB' },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 2 },
  itemOriginalPrice: { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through' },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#2563EB', marginBottom: 8 },
  itemActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { fontSize: 14, fontWeight: '700', color: '#111827', minWidth: 20, textAlign: 'center' },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  freeShipping: { color: '#16A34A' },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  totalLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right' },
  installmentHint: { fontSize: 10, color: '#6B7280', textAlign: 'right' },
  checkoutButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
