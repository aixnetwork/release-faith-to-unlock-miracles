import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Lock, ShieldCheck, User, Smartphone } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useAdminStore } from '@/store/adminStore';
import { useUserStore } from '@/store/userStore';
import * as Haptics from 'expo-haptics';

export default function AdminAuthScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSMSVerification, setShowSMSVerification] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsError, setSmsError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [pendingAuthResult, setPendingAuthResult] = useState<any>(null);
  
  const { authenticateWithCredentials, isAdmin, isSuperAdmin } = useAdminStore();
  const { login: userLogin } = useUserStore();

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    const adminStatus = isAdmin();
    const superAdminStatus = isSuperAdmin();
    
    console.log('🔐 Admin auth screen - checking existing auth:', { adminStatus, superAdminStatus });
    
    if (adminStatus) {
      if (superAdminStatus) {
        console.log('🔄 Redirecting to super admin dashboard');
        router.replace('/admin');
      } else {
        console.log('🔄 Redirecting to organization dashboard');
        router.replace('/organization');
      }
    }
  }, [isAdmin, isSuperAdmin]);

  const handleLogin = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Provide haptic feedback on iOS/Android
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      console.log('🔐 Attempting admin authentication for:', username);
      const result = await authenticateWithCredentials(username, password);
      
      if (!result.success) {
        setError('Invalid admin credentials');
        console.log('❌ Admin authentication failed');
        // Provide error haptic feedback
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } else {
        // For Apple devices, require SMS verification for admin access
        if (Platform.OS === 'ios') {
          setPendingAuthResult(result);
          setShowSMSVerification(true);
          setLoading(false);
          return;
        }

        // Provide success haptic feedback
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        console.log('✅ Admin authentication successful:', result);
        
        // Also login to userStore to have user_id available for comments
        if (result.userId && result.userEmail && result.userName) {
          console.log('📝 Setting user data in userStore for:', result.userId);
          userLogin({
            id: result.userId,
            name: result.userName,
            email: result.userEmail,
            plan: 'individual',
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });
        }
        
        // Redirect based on admin type
        if (result.isSuperAdmin) {
          console.log('🔄 Redirecting to super admin dashboard');
          router.replace('/admin');
        } else {
          console.log('🔄 Redirecting to organization dashboard');
          router.replace('/organization');
        }
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.error('❌ Admin auth error:', err);
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
      console.log(`Admin SMS Code sent to ${phoneNumber}: ${code}`);
      
      Alert.alert(
        'Admin SMS Verification',
        `Verification code sent to ${phoneNumber}\n\nFor demo purposes, the code is: ${code}`,
        [{ text: 'OK' }]
      );

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      setSmsError('Failed to send SMS. Please try again.');
      console.error('Admin SMS send error:', err);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    setSmsLoading(true);
    setSmsError('');

    try {
      // Provide success haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      console.log('✅ Admin SMS verification successful');
      
      // Use the pending auth result to complete login
      if (pendingAuthResult) {
        // Also login to userStore to have user_id available for comments
        if (pendingAuthResult.userId && pendingAuthResult.userEmail && pendingAuthResult.userName) {
          console.log('📝 Setting user data in userStore for:', pendingAuthResult.userId);
          userLogin({
            id: pendingAuthResult.userId,
            name: pendingAuthResult.userName,
            email: pendingAuthResult.userEmail,
            plan: 'individual',
            accessToken: pendingAuthResult.accessToken,
            refreshToken: pendingAuthResult.refreshToken,
          });
        }
        
        // Redirect based on admin type
        if (pendingAuthResult.isSuperAdmin) {
          console.log('🔄 Redirecting to super admin dashboard');
          router.replace('/admin');
        } else {
          console.log('🔄 Redirecting to organization dashboard');
          router.replace('/organization');
        }
      }
    } catch (err) {
      setSmsError('Verification failed. Please try again.');
      console.error('Admin SMS verification error:', err);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setSmsLoading(false);
    }
  };

  const handleBackToSMSLogin = () => {
    setShowSMSVerification(false);
    setSmsCode('');
    setPhoneNumber('');
    setSmsError('');
    setGeneratedCode('');
    setPendingAuthResult(null);
  };

  const handleBackToLogin = () => {
    try {
      // Try to go back first
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        // If can't go back, navigate to login
        router.replace('/login');
      }
    } catch (error) {
      console.error('Navigation back to login failed:', error);
      // Fallback navigation
      try {
        router.replace('/login');
      } catch (fallbackError) {
        console.error('Fallback navigation to login failed:', fallbackError);
      }
    }
  };

  if (showSMSVerification) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Smartphone size={60} color="#e74c3c" />
          </View>
          
          <Text style={styles.title}>Admin SMS Verification</Text>
          <Text style={styles.subtitle}>Additional security required for admin access on Apple devices</Text>
          
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
                    accessibilityLabel="Admin phone number input"
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
                accessibilityLabel="Send admin SMS verification code"
              />
            </>
          ) : (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <Text style={styles.smsInfo}>Enter the 6-digit code sent to {phoneNumber}</Text>
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
                    accessibilityLabel="Admin SMS verification code input"
                  />
                </View>
                {smsError ? <Text style={styles.errorText}>{smsError}</Text> : null}
              </View>
              
              <Button
                title="Verify Admin Access"
                onPress={verifySMSCode}
                loading={smsLoading}
                disabled={smsLoading || smsCode.length !== 6}
                style={styles.loginButton}
                size="large"
                accessibilityLabel="Verify admin SMS code"
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
          
          <TouchableOpacity 
            style={styles.backLink}
            onPress={handleBackToSMSLogin}
          >
            <Text style={styles.backLinkText}>Back to Admin Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ShieldCheck size={60} color="#e74c3c" />
        </View>
        
        <Text style={styles.title}>Admin Access</Text>
        <Text style={styles.subtitle}>Enter admin credentials to continue</Text>
        {Platform.OS === 'ios' && (
          <View style={styles.iosNotice}>
            <Text style={styles.iosNoticeText}>📱 SMS verification required for Apple devices</Text>
          </View>
        )}
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <View style={[styles.inputContainer, error && !username.trim() ? styles.inputContainerError : null]}>
            <User size={20} color={Colors.light.icon} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter admin username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setError('');
              }}
              placeholderTextColor={Colors.light.icon}
              autoCapitalize="none"
              accessibilityLabel="Admin username input"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputContainer, error && !password.trim() ? styles.inputContainerError : null]}>
            <Lock size={20} color={Colors.light.icon} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter admin password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry
              placeholderTextColor={Colors.light.icon}
              autoCapitalize="none"
              accessibilityLabel="Admin password input"
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
        
        <Button
          title={Platform.OS === 'ios' ? 'Continue to SMS Verification' : 'Authenticate'}
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.loginButton}
          size="large"
          accessibilityLabel="Authenticate as admin"
        />
        
        <View style={styles.demoCredentials}>
          <Text style={styles.demoTitle}>Admin Login:</Text>
          <Text style={styles.demoNote}>
            Organizers and Administrators can log in using their Directus credentials.
          </Text>
          <Text style={styles.demoNote}>
            • Administrators have full system access
          </Text>
          <Text style={styles.demoNote}>
            • Organizers can manage their organizations
          </Text>
          {Platform.OS === 'ios' && (
            <Text style={styles.demoNote}>📱 SMS verification will be required after login</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.backLink}
          onPress={handleBackToLogin}
        >
          <Text style={styles.backLinkText}>Back to Login</Text>
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    color: '#e74c3c',
  },
  subtitle: {
    ...theme.typography.body,
    color: Colors.light.icon,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
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
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  loginButton: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#e74c3c',
  },
  demoCredentials: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  demoTitle: {
    ...theme.typography.subtitle,
    fontSize: 14,
    marginBottom: theme.spacing.xs,
    color: '#e74c3c',
  },
  demoText: {
    ...theme.typography.caption,
    color: Colors.light.icon,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  demoNote: {
    ...theme.typography.caption,
    color: Colors.light.icon,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  backLink: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  backLinkText: {
    ...theme.typography.body,
    color: '#e74c3c',
    fontWeight: '600',
  },
  iosNotice: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: '#FFEBEE',
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
  },
  iosNoticeText: {
    ...theme.typography.caption,
    color: '#e74c3c',
    textAlign: 'center',
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
    color: '#e74c3c',
    fontWeight: '600',
  },
});