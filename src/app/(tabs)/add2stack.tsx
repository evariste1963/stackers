import { globalStyles, colors } from "@/styles/global";
import { Text, View, TextInput, TouchableOpacity, Image, ScrollView, Modal, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { documentDirectory, makeDirectoryAsync, moveAsync } from 'expo-file-system/legacy';
import { addItem } from '@/services/stackStorage';
import { getUserSettings } from '@/services/goldPriceStorage';
import { AVAILABLE_UNITS } from '@/config';
import GoldPriceBanner from '@/components/GoldPriceBanner';
import { useGoldPrice, UseGoldPriceResult } from '@/hooks/useGoldPrice';

export default function AddToStackScreen() {
  const { priceData, isLoading, error, refreshPrice, settings }: UseGoldPriceResult = useGoldPrice();
  const [code, setCode] = useState('');
  const [weight, setWeight] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [premium, setPremium] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [calculatorWeight, setCalculatorWeight] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [weightUnit, setWeightUnit] = useState('toz');

  const getUnitAbbrev = (code: string) => 
    AVAILABLE_UNITS.find(u => u.code === code)?.abbrev ?? code;

  const computedCostPerUnit = (() => {
    if (!calculatorWeight || !totalAmount) return '';
    const w = parseFloat(calculatorWeight);
    const t = parseFloat(totalAmount);
    if (w > 0 && !isNaN(t)) {
      return (t / w).toFixed(2);
    }
    return '';
  })();

  const costPerUnit = totalAmount ? computedCostPerUnit : purchasePrice;
  const effectiveWeight = calculatorWeight || weight;

  useFocusEffect(
    useCallback(() => {
      getUserSettings().then(settings => {
        setWeightUnit(settings.unit || 'toz');
      });
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      setCode('');
      setWeight('');
      setPurchasePrice('');
      setPremium('');
      setTotalAmount('');
      setCalculatorWeight('');
      setImageUri(null);
    }, [])
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
    }
  };

  const handleSubmit = async () => {
    if (!code || !effectiveWeight || !costPerUnit || !premium) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    const finalCost = totalAmount ? computedCostPerUnit : purchasePrice;
    setSubmitting(true);
    try {
      let savedUri: string | null = null;
      if (imageUri) {
        const filename = `${Date.now()}.jpg`;
        const dest = documentDirectory + 'images/' + filename;
        await makeDirectoryAsync(documentDirectory + 'images/', {
          intermediates: true,
        });
        await moveAsync({ from: imageUri, to: dest });
        savedUri = dest;
      }
      await addItem({
        code,
        weight: effectiveWeight,
        purchasePrice: finalCost,
        premium,
        imageUri: savedUri,
      });
      setModalVisible(true);
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
    setPremium('');
    setTotalAmount('');
    setCalculatorWeight('');
    setImageUri(null);
  };

  const handleModalNo = () => {
    setModalVisible(false);
    router.push('/yourStack');
  };

return (
    <View style={[globalStyles.container, { paddingHorizontal: 0 }]}>
      <View style={globalStyles.header}>
        <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
        <Text style={globalStyles.title}>Add to Stack</Text>
      </View>
      <View style={styles.bannerContainer}>
        <GoldPriceBanner priceData={priceData} isLoading={isLoading} error={error} refreshPrice={refreshPrice} settings={settings} />
      </View>
      <ScrollView style={[styles.form, { paddingHorizontal: 20 }]}>
        <TouchableOpacity style={styles.cameraBtn} onPress={openCamera}>
          <Text style={styles.cameraBtnText}>
            {imageUri ? 'Retake Photo' : 'Take Photo'}
          </Text>
        </TouchableOpacity>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        )}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Code</Text>
            <TextInput style={styles.input} placeholder="XUA" placeholderTextColor="#666" value={code} onChangeText={setCode} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Premium %</Text>
            <TextInput style={styles.input} placeholder="23" placeholderTextColor="#666" keyboardType="numeric" value={premium} onChangeText={setPremium} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Weight ({getUnitAbbrev(weightUnit)})</Text>
            <TextInput 
              style={[styles.input, calculatorWeight ? styles.disabledInput : null]} 
              placeholder={`Weight (${getUnitAbbrev(weightUnit)})`} 
              placeholderTextColor="#666" 
              value={effectiveWeight} 
              onChangeText={setWeight}
              editable={!calculatorWeight}
            />
          </View>
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
        </View>
        <Text style={styles.calcTitle}>OR</Text>
        <View style={styles.row}>
          <View style={[styles.col, { width: '48%' }]}>
            <Text style={styles.label}>Weight ({getUnitAbbrev(weightUnit)})</Text>
            <TextInput 
              style={styles.input} 
              placeholder={`Weight (${getUnitAbbrev(weightUnit)})`} 
              placeholderTextColor="#666" 
              value={calculatorWeight} 
              onChangeText={setCalculatorWeight}
            />
          </View>
          <View style={[styles.col, { width: '48%' }]}>
            <Text style={styles.label}>Total Amount Paid</Text>
            <TextInput style={styles.input} placeholder="Total" placeholderTextColor="#666" value={totalAmount} onChangeText={setTotalAmount} />
          </View>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            <Text style={styles.submitBtnText}>{submitting ? 'Saving...' : 'Submit'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.push('/')}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
                <Text style={styles.yesBtnText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.noBtn} onPress={handleModalNo}>
                <Text style={styles.noBtnText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: 16,
  },
  bannerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  cameraBtn: {
    backgroundColor: colors.themeBlue,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraBtnText: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: 'bold',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  submitBtn: {
    backgroundColor: colors.green,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  cancelBtn: {
    backgroundColor: colors.themeGrey,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  calcTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gold,
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
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
  yesBtnText: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: 'bold',
  },
  noBtn: {
    backgroundColor: colors.themeGrey,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  noBtnText: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
