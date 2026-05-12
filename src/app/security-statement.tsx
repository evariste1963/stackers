import { globalStyles, colors } from "@/styles/global";
import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function SecurityStatementScreen() {
  const router = useRouter();

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back to Guide</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Security Statement</Text>
        <Text style={styles.subtitle}>Stackers App</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Storage & Privacy</Text>
        <Text style={styles.text}>
          Stackers stores all your data locally on your device. No personal information, stack data, or price history is ever transmitted to external servers. Your portfolio remains completely private and under your control.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PIN Protection</Text>
        <Text style={styles.text}>
          When enabled, your 4-digit PIN is required to access the app. The PIN is never stored in plain text - it is hashed using SHA-256 with a unique cryptographic salt generated for your device. Both the hash and salt are stored in encrypted secure storage (expo-secure-store).
        </Text>
        <Text style={styles.text}>
          PIN comparison uses timing-safe algorithms to prevent timing attacks. The salt is generated using cryptographically secure random number generation.
        </Text>
        <Text style={styles.text}>
          Setting a PIN protects your stack data from casual access if your device is left unlocked.
        </Text>
        <Text style={styles.text}>
          After 5 failed PIN attempts, the app locks for 5 minutes with exponential backoff on subsequent lockouts, capped at 15 minutes.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Off Grid Mode</Text>
        <Text style={styles.text}>
          Off Grid mode is the most secure option for using Stackers. When enabled:
        </Text>
        <Text style={styles.listItem}>• No network requests are made</Text>
        <Text style={styles.listItem}>• No API key is required or used</Text>
        <Text style={styles.listItem}>• You enter gold and silver prices manually, separately</Text>
        <Text style={styles.listItem}>• All data stays entirely on your device</Text>
        <Text style={styles.text}>
          This mode is ideal for users who want complete offline operation and maximum privacy.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Key Security</Text>
        <Text style={styles.text}>
          If you use the optional live price API, your API key is stored in encrypted secure storage, not in plain SQLite. Only the app can access your key - it is never exposed in logs or error messages.
        </Text>
        <Text style={styles.text}>
          To remove your API key, you must be authenticated with your PIN (if one is set), adding an extra layer of security.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Considerations</Text>
        <Text style={styles.text}>
          While Stackers implements industry-standard security practices, be aware of the following:
        </Text>
        <Text style={styles.listItem}>• Rooted/Jailbroken devices - On compromised devices, app data could potentially be accessed with elevated privileges.</Text>
        <Text style={styles.listItem}>• SQLite storage - Stack items and price history are stored in a local SQLite database. This data is not additionally encrypted.</Text>
        <Text style={styles.listItem}>• No biometric auth - Currently only PIN authentication is available. Consider using a strong, unique PIN.</Text>
        <Text style={styles.listItem}>• Device security - Stackers cannot protect against physical access if an attacker has your unlocked device and PIN.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Best Practices</Text>
        <Text style={styles.listItem}>• Enable PIN protection if your device is shared</Text>
        <Text style={styles.listItem}>• Use Off Grid mode for maximum privacy</Text>
        <Text style={styles.listItem}>• Keep your device's operating system updated</Text>
        <Text style={styles.listItem}>• Do not share screenshots showing your stack value</Text>
        <Text style={styles.listItem}>• Use a unique PIN (not birth years, repeated digits, etc.)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>License</Text>
        <Text style={styles.text}>
          MIT License
        </Text>
        <Text style={styles.text}>
          Copyright (c) 2026 Stackers
        </Text>
        <Text style={styles.text}>
          Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
        </Text>
        <Text style={styles.text}>
          The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
        </Text>
        <Text style={styles.text}>
          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Third-Party Libraries</Text>
        <Text style={styles.text}>
          Stackers uses the following open-source libraries:
        </Text>
        <Text style={styles.listItem}>• Expo - React Native framework</Text>
        <Text style={styles.listItem}>• expo-sqlite - Local database</Text>
        <Text style={styles.listItem}>• expo-secure-store - Encrypted key-value storage</Text>
        <Text style={styles.listItem}>• expo-crypto - Cryptographic functions</Text>
        <Text style={styles.listItem}>• expo-file-system - Local file management</Text>
        <Text style={styles.listItem}>• expo-image-picker - Camera and gallery access</Text>
        <Text style={styles.listItem}>• react-native-gesture-handler - Touch handling</Text>
      </View>

      <Text style={styles.credit}>coded by this.me</Text>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backText: {
    color: colors.gold,
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gold,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grey,
    marginTop: 4,
  },
  section: {
    backgroundColor: colors.themeGrey,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 12,
    marginTop: 4,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.darkGold,
    marginTop: 12,
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 24,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 24,
    marginLeft: 12,
    marginBottom: 4,
  },
  credit: {
    fontSize: 14,
    color: colors.grey,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
});