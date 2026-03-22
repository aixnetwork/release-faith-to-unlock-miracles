import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, FlatList, TextInput, ActivityIndicator, ToastAndroid, Alert } from 'react-native';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { Store, Plus, Search, Star, MapPin, ArrowLeft, Briefcase, Heart, Music, Users, BookOpen, Wrench, DollarSign, Laptop, Baby, GraduationCap, Stethoscope, Home, List, CheckSquare } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { useMarketplaceStore } from '@/store/marketplaceStore';
import { ServiceListingCard } from '@/components/ServiceListingCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Haptics from 'expo-haptics';
import type { ServiceCategory, ServiceListing } from '@/types';
import { ENV } from '@/config/env';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

type ServiceType = {
  id: string;
  name: string;
  icon: string | null;
  status: string;
};

const getIconComponent = (iconName: string | null) => {
  const iconMap: Record<string, any> = {
    'briefcase': Briefcase,
    'heart': Heart,
    'music': Music,
    'users': Users,
    'book-open': BookOpen,
    'wrench': Wrench,
    'dollar-sign': DollarSign,
    'laptop': Laptop,
    'baby': Baby,
    'graduation-cap': GraduationCap,
    'stethoscope': Stethoscope,
    'home': Home,
  };

  if (!iconName) return Store;
  return iconMap[iconName.toLowerCase()] || Store;
};

