import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Switch } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { hasPermission, ChurchAdminRole } from '@/types/church-admin';
import { trpc } from '@/lib/trpc';

const CONTENT_TYPES = [
  { value: 'sermons', label: '🎤 Sermon' },
  { value: 'bible-studies', label: '📖 Bible Study' },
  { value: 'worship-songs', label: '🎵 Worship Song' },
  { value: 'events', label: '📅 Event' },
  { value: 'articles', label: '📝 Article' },
  { value: 'videos', label: '🎥 Video' },
];

export default function EditContentScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUserStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState('sermons');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const adminRole = (user?.organizationRole || 'member') as ChurchAdminRole;
  const canManage = hasPermission(adminRole, 'canCreateContent');

  const { data: contentData, isLoading } = trpc.content.getById.useQuery(
    { contentId: id as string },
    { enabled: !!id && canManage }
  );

  useEffect(() => {
    if (contentData) {
      setTitle(contentData.title);
      setDescription(contentData.description || '');
      setContentType(contentData.contentType);
      setContent(contentData.content || '');
      setTags(contentData.tags?.join(', ') || '');
      setIsPublic(contentData.isPublic);
    }
  }, [contentData]);

  const updateContentMutation = trpc.content.update.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Content updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update content');
      console.error('Update error:', error);
    },
  });

  const handleUpdate = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const tagsArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    updateContentMutation.mutate({
      contentId: id as string,
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      tags: tagsArray,
      isPublic,
    });
  };

  if (!canManage) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>You don&apos;t have permission to edit content</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Edit Content',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + theme.spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Content Type</Text>
          <View style={styles.typeGrid}>
            {CONTENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeChip,
                  contentType === type.value && styles.typeChipActive,
                ]}
                onPress={() => setContentType(type.value)}
              >
                <Text
                  style={[
                    styles.typeText,
                    contentType === type.value && styles.typeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter content title"
            placeholderTextColor={Colors.light.textLight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description of the content"
            placeholderTextColor={Colors.light.textLight}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={[styles.input, styles.textArea, styles.largeTextArea]}
            value={content}
            onChangeText={setContent}
            placeholder="Main content (sermon notes, study material, lyrics, etc.)"
            placeholderTextColor={Colors.light.textLight}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="faith, prayer, worship (comma separated)"
            placeholderTextColor={Colors.light.textLight}
          />
          <Text style={styles.hint}>Separate tags with commas</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Make Public</Text>
              <Text style={styles.hint}>Allow all members to view this content</Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary + '40' }}
              thumbColor={isPublic ? Colors.light.primary : Colors.light.textLight}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            updateContentMutation.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleUpdate}
          disabled={updateContentMutation.isPending}
        >
          {updateContentMutation.isPending ? (
            <ActivityIndicator color={Colors.light.white} />
          ) : (
            <Text style={styles.submitButtonText}>Update Content</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: theme.spacing.sm,
  },
  hint: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  largeTextArea: {
    minHeight: 200,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  typeChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  typeTextActive: {
    color: Colors.light.white,
    fontWeight: '600' as const,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.small,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  errorText: {
    ...theme.typography.body,
    color: Colors.light.error,
    textAlign: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    marginTop: theme.spacing.md,
  },
});
