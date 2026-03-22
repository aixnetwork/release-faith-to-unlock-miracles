import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, Animated } from 'react-native';
import { 
  Settings, 
  User, 
  Heart, 
  Music, 
  MessageCircle, 
  BookOpen, 
  Calendar, 
  Sparkles,
  Shield,
  HelpCircle,
  LogOut,
  Crown,
  Users,
  Target,
  ChevronRight,
  Gamepad2
} from 'lucide-react-native';

import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { useLogout } from '@/hooks/useLogout';
import { useTranslation } from '@/utils/translations';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface MenuItemType {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  route: string;
  color: string;
}

function AnimatedMenuItem({ 
  item, 
  index, 
  sectionTitle, 
  totalItems, 
  onPress 
}: { 
  item: MenuItemType; 
  index: number; 
  sectionTitle: string;
  totalItems: number;
  onPress: () => void; 
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 150,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        testID={`menu-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuIcon, { backgroundColor: item.color + '12' }]}>
            <item.icon size={20} color={item.color} />
          </View>
          <Text style={styles.menuItemText}>{item.label}</Text>
        </View>
        <View style={styles.menuArrow}>
          <ChevronRight size={18} color={Colors.light.textLight} />
        </View>
      </TouchableOpacity>
      {index < totalItems - 1 && <View style={styles.separator} />}
    </Animated.View>
  );
}

export default function MoreScreen() {
  const userStore = useUserStore();
  const isLoggedIn = userStore?.isLoggedIn || false;
  const user = userStore?.user;
  const name = user?.first_name || user?.name || 'User';
  const plan = userStore?.plan || 'free';
  const settings = userStore?.settings || { language: 'en' };
  const { handleLogout } = useLogout();
  const { t } = useTranslation(settings.language);

  const handlePress = (route: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  const hasFamilyAccess = plan === 'group_family';
  const isChurchPlan = plan === 'small_church' || plan === 'large_church' || plan === 'org_small' || plan === 'org_medium' || plan === 'org_large' || plan === 'church' || plan?.includes('church');

  const menuSections = [
    {
      title: 'Community',
      items: [
        { icon: Users, label: 'Community Hub', route: '/(tabs)/community', color: '#6366f1' },
        { icon: MessageCircle, label: 'Prayer Wall', route: '/prayer-wall', color: '#f59e0b' },
        ...(hasFamilyAccess && !isChurchPlan ? [{ icon: Users, label: 'Family Management', route: '/family', color: Colors.light.primary }] : []),
      ]
    },
    {
      title: t('plans.features'),
      items: [
        { icon: Heart, label: t('home.prayerPlans'), route: '/(tabs)/prayer-plans', color: Colors.light.primary },
        { icon: Calendar, label: 'Meetings', route: '/(tabs)/meetings', color: Colors.light.secondary },
        { icon: Sparkles, label: 'AI Assistant', route: '/(tabs)/ai-assistant', color: Colors.light.success },
        { icon: Music, label: 'Worship Songs', route: '/(tabs)/songs', color: Colors.light.warning },
        { icon: MessageCircle, label: 'Testimonials', route: '/(tabs)/testimonials', color: Colors.light.primary },
        { icon: BookOpen, label: 'Content', route: '/(tabs)/content', color: Colors.light.secondary },
        { icon: Target, label: t('home.inspiration'), route: '/(tabs)/inspiration', color: Colors.light.success },
        { icon: Gamepad2, label: 'Bible Games', route: '/bible-games', color: Colors.light.primary },
      ]
    },
    {
      title: t('nav.account'),
      items: [
        { icon: User, label: t('account.profile'), route: '/(tabs)/account', color: Colors.light.textMedium },
        { icon: Settings, label: t('nav.settings'), route: '/settings', color: Colors.light.textMedium },
        ...(plan === 'free' ? [{ icon: Crown, label: t('plans.upgrade'), route: '/membership', color: Colors.light.warning }] : []),
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: t('help.title'), route: '/settings/help', color: Colors.light.textMedium },
        { icon: Shield, label: 'Privacy Policy', route: '/settings/privacy', color: Colors.light.textMedium },
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('nav.more')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        {isLoggedIn && (
          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <User size={24} color={Colors.light.white} />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{name || 'User'}</Text>
                <Text style={styles.userPlan}>{plan === 'free' ? t('plans.free') + ' Plan' : t('plans.premium') + ' Plan'}</Text>
              </View>
            </View>
            {plan === 'free' && (
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={() => handlePress('/membership')}
              >
                <Crown size={16} color={Colors.light.warning} />
                <Text style={styles.upgradeText}>{t('plans.upgrade')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuItems}>
              {section.items.map((item, index) => (
                <AnimatedMenuItem
                  key={`${section.title}-${item.label}-${index}`}
                  item={item}
                  index={index}
                  sectionTitle={section.title}
                  totalItems={section.items.length}
                  onPress={() => {
                    console.log('Menu item pressed:', item.label, item.route);
                    handlePress(item.route);
                  }}
                />
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        {isLoggedIn && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={() => {
                console.log('Sign out button pressed');
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                handleLogout();
              }}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              testID="more-logout-button"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <LogOut size={20} color={Colors.light.error} />
              <Text style={styles.signOutText}>{t('auth.signOut')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sign In */}
        {!isLoggedIn && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => handlePress('/login')}
            >
              <User size={20} color={Colors.light.white} />
              <Text style={styles.signInText}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.light.backgroundLight,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundLight,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  userPlan: {
    fontSize: 13,
    color: Colors.light.textMedium,
    fontWeight: '500',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  upgradeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B45309',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textLight,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menuItems: {
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 58,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as 'pointer',
    }),
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 72,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.textPrimary,
    letterSpacing: -0.2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundLight,
    padding: 16,
    borderRadius: 14,
    gap: 10,
    minHeight: 56,
    borderWidth: 1,
    borderColor: Colors.light.error + '30',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as 'pointer',
    }),
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.error,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  signInText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  bottomSpacing: {
    height: 120,
  },
});