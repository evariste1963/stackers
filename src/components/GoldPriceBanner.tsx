import { Text, View, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/global';
import { type MetalPriceData } from '@/services/metalPriceService';
import { type UserSettings } from '@/services/settingsService';
import { getCurrencySymbol, formatDate } from '@/utils/formatters';
import { useState } from 'react';

type MetalType = 'gold' | 'silver';

type GoldPriceBannerProps = {
  priceData: MetalPriceData | null;
  metal?: MetalType;
  isLoading: boolean;
  error: string | null;
  refreshPrice: () => Promise<void>;
  settings: UserSettings;
  showRefresh?: boolean;
  offGridMode?: boolean;
  onManualPriceChange?: (price: number) => Promise<void>;
  onPriceUpdateStart?: () => void;
};

export default function GoldPriceBanner({ priceData, metal = 'gold', isLoading, error, refreshPrice, settings, showRefresh = true, offGridMode = false, onManualPriceChange, onPriceUpdateStart }: GoldPriceBannerProps) {
  const metalLabel = metal === 'gold' ? 'Gold' : 'Silver';
  const [modalVisible, setModalVisible] = useState(false);
  const [manualPriceInput, setManualPriceInput] = useState(priceData?.price?.toString() || '');

  const formatPrice = (price: number | undefined) => {
    if (!price) return showRefresh ? 'Tap refresh to fetch' : 'No price data';
    const symbol = getCurrencySymbol(settings.currency);
    return `${symbol}${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatChange = (change: number | undefined) => {
    if (change === undefined || change === null) return '';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (changePercent: number | undefined) => {
    if (changePercent === undefined || changePercent === null) return '';
    const symbol = changePercent > 0 ? '+' : '';
    return `(${symbol}${changePercent.toFixed(2)}%)`;
  };

  const getChangeColor = (change: number | undefined) => {
    if (change === undefined || change === null) return colors.grey;
    if (change < 0) return colors.red;
    if (change === 0) return colors.orange;
    return colors.changeGreen;
  };

const changeColor = getChangeColor(priceData?.change);

  const handleManualPriceChange = (text: string) => {
    setManualPriceInput(text);
  };

  const handleUpdatePrice = () => {
    const price = parseFloat(manualPriceInput);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid gold price.');
      return;
    }
    const priceToSave = price;
    setModalVisible(false);
    setTimeout(() => {
      if (onManualPriceChange) {
        onManualPriceChange(priceToSave);
      }
    }, 500);
  };

  const openModal = () => {
    setManualPriceInput(priceData?.price?.toString() || '');
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.label}>{metalLabel} Price ({settings.currency}/{settings.unit})</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { flex: 0.6 }]}>{formatPrice(priceData?.price)}</Text>
            {priceData?.change !== undefined && priceData?.change !== null && (
              <View style={styles.changeBlockWrapper}>
                <Text style={[styles.changeValue, { color: changeColor }]}>
                  {formatChange(priceData?.change)}
                </Text>
                <Text style={[styles.changePercent, { color: changeColor }]}>
                  {formatChangePercent(priceData?.changePercent)}
                </Text>
              </View>
            )}
          </View>
          {priceData?.date && (
            <Text style={styles.date}>Last updated: {formatDate(priceData.date)}</Text>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
        {showRefresh && (
          <View style={styles.right}>
            {offGridMode ? (
              <TouchableOpacity style={styles.button} onPress={openModal}>
                <Text style={styles.buttonText}>Update</Text>
                <Text style={styles.buttonText}>Price</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonLoading, isLoading && styles.buttonDisabled]}
                onPress={refreshPrice}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="large" color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>↻ Refresh</Text>
                )}
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
            <Text style={styles.modalTitle}>Update {metalLabel} Price</Text>
            <Text style={styles.modalLabel}>Enter new gold price ({settings.currency}/{settings.unit})</Text>
            <TextInput
              style={styles.modalInput}
              value={manualPriceInput}
              onChangeText={handleManualPriceChange}
              keyboardType="numeric"
              placeholder="Enter gold price"
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleUpdatePrice}>
                <Text style={styles.modalSaveText}>Save Price</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = {
  container: {
    width: '100%',
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  } as const,
  content: {
    flexDirection: 'row',
    marginLeft: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  } as const,
  left: {
    flex: 1,
  } as const,
  label: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 4,
  } as const,
  price: {
    fontSize: 28,
    color: colors.gold,
    fontWeight: 'bold',
  } as const,
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  } as const,
  changeBlockWrapper: {
    flex: 0.4,
    alignItems: 'flex-start',
  } as const,
  changeValue: {
    fontSize: 14,
    fontWeight: '500',
  } as const,
  changePercent: {
    fontSize: 14,
    fontWeight: '500',
  } as const,
  date: {
    fontSize: 11,
    color: colors.lightGrey,
    marginTop: 4,
  } as const,
  error: {
    fontSize: 11,
    color: colors.red,
    marginTop: 4,
  } as const,
  button: {
    backgroundColor: colors.themeBlue,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  } as const,
  buttonLoading: {
    backgroundColor: 'transparent',
  } as const,
  buttonDisabled: {
    opacity: 0.7,
  } as const,
  buttonText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '600' as const,
  } as const,
  right: {
    flex: 0,
  } as const,
  manualInput: {
    backgroundColor: colors.themeBlue,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.gold,
    fontWeight: '600' as const,
    minWidth: 100,
    textAlign: 'center' as const,
  } as const,
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  } as const,
  modalContent: {
    backgroundColor: colors.themeGrey,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 340,
  } as const,
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 16,
    textAlign: 'center',
  } as const,
  modalLabel: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 8,
  } as const,
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    color: colors.white,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 20,
  } as const,
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  } as const,
  modalCancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  } as const,
  modalCancelText: {
    color: colors.grey,
    fontSize: 16,
    fontWeight: '600',
  } as const,
  modalSaveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: 'center',
  } as const,
  modalSaveText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  } as const,
};