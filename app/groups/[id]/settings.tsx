import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Switch, TextInput, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Users, Shield, Bell, Lock, Globe, Trash2, UserMinus, Crown, AlertTriangle, UserPlus, Mail, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import BottomNavigation from '@/components/BottomNavigation';
import { trpc } from '@/lib/trpc';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  joinedDate: string;
  isActive: boolean;
  status?: 'active' | 'invited';
}

export default function GroupSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plan, user } = useUserStore();
  const [notifications, setNotifications] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowInvites, setAllowInvites] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [members, setMembers] = useState<GroupMember[]>([]);

  const hasGroupAccess = plan && ['group_family', 'org_small', 'org_medium', 'org_large'].includes(plan);
  const hasAdvancedFeatures = plan && ['org_medium', 'org_large'].includes(plan);
  const isAdmin = user?.email === 'admin@church.com';
  const isModerator = user?.email === 'moderator@church.com' || isAdmin;

  const getMembersQuery = trpc.groups.getMembers.useQuery(
    { groupId: id || '1' },
    { enabled: hasGroupAccess }
  );

  const addMemberMutation = trpc.groups.addMember.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success', data.message);
      setInviteEmail('');
      setShowInviteModal(false);
      getMembersQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const removeMemberMutation = trpc.groups.removeMember.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success', data.message);
      getMembersQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  useEffect(() => {
    if (getMembersQuery.data?.members) {
      setMembers(getMembersQuery.data.members);
    }
  }, [getMembersQuery.data]);

  const groupInfo = {
    id: id || '1',
    title: 'Family Prayer Circle',
    description: 'Share prayer requests and encourage one another in faith',
    memberCount: members.length,
    creator: user?.name || 'You',
    createdDate: '2024-01-15',
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You will no longer receive messages or notifications.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Left Group', 'You have left the group successfully.');
            router.back();
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone and all messages will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Group Deleted', 'The group has been deleted successfully.');
            router.replace('/groups');
          },
        },
      ]
    );
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    addMemberMutation.mutate({
      groupId: id || '1',
      email: inviteEmail,
      role: 'member',
    });
  };

  const handleRemoveMember = (member: GroupMember) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.name} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeMemberMutation.mutate({
              groupId: id || '1',
              memberId: member.id,
            });
          },
        },
      ]
    );
  };

  const handleChangeRole = (member: GroupMember, newRole: 'admin' | 'moderator' | 'member') => {
    Alert.alert(
      'Change Role',
      `Change ${member.name}'s role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Role Changed', `${member.name} is now a ${newRole}.`);
          },
        },
      ]
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown size={16} color={Colors.light.warning} />;
      case 'moderator':
        return <Shield size={16} color={Colors.light.primary} />;
      default:
        return <Users size={16} color={Colors.light.textMedium} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return Colors.light.warning;
      case 'moderator':
        return Colors.light.primary;
      default:
        return Colors.light.textMedium;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Group Settings',
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Info */}
        <LinearGradient
          colors={[Colors.light.primary + '20', Colors.light.primary + '10'] as const}
          style={styles.groupHeader}
        >
          <Text style={styles.groupTitle}>{groupInfo.title}</Text>
          <Text style={styles.groupDescription}>{groupInfo.description}</Text>
          <View style={styles.groupStats}>
            <View style={styles.stat}>
              <Users size={16} color={Colors.light.textMedium} />
              <Text style={styles.statText}>{groupInfo.memberCount} members</Text>
            </View>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.statText}>Created {groupInfo.createdDate}</Text>
          </View>
        </LinearGradient>

        {/* Personal Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Settings</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Bell size={20} color={Colors.light.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive notifications for new messages
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                thumbColor={notifications ? Colors.light.white : Colors.light.textLight}
              />
            </View>
          </View>
        </View>

        {/* Group Settings (Admin/Moderator only) */}
        {isModerator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group Settings</Text>
            
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  {isPrivate ? (
                    <Lock size={20} color={Colors.light.error} />
                  ) : (
                    <Globe size={20} color={Colors.light.success} />
                  )}
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Private Group</Text>
                    <Text style={styles.settingDescription}>
                      {isPrivate ? 'Only invited members can join' : 'Anyone can discover and join'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isPrivate}
                  onValueChange={setIsPrivate}
                  trackColor={{ false: Colors.light.border, true: Colors.light.error }}
                  thumbColor={isPrivate ? Colors.light.white : Colors.light.textLight}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Users size={20} color={Colors.light.primary} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Allow Member Invites</Text>
                    <Text style={styles.settingDescription}>
                      Let members invite others to the group
                    </Text>
                  </View>
                </View>
                <Switch
                  value={allowInvites}
                  onValueChange={setAllowInvites}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor={allowInvites ? Colors.light.white : Colors.light.textLight}
                />
              </View>
            </View>
          </View>
        )}

        {/* Members Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Members ({members.length})</Text>
            {hasGroupAccess && (
              <TouchableOpacity 
                style={styles.inviteButton}
                onPress={() => setShowInviteModal(true)}
              >
                <UserPlus size={16} color={Colors.light.white} />
                <Text style={styles.inviteButtonText}>Add Member</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Invite Modal */}
          {showInviteModal && (
            <View style={styles.inviteModal}>
              <LinearGradient
                colors={[Colors.light.primary + '10', Colors.light.primary + '05'] as const}
                style={styles.inviteModalContent}
              >
                <View style={styles.inviteModalHeader}>
                  <View style={styles.inviteModalTitleRow}>
                    <Mail size={20} color={Colors.light.primary} />
                    <Text style={styles.inviteModalTitle}>Invite Member</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                    }}
                  >
                    <X size={20} color={Colors.light.textMedium} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.inviteModalDescription}>
                  Enter the email address of the person you want to add to your group.
                </Text>
                
                <TextInput
                  style={styles.inviteInput}
                  placeholder="Email address"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={Colors.light.textMedium}
                />
                
                <TouchableOpacity
                  style={[
                    styles.sendInviteButton,
                    (!inviteEmail.trim() || addMemberMutation.isPending) && styles.sendInviteButtonDisabled
                  ]}
                  onPress={handleInviteMember}
                  disabled={!inviteEmail.trim() || addMemberMutation.isPending}
                >
                  {addMemberMutation.isPending ? (
                    <ActivityIndicator size="small" color={Colors.light.white} />
                  ) : (
                    <>
                      <UserPlus size={18} color={Colors.light.white} />
                      <Text style={styles.sendInviteButtonText}>Send Invitation</Text>
                    </>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          <View style={styles.membersCard}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                <View style={styles.memberInfo}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberDetails}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <View style={styles.roleContainer}>
                        {getRoleIcon(member.role)}
                        <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                          {member.role}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                    <Text style={styles.memberJoined}>
                      Joined {member.joinedDate} • {member.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                {isModerator && member.id !== user?.id && (
                  <View style={styles.memberActions}>
                    {hasAdvancedFeatures && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          Alert.alert(
                            'Change Role',
                            'Select new role:',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Member', onPress: () => handleChangeRole(member, 'member') },
                              { text: 'Moderator', onPress: () => handleChangeRole(member, 'moderator') },
                              ...(isAdmin ? [{ text: 'Admin', onPress: () => handleChangeRole(member, 'admin') }] : []),
                            ]
                          );
                        }}
                      >
                        <Shield size={16} color={Colors.light.primary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleRemoveMember(member)}
                    >
                      <UserMinus size={16} color={Colors.light.error} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <View style={styles.dangerCard}>
            <TouchableOpacity style={styles.dangerButton} onPress={handleLeaveGroup}>
              <UserMinus size={20} color={Colors.light.error} />
              <View style={styles.dangerButtonText}>
                <Text style={styles.dangerTitle}>Leave Group</Text>
                <Text style={styles.dangerDescription}>
                  You will no longer receive messages from this group
                </Text>
              </View>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteGroup}>
                <Trash2 size={20} color={Colors.light.error} />
                <View style={styles.dangerButtonText}>
                  <Text style={styles.dangerTitle}>Delete Group</Text>
                  <Text style={styles.dangerDescription}>
                    Permanently delete this group and all messages
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!hasAdvancedFeatures && (
          <View style={styles.upgradePrompt}>
            <LinearGradient
              colors={[Colors.light.warning + '20', Colors.light.warning + '10'] as const}
              style={styles.upgradeCard}
            >
              <AlertTriangle size={32} color={Colors.light.warning} />
              <Text style={styles.upgradeTitle}>Unlock Advanced Features</Text>
              <Text style={styles.upgradeDescription}>
                Upgrade to Medium or Large Church plans for advanced moderation tools, role management, and more.
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.push('/membership')}
              >
                <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  groupHeader: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  groupDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 20,
  },
  groupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  separator: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  section: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
  },
  inviteButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  inviteModal: {
    marginBottom: theme.spacing.md,
  },
  inviteModalContent: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.primary + '20',
    gap: theme.spacing.md,
  },
  inviteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  inviteModalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
  },
  inviteModalDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  inviteInput: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.textPrimary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sendInviteButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  sendInviteButtonDisabled: {
    backgroundColor: Colors.light.textLight,
    opacity: 0.5,
  },
  sendInviteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  settingCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 18,
  },
  membersCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize',
  },
  memberEmail: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginBottom: 2,
  },
  memberJoined: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  memberActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.light.background,
  },
  dangerCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.error + '30',
    overflow: 'hidden',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  dangerButtonText: {
    flex: 1,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.error,
    marginBottom: 2,
  },
  dangerDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 18,
  },
  upgradePrompt: {
    padding: theme.spacing.lg,
  },
  upgradeCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  upgradeDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: Colors.light.warning,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
});