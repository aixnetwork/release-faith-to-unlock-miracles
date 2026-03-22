import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Image } from 'expo-image';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { getSafeImageSource, FALLBACK_IMAGES } from '@/utils/imageUtils';

export default function CreateQuoteScreen() {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ text: '', author: '', imageUrl: '' });

  const validate = () => {
    const newErrors = { text: '', author: '', imageUrl: '' };
    let isValid = true;

    if (!text.trim()) {
      newErrors.text = 'Quote text is required';
      isValid = false;
    }

    if (!author.trim()) {
      newErrors.author = 'Author is required';
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
      // In a real app, this would create a new quote in the database
      Alert.alert(
        "Success",
        "New quote has been created successfully",
        [{ text: "OK", onPress: () => router.back() }]
      );
      setIsSubmitting(false);
    }, 1000);
  };

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
          <Text style={styles.label}>Quote Text</Text>
          <TextInput
            style={[styles.textArea, errors.text ? styles.inputError : null]}
            placeholder="Enter the quote text"
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={Colors.light.icon}
          />
          {errors.text ? <Text style={styles.errorText}>{errors.text}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Author</Text>
          <TextInput
            style={[styles.input, errors.author ? styles.inputError : null]}
            placeholder="Enter author name"
            value={author}
            onChangeText={setAuthor}
            placeholderTextColor={Colors.light.icon}
          />
          {errors.author ? <Text style={styles.errorText}>{errors.author}</Text> : null}
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
              source={getSafeImageSource(imageUrl, FALLBACK_IMAGES.quote)}
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
            title="Create Quote"
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