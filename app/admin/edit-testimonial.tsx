import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { testimonials } from '@/mocks/testimonials';
import { promises } from '@/mocks/promises';
import { songs } from '@/mocks/songs';

export default function EditTestimonialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [testimonial, setTestimonial] = useState(testimonials.find((t: any) => t.id === id));
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [linkedPromiseId, setLinkedPromiseId] = useState('');
  const [linkedSongId, setLinkedSongId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ 
    title: '', 
    content: '', 
    author: ''
  });

  useEffect(() => {
    if (testimonial) {
      setTitle(testimonial.title);
      setContent(testimonial.content);
      setAuthor(testimonial.author);
      setLinkedPromiseId('');
      setLinkedSongId('');
    } else {
      Alert.alert("Error", "Testimonial not found", [
        { text: "OK", onPress: () => router.back() }
      ]);
    }
  }, [testimonial]);

  const validate = () => {
    const newErrors = { 
      title: '', 
      content: '', 
      author: ''
    };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
      isValid = false;
    }

    if (!author.trim()) {
      newErrors.author = 'Author is required';
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
        "Testimonial has been updated successfully",
        [{ text: "OK", onPress: () => router.back() }]
      );
      setIsSubmitting(false);
    }, 1000);
  };

  if (!testimonial) {
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
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={[styles.input, errors.title ? styles.inputError : null]}
            placeholder="Enter testimonial title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={Colors.light.icon}
          />
          {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={[styles.textArea, errors.content ? styles.inputError : null]}
            placeholder="Enter testimonial content"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            placeholderTextColor={Colors.light.icon}
          />
          {errors.content ? <Text style={styles.errorText}>{errors.content}</Text> : null}
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
          <Text style={styles.label}>Linked Bible Promise</Text>
          <View style={styles.selectContainer}>
            {promises.map((promise) => (
              <TouchableOpacity
                key={promise.id}
                style={[
                  styles.selectOption,
                  linkedPromiseId === promise.id && styles.selectedOption
                ]}
                onPress={() => setLinkedPromiseId(promise.id)}
              >
                <Text 
                  style={[
                    styles.selectOptionText,
                    linkedPromiseId === promise.id && styles.selectedOptionText
                  ]}
                  numberOfLines={1}
                >
                  {promise.reference}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Linked Worship Song</Text>
          <View style={styles.selectContainer}>
            {songs.map((song) => (
              <TouchableOpacity
                key={song.id}
                style={[
                  styles.selectOption,
                  linkedSongId === song.id && styles.selectedOption
                ]}
                onPress={() => setLinkedSongId(song.id)}
              >
                <Text 
                  style={[
                    styles.selectOptionText,
                    linkedSongId === song.id && styles.selectedOptionText
                  ]}
                  numberOfLines={1}
                >
                  {song.title} - {song.artist}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.label}>Statistics</Text>
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Likes</Text>
              <Text style={styles.statValue}>{testimonial.likes}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Date Posted</Text>
              <Text style={styles.statValue}>
                {new Date(testimonial.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

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
    minHeight: 160,
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
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  selectOptionText: {
    ...theme.typography.caption,
    color: Colors.light.text,
  },
  selectedOptionText: {
    color: Colors.light.background,
  },
  statsContainer: {
    marginBottom: theme.spacing.lg,
  },
  statsContent: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    ...theme.typography.caption,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  statValue: {
    ...theme.typography.body,
    fontWeight: '600',
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