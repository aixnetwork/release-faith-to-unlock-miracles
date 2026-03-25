import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  ToastAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronDown, Check, ArrowLeft } from 'lucide-react-native';
import { ENV } from '@/config/env';
import { useUserStore } from '@/store/userStore';
import { fetchWithAuth } from '@/utils/authUtils';
import { getDirectusApiUrl } from '@/utils/api';

type ServiceType = {
  id: string;
  name: string;
  icon: string | null;
};


export default function CreateServiceScreen() {
  const { user } = useUserStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceTypeId: '' as string,
    priceType: 'fixed' as string,
    price: '',
    duration: '',
    tags: '',
    serviceType: 'online' as string,
    location: '',
    contactMethods: 'email' as string,
    contactEmail: '',
    contactPhone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/service_types?fields=id,name,icon&sort=sort`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.errors?.[0]?.message || 'Failed to fetch service types');
      }

      console.log('Service types fetched:', result.data);
      setServiceTypes(result.data || []);
    } catch (error: any) {
      console.error('Error fetching service types:', error);
      showToast(`❌ Failed to load categories: ${error.message}`);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.serviceTypeId) {
      newErrors.serviceTypeId = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (formData.priceType === 'fixed' || formData.priceType === 'hourly') {
      if (!formData.price || isNaN(Number(formData.price))) {
        newErrors.price = 'Valid price is required';
      } else if (Number(formData.price) <= 0) {
        newErrors.price = 'Price must be greater than 0';
      }
    }

    if (formData.contactMethods === 'email' && !formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email is required';
    }

    if (formData.contactMethods === 'phone' && !formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      showToast('You must be logged in to create a service');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const priceValue = formData.price ? parseFloat(formData.price) : null;
      const roundedPrice = priceValue ? Math.round(priceValue * 100) / 100 : null;

      const serviceData = {
        title: formData.title.trim(),
        service_type_id: formData.serviceTypeId,
        description: formData.description.trim(),
        tags: JSON.stringify(tags),
        price_type: formData.priceType,
        price: roundedPrice,
        duration_minutes: formData.duration ? parseInt(formData.duration) : null,
        location: formData.location.trim() || null,
        contact_methods: formData.contactMethods,
        contact_email: formData.contactEmail.trim() || null,
        contact_phone: formData.contactPhone.trim() || null,
        user_id: user.id,
        organization_id: user.organizationId || null,
        status: 'pending_approval',
      };

      console.log('Creating service with data:', serviceData);

      const response = await fetchWithAuth(`${getDirectusApiUrl()}/items/services`, {
        method: 'POST',
        body: JSON.stringify(serviceData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.errors?.[0]?.message || 'Failed to create service');
      }

      console.log('Service created successfully:', result);
      showToast('✅ Service submitted for approval!');
      
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error: any) {
      console.error('Error creating service:', error);
      showToast(`❌ Failed to create service: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };





  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Create Service Listing',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="e.g., Spiritual Counseling Sessions"
              maxLength={100}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            {isLoadingCategories ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.dropdownButton, errors.serviceTypeId && styles.inputError]}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {serviceTypes.find(cat => cat.id === formData.serviceTypeId)?.name || 'Select Category'}
                </Text>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>
            )}
            {errors.serviceTypeId && <Text style={styles.errorText}>{errors.serviceTypeId}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Describe your service in detail..."
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma-separated)</Text>
            <TextInput
              style={styles.input}
              value={formData.tags}
              onChangeText={(text) => setFormData({ ...formData, tags: text })}
              placeholder="e.g., counseling, spiritual, guidance"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price Type *</Text>
            <View style={styles.priceTypeContainer}>
              {[{label: 'Free', value: 'free'}, {label: 'Fixed Price', value: 'fixed'}, {label: 'Hourly Rate', value: 'hourly'}, {label: 'Donation Based', value: 'donation'}].map((price) => (
                <TouchableOpacity
                  key={price.value}
                  style={[
                    styles.priceTypeChip,
                    formData.priceType === price.value && styles.priceTypeChipActive
                  ]}
                  onPress={() => setFormData({ ...formData, priceType: price.value })}
                >
                  <Text style={[
                    styles.priceTypeChipText,
                    formData.priceType === price.value && styles.priceTypeChipTextActive
                  ]}>
                    {price.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {(formData.priceType === 'fixed' || formData.priceType === 'hourly') && (
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
                {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.duration}
                  onChangeText={(text) => setFormData({ ...formData, duration: text })}
                  placeholder="60"
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Type *</Text>
            <View style={styles.locationTypeContainer}>
              {[{label: 'Online Only', value: 'online'}, {label: 'In-Person Only', value: 'in-person'}, {label: 'Both Online & In-Person', value: 'hybrid'}].map((location) => (
                <TouchableOpacity
                  key={location.value}
                  style={[
                    styles.locationTypeChip,
                    formData.serviceType === location.value && styles.locationTypeChipActive
                  ]}
                  onPress={() => setFormData({ ...formData, serviceType: location.value })}
                >
                  <Text style={[
                    styles.locationTypeChipText,
                    formData.serviceType === location.value && styles.locationTypeChipTextActive
                  ]}>
                    {location.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {formData.serviceType !== 'online' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="e.g., Austin, TX"
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Method *</Text>
            <View style={styles.contactMethodContainer}>
              {[{label: 'Email', value: 'email'}, {label: 'Phone', value: 'phone'}, {label: 'Both', value: 'both'}].map((contact) => (
                <TouchableOpacity
                  key={contact.value}
                  style={[
                    styles.contactMethodChip,
                    formData.contactMethods === contact.value && styles.contactMethodChipActive
                  ]}
                  onPress={() => setFormData({ ...formData, contactMethods: contact.value })}
                >
                  <Text style={[
                    styles.contactMethodChipText,
                    formData.contactMethods === contact.value && styles.contactMethodChipTextActive
                  ]}>
                    {contact.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {(formData.contactMethods === 'email' || formData.contactMethods === 'both') && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={[styles.input, errors.contactEmail && styles.inputError]}
                value={formData.contactEmail}
                onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
                placeholder="your@email.com"
                keyboardType="email-address"
              />
              {errors.contactEmail && <Text style={styles.errorText}>{errors.contactEmail}</Text>}
            </View>
          )}

          {(formData.contactMethods === 'phone' || formData.contactMethods === 'both') && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.contactPhone && styles.inputError]}
                value={formData.contactPhone}
                onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
                placeholder="+1-555-0123"
                keyboardType="phone-pad"
              />
              {errors.contactPhone && <Text style={styles.errorText}>{errors.contactPhone}</Text>}
            </View>
          )}
        </View>

        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButtonLarge,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            testID="submit-service-button"
          >
            <Text style={[
              styles.submitButtonLargeText,
              isSubmitting && styles.submitButtonTextDisabled
            ]}>
              {isSubmitting ? 'Creating Service...' : 'Create Service'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.submitNote}>
            Your service will be submitted for approval
          </Text>
        </View>

        <View style={styles.bottomPadding} />
        <View style={styles.extraBottomPadding} />
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {serviceTypes.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No categories available</Text>
                </View>
              ) : (
                serviceTypes.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.modalItem,
                      formData.serviceTypeId === cat.id && styles.modalItemSelected
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, serviceTypeId: cat.id });
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalItemText,
                      formData.serviceTypeId === cat.id && styles.modalItemTextSelected
                    ]}>
                      {cat.name}
                    </Text>
                    {formData.serviceTypeId === cat.id && (
                      <Check size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#D1D5DB',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  bottomPadding: {
    height: 32,
  },
  extraBottomPadding: {
    height: 100,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  priceTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  priceTypeChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  priceTypeChipActive: {
    backgroundColor: '#10B981',
  },
  priceTypeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  priceTypeChipTextActive: {
    color: '#FFFFFF',
  },
  locationTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  locationTypeChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  locationTypeChipActive: {
    backgroundColor: '#8B5CF6',
  },
  locationTypeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  locationTypeChipTextActive: {
    color: '#FFFFFF',
  },
  contactMethodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  contactMethodChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  contactMethodChipActive: {
    backgroundColor: '#F59E0B',
  },
  contactMethodChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  contactMethodChipTextActive: {
    color: '#FFFFFF',
  },
  submitSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  submitButtonLarge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonLargeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  submitNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#6B7280',
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  modalItemTextSelected: {
    color: '#10B981',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
  },
});