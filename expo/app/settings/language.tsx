import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Check, Globe, Download } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { supportedLanguages, SupportedLanguage } from '@/mocks/languages';
import { useTranslation, isLanguageSupported } from '@/utils/translations';

export default function LanguageScreen() {
  const { settings, updateSettings } = useUserStore();
  const { t } = useTranslation(settings.language);
  const [selectedLanguage, setSelectedLanguage] = useState(settings.language);

  const handleLanguageSelect = (languageCode: string) => {
    if (!isLanguageSupported(languageCode)) {
      Alert.alert(
        'Language Not Available',
        'This language is not fully supported yet. We are working on adding more languages.'
      );
      return;
    }

    setSelectedLanguage(languageCode);
    updateSettings({ language: languageCode });
    
    Alert.alert(
      t('common.success'),
      'The app language has been updated successfully!',
      [
        { text: t('common.ok'), onPress: () => router.back() }
      ]
    );
  };

  const getLanguageStatus = (languageCode: string) => {
    if (isLanguageSupported(languageCode)) {
      return 'available';
    }
    return 'coming-soon';
  };

  const renderLanguageItem = (language: SupportedLanguage) => {
    const isSelected = selectedLanguage === language.code;
    const status = getLanguageStatus(language.code);
    const isAvailable = status === 'available';

    return (
      <TouchableOpacity
        key={language.code}
        style={[
          styles.languageItem,
          isSelected && styles.languageItemSelected,
          !isAvailable && styles.languageItemDisabled
        ]}
        onPress={() => isAvailable && handleLanguageSelect(language.code)}
        disabled={!isAvailable}
      >
        <View style={styles.languageInfo}>
          <View style={styles.languageHeader}>
            <Text style={styles.languageFlag}>{language.flag}</Text>
            <View style={styles.languageText}>
              <Text style={[
                styles.languageName,
                !isAvailable && styles.languageNameDisabled
              ]}>
                {language.name}
              </Text>
              <Text style={[
                styles.languageNative,
                !isAvailable && styles.languageNativeDisabled
              ]}>
                {language.nativeName}
              </Text>
            </View>
          </View>
          
          {!isAvailable && (
            <View style={styles.statusBadge}>
              <Download size={12} color={Colors.light.textLight} />
              <Text style={styles.statusText}>Coming Soon</Text>
            </View>
          )}
        </View>
        
        {isSelected && isAvailable && (
          <Check size={20} color={Colors.light.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t('settings.language') }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Globe size={32} color={Colors.light.primary} />
          <Text style={styles.title}>Choose Your Language</Text>
          <Text style={styles.subtitle}>
            Select your preferred language for the app interface
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Languages</Text>
          <View style={styles.languageList}>
            {supportedLanguages
              .filter(lang => isLanguageSupported(lang.code))
              .map(renderLanguageItem)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          <Text style={styles.sectionDescription}>
            We are working on adding support for more languages. Check back soon!
          </Text>
          <View style={styles.languageList}>
            {supportedLanguages
              .filter(lang => !isLanguageSupported(lang.code))
              .map(renderLanguageItem)}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Multilingual Content</Text>
          <Text style={styles.infoText}>
            {t('plans.premium')} members have access to prayers, devotionals, and spiritual content in multiple languages.
          </Text>
          <Text style={styles.infoText}>
            {"• Daily verses in your language"}
          </Text>
          <Text style={styles.infoText}>
            {"• Translated prayer suggestions"}
          </Text>
          <Text style={styles.infoText}>
            {"• Localized spiritual content"}
          </Text>
          <Text style={styles.infoText}>
            {"• Community posts translation"}
          </Text>
          
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.push('/membership')}
          >
            <Text style={styles.upgradeButtonText}>{t('plans.upgrade')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you notice any translation issues or would like to help improve translations, please contact our support team.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => router.push('/settings/contact')}
          >
            <Text style={styles.contactButtonText}>{t('help.contact')}</Text>
          </TouchableOpacity>
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
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  languageList: {
    gap: theme.spacing.sm,
  },
  languageItem: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...theme.shadows.small,
  },
  languageItemSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  languageItemDisabled: {
    opacity: 0.6,
  },
  languageInfo: {
    flex: 1,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  languageNameDisabled: {
    color: Colors.light.textLight,
  },
  languageNative: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    marginTop: 2,
  },
  languageNativeDisabled: {
    color: Colors.light.textLight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...theme.typography.small,
    color: Colors.light.textLight,
    marginLeft: 4,
  },
  infoSection: {
    backgroundColor: Colors.light.primaryLight,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  infoTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    marginBottom: 4,
    lineHeight: 18,
  },
  upgradeButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    alignSelf: 'center',
  },
  upgradeButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.white,
    textAlign: 'center',
  },
  helpSection: {
    backgroundColor: Colors.light.backgroundLight,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  helpTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  helpText: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  contactButton: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignSelf: 'center',
  },
  contactButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.primary,
    textAlign: 'center',
  },
});