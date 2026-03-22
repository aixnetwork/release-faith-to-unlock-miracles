import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  ToastAndroid,
  Alert,
  RefreshControl,
} from 'react-native';
import { Stack, router, useFocusEffect, useNavigation } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { ServiceListingCard } from '@/components/ServiceListingCard';
import { ENV } from '@/config/env';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useUserStore } from '@/store/userStore';
import type { ServiceListing } from '@/types';

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
};

type ServiceType = {
  id: string;
  name: string;
};

type TabType = 'pending' | 'approved';

export default function MyListingsScreen() {
  const navigation = useNavigation();
  const { isConnected } = useNetworkStatus();
  const { user } = useUserStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingServices, setPendingServices] = useState<ServiceListing[]>([]);
  const [approvedServices, setApprovedServices] = useState<ServiceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<Map<string, string>>(new Map());

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation])
  );

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async (isRefresh = false) => {
    if (!isConnected) {
      const message = 'No internet connection. Please check your network.';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Network Error', message);
      }
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (!user?.id) {
      const message = 'Please log in to view your listings';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Error', message);
      }
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      console.log('📡 Fetching my listings for user:', user.id);

      const [servicesResponse, serviceTypesResponse] = await Promise.all([
        fetch(
          `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/services?filter[user_id][_eq]=${user.id}&sort=-date_created`,
          {
            headers: {
              'Authorization': `Bearer ${user.accessToken || ENV.EXPO_PUBLIC_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        ),
        fetch(
          `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/service_types?fields=id,name`,
          {
            headers: {
              'Authorization': `Bearer ${user.accessToken || ENV.EXPO_PUBLIC_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        )
      ]);

      if (!servicesResponse.ok) {
        throw new Error(`Failed to fetch services: ${servicesResponse.status}`);
      }

      if (!serviceTypesResponse.ok) {
        throw new Error(`Failed to fetch service types: ${serviceTypesResponse.status}`);
      }

      const data = await servicesResponse.json();
      const serviceTypesData = await serviceTypesResponse.json();
      
      const serviceTypesMap = new Map<string, string>();
      (serviceTypesData.data || []).forEach((type: ServiceType) => {
        serviceTypesMap.set(type.id, type.name);
      });
      setServiceTypes(serviceTypesMap);
      
      console.log('✅ My listings fetched:', data.data?.length || 0);
      console.log('✅ Service types fetched:', serviceTypesMap.size);

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

        const serviceName = serviceTypesMap.get(service.service_type_id) || 'Other';
        
        return {
          id: service.id,
          title: service.title,
          category: serviceName,
          description: service.description || '',
          priceType: service.price_type || 'free',
          price: service.price || 0,
          provider: {
            id: service.user_id,
            name: user.name || 'Service Provider',
            rating: 5.0,
            reviewCount: 0,
          },
          location: {
            city: service.location || 'Online',
          },
          rating: 5.0,
          featured: false,
          tags: parsedTags,
          images: [],
          approvalStatus: service.status as any,
        };
      });

      const pending = mappedListings.filter(s => s.approvalStatus === 'pending_approval');
      const approved = mappedListings.filter(s => s.approvalStatus === 'approved');

      setPendingServices(pending);
      setApprovedServices(approved);

      const message = `Loaded ${mappedListings.length} listing${mappedListings.length !== 1 ? 's' : ''}`;
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('❌ Error fetching my listings:', error);
      const message = 'Failed to load your listings';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleListingPress = (listing: ServiceListing) => {
    console.log('🎯 My listing pressed:', listing.title);
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

  const currentServices = activeTab === 'pending' ? pendingServices : approvedServices;

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
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity 
          onPress={() => router.push('/services/new')}
          style={styles.addButton}
        >
          <Plus size={24} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending ({pendingServices.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'approved' && styles.tabActive]}
          onPress={() => setActiveTab('approved')}
        >
          <Text style={[styles.tabText, activeTab === 'approved' && styles.tabTextActive]}>
            Approved ({approvedServices.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      ) : (
        <FlatList
          data={currentServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceListingCard
              listing={item}
              onPress={() => handleListingPress(item)}
              testID={`my-listing-${item.id}`}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchMyListings(true)}
              colors={[Colors.light.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                {activeTab === 'pending' ? 'No Pending Listings' : 'No Approved Listings'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'pending'
                  ? 'You have no listings awaiting approval.'
                  : 'You have no approved listings yet.'}
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/services/new')}
              >
                <Plus size={20} color={Colors.light.white} />
                <Text style={styles.createButtonText}>Create New Listing</Text>
              </TouchableOpacity>
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
  addButton: {
    padding: theme.spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textLight,
  },
  tabTextActive: {
    color: Colors.light.primary,
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
    marginBottom: theme.spacing.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
    marginLeft: theme.spacing.sm,
  },
});
