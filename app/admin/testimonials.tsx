import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Search, Plus, Edit2, Trash2, X, Heart } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useTestimonialStore, Testimonial } from '@/store/testimonialStore';

export default function ManageTestimonialsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    testimonials, 
    isLoading, 
    fetchTestimonials, 
    addTestimonial 
  } = useTestimonialStore();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Filter testimonials based on search query
  const filteredTestimonials = (testimonials || []).filter(testimonial => {
    if (!testimonial) return false;
    return (
      (testimonial.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (testimonial.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (testimonial.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddTestimonial = () => {
    router.push('/admin/create-testimonial');
  };

  const handleEditTestimonial = (id: string) => {
    router.push(`/admin/edit-testimonial?id=${id}`);
  };

  const handleDeleteTestimonial = (id: string) => {
    Alert.alert(
      "Delete Testimonial",
      "Are you sure you want to delete this testimonial?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            // In a real app, this would call a delete function from the store
            Alert.alert("Success", "Testimonial deleted successfully");
          }
        }
      ]
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderTestimonialItem = ({ item }: { item: Testimonial }) => {
    if (!item) return null;
    
    return (
      <View style={styles.testimonialItem}>
        <View style={styles.testimonialHeader}>
          <Text style={styles.testimonialTitle}>{item.title || 'Untitled'}</Text>
          <View style={styles.likesContainer}>
            <Heart size={14} color={Colors.light.primary} fill={Colors.light.primary} />
            <Text style={styles.likesCount}>{item.likes || 0}</Text>
          </View>
        </View>
        <Text style={styles.testimonialAuthor}>By {item.author || 'Anonymous'}</Text>
        <Text style={styles.testimonialContent} numberOfLines={2}>
          {item.content || 'No content available'}
        </Text>
        <View style={styles.testimonialFooter}>
          <Text style={styles.testimonialDate}>
            {item.date ? new Date(item.date).toLocaleDateString() : 'Unknown date'}
          </Text>
          <View style={styles.testimonialActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditTestimonial(item.id)}
            >
              <Edit2 size={18} color={Colors.light.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteTestimonial(item.id)}
            >
              <Trash2 size={18} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading testimonials...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search testimonials..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textLight}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={Colors.light.textLight} />
            </TouchableOpacity>
          )}
        </View>
        
        <Button
          title="Add New"
          onPress={handleAddTestimonial}
          size="small"
          icon={<Plus size={16} color={Colors.light.white} />}
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={filteredTestimonials}
        keyExtractor={(item) => item?.id || Math.random().toString()}
        renderItem={renderTestimonialItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Testimonials</Text>
            <Text style={styles.listCount}>{filteredTestimonials.length} items</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No testimonials found</Text>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
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
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.md,
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
    color: Colors.light.textLight,
  },
  testimonialItem: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  testimonialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  testimonialTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '15',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  likesCount: {
    ...theme.typography.caption,
    color: Colors.light.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  testimonialAuthor: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginBottom: theme.spacing.sm,
  },
  testimonialContent: {
    ...theme.typography.body,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  testimonialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  testimonialDate: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  testimonialActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
});