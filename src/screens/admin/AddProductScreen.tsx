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
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';

import * as categoriesDb from '../../database/categories';
import * as productsDb from '../../database/products';
import type { AppStackParamList, Category } from '../../types';
import { uploadImage } from '../../utils/cloudinary';

type Nav = StackNavigationProp<AppStackParamList, 'AddProduct'>;

export default function AddProductScreen() {
  const navigation = useNavigation<Nav>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [rating, setRating] = useState('');
  const [ratingCount, setRatingCount] = useState('');
  const [badge, setBadge] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const cats = categoriesDb.findAll();
    setCategories(cats);
    if (cats.length > 0) setCategoryId(cats[0].id);
  }, []);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para enviar imagens.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageUrl('');
    }
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Atenção', 'Informe o nome do produto.'); return; }
    if (!categoryId) { Alert.alert('Atenção', 'Selecione uma categoria.'); return; }
    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice <= 0) { Alert.alert('Atenção', 'Informe um preço válido.'); return; }
    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) { Alert.alert('Atenção', 'Informe um estoque válido.'); return; }

    let finalImageUrl = imageUrl.trim() || null;

    if (imageUri && !imageUrl) {
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

    productsDb.create({
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

    Alert.alert('Sucesso', 'Produto cadastrado!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Produto</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={uploading}>
          {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="checkmark" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

          {/* Image */}
          <Text style={styles.sectionLabel}>MÍDIA DO PRODUTO</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="cloud-upload-outline" size={32} color="#9CA3AF" />
                <Text style={styles.imagePlaceholderText}>Carregar imagem</Text>
                <Text style={styles.imagePlaceholderSub}>PNG, JPG ou WEBP (Máx. 5MB)</Text>
              </View>
            )}
          </TouchableOpacity>

          <Field label="URL da imagem (alternativa ao upload)" value={imageUrl} onChangeText={(v) => { setImageUrl(v); setImageUri(null); }} placeholder="https://..." />
          <Field label="Texto alternativo (acessibilidade)" value={imageAlt} onChangeText={setImageAlt} placeholder="Descrição da imagem" />

          {/* General info */}
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

          {/* Prices & inventory */}
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

          {/* Additional details */}
          <Text style={styles.sectionLabel}>DETALHES ADICIONAIS</Text>
          <Field label="Descrição Completa" value={description} onChangeText={setDescription} placeholder="Descreva as especificações técnicas e benefícios do produto..." multiline />

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

          <Text style={styles.saveHint}>Ao salvar, o produto ficará visível imediatamente na loja para os clientes.</Text>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={uploading} activeOpacity={0.85}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Produto</Text>
            )}
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
  imagePlaceholderSub: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
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
  saveHint: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  saveButton: {
    backgroundColor: '#2563EB', borderRadius: 12, height: 52,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
