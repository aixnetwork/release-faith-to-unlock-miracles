import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  ToastAndroid,
  Alert,
  Linking,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, MapPin, Clock, Mail, Phone, Check, X, Tag } from 'lucide-react-native';
import { ENV } from '@/config/env';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useUserStore } from '@/store/userStore';

type ServiceDetail = {
  id: string;
  title: string;
  description: string;
  price_type: string;
  price: number;
  duration_minutes: number | null;
  location: string;
  contact_methods: string;
  contact_email: string | null;
  contact_phone: string | null;
  user_id: string;
  service_type_id: string;
  tags: string | string[];
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  date_created: string;
  organization_id: string | null;
  featured: boolean;
};

export default function ServiceDetailScreen() {
  const params = useLocalSearchParams();
  const { isConnected } = useNetworkStatus();
  const { user } = useUserStore();
  
  const serviceId = params.serviceId as string;
  const showApproval = params.showApproval === 'true';
  
  const isAdmin = user?.roleId === ENV.EXPO_PUBLIC_DIRECTUS_ADMIN_ROLE_ID;
  const isOrganizer = user?.roleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID;
  const canApprove = (isAdmin || isOrganizer) && showApproval;

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [serviceType, setServiceType] = useState<string>('');  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetail();
    }
  }, [serviceId]);

  const fetchServiceDetail = async () => {
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
      console.log('📡 Fetching service detail:', serviceId);

      const [serviceResponse, serviceTypesResponse] = await Promise.all([
        fetch(
          `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/services/${serviceId}`,
          {
            headers: {
              'Authorization': `Bearer ${user?.accessToken || ENV.EXPO_PUBLIC_API_TOKEN}`,
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

      if (!serviceResponse.ok) {
        throw new Error(`Failed to fetch service: ${serviceResponse.status}`);
      }

      const serviceData = await serviceResponse.json();
      console.log('✅ Service detail fetched:', serviceData.data);
      setService(serviceData.data);

      if (serviceTypesResponse.ok) {
        const serviceTypesData = await serviceTypesResponse.json();
        const serviceTypeObj = serviceTypesData.data?.find(
          (type: any) => type.id === serviceData.data.service_type_id
        );
        if (serviceTypeObj) {
          setServiceType(serviceTypeObj.name);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching service detail:', error);
      const message = 'Failed to load service details';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!isConnected) {
      Alert.alert('Network Error', 'No internet connection');
      return;
    }

    setIsApproving(true);
    try {
      console.log('✅ Approving service:', serviceId);

      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/services/${serviceId}`,
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
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to approve service: ${response.status}`);
      }

      const message = 'Service approved successfully';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', message);
      }

      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error('❌ Error approving service:', error);
      const message = 'Failed to approve service';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      'Reject Service',
      'Are you sure you want to reject this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setIsApproving(true);
            try {
              console.log('❌ Rejecting service:', serviceId);

              const response = await fetch(
                `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/services/${serviceId}`,
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
                throw new Error(`Failed to reject service: ${response.status}`);
              }

              const message = 'Service rejected';
              if (Platform.OS === 'android') {
                ToastAndroid.show(message, ToastAndroid.SHORT);
              } else {
                Alert.alert('Success', message);
              }

              setTimeout(() => {
                router.back();
              }, 500);
            } catch (error) {
              console.error('❌ Error rejecting service:', error);
              const message = 'Failed to reject service';
              if (Platform.OS === 'android') {
                ToastAndroid.show(message, ToastAndroid.LONG);
              } else {
                Alert.alert('Error', message);
              }
            } finally {
              setIsApproving(false);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (value: unknown): string => {
    const num = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : Number(value ?? 0);
    const isValid = Number.isFinite(num);
    const amount = isValid ? num : 0;
    return `${amount.toFixed(2)}`;
  };

  const formatPrice = () => {
    if (!service) return '';
    
    switch (service.price_type) {
      case 'free':
        return 'Free';
      case 'donation':
        return 'Donation Based';
      case 'fixed':
        return formatCurrency(service.price);
      case 'hourly':
        return `${formatCurrency(service.price)}/hr`;
      default:
        return 'Contact for pricing';
    }
  };

  const handleContact = (method: 'email' | 'phone') => {
    if (!service) return;

    if (method === 'email' && service.contact_email) {
      Linking.openURL(`mailto:${service.contact_email}`);
    } else if (method === 'phone' && service.contact_phone) {
      Linking.openURL(`tel:${service.contact_phone}`);
    }
  };

  const parseTags = (): string[] => {
    if (!service?.tags) return [];
    
    if (typeof service.tags === 'string') {
      try {
        return JSON.parse(service.tags);
      } catch {
        return [];
      }
    }
    
    return Array.isArray(service.tags) ? service.tags : [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return Colors.light.success;
      case 'pending_approval':
        return Colors.light.warning;
      case 'rejected':
        return Colors.light.error;
      default:
        return Colors.light.textLight;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending_approval':
        return 'Pending Approval';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading service details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Service Not Found</Text>
          <Text style={styles.errorText}>The service you're looking for doesn't exist.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tags = parseTags();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <ArrowLeft size={24} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          {service.featured && (
            <View style={styles.featuredBadgeTop}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{service.title}</Text>
          </View>
          {serviceType && (
            <Text style={styles.categoryText}>{serviceType}</Text>
          )}
          <View style={styles.badgeRow}>
            {service.status !== 'approved' && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(service.status) }]}>
                <Text style={styles.statusText}>{getStatusLabel(service.status)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.priceText} testID={`service-detail-price-${service.id}`}>{formatPrice()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        {service.duration_minutes && (
          <View style={styles.infoRow}>
            <Clock size={20} color={Colors.light.textMedium} />
            <Text style={styles.infoText}>{service.duration_minutes} minutes</Text>
          </View>
        )}

        {service.location && (
          <View style={styles.infoRow}>
            <MapPin size={20} color={Colors.light.textMedium} />
            <Text style={styles.infoText}>{service.location}</Text>
          </View>
        )}

        {tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Tag size={14} color={Colors.light.primary} />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {service.contact_email && (service.contact_methods === 'email' || service.contact_methods === 'both') && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('email')}
            >
              <Mail size={20} color={Colors.light.primary} />
              <Text style={styles.contactButtonText}>{service.contact_email}</Text>
            </TouchableOpacity>
          )}

          {service.contact_phone && (service.contact_methods === 'phone' || service.contact_methods === 'both') && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('phone')}
            >
              <Phone size={20} color={Colors.light.primary} />
              <Text style={styles.contactButtonText}>{service.contact_phone}</Text>
            </TouchableOpacity>
          )}
        </View>

        {canApprove && service.status === 'pending_approval' && (
          <View style={styles.approvalSection}>
            <Text style={styles.approvalTitle}>Approval Actions</Text>
            <View style={styles.approvalButtons}>
              <TouchableOpacity
                style={[styles.approvalButton, styles.approveButton]}
                onPress={handleApprove}
                disabled={isApproving}
              >
                <Check size={20} color={Colors.light.white} />
                <Text style={styles.approvalButtonText}>
                  {isApproving ? 'Approving...' : 'Approve'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.approvalButton, styles.rejectButton]}
                onPress={handleReject}
                disabled={isApproving}
              >
                <X size={20} color={Colors.light.white} />
                <Text style={styles.approvalButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  headerBackButton: {
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.textLight,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    position: 'relative' as const,
  },
  titleRow: {
    marginTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.white,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textMedium,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontSize: 16,
    color: Colors.light.textMedium,
    marginLeft: theme.spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  tagText: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  contactButtonText: {
    fontSize: 16,
    color: Colors.light.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  approvalSection: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  approvalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  approvalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  approvalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  approveButton: {
    backgroundColor: Colors.light.success,
  },
  rejectButton: {
    backgroundColor: Colors.light.error,
  },
  approvalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  bottomPadding: {
    height: 32,
  },
  featuredBadgeTop: {
    position: 'absolute' as const,
    top: -8,
    left: 16,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
    alignSelf: 'flex-start' as const,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.white,
  },
});
