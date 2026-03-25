import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { User, Settings, LogOut } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import { useLogout } from '@/hooks/useLogout';
import { useTranslation } from '@/utils/translations';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';

// Enhanced Dove Logo Component for Header
const DoveLogo = () => (
  <View style={styles.logoContainer}>
    <LinearGradient
      colors={['#87CEEB', '#4682B4', '#2E86AB']}
      style={styles.logoGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.logoInner}>
        <Text style={styles.doveIcon}>🕊️</Text>
      </View>
    </LinearGradient>
    <View style={styles.logoTextContainer}>
      <Text style={styles.logoTitle}>RELEASE</Text>
      <Text style={styles.logoSubtitle}>FAITH</Text>
    </View>
  </View>
);

export default function Header() {
  const router = useRouter();
  const { isLoggedIn, settings } = useUserStore();
  const { handleLogout } = useLogout();
  const { t } = useTranslation(settings.language);
  const insets = useSafeAreaInsets();

  const navigateToLogin = () => {
    try {
      router.push('/login');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const navigateToRegister = () => {
    try {
      router.push('/register');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const navigateToAccount = () => {
    try {
      router.push('/(tabs)/account');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const navigateToSettings = () => {
    try {
      router.push('/settings');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const navigateToHome = () => {
    try {
      router.push('/');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity 
        style={styles.logoButton}
        onPress={navigateToHome}
        accessibilityLabel="Go to home"
      >
        <DoveLogo />
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        {isLoggedIn ? (
          <>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={navigateToAccount}
              accessibilityLabel="Go to profile"
              testID="header-profile-button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <User size={20} color={Colors.light.primary} />
              {Platform.OS !== 'web' && (
                <Text style={[styles.actionButtonText, styles.textSpacing]}>{t('account.profile')}</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonSpacing]}
              onPress={navigateToSettings}
              accessibilityLabel="Go to settings"
              testID="header-settings-button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Settings size={20} color={Colors.light.textMedium} />
              {Platform.OS !== 'web' && (
                <Text style={[styles.actionButtonText, styles.textSpacing]}>{t('nav.settings')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.logoutButton, styles.actionButtonSpacing]}
              onPress={handleLogout}
              accessibilityLabel="Logout"
              testID="header-logout-button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <LogOut size={18} color={Colors.light.error} />
              {Platform.OS !== 'web' && (
                <Text style={[styles.logoutButtonText, styles.textSpacing]}>{t('auth.signOut')}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={navigateToLogin}
              accessibilityLabel="Log in to your account"
            >
              <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={navigateToRegister}
              accessibilityLabel="Create a new account"
            >
              <LinearGradient
                colors={[Colors.light.primary, '#1E40AF']}
                style={styles.registerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.registerButtonText}>Join Us</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    ...theme.shadows.small,
  },
  logoButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.medium,
  },
  logoInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doveIcon: {
    fontSize: 20,
  },
  logoTextContainer: {
    alignItems: 'flex-start',
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.textPrimary,
    letterSpacing: 1,
    lineHeight: 20,
  },
  logoSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 0.5,
    marginTop: -2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.light.backgroundLight,
  },
  loginButtonText: {
    color: Colors.light.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  registerButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  registerGradient: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  registerButtonText: {
    color: Colors.light.white,
    fontWeight: '700',
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: Colors.light.backgroundLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textMedium,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.error,
  },
  actionButtonSpacing: {
    marginLeft: theme.spacing.sm,
  },
  textSpacing: {
    marginLeft: theme.spacing.xs,
  }
});