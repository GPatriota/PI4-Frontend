import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../contexts/AuthContext';
import { addCartItem, getProductById } from '../api/e2e';
import type { AppStackParamList } from '../types';

type Nav = StackNavigationProp<AppStackParamList, 'ProductDetail'>;
type Route = RouteProp<AppStackParamList, 'ProductDetail'>;

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { accessToken, user } = useAuth();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Awaited<ReturnType<typeof getProductById>> | null>(null);

  useEffect(() => {
    getProductById(route.params.productId)
      .then(setProduct)
      .catch(() => setProduct(null));
  }, [route.params.productId]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Produto não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const installment = product.price / 12;

  async function handleAddToCart() {
    if (!accessToken || !user || !product) return;
    await addCartItem(accessToken, product.id, qty);
    Alert.alert('Adicionado!', `${product.name} foi adicionado ao carrinho.`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Produto</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="share-social-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {product.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          ) : null}
          <TouchableOpacity style={styles.heartBtn}>
            <Ionicons name="heart-outline" size={22} color="#9CA3AF" />
          </TouchableOpacity>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
              accessibilityLabel={product.imageAlt ?? product.name}
            />
          ) : (
            <View style={[styles.productImage, styles.noImage]}>
              <Ionicons name="image-outline" size={64} color="#D1D5DB" />
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>ELECTROSERIES</Text>
            {product.rating != null && (
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}> {product.rating.toFixed(1)}</Text>
                {product.ratingCount != null && (
                  <Text style={styles.ratingCount}> ({product.ratingCount})</Text>
                )}
              </View>
            )}
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <Text style={styles.installment}>
            12x de {formatPrice(installment)} sem juros
          </Text>
          {product.originalPrice != null && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>
              De: {formatPrice(product.originalPrice)}
            </Text>
          )}

          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Quantidade:</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Ionicons name="remove" size={18} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQty((q) => Math.min(product!.stock, q + 1))}
            >
              <Ionicons name="add" size={18} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.stockText}>Estoque: {product.stock}</Text>
          </View>

          <Text style={styles.sectionLabel}>Descrição</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="cube-outline" size={20} color="#2563EB" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Frete Grátis</Text>
              <Text style={styles.infoSub}>Para todo o Brasil em compras acima de R$ 200</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#2563EB" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Garantia de 12 Meses</Text>
              <Text style={styles.infoSub}>Proteção completa contra defeitos de fábrica</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, product.stock === 0 && styles.addButtonDisabled]}
          onPress={() => {
            handleAddToCart().catch(() => Alert.alert('Erro', 'Nao foi possivel adicionar ao carrinho.'));
          }}
          disabled={product.stock === 0}
          activeOpacity={0.85}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.addButtonText}>
            {product.stock === 0 ? 'Sem estoque' : 'Adicionar ao Carrinho'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#6B7280', fontSize: 15 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  imageContainer: {
    backgroundColor: '#F9FAFB',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  heartBtn: { position: 'absolute', top: 12, right: 12, padding: 4 },
  productImage: { width: '100%', height: 220 },
  noImage: { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  body: { paddingHorizontal: 16, paddingBottom: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  brandText: { fontSize: 12, fontWeight: '700', color: '#2563EB', letterSpacing: 0.5 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#D97706' },
  ratingCount: { fontSize: 11, color: '#9CA3AF' },
  productName: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 12, lineHeight: 28 },
  price: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 2 },
  installment: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  originalPrice: { fontSize: 13, color: '#9CA3AF', textDecorationLine: 'line-through', marginBottom: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  qtyLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { fontSize: 16, fontWeight: '700', color: '#111827', minWidth: 24, textAlign: 'center' },
  stockText: { fontSize: 12, color: '#9CA3AF', marginLeft: 4 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8, marginTop: 4 },
  description: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 20 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  infoSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonDisabled: { backgroundColor: '#9CA3AF' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
