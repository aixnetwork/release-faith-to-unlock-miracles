import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { Search, X, Building, Users, Settings, Plus, Edit, Trash2, Eye } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { ENV } from '@/config/env';
import { resilientFetch, directusHeaders } from '@/utils/resilientFetch';

interface AdminOrganization {
  id: string;
  name: string;
  plan: 'org_small' | 'org_medium' | 'org_large';
  memberCount: number;
  groupCount: number;
  isActive: boolean;
  createdDate: string;
  adminEmail: string;
  adminName: string;
  userId?: string;
}



interface NewOrgForm {
  location: string;
  name: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  password: string;
  repeatPassword: string;
  plan: string;
}

interface Plan {
  id: number;
  name: string;
  features: any;
  price_monthly: number;
}

export default function ManageOrganizationsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [newOrg, setNewOrg] = useState<NewOrgForm>({
    location: '',
    name: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    password: '',
    repeatPassword: '',
    plan: ''
  });

  useEffect(() => {
    void fetchOrganizations();
  }, []);

  useEffect(() => {
    if (showCreateModal && plans.length === 0) {
      void fetchPlans();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateModal, plans.length]);

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      console.log('Fetching plans from Directus...');
      
      const response = await resilientFetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/plans?filter[status][_eq]=published&fields=*`,
        {
          headers: directusHeaders(),
        }
      );

      const data = await response.json();
      console.log('Fetched plans:', data.data?.length || 0);
      setPlans(data.data || []);
      
      if (data.data && data.data.length > 0) {
        setNewOrg(prev => ({ ...prev, plan: String(data.data[0].id) }));
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      Alert.alert('Error', 'Failed to load plans. Please try again.');
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      console.log('Fetching organizations from Directus...');
      
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organizations?fields=*,user_id.first_name,user_id.last_name,user_id.email&limit=-1`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched organizations:', data.data?.length || 0);

      const formattedOrgs: AdminOrganization[] = await Promise.all(
        (data.data || []).map(async (org: any) => {
          let adminName = 'N/A';
          let adminEmail = 'N/A';
          let memberCount = 0;

          try {
            const orgUsersResponse = await fetch(
              `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organization_users?filter[organization_id][_eq]=${org.id}&fields=user_id.id,user_id.first_name,user_id.last_name,user_id.email,user_id.role&limit=-1`,
              {
                headers: {
                  'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (orgUsersResponse.ok) {
              const orgUsersData = await orgUsersResponse.json();
              const orgUsers = orgUsersData.data || [];
              
              memberCount = orgUsers.length;

              const adminUser = orgUsers.find(
                (ou: any) => ou.user_id?.role === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID
              );

              if (adminUser?.user_id) {
                const firstName = adminUser.user_id.first_name || '';
                const lastName = adminUser.user_id.last_name || '';
                adminName = `${firstName} ${lastName}`.trim() || 'N/A';
                adminEmail = adminUser.user_id.email || 'N/A';
              }
            }
          } catch (error) {
            console.error(`Error fetching users for organization ${org.id}:`, error);
          }

          return {
            id: String(org.id),
            name: org.name || 'Unnamed Organization',
            plan: org.plan_type || 'org_small',
            memberCount,
            groupCount: org.group_count || 0,
            isActive: org.is_active === true || org.is_active === 1,
            createdDate: org.date_created || new Date().toISOString(),
            adminEmail,
            adminName,
            userId: org.user_id?.id,
          };
        })
      );

      setOrganizations(formattedOrgs);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      Alert.alert('Error', 'Failed to load organizations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter organizations based on search query
  const filteredOrganizations = organizations.filter(org => {
    return (
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleToggleOrgStatus = async (id: string) => {
    const org = organizations.find(o => o.id === id);
    if (!org) return;

    const newStatus = !org.isActive;

    try {
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organizations/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_active: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update organization status');
      }

      setOrganizations(organizations.map(o => 
        o.id === id ? { ...o, isActive: newStatus } : o
      ));
      
      Alert.alert('Success', `Organization ${newStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (error) {
      console.error('Error updating organization status:', error);
      Alert.alert('Error', 'Failed to update organization status.');
    }
  };

  const handleDeleteOrganization = (id: string, name: string) => {
    Alert.alert(
      "Delete Organization",
      `Are you sure you want to delete "${name}"? This action cannot be undone and will remove all organization data.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          try {
            const response = await fetch(
              `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organizations/${id}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error('Failed to delete organization');
            }

            setOrganizations(organizations.filter(org => org.id !== id));
            Alert.alert("Success", `${name} has been deleted.`);
          } catch (error) {
            console.error('Error deleting organization:', error);
            Alert.alert('Error', 'Failed to delete organization.');
          }
        }}
      ]
    );
  };

  const handleViewOrganization = (org: AdminOrganization) => {
    Alert.alert(
      "Organization Details",
      `Name: ${org.name}\nAdmin: ${org.adminName}\nEmail: ${org.adminEmail}\nPlan: ${org.plan}\nMembers: ${org.memberCount}\nGroups: ${org.groupCount}\nCreated: ${new Date(org.createdDate).toLocaleDateString()}\nStatus: ${org.isActive ? 'Active' : 'Inactive'}`
    );
  };

  const handleCreateOrganization = async () => {
    if (!newOrg.location.trim() || !newOrg.name.trim() || !newOrg.adminFirstName.trim() || 
        !newOrg.adminLastName.trim() || !newOrg.adminEmail.trim() || 
        !newOrg.password.trim() || !newOrg.repeatPassword.trim() || !newOrg.plan) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (newOrg.password !== newOrg.repeatPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (newOrg.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newOrg.adminEmail)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    try {
      console.log('🚀 Starting organization creation process...');

      console.log('📧 Checking if email already exists...');
      const emailCheckResponse = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/users?filter[email][_eq]=${encodeURIComponent(newOrg.adminEmail)}`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (emailCheckResponse.ok) {
        const emailCheckData = await emailCheckResponse.json();
        if (emailCheckData.data && emailCheckData.data.length > 0) {
          Alert.alert('Error', 'A user with this email already exists. Please use a different email address.');
          return;
        }
      }

      console.log('👤 Step 1: Creating Directus user (organizer)...');
      const userResponse = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: newOrg.adminFirstName,
            last_name: newOrg.adminLastName,
            email: newOrg.adminEmail,
            password: newOrg.password,
            role: ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID,
            status: 'active',
          }),
        }
      );

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        console.error('❌ User creation failed:', errorData);
        throw new Error(errorData?.errors?.[0]?.message || 'Failed to create user');
      }

      const userData = await userResponse.json();
      const userId = userData.data.id;
      console.log('✅ User created successfully:', userId);

      console.log('🏢 Step 2: Creating organization...');
      const orgResponse = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organizations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newOrg.name,
            city: newOrg.location,
            organizer_id: userId,
            status: 'published',
          }),
        }
      );

      if (!orgResponse.ok) {
        const errorData = await orgResponse.json();
        console.error('❌ Organization creation failed:', errorData);
        throw new Error('Failed to create organization');
      }

      const orgData = await orgResponse.json();
      const organizationId = orgData.data.id;
      console.log('✅ Organization created successfully:', organizationId);

      console.log('👥 Step 3: Linking user to organization...');
      const orgUserResponse = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organization_users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            organization_id: organizationId,
            status: 'published',
          }),
        }
      );

      if (!orgUserResponse.ok) {
        const errorData = await orgUserResponse.json();
        console.error('❌ Organization user link failed:', errorData);
        throw new Error('Failed to link user to organization');
      }

      console.log('✅ User linked to organization successfully');

      console.log('💳 Step 4: Creating subscription...');
      const subscriptionResponse = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organization_subscriptions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organization_id: organizationId,
            plan_id: parseInt(newOrg.plan),
            user_id: userId,
            start_end: new Date().toISOString(),
            is_active: true,
            payment_status: 'active',
            payment_method: 'admin_created',
            status: 'published',
          }),
        }
      );

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json();
        console.error('❌ Subscription creation failed:', errorData);
        throw new Error('Failed to create subscription');
      }

      console.log('✅ Subscription created successfully');

      setNewOrg({
        location: '',
        name: '',
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        password: '',
        repeatPassword: '',
        plan: plans.length > 0 ? String(plans[0].id) : ''
      });
      setShowCreateModal(false);
      
      console.log('🔄 Refreshing organizations list...');
      await fetchOrganizations();
      
      console.log('🎉 Organization creation completed successfully!');
      Alert.alert(
        "Success",
        `Organization "${newOrg.name}" has been created successfully!\n\nAdmin Login:\nEmail: ${newOrg.adminEmail}\nPassword: (as provided)\n\nThe admin can now log in to the app.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('❌ Error creating organization:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organization. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'org_small': return 'Small Church';
      case 'org_medium': return 'Medium Church';
      case 'org_large': return 'Large Church';
      default: return plan;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'org_small': return '#3498db';
      case 'org_medium': return '#9b59b6';
      case 'org_large': return '#e74c3c';
      default: return Colors.light.primary;
    }
  };

  const renderOrganizationItem = ({ item }: { item: AdminOrganization }) => (
    <View style={styles.orgItem}>
      <View style={styles.orgHeader}>
        <View style={styles.orgInfo}>
          <Text style={styles.orgName}>{item.name}</Text>
          <View style={[
            styles.planBadge, 
            { backgroundColor: getPlanColor(item.plan) }
          ]}>
            <Text style={styles.planText}>{getPlanDisplayName(item.plan)}</Text>
          </View>
        </View>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.isActive ? '#2ecc71' : '#e74c3c' }
        ]}>
          <Text style={styles.statusText}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={styles.orgDetails}>
        <Text style={styles.adminInfo}>Admin: {item.adminName}</Text>
        <Text style={styles.adminEmail}>{item.adminEmail}</Text>
        
        <View style={styles.orgStats}>
          <View style={styles.statItem}>
            <Users size={16} color={Colors.light.textLight} />
            <Text style={styles.statText}>{item.memberCount} members</Text>
          </View>
          <View style={styles.statItem}>
            <Building size={16} color={Colors.light.textLight} />
            <Text style={styles.statText}>{item.groupCount} groups</Text>
          </View>
        </View>
        
        <Text style={styles.createdDate}>
          Created: {new Date(item.createdDate).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.orgActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewOrganization(item)}
        >
          <Eye size={18} color={Colors.light.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert("Edit Organization", "This feature will be available in a future update.")}
        >
          <Edit size={18} color={Colors.light.org1} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleToggleOrgStatus(item.id)}
        >
          <Settings size={18} color={item.isActive ? '#e74c3c' : '#2ecc71'} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteOrganization(item.id, item.name)}
        >
          <Trash2 size={18} color={Colors.light.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && organizations.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading organizations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search organizations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textLight}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={Colors.light.textLight} />
            </TouchableOpacity>
          )}
        </View>
        
        <Button
          title="Create Org"
          onPress={() => setShowCreateModal(true)}
          size="small"
          icon={<Plus size={16} color={Colors.light.white} />}
          style={styles.createButton}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{organizations.length}</Text>
          <Text style={styles.statLabel}>Total Organizations</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{organizations.filter(org => org.isActive).length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{organizations.reduce((sum, org) => sum + org.memberCount, 0)}</Text>
          <Text style={styles.statLabel}>Total Members</Text>
        </View>
      </View>

      <FlatList
        data={filteredOrganizations}
        keyExtractor={(item) => item.id}
        renderItem={renderOrganizationItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          void fetchOrganizations();
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No organizations found</Text>
          </View>
        }
      />

      {/* Create Organization Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Organization</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Organization Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter organization name"
                value={newOrg.name}
                onChangeText={(text) => setNewOrg({...newOrg, name: text})}
                placeholderTextColor={Colors.light.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>City / Location *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter city or location"
                value={newOrg.location}
                onChangeText={(text) => setNewOrg({...newOrg, location: text})}
                placeholderTextColor={Colors.light.textLight}
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup]}>
                <Text style={styles.formLabel}>Admin First Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="First name"
                  value={newOrg.adminFirstName}
                  onChangeText={(text) => setNewOrg({...newOrg, adminFirstName: text})}
                  placeholderTextColor={Colors.light.textLight}
                />
              </View>

              <View style={[styles.formGroup]}>
                <Text style={styles.formLabel}>Admin Last Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Last name"
                  value={newOrg.adminLastName}
                  onChangeText={(text) => setNewOrg({...newOrg, adminLastName: text})}
                  placeholderTextColor={Colors.light.textLight}
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Admin Email *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter admin email"
                value={newOrg.adminEmail}
                onChangeText={(text) => setNewOrg({...newOrg, adminEmail: text})}
                placeholderTextColor={Colors.light.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Password *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter password (min 8 characters)"
                value={newOrg.password}
                onChangeText={(text) => setNewOrg({...newOrg, password: text})}
                placeholderTextColor={Colors.light.textLight}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Repeat Password *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Repeat password"
                value={newOrg.repeatPassword}
                onChangeText={(text) => setNewOrg({...newOrg, repeatPassword: text})}
                placeholderTextColor={Colors.light.textLight}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Plan *</Text>
              {loadingPlans ? (
                <View style={styles.loadingPlansContainer}>
                  <ActivityIndicator size="small" color={Colors.light.primary} />
                  <Text style={styles.loadingPlansText}>Loading plans...</Text>
                </View>
              ) : plans.length > 0 ? (
                <View style={styles.plansList}>
                  {plans.map((plan) => (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planCard,
                        newOrg.plan === String(plan.id) && styles.planCardSelected
                      ]}
                      onPress={() => setNewOrg({...newOrg, plan: String(plan.id)})}
                    >
                      <View style={styles.planCardHeader}>
                        <Text style={[
                          styles.planCardName,
                          newOrg.plan === String(plan.id) && styles.planCardNameSelected
                        ]}>
                          {plan.name}
                        </Text>
                        {newOrg.plan === String(plan.id) && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[
                        styles.planCardPrice,
                        newOrg.plan === String(plan.id) && styles.planCardPriceSelected
                      ]}>
                        ${plan.price_monthly || 0}/month
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.noPlansText}>No plans available</Text>
              )}
            </View>
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowCreateModal(false)}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title="Create Organization"
                onPress={handleCreateOrganization}
                style={styles.createOrgButton}
              />
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
  header: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    color: Colors.light.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  createButton: {
    minWidth: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statValue: {
    ...theme.typography.subtitle,
    fontSize: 20,
    color: Colors.light.primary,
  },
  statLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  orgItem: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  orgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  orgInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgName: {
    ...theme.typography.subtitle,
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  planText: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: '600',
  },
  orgDetails: {
    marginBottom: theme.spacing.sm,
  },
  adminInfo: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  adminEmail: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginBottom: theme.spacing.sm,
  },
  orgStats: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  statText: {
    ...theme.typography.caption,
    marginLeft: 4,
  },
  createdDate: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  orgActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    marginTop: theme.spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    ...theme.typography.title,
    fontSize: 20,
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
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  formGroupHalf: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  formLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  formInput: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: Colors.light.text,
  },
  planSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  planOption: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  planOptionSelected: {
    backgroundColor: Colors.light.primary,
  },
  planOptionText: {
    ...theme.typography.body,
    fontSize: 14,
  },
  planOptionTextSelected: {
    color: Colors.light.white,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.xl,
  },
  cancelButton: {
    marginRight: theme.spacing.md,
  },
  createOrgButton: {
    minWidth: 180,
  },
  loadingPlansContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  loadingPlansText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    marginLeft: theme.spacing.sm,
  },
  plansList: {
    gap: theme.spacing.sm,
  },
  planCard: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.light.border,
    padding: theme.spacing.md,
  },
  planCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight || '#E8F4FD',
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  planCardName: {
    ...theme.typography.subtitle,
    fontSize: 16,
    color: Colors.light.text,
  },
  planCardNameSelected: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  selectedBadge: {
    backgroundColor: Colors.light.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: '700',
  },
  planCardPrice: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
  planCardPriceSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  noPlansText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    textAlign: 'center',
    padding: theme.spacing.md,
  },
});