import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import { Stack } from 'expo-router';
import { CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare } from 'lucide-react-native';
import { ENV } from '@/config/env';
import { useUserStore } from '@/store/userStore';

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
  date_created: string;
  approved_by?: string;
  approved_at?: string;
};

export default function ServiceApprovalScreen() {
  console.log('🔍 Service Approval Screen rendered');
  
  const { user } = useUserStore();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingServices();
  }, []);

  const fetchPendingServices = async () => {
    try {
      setIsLoading(true);
      console.log('📡 Fetching pending and approved services...');
      
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/services?filter[status][_in]=pending_approval,approved&sort=-date_created`,
        {
          headers: {
            'Authorization': `Bearer ${user?.accessToken || ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Services fetched:', data.data?.length || 0);
      setServices(data.data || []);
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      showToast('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  const handleApprove = async (service: Service) => {
    if (!user?.id) {
      showToast('You must be logged in to approve services');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('✅ Approving service:', service.id);

      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/services/${service.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${user.accessToken || ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'approved',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || 'Failed to approve service');
      }

      console.log('✅ Service approved successfully');
      showToast('✅ Service approved successfully!');
      setModalVisible(false);
      setSelectedService(null);
      fetchPendingServices();
    } catch (error: any) {
      console.error('❌ Error approving service:', error);
      showToast(`Failed to approve: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return '#F59E0B';
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return Clock;
      case 'approved':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      default:
        return Clock;
    }
  };

  const formatPrice = (service: Service) => {
    if (service.price_type === 'free') return 'Free';
    if (service.price_type === 'donation') return 'Donation';
    if (service.price) {
      return `$${service.price}${service.price_type === 'hourly' ? '/hr' : ''}`;
    }
    return 'Price TBD';
  };

  const pendingServices = services.filter(s => s.status === 'pending_approval');
  const approvedServices = services.filter(s => s.status === 'approved');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Service Approvals' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Service Approvals',
          headerRight: () => (
            <View style={styles.headerStats}>
              <Text style={styles.statsText}>{pendingServices.length} pending</Text>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {pendingServices.length === 0 && approvedServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CheckCircle size={64} color="#10B981" />
            <Text style={styles.emptyTitle}>No Services</Text>
            <Text style={styles.emptyMessage}>
              No services to review at this time.
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {pendingServices.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Pending Approval ({pendingServices.length})</Text>
                {pendingServices.map((service) => {
                  const StatusIcon = getStatusIcon(service.status);
                  return (
                    <View key={service.id} style={styles.serviceCard}>
                      <View style={styles.serviceHeader}>
                        <View style={styles.statusContainer}>
                          <StatusIcon 
                            size={20} 
                            color={getStatusColor(service.status)} 
                          />
                          <Text style={[
                            styles.statusText,
                            { color: getStatusColor(service.status) }
                          ]}>
                            {service.status.replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.submittedDate}>
                          {new Date(service.date_created).toLocaleDateString()}
                        </Text>
                      </View>

                      <Text style={styles.serviceTitle}>{service.title}</Text>
                      
                      <View style={styles.serviceMeta}>
                        <Text style={styles.price}>{formatPrice(service)}</Text>
                      </View>

                      <Text style={styles.description} numberOfLines={3}>
                        {service.description}
                      </Text>

                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.approveButton]}
                          onPress={() => {
                            setSelectedService(service);
                            setModalVisible(true);
                          }}
                          disabled={isSubmitting}
                        >
                          <CheckCircle size={16} color="#FFFFFF" />
                          <Text style={styles.actionButtonText}>Approve</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {approvedServices.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Approved ({approvedServices.length})</Text>
                {approvedServices.map((service) => {
                  const StatusIcon = getStatusIcon(service.status);
                  return (
                    <View key={service.id} style={styles.serviceCard}>
                      <View style={styles.serviceHeader}>
                        <View style={styles.statusContainer}>
                          <StatusIcon 
                            size={20} 
                            color={getStatusColor(service.status)} 
                          />
                          <Text style={[
                            styles.statusText,
                            { color: getStatusColor(service.status) }
                          ]}>
                            {service.status.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.submittedDate}>
                          {service.approved_at 
                            ? new Date(service.approved_at).toLocaleDateString()
                            : new Date(service.date_created).toLocaleDateString()}
                        </Text>
                      </View>

                      <Text style={styles.serviceTitle}>{service.title}</Text>
                      
                      <View style={styles.serviceMeta}>
                        <Text style={styles.price}>{formatPrice(service)}</Text>
                      </View>

                      <Text style={styles.description} numberOfLines={3}>
                        {service.description}
                      </Text>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Approve Service</Text>
            <TouchableOpacity 
              onPress={() => selectedService && handleApprove(selectedService)}
              disabled={isSubmitting}
            >
              <Text style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled
              ]}>
                {isSubmitting ? 'Approving...' : 'Approve'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedService && (
              <View style={styles.servicePreview}>
                <Text style={styles.previewTitle}>{selectedService.title}</Text>
                <Text style={styles.previewDescription}>{selectedService.description}</Text>
                <View style={styles.previewMeta}>
                  <Text style={styles.previewLabel}>Price:</Text>
                  <Text style={styles.previewValue}>{formatPrice(selectedService)}</Text>
                </View>
                {selectedService.location && (
                  <View style={styles.previewMeta}>
                    <Text style={styles.previewLabel}>Location:</Text>
                    <Text style={styles.previewValue}>{selectedService.location}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.confirmSection}>
              <Text style={styles.confirmText}>
                Are you sure you want to approve this service? It will be visible to all users.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  headerStats: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  submittedDate: {
    fontSize: 12,
    color: '#666',
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  submitButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  submitButtonDisabled: {
    color: '#9CA3AF',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  servicePreview: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  previewMeta: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  previewValue: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  confirmSection: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  confirmText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});
