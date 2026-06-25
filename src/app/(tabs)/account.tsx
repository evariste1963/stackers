import { globalStyles, colors } from "@/styles/global";
import { Text, View, ScrollView, TouchableOpacity, StyleSheet, Linking, Modal, TextInput, Alert } from 'react-native';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { usePrice } from '@/contexts/PriceContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useState, useMemo } from 'react';
import { getTodayPriceEntry } from '@/services/historyService';
import { formatCurrency } from '@/utils/formatters';

const PRIVACY_POLICY_URL = 'https://evariste1963.github.io/stackers/PRIVACY_POLICY';

export default function AccountScreen() {
  const { hasPinSet, lock } = useAuth();
  const { offGridMode, silverOffGridMode, overwriteTodayPriceEntry, settings } = usePrice();
  const { colors: themeColors } = useTheme();
  const router = useRouter();
  const { swipeGesture } = useSwipeNavigation('account');
  const s = useMemo(() => createStyles(themeColors), [themeColors]);

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
      <ScrollView style={[globalStyles.tabPageContainer, { backgroundColor: themeColors.background }]}>
        <PageHeader title="Account" />
        <View style={s.section}>
          <TouchableOpacity
            style={[globalStyles.button, { backgroundColor: themeColors.themeGrey }]}
            onPress={() => router.push('/guide')}
          >
            <Text style={globalStyles.buttonText}>Guide</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.button, { backgroundColor: themeColors.themeGrey }]}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          >
            <Text style={globalStyles.buttonText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.button, { backgroundColor: themeColors.themeGrey }]}
            onPress={() => router.push('/settings')}
          >
            <Text style={globalStyles.buttonText}>Settings</Text>
          </TouchableOpacity>

          {!hasPinSet && (
            <TouchableOpacity
              style={[globalStyles.button, { backgroundColor: themeColors.themeGrey }]}
              onPress={() => router.push('/pin-management?mode=set')}
            >
              <Text style={globalStyles.buttonText}>Set PIN</Text>
            </TouchableOpacity>
          )}

          {hasPinSet && (
            <>
              <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: themeColors.themeGrey }]}
                onPress={() => router.push('/pin-management?mode=change')}
              >
                <Text style={globalStyles.buttonText}>Change PIN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: themeColors.themeGrey }]}
                onPress={() => router.push('/pin-management?mode=remove')}
              >
                <Text style={globalStyles.buttonText}>Remove PIN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: themeColors.themeGrey }, s.dangerButton]}
                onPress={handleLogOut}
              >
                <Text style={[globalStyles.buttonText, s.dangerButtonText]}>Log Out</Text>
              </TouchableOpacity>
            </>
          )}

          {(offGridMode || silverOffGridMode) && (
            <View style={s.overwriteContainer}>
              <Text style={s.overwriteLabel}>Correct price entry errors</Text>
              <View style={s.priceRow}>
                {offGridMode && (
                  <TouchableOpacity
                    style={[globalStyles.button, { backgroundColor: themeColors.themeGrey }, s.compactButton, s.centerButton, s.goldBorder]}
                    onPress={() => handleOpenModal('gold')}
                  >
                    <Text style={[globalStyles.buttonText, { color: themeColors.gold, fontSize: 13 }, s.centerText]}>Overwrite Today Gold</Text>
                  </TouchableOpacity>
                )}
                {silverOffGridMode && (
                  <TouchableOpacity
                    style={[globalStyles.button, { backgroundColor: themeColors.themeGrey }, s.compactButton, s.centerButton, s.silverBorder]}
                    onPress={() => handleOpenModal('silver')}
                  >
                    <Text style={[globalStyles.buttonText, { color: themeColors.silver, fontSize: 13 }, s.centerText]}>Overwrite Today Silver</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        <Modal
          visible={modalVisible}
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <Text style={s.modalTitle}>Overwrite Today's {metalLabel} Price</Text>
              {lastPrice !== null && (
                <Text style={s.modalLabel}>
                    Current today's price: {formatCurrency(lastPrice, settings.currency)}
                </Text>
              )}
              <Text style={s.modalLabel}>
                Enter new {metalLabel.toLowerCase()} price ({settings.currency}/{settings.unit})
              </Text>
              <TextInput
                style={s.modalInput}
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="numeric"
                placeholder={`Enter ${metalLabel.toLowerCase()} price`}
                placeholderTextColor={themeColors.lightGrey}
              />
              <View style={s.modalButtons}>
                <TouchableOpacity style={s.modalCancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={globalStyles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.modalSaveBtn} onPress={handleConfirm}>
                  <Text style={s.modalSaveText}>Overwrite</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </GestureDetector>
  );
}

function createStyles(c: typeof colors) {
  return StyleSheet.create({
    section: {
      padding: 16,
    },
    overwriteContainer: {
      borderColor: c.red,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginTop: 20,
    },
    overwriteLabel: {
      fontSize: 13,
      color: c.red,
      marginBottom: 8,
      textAlign: 'center',
    },
    priceRow: {
      flexDirection: 'row',
      gap: 10,
    },
    compactButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      marginBottom: 0,
    },
    centerButton: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    centerText: {
      textAlign: 'center',
    },
    goldBorder: {
      borderColor: c.gold,
      borderWidth: 1,
    },
    silverBorder: {
      borderColor: c.silver,
      borderWidth: 1,
    },
    dangerButton: {
      marginTop: 20,
      borderColor: c.red,
      borderWidth: 1,
    },
    dangerButtonText: {
      color: c.red,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
      backgroundColor: c.themeGrey,
      borderRadius: 16,
      padding: 24,
      width: '85%',
      maxWidth: 340,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: c.gold,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalLabel: {
      fontSize: 14,
      color: c.grey,
      marginBottom: 8,
    },
    modalInput: {
      backgroundColor: c.background,
      borderRadius: 8,
      padding: 14,
      fontSize: 18,
      color: c.text,
      borderWidth: 1,
      borderColor: c.borderMid,
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
      borderColor: c.borderMid,
      alignItems: 'center',
    },
    modalSaveBtn: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      backgroundColor: c.gold,
      alignItems: 'center',
    },
    modalSaveText: {
      color: c.borderDark,
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
