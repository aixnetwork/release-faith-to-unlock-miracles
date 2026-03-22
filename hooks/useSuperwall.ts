import { useState, useCallback } from 'react';
import { useUserStore } from '@/store/userStore';

interface SuperwallOptions {
  feature?: string;
  context?: 'trial' | 'feature_limit' | 'upgrade_prompt' | 'onboarding';
  title?: string;
  description?: string;
  forceShow?: boolean;
}

export const useSuperwall = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<SuperwallOptions>({});
  const { plan, isLoggedIn } = useUserStore();

  const showSuperwall = useCallback((superwallOptions: SuperwallOptions = {}) => {
    // Don't show superwall if user is already on premium/lifetime or not logged in
    if (!superwallOptions.forceShow && (!isLoggedIn || plan === 'premium' || plan === 'lifetime')) {
      return false;
    }

    setOptions(superwallOptions);
    setIsVisible(true);
    return true;
  }, [plan, isLoggedIn]);

  const hideSuperwall = useCallback(() => {
    setIsVisible(false);
    setOptions({});
  }, []);

  const checkFeatureAccess = useCallback((feature: string, requiredPlan: 'premium' | 'lifetime' = 'premium') => {
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

  return {
    isVisible,
    options,
    showSuperwall,
    hideSuperwall,
    checkFeatureAccess,
    triggerTrialEnding,
    triggerOnboarding,
  };
};