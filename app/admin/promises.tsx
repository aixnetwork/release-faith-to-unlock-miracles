import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { promises } from '@/mocks/promises';
import { Image } from 'expo-image';
import { getSafeImageSource, FALLBACK_IMAGES } from '@/utils/imageUtils';

interface Promise {
  id: string;
  verse: string;
  reference: string;
  imageUrl: string;
}

export default function ManagePromisesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [promisesList, setPromisesList] = useState(promises);

  // Filter promises based on search query
  const filteredPromises = promisesList.filter(promise => {
    return (
      promise.verse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promise.reference.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddPromise = () => {
    router.push('/admin/create-promise');
  };

  const handleEditPromise = (id: string) => {
    router.push(`/admin/edit-promise?id=${id}`);
  };

  const handleDeletePromise = (id: string) => {
    Alert.alert(
      "Delete Promise",
      "Are you sure you want to delete this promise?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            // Remove the promise from the list
            setPromisesList(promisesList.filter(promise => promise.id !== id));
          }
        }
      ]
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderPromiseItem = ({ item }: { item: Promise }) => (
    <View style={styles.promiseItem}>
      <View style={styles.promiseImageContainer}>
        <Image
          source={getSafeImageSource(item.imageUrl, FALLBACK_IMAGES.promise)}
          style={styles.promiseImage}
          contentFit="cover"
        />
      </View>
      <View style={styles.promiseContent}>
        <Text style={styles.promiseReference}>{item.reference}</Text>
        <Text style={styles.promiseVerse} numberOfLines={2}>{item.verse}</Text>
      </View>
      <View style={styles.promiseActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditPromise(item.id)}
        >
          <Edit2 size={18} color={Colors.light.tint} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeletePromise(item.id)}
        >
          <Trash2 size={18} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.icon} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search promises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.icon}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={Colors.light.icon} />
            </TouchableOpacity>
          )}
        </View>
        
        <Button
          title="Add New"
          onPress={handleAddPromise}
          size="small"
          icon={<Plus size={16} color={Colors.light.background} />}
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={filteredPromises}
        keyExtractor={(item) => item.id}
        renderItem={renderPromiseItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Bible Promises</Text>
            <Text style={styles.listCount}>{filteredPromises.length} items</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No promises found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    color: Colors.light.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  addButton: {
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  listTitle: {
    ...theme.typography.subtitle,
  },
  listCount: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  promiseItem: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  promiseImageContainer: {
    width: 80,
    height: 80,
  },
  promiseImage: {
    width: '100%',
    height: '100%',
  },
  promiseContent: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  promiseReference: {
    ...theme.typography.caption,
    color: Colors.light.tint,
    fontWeight: '600',
    marginBottom: 4,
  },
  promiseVerse: {
    ...theme.typography.body,
    fontSize: 14,
  },
  promiseActions: {
    justifyContent: 'center',
    padding: theme.spacing.sm,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: Colors.light.icon,
  },
});