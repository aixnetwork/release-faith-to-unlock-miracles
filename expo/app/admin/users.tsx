import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Alert, Switch, ActivityIndicator, Platform, ToastAndroid } from 'react-native';
import { Search, X, UserCheck, UserX, Mail, Shield } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { ENV } from '@/config/env';

interface DirectusUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: {
    id: string;
    name: string;
  } | string | null;
  status: string;

}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleName: string;
  isActive: boolean;

}



const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (Platform.OS === 'web') {
    return `/api/proxy${cleanPath}`;
  }
  return `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}${cleanPath}`;
};

export default function ManageUsersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('📡 Fetching users from Directus...');

      const response = await fetch(
        getApiUrl('/users?fields=id,first_name,last_name,email,role.*,status&limit=-1'),
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Users fetched:', result.data?.length || 0);

      const mappedUsers: User[] = (result.data || []).map((directusUser: DirectusUser) => {
        const roleObj = typeof directusUser.role === 'object' && directusUser.role ? directusUser.role : null;
        const roleName = roleObj?.name || 'User';
        const roleId = roleObj?.id || (typeof directusUser.role === 'string' ? directusUser.role : '');

        return {
          id: directusUser.id,
          name: `${directusUser.first_name || ''} ${directusUser.last_name || ''}`.trim() || 'No Name',
          email: directusUser.email,
          role: roleId,
          roleName: roleName,
          isActive: directusUser.status === 'active',
        };
      });

      setUsersList(mappedUsers);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      const message = 'Failed to load users';
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  // Filter users based on search query, active status, and role
  const filteredUsers = usersList.filter(userItem => {
    const matchesSearch = 
      (userItem.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (userItem.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesActiveFilter = 
      filterActive === null || userItem.isActive === filterActive;
    
    const matchesRoleFilter = 
      filterRole === null || userItem.roleName === filterRole;
    
    return matchesSearch && matchesActiveFilter && matchesRoleFilter;
  });

  const handleToggleUserStatus = async (id: string) => {
    try {
      const userToUpdate = usersList.find(u => u.id === id);
      if (!userToUpdate) return;

      const newStatus = userToUpdate.isActive ? 'suspended' : 'active';
      console.log(`🔄 Updating user ${id} status to ${newStatus}`);

      const response = await fetch(
        getApiUrl(`/users/${id}`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update user status: ${response.status}`);
      }

      console.log('✅ User status updated successfully');
      setUsersList(usersList.map(user => 
        user.id === id ? { ...user, isActive: !user.isActive } : user
      ));

      const message = `User ${userToUpdate.isActive ? 'suspended' : 'activated'} successfully`;
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', message);
      }
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      const message = 'Failed to update user status';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  const handleMakeAdmin = (id: string) => {
    Alert.alert(
      "Make Admin",
      "This would grant admin privileges to this user. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => {
          Alert.alert("Success", "User has been granted admin privileges.");
        }}
      ]
    );
  };

  const handleSendEmail = (email: string) => {
    Alert.alert(
      "Send Email",
      `This would open an email composer to ${email}`,
      [{ text: "OK" }]
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={[
            styles.planBadge, 
            { backgroundColor: 
              item.roleName === 'Administrator' ? '#6a11cb' : 
              item.roleName === 'Organizer' ? Colors.light.secondary : 
              Colors.light.primary 
            }
          ]}>
            <Text style={styles.planText}>
              {item.roleName}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.emailContainer}
          onPress={() => handleSendEmail(item.email)}
        >
          <Mail size={14} color={Colors.light.primary} style={styles.emailIcon} />
          <Text style={styles.userEmail}>{item.email}</Text>
        </TouchableOpacity>
        

      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={styles.adminButton}
          onPress={() => handleMakeAdmin(item.id)}
        >
          <Shield size={18} color={Colors.light.primary} />
        </TouchableOpacity>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>{item.isActive ? 'Active' : 'Inactive'}</Text>
          <Switch
            value={item.isActive}
            onValueChange={() => handleToggleUserStatus(item.id)}
            trackColor={{ false: '#d1d1d1', true: Colors.light.primary + '80' }}
            thumbColor={item.isActive ? Colors.light.primary : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
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
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Status</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterActive === null && styles.activeFilterButton
            ]}
            onPress={() => setFilterActive(null)}
          >
            <Text style={[
              styles.filterText,
              filterActive === null && styles.activeFilterText
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterActive === true && styles.activeFilterButton
            ]}
            onPress={() => setFilterActive(true)}
          >
            <UserCheck 
              size={16} 
              color={filterActive === true ? Colors.light.white : Colors.light.text} 
              style={styles.filterIcon}
            />
            <Text style={[
              styles.filterText,
              filterActive === true && styles.activeFilterText
            ]}>
              Active
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterActive === false && styles.activeFilterButton
            ]}
            onPress={() => setFilterActive(false)}
          >
            <UserX 
              size={16} 
              color={filterActive === false ? Colors.light.white : Colors.light.text} 
              style={styles.filterIcon}
            />
            <Text style={[
              styles.filterText,
              filterActive === false && styles.activeFilterText
            ]}>
              Inactive
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Role</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterRole === null && styles.activeFilterButton
            ]}
            onPress={() => setFilterRole(null)}
          >
            <Text style={[
              styles.filterText,
              filterRole === null && styles.activeFilterText
            ]}>
              All Roles
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterRole === 'Administrator' && styles.activeFilterButton
            ]}
            onPress={() => setFilterRole('Administrator')}
          >
            <Shield 
              size={16} 
              color={filterRole === 'Administrator' ? Colors.light.white : Colors.light.text} 
              style={styles.filterIcon}
            />
            <Text style={[
              styles.filterText,
              filterRole === 'Administrator' && styles.activeFilterText
            ]}>
              Admin
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterRole === 'Organizer' && styles.activeFilterButton
            ]}
            onPress={() => setFilterRole('Organizer')}
          >
            <Text style={[
              styles.filterText,
              filterRole === 'Organizer' && styles.activeFilterText
            ]}>
              Organizer
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterRole === 'User' && styles.activeFilterButton
            ]}
            onPress={() => setFilterRole('User')}
          >
            <Text style={[
              styles.filterText,
              filterRole === 'User' && styles.activeFilterText
            ]}>
              User
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>User Accounts</Text>
            <Text style={styles.listCount}>{filteredUsers.length} users</Text>
          </View>
        }
          ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
      )}
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
    paddingBottom: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
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
  filterSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  filterSectionTitle: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.textLight,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activeFilterButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  activeFilterText: {
    color: Colors.light.white,
  },
  filterIcon: {
    marginRight: 4,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  listTitle: {
    ...theme.typography.subtitle,
  },
  listCount: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  userItem: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  userInfo: {
    marginBottom: theme.spacing.sm,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    ...theme.typography.subtitle,
    fontSize: 16,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  planText: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emailIcon: {
    marginRight: 4,
  },
  userEmail: {
    ...theme.typography.caption,
    color: Colors.light.primary,
  },
  dateContainer: {
    gap: 2,
  },
  joinDate: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    fontSize: 11,
  },
  lastAccessDate: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    fontSize: 11,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  adminButton: {
    padding: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    ...theme.typography.caption,
    marginRight: theme.spacing.sm,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    marginTop: theme.spacing.md,
  },
});