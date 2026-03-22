import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Video, Calendar, Clock, Users, Link, MessageCircle, Save, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '@/components/Button';
import { useMeetingStore } from '@/store/meetingStore';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { Meeting, MeetingPlatform, RecurringType } from '@/types';

interface PlatformOption {
  id: MeetingPlatform | 'custom';
  name: string;
  icon: string;
}

const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: 'zoom', name: 'Zoom', icon: 'video' },
  { id: 'google_meet', name: 'Google Meet', icon: 'video' },
  { id: 'ms_teams', name: 'Microsoft Teams', icon: 'video' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'message-circle' },
  { id: 'in_person', name: 'In Person', icon: 'users' },
  { id: 'custom', name: 'Custom', icon: 'link' },
];

export default function EditMeetingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { meetings, getMeeting, updateMeeting, isUpdating } = useMeetingStore();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<MeetingPlatform | 'custom'>('zoom');
  const [customPlatform, setCustomPlatform] = useState('');
  const [link, setLink] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<RecurringType>('weekly');
  const [isPublic, setIsPublic] = useState(true);
  const [invitees, setInvitees] = useState('');

  useEffect(() => {
    if (id) {
      const meetingData = getMeeting(id);
      if (meetingData) {
        setMeeting(meetingData);
        setTitle(meetingData.title);
        setDescription(meetingData.description || '');
        
        // Handle platform
        const platform = meetingData.platform || 'zoom';
        const isPredefinedPlatform = PLATFORM_OPTIONS.some(option => 
          option.id === platform.toLowerCase()
        );
        
        if (isPredefinedPlatform) {
          setPlatform(platform.toLowerCase() as MeetingPlatform);
        } else {
          setPlatform('custom');
          setCustomPlatform(platform);
        }
        
        setLink(meetingData.link || '');
        const location = typeof meetingData.location === 'string' ? meetingData.location : meetingData.location?.address || '';
        setLocation(location);
        setStartDate(new Date(meetingData.startTime));
        setEndDate(new Date(meetingData.endTime));
        setIsRecurring(meetingData.isRecurring || false);
        const recType = meetingData.recurringType;
        if (recType === 'daily' || recType === 'weekly' || recType === 'monthly') {
          setRecurringType(recType);
        } else {
          setRecurringType('weekly');
        }
        setIsPublic(meetingData.isPublic !== undefined ? meetingData.isPublic : true);
        setInvitees(meetingData.invitees ? meetingData.invitees.join(', ') : '');
      }
    }
  }, [id, meetings]);

  if (!meeting) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Meeting not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    );
  }

  const handlePlatformSelect = (selectedPlatform: MeetingPlatform | 'custom') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPlatform(selectedPlatform);
    
    // Clear link if switching from custom
    if (platform === 'custom' && selectedPlatform !== 'custom') {
      setCustomPlatform('');
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
    
    // Ensure end date is after start date
    if (currentDate > endDate) {
      const newEndDate = new Date(currentDate);
      newEndDate.setHours(currentDate.getHours() + 1);
      setEndDate(newEndDate);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || startDate;
    setShowStartTimePicker(false);
    setStartDate(currentTime);
    
    // Ensure end time is after start time
    if (currentTime > endDate) {
      const newEndDate = new Date(currentTime);
      newEndDate.setHours(currentTime.getHours() + 1);
      setEndDate(newEndDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || endDate;
    setShowEndTimePicker(false);
    setEndDate(currentTime);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a meeting title');
      return false;
    }
    
    if (platform === 'custom' && !customPlatform.trim()) {
      Alert.alert('Error', 'Please enter a platform name');
      return false;
    }
    
    if ((platform === 'zoom' || platform === 'google_meet' || 
         platform === 'ms_teams' || platform === 'custom') && !link.trim()) {
      Alert.alert('Error', 'Please enter a meeting link');
      return false;
    }
    
    if (platform === 'in_person' && !location.trim()) {
      Alert.alert('Error', 'Please enter a meeting location');
      return false;
    }
    
    if (startDate >= endDate) {
      Alert.alert('Error', 'End time must be after start time');
      return false;
    }
    
    return true;
  };

  const handleUpdateMeeting = async () => {
    if (!validateForm()) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    const updatedMeetingData: Meeting = {
      ...meeting,
      title,
      description,
      platform: (platform === 'custom' ? customPlatform : platform) as any,
      link: platform === 'in_person' ? '' : link,
      location: platform === 'in_person' ? location as any : '',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      isRecurring,
      recurringType: isRecurring ? recurringType : undefined,
      isPublic,
      invitees: invitees.split(',').map(email => email.trim()).filter(email => email),
      updatedAt: new Date().toISOString(),
    };
    
    const success = await updateMeeting(id, updatedMeetingData);
    if (success) {
      router.back();
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.formGroup}>
        <Text style={styles.label}>Meeting Title*</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter meeting title"
          placeholderTextColor={Colors.light.textLight}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter meeting description"
          placeholderTextColor={Colors.light.textLight}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Platform*</Text>
        <View style={styles.platformOptions}>
          {PLATFORM_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.platformOption,
                platform === option.id && styles.platformOptionSelected
              ]}
              onPress={() => handlePlatformSelect(option.id)}
            >
              {option.icon === 'video' && (
                <Video 
                  size={20} 
                  color={platform === option.id ? Colors.light.white : Colors.light.text} 
                />
              )}
              {option.icon === 'message-circle' && (
                <MessageCircle 
                  size={20} 
                  color={platform === option.id ? Colors.light.white : Colors.light.text} 
                />
              )}
              {option.icon === 'users' && (
                <Users 
                  size={20} 
                  color={platform === option.id ? Colors.light.white : Colors.light.text} 
                />
              )}
              {option.icon === 'link' && (
                <Link 
                  size={20} 
                  color={platform === option.id ? Colors.light.white : Colors.light.text} 
                />
              )}
              <Text 
                style={[
                  styles.platformOptionText,
                  platform === option.id && styles.platformOptionTextSelected
                ]}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {platform === 'custom' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Custom Platform Name*</Text>
          <TextInput
            style={styles.input}
            value={customPlatform}
            onChangeText={setCustomPlatform}
            placeholder="Enter platform name"
            placeholderTextColor={Colors.light.textLight}
          />
        </View>
      )}
      
      {(platform === 'zoom' || platform === 'google_meet' || 
        platform === 'ms_teams' || platform === 'whatsapp' || 
        platform === 'custom') && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Meeting Link*</Text>
          <TextInput
            style={styles.input}
            value={link}
            onChangeText={setLink}
            placeholder={`Enter ${platform === 'custom' ? customPlatform || 'meeting' : platform} link`}
            placeholderTextColor={Colors.light.textLight}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
      )}
      
      {platform === 'in_person' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location*</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter meeting location"
            placeholderTextColor={Colors.light.textLight}
          />
        </View>
      )}
      
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeColumn}>
          <Text style={styles.label}>Start Date & Time*</Text>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Calendar size={18} color={Colors.light.primary} />
            <Text style={styles.dateTimeText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Clock size={18} color={Colors.light.primary} />
            <Text style={styles.dateTimeText}>{formatTime(startDate)}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dateTimeColumn}>
          <Text style={styles.label}>End Date & Time*</Text>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Calendar size={18} color={Colors.light.primary} />
            <Text style={styles.dateTimeText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Clock size={18} color={Colors.light.primary} />
            <Text style={styles.dateTimeText}>{formatTime(endDate)}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {(showStartDatePicker || showStartTimePicker || showEndDatePicker || showEndTimePicker) && (
        <DateTimePicker
          value={showStartDatePicker || showStartTimePicker ? startDate : endDate}
          mode={showStartDatePicker || showEndDatePicker ? 'date' : 'time'}
          is24Hour={false}
          display="default"
          onChange={
            showStartDatePicker 
              ? handleStartDateChange 
              : showStartTimePicker 
                ? handleStartTimeChange 
                : showEndDatePicker 
                  ? handleEndDateChange 
                  : handleEndTimeChange
          }
        />
      )}
      
      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Recurring Meeting</Text>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary + '80' }}
            thumbColor={isRecurring ? Colors.light.primary : Colors.light.textLight}
          />
        </View>
        
        {isRecurring && (
          <View style={styles.recurringOptions}>
            <TouchableOpacity
              style={[
                styles.recurringOption,
                recurringType === 'daily' && styles.recurringOptionSelected
              ]}
              onPress={() => setRecurringType('daily')}
            >
              <Text 
                style={[
                  styles.recurringOptionText,
                  recurringType === 'daily' && styles.recurringOptionTextSelected
                ]}
              >
                Daily
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.recurringOption,
                recurringType === 'weekly' && styles.recurringOptionSelected
              ]}
              onPress={() => setRecurringType('weekly')}
            >
              <Text 
                style={[
                  styles.recurringOptionText,
                  recurringType === 'weekly' && styles.recurringOptionTextSelected
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.recurringOption,
                recurringType === 'monthly' && styles.recurringOptionSelected
              ]}
              onPress={() => setRecurringType('monthly')}
            >
              <Text 
                style={[
                  styles.recurringOptionText,
                  recurringType === 'monthly' && styles.recurringOptionTextSelected
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Public Meeting</Text>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary + '80' }}
            thumbColor={isPublic ? Colors.light.primary : Colors.light.textLight}
          />
        </View>
        <Text style={styles.helperText}>
          {isPublic 
            ? "Anyone in the community can see and join this meeting" 
            : "Only invited participants can see and join this meeting"}
        </Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Invite Participants (Optional)</Text>
        <TextInput
          style={styles.input}
          value={invitees}
          onChangeText={setInvitees}
          placeholder="Enter email addresses, separated by commas"
          placeholderTextColor={Colors.light.textLight}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.helperText}>
          Participants will receive an email invitation with meeting details
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="outline"
          icon={<X size={18} color={Colors.light.primary} />}
          style={styles.cancelButton}
        />
        <Button
          title="Update Meeting"
          onPress={handleUpdateMeeting}
          loading={isUpdating}
          icon={<Save size={18} color={Colors.light.white} />}
          style={styles.updateButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.body,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    marginTop: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    minHeight: 100,
  },
  platformOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  platformOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minWidth: '30%',
  },
  platformOptionSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  platformOptionText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.xs,
  },
  platformOptionTextSelected: {
    color: Colors.light.white,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  dateTimeColumn: {
    width: '48%',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateTimeText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recurringOptions: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  recurringOption: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flex: 1,
    alignItems: 'center',
  },
  recurringOptionSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  recurringOptionText: {
    ...theme.typography.body,
  },
  recurringOptionTextSelected: {
    color: Colors.light.white,
  },
  helperText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginTop: theme.spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  updateButton: {
    flex: 2,
  },
});