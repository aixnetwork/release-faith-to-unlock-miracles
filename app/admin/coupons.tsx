import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Modal } from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Search, Filter, Edit, Trash2, BarChart3, Tag, Calendar, Users, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { trpc } from '@/lib/trpc';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  discount: number;
  validFrom: string;
  validUntil: string;
  maxUses?: number;
  maxUsesPerUser?: number;
  currentUses: number;
  minimumAmount?: number;
  applicablePlans?: string[];
  isActive: boolean;
  isFirstTimeOnly: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

interface CouponFormData {
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  discount: string;
  validFrom: string;
  validUntil: string;
  maxUses: string;
  maxUsesPerUser: string;
  minimumAmount: string;
  applicablePlans: string[];
  isActive: boolean;
  isFirstTimeOnly: boolean;
}

export default function AdminCouponsScreen() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    discount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxUses: '',
    maxUsesPerUser: '1',
    minimumAmount: '0',
    applicablePlans: [],
    isActive: true,
    isFirstTimeOnly: false,
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalUses: 0,
  });

  const couponsQuery = trpc.admin.coupons.list.useQuery({
    search: searchQuery,
    status: statusFilter,
  });

  const createCouponMutation = trpc.admin.coupons.create.useMutation();
  const updateCouponMutation = trpc.admin.coupons.update.useMutation();
  const deleteCouponMutation = trpc.admin.coupons.delete.useMutation();

  useEffect(() => {
    if (couponsQuery.data?.success) {
      setCoupons(couponsQuery.data.coupons);
      setStats(couponsQuery.data.stats);
      setLoading(false);
    }
  }, [couponsQuery.data]);

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      discount: '',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxUses: '',
      maxUsesPerUser: '1',
      minimumAmount: '0',
      applicablePlans: [],
      isActive: true,
      isFirstTimeOnly: false,
    });
  };

  const handleCreateCoupon = async () => {
    try {
      if (!formData.code || !formData.name || !formData.description || !formData.discount) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const result = await createCouponMutation.mutateAsync({
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description,
        type: formData.type,
        discount: parseFloat(formData.discount),
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser) : undefined,
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined,
        applicablePlans: formData.applicablePlans.length > 0 ? formData.applicablePlans : undefined,
        isActive: formData.isActive,
        isFirstTimeOnly: formData.isFirstTimeOnly,
      });

      if (result.success) {
        Alert.alert('Success', result.message);
        setShowCreateModal(false);
        resetForm();
        couponsQuery.refetch();
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Create coupon error:', error);
      Alert.alert('Error', 'Failed to create coupon');
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      discount: coupon.discount.toString(),
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil.split('T')[0],
      maxUses: coupon.maxUses?.toString() || '',
      maxUsesPerUser: coupon.maxUsesPerUser?.toString() || '1',
      minimumAmount: coupon.minimumAmount?.toString() || '0',
      applicablePlans: coupon.applicablePlans || [],
      isActive: coupon.isActive,
      isFirstTimeOnly: coupon.isFirstTimeOnly,
    });
    setShowCreateModal(true);
  };

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return;

    try {
      const result = await updateCouponMutation.mutateAsync({
        id: editingCoupon.id,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        discount: parseFloat(formData.discount),
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser) : undefined,
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined,
        applicablePlans: formData.applicablePlans.length > 0 ? formData.applicablePlans : undefined,
        isActive: formData.isActive,
        isFirstTimeOnly: formData.isFirstTimeOnly,
      });

      if (result.success) {
        Alert.alert('Success', result.message);
        setShowCreateModal(false);
        setEditingCoupon(null);
        resetForm();
        couponsQuery.refetch();
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Update coupon error:', error);
      Alert.alert('Error', 'Failed to update coupon');
    }
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    Alert.alert(
      'Delete Coupon',
      `Are you sure you want to delete the coupon "${coupon.code}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteCouponMutation.mutateAsync({ id: coupon.id });
              if (result.success) {
                Alert.alert('Success', result.message);
                couponsQuery.refetch();
              } else {
                Alert.alert('Error', result.error);
              }
            } catch (error) {
              console.error('Delete coupon error:', error);
              Alert.alert('Error', 'Failed to delete coupon');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (coupon: Coupon) => {
    if (!coupon.isActive) return Colors.light.textMedium;
    
    const now = new Date();
    const validUntil = new Date(coupon.validUntil);
    const isExpired = validUntil < now;
    const isMaxedOut = coupon.maxUses && coupon.currentUses >= coupon.maxUses;
    
    if (isExpired || isMaxedOut) return Colors.light.error;
    return Colors.light.success;
  };

  const getStatusText = (coupon: Coupon) => {
    if (!coupon.isActive) return 'Inactive';
    
    const now = new Date();
    const validUntil = new Date(coupon.validUntil);
    const isExpired = validUntil < now;
    const isMaxedOut = coupon.maxUses && coupon.currentUses >= coupon.maxUses;
    
    if (isExpired) return 'Expired';
    if (isMaxedOut) return 'Max Uses Reached';
    return 'Active';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDiscount = (coupon: Coupon) => {
    return coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading coupons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Coupon Management',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.light.primary + '10' }]}>
              <Tag size={24} color={Colors.light.primary} />
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Coupons</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.light.success + '10' }]}>
              <TrendingUp size={24} color={Colors.light.success} />
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: Colors.light.warning + '10' }]}>
              <Users size={24} color={Colors.light.warning} />
              <Text style={styles.statValue}>{stats.totalUses.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Uses</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.light.error + '10' }]}>
              <Calendar size={24} color={Colors.light.error} />
              <Text style={styles.statValue}>{stats.expired}</Text>
              <Text style={styles.statLabel}>Expired</Text>
            </View>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.light.textMedium} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search coupons..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.light.inputPlaceholder}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              resetForm();
              setEditingCoupon(null);
              setShowCreateModal(true);
            }}
          >
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryDark]}
              style={styles.createButtonGradient}
            >
              <Plus size={20} color={Colors.light.white} />
              <Text style={styles.createButtonText}>Create Coupon</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.analyticsButton}
            onPress={() => console.log('Analytics feature coming soon')}
          >
            <BarChart3 size={20} color={Colors.light.secondary} />
            <Text style={styles.analyticsButtonText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Coupons List */}
        <View style={styles.couponsContainer}>
          <Text style={styles.sectionTitle}>Coupons ({coupons.length})</Text>
          
          {coupons.map((coupon) => (
            <View key={coupon.id} style={styles.couponCard}>
              <View style={styles.couponHeader}>
                <View style={styles.couponInfo}>
                  <Text style={styles.couponCode}>{coupon.code}</Text>
                  <Text style={styles.couponName}>{coupon.name}</Text>
                </View>
                <View style={styles.couponActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditCoupon(coupon)}
                  >
                    <Edit size={16} color={Colors.light.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteCoupon(coupon)}
                  >
                    <Trash2 size={16} color={Colors.light.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.couponDescription}>{coupon.description}</Text>
              
              <View style={styles.couponDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Discount:</Text>
                  <Text style={styles.detailValue}>{formatDiscount(coupon)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Uses:</Text>
                  <Text style={styles.detailValue}>
                    {coupon.currentUses}{coupon.maxUses ? `/${coupon.maxUses}` : ''}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Valid Until:</Text>
                  <Text style={styles.detailValue}>{formatDate(coupon.validUntil)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[styles.detailValue, { color: getStatusColor(coupon) }]}>
                    {getStatusText(coupon)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          
          {coupons.length === 0 && (
            <View style={styles.emptyState}>
              <Tag size={48} color={Colors.light.textLight} />
              <Text style={styles.emptyStateTitle}>No Coupons Found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Try adjusting your search criteria' : 'Create your first coupon to get started'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create/Edit Coupon Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                setEditingCoupon(null);
                resetForm();
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </Text>
            <TouchableOpacity
              onPress={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
              disabled={createCouponMutation.isPending || updateCouponMutation.isPending}
            >
              {createCouponMutation.isPending || updateCouponMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.light.primary} />
              ) : (
                <Text style={styles.modalSaveText}>
                  {editingCoupon ? 'Update' : 'Create'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Form fields would go here - simplified for brevity */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Coupon Code *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.code}
                onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
                placeholder="Enter coupon code"
                autoCapitalize="characters"
                editable={!editingCoupon}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter coupon name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Enter coupon description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: theme.spacing.sm }]}>
                <Text style={styles.formLabel}>Type *</Text>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[
                      styles.segmentButton,
                      formData.type === 'percentage' && styles.segmentButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, type: 'percentage' })}
                  >
                    <Text style={[
                      styles.segmentButtonText,
                      formData.type === 'percentage' && styles.segmentButtonTextActive
                    ]}>
                      Percentage
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.segmentButton,
                      formData.type === 'fixed' && styles.segmentButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, type: 'fixed' })}
                  >
                    <Text style={[
                      styles.segmentButtonText,
                      formData.type === 'fixed' && styles.segmentButtonTextActive
                    ]}>
                      Fixed Amount
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: theme.spacing.sm }]}>
                <Text style={styles.formLabel}>
                  Discount * {formData.type === 'percentage' ? '(%)' : '($)'}
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.discount}
                  onChangeText={(text) => setFormData({ ...formData, discount: text })}
                  placeholder={formData.type === 'percentage' ? '50' : '20'}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.textMedium,
  },
  statsContainer: {
    marginBottom: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMedium,
    marginTop: theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.light.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  createButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.secondary,
    gap: theme.spacing.sm,
  },
  analyticsButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.secondary,
  },
  couponsContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  couponCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...theme.shadows.small,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  couponInfo: {
    flex: 1,
  },
  couponCode: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.primary,
  },
  couponName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginTop: theme.spacing.xs,
  },
  couponActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  couponDetails: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginTop: theme.spacing.lg,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalCancelText: {
    fontSize: 16,
    color: Colors.light.textMedium,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.primary,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  formInput: {
    height: 50,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.textPrimary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    height: 80,
    paddingTop: theme.spacing.md,
    textAlignVertical: 'top',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.lg,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  segmentButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textMedium,
  },
  segmentButtonTextActive: {
    color: Colors.light.white,
  },
});