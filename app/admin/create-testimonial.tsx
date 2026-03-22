import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useTestimonialStore } from '@/store/testimonialStore';

export default function CreateTestimonialScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addTestimonial } = useTestimonialStore();

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !author.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      addTestimonial({
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        category: category.trim() || 'general',
        type: 'text',
      });

      Alert.alert(
        'Success',
        'Testimonial created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create testimonial. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Create Testimonial',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter testimonial title"
              placeholderTextColor={Colors.light.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Author *</Text>
            <TextInput
              style={styles.input}
              value={author}
              onChangeText={setAuthor}
              placeholder="Enter author name"
              placeholderTextColor={Colors.light.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="Enter category (optional)"
              placeholderTextColor={Colors.light.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Enter testimonial content"
              placeholderTextColor={Colors.light.textLight}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title={isSubmitting ? 'Creating...' : 'Create Testimonial'}
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={styles.submitButton}
            />
          </View>
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
  },
  form: {
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.typography.subtitle,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});