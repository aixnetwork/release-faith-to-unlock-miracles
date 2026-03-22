import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { Search, X, Users, UserPlus, Edit, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';

// Types
interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

interface NewGroupData {
  name: string;
  description: string;
}

// Mock group data
const mockGroups: Group[] = [
  { id: '1', name: 'Youth Group', description: 'For teenagers and young adults', memberCount: 15, createdAt: '2023-01-15T10:30:00Z' },
  { id: '2', name: 'Bible Study', description: 'Weekly scripture study group', memberCount: 8, createdAt: '2023-02-20T14:45:00Z' },
  { id: '3', name: 'Worship Team', description: 'Music and worship planning', memberCount: 6, createdAt: '2023-03-05T09:15:00Z' },
  { id: '4', name: 'Prayer Circle', description: 'Dedicated to prayer and intercession', memberCount: 12, createdAt: '2023-04-10T16:20:00Z' },
];

export default function ManageGroupsScreen() {
  const { plan, organization } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [newGroup, setNewGroup] = useState<NewGroupData>({
    name: '',
    description: ''
  });

  // Get group limit based on plan
  const getGroupLimit = () => {
    switch (plan) {
      case 'org_small': return 5;
      case 'org_medium': return 20;
      case 'org_large': return 'Unlimited';
      default: return 0;
    }
  };

  const groupLimit = getGroupLimit();
  const currentGroupCount = groups.length;

  // Filter groups based on search query
  const filteredGroups = groups.filter((group: Group) => {
    return (
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDeleteGroup = (id: string, name: string) => {
    Alert.alert(
      "Delete Group",
      `Are you sure you want to delete the "${name}" group? This will remove all members from this group.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
          setGroups(groups.filter((group: Group) => group.id !== id));
          Alert.alert("Success", `The "${name}" group has been deleted.`);
        }}
      ]
    );
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setNewGroup({
      name: group.name,
      description: group.description
    });
    setModalVisible(true);
  };

  const toggleGroupExpanded = (id: string) => {
    setExpandedGroup(expandedGroup === id ? null : id);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const openCreateModal = () => {
    setEditingGroup(null);
    setNewGroup({
      name: '',
      description: ''
    });
    setModalVisible(true);
  };

  const handleSaveGroup = () => {
    if (!newGroup.name.trim()) {
      Alert.alert("Error", "Please enter a name for the group.");
      return;
    }

    // Check if we've reached the group limit for new groups
    if (!editingGroup && typeof groupLimit === 'number' && currentGroupCount >= groupLimit) {
      Alert.alert(
        "Group Limit Reached",
        `You've reached your plan's limit of ${groupLimit} groups. Please upgrade your plan to create more groups.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade Plan", onPress: () => router.push('/membership') }
        ]
      );
      return;
    }

    if (editingGroup) {
      // Update existing group
      setGroups(groups.map((group: Group) => 
        group.id === editingGroup.id ? 
        { ...group, name: newGroup.name, description: newGroup.description } : 
        group
      ));
      Alert.alert("Success", `The "${newGroup.name}" group has been updated.`);
    } else {
      // Create new group
      const newId = `group_${Date.now()}`;
      const groupToAdd: Group = {
        id: newId,
        name: newGroup.name,
        description: newGroup.description,
        memberCount: 0,
        createdAt: new Date().toISOString()
      };
      setGroups([...groups, groupToAdd]);
      Alert.alert("Success", `The "${newGroup.name}" group has been created.`);
    }

    setModalVisible(false);
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <View style={styles.groupItem}>
      <TouchableOpacity 
        style={styles.groupHeader}
        onPress={() => toggleGroupExpanded(item.id)}
      >
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.memberCount}>{item.memberCount} members</Text>
        </View>
        
        {expandedGroup === item.id ? (
          <ChevronUp size={20} color={Colors.light.textLight} />
        ) : (
          <ChevronDown size={20} color={Colors.light.textLight} />
        )}
      </TouchableOpacity>
      
      {expandedGroup === item.id && (
        <View style={styles.groupDetails}>
          <Text style={styles.descriptionLabel}>Description:</Text>
          <Text style={styles.description}>{item.description}</Text>
          
          <View style={styles.createdDate}>
            <Text style={styles.createdLabel}>Created:</Text>
            <Text style={styles.createdValue}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.groupActions}>
            <TouchableOpacity 
              style={styles.groupAction}
              onPress={() => { /* View Members functionality */ }}
            >
              <Users size={18} color={Colors.light.primary} />
              <Text style={styles.actionText}>View Members</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.groupAction}
              onPress={() => handleEditGroup(item)}
            >
              <Edit size={18} color={Colors.light.org2} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.groupAction}
              onPress={() => handleDeleteGroup(item.id, item.name)}
            >
              <Trash2 size={18} color={Colors.light.error} />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
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
          title="Create Group"
          onPress={openCreateModal}
          size="small"
          icon={<Plus size={16} color={Colors.light.white} />}
          style={styles.createButton}
        />
      </View>

      <View style={styles.groupCountContainer}>
        <Text style={styles.groupCount}>
          {currentGroupCount} {currentGroupCount === 1 ? 'group' : 'groups'}
          {typeof groupLimit === 'number' ? ` / ${groupLimit}` : ''}
        </Text>
      </View>

      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No groups found</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingGroup ? 'Edit Group' : 'Create New Group'}
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Group Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter group name"
                value={newGroup.name}
                onChangeText={(text) => setNewGroup({...newGroup, name: text})}
                placeholderTextColor={Colors.light.textLight}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Enter group description"
                value={newGroup.description}
                onChangeText={(text) => setNewGroup({...newGroup, description: text})}
                placeholderTextColor={Colors.light.textLight}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                size="small"
                style={styles.cancelButton}
              />
              <Button
                title={editingGroup ? "Save Changes" : "Create Group"}
                onPress={handleSaveGroup}
                size="small"
                style={styles.saveButton}
              />
            </View>
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
  groupCountContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  groupCount: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  groupItem: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    ...theme.typography.subtitle,
    fontSize: 16,
  },
  memberCount: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  groupDetails: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  descriptionLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  description: {
    ...theme.typography.body,
    marginBottom: theme.spacing.md,
  },
  createdDate: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  createdLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    marginRight: theme.spacing.xs,
  },
  createdValue: {
    ...theme.typography.body,
  },
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  actionText: {
    ...theme.typography.caption,
    marginLeft: 4,
  },
  deleteText: {
    color: Colors.light.error,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  formLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  formInput: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  saveButton: {
    flex: 1,
  },
});