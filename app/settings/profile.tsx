import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Platform, Image, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Save, Camera, Users } from 'lucide-react-native';
import { ENV } from '@/config/env';
import { fetchWithAuth } from '@/utils/authUtils';


const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (Platform.OS === 'web') {
    return `/api/proxy${cleanPath}`;
  }
  return `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}${cleanPath}`;
};

export default function ProfileSettingsScreen() {
  const { isLoggedIn, name, email, plan, user, updateProfile } = useUserStore();
  const [displayName, setDisplayName] = useState(name || '');
  const [displayEmail, setDisplayEmail] = useState(email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarText || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const hasFamilyAccess = plan === 'group_family';

  React.useEffect(() => {
    if (user?.avatarText) {
      setAvatarUrl(user.avatarText);
    }
  }, [user?.avatarText]);

  React.useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  const handleSaveProfile = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update profile with new data
      updateProfile({
        name: displayName,
        email: displayEmail
      });
      setIsLoading(false);
      Alert.alert("Success", "Your profile has been updated successfully.");
    }, 1000);
  };

  const handleChangeProfilePicture = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImageToDirectus(result.assets[0].uri);
    }
  };

  const uploadImageToDirectus = async (imageUri: string) => {
    if (!user?.accessToken) {
      Alert.alert('Error', 'You must be logged in to upload an image.');
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.([\w]+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('folder', '86e97425-207b-4a18-abc2-712ff726860e');
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      const uploadResponse = await fetchWithAuth(getApiUrl('/files'), {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload error:', errorText);
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      const fileId = uploadData.data.id;

      const updateResponse = await fetchWithAuth(getApiUrl(`/users/${user.id}`), {
        method: 'PATCH',
        body: JSON.stringify({
          avatar: fileId,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update user avatar');
      }

      const imageUrl = getApiUrl(`/assets/${fileId}`);
      setAvatarUrl(imageUrl);
      
      updateProfile({
        avatarText: imageUrl,
      });

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Edit Profile" }} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileImageContainer}>
          <View style={styles.avatar}>
            {isUploadingImage ? (
              <ActivityIndicator size="large" color={Colors.light.white} />
            ) : avatarUrl && avatarUrl.startsWith('http') ? (
              <Image 
                source={{ uri: avatarUrl }} 
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{displayName ? displayName.charAt(0).toUpperCase() : 'U'}</Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.changePhotoButton}
            onPress={handleChangeProfilePicture}
            disabled={isUploadingImage}
          >
            <Camera size={16} color={Colors.light.white} style={styles.cameraIcon} />
            <Text style={styles.changePhotoText}>
              {isUploadingImage ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Membership Status */}
        <View style={styles.membershipContainer}>
          <Text style={styles.membershipTitle}>Current Plan</Text>
          <View style={styles.membershipCard}>
            <View style={styles.membershipInfo}>
              <Text style={styles.membershipPlan}>
                {plan === 'free' ? 'Free Plan' :
                 plan === 'premium' ? 'Premium Plan' :
                 plan === 'pro' ? 'Pro Plan' :
                 plan === 'group_family' ? 'Group/Family Plan' :
                 plan === 'lifetime' ? 'Lifetime Plan' :
                 plan === 'org_small' ? 'Small Church Plan' :
                 plan === 'org_medium' ? 'Medium Church Plan' :
                 plan === 'org_large' ? 'Large Church Plan' : 'Unknown Plan'}
              </Text>
              <Text style={styles.membershipStatus}>
                {plan === 'free' ? 'Basic features included' :
                 plan === 'lifetime' ? 'Lifetime access' :
                 'Premium features active'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => router.push('/membership')}
            >
              <Text style={styles.upgradeButtonText}>
                {plan === 'free' ? 'Upgrade' : 'Manage'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {hasFamilyAccess && (
            <Button
              title="Manage Family Members"
              variant="secondary"
              onPress={() => router.push('/family')}
              style={styles.familyButton}
              icon={<Users size={18} color={Colors.light.primary} />}
            />
          )}
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={Colors.light.inputPlaceholder}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={displayEmail}
              onChangeText={setDisplayEmail}
              placeholder="Your email"
              placeholderTextColor={Colors.light.inputPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Button
            title="Save Changes"
            onPress={handleSaveProfile}
            loading={isLoading}
            icon={<Save size={18} color={Colors.light.white} />}
            style={styles.saveButton}
          />
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
          <Button
            title="Delete Account"
            onPress={() => Alert.alert(
              "Delete Account",
              "Are you sure you want to delete your account? This action cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => Alert.alert("Account Deletion", "This feature will be available in a future update.") }
              ]
            )}
            variant="danger"
            style={styles.deleteButton}
          />
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
    paddingBottom: theme.spacing.xxl,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    color: Colors.light.white,
    fontSize: 40,
    fontWeight: '600',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
  },
  cameraIcon: {
    marginRight: 6,
  },
  changePhotoText: {
    color: Colors.light.white,
    fontWeight: '600',
    fontSize: 14,
  },
  familyButton: {
    marginTop: theme.spacing.md,
    borderColor: Colors.light.primary,
  },
  formContainer: {
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    ...theme.typography.inputLabel,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.inputText,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
  membershipContainer: {
    marginBottom: theme.spacing.xl,
  },
  membershipTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  membershipCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  membershipInfo: {
    flex: 1,
  },
  membershipPlan: {
    ...theme.typography.subtitle,
    fontSize: 18,
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  membershipStatus: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
  upgradeButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  upgradeButtonText: {
    ...theme.typography.body,
    color: Colors.light.white,
    fontWeight: '600',
  },
  dangerZone: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: '#FEF2F2',
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.error,
  },
  dangerZoneTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.error,
    marginBottom: theme.spacing.md,
  },
  deleteButton: {
    backgroundColor: Colors.light.error,
  },
});