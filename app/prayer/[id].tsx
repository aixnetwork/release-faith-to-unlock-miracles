import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { Stack, router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Calendar, Tag, CheckCircle, Send, User, MessageCircle, Heart, Reply, Users } from 'lucide-react-native';
import { BackButton } from '@/components/BackButton';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { getFirstName } from '@/utils/nameUtils';

import { ENV } from '@/config/env';
import { fetchWithAuth } from '@/utils/authUtils';
import { getDirectusApiUrl } from '@/utils/api';
import { UserProfileModal } from '@/components/UserProfileModal';
import { PrayerCommentModal } from '@/components/PrayerCommentModal';

interface Comment {
  id: string;
  comments: string;
  date_created: string;
  user_id: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    date_created?: string;
  };
  liked: number | boolean;
  comment_id: string | null;
}

export default function PrayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, organization } = useUserStore();
  const [comment, setComment] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToName, setReplyingToName] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<Comment['user_id'] | null>(null);
  const [isUserOrganizer, setIsUserOrganizer] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [isMarkingAnswered, setIsMarkingAnswered] = useState(false);


  const [prayer, setPrayer] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [prayerLoading, setPrayerLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUserPrayed, setHasUserPrayed] = useState(false);
  const [currentPrayerIndex, setCurrentPrayerIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fetchPrayer = useCallback(async () => {
    if (!id) return;
    try {
      setPrayerLoading(true);
      const response = await fetchWithAuth(
        `${getDirectusApiUrl()}/items/prayers/${id}?fields=*,user_id.id,user_id.first_name,user_id.last_name`
      );
      if (response.ok) {
        const data = await response.json();
        
        const commentCountUrl = `${getDirectusApiUrl()}/items/prayer_comments?filter[prayer_id][_eq]=${id}&aggregate[count]=id`;
        const commentCountResponse = await fetchWithAuth(commentCountUrl);
        
        let commentCount = data.data.prayerCount || 0;
        if (commentCountResponse.ok) {
          const commentCountData = await commentCountResponse.json();
          commentCount = commentCountData.data?.[0]?.count?.id || 0;
        }
        
        setPrayer({ ...data.data, prayerCount: commentCount });
      }
    } catch (error) {
      console.error('Error fetching prayer:', error);
    } finally {
      setPrayerLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    try {
      setCommentsLoading(true);
      const response = await fetchWithAuth(
        `${getDirectusApiUrl()}/items/prayer_comments?filter[prayer_id][_eq]=${id}&fields=*,user_id.id,user_id.first_name,user_id.last_name,user_id.email&sort=date_created`
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched comments:', JSON.stringify(data.data, null, 2));
        const commentsArray = Array.isArray(data.data) ? data.data : [];
        setComments(commentsArray);
        
        if (user?.id && commentsArray.length > 0) {
          const userHasPrayed = commentsArray.some((c: Comment) => 
            c.user_id?.id === user.id
          );
          setHasUserPrayed(userHasPrayed);
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    void fetchPrayer();
    void fetchComments();
  }, [fetchPrayer, fetchComments]);

  useEffect(() => {
    if (comments.length === 0) return;

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentPrayerIndex((prev) => (prev + 1) % comments.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [comments.length, fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      console.log('Prayer detail screen focused, refetching data...');
      void fetchPrayer();
      void fetchComments();
    }, [fetchPrayer, fetchComments])
  );

  useEffect(() => {
    const checkPermissions = async () => {
      if (!prayer || !user?.id) {
        console.log('Cannot check permissions: prayer or user missing', { prayer: !!prayer, userId: user?.id });
        return;
      }

      const prayerUserId = typeof prayer.user_id === 'string' ? prayer.user_id : prayer.user_id?.id;
      const _isOwner = prayerUserId === user.id;
      
      let organizerCheck = false;
      if (prayer.organization_id) {
        console.log('Checking organizer role for:', { userId: user.id, organizationId: prayer.organization_id });
        try {
          const response = await fetchWithAuth(
            `${getDirectusApiUrl()}/items/organization_users?filter[user_id][_eq]=${user.id}&filter[organization_id][_eq]=${prayer.organization_id}&fields=role_id`
          );
          
          if (response.ok) {
            const data = await response.json();
            console.log('Organization users response:', JSON.stringify(data, null, 2));
            if (data.data && data.data.length > 0) {
              const roleId = data.data[0].role_id;
              console.log('User role_id:', roleId, 'Organizer role_id:', ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID);
              organizerCheck = roleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID;
            }
          } else {
            const errorData = await response.json();
            console.error('Failed to fetch organization users:', errorData);
          }
        } catch (error) {
          console.error('Error checking organizer role:', error);
        }
      } else {
        console.log('No organization_id on prayer');
      }

      console.log('Setting isOrganizer to:', organizerCheck);
      setIsOrganizer(organizerCheck);
    };

    void checkPermissions();
  }, [prayer, user?.id]);

  const handleAddComment = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }
    
    if (!user?.id) {
      console.error('❌ No user ID available for adding comment');
      Alert.alert('Error', 'You must be logged in to comment');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('=== Adding Comment (Prayer Detail) ===');
      console.log('Prayer ID:', id);
      console.log('User ID:', user.id);
      console.log('Comment:', comment.trim());
      console.log('Reply to:', replyingTo);
      
      const commentData = {
        prayer_id: id,
        user_id: user.id,
        comments: comment.trim(),
        liked: 0,
        comment_id: replyingTo || null,
      };
      
      console.log('Comment payload:', JSON.stringify(commentData, null, 2));
      
      const response = await fetchWithAuth(
        `${getDirectusApiUrl()}/items/prayer_comments`,
        {
          method: 'POST',
          body: JSON.stringify(commentData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Comment added successfully:', JSON.stringify(result, null, 2));
        setComment('');
        setReplyingTo(null);
        setReplyingToName('');
        await fetchComments();
        await fetchPrayer();
        Alert.alert('Success', 'Comment added successfully');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to add comment:', response.status, errorText);
        Alert.alert('Error', 'Failed to add comment. Please try again.');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (commentId: string, userName: string) => {
    if (!prayer?.organization_id || !user?.id) {
      Alert.alert('Error', 'Unable to reply');
      return;
    }

    try {
      const orgResponse = await fetchWithAuth(
        `${getDirectusApiUrl()}/items/organization_users?filter[user_id][_eq]=${user.id}&filter[organization_id][_eq]=${prayer.organization_id}&fields=role_id`
      );
      
      if (!orgResponse.ok || !(await orgResponse.json()).data?.length) {
        Alert.alert('Permission Denied', 'You must be a member of this organization to reply to comments');
        return;
      }
    } catch (error) {
      console.error('Error checking organization membership:', error);
      Alert.alert('Error', 'Failed to verify permissions');
      return;
    }

    setReplyingTo(commentId);
    setReplyingToName(userName);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyingToName('');
  };

  const handleLikeComment = async (commentId: string, currentLiked: number | boolean) => {
    if (!prayer?.organization_id || !user?.id) {
      Alert.alert('Error', 'Unable to like comment');
      return;
    }

    try {
      const orgResponse = await fetchWithAuth(
        `${getDirectusApiUrl()}/items/organization_users?filter[user_id][_eq]=${user.id}&filter[organization_id][_eq]=${prayer.organization_id}&fields=role_id`
      );
      
      if (!orgResponse.ok || !(await orgResponse.json()).data?.length) {
        Alert.alert('Permission Denied', 'You must be a member of this organization to like comments');
        return;
      }
    } catch (error) {
      console.error('Error checking organization membership:', error);
      Alert.alert('Error', 'Failed to verify permissions');
      return;
    }
    
    try {
      const isLiked = currentLiked === 1 || currentLiked === true;
      const newLiked = isLiked ? 0 : 1;
      console.log('Liking comment:', commentId, 'Current:', currentLiked, 'isLiked:', isLiked, 'New:', newLiked);
      
      const response = await fetchWithAuth(
        `${getDirectusApiUrl()}/items/prayer_comments/${commentId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ liked: newLiked }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('Like response:', JSON.stringify(result, null, 2));
        await fetchComments();
      } else {
        const errorData = await response.json();
        console.error('Failed to like comment:', errorData);
        Alert.alert('Error', 'Failed to like comment');
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      Alert.alert('Error', 'Failed to like comment');
    }
  };

  const handleUserClick = async (userId: Comment['user_id'], commentUserId?: string) => {
    setSelectedUser(userId);
    
    if (prayer?.organization_id && commentUserId) {
      try {
        const response = await fetchWithAuth(
          `${getDirectusApiUrl()}/items/organization_users?filter[user_id][_eq]=${commentUserId}&filter[organization_id][_eq]=${prayer.organization_id}&fields=role_id`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const roleId = data.data[0].role_id;
            setIsUserOrganizer(roleId === ENV.EXPO_PUBLIC_DIRECTUS_ORGANIZER_ROLE_ID);
          } else {
            setIsUserOrganizer(false);
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsUserOrganizer(false);
      }
    } else {
      setIsUserOrganizer(false);
    }
    
    setProfileModalVisible(true);
  };

  const handleMarkPrayed = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to pray');
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${getDirectusApiUrl()}/items/prayer_comments?filter[prayer_id][_eq]=${id}&filter[user_id][_eq]=${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        const existingComment = data.data && data.data.length > 0;

        if (existingComment) {
          Alert.alert('Already Prayed', 'You have already prayed for this request.');
          return;
        }
      }
    } catch (_error) {
      console.error('Error checking existing comment:', _error);
    }

    setCommentModalVisible(true);
  };

  const handleSubmitPrayer = async (commentText: string) => {
    if (!user?.id) {
      console.error('❌ No user ID available');
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    if (isMarkingAnswered) {
      await handleSubmitAnswered(commentText);
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('=== Submitting Prayer Comment (I Prayed) ===');
      console.log('Prayer ID:', id);
      console.log('User ID:', user.id);
      console.log('Comment:', commentText);
      
      const commentData = {
        prayer_id: id,
        user_id: user.id,
        comments: commentText || 'Prayed for this request',
        liked: 0,
        comment_id: null,
      };
      
      console.log('Comment payload:', JSON.stringify(commentData, null, 2));

      const commentResponse = await fetchWithAuth(
        `${getDirectusApiUrl()}/items/prayer_comments`,
        {
          method: 'POST',
          body: JSON.stringify(commentData),
        }
      );

      if (!commentResponse.ok) {
        const errorText = await commentResponse.text();
        console.error('❌ Comment creation failed:', commentResponse.status, errorText);
        Alert.alert('Error', 'Failed to add comment. Please try again.');
        return;
      }
      
      const commentResult = await commentResponse.json();
      console.log('✅ Comment created:', JSON.stringify(commentResult, null, 2));

      await fetchPrayer();
      await fetchComments();
      setHasUserPrayed(true);
      setCommentModalVisible(false);
      Alert.alert('Success', 'Thank you for praying!');
    } catch (error) {
      console.error('Error marking prayed:', error);
      Alert.alert('Error', 'Failed to mark as prayed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAnswered = async () => {
    console.log('=== handleMarkAnswered START ===');
    console.log('isOrganizer:', isOrganizer);
    console.log('prayer.answered:', prayer?.answered);
    console.log('prayer.id:', id);
    
    if (!isOrganizer) {
      console.log('Permission denied - not an organizer');
      Alert.alert('Permission Denied', 'Only organizers can mark prayers as answered');
      return;
    }

    console.log('Opening comment modal for marking as answered...');
    setIsMarkingAnswered(true);
    setCommentModalVisible(true);
  };

  const handleSubmitAnswered = async (commentText: string) => {
    if (!user?.id) return;

    try {
      setIsSubmitting(true);
      console.log('Making API call to mark prayer as answered...');
      
      const response = await fetchWithAuth(
        `${getDirectusApiUrl()}/items/prayers/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ answered: 1 }),
        }
      );

      console.log('Response status:', response.status);
      
      if (response.ok) {
        console.log('Prayer marked as answered successfully');
        
        if (commentText) {
          console.log('Adding answered comment with user_id:', user.id);
          const commentData = {
            prayer_id: id,
            user_id: user.id,
            comments: commentText,
            liked: 0,
            comment_id: null,
          };
          console.log('Answered comment payload:', JSON.stringify(commentData, null, 2));
          
          const commentResponse = await fetchWithAuth(
            `${getDirectusApiUrl()}/items/prayer_comments`,
            {
              method: 'POST',
              body: JSON.stringify(commentData),
            }
          );
          
          if (commentResponse.ok) {
            const commentResult = await commentResponse.json();
            console.log('✅ Answered comment added:', JSON.stringify(commentResult, null, 2));
          } else {
            const errorText = await commentResponse.text();
            console.error('❌ Failed to add answered comment:', commentResponse.status, errorText);
          }
        }
        
        await fetchPrayer();
        await fetchComments();
        setCommentModalVisible(false);
        setIsMarkingAnswered(false);
        Alert.alert('Success', 'Prayer marked as answered');
      } else {
        const errorData = await response.json();
        console.error('Failed to mark prayer as answered:', errorData);
        Alert.alert('Error', `Failed to update prayer: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error updating prayer:', error);
      Alert.alert('Error', `Failed to update prayer: ${String(error)}`);
    } finally {
      setIsSubmitting(false);
      console.log('=== handleMarkAnswered END ===');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personal: Colors.light.primary,
      family: Colors.light.secondary,
      health: Colors.light.success,
      work: Colors.light.warning,
      spiritual: Colors.light.primary,
      other: Colors.light.textLight,
    };
    return colors[category] || Colors.light.textLight;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      personal: 'Personal',
      family: 'Family',
      health: 'Health',
      work: 'Work',
      spiritual: 'Spiritual',
      other: 'Other',
    };
    return labels[category] || 'Other';
  };

  if (prayerLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading prayer...</Text>
      </View>
    );
  }

  if (!prayer) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Prayer not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userName = prayer.user_id?.first_name && prayer.user_id?.last_name
    ? `${prayer.user_id.first_name} ${prayer.user_id.last_name}`
    : 'Anonymous';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: 'Prayer Details',
          headerBackTitle: 'Back',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <BackButton />
        {comments.length > 0 && (
          <View style={styles.livePrayerBanner}>
            <View style={styles.liveHeaderContent}>
              <View style={styles.liveBadgeContainer}>
                <Animated.View style={[styles.liveIndicator, { opacity: fadeAnim }]} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <Animated.View style={{ opacity: fadeAnim, flex: 1, marginLeft: theme.spacing.md }}>
                <Text style={styles.livePrayerText} numberOfLines={1}>
                  Join Prayer{' '}
                  {(() => {
                    const currentComment = comments[currentPrayerIndex];
                    if (!currentComment) {
                      return '';
                    }
                    
                    const firstName = getFirstName(currentComment.user_id?.first_name, currentComment.user_id?.last_name, currentComment.user_id?.email);
                    return firstName;
                  })()}
                </Text>
              </Animated.View>
              <View style={styles.prayerCountLive}>
                <Users size={18} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.prayerCountLiveText}>{comments.length}</Text>
              </View>
            </View>
          </View>
        )}



        <View style={[styles.prayerCard, prayer.answered && styles.answeredCard]}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.userInfo}
              onPress={() => prayer.user_id && handleUserClick(prayer.user_id, typeof prayer.user_id === 'string' ? prayer.user_id : prayer.user_id.id)}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                <User size={20} color={Colors.light.white} />
              </View>
              <View>
                <Text style={styles.userName}>{userName}</Text>
                <View style={styles.dateContainer}>
                  <Calendar size={12} color={Colors.light.textLight} />
                  <Text style={styles.date}>{formatDate(prayer.date_created)}</Text>
                </View>
              </View>
            </TouchableOpacity>

            {prayer.answered && (
              <View style={styles.answeredBadge}>
                <CheckCircle size={16} color={Colors.light.success} />
                <Text style={styles.answeredText}>Answered</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{prayer.title}</Text>
          <Text style={styles.prayerContent}>{prayer.content}</Text>

          <View style={styles.footer}>
            <View style={styles.categoryContainer}>
              <Tag size={14} color={getCategoryColor(prayer.category)} />
              <Text style={[styles.category, { color: getCategoryColor(prayer.category) }]}>
                {getCategoryLabel(prayer.category)}
              </Text>
            </View>

            <View style={styles.prayerCountContainer}>
              <Users size={16} color={Colors.light.primary} />
              <Text style={styles.prayerCountText}>{prayer.prayerCount || 0} prayed</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            {!hasUserPrayed && (
              <TouchableOpacity
                style={styles.prayButton}
                onPress={handleMarkPrayed}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={Colors.light.white} />
                ) : (
                  <>
                    <Users size={16} color={Colors.light.white} />
                    <Text style={styles.prayButtonText}>I Prayed</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {isOrganizer && !prayer.answered && (
              <TouchableOpacity
                style={styles.markAnsweredButton}
                onPress={handleMarkAnswered}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={Colors.light.white} />
                ) : (
                  <>
                    <CheckCircle size={16} color={Colors.light.white} />
                    <Text style={styles.markAnsweredText}>Mark Answered</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <MessageCircle size={20} color={Colors.light.primary} />
            <Text style={styles.commentsTitle}>
              Comments ({comments.length})
            </Text>
          </View>

          {commentsLoading ? (
            <View style={styles.commentsLoading}>
              <ActivityIndicator size="small" color={Colors.light.primary} />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.noComments}>
              <Text style={styles.noCommentsText}>No comments yet</Text>
              <Text style={styles.noCommentsSubtext}>Be the first to comment</Text>
            </View>
          ) : (
            <View style={styles.commentsList}>
              {comments
                .filter((c: Comment) => !c.comment_id)
                .map((commentItem: Comment) => {
                  const commentUserName = commentItem.user_id?.first_name && commentItem.user_id?.last_name
                    ? `${commentItem.user_id.first_name} ${commentItem.user_id.last_name}`
                    : 'Anonymous';
                  const isOrganizerComment = commentItem.user_id?.id && organization?.organizerId === commentItem.user_id.id;
                  const replies = comments.filter((c: Comment) => c.comment_id === commentItem.id);

                  return (
                    <View key={commentItem.id} style={styles.commentCard}>
                      <TouchableOpacity 
                        style={styles.commentHeader}
                        onPress={() => handleUserClick(commentItem.user_id, commentItem.user_id?.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.commentAvatar}>
                          <User size={16} color={Colors.light.white} />
                        </View>
                        <View style={styles.commentUserInfo}>
                          <View style={styles.commentUserNameContainer}>
                            <Text style={styles.commentUserName}>{commentUserName}</Text>
                            {isOrganizerComment && (
                              <View style={styles.organizerBadge}>
                                <Text style={styles.organizerBadgeText}>Organizer</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.commentDate}>{formatDate(commentItem.date_created)}</Text>
                        </View>
                      </TouchableOpacity>
                      <Text style={styles.commentText}>{commentItem.comments}</Text>
                      
                      <View style={styles.commentActions}>
                        <TouchableOpacity
                          style={styles.commentActionButton}
                          onPress={() => handleLikeComment(commentItem.id, commentItem.liked)}
                        >
                          <Heart
                            size={16}
                            color={(commentItem.liked === 1 || commentItem.liked === true) ? Colors.light.error : Colors.light.textLight}
                            fill={(commentItem.liked === 1 || commentItem.liked === true) ? Colors.light.error : 'transparent'}
                          />
                          <Text style={[
                            styles.commentActionText,
                            (commentItem.liked === 1 || commentItem.liked === true) && styles.commentActionTextActive
                          ]}>
                            {(commentItem.liked === 1 || commentItem.liked === true) ? 'Liked' : 'Like'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.commentActionButton}
                          onPress={() => handleReply(commentItem.id, commentUserName)}
                        >
                          <Reply size={16} color={Colors.light.textLight} />
                          <Text style={styles.commentActionText}>Reply</Text>
                        </TouchableOpacity>
                      </View>

                      {replies.length > 0 && (
                        <View style={styles.repliesContainer}>
                          {replies.map((reply: Comment) => {
                            const replyUserName = reply.user_id?.first_name && reply.user_id?.last_name
                              ? `${reply.user_id.first_name} ${reply.user_id.last_name}`
                              : 'Anonymous';
                            const isReplyOrganizer = reply.user_id?.id && organization?.organizerId === reply.user_id.id;

                            return (
                              <View key={reply.id} style={styles.replyCard}>
                                <TouchableOpacity 
                                  style={styles.commentHeader}
                                  onPress={() => handleUserClick(reply.user_id, reply.user_id?.id)}
                                  activeOpacity={0.7}
                                >
                                  <View style={styles.replyAvatar}>
                                    <User size={14} color={Colors.light.white} />
                                  </View>
                                  <View style={styles.commentUserInfo}>
                                    <View style={styles.commentUserNameContainer}>
                                      <Text style={styles.replyUserName}>{replyUserName}</Text>
                                      {isReplyOrganizer && (
                                        <View style={styles.organizerBadge}>
                                          <Text style={styles.organizerBadgeText}>Organizer</Text>
                                        </View>
                                      )}
                                    </View>
                                    <Text style={styles.commentDate}>{formatDate(reply.date_created)}</Text>
                                  </View>
                                </TouchableOpacity>
                                <Text style={styles.replyText}>{reply.comments}</Text>
                                
                                <View style={styles.commentActions}>
                                  <TouchableOpacity
                                    style={styles.commentActionButton}
                                    onPress={() => handleLikeComment(reply.id, reply.liked)}
                                  >
                                    <Heart
                                      size={14}
                                      color={(reply.liked === 1 || reply.liked === true) ? Colors.light.error : Colors.light.textLight}
                                      fill={(reply.liked === 1 || reply.liked === true) ? Colors.light.error : 'transparent'}
                                    />
                                    <Text style={[
                                      styles.commentActionText,
                                      (reply.liked === 1 || reply.liked === true) && styles.commentActionTextActive
                                    ]}>
                                      {(reply.liked === 1 || reply.liked === true) ? 'Liked' : 'Like'}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.commentInputContainer}>
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <Text style={styles.replyingToText}>Replying to {replyingToName}</Text>
            <TouchableOpacity onPress={handleCancelReply}>
              <Text style={styles.cancelReplyText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
            placeholderTextColor={Colors.light.textLight}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!comment.trim() || isSubmitting) && styles.sendButtonDisabled,
            ]}
            onPress={handleAddComment}
            disabled={!comment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.light.white} />
            ) : (
              <Send size={20} color={Colors.light.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <UserProfileModal
        visible={profileModalVisible}
        onClose={() => {
          setProfileModalVisible(false);
          setSelectedUser(null);
          setIsUserOrganizer(false);
        }}
        user={selectedUser}
        isOrganizer={isUserOrganizer}
      />

      <PrayerCommentModal
        visible={commentModalVisible}
        onClose={() => {
          setCommentModalVisible(false);
          setIsMarkingAnswered(false);
        }}
        onSubmit={handleSubmitPrayer}
        isSubmitting={isSubmitting}
        prayerTitle={prayer?.title || 'Prayer Request'}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 8,
    marginLeft: -4,
  },
  headerBackText: {
    fontSize: 17,
    color: Colors.light.primary,
    fontWeight: '600',
    marginLeft: 2,
  },
  livePrayerBanner: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  liveHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 1)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    gap: 4,
    ...theme.shadows.small,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.6,
  },
  livePrayerText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.white,
  },
  prayerCountLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    minWidth: 42,
    justifyContent: 'center',
  },
  prayerCountLiveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  backButtonContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  backButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignSelf: 'flex-start',
    gap: 4,
    ...theme.shadows.medium,
  },
  backButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.textMedium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  errorBackButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
  prayerCard: {
    backgroundColor: Colors.light.card,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  answeredCard: {
    backgroundColor: Colors.light.success + '10',
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.success,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  answeredText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.success,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
    lineHeight: 28,
  },
  prayerContent: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
  },
  markAnsweredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.success,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    flex: 1,
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  markAnsweredText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.white,
  },
  commentsSection: {
    backgroundColor: Colors.light.card,
    margin: theme.spacing.lg,
    marginTop: 0,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  commentsLoading: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  noComments: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textMedium,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: Colors.light.textLight,
    marginTop: 4,
  },
  commentsList: {
    gap: theme.spacing.md,
  },
  commentCard: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...theme.shadows.small,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentUserInfo: {
    flex: 1,
  },
  commentUserNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  organizerBadge: {
    backgroundColor: Colors.light.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  organizerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  commentDate: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginTop: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.xs,
  },
  bottomSpacing: {
    height: 20,
  },
  prayerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prayerCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  prayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    flex: 1,
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  prayButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.white,
  },
  commentActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: Colors.light.textLight,
    fontWeight: '500',
  },
  commentActionTextActive: {
    color: Colors.light.error,
  },
  repliesContainer: {
    marginTop: theme.spacing.md,
    marginLeft: theme.spacing.lg,
    paddingLeft: theme.spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: Colors.light.borderLight,
    gap: theme.spacing.sm,
  },
  replyCard: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  replyText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.light.textMedium,
  },
  commentInputContainer: {
    padding: theme.spacing.md,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: Colors.light.primary + '10',
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  replyingToText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  cancelReplyText: {
    fontSize: 13,
    color: Colors.light.error,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: Colors.light.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.textLight,
    opacity: 0.5,
  },
});
