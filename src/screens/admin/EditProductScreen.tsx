import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';

import * as categoriesDb from '../../database/categories';
import * as productsDb from '../../database/products';
import type { AppStackParamList, Category } from '../../types';
import { uploadImage } from '../../utils/cloudinary';

type Nav = StackNavigationProp<AppStackParamList, 'EditProduct'>;
type Route = RouteProp<AppStackParamList, 'EditProduct'>;

export default function EditProductScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  const product = productsDb.findById(route.params.productId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(product?.categoryId ?? 0);
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price.toString() ?? '');
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice?.toString() ?? '');
  const [stock, setStock] = useState(product?.stock.toString() ?? '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
  const [imageAlt, setImageAlt] = useState(product?.imageAlt ?? '');
  const [rating, setRating] = useState(product?.rating?.toString() ?? '');
  const [ratingCount, setRatingCount] = useState(product?.ratingCount?.toString() ?? '');
  const [badge, setBadge] = useState(product?.badge ?? '');
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setCategories(categoriesDb.findAll());
  }, []);

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Produto não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Atenção', 'Informe o nome do produto.'); return; }
    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice <= 0) { Alert.alert('Atenção', 'Informe um preço válido.'); return; }
    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) { Alert.alert('Atenção', 'Informe um estoque válido.'); return; }

    let finalImageUrl: string | null = imageUrl.trim() || null;

    if (imageUri) {
      try {
        setUploading(true);
        finalImageUrl = await uploadImage(imageUri);
      } catch {
        Alert.alert('Erro', 'Falha ao enviar imagem. Verifique as configurações do Cloudinary.');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    productsDb.update(product.id, {
      categoryId,
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      originalPrice: originalPrice ? parseFloat(originalPrice.replace(',', '.')) : null,
      stock: parsedStock,
      imageUrl: finalImageUrl,
      imageAlt: imageAlt.trim() || null,
      rating: rating ? parseFloat(rating.replace(',', '.')) : null,
      ratingCount: ratingCount ? parseInt(ratingCount, 10) : null,
      badge: badge.trim() || null,
      isActive,
    });

    Alert.alert('Sucesso', 'Produto atualizado!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  function handleDelete() {
    Alert.alert(
      'Excluir Produto',
      `Tem certeza que deseja excluir "${product.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            productsDb.remove(product.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  const currentImageSource = imageUri ?? imageUrl;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Produto</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={uploading}>
          {uploading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="checkmark" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

          <Text style={styles.sectionLabel}>MÍDIA DO PRODUTO</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {currentImageSource ? (
              <Image source={{ uri: currentImageSource }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="cloud-upload-outline" size={32} color="#9CA3AF" />
                <Text style={styles.imagePlaceholderText}>Trocar imagem</Text>
              </View>
            )}
          </TouchableOpacity>

          <Field label="URL da imagem (alternativa ao upload)" value={imageUrl} onChangeText={(v) => { setImageUrl(v); setImageUri(null); }} placeholder="https://..." />
          <Field label="Texto alternativo (acessibilidade)" value={imageAlt} onChangeText={setImageAlt} placeholder="Descrição da imagem" />

          <Text style={styles.sectionLabel}>INFORMAÇÕES GERAIS</Text>
          <Field label="Nome do Produto *" value={name} onChangeText={setName} placeholder="Ex: Notebook Gamer Ultra" />

          <Text style={styles.fieldLabel}>Categoria *</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, categoryId === cat.id && styles.catChipActive]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={[styles.catChipText, categoryId === cat.id && styles.catChipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>PREÇOS E INVENTÁRIO</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Preço (R$) *" value={price} onChangeText={setPrice} placeholder="0,00" keyboardType="decimal-pad" />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Field label="Preço Original (R$)" value={originalPrice} onChangeText={setOriginalPrice} placeholder="0,00" keyboardType="decimal-pad" />
            </View>
          </View>
          <Field label="Estoque *" value={stock} onChangeText={setStock} placeholder="0" keyboardType="number-pad" />

          <Text style={styles.sectionLabel}>DETALHES ADICIONAIS</Text>
          <Field label="Descrição Completa" value={description} onChangeText={setDescription} placeholder="Especificações técnicas e benefícios..." multiline />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Avaliação (0-5)" value={rating} onChangeText={setRating} placeholder="4.5" keyboardType="decimal-pad" />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Field label="Nº de Avaliações" value={ratingCount} onChangeText={setRatingCount} placeholder="128" keyboardType="number-pad" />
            </View>
          </View>

          <Field label="Badge (ex: Novo, Lançamento)" value={badge} onChangeText={setBadge} placeholder="Novo" />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.fieldLabel}>Produto Ativo</Text>
              <Text style={styles.switchSub}>Visível para os clientes</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
              thumbColor={isActive ? '#2563EB' : '#9CA3AF'}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={uploading} activeOpacity={0.85}>
            {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar alterações</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.85}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Excluir produto</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, multiline }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 15, color: '#6B7280' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  saveBtn: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: 16 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#6B7280',
    letterSpacing: 0.8, marginTop: 16, marginBottom: 12,
  },
  imagePicker: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed',
    borderRadius: 12, overflow: 'hidden', marginBottom: 14, minHeight: 140,
  },
  previewImage: { width: '100%', height: 200 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  imagePlaceholderText: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, paddingHorizontal: 12, height: 46,
    fontSize: 14, color: '#111827',
  },
  inputMultiline: { height: 100, paddingTop: 12 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  catChip: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#fff',
  },
  catChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  catChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  catChipTextActive: { color: '#fff' },
  row: { flexDirection: 'row' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 14,
  },
  switchSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  saveButton: {
    backgroundColor: '#2563EB', borderRadius: 12, height: 52,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 12,
    height: 52, gap: 8, marginBottom: 24,
  },
  deleteButtonText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});
