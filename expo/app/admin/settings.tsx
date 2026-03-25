import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useAdminStore } from '@/store/adminStore';
import * as Haptics from 'expo-haptics';
import { Save, Database, Server, Shield, Globe, RefreshCw } from 'lucide-react-native';

export default function AdminSettingsScreen() {
  const { isAdmin, isSuperAdmin, adminSettings, updateAdminSettings } = useAdminStore();
  
  // System settings
  const [maintenanceMode, setMaintenanceMode] = useState(adminSettings?.maintenanceMode ?? false);
  const [debugMode, setDebugMode] = useState(adminSettings?.debugMode ?? false);
  const [apiRateLimit, setApiRateLimit] = useState(adminSettings?.apiRateLimit?.toString() ?? '100');
  const [maxUploadSize, setMaxUploadSize] = useState(adminSettings?.maxUploadSize?.toString() ?? '10');
  
  // Content settings
  const [autoApproveContent, setAutoApproveContent] = useState(adminSettings?.autoApproveContent ?? false);
  const [contentModeration, setContentModeration] = useState(adminSettings?.contentModeration ?? true);
  
  // Security settings
  const [enforceStrongPasswords, setEnforceStrongPasswords] = useState(adminSettings?.enforceStrongPasswords ?? true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(adminSettings?.twoFactorRequired ?? false);
  const [sessionTimeout, setSessionTimeout] = useState(adminSettings?.sessionTimeout?.toString() ?? '30');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsLoading(true);
    
    // Validate numeric inputs
    const apiRateLimitNum = parseInt(apiRateLimit, 10);
    const maxUploadSizeNum = parseInt(maxUploadSize, 10);
    const sessionTimeoutNum = parseInt(sessionTimeout, 10);
    
    if (isNaN(apiRateLimitNum) || isNaN(maxUploadSizeNum) || isNaN(sessionTimeoutNum)) {
      Alert.alert("Error", "Please enter valid numbers for numeric fields.");
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      updateAdminSettings({
        maintenanceMode,
        debugMode,
        apiRateLimit: apiRateLimitNum,
        maxUploadSize: maxUploadSizeNum,
        autoApproveContent,
        contentModeration,
        enforceStrongPasswords,
        twoFactorRequired,
        sessionTimeout: sessionTimeoutNum
      });
      
      setIsLoading(false);
      Alert.alert("Success", "System settings have been updated successfully.");
    }, 1000);
  };

  const handleClearCache = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      "Clear System Cache",
      "Are you sure you want to clear the system cache? This may temporarily affect performance.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear Cache", 
          onPress: () => {
            // Simulate cache clearing
            setTimeout(() => {
              Alert.alert("Success", "System cache has been cleared successfully.");
            }, 1000);
          }
        }
      ]
    );
  };

  // If not admin, this screen shouldn't be accessible
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.unauthorizedText}>You do not have permission to access this page.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "System Settings",
          headerTintColor: isSuperAdmin() ? "#e74c3c" : Colors.light.org1
        }} 
      />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isSuperAdmin() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Configuration</Text>
            
            <View style={styles.settingsCard}>
              <View style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Text style={styles.settingsItemText}>Maintenance Mode</Text>
                  <Text style={styles.settingsItemDescription}>
                    Put the application in maintenance mode
                  </Text>
                </View>
                <Switch
                  value={maintenanceMode}
                  onValueChange={setMaintenanceMode}
                  trackColor={{ false: Colors.light.border, true: "#e74c3c80" }}
                  thumbColor={maintenanceMode ? "#e74c3c" : '#f4f3f4'}
                  ios_backgroundColor={Colors.light.border}
                />
              </View>
              
              <View style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Text style={styles.settingsItemText}>Debug Mode</Text>
                  <Text style={styles.settingsItemDescription}>
                    Enable detailed error logging
                  </Text>
                </View>
                <Switch
                  value={debugMode}
                  onValueChange={setDebugMode}
                  trackColor={{ false: Colors.light.border, true: "#e74c3c80" }}
                  thumbColor={debugMode ? "#e74c3c" : '#f4f3f4'}
                  ios_backgroundColor={Colors.light.border}
                />
              </View>
              
              <View style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Text style={styles.settingsItemText}>API Rate Limit</Text>
                  <Text style={styles.settingsItemDescription}>
                    Maximum requests per minute
                  </Text>
                </View>
                <TextInput
                  style={styles.numericInput}
                  value={apiRateLimit}
                  onChangeText={setApiRateLimit}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              
              <View style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Text style={styles.settingsItemText}>Max Upload Size (MB)</Text>
                  <Text style={styles.settingsItemDescription}>
                    Maximum file upload size
                  </Text>
                </View>
                <TextInput
                  style={styles.numericInput}
                  value={maxUploadSize}
                  onChangeText={setMaxUploadSize}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Management</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Text style={styles.settingsItemText}>Auto-Approve Content</Text>
                <Text style={styles.settingsItemDescription}>
                  Automatically approve user-submitted content
                </Text>
              </View>
              <Switch
                value={autoApproveContent}
                onValueChange={setAutoApproveContent}
                trackColor={{ 
                  false: Colors.light.border, 
                  true: isSuperAdmin() ? "#e74c3c80" : Colors.light.org1 + '80'
                }}
                thumbColor={autoApproveContent ? 
                  (isSuperAdmin() ? "#e74c3c" : Colors.light.org1) : 
                  '#f4f3f4'
                }
                ios_backgroundColor={Colors.light.border}
              />
            </View>
            
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Text style={styles.settingsItemText}>Content Moderation</Text>
                <Text style={styles.settingsItemDescription}>
                  Enable AI-powered content moderation
                </Text>
              </View>
              <Switch
                value={contentModeration}
                onValueChange={setContentModeration}
                trackColor={{ 
                  false: Colors.light.border, 
                  true: isSuperAdmin() ? "#e74c3c80" : Colors.light.org1 + '80'
                }}
                thumbColor={contentModeration ? 
                  (isSuperAdmin() ? "#e74c3c" : Colors.light.org1) : 
                  '#f4f3f4'
                }
                ios_backgroundColor={Colors.light.border}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Text style={styles.settingsItemText}>Enforce Strong Passwords</Text>
                <Text style={styles.settingsItemDescription}>
                  Require complex passwords for all users
                </Text>
              </View>
              <Switch
                value={enforceStrongPasswords}
                onValueChange={setEnforceStrongPasswords}
                trackColor={{ 
                  false: Colors.light.border, 
                  true: isSuperAdmin() ? "#e74c3c80" : Colors.light.org1 + '80'
                }}
                thumbColor={enforceStrongPasswords ? 
                  (isSuperAdmin() ? "#e74c3c" : Colors.light.org1) : 
                  '#f4f3f4'
                }
                ios_backgroundColor={Colors.light.border}
              />
            </View>
            
            {isSuperAdmin() && (
              <View style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Text style={styles.settingsItemText}>Require Two-Factor Auth</Text>
                  <Text style={styles.settingsItemDescription}>
                    Require 2FA for all admin accounts
                  </Text>
                </View>
                <Switch
                  value={twoFactorRequired}
                  onValueChange={setTwoFactorRequired}
                  trackColor={{ false: Colors.light.border, true: "#e74c3c80" }}
                  thumbColor={twoFactorRequired ? "#e74c3c" : '#f4f3f4'}
                  ios_backgroundColor={Colors.light.border}
                />
              </View>
            )}
            
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <Text style={styles.settingsItemText}>Session Timeout (minutes)</Text>
                <Text style={styles.settingsItemDescription}>
                  Automatically log out inactive users
                </Text>
              </View>
              <TextInput
                style={styles.numericInput}
                value={sessionTimeout}
                onChangeText={setSessionTimeout}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>
        </View>

        {isSuperAdmin() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Maintenance</Text>
            
            <View style={styles.maintenanceCard}>
              <View style={styles.maintenanceItem}>
                <View style={styles.maintenanceIconContainer}>
                  <Database size={24} color="#e74c3c" />
                </View>
                <View style={styles.maintenanceContent}>
                  <Text style={styles.maintenanceTitle}>Database Optimization</Text>
                  <Text style={styles.maintenanceDescription}>
                    Optimize database performance and clean up unused records
                  </Text>
                  <TouchableOpacity 
                    style={styles.maintenanceButton}
                    onPress={() => Alert.alert("Database Optimization", "This feature will be available in a future update.")}
                  >
                    <Text style={styles.maintenanceButtonText}>Optimize</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.maintenanceItem}>
                <View style={styles.maintenanceIconContainer}>
                  <Server size={24} color="#e74c3c" />
                </View>
                <View style={styles.maintenanceContent}>
                  <Text style={styles.maintenanceTitle}>System Cache</Text>
                  <Text style={styles.maintenanceDescription}>
                    Clear system cache to free up memory and resolve potential issues
                  </Text>
                  <TouchableOpacity 
                    style={styles.maintenanceButton}
                    onPress={handleClearCache}
                  >
                    <Text style={styles.maintenanceButtonText}>Clear Cache</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.maintenanceItem}>
                <View style={styles.maintenanceIconContainer}>
                  <RefreshCw size={24} color="#e74c3c" />
                </View>
                <View style={styles.maintenanceContent}>
                  <Text style={styles.maintenanceTitle}>System Backup</Text>
                  <Text style={styles.maintenanceDescription}>
                    Create a backup of all system data and configurations
                  </Text>
                  <TouchableOpacity 
                    style={styles.maintenanceButton}
                    onPress={() => Alert.alert("System Backup", "This feature will be available in a future update.")}
                  >
                    <Text style={styles.maintenanceButtonText}>Backup Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        <Button
          title="Save Settings"
          onPress={handleSaveSettings}
          loading={isLoading}
          icon={<Save size={18} color={Colors.light.white} />}
          style={[styles.saveButton, { backgroundColor: isSuperAdmin() ? "#e74c3c" : Colors.light.primary }]}
        />
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
  unauthorizedText: {
    ...theme.typography.body,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  settingsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingsItemLeft: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingsItemText: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingsItemDescription: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  numericInput: {
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: theme.borderRadius.sm,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 14,
  },
  maintenanceCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  maintenanceItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  maintenanceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  maintenanceContent: {
    flex: 1,
  },
  maintenanceTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
    marginBottom: 2,
  },
  maintenanceDescription: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginBottom: theme.spacing.sm,
  },
  maintenanceButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
  },
  maintenanceButtonText: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 12,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
});