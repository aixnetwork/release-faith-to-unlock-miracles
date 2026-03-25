import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, Platform, Modal } from 'react-native';
import { router, Stack } from 'expo-router';
import { Mic, Square } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from '@/utils/translations';
import BottomNavigation from '@/components/BottomNavigation';
import { ENV } from '@/config/env';
import { fetchWithAuth } from '@/utils/authUtils';
import { BackButton } from '@/components/BackButton';

const PRAYER_CATEGORIES = [
  'Health',
  'Family',
  'Work',
  'Guidance',
  'Gratitude',
  'Other'
];

export default function NewPrayerScreen() {
  const { settings, user, organization } = useUserStore();
  const { t } = useTranslation(settings.language);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [shareOnWall, setShareOnWall] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [wasSharedOnWall, setWasSharedOnWall] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setShareOnWall(false);
    setSelectedCategory('');
    setIsLoading(false);
    setIsRecording(false);
    setIsTranscribing(false);
  };

  const startRecording = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Voice recording is not available on web. Please use the mobile app.');
      return;
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission to record audio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: 2, // MPEG_4
          audioEncoder: 3, // AAC
        },
        ios: {
          extension: '.wav',
          outputFormat: 1, // LINEARPCM
          audioQuality: 1, // HIGH
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      setIsRecording(false);
      await recordingRef.current.stopAndUnloadAsync();
      
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recordingRef.current.getURI();
      if (uri) {
        await transcribeAudio(uri);
      }
      
      recordingRef.current = null;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  const transcribeAudio = async (uri: string) => {
    try {
      setIsTranscribing(true);
      
      const formData = new FormData();
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      const audioFile = {
        uri,
        name: "recording." + fileType,
        type: "audio/" + fileType
      } as any;
      
      formData.append('audio', audioFile);
      
      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Transcription failed');
      }
      
      const result = await response.json();
      
      if (result.text) {
        setContent(prev => prev ? `${prev}\n\n${result.text}` : result.text);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(t('common.error'), 'Please fill in both title and prayer request.');
      return;
    }

    if (!user?.id) {
      Alert.alert(t('common.error'), 'You must be logged in to create a prayer.');
      return;
    }

    if (!user?.accessToken) {
      Alert.alert(t('common.error'), 'Authentication token not found. Please login again.');
      return;
    }

    setIsLoading(true);
    
    try {
      const prayerData = {
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory.toLowerCase() || 'other',
        shareOnWall: shareOnWall ? 1 : 0,
        user_id: user.id,
        answered: 0,
        prayerCount: 0,
        hasPrayed: 0,
        organization_id: organization?.id || null,
        status: 'published',
        date_created: new Date().toISOString(),
      };

      console.log('Creating prayer with data:', prayerData);

      const response = await fetchWithAuth(`${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers`, {
        method: 'POST',
        body: JSON.stringify(prayerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Prayer creation failed:', errorData);
        throw new Error(errorData.errors?.[0]?.message || 'Failed to create prayer');
      }

      const result = await response.json();
      console.log('Prayer created successfully:', result);
      
      const wasShared = shareOnWall;
      const savedPrayerId = result.data?.id;
      
      console.log('Was shared on wall:', wasShared);
      console.log('Saved prayer ID:', savedPrayerId);
      
      resetForm();
      
      setSuccessMessage(
        wasShared 
          ? 'Prayer request saved and shared on Prayer Wall!'
          : 'Prayer request saved successfully!'
      );
      setWasSharedOnWall(wasShared);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Prayer creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save prayer. Please try again.';
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    try {
      // Try to go back first
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        // If can't go back, navigate to prayers tab
        router.replace('/(tabs)/prayers');
      }
    } catch (error) {
      console.error('Navigation error on go back:', error);
      // Fallback navigation
      try {
        router.replace('/(tabs)/prayers');
      } catch (fallbackError) {
        console.error('Fallback navigation error:', fallbackError);
        // Last resort - go to home
        router.replace('/');
      }
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your prayer?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', onPress: () => {
            resetForm();
            handleGoBack();
          }}
        ]
      );
    } else {
      handleGoBack();
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'New Prayer Request',
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.text,
            headerTitleStyle: { color: Colors.light.text },
            headerLeft: () => (
              <BackButton onPress={handleCancel} color={Colors.light.text} />
            ),
          }}
        />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Enter prayer title..."
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={Colors.light.inputPlaceholder}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Prayer Request</Text>
                {Platform.OS !== 'web' && (
                  <TouchableOpacity
                    style={[
                      styles.voiceButton,
                      isRecording && styles.voiceButtonActive,
                      isTranscribing && styles.voiceButtonDisabled
                    ]}
                    onPress={isRecording ? stopRecording : startRecording}
                    disabled={isTranscribing}
                  >
                    {isRecording ? (
                      <Square size={16} color="#fff" fill="#fff" />
                    ) : (
                      <Mic size={16} color={Colors.light.primary} />
                    )}
                    <Text style={[
                      styles.voiceButtonText,
                      isRecording && styles.voiceButtonTextActive
                    ]}>
                      {isTranscribing ? 'Transcribing...' : isRecording ? 'Stop' : 'Voice'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.contentInput}
                placeholder="Share your prayer request..."
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor={Colors.light.inputPlaceholder}
                maxLength={1000}
              />
            </View>

            <View style={styles.shareSection}>
              <View style={styles.shareHeader}>
                <Text style={styles.shareTitle}>Share on Prayer Wall</Text>
                <Switch
                  value={shareOnWall}
                  onValueChange={setShareOnWall}
                  trackColor={{ false: Colors.light.borderLight, true: Colors.light.primary }}
                  thumbColor={shareOnWall ? Colors.light.white : Colors.light.textMedium}
                />
              </View>
              <Text style={styles.shareDescription}>
                When enabled, your prayer will be visible to all users on the prayer wall for community support.
              </Text>
            </View>

            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>Category</Text>
              <View style={styles.categoryGrid}>
                {PRAYER_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.selectedCategoryButton
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory === category && styles.selectedCategoryButtonText
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={t('common.cancel')}
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
            size="medium"
          />
          <Button
            title={shareOnWall ? 'Save & Share Prayer' : 'Save Prayer'}
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
            size="medium"
          />
        </View>
      </View>
      <BottomNavigation />

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>
            <View style={styles.modalButtons}>
              {wasSharedOnWall ? (
                <>
                  <TouchableOpacity
                    style={styles.modalButtonPrimary}
                    onPress={() => {
                      console.log('View on Prayer Wall button pressed');
                      setShowSuccessModal(false);
                      setTimeout(() => {
                        try {
                          router.push('/prayer-wall');
                        } catch (error) {
                          console.error('Navigation to prayer wall failed:', error);
                          handleGoBack();
                        }
                      }, 100);
                    }}
                  >
                    <Text style={styles.modalButtonPrimaryText}>View on Prayer Wall</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonSecondary}
                    onPress={() => {
                      console.log('Go Back button pressed');
                      setShowSuccessModal(false);
                      handleGoBack();
                    }}
                  >
                    <Text style={styles.modalButtonSecondaryText}>Go Back</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.modalButtonPrimary}
                  onPress={() => {
                    console.log('Done button pressed');
                    setShowSuccessModal(false);
                    handleGoBack();
                  }}
                >
                  <Text style={styles.modalButtonPrimaryText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingBottom: 80, // Space for bottom navigation
  },

  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  form: {
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    color: '#374151',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  voiceButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  voiceButtonDisabled: {
    opacity: 0.6,
  },
  voiceButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  voiceButtonTextActive: {
    color: '#fff',
  },
  titleInput: {
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.inputText,
  },
  contentInput: {
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.inputText,
    minHeight: 120,
  },
  shareSection: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  shareDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
    color: Colors.light.textMedium,
  },
  categorySection: {
    gap: theme.spacing.md,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    color: '#374151',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  selectedCategoryButtonText: {
    color: Colors.light.white,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: theme.borderRadius.lg,
  },
  saveButton: {
    flex: 1.5,
    minHeight: 52,
    borderRadius: theme.borderRadius.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  successModal: {
    backgroundColor: Colors.light.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...theme.shadows.large,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  successIconText: {
    fontSize: 36,
    color: Colors.light.white,
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: theme.spacing.sm,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.light.textMedium,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'column',
    gap: theme.spacing.md,
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
});