import { useState, useMemo } from 'react';
import { Text, View, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/global';
import { useTheme } from '@/contexts/ThemeContext';
import { type MetalPriceData } from '@/services/metalPriceService';
import { ThemeColors, type MetalType } from '@/styles/themeColors';
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

function getChangeColor(change: number | undefined, c: typeof colors): string {
  if (change === undefined || change === null) return c.grey;
  if (change < 0) return c.red;
  if (change === 0) return c.orange;
  return c.changeGreen;
}

export default function GoldPriceBanner({ priceData, metal = 'gold', isLoading, error, refreshPrice, settings, showRefresh = true, offGridMode = false, onManualPriceChange }: GoldPriceBannerProps) {
  const { colors: themeColors } = useTheme();
  const metalLabel = metal === 'gold' ? 'Gold' : 'Silver';
  const [modalVisible, setModalVisible] = useState(false);
  const [manualPriceInput, setManualPriceInput] = useState(priceData?.price?.toString() || '');

  const changeColor = useMemo(() => getChangeColor(priceData?.change, themeColors), [priceData?.change, themeColors]);
  const s = useMemo(() => createStyles(themeColors), [themeColors]);

  const handleUpdatePrice = () => {
    const price = parseFloat(manualPriceInput);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', `Please enter a valid ${metalLabel.toLowerCase()} price.`);
      return;
    }
    const priceToSave = price;
    Alert.alert(
      'Confirm Price',
      `Update ${metalLabel} price to ${formatCurrency(priceToSave, settings.currency)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setModalVisible(false);
            setTimeout(() => {
              if (onManualPriceChange) {
                onManualPriceChange(priceToSave);
              }
            }, 500);
          },
        },
      ]
    );
  };

  return (
    <View style={s.container}>
      <View style={s.content}>
        <View style={s.left}>
          <Text style={s.label}>{metalLabel} Price ({settings.currency}/{settings.unit})</Text>
          <View style={s.priceRow}>
            <Text style={[s.price, { color: ThemeColors[metal].primary }]}>{formatPrice(priceData?.price, showRefresh, settings.currency)}</Text>
            {priceData?.change !== undefined && priceData?.change !== null && (
              <View style={s.changeBlockWrapper}>
                <Text style={[s.changeValue, { color: changeColor }]}>
                  {formatChange(priceData?.change)}
                </Text>
                <Text style={[s.changeValue, { color: changeColor }]}>
                  {formatChangePercent(priceData?.changePercent)}
                </Text>
              </View>
            )}
          </View>
          {priceData?.date && (
            <Text style={s.date}>Last updated: {formatDate(priceData.date)}</Text>
          )}
          {error && <Text style={s.error}>{error}</Text>}
        </View>
        {showRefresh && (
          <View style={s.right}>
            {offGridMode ? (
              <TouchableOpacity
                style={s.button}
                onPress={() => { setManualPriceInput(priceData?.price?.toString() || ''); setModalVisible(true); }}
              >
                <Text style={s.buttonText}>Update</Text>
                <Text style={s.buttonText}>Price</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.button, isLoading && s.buttonLoading, isLoading && s.buttonDisabled]}
                onPress={refreshPrice}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={themeColors.text} />
                ) : (
                  <Text style={s.buttonText}>↻ Refresh</Text>
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
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Update {metalLabel} Price</Text>
            <Text style={s.modalLabel}>Enter new {metalLabel.toLowerCase()} price ({settings.currency}/{settings.unit})</Text>
            <TextInput
              style={s.modalInput}
              value={manualPriceInput}
              onChangeText={setManualPriceInput}
              keyboardType="numeric"
              placeholder={`Enter ${metalLabel.toLowerCase()} price`}
              placeholderTextColor={themeColors.lightGrey}
            />
            <View style={s.modalButtons}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSaveBtn} onPress={handleUpdatePrice}>
                <Text style={s.modalSaveText}>Save Price</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(c: typeof colors) {
  return {
    container: {
      width: '100%',
      backgroundColor: c.themeGrey,
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
      color: c.grey,
      marginBottom: 4,
    },
    price: {
      fontSize: 26,
      fontWeight: 'bold',
      flexShrink: 1,
      flex: 0.6,
      adjustsFontSizeToFit: true,
      minimumFontScale: 0.7,
    },
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
      color: c.lightGrey,
      marginTop: 4,
    },
    error: {
      fontSize: 11,
      color: c.red,
      marginTop: 4,
    },
    button: {
      backgroundColor: c.themeBlue,
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
      color: c.gold,
      fontSize: 12,
      fontWeight: '600',
    },
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
  } as const;
}
