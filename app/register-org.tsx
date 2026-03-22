import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore, PlanType } from '@/store/userStore';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff, Mail, User, Lock, Building, Check, Crown } from 'lucide-react-native';
import { ENV } from '@/config/env';
import { resilientFetch, getApiUrl, directusHeaders } from '@/utils/resilientFetch';

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  period: string;
  maxMembers: number;
}

export default function RegisterOrgScreen() {
  const { login, createOrganization } = useUserStore();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plans, setPlans] = useState<PlanDetails[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    orgName: '',
    city: ''
  });

  useEffect(() => {
    void fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await resilientFetch(getApiUrl('/items/plans'), {
        method: 'GET',
        headers: directusHeaders(),
      });

      const data = await response.json();
      console.log('Plans fetched:', data);

      if (data.data && Array.isArray(data.data)) {
        const formattedPlans: PlanDetails[] = data.data
          .filter((plan: any) => {
            const price = typeof plan.price === 'string' ? parseFloat(plan.price) : (typeof plan.price === 'number' ? plan.price : 0);
            return (
              (plan.id === 'small_church' || plan.id === 'large_church') &&
              price !== 20
            );
          })
          .map((plan: any) => {
            let priceValue = 0;
            if (typeof plan.price === 'string') {
              priceValue = parseFloat(plan.price);
            } else if (typeof plan.price === 'number') {
              priceValue = plan.price;
            }
            return {
              id: plan.id,
              name: plan.name || '',
              price: priceValue,
              period: plan.period || 'month',
              maxMembers: plan.maxMembers || 0,
            };
          });
        
        if (formattedPlans.length === 0) {
          const defaultPlans: PlanDetails[] = [
            {
              id: 'small_church',
              name: 'Small Church',
              price: 149,
              period: 'month',
              maxMembers: 250,
            },
            {
              id: 'large_church',
              name: 'Large Church',
              price: 499,
              period: 'month',
              maxMembers: 999999,
            },
          ];
          setPlans(defaultPlans);
          setSelectedPlan(defaultPlans[0]);
        } else {
          setPlans(formattedPlans);
          if (formattedPlans.length > 0) {
            setSelectedPlan(formattedPlans[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      const defaultPlans: PlanDetails[] = [
        {
          id: 'small_church',
          name: 'Small Church',
          price: 149,
          period: 'month',
          maxMembers: 250,
        },
        {
          id: 'large_church',
          name: 'Large Church',
          price: 499,
          period: 'month',
          maxMembers: 999999,
        },
      ];
      setPlans(defaultPlans);
      setSelectedPlan(defaultPlans[0]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      orgName: '',
      city: ''
    };

    // Validate first name
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Validate last name
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Validate organization name
    if (!orgName.trim()) {
      newErrors.orgName = 'Organization name is required';
      isValid = false;
    }

    // Validate city
    if (!city.trim()) {
      newErrors.city = 'City is required';
      isValid = false;
    }

    // Validate plan selection
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a plan');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setLoading(true);
	
    try {
      console.log('Checking if email already exists...');
      const checkEmailResponse = await fetch(
        getApiUrl(`/users?filter[email][_eq]=${encodeURIComponent(email.toLowerCase())}&fields=id,email`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
          },
        }
      );

      if (checkEmailResponse.ok) {
        const checkData = await checkEmailResponse.json();
        if (checkData.data && checkData.data.length > 0) {
          Alert.alert(
            'Email Already Registered',
            'This email address is already associated with an account. Please use a different email or try logging in.',
            [
              {
                text: 'Try Another Email',
                style: 'cancel',
              },
              {
                text: 'Go to Login',
                onPress: () => router.push('/login'),
              },
            ]
          );
          if (Platform.OS !== 'web') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          setLoading(false);
          return;
        }
      }
      const requestBody = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase(),
        password,
        role: ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID,
      };
      
      console.log('Creating user with data:', requestBody);
      console.log('API URL:', getApiUrl('/users'));
      
      const response = await fetch(getApiUrl('/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
      
      const responseText = await response.text();
      console.log('Response body:', responseText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || 'Failed to create user account' };
        }
        console.error('Error creating user:', errorData);
        throw new Error(errorData.errors?.[0]?.message || errorData.message || 'Failed to create user account');
      }

      let userData;
      try {
        userData = JSON.parse(responseText);
      } catch {
        console.error('Failed to parse user data');
        throw new Error('Invalid response from server');
      }
      
      console.log('User created successfully:', userData);

      const userId = userData.data?.id;
      if (!userId) {
        throw new Error('User ID not found in response');
      }

      const orgResponse = await fetch(getApiUrl('/items/organizations'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify({
          name: orgName.trim(),
          city: city.trim(),
          organizer_id: userId,
          plan: selectedPlan?.id || '',
          status: 'pending',
          created_at: new Date().toISOString(),
        }),
      });

      if (!orgResponse.ok) {
        const errorData = await orgResponse.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.message || 'Failed to create organization');
      }

      const orgData = await orgResponse.json();
      console.log('Organization created successfully:', orgData);

      const organizationId = orgData.data?.id;
      if (!organizationId) {
        throw new Error('Organization ID not found in response');
      }

      console.log('Creating organization_users entry...');
      console.log('User ID:', userId);
      console.log('Organization ID:', organizationId);
      console.log('Role ID:', ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID);
      
      const orgUserResponse = await fetch(getApiUrl('/items/organization_users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify({
          organization_id: parseInt(organizationId.toString(), 10),
          user_id: userId,
          role_id: ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID,
          status: 'active',
        }),
      });

      const orgUserResponseText = await orgUserResponse.text();
      console.log('Organization user response status:', orgUserResponse.status);
      console.log('Organization user response body:', orgUserResponseText);
      
      if (!orgUserResponse.ok) {
        let errorData;
        try {
          errorData = JSON.parse(orgUserResponseText);
        } catch {
          errorData = { message: orgUserResponseText };
        }
        console.error('Failed to create organization_users entry:', errorData);
        throw new Error(errorData.errors?.[0]?.message || errorData.message || 'Failed to link user to organization');
      }

      let orgUserData;
      try {
        orgUserData = JSON.parse(orgUserResponseText);
      } catch {
        console.error('Failed to parse organization user data');
        throw new Error('Invalid response from server');
      }
      console.log('Organization user link created successfully:', orgUserData);

      if (!selectedPlan) {
        throw new Error('No plan selected');
      }

      let planPrice = 0;
      if (typeof selectedPlan.price === 'string') {
        planPrice = parseFloat(selectedPlan.price);
      } else if (typeof selectedPlan.price === 'number') {
        planPrice = selectedPlan.price;
      }
      console.log('Plan price:', planPrice, 'Type:', typeof planPrice);

      if (planPrice === 0) {
        console.log('Free plan selected, creating subscription record...');
        
        const startDate = new Date();
        const endDate = new Date('2037-12-31T23:59:59');
        
        const subscriptionData = {
          organization_id: parseInt(organizationId.toString(), 10),
          plan_id: parseInt(selectedPlan.id, 10),
          user_id: userId,
          start_end: startDate.toISOString().slice(0, 19).replace('T', ' '),
          end_date: endDate.toISOString().slice(0, 19).replace('T', ' '),
          is_active: 1,
          payment_status: 'completed',
          payment_method: 'free',
          status: 'published',
        };

        console.log('Creating subscription with data:', subscriptionData);

        const subscriptionResponse = await fetch(
          getApiUrl('/items/organization_subscriptions'),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            },
            body: JSON.stringify(subscriptionData),
          }
        );

        const subscriptionResponseText = await subscriptionResponse.text();
        console.log('Subscription response status:', subscriptionResponse.status);
        console.log('Subscription response body:', subscriptionResponseText);

        if (!subscriptionResponse.ok) {
          let errorData;
          try {
            errorData = JSON.parse(subscriptionResponseText);
          } catch {
            errorData = { message: subscriptionResponseText };
          }
          console.error('Failed to create subscription:', errorData);
          throw new Error(
            errorData.errors?.[0]?.message ||
              errorData.message ||
              'Failed to create subscription'
          );
        }

        console.log('Subscription created successfully');
        
        console.log('Free plan selected, logging in user...');
        const loginResponse = await fetch(getApiUrl('/auth/login'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.toLowerCase(),
            password,
          }),
        });

        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok) {
          throw new Error(loginData.errors?.[0]?.message || 'Failed to login after registration');
        }

        console.log('Login successful:', loginData);
        const accessToken = loginData.data?.access_token;
        const refreshToken = loginData.data?.refresh_token;
        if (!accessToken) {
          throw new Error('Access token not received');
        }

        login({
          id: userId,
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: email.toLowerCase(),
          plan: selectedPlan.id as PlanType,
          organizationId: organizationId,
          organizationRole: 'admin',
          roleId: ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID,
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
        
        createOrganization(
          orgName, 
          selectedPlan.id as 'org_small' | 'org_medium' | 'org_large'
        );
        
        if (Platform.OS !== 'web') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        console.log('Free plan registration complete, navigating to home...');
        router.replace('/');
      } else {
        console.log('Paid plan selected, redirecting to checkout...');
        router.push({
          pathname: '/checkout',
          params: { 
            plan: selectedPlan.id,
            priceId: selectedPlan.id,
            userId: userId,
            organizationId: orgData.data?.id
          }
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An error occurred during registration. Please try again.'
      );
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handlePlanSelect = (plan: PlanDetails) => {
    setSelectedPlan(plan);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  };

  if (loadingPlans) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ title: "Create Organization" }} />
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading plans...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: "Create Organization" }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Create Your Organization</Text>
        <Text style={styles.subtitle}>
          Choose a church plan and set up your organization account
        </Text>
        <View style={styles.planNote}>
          <Crown size={16} color={Colors.light.primary} />
          <Text style={styles.planNoteText}>
            Looking for individual or family plans?{' '}
            <Text 
              style={styles.planNoteLink}
              onPress={() => router.push('/register')}
            >
              Register as Individual/Family →
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Your Information</Text>
        
        <View style={styles.inputContainer}>
          <User size={20} color={Colors.light.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoCorrect={false}
            placeholderTextColor={Colors.light.inputPlaceholder}
          />
        </View>
        {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}

        <View style={styles.inputContainer}>
          <User size={20} color={Colors.light.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            autoCorrect={false}
            placeholderTextColor={Colors.light.inputPlaceholder}
          />
        </View>
        {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}

        <View style={styles.inputContainer}>
          <Mail size={20} color={Colors.light.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Admin Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={Colors.light.inputPlaceholder}
          />
        </View>
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <View style={styles.inputContainer}>
          <Lock size={20} color={Colors.light.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={Colors.light.inputPlaceholder}
          />
          <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
            {showPassword ? (
              <EyeOff size={20} color={Colors.light.textLight} />
            ) : (
              <Eye size={20} color={Colors.light.textLight} />
            )}
          </TouchableOpacity>
        </View>
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <View style={styles.inputContainer}>
          <Lock size={20} color={Colors.light.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={Colors.light.inputPlaceholder}
          />
        </View>
        {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

        <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>Organization Information</Text>
        
        <View style={styles.inputContainer}>
          <Building size={20} color={Colors.light.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Organization Name"
            value={orgName}
            onChangeText={setOrgName}
            autoCapitalize="words"
            autoCorrect={false}
            placeholderTextColor={Colors.light.inputPlaceholder}
          />
        </View>
        {errors.orgName ? <Text style={styles.errorText}>{errors.orgName}</Text> : null}

        <View style={styles.inputContainer}>
          <Building size={20} color={Colors.light.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
            autoCorrect={false}
            placeholderTextColor={Colors.light.inputPlaceholder}
          />
        </View>
        {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

        <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>Select a Plan</Text>
        
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan?.id === plan.id && styles.planCardSelected
              ]}
              onPress={() => handlePlanSelect(plan)}
            >
              <View style={styles.planCardContent}>
                <View style={styles.planCardLeft}>
                  <Text style={[
                    styles.planCardTitle,
                    selectedPlan?.id === plan.id && styles.planCardTitleSelected
                  ]}>
                    {plan.name}
                  </Text>
                  <Text style={styles.planCardMembers}>
                    {plan.maxMembers >= 999999 ? 'Unlimited members' : `Up to ${plan.maxMembers} members`}
                  </Text>
                </View>
                <View style={styles.planCardRight}>
                  <View style={styles.planCardPriceContainer}>
                    <Text style={[
                      styles.planCardPrice,
                      selectedPlan?.id === plan.id && styles.planCardPriceSelected
                    ]}>
                      {plan.price === 0 ? 'Free' : `${plan.price.toFixed(0)}`}
                    </Text>
                    {plan.price > 0 && (
                      <Text style={styles.planCardPeriod}>/{plan.period}</Text>
                    )}
                  </View>
                  {selectedPlan?.id === plan.id && (
                    <Check size={24} color={Colors.light.primary} style={styles.checkIcon} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={selectedPlan?.price === 0 ? 'Create Free Organization' : `Continue with ${selectedPlan?.name || 'Selected Plan'}`}
          onPress={handleRegister}
          loading={loading}
          disabled={loading || !selectedPlan}
          style={styles.button}
        />

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By creating an organization, you agree to our{' '}
            <Text style={styles.termsLink} onPress={() => Alert.alert('Terms', 'Terms of Service would be displayed here.')}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={styles.termsLink} onPress={() => Alert.alert('Privacy', 'Privacy Policy would be displayed here.')}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/login')} style={styles.footerLinkButton}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  loadingText: {
    marginTop: theme.spacing.md,
    ...theme.typography.body,
    color: Colors.light.textMedium,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.inputBackground,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    ...theme.shadows.small,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    ...theme.typography.body,
    color: Colors.light.inputText,
  },
  eyeIcon: {
    padding: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.caption,
    color: Colors.light.error,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  plansContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  planCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
    ...theme.shadows.small,
  },
  planCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  planCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planCardLeft: {
    flex: 1,
  },
  planCardTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    fontWeight: '700' as const,
    fontSize: 18,
    marginBottom: theme.spacing.xs,
  },
  planCardTitleSelected: {
    color: Colors.light.primary,
  },
  planCardMembers: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    fontSize: 14,
  },
  planCardRight: {
    alignItems: 'flex-end',
  },
  planCardPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.xs,
  },
  planCardPrice: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.light.textPrimary,
  },
  planCardPriceSelected: {
    color: Colors.light.primary,
  },
  planCardPeriod: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    marginLeft: 4,
    fontSize: 14,
  },
  checkIcon: {
    marginTop: theme.spacing.xs,
  },
  button: {
    marginTop: theme.spacing.md,
  },
  termsContainer: {
    marginTop: theme.spacing.md,
  },
  termsText: {
    ...theme.typography.caption,
    textAlign: 'center',
    color: Colors.light.textLight,
  },
  termsLink: {
    fontWeight: '600',
    color: Colors.light.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    fontSize: 15,
  },
  footerLinkButton: {
    marginLeft: theme.spacing.xs,
  },
  footerLink: {
    ...theme.typography.body,
    fontWeight: '700' as const,
    color: Colors.light.primary,
    fontSize: 15,
  },
  planNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '10',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  planNoteText: {
    fontSize: 13,
    color: Colors.light.textPrimary,
    flex: 1,
  },
  planNoteLink: {
    color: Colors.light.primary,
    fontWeight: '700' as const,
  },
});