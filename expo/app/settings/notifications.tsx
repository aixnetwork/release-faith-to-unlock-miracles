import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Bell, Clock, Mail, MessageSquare } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: 'push' | 'email' | 'sms';
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'prayer_reminders',
      title: 'Prayer Reminders',
      description: 'Daily reminders to pray',
      enabled: true,
      category: 'push'
    },
    {
      id: 'new_testimonials',
      title: 'New Testimonials',
      description: 'When new testimonials are shared',
      enabled: true,
      category: 'push'
    },
    {
      id: 'prayer_responses',
      title: 'Prayer Responses',
      description: 'When someone prays for your request',
      enabled: true,
      category: 'push'
    },
    {
      id: 'daily_verses',
      title: 'Daily Verses',
      description: 'Receive daily Bible verses',
      enabled: true,
      category: 'push'
    },
    {
      id: 'app_updates',
      title: 'App Updates',
      description: 'News about app features and updates',
      enabled: true,
      category: 'push'
    },
    {
      id: 'weekly_digest',
      title: 'Weekly Digest',
      description: 'Weekly summary of your spiritual journey',
      enabled: false,
      category: 'email'
    },
    {
      id: 'prayer_invites_sms',
      title: 'Prayer Meeting Invites',
      description: 'SMS invitations to prayer meetings',
      enabled: false,
      category: 'sms'
    },
    {
      id: 'urgent_prayers_sms',
      title: 'Urgent Prayer Requests',
      description: 'SMS for urgent prayer needs',
      enabled: false,
      category: 'sms'
    }
  ]);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');

  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    );
  };

  const pushNotifications = notifications.filter(n => n.category === 'push');
  const emailNotificationsList = notifications.filter(n => n.category === 'email');
  const smsNotificationsList = notifications.filter(n => n.category === 'sms');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.textPrimary,
          headerTitleStyle: { color: Colors.light.textPrimary },
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Push Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <View style={styles.notificationCard}>
            {pushNotifications.map((notification, index) => (
              <View key={notification.id}>
                <View style={styles.notificationItem}>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationDescription}>{notification.description}</Text>
                  </View>
                  <Switch
                    value={notification.enabled}
                    onValueChange={() => toggleNotification(notification.id)}
                    trackColor={{ false: Colors.light.borderLight, true: Colors.light.primary + '80' }}
                    thumbColor={notification.enabled ? Colors.light.primary : Colors.light.textMedium}
                  />
                </View>
                {index < pushNotifications.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Email Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          <View style={styles.emailCard}>
            <View style={styles.emailHeader}>
              <Mail size={24} color={Colors.light.primary} />
              <View style={styles.emailInfo}>
                <Text style={styles.emailTitle}>Email Updates</Text>
                <Text style={styles.emailDescription}>
                  Receive important updates and summaries via email
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: Colors.light.borderLight, true: Colors.light.primary + '80' }}
                thumbColor={emailNotifications ? Colors.light.primary : Colors.light.textMedium}
              />
            </View>
            
            {emailNotifications && (
              <>
                <View style={styles.divider} />
                {emailNotificationsList.map((notification, index) => (
                  <View key={notification.id}>
                    <View style={styles.notificationItem}>
                      <View style={styles.notificationInfo}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationDescription}>{notification.description}</Text>
                      </View>
                      <Switch
                        value={notification.enabled}
                        onValueChange={() => toggleNotification(notification.id)}
                        trackColor={{ false: Colors.light.borderLight, true: Colors.light.primary + '80' }}
                        thumbColor={notification.enabled ? Colors.light.primary : Colors.light.textMedium}
                      />
                    </View>
                    {index < emailNotificationsList.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </>
            )}
          </View>
          
          <Text style={styles.emailNote}>
            You can customize which emails you receive in your email preferences.
          </Text>
        </View>

        {/* SMS Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SMS Notifications</Text>
          <View style={styles.emailCard}>
            <View style={styles.emailHeader}>
              <MessageSquare size={24} color={Colors.light.warning} />
              <View style={styles.emailInfo}>
                <Text style={styles.emailTitle}>SMS Updates</Text>
                <Text style={styles.emailDescription}>
                  Receive urgent notifications via text message
                </Text>
              </View>
              <Switch
                value={smsNotifications}
                onValueChange={setSmsNotifications}
                trackColor={{ false: Colors.light.borderLight, true: Colors.light.warning + '80' }}
                thumbColor={smsNotifications ? Colors.light.warning : Colors.light.textMedium}
              />
            </View>
            
            {smsNotifications && (
              <>
                <View style={styles.divider} />
                {smsNotificationsList.map((notification, index) => (
                  <View key={notification.id}>
                    <View style={styles.notificationItem}>
                      <View style={styles.notificationInfo}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationDescription}>{notification.description}</Text>
                      </View>
                      <Switch
                        value={notification.enabled}
                        onValueChange={() => toggleNotification(notification.id)}
                        trackColor={{ false: Colors.light.borderLight, true: Colors.light.warning + '80' }}
                        thumbColor={notification.enabled ? Colors.light.warning : Colors.light.textMedium}
                      />
                    </View>
                    {index < smsNotificationsList.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </>
            )}
          </View>
          
          <Text style={styles.emailNote}>
            Standard messaging rates may apply. SMS notifications are for urgent matters only.
          </Text>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <View style={styles.quietCard}>
            <View style={styles.quietHeader}>
              <Clock size={24} color={Colors.light.primary} />
              <View style={styles.quietInfo}>
                <Text style={styles.quietTitle}>Do Not Disturb</Text>
                <Text style={styles.quietDescription}>
                  Pause notifications during specific hours
                </Text>
              </View>
              <Switch
                value={quietHoursEnabled}
                onValueChange={setQuietHoursEnabled}
                trackColor={{ false: Colors.light.borderLight, true: Colors.light.primary + '80' }}
                thumbColor={quietHoursEnabled ? Colors.light.primary : Colors.light.textMedium}
              />
            </View>
            
            {quietHoursEnabled && (
              <>
                <View style={styles.divider} />
                <View style={styles.timeSettings}>
                  <TouchableOpacity style={styles.timeSetting}>
                    <Text style={styles.timeLabel}>Start Time</Text>
                    <Text style={styles.timeValue}>{quietHoursStart}</Text>
                  </TouchableOpacity>
                  <View style={styles.timeDivider} />
                  <TouchableOpacity style={styles.timeSetting}>
                    <Text style={styles.timeLabel}>End Time</Text>
                    <Text style={styles.timeValue}>{quietHoursEnd}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
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
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  notificationCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  notificationInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  notificationTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  notificationDescription: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginHorizontal: theme.spacing.md,
  },
  emailCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
    marginBottom: theme.spacing.sm,
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  emailInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  emailTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  emailDescription: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
  },
  emailNote: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quietCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  quietHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  quietInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  quietTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  quietDescription: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
  },
  timeSettings: {
    flexDirection: 'row',
    padding: theme.spacing.md,
  },
  timeSetting: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    marginBottom: 4,
  },
  timeValue: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  timeDivider: {
    width: 1,
    backgroundColor: Colors.light.borderLight,
    marginHorizontal: theme.spacing.md,
  },
});