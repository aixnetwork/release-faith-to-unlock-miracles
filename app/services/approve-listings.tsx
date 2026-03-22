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
  Switch,
} from 'react-native';
import { Stack, router, useFocusEffect, useNavigation } from 'expo-router';
import { ArrowLeft, Check, X, Star } from 'lucide-react-native';
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
  organization_id?: string;
};

type ServiceType = {
  id: string;
  name: string;
};

type TabType = 'pending' | 'approved' | 'all';

export default function ApproveListingsScreen() {
  const navigation = useNavigation();
  const { isConnected } = useNetworkStatus();
  const { user } = useUserStore();

  const isOrganizer = user?.roleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID;
  const isAdmin = user?.roleId === ENV.EXPO_PUBLIC_DIRECTUS_ADMIN_ROLE_ID;

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingServices, setPendingServices] = useState<ServiceListing[]>([]);
  const [approvedServices, setApprovedServices] = useState<ServiceListing[]>([]);
  const [allServices, setAllServices] = useState<ServiceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serviceTypesMap, setServiceTypesMap] = useState<Map<string, string>>(new Map());
  const [featuredToggles, setFeaturedToggles] = useState<Map<string, boolean>>(new Map());

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation])
  );

  useEffect(() => {
    if (!isOrganizer && !isAdmin) {
      Alert.alert('Access Denied', 'You do not have permission to access this page.');
      router.back();
      return;
    }
    fetchListings();
  }, []);

  const fetchListings = async (isRefresh = false) => {
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

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      console.log('📡 Fetching listings for approval...');
      console.log('👤 User role:', { isAdmin, isOrganizer, organizationId: user?.organizationId });

      let url = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/services?sort=-date_created`;
      
      if (isOrganizer && user?.organizationId) {
        url += `&filter[organization_id][_eq]=${user.organizationId}`;
      }

      const [servicesResponse, serviceTypesResponse] = await Promise.all([
        fetch(url, {
          headers: {
            'Authorization': `Bearer ${user?.accessToken || ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(
          `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/service_types?fields=id,name`,
          {
            headers: {
              'Authorization': `Bearer ${user?.accessToken || ENV.EXPO_PUBLIC_API_TOKEN}`,
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
      
      const typesMap = new Map<string, string>();
      (serviceTypesData.data || []).forEach((type: ServiceType) => {
        typesMap.set(type.id, type.name);
      });
      setServiceTypesMap(typesMap);
      
      console.log('✅ Listings fetched:', data.data?.length || 0);
      console.log('✅ Service types fetched:', typesMap.size);

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
      setAllServices(mappedListings);

      const message = `Loaded ${mappedListings.length} listing${mappedListings.length !== 1 ? 's' : ''}`;
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('❌ Error fetching listings:', error);
      const message = 'Failed to load listings';
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

  const handleApprove = async (listingId: string) => {
    if (!isConnected) {
      Alert.alert('Network Error', 'No internet connection');
      return;
    }

    try {
      console.log('✅ Approving listing:', listingId);
      const isFeatured = featuredToggles.get(listingId) || false;
      console.log('📌 Featured status:', isFeatured);

      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/services/${listingId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${user?.accessToken || ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'approved',
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
            isFeatured: isFeatured,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to approve listing: ${response.status}`);
      }

      const message = isFeatured 
        ? 'Listing approved and marked as featured'
        : 'Listing approved successfully';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', message);
      }

      setFeaturedToggles(prev => {
        const newMap = new Map(prev);
        newMap.delete(listingId);
        return newMap;
      });
      fetchListings();
    } catch (error) {
      console.error('❌ Error approving listing:', error);
      const message = 'Failed to approve listing';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  const handleReject = async (listingId: string) => {
    Alert.alert(
      'Reject Listing',
      'Are you sure you want to reject this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('❌ Rejecting listing:', listingId);

              const response = await fetch(
                `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/services/${listingId}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${user?.accessToken || ENV.EXPO_PUBLIC_API_TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    status: 'rejected',
                    approved_by: user?.id,
                    approved_at: new Date().toISOString(),
                  }),
                }
              );

              if (!response.ok) {
                throw new Error(`Failed to reject listing: ${response.status}`);
              }

              const message = 'Listing rejected';
              if (Platform.OS === 'android') {
                ToastAndroid.show(message, ToastAndroid.SHORT);
              } else {
                Alert.alert('Success', message);
              }

              fetchListings();
            } catch (error) {
              console.error('❌ Error rejecting listing:', error);
              const message = 'Failed to reject listing';
              if (Platform.OS === 'android') {
                ToastAndroid.show(message, ToastAndroid.LONG);
              } else {
                Alert.alert('Error', message);
              }
            }
          },
        },
      ]
    );
  };

  const handleListingPress = (listing: ServiceListing) => {
    console.log('🎯 Listing pressed for approval:', listing.title);
    router.push({
      pathname: '/services/detail',
      params: { serviceId: listing.id, showApproval: 'true' }
    });
  };

  const toggleFeatured = (listingId: string) => {
    setFeaturedToggles(prev => {
      const newMap = new Map(prev);
      const currentValue = newMap.get(listingId) || false;
      newMap.set(listingId, !currentValue);
      return newMap;
    });
  };

  const renderListingItem = ({ item }: { item: ServiceListing }) => (
    <View style={styles.listingCard}>
      <ServiceListingCard
        listing={item}
        onPress={() => handleListingPress(item)}
        testID={`listing-${item.id}`}
      />
      {item.approvalStatus === 'pending_approval' && (
        <View>
          <View style={styles.featuredContainer}>
            <View style={styles.featuredLabelContainer}>
              <Star 
                size={18} 
                color={featuredToggles.get(item.id) ? Colors.light.warning : Colors.light.textLight}
                fill={featuredToggles.get(item.id) ? Colors.light.warning : 'transparent'}
              />
              <Text style={styles.featuredLabel}>Mark as Featured</Text>
            </View>
            <Switch
              value={featuredToggles.get(item.id) || false}
              onValueChange={() => toggleFeatured(item.id)}
              trackColor={{ false: '#d1d5db', true: Colors.light.primary }}
              thumbColor={Colors.light.white}
            />
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(item.id)}
            >
              <Check size={20} color={Colors.light.white} />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(item.id)}
            >
              <X size={20} color={Colors.light.white} />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const getCurrentServices = () => {
    switch (activeTab) {
      case 'pending':
        return pendingServices;
      case 'approved':
        return approvedServices;
      case 'all':
        return allServices;
      default:
        return [];
    }
  };

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
        <Text style={styles.headerTitle}>Approve Listings</Text>
        <View style={styles.headerSpacer} />
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
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All ({allServices.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      ) : (
        <FlatList
          data={getCurrentServices()}
          keyExtractor={(item) => item.id}
          renderItem={renderListingItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchListings(true)}
              colors={[Colors.light.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Listings Found</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'pending'
                  ? 'There are no listings awaiting approval.'
                  : activeTab === 'approved'
                  ? 'There are no approved listings.'
                  : 'There are no listings in the system.'}
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
  listingCard: {
    marginBottom: theme.spacing.md,
  },
  featuredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  featuredLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  featuredLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  approveButton: {
    backgroundColor: Colors.light.success,
  },
  rejectButton: {
    backgroundColor: Colors.light.error,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.white,
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
