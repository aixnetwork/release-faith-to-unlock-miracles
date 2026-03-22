import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SuperwallModal } from './SuperwallModal';
import { useUserStore } from '@/store/userStore';

interface SuperwallOptions {
  feature?: string;
  context?: 'trial' | 'feature_limit' | 'upgrade_prompt' | 'onboarding';
  title?: string;
  description?: string;
  forceShow?: boolean;
}

interface SuperwallContextType {
  showSuperwall: (options?: SuperwallOptions) => boolean;
  hideSuperwall: () => void;
  checkFeatureAccess: (feature: string, requiredPlan?: 'premium' | 'lifetime') => boolean;
  triggerTrialEnding: () => void;
  triggerOnboarding: () => void;
}

const SuperwallContext = createContext<SuperwallContextType | null>(null);

export const useSuperwall = () => {
  const context = useContext(SuperwallContext);
  if (!context) {
    throw new Error('useSuperwall must be used within a SuperwallProvider');
  }
  return context;
};

interface SuperwallProviderProps {
  children: React.ReactNode;
}

export const SuperwallProvider = ({ children }: SuperwallProviderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<SuperwallOptions>({});
  const [isStoreReady, setIsStoreReady] = useState(false);
  
  // Safely access user store with fallbacks
  let plan = 'free';
  let isLoggedIn = false;
  let hasHydrated = false;
  
  try {
    const userStore = useUserStore();
    plan = userStore?.plan || 'free';
    isLoggedIn = userStore?.isLoggedIn || false;
    hasHydrated = userStore?._hasHydrated || false;
  } catch (error) {
    console.warn('Error accessing user store in SuperwallProvider:', error);
  }

  useEffect(() => {
    if (!isStoreReady && hasHydrated) {
      setIsStoreReady(true);
    }
  }, [hasHydrated, isStoreReady]);

  const showSuperwall = useCallback((superwallOptions: SuperwallOptions = {}) => {
    try {
      // Don't show superwall if store isn't ready yet
      if (!isStoreReady) {
        return false;
      }
      
      // Don't show superwall if user is already on premium/lifetime or not logged in (unless forced)
      if (!superwallOptions.forceShow && (!isLoggedIn || plan === 'premium' || plan === 'lifetime')) {
        return false;
      }

      setOptions(superwallOptions);
      setIsVisible(true);
      return true;
    } catch (error) {
      console.error('Error showing superwall:', error);
      return false;
    }
  }, [isStoreReady, plan, isLoggedIn]);

  const hideSuperwall = useCallback(() => {
    setIsVisible(false);
    setOptions({});
  }, []);

  const checkFeatureAccess = useCallback((feature: string, requiredPlan: 'premium' | 'lifetime' = 'premium') => {
    try {
      if (!isLoggedIn) {
        showSuperwall({
          feature,
          context: 'upgrade_prompt',
          title: 'Sign In Required',
          description: `Please sign in to access ${feature}.`
        });
        return false;
      }

      if (plan === 'free') {
        showSuperwall({
          feature,
          context: 'feature_limit',
          title: `Unlock ${feature}`,
          description: `${feature} is available with premium access.`
        });
        return false;
      }

      if (requiredPlan === 'lifetime' && plan !== 'lifetime') {
        showSuperwall({
          feature,
          context: 'upgrade_prompt',
          title: `Upgrade to Lifetime`,
          description: `${feature} requires lifetime access.`
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }, [plan, isLoggedIn, showSuperwall]);

  const triggerTrialEnding = useCallback(() => {
    showSuperwall({
      context: 'trial',
      title: 'Your Free Trial is Ending',
      description: 'Continue enjoying premium features with a subscription.'
    });
  }, [showSuperwall]);

  const triggerOnboarding = useCallback(() => {
    showSuperwall({
      context: 'onboarding',
      title: 'Welcome to Release Faith',
      description: 'Start your spiritual journey with premium features.'
    });
  }, [showSuperwall]);

  // Auto-trigger superwall for free users after some app usage
  useEffect(() => {
    try {
      // Only set up timer if store is ready and user is logged in
      if (isStoreReady && isLoggedIn && plan === 'free') {
        // Show upgrade prompt after 5 minutes of app usage for free users
        const timer = setTimeout(() => {
          try {
            showSuperwall({
              context: 'upgrade_prompt',
              title: 'Loving the App?',
              description: 'Unlock premium features to enhance your spiritual journey.'
            });
          } catch (timerError) {
            console.error('Error showing superwall from timer:', timerError);
          }
        }, 5 * 60 * 1000); // 5 minutes

        return () => {
          try {
            clearTimeout(timer);
          } catch (clearError) {
            console.error('Error clearing superwall timer:', clearError);
          }
        };
      }
    } catch (error) {
      console.error('Error setting up superwall timer:', error);
    }
  }, [isStoreReady, isLoggedIn, plan, showSuperwall]);

  const contextValue: SuperwallContextType = {
    showSuperwall,
    hideSuperwall,
    checkFeatureAccess,
    triggerTrialEnding,
    triggerOnboarding,
  };

  return (
    <SuperwallContext.Provider value={contextValue}>
      {children}
      {/* Wrap SuperwallModal in error boundary */}
      {(() => {
        try {
          return (
            <SuperwallModal
              visible={isVisible}
              onClose={hideSuperwall}
              feature={options.feature}
              context={options.context}
              title={options.title}
              description={options.description}
            />
          );
        } catch (error) {
          console.error('Error rendering SuperwallModal:', error);
          return null;
        }
      })()}
    </SuperwallContext.Provider>
  );
};