import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, TextInput } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Check, CreditCard, Shield, ArrowLeft, Star, Zap, Tag, Gift } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import * as Haptics from 'expo-haptics';
import { ENV } from '@/config/env';
import { resilientFetch, getApiUrl, directusHeaders } from '@/utils/resilientFetch';

interface PlanDetails {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  isLifetime?: boolean;
}

interface CouponDetails {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  validUntil?: string;
  description: string;
}

export default function CheckoutScreen() {
  const { plan: planId, priceId, userId, organizationId } = useLocalSearchParams<{ plan: string; priceId?: string; userId?: string; organizationId?: string }>();
  const { setPlan, user } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDetails | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [loadingPlans, setLoadingPlans] = useState(true);

  const plans: Record<string, PlanDetails> = {
    free: {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Basic prayer journal, limited daily practices, community access, and basic Bible games to get started on your faith journey',
      features: [
        'Basic prayer journal',
        'Limited daily practices (3/day)',
        'Basic Bible games',
        'Community forum access',
        'Basic achievements',
      ],
    },
    individual: {
      id: 'individual',
      name: 'Individual',
      price: '$9.99',
      period: 'month',
      description: 'Complete personal growth package with AI-powered prayer assistance, MIRACLE prayer templates, unlimited habits, prayer wall participation, daily devotionals, and full marketplace access',
      features: [
        'Everything in Free plan',
        'AI prayer assistant (unlimited)',
        'MIRACLE prayer templates (9 categories)',
        'Unlimited habit tracking',
        'Prayer wall (post & manage prayers)',
        'Daily devotional generator',
        'Scripture insights & AI commentary',
        'Prayer streak tracking & reminders',
        'Advanced achievements & badges',
        'Mental health resources',
        'Multilingual content',
        'Full marketplace access (browse & purchase)',
        'Interactive Bible games (all levels)',
        'Testimonial sharing',
      ],
    },
    group_family: {
      id: 'group_family',
      name: 'Group/Family',
      price: '$19.99',
      period: 'month',
      description: 'Perfect for families & small groups - everything in Individual, plus shared prayer boards, virtual group meetings, collaborative Bible games, group devotionals, prayer plans, and unified habit tracking',
      features: [
        'Everything in Individual plan',
        'Up to 10 family members/users',
        'Shared family prayer boards',
        'Group prayer plans & challenges',
        'Virtual family meetings & group video calls',
        'Collaborative family Bible games',
        'Group devotionals and study plans',
        'Family prayer request sharing & updates',
        'Shared habit tracking & accountability',
        'Group admin dashboard',
        'Shared achievements & milestones',
        'Family testimonial collection',
        'Group chat & messaging',
      ],
    },
    small_church: {
      id: 'small_church',
      name: 'Small Church',
      price: '$149',
      period: 'month',
      description: 'Complete church management solution - everything in Group plan, plus AI sermon drafting, donor management, volunteer scheduling, event management, 10 marketplace listings, church analytics, and member management tools',
      features: [
        'Everything in Group/Family plan',
        'Up to 250 members',
        'AI sermon drafting & ministry planning',
        'AI devotional & content generation',
        'Donor management & giving analytics',
        '10 marketplace service listings',
        'Volunteer scheduling & management',
        'Event management & RSVP tracking',
        'Church dashboard & member directory',
        'Church-wide announcements & notifications',
        'Prayer request moderation tools',
        'Member engagement analytics',
        'Basic reporting & insights',
        'Email & chat support',
        'Custom church branding (logo)',
      ],
    },
    large_church: {
      id: 'large_church',
      name: 'Large Church',
      price: '$499',
      period: 'month',
      description: 'Enterprise church solution - everything in Small Church, plus multi-campus management, advanced volunteer automation, unlimited marketplace listings, priority support, custom training, white-label branding, and dedicated success manager',
      features: [
        'Everything in Small Church plan',
        'Unlimited members & groups',
        'Multi-campus management dashboards',
        'Advanced volunteer & event automation',
        'Unlimited marketplace service listings',
        'Custom marketplace commission rates',
        'Priority support & onboarding',
        'Custom training & webinars',
        'Advanced analytics & reporting suite',
        'Advanced member segmentation & targeting',
        'Custom branding & white-label options',
        'Dedicated account manager',
        'API access for integrations',
        'Early access to new features',
        'Customizable workflows',
      ],
    },
    org_small: {
      id: 'org_small',
      name: 'Small Organization',
      price: '$49',
      period: 'month',
      description: 'Perfect for small organizations with up to 100 members',
      features: [
        'Up to 100 members',
        'Basic organization dashboard',
        'Member management',
        'Group messaging',
        'Event scheduling',
      ],
    },
    org_medium: {
      id: 'org_medium',
      name: 'Medium Organization',
      price: '$99',
      period: 'month',
      description: 'Ideal for growing organizations with up to 500 members',
      features: [
        'Up to 500 members',
        'Advanced organization dashboard',
        'Member management',
        'Group messaging',
        'Event scheduling',
        'Analytics & reporting',
      ],
    },
    org_large: {
      id: 'org_large',
      name: 'Large Organization',
      price: '$199',
      period: 'month',
      description: 'For large organizations with unlimited members',
      features: [
        'Unlimited members',
        'Premium organization dashboard',
        'Advanced member management',
        'Group messaging',
        'Event scheduling',
        'Advanced analytics & reporting',
        'Priority support',
      ],
    },
  };

  const availableCoupons: Record<string, CouponDetails> = {
    'LAUNCH50': {
      code: 'LAUNCH50',
      discount: 50,
      type: 'percentage',
      description: '50% off launch special',
      validUntil: '2025-12-31',
    },
    'CHURCH25': {
      code: 'CHURCH25',
      discount: 25,
      type: 'percentage',
      description: '25% off church plans',
      validUntil: '2025-08-31',
    },
    'SAVE20': {
      code: 'SAVE20',
      discount: 20,
      type: 'fixed',
      description: '$20 off any plan',
      validUntil: '2025-09-30',
    },
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await resilientFetch(getApiUrl('/items/plans'), {
          method: 'GET',
          headers: directusHeaders(),
        });

        const data = await response.json();
        console.log('Plans fetched from Directus:', data);

        const directusPlans: Record<string, PlanDetails> = {};
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((plan: any) => {
            directusPlans[plan.id] = {
              id: plan.id,
              name: plan.name || '',
              price: plan.price ? `${plan.price}` : '$0',
              originalPrice: plan.original_price ? `${plan.original_price}` : undefined,
              period: plan.period || 'month',
              description: plan.description || '',
              features: plan.features || [],
              isLifetime: plan.is_lifetime || false,
            };
          });
        }



        const allPlans = Object.keys(directusPlans).length > 0 ? directusPlans : plans;
        
        if (planId && allPlans[planId]) {
          setPlanDetails(allPlans[planId]);
        } else if (planId) {
          console.warn('Plan not found in Directus, using fallback:', planId);
          if (plans[planId]) {
            setPlanDetails(plans[planId]);
          } else {
            Alert.alert('Error', 'Invalid plan selected. Please select a plan from the membership page.');
            router.back();
          }
        } else {
          Alert.alert('Error', 'No plan selected. Please select a plan from the membership page.');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        if (planId && plans[planId]) {
          setPlanDetails(plans[planId]);
        } else {
          Alert.alert('Error', 'Failed to load plan details');
          router.back();
        }
      } finally {
        setLoadingPlans(false);
      }
    };

    void fetchPlans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const calculateDiscountedPrice = (originalPrice: string, coupon: CouponDetails): string => {
    const price = parseFloat(originalPrice.replace('$', ''));
    let discountedPrice = price;

    if (coupon.type === 'percentage') {
      discountedPrice = price * (1 - coupon.discount / 100);
    } else {
      discountedPrice = Math.max(0, price - coupon.discount);
    }

    return `$${discountedPrice.toFixed(2)}`;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    setCouponLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const coupon = availableCoupons[couponCode.toUpperCase()];
      if (!coupon) {
        Alert.alert('Invalid Coupon', 'The coupon code you entered is not valid or has expired.');
        setCouponLoading(false);
        return;
      }

      if (coupon.code === 'CHURCH25' && !['small_church', 'large_church'].includes(planDetails?.id || '')) {
        Alert.alert('Invalid Coupon', 'This coupon is only valid for church plans.');
        setCouponLoading(false);
        return;
      }

      setAppliedCoupon(coupon);
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Coupon Applied!', `${coupon.description} has been applied to your order.`);
    } catch (error) {
      console.error('Coupon validation error:', error);
      Alert.alert('Error', 'Failed to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      void Haptics.selectionAsync();
    }
  };

  const handleStripeCheckout = async () => {
    if (!planDetails) return;

    setIsLoading(true);
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      console.log('Creating Stripe checkout session for plan:', planDetails.id);
      console.log('User ID:', userId);
      console.log('Organization ID:', organizationId);
      console.log('Price ID:', priceId);
      
      let finalAmount = parseFloat(planDetails.price.replace('$', ''));
      if (appliedCoupon) {
        const discountedPrice = calculateDiscountedPrice(planDetails.price, appliedCoupon);
        finalAmount = parseFloat(discountedPrice.replace('$', ''));
      }

      const currentDate = new Date().toISOString();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      const oneYearLaterDate = endDate.toISOString();

      const subscriptionData = {
        organization_id: organizationId ? parseInt(organizationId.toString(), 10) : null,
        plan_id: planId,
        user_id: userId,
        start_end: currentDate,
        end_date: oneYearLaterDate,
        is_active: 0,
        payment_status: 'pending',
        payment_method: 'stripe',
        status: 'published',
      };

      console.log('Creating pending subscription record:', subscriptionData);
      const subscriptionResponse = await fetch(getApiUrl('/items/organization_subscriptions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.message || 'Failed to create subscription record');
      }

      const subscriptionResult = await subscriptionResponse.json();
      console.log('Subscription record created:', subscriptionResult);

      const response = await fetch(getApiUrl('/api/stripe/create-checkout-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify({
          planId: planDetails.id,
          amount: Math.round(finalAmount * 100),
          currency: 'USD',
          userId: userId,
          organizationId: organizationId,
          couponCode: appliedCoupon?.code,
          successUrl: `${typeof window !== 'undefined' ? window.location.origin : 'rorkapp://'}checkout/success`,
          cancelUrl: `${typeof window !== 'undefined' ? window.location.origin : 'rorkapp://'}checkout/cancel`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.success && data.sessionId) {
        console.log('Stripe checkout session created:', data.sessionId);
        
        if (subscriptionResult.data?.id) {
          const updateResponse = await fetch(getApiUrl(`/items/organization_subscriptions/${subscriptionResult.data.id}`), {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            },
            body: JSON.stringify({
              stripe_subscription_id: data.sessionId,
            }),
          });
          
          if (!updateResponse.ok) {
            console.error('Failed to update subscription with Stripe session ID');
          }
        }
        
        if (Platform.OS !== 'ios' && Platform.OS !== 'android' && data.url) {
          if (typeof window !== 'undefined') {
            window.location.href = data.url;
          }
        } else {
          setPlan(planDetails.id as any);
          setIsLoading(false);
          
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          Alert.alert(
            'Payment Processing',
            `Your payment is being processed. Session ID: ${data.sessionId}`,
            [
              {
                text: 'Continue',
                onPress: () => {
                  if (user?.organizationRole === 'admin') {
                    router.replace('/organization');
                  } else {
                    router.replace('/');
                  }
                },
              },
            ]
          );
        }
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      setIsLoading(false);
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      Alert.alert(
        'Error',
        'There was an error processing your payment with Stripe. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePayPalCheckout = async () => {
    if (!planDetails) return;

    setIsLoading(true);
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      let finalAmount = parseFloat(planDetails.price.replace('$', ''));
      if (appliedCoupon) {
        const discountedPrice = calculateDiscountedPrice(planDetails.price, appliedCoupon);
        finalAmount = parseFloat(discountedPrice.replace('$', ''));
      }

      console.log('Creating PayPal payment for plan:', planDetails.id);
      console.log('Amount:', finalAmount);
      console.log('User ID:', userId);
      console.log('Organization ID:', organizationId);

      const currentDate = new Date().toISOString();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      const oneYearLaterDate = endDate.toISOString();

      const subscriptionData = {
        organization_id: organizationId ? parseInt(organizationId.toString(), 10) : null,
        plan_id: planId,
        user_id: userId,
        start_end: currentDate,
        end_date: oneYearLaterDate,
        is_active: 0,
        payment_status: 'pending',
        payment_method: 'paypal',
        status: 'published',
      };

      console.log('Creating pending subscription record:', subscriptionData);
      const subscriptionResponse = await fetch(getApiUrl('/items/organization_subscriptions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.message || 'Failed to create subscription record');
      }

      const subscriptionResult = await subscriptionResponse.json();
      console.log('Subscription record created:', subscriptionResult);

      const response = await fetch(getApiUrl('/api/paypal/create-payment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify({
          planId: planDetails.id,
          amount: Math.round(finalAmount * 100),
          currency: 'USD',
          description: `${planDetails.name} - ${planDetails.description}`,
          userId: userId,
          organizationId: organizationId,
          paymentType: planDetails.isLifetime ? 'one-time' : 'subscription',
          returnUrl: `${typeof window !== 'undefined' ? window.location.origin : 'rorkapp://'}checkout/success`,
          cancelUrl: `${typeof window !== 'undefined' ? window.location.origin : 'rorkapp://'}checkout/cancel`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal payment');
      }

      if (data.success && data.approvalUrl) {
        console.log('PayPal payment created:', data.approvalUrl);
        
        if (data.paymentId && subscriptionResult.data?.id) {
          const updateResponse = await fetch(getApiUrl(`/items/organization_subscriptions/${subscriptionResult.data.id}`), {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            },
            body: JSON.stringify({
              stripe_subscription_id: data.paymentId,
            }),
          });
          
          if (!updateResponse.ok) {
            console.error('Failed to update subscription with PayPal payment ID');
          }
        }
        
        if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
          if (typeof window !== 'undefined') {
            window.location.href = data.approvalUrl;
          }
        } else {
          setPlan(planDetails.id as any);
          setIsLoading(false);
          
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          Alert.alert(
            'Payment Processing',
            `Please complete your payment in the PayPal app. Payment ID: ${data.paymentId}`,
            [
              {
                text: 'Continue',
                onPress: () => {
                  if (user?.organizationRole === 'admin') {
                    router.replace('/organization');
                  } else {
                    router.replace('/');
                  }
                },
              },
            ]
          );
        }
      } else {
        throw new Error('Failed to create PayPal payment');
      }
    } catch (error) {
      console.error('PayPal checkout error:', error);
      setIsLoading(false);
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      Alert.alert(
        'Error',
        'There was an error processing your payment with PayPal. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCheckout = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to complete checkout. Please try registering again.');
      router.replace('/register-org');
      return;
    }

    if (planDetails?.id === 'free') {
      setIsLoading(true);
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      try {
        const currentDate = new Date().toISOString();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        const oneYearLaterDate = endDate.toISOString();

        const subscriptionData = {
          organization_id: organizationId ? parseInt(organizationId.toString(), 10) : null,
          plan_id: planId,
          user_id: userId,
          start_end: currentDate,
          end_date: oneYearLaterDate,
          is_active: 1,
          payment_status: 'completed',
          payment_method: 'free',
          status: 'published',
        };

        console.log('Creating free subscription record:', subscriptionData);
        void fetch(getApiUrl('/items/organization_subscriptions'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
          },
          body: JSON.stringify(subscriptionData),
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errors?.[0]?.message || 'Failed to create subscription record');
          }

          const subscriptionResult = await response.json();
          console.log('Free subscription record created:', subscriptionResult);
          
          setPlan('free' as any);
          setIsLoading(false);
          
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          Alert.alert(
            'Welcome!',
            'You have successfully activated your Free plan! Start your faith journey today.',
            [
              {
                text: 'Get Started',
                onPress: () => router.replace('/'),
              },
            ]
          );
        }).catch((error) => {
          console.error('Free plan activation error:', error);
          setIsLoading(false);
          
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          
          Alert.alert(
            'Error',
            'Failed to activate free plan. Please try again.',
            [{ text: 'OK' }]
          );
        });
      } catch (error) {
        console.error('Free plan activation error:', error);
        setIsLoading(false);
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        
        Alert.alert(
          'Error',
          'Failed to activate free plan. Please try again.',
          [{ text: 'OK' }]
        );
      }
      return;
    }
    
    if (selectedPaymentMethod === 'stripe') {
      void handleStripeCheckout();
    } else {
      void handlePayPalCheckout();
    }
  };

  if (loadingPlans || !planDetails) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={{ marginTop: theme.spacing.md, color: Colors.light.textMedium }}>
          Loading plan details...
        </Text>
      </View>
    );
  }

  const finalPrice = appliedCoupon ? calculateDiscountedPrice(planDetails.price, appliedCoupon) : planDetails.price;
  const savings = appliedCoupon ? (parseFloat(planDetails.price.replace('$', '')) - parseFloat(finalPrice.replace('$', ''))).toFixed(2) : null;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Checkout',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
      >
        <LinearGradient
          colors={planDetails.isLifetime 
            ? [Colors.light.warning, Colors.light.warningDark, '#B91C1C'] as const
            : [Colors.light.primary, Colors.light.primaryDark, '#002266'] as const
          }
          style={styles.planSummaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.planSummary}>
            <View style={styles.planHeader}>
              {planDetails.isLifetime ? (
                <Gift size={24} color="#ffffff" />
              ) : (
                <Star size={24} color="#ffffff" />
              )}
              <Text style={styles.planName}>{planDetails.name}</Text>
              {planDetails.isLifetime && (
                <View style={styles.lifetimeBadge}>
                  <Text style={styles.lifetimeBadgeText}>LIMITED TIME</Text>
                </View>
              )}
            </View>
            
            <View style={styles.priceContainer}>
              {planDetails.originalPrice && (
                <Text style={styles.originalPrice}>{planDetails.originalPrice}</Text>
              )}
              <Text style={styles.planPrice}>{planDetails.price}</Text>
              <Text style={styles.planPeriod}>/{planDetails.period}</Text>
            </View>
            
            <Text style={styles.planDescription}>{planDetails.description}</Text>

            <View style={styles.featuresContainer}>
              {planDetails.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Check size={16} color="#ffffff" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        {planDetails.id !== 'free' && (
          <View style={styles.couponSection}>
            <Text style={styles.sectionTitle}>Have a Coupon Code?</Text>
            
            {!appliedCoupon ? (
              <View style={styles.couponInputContainer}>
                <View style={styles.couponInputWrapper}>
                  <Tag size={20} color={Colors.light.textMedium} style={styles.couponIcon} />
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    autoCapitalize="characters"
                    placeholderTextColor={Colors.light.inputPlaceholder}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.applyCouponButton, couponLoading && styles.applyCouponButtonDisabled]}
                  onPress={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                >
                  {couponLoading ? (
                    <ActivityIndicator size="small" color={Colors.light.white} />
                  ) : (
                    <Text style={styles.applyCouponButtonText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.appliedCouponContainer}>
                <View style={styles.appliedCouponInfo}>
                  <Tag size={16} color={Colors.light.success} />
                  <Text style={styles.appliedCouponText}>{appliedCoupon.code}</Text>
                  <Text style={styles.appliedCouponDescription}>{appliedCoupon.description}</Text>
                </View>
                <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeCouponButton}>
                  <Text style={styles.removeCouponButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.sampleCoupons}>
              <Text style={styles.sampleCouponsTitle}>Try these codes:</Text>
              <View style={styles.sampleCouponsList}>
                <Text style={styles.sampleCouponCode}>LAUNCH50</Text>
                <Text style={styles.sampleCouponCode}>CHURCH25</Text>
                <Text style={styles.sampleCouponCode}>SAVE20</Text>
              </View>
            </View>
          </View>
        )}

        {appliedCoupon && (
          <View style={styles.orderSummary}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{planDetails.price}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount ({appliedCoupon.code})</Text>
              <Text style={styles.summaryDiscount}>-${savings}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{finalPrice}</Text>
            </View>
          </View>
        )}

        {planDetails.id !== 'free' && (
          <View style={styles.paymentMethodSection}>
            <Text style={styles.sectionTitle}>Choose Payment Method</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === 'stripe' && styles.selectedPaymentMethod
              ]}
              onPress={() => setSelectedPaymentMethod('stripe')}
            >
              <View style={styles.paymentMethodContent}>
                <View style={styles.paymentMethodHeader}>
                  <CreditCard size={24} color={selectedPaymentMethod === 'stripe' ? Colors.light.primary : Colors.light.textMedium} />
                  <Text style={[
                    styles.paymentMethodTitle,
                    selectedPaymentMethod === 'stripe' && styles.selectedPaymentMethodTitle
                  ]}>
                    Credit/Debit Card
                  </Text>
                  {selectedPaymentMethod === 'stripe' && (
                    <Check size={20} color={Colors.light.primary} />
                  )}
                </View>
                <Text style={styles.paymentMethodDescription}>
                  Secure payment with Stripe • Visa, Mastercard, American Express
                </Text>
                <View style={styles.paymentMethodBadges}>
                  <View style={styles.badge}>
                    <Shield size={12} color={Colors.light.success} />
                    <Text style={styles.badgeText}>SSL Encrypted</Text>
                  </View>
                  <View style={styles.badge}>
                    <Zap size={12} color={Colors.light.warning} />
                    <Text style={styles.badgeText}>Instant</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === 'paypal' && styles.selectedPaymentMethod
              ]}
              onPress={() => setSelectedPaymentMethod('paypal')}
            >
              <View style={styles.paymentMethodContent}>
                <View style={styles.paymentMethodHeader}>
                  <View style={styles.paypalIcon}>
                    <Text style={styles.paypalText}>PayPal</Text>
                  </View>
                  <Text style={[
                    styles.paymentMethodTitle,
                    selectedPaymentMethod === 'paypal' && styles.selectedPaymentMethodTitle
                  ]}>
                    PayPal
                  </Text>
                  {selectedPaymentMethod === 'paypal' && (
                    <Check size={20} color={Colors.light.primary} />
                  )}
                </View>
                <Text style={styles.paymentMethodDescription}>
                  Pay with your PayPal account or linked bank account
                </Text>
                <View style={styles.paymentMethodBadges}>
                  <View style={styles.badge}>
                    <Shield size={12} color={Colors.light.success} />
                    <Text style={styles.badgeText}>Buyer Protection</Text>
                  </View>
                  <View style={styles.badge}>
                    <Zap size={12} color={Colors.light.warning} />
                    <Text style={styles.badgeText}>Fast</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.securityNotice}>
          <Shield size={20} color={Colors.light.success} />
          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>{planDetails.id === 'free' ? 'Free Plan' : 'Secure Payment'}</Text>
            <Text style={styles.securityText}>
              {planDetails.id === 'free' 
                ? 'No payment required. Start your faith journey with our free plan and upgrade anytime.' 
                : `Your payment information is encrypted and secure. ${planDetails.isLifetime ? 'One-time payment, no recurring charges.' : 'Start with a 14-day free trial.'}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, isLoading && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isLoading ? [Colors.light.textLight, Colors.light.textMedium, '#94A3B8'] as const : planDetails.isLifetime 
              ? [Colors.light.warning, Colors.light.warningDark, '#B91C1C'] as const
              : [Colors.light.primary, Colors.light.primaryDark, '#002266'] as const}
            style={styles.checkoutButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.light.white} size="small" />
            ) : (
              <>
                {planDetails.id === 'free' ? (
                  <Star size={20} color={Colors.light.white} />
                ) : selectedPaymentMethod === 'stripe' ? (
                  <CreditCard size={20} color={Colors.light.white} />
                ) : (
                  <View style={styles.paypalButtonIcon}>
                    <Text style={styles.paypalButtonText}>PayPal</Text>
                  </View>
                )}
                <Text style={styles.checkoutButtonText}>
                  {planDetails.id === 'free'
                    ? 'Get Started for Free'
                    : planDetails.isLifetime 
                      ? `Get Lifetime Access - ${finalPrice}` 
                      : `Start Free Trial - ${selectedPaymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}`}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy. 
          {planDetails.id === 'free'
            ? ' No payment required. Upgrade anytime to unlock premium features.'
            : planDetails.isLifetime 
              ? ' One-time payment with lifetime access.' 
              : ' Cancel anytime during trial. Auto-renews after 14 days.'}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  planSummaryGradient: {
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.large,
  },
  planSummary: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  planName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#ffffff',
  },
  lifetimeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  lifetimeBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#ffffff',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.md,
  },
  originalPrice: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'line-through',
    marginRight: theme.spacing.sm,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: '#ffffff',
  },
  planPeriod: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  planDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  featuresContainer: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  couponSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  couponInputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  couponInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  couponIcon: {
    marginRight: theme.spacing.sm,
  },
  couponInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  applyCouponButton: {
    backgroundColor: Colors.light.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  applyCouponButtonDisabled: {
    opacity: 0.6,
  },
  applyCouponButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  appliedCouponContainer: {
    backgroundColor: Colors.light.success + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.success + '30',
    marginBottom: theme.spacing.md,
  },
  appliedCouponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.sm,
  },
  appliedCouponText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.success,
  },
  appliedCouponDescription: {
    fontSize: 14,
    color: Colors.light.success,
    opacity: 0.8,
  },
  removeCouponButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  removeCouponButtonText: {
    fontSize: 14,
    color: Colors.light.error,
    fontWeight: '600' as const,
  },
  sampleCoupons: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  sampleCouponsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.sm,
  },
  sampleCouponsList: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  sampleCouponCode: {
    backgroundColor: Colors.light.primary + '10',
    color: Colors.light.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  orderSummary: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.light.textMedium,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
  },
  summaryDiscount: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.success,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.primary,
  },
  paymentMethodSection: {
    marginBottom: theme.spacing.xl,
  },
  paymentMethodCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: Colors.light.border,
    ...theme.shadows.small,
  },
  selectedPaymentMethod: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  paymentMethodContent: {
    gap: theme.spacing.sm,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    flex: 1,
  },
  selectedPaymentMethodTitle: {
    color: Colors.light.primary,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  paymentMethodBadges: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.textMedium,
  },
  paypalIcon: {
    backgroundColor: '#0070ba',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paypalText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.success + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.light.success,
    marginBottom: 4,
  },
  securityText: {
    fontSize: 12,
    color: Colors.light.success,
    lineHeight: 16,
  },
  checkoutButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonGradient: {
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.white,
  },
  paypalButtonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  paypalButtonText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.light.white,
  },
  termsText: {
    fontSize: 12,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 18,
  },
});
