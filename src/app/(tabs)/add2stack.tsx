import { globalStyles, colors } from "@/styles/global";
import { Text, View, TextInput, TouchableOpacity, Image, ScrollView, Modal, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

export default function AddToStackScreen() {
  const [code, setCode] = useState('');
  const [weight, setWeight] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [premium, setPremium] = useState('');
  const [spare1, setSpare1] = useState('');
  const [spare2, setSpare2] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSubmit = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Image source={require('../../../assets/images/stackers-logo.png')} style={globalStyles.logo} />
        <Text style={globalStyles.title}>Add to Stack</Text>
      </View>
      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Code</Text>
            <TextInput style={styles.input} placeholder="XUA" placeholderTextColor="#666" value={code} onChangeText={setCode} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Weight</Text>
            <TextInput style={styles.input} placeholder="Weight" placeholderTextColor="#666" value={weight} onChangeText={setWeight} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Purchase Price</Text>
            <TextInput style={styles.input} placeholder="Purchase Price" placeholderTextColor="#666" value={purchasePrice} onChangeText={setPurchasePrice} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Premium %</Text>
            <TextInput style={styles.input} placeholder="23" placeholderTextColor="#666" keyboardType="numeric" value={premium} onChangeText={setPremium} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Spare1</Text>
            <TextInput style={styles.input} placeholder="Spare1" placeholderTextColor="#666" value={spare1} onChangeText={setSpare1} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Spare2</Text>
            <TextInput style={styles.input} placeholder="23" placeholderTextColor="#666" keyboardType="numeric" value={spare2} onChangeText={setSpare2} />
          </View>
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
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
              <TouchableOpacity
                style={styles.yesBtn}
                onPress={() => {
                  setModalVisible(false);
                  setCode('');
                  setWeight('');
                  setPurchasePrice('');
                  setPremium('');
                  setSpare1('');
                  setSpare2('');
                }}
              >
                <Text style={styles.yesBtnText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.noBtn}
                onPress={() => {
                  setModalVisible(false);
                  router.push('/yourStack');
                }}
              >
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
