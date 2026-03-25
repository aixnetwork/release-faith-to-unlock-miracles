import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Save, X, Music, Youtube, Tag } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useSongStore } from '@/store/songStore';
import BottomNavigation from '@/components/BottomNavigation';

const SONG_CATEGORIES = [
  { id: 'worship', name: 'Worship' },
  { id: 'hymn', name: 'Hymns' },
  { id: 'contemporary', name: 'Contemporary' },
  { id: 'gospel', name: 'Gospel' },
  { id: 'praise', name: 'Praise' },
  { id: 'traditional', name: 'Traditional' }
];

export default function NewSongScreen() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('worship');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addSong } = useSongStore();

  const handleSubmit = async () => {
    if (!title.trim() || !artist.trim()) {
      Alert.alert('Error', 'Please fill in the title and artist fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const songData = {
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim() || undefined,
        description: description.trim(),
        lyrics: lyrics.trim() || undefined,
        youtubeId: youtubeId.trim() || undefined,
        youtubeUrl: youtubeId.trim() ? `https://www.youtube.com/watch?v=${youtubeId.trim()}` : undefined,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        duration: 0,
        likes: 0,
        isLiked: false,
        genre: category as 'worship' | 'contemporary' | 'hymn' | 'gospel' | 'praise' | 'spiritual',
        playCount: 0,
      };

      await addSong(songData);

      Alert.alert(
        'Success',
        'Song has been added successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding song:', error);
      Alert.alert('Error', 'Failed to add song. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title || artist || description) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  const handleYouTubeUrlChange = (text: string) => {
    const extractedId = extractYouTubeId(text);
    setYoutubeId(extractedId);
  };

  return (
    <>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Stack.Screen
          options={{
            title: 'Add New Song',
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.text,
            headerLeft: () => (
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity 
                onPress={handleSubmit} 
                style={styles.headerButton}
                disabled={isSubmitting}
              >
                <Save size={24} color={Colors.light.primary} />
              </TouchableOpacity>
            ),
          }}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Song Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter song title"
                placeholderTextColor={Colors.light.icon}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Artist *</Text>
              <TextInput
                style={styles.input}
                value={artist}
                onChangeText={setArtist}
                placeholder="Enter artist name"
                placeholderTextColor={Colors.light.icon}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Album</Text>
              <TextInput
                style={styles.input}
                value={album}
                onChangeText={setAlbum}
                placeholder="Enter album name (optional)"
                placeholderTextColor={Colors.light.icon}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the song..."
                placeholderTextColor={Colors.light.icon}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
              {SONG_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    category === cat.id && styles.categoryButtonTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Media</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>YouTube URL</Text>
              <View style={styles.inputWithIcon}>
                <Youtube size={20} color={Colors.light.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={youtubeId}
                  onChangeText={handleYouTubeUrlChange}
                  placeholder="Paste YouTube URL or video ID"
                  placeholderTextColor={Colors.light.icon}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="Enter image URL (optional)"
                placeholderTextColor={Colors.light.icon}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags</Text>
              <View style={styles.inputWithIcon}>
                <Tag size={20} color={Colors.light.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={tags}
                  onChangeText={setTags}
                  placeholder="Enter tags separated by commas"
                  placeholderTextColor={Colors.light.icon}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lyrics</Text>
              <TextInput
                style={[styles.input, styles.textArea, styles.lyricsInput]}
                value={lyrics}
                onChangeText={setLyrics}
                placeholder="Enter song lyrics (optional)"
                placeholderTextColor={Colors.light.icon}
                multiline
                numberOfLines={8}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={isSubmitting ? 'Adding Song...' : 'Add Song'}
              onPress={handleSubmit}
              disabled={isSubmitting || !title.trim() || !artist.trim()}
              icon={<Music size={16} color={Colors.light.white} />}
            />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNavigation />
    </>
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
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
    color: Colors.light.text,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    ...theme.shadows.small,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    ...theme.shadows.small,
  },
  inputIcon: {
    marginLeft: theme.spacing.md,
  },
  inputWithIconText: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  lyricsInput: {
    height: 120,
  },
  categoriesContainer: {
    marginTop: theme.spacing.sm,
  },
  categoryButton: {
    backgroundColor: Colors.light.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryButtonText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.text,
  },
  categoryButtonTextActive: {
    color: Colors.light.white,
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
  },
  bottomSpacing: {
    height: 100,
  },
});