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

export default function AddToStackScreen() {
  const [code, setCode] = useState('');
  const [weight, setWeight] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [premium, setPremium] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [weightUnit, setWeightUnit] = useState('toz');

  const getUnitAbbrev = (code: string) => 
    AVAILABLE_UNITS.find(u => u.code === code)?.abbrev ?? code;

  useFocusEffect(
    useCallback(() => {
      getUserSettings().then(settings => {
        setWeightUnit(settings.unit || 'toz');
      });
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
    if (!code || !weight || !purchasePrice || !premium) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
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
        weight,
        purchasePrice,
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
    setImageUri(null);
  };

  const handleModalNo = () => {
    setModalVisible(false);
    router.push('/yourStack');
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
        <Text style={globalStyles.title}>Add to Stack</Text>
      </View>
      <View style={styles.form}>
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
            <Text style={styles.label}>Weight ({getUnitAbbrev(weightUnit)})</Text>
            <TextInput style={styles.input} placeholder={`Weight (${getUnitAbbrev(weightUnit)})`} placeholderTextColor="#666" value={weight} onChangeText={setWeight} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Cost/{getUnitAbbrev(weightUnit)}</Text>
            <TextInput style={styles.input} placeholder={`Cost/${getUnitAbbrev(weightUnit)}`} placeholderTextColor="#666" value={purchasePrice} onChangeText={setPurchasePrice} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Premium %</Text>
            <TextInput style={styles.input} placeholder="23" placeholderTextColor="#666" keyboardType="numeric" value={premium} onChangeText={setPremium} />
          </View>
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitBtnText}>{submitting ? 'Saving...' : 'Submit'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.push('/')}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: 16,
    marginTop: 32,
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
  submitBtn: {
    backgroundColor: colors.green,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: colors.themeGrey,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
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
