import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button } from '@/components/Button';
import { Image } from 'expo-image';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { songs } from '@/mocks/songs';
import { getSafeImageSource, FALLBACK_IMAGES } from '@/utils/imageUtils';

export default function EditSongScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [song, setSong] = useState(songs.find(s => s.id === id));
  
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ 
    title: '', 
    artist: '', 
    description: '', 
    imageUrl: '',
    youtubeId: ''
  });

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setDescription(song.description || '');
      setImageUrl(song.imageUrl || '');
      setYoutubeId(song.youtubeId || '');
    } else {
      Alert.alert("Error", "Song not found", [
        { text: "OK", onPress: () => router.back() }
      ]);
    }
  }, [song]);

  const validate = () => {
    const newErrors = { 
      title: '', 
      artist: '', 
      description: '', 
      imageUrl: '',
      youtubeId: ''
    };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!artist.trim()) {
      newErrors.artist = 'Artist is required';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
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
        "Song has been updated successfully",
        [{ text: "OK", onPress: () => router.back() }]
      );
      setIsSubmitting(false);
    }, 1000);
  };

  if (!song) {
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
          <Text style={styles.label}>Song Title</Text>
          <TextInput
            style={[styles.input, errors.title ? styles.inputError : null]}
            placeholder="Enter song title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={Colors.light.icon}
          />
          {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Artist</Text>
          <TextInput
            style={[styles.input, errors.artist ? styles.inputError : null]}
            placeholder="Enter artist name"
            value={artist}
            onChangeText={setArtist}
            placeholderTextColor={Colors.light.icon}
          />
          {errors.artist ? <Text style={styles.errorText}>{errors.artist}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textArea, errors.description ? styles.inputError : null]}
            placeholder="Enter song description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={Colors.light.icon}
          />
          {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>YouTube ID</Text>
          <TextInput
            style={[styles.input, errors.youtubeId ? styles.inputError : null]}
            placeholder="e.g., dQw4w9WgXcQ"
            value={youtubeId}
            onChangeText={setYoutubeId}
            placeholderTextColor={Colors.light.icon}
            autoCapitalize="none"
          />
          {errors.youtubeId ? <Text style={styles.errorText}>{errors.youtubeId}</Text> : null}
          <Text style={styles.helperText}>
            The ID is the part after &quot;v=&quot; in a YouTube URL
          </Text>
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
              source={getSafeImageSource(imageUrl, FALLBACK_IMAGES.song)}
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
  helperText: {
    ...theme.typography.caption,
    color: Colors.light.icon,
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