import { globalStyles, colors } from "@/styles/global";
import { Text, View, ScrollView, TouchableOpacity, StyleSheet, Linking, Modal, TextInput, Alert } from 'react-native';
import { Link } from 'expo-router';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { usePrice } from '@/contexts/PriceContext';
import { useRouter } from 'expo-router';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useState } from 'react';
import { getTodayPriceEntry } from '@/services/historyService';
import { formatCurrency } from '@/utils/formatters';

const PRIVACY_POLICY_URL = 'https://evariste1963.github.io/stackers/PRIVACY_POLICY';

export default function AccountScreen() {
  const { hasPinSet, lock } = useAuth();
  const { offGridMode, silverOffGridMode, overwriteTodayPriceEntry, settings } = usePrice();
  const router = useRouter();
  const { swipeGesture } = useSwipeNavigation('account');

  function handleLogOut() {
    lock();
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMetal, setSelectedMetal] = useState<'gold' | 'silver'>('gold');
  const [inputValue, setInputValue] = useState('');
  const [lastPrice, setLastPrice] = useState<number | null>(null);

  async function handleOpenModal(metal: 'gold' | 'silver') {
    setSelectedMetal(metal);
    const entry = await getTodayPriceEntry(metal);
    setLastPrice(entry?.price ?? null);
    setInputValue('');
    setModalVisible(true);
  }

  function handleConfirm() {
    const price = parseFloat(inputValue);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }
    Alert.alert(
      'Confirm Price',
      `Overwrite today's ${metalLabel.toLowerCase()} price to ${formatCurrency(price, settings.currency)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setModalVisible(false);
            setTimeout(() => overwriteTodayPriceEntry(selectedMetal, price), 500);
          },
        },
      ]
    );
  }

  const metalLabel = selectedMetal === 'gold' ? 'Gold' : 'Silver';

  return (
    <GestureDetector gesture={swipeGesture}>
      <ScrollView style={globalStyles.tabPageContainer}>
        <PageHeader title="Account" />
        <View style={styles.section}>
          <Link href="/guide" asChild>
            <TouchableOpacity style={globalStyles.button}>
              <Text style={globalStyles.buttonText}>Guide</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          >
            <Text style={globalStyles.buttonText}>Privacy Policy</Text>
          </TouchableOpacity>

          <Link href="/settings" asChild>
            <TouchableOpacity style={globalStyles.button}>
              <Text style={globalStyles.buttonText}>Settings</Text>
            </TouchableOpacity>
          </Link>

          {!hasPinSet && (
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => router.push('/pin-management?mode=set')}
            >
              <Text style={globalStyles.buttonText}>Set PIN</Text>
            </TouchableOpacity>
          )}

          {hasPinSet && (
            <>
              <TouchableOpacity
                style={globalStyles.button}
                onPress={() => router.push('/pin-management?mode=change')}
              >
                <Text style={globalStyles.buttonText}>Change PIN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={globalStyles.button}
                onPress={() => router.push('/pin-management?mode=remove')}
              >
                <Text style={globalStyles.buttonText}>Remove PIN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[globalStyles.button, styles.dangerButton]}
                onPress={handleLogOut}
              >
                <Text style={[globalStyles.buttonText, styles.dangerButtonText]}>Log Out</Text>
              </TouchableOpacity>
            </>
          )}

          {(offGridMode || silverOffGridMode) && (
            <View style={styles.priceRow}>
              {offGridMode && (
                <TouchableOpacity
                  style={[globalStyles.button, styles.halfButton, styles.centerButton]}
                  onPress={() => handleOpenModal('gold')}
                >
                  <Text style={[globalStyles.buttonText, { color: colors.gold }, styles.centerText]}>Overwrite Today Gold</Text>
                </TouchableOpacity>
              )}
              {silverOffGridMode && (
                <TouchableOpacity
                  style={[globalStyles.button, styles.halfButton, styles.centerButton]}
                  onPress={() => handleOpenModal('silver')}
                >
                  <Text style={[globalStyles.buttonText, { color: colors.silver }, styles.centerText]}>Overwrite Today Silver</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <Modal
          visible={modalVisible}
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Overwrite Today's {metalLabel} Price</Text>
              {lastPrice !== null && (
                <Text style={styles.modalLabel}>
                    Current today's price: {formatCurrency(lastPrice, settings.currency)}
                </Text>
              )}
              <Text style={styles.modalLabel}>
                Enter new {metalLabel.toLowerCase()} price ({settings.currency}/{settings.unit})
              </Text>
              <TextInput
                style={styles.modalInput}
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="numeric"
                placeholder={`Enter ${metalLabel.toLowerCase()} price`}
                placeholderTextColor="#666"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={globalStyles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleConfirm}>
                  <Text style={styles.modalSaveText}>Overwrite</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  centerButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  dangerButton: {
    marginTop: 20,
    borderColor: colors.red,
    borderWidth: 1,
  },
  dangerButtonText: {
    color: colors.red,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: colors.themeGrey,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.borderMid,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderMid,
    alignItems: 'center',
  },
  modalSaveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: 'center',
  },
  modalSaveText: {
    color: colors.borderDark,
    fontSize: 16,
    fontWeight: '600',
  },
});
