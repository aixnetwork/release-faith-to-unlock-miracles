import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, router, useNavigation, useFocusEffect } from 'expo-router';
import { Search, Filter, ArrowLeft } from 'lucide-react-native';
import { ServiceListingCard } from '@/components/ServiceListingCard';
import { ENV } from '@/config/env';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useUserStore } from '@/store/userStore';
import type { ServiceListing } from '@/types';
import { fetchWithAuth, isTokenExpiredError } from '@/utils/authUtils';

type Service = {
  id: string;
  title: string;
  description: string;
  price_type: string;
  price: number;
  location: string;
  user_id: string;
  service_type_id: string;
  tags: string | string[];
  status: string;
  isFeatured?: boolean;
};

type ServiceType = {
  id: string;
  name: string;
  icon: string | null;
};

export default function ServiceListingScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const { isConnected } = useNetworkStatus();
  const { user } = useUserStore();
  const serviceTypeId = params.serviceTypeId as string;
  const featuredOnly = params.featured === 'true';
  
  const isAdmin = user?.roleId === ENV.EXPO_PUBLIC_DIRECTUS_ADMIN_ROLE_ID;
  const isOrganizer = user?.roleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID;

  const [services, setServices] = useState<ServiceListing[]>([]);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [serviceTypesMap, setServiceTypesMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation])
  );

  useEffect(() => {
    if (serviceTypeId || featuredOnly) {
      fetchServiceTypeAndServices();
    }
  }, [serviceTypeId, featuredOnly]);

  const fetchServiceTypeAndServices = async () => {
    if (!isConnected) {
      const message = 'No internet connection. Please check your network.';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Network Error', message);
      }
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('📡 Fetching services:', { serviceTypeId, featuredOnly });
      console.log('👤 User role:', { isAdmin, isOrganizer, roleId: user?.roleId });
      
      const statusFilter = '&filter[status][_eq]=approved';
      const featuredFilter = featuredOnly ? '&filter[isFeatured][_eq]=true' : '';
      const serviceTypeFilter = serviceTypeId ? `filter[service_type_id][_eq]=${serviceTypeId}&` : '';
      const organizationFilter = user?.organizationId ? `&filter[organization_id][_eq]=${user.organizationId}` : '';
      
      console.log('🏢 Filtering services for organization ID:', user?.organizationId);
      
      const promises: Promise<Response>[] = [
        fetchWithAuth(
          `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/services?${serviceTypeFilter}${statusFilter}${featuredFilter}${organizationFilter}&sort=-date_created`
        ),
      ];
      
      if (serviceTypeId) {
        promises.push(
          fetch(
            `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/service_types/${serviceTypeId}`,
            {
              headers: {
                'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
                'Content-Type': 'application/json',
              },
            }
          )
        );
      }
      
      promises.push(
        fetch(
          `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/service_types?fields=id,name`,
          {
            headers: {
              'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );
      
      const responses = await Promise.all(promises);
      const servicesResponse = responses[0];
      const serviceTypeResponse = serviceTypeId ? responses[1] : null;
      const serviceTypesResponse = serviceTypeId ? responses[2] : responses[1];

      if (!servicesResponse.ok) {
        const errorData = await servicesResponse.json().catch(() => ({}));
        if (isTokenExpiredError(errorData)) {
          console.log('🔄 Token expired, user will be redirected to login');
          return;
        }
        throw new Error(`Failed to fetch services: ${servicesResponse.status}`);
      }

      if (serviceTypeResponse && !serviceTypeResponse.ok) {
        throw new Error(`Failed to fetch service type: ${serviceTypeResponse.status}`);
      }

      if (!serviceTypesResponse.ok) {
        throw new Error(`Failed to fetch service types: ${serviceTypesResponse.status}`);
      }

      const data = await servicesResponse.json();
      const serviceTypeData = serviceTypeResponse ? await serviceTypeResponse.json() : null;
      const serviceTypesData = await serviceTypesResponse.json();
      
      if (serviceTypeData) {
        setServiceType(serviceTypeData.data);
      }
      
      const typesMap = new Map<string, string>();
      (serviceTypesData.data || []).forEach((type: ServiceType) => {
        typesMap.set(type.id, type.name);
      });
      setServiceTypesMap(typesMap);
      
      console.log('✅ Services fetched:', data.data?.length || 0);
      console.log('✅ Service type fetched:', serviceTypeData?.data?.name || 'All Featured');
      console.log('✅ Service types map size:', typesMap.size);
      
      const mappedListings: ServiceListing[] = (data.data || []).map((service: Service) => {
        let parsedTags: string[] = [];
        if (typeof service.tags === 'string') {
          try {
            parsedTags = JSON.parse(service.tags);
          } catch {
            parsedTags = [];
          }
        } else if (Array.isArray(service.tags)) {
          parsedTags = service.tags;
        }

        return {
          id: service.id,
          title: service.title,
          category: typesMap.get(service.service_type_id) || 'Other',
          description: service.description || '',
          priceType: service.price_type || 'free',
          price: service.price || 0,
          provider: {
            id: service.user_id,
            name: 'Service Provider',
            rating: 5.0,
            reviewCount: 0,
          },
          location: {
            city: service.location || 'Online',
          },
          rating: 5.0,
          featured: service.isFeatured || false,
          tags: parsedTags,
          images: [],
        };
      });
      
      setServices(mappedListings);
      
      const message = `Loaded ${mappedListings.length} service${mappedListings.length !== 1 ? 's' : ''}`;
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      const message = 'Failed to load services';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleListingPress = (listing: ServiceListing) => {
    console.log('🎯 Service listing pressed:', listing.title);
    router.push({
      pathname: '/services/detail',
      params: { serviceId: listing.id }
    });
  };

  const formatPrice = (listing: ServiceListing) => {
    switch (listing.priceType) {
      case 'free':
        return 'Free';
      case 'donation':
        return 'Donation';
      case 'fixed':
        return `${Number(listing.price ?? 0).toFixed(2)}`;
      case 'hourly':
        return `${Number(listing.price ?? 0).toFixed(2)} / hr`;
      default:
        return 'Contact for pricing';
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = searchQuery
      ? service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesPrice = priceFilter
      ? service.priceType === priceFilter
      : true;

    return matchesSearch && matchesPrice;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {featuredOnly ? 'Featured Services' : (serviceType?.name || 'Services')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="service-search-input"
          />
        </View>
      </View>

      <View style={styles.priceFiltersContainer}>
        <Text style={styles.filterLabel}>Price Type:</Text>
        <View style={styles.priceFilters}>
          <TouchableOpacity
            style={[
              styles.priceFilterChip,
              priceFilter === null && styles.priceFilterChipActive
            ]}
            onPress={() => setPriceFilter(null)}
          >
            <Text style={[
              styles.priceFilterText,
              priceFilter === null && styles.priceFilterTextActive
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
              onPress={() => setPriceFilter(price)}
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceListingCard
              listing={item}
              onPress={() => handleListingPress(item)}
              testID={`service-listing-${item.id}`}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Services Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || priceFilter
                  ? 'Try adjusting your filters to see more results.'
                  : `No services available in ${serviceType?.name || 'this category'} yet.`}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  priceFiltersContainer: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  priceFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priceFilterChip: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  priceFilterChipActive: {
    backgroundColor: Colors.light.success,
  },
  priceFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMedium,
  },
  priceFilterTextActive: {
    color: Colors.light.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.textLight,
    marginTop: theme.spacing.md,
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textLight,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.xl,
  },
});
