import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Edit2, Trash2, DollarSign, Users, Calendar } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { ENV } from '@/config/env';
import { resilientFetch, directusHeaders } from '@/utils/resilientFetch';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: string;
  maxMembers: number;
  period: string;
  features: string[];
  status: string;
}

export default function PlansManagementScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    maxMembers: '',
    period: 'monthly',
    features: '',
    status: 'published'
  });

  useEffect(() => {
    void fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Fetching plans...');

      let plansData: Plan[] = [];

      try {
        const response = await resilientFetch(
          `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/plans`,
          {
            headers: directusHeaders(),
          }
        );

        const data = await response.json();
        console.log('✅ Plans fetched:', data);

        if (data.data && Array.isArray(data.data)) {
          plansData = data.data;
        }
      } catch (fetchError) {
        console.warn('⚠️ API fetch failed, using fallback plans:', fetchError);
        plansData = [
          {
            id: 1,
            name: 'Small Church',
            description: 'Perfect for small congregations',
            price: '149',
            maxMembers: 250,
            period: 'monthly',
            features: ['Up to 250 members', 'Prayer wall', 'Group management', 'Basic analytics'],
            status: 'published',
          },
          {
            id: 2,
            name: 'Large Church',
            description: 'Complete church management solution',
            price: '499',
            maxMembers: 10000,
            period: 'monthly',
            features: ['Up to 10,000 members', 'Prayer wall', 'Advanced groups', 'Full analytics', 'Custom branding'],
            status: 'published',
          },
          {
            id: 3,
            name: 'Family Plan',
            description: 'Perfect for families',
            price: '9.99',
            maxMembers: 10,
            period: 'monthly',
            features: ['Up to 10 members', 'Shared prayers', 'Family devotionals'],
            status: 'published',
          },
        ];
      }

      setPlans(plansData);
    } catch (error) {
      console.error('❌ Error fetching plans:', error);
      Alert.alert('Error', 'Failed to load plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      maxMembers: '',
      period: 'monthly',
      features: '',
      status: 'published'
    });
    setModalVisible(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price?.toString() || '',
      maxMembers: plan.maxMembers?.toString() || '',
      period: plan.period || 'monthly',
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      status: plan.status || 'published'
    });
    setModalVisible(true);
  };

  const handleSavePlan = async () => {
    if (!formData.name || !formData.price || !formData.maxMembers) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      console.log('💾 Saving plan...');

      const featuresArray = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const planData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        maxMembers: parseInt(formData.maxMembers),
        period: formData.period,
        features: featuresArray,
        status: formData.status
      };

      const url = editingPlan
        ? `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/plans/${editingPlan.id}`
        : `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/plans`;

      const method = editingPlan ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      const data = await response.json();
      console.log('✅ Plan saved:', data);

      if (response.ok) {
        Alert.alert('Success', `Plan ${editingPlan ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        void fetchPlans();
      } else {
        Alert.alert('Error', data.errors?.[0]?.message || 'Failed to save plan');
      }
    } catch (error) {
      console.error('❌ Error saving plan:', error);
      Alert.alert('Error', 'Failed to save plan');
    }
  };

  const handleDeletePlan = async (planId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting plan:', planId);

              const response = await fetch(
                `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/plans/${planId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (response.ok) {
                Alert.alert('Success', 'Plan deleted successfully');
                void fetchPlans();
              } else {
                const data = await response.json();
                Alert.alert('Error', data.errors?.[0]?.message || 'Failed to delete plan');
              }
            } catch (error) {
              console.error('❌ Error deleting plan:', error);
              Alert.alert('Error', 'Failed to delete plan');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Manage Plans</Text>
          <Text style={styles.subtitle}>{plans.length} plans available</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openCreateModal}
        >
          <Plus size={24} color={Colors.light.background} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {plans.length === 0 ? (
            <View style={styles.emptyState}>
              <DollarSign size={48} color={Colors.light.icon} />
              <Text style={styles.emptyStateText}>No plans found</Text>
              <Text style={styles.emptyStateSubtext}>Create your first plan to get started</Text>
            </View>
          ) : (
            plans.map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                  <View style={styles.planActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => openEditModal(plan)}
                    >
                      <Edit2 size={18} color={Colors.light.tint} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 size={18} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.planDetails}>
                  <View style={styles.planDetail}>
                    <DollarSign size={16} color={Colors.light.icon} />
                    <Text style={styles.planDetailText}>
                      ${plan.price}/{plan.period}
                    </Text>
                  </View>
                  <View style={styles.planDetail}>
                    <Users size={16} color={Colors.light.icon} />
                    <Text style={styles.planDetailText}>
                      Max {plan.maxMembers} members
                    </Text>
                  </View>
                  <View style={styles.planDetail}>
                    <Calendar size={16} color={Colors.light.icon} />
                    <Text style={styles.planDetailText}>
                      {plan.period}
                    </Text>
                  </View>
                </View>

                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <View style={styles.featuresContainer}>
                    <Text style={styles.featuresTitle}>Features:</Text>
                    {plan.features.map((feature, index) => (
                      <Text key={index} style={styles.featureItem}>• {feature}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPlan ? 'Edit Plan' : 'Create Plan'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Plan Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Basic Plan"
                placeholderTextColor={Colors.light.icon}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Plan description"
                placeholderTextColor={Colors.light.icon}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Price (USD) *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="e.g., 29.99"
                placeholderTextColor={Colors.light.icon}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Max Members *</Text>
              <TextInput
                style={styles.input}
                value={formData.maxMembers}
                onChangeText={(text) => setFormData({ ...formData, maxMembers: text })}
                placeholder="e.g., 100"
                placeholderTextColor={Colors.light.icon}
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Period</Text>
              <View style={styles.periodButtons}>
                {['monthly', 'yearly', 'lifetime'].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      formData.period === period && styles.periodButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, period })}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      formData.period === period && styles.periodButtonTextActive
                    ]}>
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Features (one per line)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.features}
                onChangeText={(text) => setFormData({ ...formData, features: text })}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                placeholderTextColor={Colors.light.icon}
                multiline
                numberOfLines={5}
              />

              <Text style={styles.label}>Status</Text>
              <View style={styles.periodButtons}>
                {['published', 'draft', 'archived'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.periodButton,
                      formData.status === status && styles.periodButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, status })}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      formData.status === status && styles.periodButtonTextActive
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title={editingPlan ? 'Update Plan' : 'Create Plan'}
                onPress={handleSavePlan}
                style={styles.saveButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    fontSize: 24,
  },
  subtitle: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: Colors.light.icon,
    marginTop: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    ...theme.typography.subtitle,
    marginTop: theme.spacing.md,
  },
  emptyStateSubtext: {
    ...theme.typography.caption,
    color: Colors.light.icon,
    marginTop: 4,
  },
  planCard: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    ...theme.typography.subtitle,
    fontSize: 18,
    marginBottom: 4,
  },
  planDescription: {
    ...theme.typography.body,
    color: Colors.light.icon,
  },
  planActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  deleteButton: {
    backgroundColor: '#fee',
  },
  planDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: theme.spacing.md,
  },
  planDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planDetailText: {
    ...theme.typography.caption,
    color: Colors.light.text,
    fontWeight: '600',
  },
  featuresContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: theme.spacing.md,
  },
  featuresTitle: {
    ...theme.typography.caption,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureItem: {
    ...theme.typography.caption,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxHeight: '90%',
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.title,
    fontSize: 20,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.light.icon,
  },
  label: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    backgroundColor: Colors.light.background,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  periodButtonText: {
    ...theme.typography.caption,
    color: Colors.light.text,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: Colors.light.background,
  },
  saveButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
});
