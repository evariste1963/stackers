import { useState, useMemo } from 'react';
import { Text, View, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/global';
import { type MetalPriceData, type MetalType } from '@/services/metalPriceService';
import { type UserSettings } from '@/services/settingsService';
import { formatCurrency, formatDate } from '@/utils/formatters';

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
};

function formatPrice(price: number | undefined, showRefresh: boolean, currency: string): string {
  if (!price) return showRefresh ? 'Tap refresh to fetch' : 'No price data';
  return formatCurrency(price, currency);
}

function formatChange(change: number | undefined): string {
  if (change === undefined || change === null) return '';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
}

function formatChangePercent(changePercent: number | undefined): string {
  if (changePercent === undefined || changePercent === null) return '';
  const symbol = changePercent > 0 ? '+' : '';
  return `(${symbol}${changePercent.toFixed(2)}%)`;
}

function getChangeColor(change: number | undefined): string {
  if (change === undefined || change === null) return colors.grey;
  if (change < 0) return colors.red;
  if (change === 0) return colors.orange;
  return colors.changeGreen;
}

export default function GoldPriceBanner({ priceData, metal = 'gold', isLoading, error, refreshPrice, settings, showRefresh = true, offGridMode = false, onManualPriceChange }: GoldPriceBannerProps) {
  const metalLabel = metal === 'gold' ? 'Gold' : 'Silver';
  const [modalVisible, setModalVisible] = useState(false);
  const [manualPriceInput, setManualPriceInput] = useState(priceData?.price?.toString() || '');

  const changeColor = useMemo(() => getChangeColor(priceData?.change), [priceData?.change]);

  const handleUpdatePrice = () => {
    const price = parseFloat(manualPriceInput);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', `Please enter a valid ${metalLabel.toLowerCase()} price.`);
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.label}>{metalLabel} Price ({settings.currency}/{settings.unit})</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(priceData?.price, showRefresh, settings.currency)}</Text>
            {priceData?.change !== undefined && priceData?.change !== null && (
              <View style={styles.changeBlockWrapper}>
                <Text style={[styles.changeValue, { color: changeColor }]}>
                  {formatChange(priceData?.change)}
                </Text>
                <Text style={[styles.changeValue, { color: changeColor }]}>
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
              <TouchableOpacity
                style={styles.button}
                onPress={() => { setManualPriceInput(priceData?.price?.toString() || ''); setModalVisible(true); }}
              >
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
                  <ActivityIndicator size="small" color={colors.white} />
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
            <Text style={styles.modalLabel}>Enter new {metalLabel.toLowerCase()} price ({settings.currency}/{settings.unit})</Text>
            <TextInput
              style={styles.modalInput}
              value={manualPriceInput}
              onChangeText={setManualPriceInput}
              keyboardType="numeric"
              placeholder={`Enter ${metalLabel.toLowerCase()} price`}
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
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
  },
  content: {
    flexDirection: 'row',
    marginLeft: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 4,
  } as const,
  price: {
    fontSize: 26,
    color: colors.gold,
    fontWeight: 'bold',
    flexShrink: 1,
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.7,
    numberOfLines: 1,
  } as const,
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  changeBlockWrapper: {
    flex: 0.4,
    alignItems: 'flex-start',
  },
  changeValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    fontSize: 11,
    color: colors.lightGrey,
    marginTop: 4,
  },
  error: {
    fontSize: 11,
    color: colors.red,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.themeBlue,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonLoading: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '600',
  } as const,
  right: {
    flex: 0,
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
  } as const,
} as const;
