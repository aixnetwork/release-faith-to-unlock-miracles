import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Globe } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useTranslation, getAvailableLanguages } from '@/utils/translations';
import { supportedLanguages } from '@/mocks/languages';

export default function TestLanguagesScreen() {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const { t } = useTranslation(currentLanguage);
  const availableLanguages = getAvailableLanguages();

  const testKeys = [
    'common.loading',
    'nav.home',
    'auth.login',
    'prayers.title',
    'plans.premium',
    'help.title',
    'settings.language',
    'greeting.morning',
    'achievements.title',
    'home.welcome'
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Language Test' }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Globe size={32} color={Colors.light.primary} />
          <Text style={styles.title}>Language Support Test</Text>
          <Text style={styles.subtitle}>
            Testing translations for Chinese, Spanish, and Korean
          </Text>
        </View>

        <View style={styles.languageSelector}>
          <Text style={styles.sectionTitle}>Select Language:</Text>
          <View style={styles.languageButtons}>
            {supportedLanguages
              .filter(lang => availableLanguages.includes(lang.code))
              .map((language) => {
                if (!language) return null;
                return (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageButton,
                      currentLanguage === language.code && styles.languageButtonActive
                    ]}
                    onPress={() => setCurrentLanguage(language.code)}
                  >
                    <Text style={styles.languageFlag}>{language.flag || ''}</Text>
                    <Text style={[
                      styles.languageButtonText,
                      currentLanguage === language.code && styles.languageButtonTextActive
                    ]}>
                      {language.nativeName || language.name || ''}
                    </Text>
                  </TouchableOpacity>
                );
              })
            }
          </View>
        </View>

        <View style={styles.translationsSection}>
          <Text style={styles.sectionTitle}>Translations Preview:</Text>
          <Text style={styles.currentLanguage}>
            Current: {supportedLanguages.find(l => l.code === currentLanguage)?.name} ({currentLanguage})
          </Text>
          
          <View style={styles.translationsList}>
            {testKeys.map((key) => (
              <View key={key} style={styles.translationItem}>
                <Text style={styles.translationKey}>{key}:</Text>
                <Text style={styles.translationValue}>{t(key as any)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Language Support Status:</Text>
          {supportedLanguages.map((language) => {
            if (!language) return null;
            const isSupported = availableLanguages.includes(language.code);
            return (
              <View key={language.code} style={styles.statusItem}>
                <Text style={styles.statusFlag}>{language.flag || ''}</Text>
                <Text style={styles.statusName}>{language.name || ''}</Text>
                <View style={[
                  styles.statusBadge,
                  isSupported ? styles.statusBadgeSupported : styles.statusBadgeUnsupported
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    isSupported ? styles.statusBadgeTextSupported : styles.statusBadgeTextUnsupported
                  ]}>
                    {isSupported ? 'Supported' : 'Coming Soon'}
                  </Text>
                </View>
              </View>
            );
          })}
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
  header: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
  },
  title: {
    ...theme.typography.title,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  languageSelector: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  languageButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  languageButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  languageFlag: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  languageButtonText: {
    ...theme.typography.caption,
    color: Colors.light.textPrimary,
    fontWeight: '500',
  },
  languageButtonTextActive: {
    color: Colors.light.white,
  },
  translationsSection: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.backgroundLight,
  },
  currentLanguage: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  translationsList: {
    gap: theme.spacing.sm,
  },
  translationItem: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  translationKey: {
    ...theme.typography.small,
    color: Colors.light.textLight,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  translationValue: {
    ...theme.typography.body,
    color: Colors.light.textPrimary,
    fontWeight: '500',
  },
  statusSection: {
    padding: theme.spacing.lg,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  statusFlag: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  statusName: {
    ...theme.typography.body,
    color: Colors.light.textPrimary,
    flex: 1,
  },
  statusBadge: {
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  statusBadgeSupported: {
    backgroundColor: Colors.light.success + '20',
  },
  statusBadgeUnsupported: {
    backgroundColor: Colors.light.textLight + '20',
  },
  statusBadgeText: {
    ...theme.typography.small,
    fontWeight: '600',
  },
  statusBadgeTextSupported: {
    color: Colors.light.success,
  },
  statusBadgeTextUnsupported: {
    color: Colors.light.textLight,
  },
});