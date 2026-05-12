import { colors, globalStyles } from "@/styles/global";
import { Text, View, TextInput, TouchableOpacity, Image, ScrollView, Modal, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import PageHeader from '@/components/PageHeader';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths } from 'expo-file-system';
import { addItem, cleanOrphanedImages, getItemById, updateItem, isAppOwnedImage, type MetalType } from '@/services/stackStorage';
import { getUserSettings } from '@/services/settingsService';
import { getUnitAbbrev } from '@/utils/formatters';
import GoldPriceBanner from '@/components/GoldPriceBanner';
import { usePrice } from '@/contexts/PriceContext';
import { Ionicons } from '@expo/vector-icons';

export default function AddToStackScreen() {
  const { goldPriceData, silverPriceData, isLoading, settings, offGridMode, silverOffGridMode, refreshGoldPrice, refreshSilverPrice, updateManualPrice, updateManualSilverPrice } = usePrice();
  const { swipeGesture } = useSwipeNavigation('add2stack');
  const params = useLocalSearchParams<{ editId?: string }>();
  const editId = params.editId ? parseInt(params.editId, 10) : null;
  const isEditing = editId !== null;

  const [code, setCode] = useState('');
  const [weight, setWeight] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [originalImageUri, setOriginalImageUri] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'camera' | 'gallery' | 'existing'>('existing');
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [weightUnit, setWeightUnit] = useState('toz');
  const [metal, setMetal] = useState<MetalType>('gold');

  const clearForm = () => {
    setCode('');
    setWeight('');
    setPurchasePrice('');
    setTotalAmount('');
    setImageUri(null);
    setOriginalImageUri(null);
    setImageSource('existing');
    setMetal('gold');
  };

  const computedCostPerUnit = (() => {
    if (!weight || !totalAmount) return '';
    const w = parseFloat(weight);
    const t = parseFloat(totalAmount);
    if (w > 0 && !isNaN(t)) {
      return (t / w).toFixed(2);
    }
    return '';
  })();

  const costPerUnit = totalAmount ? computedCostPerUnit : purchasePrice;

  useFocusEffect(
    useCallback(() => {
      getUserSettings().then(settings => {
        setWeightUnit(settings.unit || 'toz');
        setMetal(settings.defaultMetal || 'gold');
      });

      clearForm();

      if (editId) {
        getItemById(editId).then(item => {
          if (item) {
            setCode(item.code);
            setWeight(item.weight);
            setPurchasePrice(item.purchasePrice);
            setImageUri(item.imageUri);
            setOriginalImageUri(item.imageUri);
            setMetal(item.metal || 'gold');
            setImageSource('existing');
          }
        });
      }
    }, [editId])
  );

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageSource('camera');
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required to select photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
      selectionLimit: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageSource('gallery');
    }
  };

  const handleSubmit = async () => {
    if (!code || !weight || !costPerUnit) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    const finalCost = totalAmount ? computedCostPerUnit : purchasePrice;
    setSubmitting(true);
    try {
      let savedUri: string | null = null;

      if (imageUri) {
        if (imageSource === 'camera' && imageUri !== originalImageUri) {
          const imagesDir = new Directory(Paths.document, 'images');
          if (!imagesDir.exists) {
            imagesDir.create();
          }
          const filename = `${Date.now()}.jpg`;
          const destFile = new File(imagesDir, filename);
          const sourceFile = new File(imageUri);
          sourceFile.copy(destFile);
          savedUri = destFile.uri;
        } else {
          savedUri = imageUri;
        }
      }

      if (isEditing && editId) {
        const oldUri = imageUri !== originalImageUri ? originalImageUri : null;
        await updateItem(editId, {
          code,
          weight,
          purchasePrice: finalCost,
          premium: '',
          imageUri: savedUri,
          metal,
        }, oldUri);
        await cleanOrphanedImages();
        clearForm();
        router.setParams({ editId: undefined });
        router.replace('/yourStack');
      } else {
        await addItem({
          code,
          weight,
          purchasePrice: finalCost,
          premium: '',
          imageUri: savedUri,
          metal,
        });
        await cleanOrphanedImages();
        setModalVisible(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalYes = () => {
    setModalVisible(false);
    setCode('');
    setWeight('');
    setPurchasePrice('');
    setTotalAmount('');
    setImageUri(null);
  };

  const handleModalNo = () => {
    setModalVisible(false);
    router.push('/yourStack');
  };

  const handleCancel = () => {
    clearForm();
    // Reset the current route to remove editId from URL, then navigate to yourStack
    router.replace('/add2stack');
    setTimeout(() => {
      router.push('/yourStack');
    }, 100);
  };

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={globalStyles.tabPageContainer}>
        <PageHeader title={isEditing ? 'Edit Item' : 'Add to Stack'} />
        <View style={styles.bannerContainer}>
          <GoldPriceBanner
            priceData={metal === 'gold' ? goldPriceData : silverPriceData}
            metal={metal}
            isLoading={isLoading}
            error={null}
            refreshPrice={metal === 'gold' ? refreshGoldPrice : refreshSilverPrice}
            settings={settings}
            showRefresh={false}
            offGridMode={metal === 'gold' ? offGridMode : silverOffGridMode}
            onManualPriceChange={metal === 'gold' ? updateManualPrice : updateManualSilverPrice}
          />
        </View>
        <KeyboardAvoidingView style={styles.keyboardView} behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            <View style={styles.imageBtnRow}>
              <TouchableOpacity style={styles.imageBtn} onPress={openCamera}>
                <View style={styles.imageBtnContent}>
                  <Ionicons name="camera" size={18} color={colors.gold} style={styles.imageBtnIcon} />
                  <Text style={styles.imageBtnText}>Camera</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageBtn} onPress={openGallery}>
                <View style={styles.imageBtnContent}>
                  <Ionicons name="images" size={18} color={colors.gold} style={styles.imageBtnIcon} />
                  <Text style={styles.imageBtnText}>Gallery</Text>
                </View>
              </TouchableOpacity>
            </View>
            {imageUri && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.preview} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImageUri(null); setImageSource('existing'); }}>
                  <Ionicons name="close-circle" size={24} color={colors.red} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.metalSelector}>
              <Text style={styles.label}>Metal Type</Text>
              <View style={styles.metalOptions}>
                <TouchableOpacity
                  style={[styles.metalOption, metal === 'gold' && styles.metalOptionActive]}
                  onPress={() => setMetal('gold')}
                >
                  <Text style={[styles.metalOptionText, metal === 'gold' && styles.metalOptionTextActive]}>Gold</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.metalOption, metal === 'silver' && styles.metalOptionActive]}
                  onPress={() => setMetal('silver')}
                >
                  <Text style={[styles.metalOptionText, metal === 'silver' && styles.metalOptionTextActive]}>Silver</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Item</Text>
                <TextInput style={styles.input} placeholder="Coin" placeholderTextColor="#666" value={code} onChangeText={setCode} />
              </View>
              <View style={styles.col}>
                <Text style={styles.labelRight}>Weight ({getUnitAbbrev(weightUnit)})</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Weight (${getUnitAbbrev(weightUnit)})`}
                  placeholderTextColor="#666"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Cost/{getUnitAbbrev(weightUnit)}</Text>
                <TextInput
                  style={[styles.input, totalAmount ? styles.disabledInput : null]}
                  placeholder={`Cost/${getUnitAbbrev(weightUnit)}`}
                  placeholderTextColor="#666"
                  value={costPerUnit}
                  onChangeText={setPurchasePrice}
                  editable={!totalAmount}
                />
              </View>
              <Text style={styles.orText}>OR</Text>
              <View style={styles.col}>
                <Text style={styles.labelRight}>Total Amount</Text>
                <TextInput style={styles.input} placeholder="Total" placeholderTextColor="#666" value={totalAmount} onChangeText={setTotalAmount} />
              </View>
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
              <Text style={styles.submitBtnText}>{submitting ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update' : 'Submit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Success!</Text>
              <Text style={styles.modalMessage}>Submit Something Else?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.yesBtn} onPress={handleModalYes}>
                  <Text style={styles.modalBtnText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noBtn} onPress={handleModalNo}>
                  <Text style={styles.modalBtnText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
  bannerContainer: {
    paddingTop: 0,
    marginBottom: 10,
  },
  cameraBtn: {
    backgroundColor: colors.themeBlue,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  metalSelector: {
    marginBottom: 16,
  },
  metalOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  metalOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: colors.themeGrey,
    alignItems: 'center',
  },
  metalOptionActive: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + '20',
  },
  metalOptionText: {
    fontSize: 16,
    color: colors.grey,
    fontWeight: '600',
  },
  metalOptionTextActive: {
    color: colors.gold,
  },
  imageBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  imageBtn: {
    flex: 1,
    backgroundColor: colors.themeBlue,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBtnIcon: {
    marginRight: 6,
  },
  imageBtnText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  orText: {
    alignSelf: 'center',
    color: colors.gold,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.themeGrey,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    color: colors.gold,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  disabledInput: {
    opacity: 0.5,
  },
  formContent: {
    paddingBottom: 40,
  },
  cameraIcon: {
    marginRight: 8,
  },
  labelRight: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold,
    marginBottom: 4,
    textAlign: 'right',
  },
  submitBtn: {
    backgroundColor: colors.green,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelBtn: {
    backgroundColor: colors.themeGrey,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  submitBtnText: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: 'bold',
  },
  cancelBtnText: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBtnText: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.themeGrey,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gold,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 18,
    color: colors.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  yesBtn: {
    backgroundColor: colors.themeBlue,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  noBtn: {
    backgroundColor: colors.themeGrey,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
  },
});
