import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Save, X, Upload, Calendar, Users } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { trpc } from '@/lib/trpc';
import { useUserStore } from '@/store/userStore';

const CONTENT_TYPES = [
  { id: 'sermons', name: 'Sermon', icon: '🎤' },
  { id: 'bible-studies', name: 'Bible Study', icon: '📖' },
  { id: 'worship-songs', name: 'Worship Song', icon: '🎵' },
  { id: 'events', name: 'Event', icon: '📅' },
  { id: 'articles', name: 'Article', icon: '📝' },
  { id: 'videos', name: 'Video', icon: '🎥' },
];

export default function NewContentScreen() {
  const params = useLocalSearchParams();
  const preselectedCategory = params.category as string;
  
  const [contentType, setContentType] = useState(preselectedCategory || 'sermons');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { organization } = useUserStore();
  const createContentMutation = trpc.content.create.useMutation();

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!organization?.id) {
      Alert.alert('Error', 'No organization found');
      return;
    }

    setIsSaving(true);

    try {
      await createContentMutation.mutateAsync({
        contentType: contentType as any,
        title,
        description,
        content,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        isPublic,
        scheduledDate: scheduledDate || undefined,
        organizationId: organization.id,
      });

      Alert.alert(
        'Success',
        'Content created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating content:', error);
      Alert.alert('Error', 'Failed to create content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const selectedType = CONTENT_TYPES.find(type => type.id === contentType);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Create Content',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.textPrimary,
          headerTitleStyle: { color: Colors.light.textPrimary },
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <X size={24} color={Colors.light.textPrimary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Save size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Content Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
            {CONTENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  contentType === type.id && styles.typeButtonActive
                ]}
                onPress={() => setContentType(type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeButtonText,
                  contentType === type.id && styles.typeButtonTextActive
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder={`Enter ${selectedType?.name.toLowerCase()} title`}
              placeholderTextColor={Colors.light.inputPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter a brief description"
              placeholderTextColor={Colors.light.inputPlaceholder}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tags</Text>
            <TextInput
              style={styles.textInput}
              value={tags}
              onChangeText={setTags}
              placeholder="Enter tags separated by commas"
              placeholderTextColor={Colors.light.inputPlaceholder}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {contentType === 'sermons' ? 'Sermon Notes' :
               contentType === 'bible-studies' ? 'Study Material' :
               contentType === 'worship-songs' ? 'Lyrics' :
               contentType === 'events' ? 'Event Details' :
               'Content'}
            </Text>
            <TextInput
              style={[styles.textInput, styles.contentArea]}
              value={content}
              onChangeText={setContent}
              placeholder={`Enter ${selectedType?.name.toLowerCase()} content`}
              placeholderTextColor={Colors.light.inputPlaceholder}
              multiline
              numberOfLines={10}
            />
          </View>
        </View>

        {/* Media Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media</Text>
          
          <TouchableOpacity style={styles.uploadButton}>
            <Upload size={24} color={Colors.light.primary} />
            <Text style={styles.uploadButtonText}>Upload Files</Text>
            <Text style={styles.uploadButtonSubtext}>Images, videos, audio, documents</Text>
          </TouchableOpacity>
        </View>

        {/* Publishing Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publishing Options</Text>
          
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Users size={20} color={Colors.light.textMedium} />
              <Text style={styles.optionLabel}>Public Content</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, isPublic && styles.toggleActive]}
              onPress={() => setIsPublic(!isPublic)}
            >
              <View style={[styles.toggleThumb, isPublic && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Schedule Publication</Text>
            <TouchableOpacity style={styles.dateButton}>
              <Calendar size={20} color={Colors.light.textMedium} />
              <Text style={styles.dateButtonText}>
                {scheduledDate || 'Publish immediately'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Save as Draft"
            variant="outline"
            onPress={() => {
              // Save as draft logic
              Alert.alert('Success', 'Content saved as draft');
            }}
            style={styles.actionButton}
          />
          <Button
            title="Publish"
            onPress={handleSave}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </View>
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
    fontSize: 16,
    marginBottom: theme.spacing.md,
    color: Colors.light.textPrimary,
  },
  typeSelector: {
    marginBottom: theme.spacing.sm,
  },
  typeButton: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  typeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  typeButtonText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  typeButtonTextActive: {
    color: Colors.light.white,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    color: Colors.light.textPrimary,
  },
  textInput: {
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.inputText,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  contentArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  uploadButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.primary,
    marginTop: theme.spacing.sm,
  },
  uploadButtonSubtext: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    marginTop: theme.spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
    color: Colors.light.textPrimary,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: Colors.light.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.light.white,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  dateButton: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButtonText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.sm,
    color: Colors.light.textMedium,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
  },
  actionButton: {
    flex: 1,
  },
});