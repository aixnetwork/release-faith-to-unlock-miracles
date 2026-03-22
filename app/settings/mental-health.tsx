import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Stack, router } from 'expo-router';
import { Brain, Heart, Clock, Bell, Target } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';

export default function MentalHealthSettingsScreen() {
  const { settings, updateSettings } = useUserStore();

  const handleToggleReminders = (value: boolean) => {
    updateSettings({ mentalHealthReminders: value });
  };

  const handleToggleQuietHours = (value: boolean) => {
    // Quiet hours functionality to be implemented
    console.log('Toggle quiet hours:', value);
  };

  const mentalHealthFeatures = [
    {
      id: 'guided-meditations',
      title: 'Guided Meditations',
      description: 'Faith-based meditation sessions for peace and calm',
      icon: Brain,
      route: '/mental-health',
    },
    {
      id: 'anxiety-prayers',
      title: 'Anxiety & Stress Prayers',
      description: 'Specific prayers for managing anxiety and stress',
      icon: Heart,
      route: '/mental-health',
    },
    {
      id: 'breathing-exercises',
      title: 'Breathing Exercises',
      description: 'Simple breathing techniques with scripture',
      icon: Target,
      route: '/mental-health',
    },
    {
      id: 'daily-affirmations',
      title: 'Daily Affirmations',
      description: 'Biblical affirmations for positive thinking',
      icon: Heart,
      route: '/mental-health',
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Mental Health',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Brain size={32} color={theme.mentalHealth.calm} />
          <Text style={styles.title}>Mental Health & Wellness</Text>
          <Text style={styles.description}>
            Manage your mental health settings and access faith-based wellness resources.
          </Text>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Bell size={20} color={Colors.light.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Daily Wellness Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Get gentle reminders for mental health check-ins
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.mentalHealthReminders}
                onValueChange={handleToggleReminders}
                trackColor={{ false: '#E5E5E5', true: theme.mentalHealth.calm + '40' }}
                thumbColor={settings.mentalHealthReminders ? theme.mentalHealth.calm : '#f4f3f4'}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Clock size={20} color={Colors.light.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Quiet Hours</Text>
                  <Text style={styles.settingDescription}>
                    Pause notifications during rest time (10 PM - 8 AM)
                  </Text>
                </View>
              </View>
              <Switch
                value={false}
                onValueChange={handleToggleQuietHours}
                trackColor={{ false: '#E5E5E5', true: theme.mentalHealth.calm + '40' }}
                thumbColor={false ? theme.mentalHealth.calm : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mental Health Resources</Text>
          <View style={styles.featuresContainer}>
            {mentalHealthFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <TouchableOpacity
                  key={feature.id}
                  style={styles.featureCard}
                  onPress={() => router.push(feature.route as any)}
                >
                  <View style={styles.featureIcon}>
                    <Icon size={24} color={theme.mentalHealth.calm} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Crisis Resources */}
        <View style={styles.section}>
          <View style={styles.crisisCard}>
            <Heart size={24} color={Colors.light.error} />
            <Text style={styles.crisisTitle}>Need Immediate Help?</Text>
            <Text style={styles.crisisDescription}>
              If you are experiencing a mental health crisis, please reach out for professional help immediately.
            </Text>
            <View style={styles.crisisButtons}>
              <TouchableOpacity style={styles.crisisButton}>
                <Text style={styles.crisisButtonText}>Crisis Hotline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.crisisButton, styles.secondaryButton]}>
                <Text style={[styles.crisisButtonText, styles.secondaryButtonText]}>
                  Find Counselor
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            The mental health resources in this app are for spiritual support and are not a substitute for professional medical or psychological treatment. If you are experiencing severe mental health issues, please consult with a qualified healthcare provider.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    fontSize: 18,
    marginBottom: theme.spacing.md,
  },
  settingsCard: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  settingTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    lineHeight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginLeft: theme.spacing.lg + 20 + theme.spacing.md,
  },
  featuresContainer: {
    gap: theme.spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    ...theme.shadows.small,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.mentalHealth.calm + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
    marginBottom: 2,
  },
  featureDescription: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    lineHeight: 16,
  },
  crisisCard: {
    backgroundColor: Colors.light.error + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.error + '20',
  },
  crisisTitle: {
    ...theme.typography.subtitle,
    fontSize: 18,
    color: Colors.light.error,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  crisisDescription: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  crisisButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  crisisButton: {
    backgroundColor: Colors.light.error,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  crisisButtonText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.light.error,
  },
  disclaimer: {
    backgroundColor: Colors.light.warning + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  disclaimerText: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 18,
  },
});