export default function ServicesScreen() {
  const { isLoggedIn, user } = useUserStore();
  const insets = useSafeAreaInsets();
  const isOrganizer = user?.roleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID;
  const isAdmin = user?.roleId === ENV.EXPO_PUBLIC_DIRECTUS_ADMIN_ROLE_ID;
  const isSuperAdmin = user?.isAdmin === true;
  const canApprove = isOrganizer || isAdmin || isSuperAdmin;
  const navigation = useNavigation();
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(true);
  const { isConnected } = useNetworkStatus();
  
  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) {
        console.log('User not logged in, redirecting to login...');
        router.replace('/login');
        return;
      }

      navigation.setOptions({
        headerShown: true,
        title: 'Services',
        headerStyle: { backgroundColor: Colors.light.background },
        headerTintColor: Colors.light.text,
      });
    }, [navigation, isLoggedIn])
  );



  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    if (!isConnected) {
      const message = 'No internet connection. Please check your network.';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Network Error', message);
      }
      setLoadingServiceTypes(false);
      return;
    }

    try {
      setLoadingServiceTypes(true);
      console.log('📡 Fetching service types from API...');
      
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/service_types?sort=sort`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch service types: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Service types fetched:', data.data?.length || 0);
      
      setServiceTypes(data.data || []);
      
      const message = `Loaded ${data.data?.length || 0} service types`;
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('❌ Error fetching service types:', error);
      const message = 'Failed to load service types';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLoadingServiceTypes(false);
    }
  };

  const { 
    listings, 
    searchQuery,
    selectedCategory,
    priceFilter,
    setListings, 
    setSearchQuery,
    getCategoryCount,
    getFilteredListings,
    clearFilters
  } = useMarketplaceStore();
  
  useEffect(() => {
    fetchListings();
  }, [user?.organizationId]);

  const fetchListings = async () => {
    if (!isConnected) {
      return;
    }

    try {
      console.log('📡 Fetching services from API...');
      console.log('🏢 User organization ID:', user?.organizationId);
      
      let servicesUrl = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/services?filter[status][_eq]=approved&sort=-date_created`;
      
      if (user?.organizationId) {
        servicesUrl = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/services?filter[status][_eq]=approved&filter[organization_id][_eq]=${user.organizationId}&sort=-date_created`;
        console.log('🏢 Filtering services for organization ID:', user.organizationId);
      } else {
        console.log('⚠️ No organization ID found, showing all approved services');
      }
      
      const [servicesResponse, serviceTypesResponse] = await Promise.all([
        fetch(
          servicesUrl,
          {
            headers: {
              'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        ),
        fetch(
          `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/service_types?fields=id,name`,
          {
            headers: {
              'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
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
      
      console.log('✅ Services fetched:', data.data?.length || 0);
      console.log('✅ Service types fetched:', serviceTypesMap.size);
      
      const mappedListings = (data.data || []).map((service: any) => ({
        id: service.id,
        title: service.title,
        category: service.service_type_id || 'other',
        categoryName: serviceTypesMap.get(service.service_type_id) || 'Other',
        description: service.description || '',
        priceType: service.price_type || 'free',
        price: Number(service.price || 0),
        provider: {
          id: service.user_id,
          name: 'Service Provider',
          rating: 5.0,
          reviewCount: 0,
          verified: false
        },
        location: {
          city: service.location || 'Online'
        },
        rating: 5.0,
        featured: service.isFeatured || false,
        tags: service.tags || [],
        isActive: service.status === 'approved',
        isApproved: service.status === 'approved',
        approvalStatus: service.status,
        images: [],
        currency: 'USD',
        contactMethod: 'email' as const,
        createdAt: service.date_created || new Date().toISOString(),
        updatedAt: service.date_updated || new Date().toISOString(),
        providerId: service.user_id
      }));
      
      setListings(mappedListings);
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      const message = 'Failed to load services';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Error', message);
      }
    }
  };
  
  useEffect(() => {
    console.log('📊 Services Tab: Current store state:', {
      listingsCount: listings.length,
      hasListings: listings.length > 0,
      sampleCategories: listings.slice(0, 3).map(l => l.category)
    });
  }, [listings]);

  const handleFeaturePress = (action: string) => {
    // Input validation
    if (!action?.trim()) {
      console.log('❌ Services Tab: Empty action provided');
      return;
    }
    if (action.length > 50) {
      console.log('❌ Services Tab: Action too long');
      return;
    }
    const sanitizedAction = action.trim();
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    console.log('🔄 Services Tab: Feature press action:', sanitizedAction);

    switch (action) {
      case 'browse':
        console.log('🔄 Services Tab: Showing marketplace...');
        // Clear any existing filters first
        clearFilters();
        setShowMarketplace(true);
        break;
      case 'create':
        console.log('🔄 Services Tab: Navigating to create service...');
        router.push('/services/new');
        break;
      case 'search':
        console.log('🔄 Services Tab: Showing marketplace with search...');
        setShowMarketplace(true);
        setShowFilters(true);
        break;
      default:
        console.log('❌ Services Tab: Unknown action:', sanitizedAction);
    }
  };
  
  const handleCategoryPress = (serviceTypeId: string) => {
    console.log('🏷️ Services Tab: Category press started, serviceTypeId:', serviceTypeId);
    
    if (!serviceTypeId?.trim()) {
      console.log('❌ Services Tab: Invalid serviceTypeId:', serviceTypeId);
      return;
    }
    
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      console.log('🔄 Services Tab: Navigating to service listing page with serviceTypeId:', serviceTypeId);
      router.push(`/services/listing?serviceTypeId=${serviceTypeId}`);
      
      console.log('✅ Services Tab: Navigation completed');
    } catch (error) {
      console.error('❌ Services Tab: Error in handleCategoryPress:', error);
    }
  };

  const handleGetStarted = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    console.log('🚀 Services Tab: Get started pressed, isLoggedIn:', isLoggedIn);
    
    if (isLoggedIn) {
      console.log('🔄 Services Tab: Showing marketplace...');
      setShowMarketplace(true);
    } else {
      console.log('🔄 Services Tab: Navigating to login...');
      router.push('/login');
    }
  };

  const handleListingPress = (listing: ServiceListing) => {
    console.log('🎯 Service listing pressed:', listing.title);
    // For now, just log - in a real app you'd navigate to service details
  };

  const categories = serviceTypes.map(type => ({
    key: type.id as ServiceCategory,
    name: type.name,
    icon: type.icon,
    id: type.id
  }));

  const getCategoryLabel = (category: ServiceCategory) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredListings = getFilteredListings();

  // Individual Plan Restriction
  // if (isIndividualPlan) {
  //   return (
  //     <View style={styles.container}>
  //       <View style={styles.header}>
  //         <View style={styles.headerContent}>
  //           <Store size={32} color={Colors.light.primary} />
  //           <Text style={styles.title}>Services Marketplace</Text>
  //           <Text style={styles.subtitle}>
  //             Connect with faith-based service providers
  //           </Text>
  //         </View>
  //       </View>
  //       
  //       <View style={styles.emptyContainer}>
  //         <Store size={64} color={Colors.light.textLight} />
  //         <Text style={styles.emptyTitle}>Church Community Feature</Text>
  //         <Text style={styles.emptyText}>
  //           The Services Marketplace allows church members to offer and find services within their community.
  //           Join a church group to access this feature.
  //         </Text>
  //         <Button
  //           title="Find a Church"
  //           onPress={() => router.push('/groups')}
  //           style={styles.ctaButton}
  //           leftIcon={<Users size={18} color={Colors.light.white} />}
  //         />
  //       </View>
  //     </View>
  //   );
  // }

  // If showing marketplace, render the marketplace view
  if (showMarketplace) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.marketplaceHeader}>
          <TouchableOpacity 
            onPress={() => setShowMarketplace(false)}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={Colors.light.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.marketplaceTitle}>Services Marketplace</Text>
          <TouchableOpacity
            onPress={() => router.push('/services/new')}
            style={styles.addButton}
          >
            <Plus size={24} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
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



        {/* Services List */}
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
      </View>
    );
  }

  // Default overview screen
  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Store size={32} color={Colors.light.primary} />
          <Text style={styles.title}>Services Marketplace</Text>
          <Text style={styles.subtitle}>
            Connect with faith-based service providers in your community
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            style={[styles.quickActionSmall, styles.primaryAction]}
            onPress={() => {
              console.log('🎯 Browse Services button pressed');
              handleFeaturePress('browse');
            }}
            testID="browse-services-button"
          >
            <Search size={20} color="#ffffff" />
            <Text style={styles.quickActionTextWhite}>Browse</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionSmall}
            onPress={() => handleFeaturePress('create')}
            testID="list-service-button"
          >
            <Plus size={20} color={Colors.light.primary} />
            <Text style={styles.quickActionText}>List</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionSmall}
            onPress={() => router.push('/services/my-listings')}
            testID="my-listings-button"
          >
            <List size={20} color={Colors.light.primary} />
            <Text style={styles.quickActionText}>My Listings</Text>
          </TouchableOpacity>
          
          {canApprove && (
            <TouchableOpacity 
              style={styles.quickActionSmall}
              onPress={() => router.push('/services/approve-listings')}
              testID="approve-listings-button"
            >
              <CheckSquare size={20} color={Colors.light.success} />
              <Text style={styles.quickActionText}>Approve</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        {loadingServiceTypes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading service types...</Text>
          </View>
        ) : (
          <View style={styles.categoriesGrid}>
            {categories.map((category) => {
              const count = getCategoryCount(category.key);
              const IconComponent = getIconComponent(category.icon);
              console.log(`📊 Category ${category.key}: ${count} services`);
              return (
                <TouchableOpacity 
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    Platform.OS === 'web' && styles.categoryCardWeb
                  ]}
                  onPress={() => {
                    console.log('🎯 TouchableOpacity pressed for category:', category.key, 'id:', category.id);
                    console.log('🎯 Platform:', Platform.OS);
                    
                    console.log('🎯 About to call handleCategoryPress with id:', category.id);
                    try {
                      handleCategoryPress(category.id);
                    } catch (error) {
                      console.error('❌ Category press error:', error);
                    }
                  }}
                  activeOpacity={0.7}
                  testID={`category-${category.key}`}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Browse ${category.name} services`}
                  {...(Platform.OS === 'web' && {
                    onClick: (event: any) => {
                      console.log('🖱️ Web onClick triggered for category:', category.key, 'id:', category.id);
                      event.stopPropagation();
                      event.preventDefault();
                      handleCategoryPress(category.id);
                    },
                    onMouseEnter: (e: any) => {
                      if (e.currentTarget) {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }
                    },
                    onMouseLeave: (e: any) => {
                      if (e.currentTarget) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }
                    }
                  })}
                >
                  <IconComponent size={32} color={Colors.light.primary} style={styles.categoryIconComponent} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryCount}>{count} service{count !== 1 ? 's' : ''}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Services</Text>
          <TouchableOpacity 
            onPress={() => {
              console.log('🎯 View All Featured pressed');
              router.push('/services/listing?featured=true');
            }} 
            testID="view-all-featured-services"
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(() => {
            const featuredListings = listings
              .filter(listing => listing.featured)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 2);
            console.log('⭐ Latest 2 featured services count:', featuredListings.length);
            return featuredListings;
          })().map((service) => {
            const formatPrice = () => {
              switch (service.priceType) {
                case 'free':
                  return 'Free';
                case 'donation':
                  return 'Donation';
                case 'fixed':
                  return `${Number(service.price || 0).toFixed(2)}`;
                case 'hourly':
                  return `${Number(service.price || 0).toFixed(2)}/hr`;
                default:
                  return 'Contact for pricing';
              }
            };
            
            return (
              <TouchableOpacity 
                key={service.id}
                style={styles.serviceCard}
                onPress={() => {
                  console.log('🎯 Featured service pressed');
                  setShowMarketplace(true);
                }}
                testID={`featured-service-${service.id}`}
              >
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceImage}>⭐</Text>
                  <View style={styles.serviceRating}>
                    <Star size={12} color={Colors.light.warning} fill={Colors.light.warning} />
                    <Text style={styles.ratingText}>{service.rating}</Text>
                  </View>
                </View>
                
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceProvider}>{service.provider.name}</Text>
                <Text style={styles.serviceCategory}>{service.categoryName || service.category}</Text>
                
                <View style={styles.serviceFooter}>
                  <View style={styles.serviceLocation}>
                    <MapPin size={12} color={Colors.light.textLight} />
                    <Text style={styles.locationText}>
                      {service.location?.city || 'Online'}
                    </Text>
                  </View>
                  <Text style={styles.servicePrice}>{formatPrice()}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          
          {(() => {
            const featuredCount = listings.filter(listing => listing.featured).length;
            const totalCount = listings.length;
            console.log(`📈 Total listings: ${totalCount}, Featured: ${featuredCount}`);
            return featuredCount === 0;
          })() && (
            <View style={styles.noFeaturedContainer}>
              <Text style={styles.noFeaturedText}>
                No featured services found
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Browse Services</Text>
              <Text style={styles.stepDescription}>
                Discover faith-based services offered by community members
              </Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Connect Directly</Text>
              <Text style={styles.stepDescription}>
                Contact service providers through the platform
              </Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Build Community</Text>
              <Text style={styles.stepDescription}>
                Support each other and strengthen faith connections
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
          <Text style={styles.ctaDescription}>
            Join our marketplace and connect with your faith community
          </Text>
          <Button
            title={isLoggedIn ? "Browse Services" : "Sign Up to Continue"}
            onPress={handleGetStarted}
            style={styles.ctaButton}
            leftIcon={<Store size={18} color={Colors.light.white} />}
          />
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.primary,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : theme.shadows.small),
  },
  quickActionSmall: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    ...(Platform.OS === 'web' ? {
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : theme.shadows.small),
  },
  primaryAction: {
    backgroundColor: Colors.light.primary,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  quickActionSpacing: {
    marginRight: theme.spacing.sm,
  },
  quickActionTextWhite: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'web' ? {
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'all 0.2s ease',
    } : {
      ...theme.shadows.small,
      elevation: 2,
    }),
  },
  categoryCardHover: {
    ...(Platform.OS === 'web' && {
      transform: [{ scale: 1.02 }],
      shadowColor: 'rgba(0,0,0,0.15)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    }),
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  categoryIconComponent: {
    marginBottom: theme.spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.textLight,
    marginTop: theme.spacing.md,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  serviceCard: {
    width: 200,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    ...(Platform.OS === 'web' ? {
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : theme.shadows.small),
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  serviceImage: {
    fontSize: 32,
  },
  serviceRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginLeft: 4,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  serviceProvider: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.xs,
  },
  serviceCategory: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginLeft: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.success,
  },
  stepsContainer: {
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.light.textLight,
    lineHeight: 20,
  },
  ctaCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      shadowColor: 'rgba(0,0,0,0.15)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    } : theme.shadows.medium),
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 14,
    color: Colors.light.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  ctaButton: {
    width: '80%',
  },
  bottomSpacing: {
    height: 120,
  },
  noFeaturedContainer: {
    width: 200,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
  },
  noFeaturedText: {
    fontSize: 14,
    color: Colors.light.textLight,
    textAlign: 'center',
  },
  categoryCardWeb: {
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.2s ease',
    pointerEvents: 'auto',
    zIndex: 1,
  },
  // Marketplace styles
  marketplaceHeader: {
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
  marketplaceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  addButton: {
    padding: theme.spacing.sm,
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
  filtersContainer: {
    backgroundColor: Colors.light.card,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  filterChip: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginLeft: theme.spacing.md,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textMedium,
  },
  filterChipTextActive: {
    color: Colors.light.white,
  },
  priceFilters: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  priceFilterChip: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
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
  clearFiltersButton: {
    alignSelf: 'flex-start',
    marginLeft: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  clearFiltersText: {
    fontSize: 14,
    color: Colors.light.error,
    fontWeight: '600',
  },
  filterToggleContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: Colors.light.background,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    marginLeft: theme.spacing.xs,
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