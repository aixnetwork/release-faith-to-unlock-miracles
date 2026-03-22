import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, FlatList } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff, Mail, User, Lock, ArrowRight, Award, Building2, Search, Crown, Users } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { useAffiliateStore, Referral } from '@/store/affiliateStore';
import * as Haptics from 'expo-haptics';
import { ENV } from '@/config/env';

const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (Platform.OS === 'web') {
    return `/api/proxy${cleanPath}`;
  }
  return `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}${cleanPath}`;
};

export default function RegisterScreen() {
  const { login } = useUserStore();
  const { referralCode: affiliateReferralCode, addReferral } = useAffiliateStore();
  const params = useLocalSearchParams<{ ref?: string }>();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState(params.ref || '');
  const [isValidReferral, setIsValidReferral] = useState(false);
  const [referralChecked, setReferralChecked] = useState(false);
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [organizations, setOrganizations] = useState<Array<{ id: number; name: string; city?: string }>>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<{ id: number; name: string } | null>(null);
  const [searchingOrgs, setSearchingOrgs] = useState(false);
  const [showOrgResults, setShowOrgResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('free');
  
  // Refs for input focus management
  const lastNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const referralInputRef = useRef<TextInput>(null);
  const orgSearchInputRef = useRef<TextInput>(null);

  // Validate referral code if provided in URL
  useEffect(() => {
    if (params.ref) {
      setReferralCode(params.ref);
      validateReferralCode(params.ref);
    }
  }, [params.ref]);

  // Search organizations when search text changes
  useEffect(() => {
    const searchOrganizations = async () => {
      if (!organizationSearch.trim()) {
        setOrganizations([]);
        setShowOrgResults(false);
        return;
      }

      setSearchingOrgs(true);
      setShowOrgResults(false);
      try {
        console.log('Searching organizations with query:', organizationSearch);
        const searchQuery = encodeURIComponent(organizationSearch);
        const url = getApiUrl(`/items/organizations?filter[name][_contains]=${searchQuery}&limit=10&fields=id,name,city`);
        console.log('API URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
          },
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Organizations data:', data);
          const orgs = data.data || [];
          setOrganizations(orgs);
          setShowOrgResults(true);
          console.log('Found organizations:', orgs.length);
        } else {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          setOrganizations([]);
          setShowOrgResults(true);
        }
      } catch (error) {
        console.error('Error searching organizations:', error);
        setOrganizations([]);
        setShowOrgResults(true);
      } finally {
        setSearchingOrgs(false);
      }
    };

    const debounceTimer = setTimeout(searchOrganizations, 300);
    return () => clearTimeout(debounceTimer);
  }, [organizationSearch]);

  const validateReferralCode = (code: string) => {
    // In a real app, you would check this against your backend
    // For demo purposes, we'll just check if it's not empty and not the user's own code
    if (code && code !== affiliateReferralCode) {
      setIsValidReferral(true);
    } else {
      setIsValidReferral(false);
    }
    setReferralChecked(true);
  };

  const handleRegister = async () => {
    // Basic validation
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }

    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setLoading(true);
    try {
      console.log('Starting registration process...');
      
      console.log('Checking if email already exists...');
      const checkEmailResponse = await fetch(
        getApiUrl(`/users?filter[email][_eq]=${encodeURIComponent(email.trim().toLowerCase())}&fields=id,email`),
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
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          setLoading(false);
          return;
        }
      }
      
      // Register user with Directus using admin token
      const registerResponse = await fetch(getApiUrl('/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          role: ENV.EXPO_PUBLIC_DIRECTUS_DEFAULT_ROLE_ID,
          status: 'active',
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json().catch(() => ({}));
        console.error('Registration error:', errorData);
        throw new Error(errorData.errors?.[0]?.message || 'Registration failed');
      }

      const registerData = await registerResponse.json();
      const userId = registerData.data?.id;
      console.log('Registration successful. User ID:', userId);

      if (!userId) {
        throw new Error('User ID not found in registration response');
      }

      // If organization is selected, create organization_users entry
      if (selectedOrganization) {
        console.log('Creating organization_users entry...');
        console.log('Organization ID:', selectedOrganization.id);
        console.log('User ID:', userId);
        console.log('Role ID:', ENV.EXPO_PUBLIC_DIRECTUS_USER_ROLE_ID);
        
        const orgUserResponse = await fetch(getApiUrl('/items/organization_users'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
          },
          body: JSON.stringify({
            user_id: userId,
            organization_id: selectedOrganization.id,
            role_id: ENV.EXPO_PUBLIC_DIRECTUS_USER_ROLE_ID,
          }),
        });

        if (!orgUserResponse.ok) {
          const errorData = await orgUserResponse.json().catch(() => ({}));
          console.error('Organization user creation error:', errorData);
          // Don't throw error here, user is already created
          console.warn('Failed to add user to organization, but user account was created successfully');
        } else {
          const orgUserData = await orgUserResponse.json();
          console.log('Organization user entry created:', orgUserData);
        }
      }
      
      // If there's a valid referral code, record the referral
      if (isValidReferral && referralCode) {
        addReferral({
          referredEmail: email,
          referredName: `${firstName} ${lastName}`,
          status: 'registered',
          plan: null,
          commission: 0
        });
      }
      
      // Auto-login after successful registration
      console.log('Auto-login after registration...');
      const loginResponse = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}));
        console.error('Auto-login error:', errorData);
        // Don't throw error, just show success and redirect to login
        Alert.alert(
          'Welcome to Release Faith!',
          'Your account has been created successfully. Please log in to continue.',
          [
            {
              text: 'Go to Login',
              onPress: () => {
                try {
                  router.replace('/login');
                } catch (error) {
                  console.error('Navigation error after registration:', error);
                }
              }
            }
          ]
        );
        return;
      }

      const loginData = await loginResponse.json();
      console.log('Auto-login successful:', loginData);

      const accessToken = loginData.data?.access_token;
      const refreshToken = loginData.data?.refresh_token;
      if (!accessToken) {
        throw new Error('Access token not found in login response');
      }

      // Fetch user data
      const userResponse = await fetch(getApiUrl('/users/me'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userDataResponse = await userResponse.json();
      const user = userDataResponse.data;
      console.log('User data fetched:', user);

      // Fetch organization data if organization was selected
      let organizationRole: 'admin' | 'member' | undefined;
      let plan: any = selectedPlan;
      let roleId: string | undefined;

      if (selectedOrganization) {
        const orgUserResponse = await fetch(
          getApiUrl(`/items/organization_users?filter[user_id][_eq]=${userId}&fields=*`),
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (orgUserResponse.ok) {
          const orgUserData = await orgUserResponse.json();
          console.log('Organization user data:', orgUserData);
          
          if (orgUserData.data && orgUserData.data.length > 0) {
            const orgUser = orgUserData.data[0];
            roleId = orgUser.role_id;
            organizationRole = roleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID ? 'admin' : 'member';
            
            const orgResponse = await fetch(
              getApiUrl(`/items/organizations/${selectedOrganization.id}`),
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            
            if (orgResponse.ok) {
              const orgData = await orgResponse.json();
              console.log('Organization data:', orgData);
              
              if (orgData.data) {
                const org = orgData.data;
                plan = org.plan || 'org_small';
                
                const { setOrganization } = useUserStore.getState();
                setOrganization({
                  id: org.id,
                  name: org.name,
                  city: org.city,
                  plan: org.plan,
                  memberCount: 1,
                  maxMembers: 100,
                  createdAt: org.created_at,
                  adminId: org.organizer_id,
                  status: org.status,
                  organizerId: org.organizer_id,
                });
              }
            }
          }
        }
      }

      // Login user
      const userData = {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email,
        plan: plan,
        organizationId: selectedOrganization?.id,
        organizationRole,
        roleId,
        accessToken,
        refreshToken,
      };

      login(userData);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Navigate to appropriate screen
      if (organizationRole === 'admin') {
        router.replace('/organization');
      } else {
        router.replace('/');
      }
      
      console.log('Registration and auto-login completed successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      console.error('Registration error:', err);

      if (message.includes('Unexpected token') || message.includes('HTML') || message.includes('<!DOCTYPE')) {
        if (Platform.OS === 'web') {
          Alert.alert(
            'Backend Unavailable',
            'The backend API is not reachable (returned HTML). This is common in preview environments.\n\nPlease use the "Go to Login" button and select a Demo Account to test the app.',
            [
              { 
                text: 'Go to Login', 
                onPress: () => router.replace('/login') 
              },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          return;
        }
      }

      Alert.alert('Error', message);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleCheckReferral = () => {
    if (!referralCode.trim()) {
      setIsValidReferral(false);
      setReferralChecked(true);
      return;
    }
    
    validateReferralCode(referralCode);
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleBackToLogin = () => {
    try {
      router.replace('/login');
    } catch (error) {
      console.error('Navigation to login failed:', error);
    }
  };

  const handleSelectOrganization = (org: { id: number; name: string }) => {
    setSelectedOrganization(org);
    setOrganizationSearch(org.name);
    setShowOrgResults(false);
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Create Account" }} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Join Release Faith</Text>
          <Text style={styles.subtitle}>Create an account to start your spiritual journey</Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.light.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              placeholderTextColor={Colors.light.inputPlaceholder}
              returnKeyType="next"
              onSubmitEditing={() => {
                if (lastNameInputRef.current) {
                  lastNameInputRef.current.focus();
                }
              }}
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
            />
          </View>

          <View style={styles.inputContainer}>
            <User size={20} color={Colors.light.textLight} style={styles.inputIcon} />
            <TextInput
              ref={lastNameInputRef}
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              placeholderTextColor={Colors.light.inputPlaceholder}
              returnKeyType="next"
              onSubmitEditing={() => {
                if (emailInputRef.current) {
                  emailInputRef.current.focus();
                }
              }}
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.light.textLight} style={styles.inputIcon} />
            <TextInput
              ref={emailInputRef}
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.light.inputPlaceholder}
              returnKeyType="next"
              onSubmitEditing={() => {
                if (passwordInputRef.current) {
                  passwordInputRef.current.focus();
                }
              }}
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.light.textLight} style={styles.inputIcon} />
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={Colors.light.inputPlaceholder}
              returnKeyType="next"
              onSubmitEditing={() => {
                if (confirmPasswordInputRef.current) {
                  confirmPasswordInputRef.current.focus();
                }
              }}
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
            />
            <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
              {showPassword ? (
                <EyeOff size={20} color={Colors.light.textLight} />
              ) : (
                <Eye size={20} color={Colors.light.textLight} />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.light.textLight} style={styles.inputIcon} />
            <TextInput
              ref={confirmPasswordInputRef}
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor={Colors.light.inputPlaceholder}
              returnKeyType="next"
              onSubmitEditing={() => {
                if (orgSearchInputRef.current) {
                  orgSearchInputRef.current.focus();
                }
              }}
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
            />
            <TouchableOpacity onPress={toggleShowConfirmPassword} style={styles.eyeIcon}>
              {showConfirmPassword ? (
                <EyeOff size={20} color={Colors.light.textLight} />
              ) : (
                <Eye size={20} color={Colors.light.textLight} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.organizationSection}>
            <View style={styles.organizationHeader}>
              <Building2 size={18} color={Colors.light.secondary} style={styles.organizationIcon} />
              <Text style={styles.organizationTitle}>Organization (Optional)</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Search size={20} color={Colors.light.textLight} style={styles.inputIcon} />
              <TextInput
                ref={orgSearchInputRef}
                style={styles.input}
                placeholder="Search for your organization"
                value={organizationSearch}
                onChangeText={(text) => {
                  setOrganizationSearch(text);
                  if (!text.trim()) {
                    setSelectedOrganization(null);
                  }
                }}
                placeholderTextColor={Colors.light.inputPlaceholder}
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (referralInputRef.current) {
                    referralInputRef.current.focus();
                  }
                }}
                blurOnSubmit={false}
                enablesReturnKeyAutomatically={true}
              />
              {searchingOrgs && (
                <Text style={styles.searchingText}>...</Text>
              )}
            </View>

            {showOrgResults && organizations.length > 0 && (
              <View style={styles.orgResultsContainer}>
                <FlatList
                  data={organizations}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.orgResultItem,
                        selectedOrganization?.id === item.id && styles.orgResultItemSelected
                      ]}
                      onPress={() => handleSelectOrganization(item)}
                    >
                      <Building2 size={16} color={Colors.light.tint} />
                      <View style={styles.orgResultTextContainer}>
                        <Text style={styles.orgResultName}>{item.name}</Text>
                        {item.city && (
                          <Text style={styles.orgResultCity}>{item.city}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {showOrgResults && organizations.length === 0 && organizationSearch.trim() && !searchingOrgs && (
              <Text style={styles.noResultsText}>No organizations found</Text>
            )}

            {selectedOrganization && (
              <View style={styles.selectedOrgContainer}>
                <Text style={styles.selectedOrgLabel}>Selected:</Text>
                <Text style={styles.selectedOrgName}>{selectedOrganization.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.planSection}>
            <View style={styles.planHeader}>
              <Crown size={18} color={Colors.light.secondary} style={styles.planIcon} />
              <Text style={styles.planTitle}>Select Your Plan</Text>
            </View>
            <Text style={styles.planSubtitle}>Choose a plan that fits your spiritual journey</Text>
            
            <TouchableOpacity
              style={[
                styles.planOption,
                selectedPlan === 'free' && styles.planOptionSelected
              ]}
              onPress={() => setSelectedPlan('free')}
            >
              <View style={styles.planOptionContent}>
                <Crown size={24} color={selectedPlan === 'free' ? Colors.light.primary : Colors.light.textLight} />
                <View style={styles.planOptionText}>
                  <Text style={styles.planOptionName}>Free</Text>
                  <Text style={styles.planOptionPrice}>$0/forever</Text>
                  <Text style={styles.planOptionDescription}>Basic prayer journal & community access</Text>
                </View>
              </View>
              {selectedPlan === 'free' && (
                <View style={styles.planCheckmark}>
                  <Text style={styles.planCheckmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planOption,
                selectedPlan === 'individual' && styles.planOptionSelected,
                styles.planOptionPopular
              ]}
              onPress={() => setSelectedPlan('individual')}
            >
              {selectedPlan === 'individual' && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}
              <View style={styles.planOptionContent}>
                <Crown size={24} color={selectedPlan === 'individual' ? Colors.light.primary : Colors.light.textLight} />
                <View style={styles.planOptionText}>
                  <Text style={styles.planOptionName}>Individual</Text>
                  <Text style={styles.planOptionPrice}>$9.99/month</Text>
                  <Text style={styles.planOptionDescription}>AI prayer assistant, MIRACLE templates & unlimited habits</Text>
                </View>
              </View>
              {selectedPlan === 'individual' && (
                <View style={styles.planCheckmark}>
                  <Text style={styles.planCheckmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planOption,
                selectedPlan === 'group_family' && styles.planOptionSelected
              ]}
              onPress={() => setSelectedPlan('group_family')}
            >
              <View style={styles.planOptionContent}>
                <Users size={24} color={selectedPlan === 'group_family' ? Colors.light.secondary : Colors.light.textLight} />
                <View style={styles.planOptionText}>
                  <Text style={styles.planOptionName}>Group/Family</Text>
                  <Text style={styles.planOptionPrice}>$24.99/month</Text>
                  <Text style={styles.planOptionDescription}>Up to 10 users, shared prayer boards & meetings</Text>
                </View>
              </View>
              {selectedPlan === 'group_family' && (
                <View style={styles.planCheckmark}>
                  <Text style={styles.planCheckmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.planNote}>
              💡 You can upgrade or downgrade anytime after registration
            </Text>
            
            <View style={styles.churchNote}>
              <Building2 size={16} color={Colors.light.primary} />
              <Text style={styles.churchNoteText}>
                Looking for a church plan?{' '}
                <Text 
                  style={styles.churchNoteLink}
                  onPress={() => router.push('/register-org')}
                >
                  Register as a Church →
                </Text>
              </Text>
            </View>
          </View>
          
          <View style={styles.referralSection}>
            <View style={styles.referralHeader}>
              <Award size={18} color={Colors.light.secondary} style={styles.referralIcon} />
              <Text style={styles.referralTitle}>Have a referral code?</Text>
            </View>
            
            <View style={styles.referralInputContainer}>
              <TextInput
                ref={referralInputRef}
                style={styles.referralInput}
                placeholder="Enter referral code (optional)"
                value={referralCode}
                onChangeText={setReferralCode}
                autoCapitalize="characters"
                placeholderTextColor={Colors.light.inputPlaceholder}
                returnKeyType="done"
                onSubmitEditing={() => {
                  // If all required fields are filled, submit the form
                  if (firstName.trim() && lastName.trim() && email.trim() && password && password === confirmPassword) {
                    handleRegister();
                  }
                }}
                blurOnSubmit={true}
                enablesReturnKeyAutomatically={true}
              />
              <TouchableOpacity 
                style={styles.checkButton}
                onPress={handleCheckReferral}
              >
                <Text style={styles.checkButtonText}>Check</Text>
              </TouchableOpacity>
            </View>
            
            {referralChecked && (
              <Text style={[
                styles.referralStatus,
                { color: isValidReferral ? Colors.light.success : Colors.light.error }
              ]}>
                {isValidReferral 
                  ? "Valid referral code! You'll get 20% off your first month." 
                  : referralCode.trim() 
                    ? "Invalid referral code. Please check and try again." 
                    : "No referral code entered."}
              </Text>
            )}
          </View>
          
          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
            icon={<ArrowRight size={20} color={Colors.light.white} />}
            accessibilityLabel="Create a new account"
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={handleBackToLogin} style={styles.loginLinkButton}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
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
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl + 80, // Extra space for bottom navigation
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    fontSize: 28,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    color: Colors.light.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.xl,
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
    padding: theme.spacing.sm,
  },
  referralSection: {
    marginBottom: theme.spacing.lg,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  referralIcon: {
    marginRight: theme.spacing.xs,
  },
  referralTitle: {
    ...theme.typography.body,
    fontWeight: '500',
    color: Colors.light.textPrimary,
  },
  referralInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  referralInput: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.light.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    ...theme.typography.body,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    ...theme.shadows.small,
    color: Colors.light.inputText,
  },
  checkButton: {
    backgroundColor: Colors.light.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
  },
  checkButtonText: {
    ...theme.typography.body,
    color: Colors.light.white,
    fontWeight: '500',
  },
  referralStatus: {
    ...theme.typography.caption,
    marginTop: 4,
  },
  registerButton: {
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  footerText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    fontSize: 15,
  },
  loginLinkButton: {
    marginLeft: theme.spacing.xs,
  },
  loginLink: {
    ...theme.typography.body,
    color: Colors.light.primary,
    fontWeight: '700' as const,
    fontSize: 15,
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    textAlign: 'center',
  },
  termsLink: {
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  organizationSection: {
    marginBottom: theme.spacing.lg,
  },
  organizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  organizationIcon: {
    marginRight: theme.spacing.xs,
  },
  organizationTitle: {
    ...theme.typography.body,
    fontWeight: '500',
    color: Colors.light.textPrimary,
  },
  searchingText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginRight: theme.spacing.sm,
  },
  orgResultsContainer: {
    backgroundColor: Colors.light.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    marginTop: theme.spacing.xs,
    maxHeight: 200,
    ...theme.shadows.small,
  },
  orgResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.inputBorder,
    gap: theme.spacing.sm,
  },
  orgResultItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  orgResultTextContainer: {
    flex: 1,
  },
  orgResultName: {
    ...theme.typography.body,
    fontWeight: '500',
    color: Colors.light.textPrimary,
  },
  orgResultCity: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  noResultsText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  selectedOrgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: '#E8F5E9',
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  selectedOrgLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    fontWeight: '500',
  },
  selectedOrgName: {
    ...theme.typography.caption,
    color: Colors.light.success,
    fontWeight: '600',
  },
  planSection: {
    marginBottom: theme.spacing.lg,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  planIcon: {
    marginRight: theme.spacing.xs,
  },
  planTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    fontSize: 16,
  },
  planSubtitle: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginBottom: theme.spacing.md,
  },
  planOption: {
    backgroundColor: Colors.light.inputBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: Colors.light.inputBorder,
    position: 'relative',
  },
  planOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  planOptionPopular: {
    position: 'relative',
  },
  planOptionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  planOptionText: {
    flex: 1,
  },
  planOptionName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    fontSize: 16,
  },
  planOptionPrice: {
    ...theme.typography.body,
    color: Colors.light.primary,
    fontWeight: '700',
    fontSize: 14,
    marginTop: 2,
  },
  planOptionDescription: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginTop: 4,
    lineHeight: 16,
  },
  planCheckmark: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCheckmarkText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: '700',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: theme.spacing.md,
    backgroundColor: Colors.light.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.white,
  },
  planNote: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  churchNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '10',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  churchNoteText: {
    fontSize: 13,
    color: Colors.light.textPrimary,
    flex: 1,
  },
  churchNoteLink: {
    color: Colors.light.primary,
    fontWeight: '700' as const,
  },
});