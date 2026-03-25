import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useSegments } from 'expo-router';
import { Button } from '@/components/Button';
import { Mail, Lock, Eye, EyeOff, Shield, Smartphone, User, Users, Church, CheckCircle, ArrowRight, Zap } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore, PlanType } from '@/store/userStore';
import { useAdminStore } from '@/store/adminStore';
import * as Haptics from 'expo-haptics';

import { ENV } from '@/config/env';
import { getDirectusApiUrl } from '@/utils/api';

interface DemoAccountConfig {
  type: 'individual' | 'family' | 'church';
  email: string;
  password: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    plan: PlanType;
    organizationId?: number;
    organizationRole?: 'admin' | 'member';
    roleId?: string;
  };
  organization?: {
    id: number;
    name: string;
    city: string;
    plan: string;
    organizer_id: string;
    status: string;
    maxMembers: number;
  };
  prayerStreak: {
    currentStreak: number;
    longestStreak: number;
    lastPrayerDate: string;
    streakStartDate: string;
  };
  totalPoints: number;
  level: number;
  redirect: string;
}

const DEMO_ACCOUNTS: DemoAccountConfig[] = [
  {
    type: 'individual',
    email: 'john.doe@example.com',
    password: 'demo123',
    user: {
      id: 'demo-user-individual-001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      plan: 'individual',
    },
    prayerStreak: {
      currentStreak: 7,
      longestStreak: 21,
      lastPrayerDate: new Date().toDateString(),
      streakStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toDateString(),
    },
    totalPoints: 450,
    level: 3,
    redirect: '/',
  },
  {
    type: 'family',
    email: 'family.leader@example.com',
    password: 'demo123',
    user: {
      id: 'demo-user-family-001',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'family.leader@example.com',
      plan: 'group_family',
      organizationId: 888,
      organizationRole: 'admin',
      roleId: '92a14da6-a457-4634-869f-76e152d5b3aa',
    },
    organization: {
      id: 888,
      name: 'Johnson Family',
      city: 'Austin',
      plan: 'group_family',
      organizer_id: 'demo-user-family-001',
      status: 'active',
      maxMembers: 10,
    },
    prayerStreak: {
      currentStreak: 14,
      longestStreak: 30,
      lastPrayerDate: new Date().toDateString(),
      streakStartDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toDateString(),
    },
    totalPoints: 1250,
    level: 5,
    redirect: '/family',
  },
  {
    type: 'church',
    email: 'admin@gracechurch.com',
    password: 'demo123',
    user: {
      id: 'demo-user-church-001',
      first_name: 'Pastor',
      last_name: 'Michael',
      email: 'admin@gracechurch.com',
      plan: 'large_church',
      organizationId: 999,
      organizationRole: 'admin',
      roleId: '92a14da6-a457-4634-869f-76e152d5b3aa',
    },
    organization: {
      id: 999,
      name: 'Grace Community Church',
      city: 'Austin',
      plan: 'large_church',
      organizer_id: 'demo-user-church-001',
      status: 'active',
      maxMembers: 999999,
    },
    prayerStreak: {
      currentStreak: 45,
      longestStreak: 90,
      lastPrayerDate: new Date().toDateString(),
      streakStartDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toDateString(),
    },
    totalPoints: 5200,
    level: 12,
    redirect: '/organization',
  },
];



