import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Search, Filter, Plus } from 'lucide-react-native';
import { ServiceListingCard } from '@/components/ServiceListingCard';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { trpc } from '@/lib/trpc';
import type { ServiceListing, ServiceCategory } from '@/types';

export default function ServicesMarketplaceScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    listings,
    searchQuery,
    selectedCategory,
    priceFilter,
    error,
    setListings,
    setSearchQuery,
    setSelectedCategory,
    setPriceFilter,
    setLoading,
    setError,
    getFilteredListings,
    clearFilters,
  } = useMarketplaceStore();
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log('🔗 Marketplace: Checking params:', params);
    const categoryParam = params?.category;
    if (categoryParam && typeof categoryParam === 'string' && categoryParam.length > 0) {
      const cat = categoryParam as ServiceCategory;
      console.log('🔗 Marketplace: Setting category from params:', cat);
      setSelectedCategory(cat);
      setShowFilters(true);
      console.log('✅ Marketplace: Pre-selected category from params:', cat);
    } else {
      console.log('🔗 Marketplace: No valid category in params');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.category, setSelectedCategory]);
  
  console.log('🏪 Marketplace: Current state:', {
    selectedCategory,
    searchQuery,
    priceFilter,
    listingsCount: listings.length
  });

  // Fetch listings with fallback to mock data
  const listingsQuery = trpc.marketplace.getListings.useQuery({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    priceType: priceFilter || undefined,
  }, {
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: false,
  });

  useEffect(() => {
    if (listingsQuery.data?.success) {
      console.log('✅ Marketplace: Loaded listings from API:', listingsQuery.data.listings.length);
      setListings(listingsQuery.data.listings);
      setError(null);
    } else if (listingsQuery.error) {
      console.log('📋 Marketplace: Using offline mock data (backend unavailable)');
      setError(null);
    }
    setLoading(listingsQuery.isLoading);
  }, [listingsQuery.data, listingsQuery.error, listingsQuery.isLoading, setListings, setError, setLoading]);
  
  // Auto-show filters when a category is pre-selected
  useEffect(() => {
    if (selectedCategory && !showFilters) {
      console.log('🏷️ Marketplace: Auto-showing filters for category:', selectedCategory);
      setShowFilters(true);
    }
  }, [selectedCategory, showFilters]);
  
  // Refetch when category changes (disabled for offline mode)
  useEffect(() => {
    console.log('🔄 Marketplace: Using store-based filtering for:', selectedCategory);
  }, [selectedCategory, searchQuery, priceFilter]);

  // Marketplace is always enabled for now

  const handleRefresh = async () => {
    setRefreshing(true);
    await listingsQuery.refetch();
    setRefreshing(false);
  };

  const handleListingPress = (listing: ServiceListing) => {
    Alert.alert(
      listing.title,
      `Provider: ${listing.provider.name}\nPrice: ${formatPrice(listing)}\n\n${listing.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Provider', onPress: () => handleContact(listing) },
      ]
    );
  };

  const handleContact = (listing: ServiceListing) => {
    switch (listing.contactMethod) {
      case 'in-app':
        Alert.alert('Contact', 'In-app messaging feature coming soon!');
        break;
      case 'email':
        Alert.alert('Email', `Contact: ${listing.contactValue}`);
        break;
      case 'phone':
        Alert.alert('Phone', `Call: ${listing.contactValue}`);
        break;
    }
  };

  const formatPrice = (listing: ServiceListing) => {
    switch (listing.priceType) {
      case 'free':
        return 'Free';
      case 'donation':
        return 'Donation';
      case 'fixed':
        return `$${listing.price}`;
      case 'hourly':
        return `$${listing.price}/hr`;
      default:
        return 'Contact for pricing';
    }
  };

  const categories: ServiceCategory[] = [
    'spiritual-guidance',
    'counseling',
    'music-ministry',
    'event-planning',
    'education',
    'technology',
    'creative-services',
    'business-consulting',
    'financial-services',
    'health-wellness',
    'childcare',
    'home-repair',
    'cleaning',
    'transportation',
    'tutoring',
    'other'
  ];

  const getCategoryLabel = (category: ServiceCategory) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredListings = getFilteredListings();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Services Marketplace',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => router.push('/services/new')}
                style={styles.headerButton}
              >
                <Plus size={24} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                style={styles.headerButton}
              >
                <Filter size={24} color="#666" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="marketplace-search-input"
          />
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedCategory && styles.filterChipActive
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.filterChipText,
                !selectedCategory && styles.filterChipTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.filterChipActive
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === category ? null : category
                )}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCategory === category && styles.filterChipTextActive
                ]}>
                  {getCategoryLabel(category)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.priceFiltersSection}>
            <Text style={styles.priceFilterLabel}>Price Type:</Text>
            <View style={styles.priceFilters}>
              <TouchableOpacity
                style={[
                  styles.priceFilterChip,
                  !priceFilter && styles.priceFilterChipActive
                ]}
                onPress={() => setPriceFilter(null)}
              >
                <Text style={[
                  styles.priceFilterText,
                  !priceFilter && styles.priceFilterTextActive
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {(['free', 'fixed', 'hourly', 'donation'] as const).map((price) => (
                <TouchableOpacity
                  key={price}
                  style={[
                    styles.priceFilterChip,
                    priceFilter === price && styles.priceFilterChipActive
                  ]}
                  onPress={() => setPriceFilter(
                    priceFilter === price ? null : price
                  )}
                >
                  <Text style={[
                    styles.priceFilterText,
                    priceFilter === price && styles.priceFilterTextActive
                  ]}>
                    {price.charAt(0).toUpperCase() + price.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceListingCard
            listing={item}
            onPress={() => handleListingPress(item)}
            testID={`service-listing-${item.id}`}
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Services Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory || priceFilter
                ? 'Try adjusting your filters to see more results.'
                : 'Be the first to list a service in the marketplace!'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  disabledTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  disabledText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 16,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  priceFiltersSection: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  priceFilterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  priceFilters: {
    flexDirection: 'row',
  },
  priceFilterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  priceFilterChipActive: {
    backgroundColor: '#10B981',
  },
  priceFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  priceFilterTextActive: {
    color: '#FFFFFF',
  },
  clearFiltersButton: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 12,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
});