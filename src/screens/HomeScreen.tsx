import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../contexts/AuthContext';
import { addCartItem, getCategories, getProducts } from '../api/e2e';
import type { AppStackParamList, Category, Product } from '../types';

type Nav = StackNavigationProp<AppStackParamList>;

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="star" size={11} color="#F59E0B" />
      <Text style={styles.ratingText}> {rating.toFixed(1)}</Text>
    </View>
  );
}

function ProductCard({ product, onPress, onAddCart }: {
  product: Product;
  onPress: () => void;
  onAddCart: () => void;
}) {
  return (
    <View style={styles.productCard}>
      {product.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{product.badge}</Text>
        </View>
      ) : null}
      {product.imageUrl ? (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
          resizeMode="contain"
          accessibilityLabel={product.imageAlt ?? product.name}
        />
      ) : (
        <View style={[styles.productImage, styles.noImage]}>
          <Ionicons name="image-outline" size={36} color="#D1D5DB" />
        </View>
      )}
      {product.rating != null ? <StarRating rating={product.rating} /> : null}
      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
      {product.originalPrice != null && product.originalPrice > product.price ? (
        <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
      ) : null}
      <Text style={styles.price}>{formatPrice(product.price)}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
          <Text style={styles.detailsButtonText}>Ver detalhes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartIconButton} onPress={onAddCart}>
          <Ionicons name="cart-outline" size={18} color="#2563EB" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { accessToken, user } = useAuth();
  const isAdmin = user?.email.includes('admin') ?? false;

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = useCallback(async () => {
    const categoryName = selectedCategory != null
      ? categories.find((category) => category.id === selectedCategory)?.name
      : undefined;

    const result = await getProducts({
      active: true,
      category: categoryName,
      search: search.trim() || undefined,
      page: 1,
      limit: 50,
    });
    setProducts(result);
  }, [categories, search, selectedCategory]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    loadProducts().catch(() => setProducts([]));
  }, [loadProducts]);

  async function handleAddToCart(productId: number) {
    if (!accessToken || !user) return;
    await addCartItem(accessToken, productId, 1);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Image
            source={require('../../assets/LogoElectro.png')}
            style={styles.topLogo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Carrinho' } as never)}>
            <Ionicons name="cart-outline" size={26} color="#111827" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="O que você está procurando hoje?"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.promoBanner}>
          <View>
            <Text style={styles.promoOff}>Até 30% OFF</Text>
            <Text style={styles.promoSub}>Apple Products</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Aproveitar Agora</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="phone-portrait-outline" size={64} color="rgba(255,255,255,0.4)" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <TouchableOpacity onPress={() => setSelectedCategory(null)}>
            <Text style={styles.seeAll}>Ver Todas</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="grid-outline" size={18} color={selectedCategory === null ? '#fff' : '#6B7280'} />
            <Text style={[styles.categoryChipText, selectedCategory === null && styles.categoryChipTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={selectedCategory === cat.id ? '#fff' : '#6B7280'}
              />
              <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {search.trim() ? 'Resultados' : selectedCategory ? 'Categoria' : 'Destaques'}
          </Text>
        </View>

        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {search.trim() ? 'Nenhum produto encontrado.' : 'Nenhum produto disponível ainda.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(p) => String(p.id)}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productRow}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                onAddCart={() => {
                  handleAddToCart(item.id).catch(() => undefined);
                }}
              />
            )}
          />
        )}

        <View style={styles.shippingBanner}>
          <Ionicons name="flash-outline" size={18} color="#2563EB" />
          <Text style={styles.shippingText}>
            {'  '}FRETE GRÁTIS{' '}
            <Text style={styles.shippingSubText}>Em compras acima de R$ 499</Text>
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddProduct')}
          accessibilityLabel="Adicionar produto"
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  topLogo: { width: 36, height: 36 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  promoBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoOff: { color: '#fff', fontSize: 22, fontWeight: '800' },
  promoSub: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 12 },
  promoButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  promoButtonText: { color: '#2563EB', fontSize: 12, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 13, color: '#2563EB', fontWeight: '500' },
  categoryScroll: { paddingLeft: 16, marginBottom: 16 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  categoryChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  categoryChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  categoryChipTextActive: { color: '#fff' },
  productRow: { paddingHorizontal: 16, gap: 12, marginBottom: 12 },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  productImage: { width: '100%', height: 120, marginBottom: 8, borderRadius: 8 },
  noImage: { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  ratingText: { fontSize: 11, color: '#6B7280' },
  productName: { fontSize: 13, fontWeight: '600', color: '#111827', marginTop: 4, marginBottom: 4 },
  originalPrice: { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through' },
  price: { fontSize: 15, fontWeight: '700', color: '#2563EB', marginBottom: 10 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailsButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  detailsButtonText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  cartIconButton: { backgroundColor: '#EFF6FF', borderRadius: 8, padding: 7 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: '#9CA3AF', fontSize: 14, marginTop: 12 },
  shippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    padding: 12,
  },
  shippingText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
  shippingSubText: { fontWeight: '400', color: '#374151' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});