export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [showSMSVerification, setShowSMSVerification] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsError, setSmsError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);
  const [_selectedAccountType, _setSelectedAccountType] = useState<'individual' | 'family' | 'church' | null>(null);
  const [demoLoginLoading, setDemoLoginLoading] = useState<string | null>(null);
  
  // Refs for input focus management
  const passwordInputRef = useRef<TextInput>(null);
  
  const { login, isLoggedIn } = useUserStore();
  const { isAdmin } = useAdminStore();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  // Only check authentication once on mount to prevent loops
  useEffect(() => {
    const checkInitialAuth = () => {
      const currentIsLoggedIn = isLoggedIn;
      const adminStatus = isAdmin();
      
      const isOnLoginPage = segments[segments.length - 1] === 'login';
      
      if (isOnLoginPage) {
        if (currentIsLoggedIn) {
          router.replace('/');
        } else if (adminStatus) {
          router.replace('/admin');
        }
      }
      
      setHasCheckedAuth(true);
    };

    const timer = setTimeout(checkInitialAuth, 100);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isAdmin, segments]);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const demoEmails = ['john.doe@example.com', 'family.leader@example.com', 'admin@gracechurch.com', 'family@gmail.com', 'church@gmail.com', 'admin@admin.com', 'test@test.com'];
      const normalizedEmail = email.toLowerCase().trim();
      const isDemoAccount = demoEmails.includes(normalizedEmail) || 
                           normalizedEmail.endsWith('@example.com') || 
                           normalizedEmail.endsWith('@test.com') ||
                           normalizedEmail.includes('demo');

      if (isDemoAccount) {
        console.log('🎭 Using client-side demo login for:', email);
          
        // Validate credentials locally
        const isFamilyCustom = normalizedEmail === 'family@gmail.com';
        const isChurchCustom = normalizedEmail === 'church@gmail.com';
        const isDynamicDemo = normalizedEmail.endsWith('@example.com') || normalizedEmail.endsWith('@test.com');
          
        const isValidPassword = (isFamilyCustom || isChurchCustom)
          ? password === 'Prosper$18' 
          : (password === 'demo123' || (isDynamicDemo && password.length > 0));

        if (!isValidPassword) {
          throw new Error('Invalid credentials');
        }

        const timestamp = Date.now();
        const accessToken = `demo-token-${timestamp}`;
        const refreshToken = `demo-refresh-${timestamp}`;

        let user: any = {
          id: `demo-user-${normalizedEmail.replace(/[^a-z0-9]/g, '-')}`,
          first_name: 'Demo',
          last_name: 'User',
          email: normalizedEmail,
          plan: 'individual',
        };

        let organization = null;

        if (normalizedEmail === 'family.leader@example.com') {
          user = {
            id: 'demo-user-family-001',
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: normalizedEmail,
            plan: 'group_family',
            organizationId: 888,
            organizationRole: 'admin',
            roleId: '92a14da6-a457-4634-869f-76e152d5b3aa',
          };
          organization = {
            id: 888,
            name: 'Johnson Family',
            city: 'Austin',
            plan: 'group_family',
            created_at: new Date().toISOString(),
            organizer_id: 'demo-user-family-001',
            status: 'active',
          };
        } else if (normalizedEmail === 'admin@gracechurch.com') {
          user = {
            id: 'demo-user-church-001',
            first_name: 'Pastor',
            last_name: 'Michael',
            email: normalizedEmail,
            plan: 'large_church',
            organizationId: 999,
            organizationRole: 'admin',
            roleId: '92a14da6-a457-4634-869f-76e152d5b3aa',
          };
          organization = {
            id: 999,
            name: 'Grace Community Church',
            city: 'Austin',
            plan: 'large_church',
            created_at: new Date().toISOString(),
            organizer_id: 'demo-user-church-001',
            status: 'active',
          };
        } else if (normalizedEmail === 'family@gmail.com') {
          user = {
            id: 'demo-user-family-custom',
            first_name: 'Prosper',
            last_name: 'Family',
            email: normalizedEmail,
            plan: 'group_family',
            organizationId: 889,
            organizationRole: 'admin',
            roleId: '92a14da6-a457-4634-869f-76e152d5b3aa',
          };
          organization = {
            id: 889,
            name: 'Prosper Family',
            city: 'Austin',
            plan: 'group_family',
            created_at: new Date().toISOString(),
            organizer_id: 'demo-user-family-custom',
            status: 'active',
          };
        } else if (normalizedEmail === 'church@gmail.com') {
          user = {
            id: 'demo-user-church-custom',
            first_name: 'Church',
            last_name: 'Admin',
            email: normalizedEmail,
            plan: 'org_large',
            organizationId: 900,
            organizationRole: 'admin',
            roleId: '92a14da6-a457-4634-869f-76e152d5b3aa',
          };
          organization = {
            id: 900,
            name: 'Prosper Church',
            city: 'Austin',
            plan: 'org_large',
            created_at: new Date().toISOString(),
            organizer_id: 'demo-user-church-custom',
            status: 'active',
          };
        } else if (isDynamicDemo && !['john.doe@example.com'].includes(normalizedEmail)) {
          const nameParts = normalizedEmail.split('@')[0].split('.');
          user = {
            id: `demo-user-${normalizedEmail.replace(/[^a-z0-9]/g, '-')}`,
            first_name: nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Demo',
            last_name: nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'User',
            email: normalizedEmail,
            plan: 'individual',
          };
        }

        const userData = {
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
          email: user.email,
          plan: user.plan as any,
          organizationId: user.organizationId,
          organizationRole: user.organizationRole,
          roleId: user.roleId,
          accessToken,
          refreshToken,
        };

        login(userData);

        if (organization) {
          const { setOrganization } = useUserStore.getState();
          setOrganization({
            id: organization.id,
            name: organization.name,
            city: organization.city,
            plan: organization.plan as any,
            memberCount: 1,
            maxMembers: organization.plan === 'small_church' ? 250 : 999999,
            createdAt: organization.created_at,
            adminId: organization.organizer_id,
            status: organization.status,
            organizerId: organization.organizer_id,
          });
        }

        if (Platform.OS !== 'web') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        if (user.organizationRole === 'admin') {
          if (user.plan === 'group_family') {
             router.replace('/family');
          } else {
             router.replace('/organization');
          }
        } else {
          router.replace('/');
        }
        return;
      }

      const directusApiUrl = getDirectusApiUrl();
      const loginUrl = `${directusApiUrl}/auth/login`;
      console.log('🔐 Attempting Directus login to:', loginUrl);

      let loginResponse;
      try {
        loginResponse = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            password,
          }),
        });
      } catch (fetchError) {
        console.error('Network fetch error:', fetchError);
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }

      if (!loginResponse.ok) {
        // Safely try to parse JSON error response
        let errorData: any = {};
        try {
          const contentType = loginResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await loginResponse.json();
          } else {
            // If not JSON, it might be HTML or text
            const text = await loginResponse.text();
            console.error('Login failed with non-JSON response:', text.substring(0, 200));
            if (text.includes('<!DOCTYPE') || text.includes('<html')) {
               throw new Error('Server returned an HTML error page instead of JSON.');
            }
          }
        } catch {
          // Ignore parsing errors
        }

        console.error('Login failed - Status:', loginResponse.status);
        console.error('Login failed - Error data:', JSON.stringify(errorData, null, 2));
        
        let errorMessage = 'Invalid email or password';
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].message;
        }
        
        if (loginResponse.status === 401) {
          errorMessage = 'Invalid credentials. Please check your email and password.';
          
          // Check if we should suggest demo login or force it
          const isLikelyDemo = email.includes('admin') || email.includes('test') || email.includes('demo') || email.includes('family');
          if (isLikelyDemo && (password === 'demo123' || password === '123456' || password === 'password')) {
            console.log('🔄 401 received for likely demo account, falling back to local demo login...');
            
            // Generate mock user data on the fly
             const userData = {
              id: `demo-fallback-${Date.now()}`,
              name: 'Demo User',
              email: email,
              plan: 'premium' as any,
              accessToken: `demo-token-${Date.now()}`,
              refreshToken: `demo-refresh-${Date.now()}`,
            };

            login(userData);
            if (Platform.OS !== 'web') {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            router.replace('/');
            return;
          }
        } else if (loginResponse.status === 404) {
          errorMessage = 'Account not found. Please register first.';
        }
        
        throw new Error(errorMessage);
      }

      // Check for successful response but with HTML content (common proxy/gateway error)
      const contentType = loginResponse.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
         const text = await loginResponse.text();
         if (text.trim().startsWith('<')) {
           console.error('Login received HTML 200 OK response:', text.substring(0, 200));
           
           if (Platform.OS === 'web') {
              const errorMessage = 'Server API unavailable (returned HTML). Please use the "Quick Demo Access" buttons below to test the app.';
              
              // Show a helpful alert for web users
              if (Platform.OS === 'web') {
                if (confirm('The backend API is not reachable (returned HTML). This is common in preview environments.\n\nWould you like to switch to a Demo Account to test the app?')) {
                   setEmail('john.doe@example.com');
                   setPassword('demo123');
                   // Small delay to allow state update then trigger login
                   setTimeout(() => {
                     const btn = document.querySelector('[aria-label="Sign in button"]') as HTMLButtonElement;
                     if (btn) btn.click();
                   }, 100);
                }
              }
              
              throw new Error(errorMessage);
           }
           
           throw new Error('Server configuration error: Received HTML instead of JSON. API Routes might not be configured correctly.');
         }
      }

      const loginData = await loginResponse.json();
      console.log('Login successful:', loginData);

      const accessToken = loginData.data?.access_token;
      const refreshToken = loginData.data?.refresh_token;
      if (!accessToken) {
        throw new Error('Access token not found in response');
      }

      let userResponse;
      try {
        userResponse = await fetch(`${getDirectusApiUrl()}/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (fetchError) {
        console.error('Network fetch error getting user:', fetchError);
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      // Safely handle user response
      const userContentType = userResponse.headers.get('content-type');
      if (userContentType && !userContentType.includes('application/json')) {
         throw new Error('Server returned invalid data format for user profile.');
      }

      const userDataResponse = await userResponse.json();
      const user = userDataResponse.data;
      console.log('User data:', user);

      let orgUserResponse;
      try {
        orgUserResponse = await fetch(
          `${getDirectusApiUrl()}/items/organization_users?filter[user_id][_eq]=${user.id}&fields=*`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      } catch (fetchError) {
        console.error('Network fetch error getting org:', fetchError);
        orgUserResponse = { ok: false } as Response;
      }

      let organizationId: number | undefined;
      let organizationRole: 'admin' | 'member' | undefined;
      let plan: any = 'individual';
      let roleId: string | undefined;

      if (orgUserResponse.ok) {
        const orgUserData = await orgUserResponse.json();
        console.log('Organization user data:', orgUserData);
        
        if (orgUserData.data && orgUserData.data.length > 0) {
          const orgUser = orgUserData.data[0];
          organizationId = orgUser.organization_id;
          roleId = orgUser.role_id;
          
          console.log('Organization user found:', orgUser);
          console.log('Role ID:', roleId);
          console.log('Expected organizer role ID:', ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID);
          
          organizationRole = roleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID ? 'admin' : 'member';
          
          let orgResponse;
          try {
            orgResponse = await fetch(
              `${getDirectusApiUrl()}/items/organizations/${organizationId}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
          } catch (fetchError) {
            console.error('Network fetch error getting org details:', fetchError);
            orgResponse = { ok: false } as Response;
          }
          
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

      const userData = {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email,
        plan: plan,
        organizationId,
        organizationRole,
        roleId,
        accessToken,
        refreshToken,
      };

      login(userData);

      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (organizationRole === 'admin') {
        if (plan === 'group_family') {
           router.replace('/family');
        } else {
           router.replace('/organization');
        }
      } else {
        router.replace('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      console.error('Login error:', err);
      
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendSMSCode = async () => {
    if (!phoneNumber.trim()) {
      setSmsError('Phone number is required');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s-()]/g, ''))) {
      setSmsError('Please enter a valid phone number');
      return;
    }

    setSmsLoading(true);
    setSmsError('');

    try {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);

      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, you would send the SMS via your backend
      console.log(`SMS Code sent to ${phoneNumber}: ${code}`);
      
      Alert.alert(
        'SMS Sent',
        `Verification code sent to ${phoneNumber}\n\nFor demo purposes, the code is: ${code}`,
        [{ text: 'OK' }]
      );

      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      setSmsError('Failed to send SMS. Please try again.');
      console.error('SMS send error:', err);
      
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setSmsLoading(false);
    }
  };

  const verifySMSCode = async () => {
    if (!smsCode.trim()) {
      setSmsError('Verification code is required');
      return;
    }

    if (smsCode !== generatedCode) {
      setSmsError('Invalid verification code. Please try again.');
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    setSmsLoading(true);
    setSmsError('');

    try {
      // Mock user data based on email
      const userData = {
        name: email.includes('admin') ? 'Admin User' : 'John Doe',
        email: email,
        plan: email.includes('org') ? 'org_medium' as const : 'premium' as const,
        orgName: email.includes('org') ? 'Sample Church' : undefined,
        orgRole: email.includes('org') ? 'admin' as const : undefined,
      };

      login(userData);

      // Provide success haptic feedback
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Redirect based on user type - use replace to prevent back navigation
      if (userData.orgRole === 'admin') {
        router.replace('/organization');
      } else {
        router.replace('/');
      }
    } catch (err) {
      setSmsError('Verification failed. Please try again.');
      console.error('SMS verification error:', err);
      
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setSmsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowSMSVerification(false);
    setSmsCode('');
    setPhoneNumber('');
    setSmsError('');
    setGeneratedCode('');
  };

  const handleDemoInstantLogin = async (account: DemoAccountConfig) => {
    if (demoLoginLoading) return;
    setDemoLoginLoading(account.type);
    setError('');

    try {
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      console.log(`🎭 Instant demo login: ${account.type} (${account.email})`);

      const timestamp = Date.now();
      const accessToken = `demo-token-${timestamp}`;
      const refreshToken = `demo-refresh-${timestamp}`;

      const userData = {
        id: account.user.id,
        name: `${account.user.first_name} ${account.user.last_name}`.trim(),
        email: account.user.email,
        plan: account.user.plan,
        organizationId: account.user.organizationId,
        organizationRole: account.user.organizationRole,
        roleId: account.user.roleId,
        accessToken,
        refreshToken,
      };

      login(userData);

      const store = useUserStore.getState();

      if (account.organization) {
        store.setOrganization({
          id: account.organization.id,
          name: account.organization.name,
          city: account.organization.city,
          plan: account.organization.plan as any,
          memberCount: account.type === 'church' ? 47 : account.type === 'family' ? 4 : 1,
          maxMembers: account.organization.maxMembers,
          createdAt: new Date().toISOString(),
          adminId: account.organization.organizer_id,
          status: account.organization.status,
          organizerId: account.organization.organizer_id,
        });
      }

      useUserStore.setState({
        prayerStreak: account.prayerStreak,
        totalPoints: account.totalPoints,
        level: account.level,
      });

      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const accountLabel = account.type === 'individual'
        ? `${account.user.first_name} ${account.user.last_name} (Individual)`
        : account.type === 'family'
        ? `${account.user.first_name} ${account.user.last_name} (Family Leader)`
        : `${account.user.first_name} ${account.user.last_name} (Church Admin)`;

      Alert.alert(
        'Welcome! 👋',
        `Logged in as ${accountLabel}`,
        [{ text: 'OK' }]
      );

      router.replace(account.redirect as any);
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Demo login failed. Please try again.');
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setDemoLoginLoading(null);
    }
  };

  const navigateToAdminAuth = () => {
    try {
      router.push('/admin/auth');
    } catch (error) {
      console.error('Navigation to admin auth failed:', error);
    }
  };

  const navigateToRegister = () => {
    try {
      router.replace('/register');
    } catch (error) {
      console.error('Navigation to register failed:', error);
    }
  };

  const navigateToOrgRegister = () => {
    try {
      router.push('/register-org');
    } catch (error) {
      console.error('Navigation to org register failed:', error);
    }
  };

  // Don't render until auth check is complete
  if (!hasCheckedAuth) {
    return null;
  }

  if (showSMSVerification) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Smartphone size={60} color={Colors.light.tint} style={styles.smsIcon} />
            <Text style={styles.title}>SMS Verification</Text>
            <Text style={styles.subtitle}>Enter your phone number to receive a verification code via SMS</Text>
          </View>
          
          <View style={styles.form}>
            {!generatedCode ? (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={[styles.inputContainer, smsError && !phoneNumber.trim() ? styles.inputContainerError : null]}>
                    <Smartphone size={20} color={Colors.light.icon} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChangeText={(text) => {
                        setPhoneNumber(text);
                        setSmsError('');
                      }}
                      keyboardType="phone-pad"
                      placeholderTextColor={Colors.light.icon}
                      accessibilityLabel="Phone number input"
                      returnKeyType="send"
                      onSubmitEditing={sendSMSCode}
                      blurOnSubmit={true}
                    />
                  </View>
                  {smsError ? <Text style={styles.errorText}>{smsError}</Text> : null}
                </View>
                
                <Button
                  title="Send Verification Code"
                  onPress={sendSMSCode}
                  loading={smsLoading}
                  disabled={smsLoading}
                  style={styles.loginButton}
                  size="large"
                  accessibilityLabel="Send SMS verification code"
                />
              </>
            ) : (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Verification Code</Text>
                  <Text style={styles.smsInfo}>Enter the 6-digit code sent via SMS to {phoneNumber}</Text>
                  <View style={[styles.inputContainer, smsError && !smsCode.trim() ? styles.inputContainerError : null]}>
                    <Lock size={20} color={Colors.light.icon} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="123456"
                      value={smsCode}
                      onChangeText={(text) => {
                        setSmsCode(text.replace(/[^0-9]/g, '').slice(0, 6));
                        setSmsError('');
                      }}
                      keyboardType="numeric"
                      maxLength={6}
                      placeholderTextColor={Colors.light.icon}
                      accessibilityLabel="SMS verification code input"
                      returnKeyType="done"
                      onSubmitEditing={verifySMSCode}
                      blurOnSubmit={true}
                    />
                  </View>
                  {smsError ? <Text style={styles.errorText}>{smsError}</Text> : null}
                </View>
                
                <Button
                  title="Verify Code"
                  onPress={verifySMSCode}
                  loading={smsLoading}
                  disabled={smsLoading || smsCode.length !== 6}
                  style={styles.loginButton}
                  size="large"
                  accessibilityLabel="Verify SMS code"
                />
                
                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={() => {
                    setGeneratedCode('');
                    setSmsCode('');
                    setSmsError('');
                  }}
                >
                  <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToLogin}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your spiritual journey</Text>
          {Platform.OS === 'ios' && (
            <View style={styles.iosNotice}>
              <Text style={styles.iosNoticeText}>📱 SMS verification available for enhanced security</Text>
            </View>
          )}
        </View>
        
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, error && !email.trim() ? styles.inputContainerError : null]}>
              <Mail size={20} color={Colors.light.icon} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.light.icon}
                accessibilityLabel="Email input"
                returnKeyType="next"
                onSubmitEditing={() => {
                  // Focus password field when Enter is pressed
                  if (passwordInputRef.current) {
                    passwordInputRef.current.focus();
                  }
                }}
                blurOnSubmit={false}
                enablesReturnKeyAutomatically={true}
                testID="email-input"
              />
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputContainer, error && !password.trim() ? styles.inputContainerError : null]}>
              <Lock size={20} color={Colors.light.icon} style={styles.inputIcon} />
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
                placeholderTextColor={Colors.light.icon}
                accessibilityLabel="Password input"
                returnKeyType="go"
                onSubmitEditing={() => {
                  if (email.trim() && password.trim() && !loading) {
                    void handleLogin();
                  }
                }}
                blurOnSubmit={true}
                enablesReturnKeyAutomatically={true}
                testID="password-input"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.light.icon} />
                ) : (
                  <Eye size={20} color={Colors.light.icon} />
                )}
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
          
          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            accessibilityLabel="Sign in button"
          />
        </View>

        {showDemoAccounts && (
          <View style={styles.demoAccountsSection}>
            <View style={styles.demoHeader}>
              <Zap size={20} color={Colors.light.tint} />
              <Text style={styles.demoMainTitle}>Instant Demo Access</Text>
              <Text style={styles.demoSubtitle}>Tap to explore — no password needed</Text>
            </View>
            
            <View style={styles.demoCardsContainer}>
              {DEMO_ACCOUNTS.map((account) => {
                const isLoading = demoLoginLoading === account.type;
                const iconColor = account.type === 'individual' ? '#1E88E5' : account.type === 'family' ? '#43A047' : '#FB8C00';
                const bgColor = account.type === 'individual' ? '#E3F2FD' : account.type === 'family' ? '#E8F5E9' : '#FFF3E0';
                const borderActiveColor = account.type === 'individual' ? '#1E88E5' : account.type === 'family' ? '#43A047' : '#FB8C00';
                const IconComponent = account.type === 'individual' ? User : account.type === 'family' ? Users : Church;
                const title = account.type === 'individual' ? 'Individual' : account.type === 'family' ? 'Family' : 'Church';
                const subtitle = account.type === 'individual'
                  ? 'John Doe — Personal'
                  : account.type === 'family'
                  ? 'Sarah Johnson — Family Leader'
                  : 'Pastor Michael — Church Admin';
                const features = account.type === 'individual'
                  ? ['Personal prayers', 'Devotionals', 'Habit tracking', 'Bible games']
                  : account.type === 'family'
                  ? ['Group prayers', 'Family meetings', 'Shared plans', 'Up to 10 members']
                  : ['Member management', 'Content publishing', 'Analytics', 'Unlimited members'];

                return (
                  <TouchableOpacity
                    key={account.type}
                    style={[
                      styles.demoCard,
                      isLoading && { borderColor: borderActiveColor, borderWidth: 2 }
                    ]}
                    onPress={() => handleDemoInstantLogin(account)}
                    disabled={!!demoLoginLoading}
                    activeOpacity={0.7}
                    testID={`demo-${account.type}-button`}
                  >
                    <View style={styles.demoCardRow}>
                      <View style={[styles.demoCardIcon, { backgroundColor: bgColor }]}>
                        {isLoading ? (
                          <ActivityIndicator size="small" color={iconColor} />
                        ) : (
                          <IconComponent size={26} color={iconColor} />
                        )}
                      </View>
                      <View style={styles.demoCardInfo}>
                        <Text style={styles.demoCardTitle}>{title}</Text>
                        <Text style={styles.demoCardSubtitle}>{subtitle}</Text>
                      </View>
                      <ArrowRight size={20} color={iconColor} />
                    </View>
                    <View style={styles.demoChips}>
                      {features.map((feat) => (
                        <View key={feat} style={[styles.demoChip, { backgroundColor: bgColor }]}>
                          <CheckCircle size={10} color={iconColor} />
                          <Text style={[styles.demoChipText, { color: iconColor }]}>{feat}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <TouchableOpacity
              style={styles.toggleDemoButton}
              onPress={() => setShowDemoAccounts(false)}
            >
              <Text style={styles.toggleDemoText}>Hide Demo Accounts</Text>
            </TouchableOpacity>
          </View>
        )}

        {!showDemoAccounts && (
          <TouchableOpacity
            style={styles.showDemoButton}
            onPress={() => setShowDemoAccounts(true)}
          >
            <Text style={styles.showDemoText}>Show Demo Accounts</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.links}>
          <TouchableOpacity onPress={navigateToRegister} style={styles.linkButton}>
            <Text style={styles.linkText}>Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={navigateToOrgRegister} style={styles.linkButton}>
            <Text style={styles.linkText}>Register Organization</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.adminLink}
          onPress={navigateToAdminAuth}
        >
          <Shield size={16} color={Colors.light.tint} style={styles.adminIcon} />
          <Text style={styles.adminLinkText}>Admin Access</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.title,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: Colors.light.icon,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputContainerError: {
    borderColor: '#e74c3c',
  },
  inputIcon: {
    marginLeft: theme.spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: Colors.light.text,
  },
  eyeIcon: {
    padding: theme.spacing.md,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  demoCredentials: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.tint,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  demoTitle: {
    ...theme.typography.subtitle,
    fontSize: 14,
    marginBottom: theme.spacing.xs,
  },
  demoText: {
    ...theme.typography.caption,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  linkButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  linkText: {
    ...theme.typography.body,
    color: Colors.light.tint,
    fontWeight: '700' as const,
    fontSize: 15,
  },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  adminIcon: {
    marginRight: theme.spacing.xs,
  },
  adminLinkText: {
    ...theme.typography.body,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  iosNotice: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: '#E3F2FD',
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.tint,
  },
  iosNoticeText: {
    ...theme.typography.caption,
    color: Colors.light.tint,
    textAlign: 'center',
  },
  smsIcon: {
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  smsInfo: {
    ...theme.typography.caption,
    color: Colors.light.icon,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  resendText: {
    ...theme.typography.body,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  backButton: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  backButtonText: {
    ...theme.typography.body,
    color: Colors.light.icon,
    fontWeight: '600',
  },
  demoAccountsSection: {
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  demoHeader: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  demoMainTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  demoSubtitle: {
    fontSize: 13,
    color: Colors.light.icon,
  },
  demoCardsContainer: {
    gap: 10,
    marginBottom: theme.spacing.sm,
  },
  demoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  demoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  demoCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoCardInfo: {
    flex: 1,
  },
  demoCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  demoCardSubtitle: {
    fontSize: 12,
    color: Colors.light.icon,
    marginTop: 2,
  },
  demoChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  toggleDemoButton: {
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  toggleDemoText: {
    ...theme.typography.body,
    color: Colors.light.icon,
    fontSize: 14,
  },
  showDemoButton: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: Colors.light.tint,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  showDemoText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});