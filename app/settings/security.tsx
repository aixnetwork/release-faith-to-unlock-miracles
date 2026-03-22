import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import * as Haptics from 'expo-haptics';
import { Lock } from 'lucide-react-native';

export default function SecuritySettingsScreen() {
  const { isLoggedIn } = useUserStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Validate passwords
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your current password.");
      return;
    }
    
    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters long.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert("Success", "Your password has been updated successfully.");
    }, 1000);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Security" }} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={Colors.light.inputPlaceholder}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={Colors.light.inputPlaceholder}
                secureTextEntry
              />
              <Text style={styles.passwordHint}>Password must be at least 8 characters long</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={Colors.light.inputPlaceholder}
                secureTextEntry
              />
            </View>

            <Button
              title="Update Password"
              onPress={handleChangePassword}
              loading={isLoading}
              icon={<Lock size={18} color={Colors.light.white} />}
              style={styles.updateButton}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
          
          <View style={styles.twoFactorCard}>
            <Text style={styles.twoFactorText}>
              Enhance your account security by enabling two-factor authentication.
            </Text>
            <Button
              title="Enable 2FA"
              onPress={() => Alert.alert("Two-Factor Authentication", "This feature will be available in a future update.")}
              variant="outline"
              style={styles.twoFactorButton}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Login Sessions</Text>
          
          <View style={styles.sessionsCard}>
            <Text style={styles.sessionText}>
              You are currently logged in on this device.
            </Text>
            <Button
              title="Logout from All Devices"
              onPress={() => Alert.alert(
                "Logout from All Devices",
                "Are you sure you want to log out from all devices?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Logout All", onPress: () => Alert.alert("Success", "You have been logged out from all devices.") }
                ]
              )}
              variant="outline"
              style={styles.logoutAllButton}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  formContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    ...theme.typography.inputLabel,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.inputText,
  },
  passwordHint: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginTop: 4,
  },
  updateButton: {
    marginTop: theme.spacing.md,
  },
  twoFactorCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  twoFactorText: {
    ...theme.typography.body,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  twoFactorButton: {
    alignSelf: 'flex-start',
  },
  sessionsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  sessionText: {
    ...theme.typography.body,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  logoutAllButton: {
    alignSelf: 'flex-start',
  },
});