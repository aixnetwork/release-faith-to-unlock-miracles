import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button } from '@/components/Button';
import { Image } from 'expo-image';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { promises } from '@/mocks/promises';
import { getSafeImageSource, FALLBACK_IMAGES } from '@/utils/imageUtils';

export default function EditPromiseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [promise, setPromise] = useState(promises.find(p => p.id === id));
  
  const [verse, setVerse] = useState('');
  const [reference, setReference] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ verse: '', reference: '', imageUrl: '' });

  useEffect(() => {
    if (promise) {
      setVerse(promise.verse);
      setReference(promise.reference);
      setImageUrl(promise.imageUrl || '');
    } else {
      Alert.alert("Error", "Promise not found", [
        { text: "OK", onPress: () => router.back() }
      ]);
    }
  }, [promise]);

  const validate = () => {
    const newErrors = { verse: '', reference: '', imageUrl: '' };
    let isValid = true;

    if (!verse.trim()) {
      newErrors.verse = 'Verse is required';
      isValid = false;
    }

    if (!reference.trim()) {
      newErrors.reference = 'Reference is required';
      isValid = false;
    }

    if (!imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
      isValid = false;
    } else if (!imageUrl.startsWith('http')) {
      newErrors.imageUrl = 'Please enter a valid URL';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would update the database
      Alert.alert(
        "Success",
        "Promise has been updated successfully",
        [{ text: "OK", onPress: () => router.back() }]
      );
      setIsSubmitting(false);
    }, 1000);
  };

  if (!promise) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>Bible Verse</Text>
          <TextInput
            style={[styles.textArea, errors.verse ? styles.inputError : null]}
            placeholder="Enter the Bible verse text"
            value={verse}
            onChangeText={setVerse}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={Colors.light.icon}
          />
          {errors.verse ? <Text style={styles.errorText}>{errors.verse}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Reference</Text>
          <TextInput
            style={[styles.input, errors.reference ? styles.inputError : null]}
            placeholder="e.g., John 3:16"
            value={reference}
            onChangeText={setReference}
            placeholderTextColor={Colors.light.icon}
          />
          {errors.reference ? <Text style={styles.errorText}>{errors.reference}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={[styles.input, errors.imageUrl ? styles.inputError : null]}
            placeholder="Enter image URL"
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholderTextColor={Colors.light.icon}
            autoCapitalize="none"
          />
          {errors.imageUrl ? <Text style={styles.errorText}>{errors.imageUrl}</Text> : null}
        </View>

        {imageUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.previewLabel}>Image Preview</Text>
            <Image
              source={getSafeImageSource(imageUrl, FALLBACK_IMAGES.promise)}
              style={styles.imagePreview}
              contentFit="cover"
            />
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Save Changes"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textArea: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: Colors.light.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  imagePreviewContainer: {
    marginBottom: theme.spacing.lg,
  },
  previewLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.light.background,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  saveButton: {
    flex: 1,
  },
});