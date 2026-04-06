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

import * as categoriesDb from '../../database/categories';
import * as productsDb from '../../database/products';
import type { AppStackParamList, Category, Product } from '../../types';

type Nav = StackNavigationProp<AppStackParamList>;

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductManagementScreen() {
  const navigation = useNavigation<Nav>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const load = useCallback(() => {
    setProducts(productsDb.findAll(false));
    setCategories(categoriesDb.findAll());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function categoryName(id: number) {
    return categories.find((c) => c.id === id)?.name ?? '—';
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Produtos</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={56} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Nenhum produto cadastrado</Text>
          <Text style={styles.emptyText}>Toque no + para adicionar o primeiro produto</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productRow}
              onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
              activeOpacity={0.85}
            >
              <View style={[styles.activeIndicator, { backgroundColor: item.isActive ? '#16A34A' : '#9CA3AF' }]} />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productCategory}>{categoryName(item.categoryId)}</Text>
              </View>
              <View style={styles.productRight}>
                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                <View style={[styles.statusPill, { backgroundColor: item.isActive ? '#DCFCE7' : '#F3F4F6' }]}>
                  <Text style={[styles.statusText, { color: item.isActive ? '#16A34A' : '#9CA3AF' }]}>
                    {item.isActive ? 'Ativo' : 'Inativo'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#6B7280' },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  activeIndicator: { width: 6, height: 36, borderRadius: 3, marginRight: 12 },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  productCategory: { fontSize: 12, color: '#6B7280' },
  productRight: { alignItems: 'flex-end', gap: 4 },
  productPrice: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  statusPill: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 11, fontWeight: '600' },
});
