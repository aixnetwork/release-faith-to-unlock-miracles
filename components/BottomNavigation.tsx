import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { router, usePathname, useRouter } from 'expo-router';
import { 
  Home, 
  ArrowLeft, 
  Heart, 
  Plus
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import TabBarIcon from '@/components/TabBarIcon';
import { useAdminStore } from '@/store/adminStore';

interface BottomNavigationProps {
  style?: any;
}

export default function BottomNavigation({ style }: BottomNavigationProps) {
  const pathname = usePathname();
  const navigation = useRouter();
  const { isAdmin, isSuperAdmin } = useAdminStore();
  
  const handleNavigation = (route: string) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      if (route === 'back') {
        let canNav = false;
        try { canNav = navigation.canGoBack(); } catch { canNav = false; }
        
        if (canNav) {
          router.back();
        } else {
          // If we can't go back, navigate to home instead
          const homeRoute = getHomeRoute();
          router.replace(homeRoute as any);
        }
      } else if (route === '/') {
        // Check if user is admin and redirect accordingly
        const homeRoute = getHomeRoute();
        router.push(homeRoute as any);
      } else {
        router.push(route as any);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to home if navigation fails
      try {
        const homeRoute = getHomeRoute();
        router.replace(homeRoute as any);
      } catch (fallbackError) {
        console.error('Fallback navigation error:', fallbackError);
      }
    }
  };

  const getHomeRoute = () => {
    // Check if user is admin or super admin
    if (isAdmin() || isSuperAdmin()) {
      return '/admin';
    }
    return '/';
  };

  const isHomePage = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
  const isTabPage = pathname.startsWith('/(tabs)');
  
  // Show different navigation for tab pages vs other pages
  const isMainTabPage = isTabPage && (
    pathname === '/(tabs)' || 
    pathname === '/(tabs)/index' ||
    pathname === '/(tabs)/prayers' ||
    pathname === '/(tabs)/habits' ||
    pathname === '/(tabs)/more'
  );

  // More robust check for back navigation availability
  const canGoBack = React.useMemo(() => {
    try {
      return navigation.canGoBack() && !isHomePage;
    } catch {
      return !isHomePage;
    }
  }, [navigation, isHomePage]);

  function getAccentColor(id: string): string {
    if (id === 'home') return '#3B82F6';
    if (id === 'prayers') return '#EF4444';
    if (id === 'back') return '#64748B';
    return Colors.light.primary;
  }

  // Different navigation items based on page type
  const navigationItems = isMainTabPage ? [
    // For main tab pages, show floating action button for quick actions
    {
      id: 'quick-action',
      icon: Plus,
      label: 'Add',
      route: getQuickActionRoute(pathname),
      show: true,
    },
  ] : [
    // For other pages, show essential navigation
    {
      id: 'back',
      icon: ArrowLeft,
      label: 'Back',
      route: 'back',
      show: canGoBack,
    },
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      route: '/',
      show: true,
    },
    {
      id: 'prayers',
      icon: Heart,
      label: 'Prayers',
      route: '/(tabs)/prayers',
      show: true,
    },
  ].filter(item => item.show);

  // Get appropriate quick action based on current tab
  function getQuickActionRoute(currentPath: string): string {
    if (currentPath.includes('/prayers')) {
      return '/prayer/new';
    }
    if (currentPath.includes('/habits')) {
      return '/habits/create';
    }
    // Default to sharing testimony
    return '/testimonial/new';
  }

  return (
    <View
      style={[
        isMainTabPage ? styles.tabPageContainer : styles.container,
        style,
      ]}
      testID="bottom-navigation"
    >
      <View style={isMainTabPage ? styles.tabPageNavigation : styles.navigation}>
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={isMainTabPage ? styles.tabPageNavItem : styles.navItem}
            onPress={() => handleNavigation(item.route)}
            activeOpacity={0.7}
            testID={`bottom-nav-item-${item.id}`}
          >
            {isMainTabPage ? (
              <View style={styles.tabPageIconContainer}>
                {React.isValidElement(item.icon) ? (
                  item.icon
                ) : (
                  React.createElement(item.icon as any, { size: 24, color: Colors.light.white, strokeWidth: 2 })
                )}
              </View>
            ) : (
              <TabBarIcon
                icon={item.icon}
                focused={true}
                accentColor={getAccentColor(item.id)}
                testID={`bottom-nav-icon-${item.id}`}
              />
            )}
            <Text style={isMainTabPage ? styles.tabPageNavLabel : styles.navLabel}>
              {typeof item.label === 'string' ? item.label : 'Navigation'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    paddingBottom: Platform.select({
      ios: 34, // Safe area for iPhone with home indicator
      default: 8,
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      default: {
        elevation: 16,
      },
    }),
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  navIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMedium,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  // Styles for tab pages - floating action button style
  tabPageContainer: {
    position: 'absolute',
    bottom: Platform.select({
      ios: 110, // Above the tab bar
      default: 90,
    }),
    right: 20,
    backgroundColor: Colors.light.primary,
    borderRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      default: {
        elevation: 12,
      },
    }),
  },
  tabPageNavigation: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  tabPageNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPageIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabPageNavLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});