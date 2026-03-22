import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Alert, Platform, Modal } from 'react-native';
import { router } from 'expo-router';
import { Video, Calendar, Clock, Users, Link, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '@/components/Button';
import { useMeetingStore } from '@/store/meetingStore';
import { useUserStore } from '@/store/userStore';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { MeetingPlatform, RecurringType } from '@/types';

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

// Calendar Component
const CalendarModal = ({ 
  visible, 
  onClose, 
  selectedDate, 
  onDateSelect 
}: {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };
  
  const handleDatePress = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(currentMonth.getFullYear());
    newDate.setMonth(currentMonth.getMonth());
    newDate.setDate(day);
    onDateSelect(newDate);
    onClose();
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = isSameDay(date, selectedDate);
      const isCurrentDay = isToday(date);
      const isPast = date < new Date() && !isCurrentDay;
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isSelected && styles.selectedDay,
            isCurrentDay && styles.todayDay,
            isPast && styles.pastDay
          ]}
          onPress={() => !isPast && handleDatePress(day)}
          disabled={isPast}
        >
          <Text style={[
            styles.calendarDayText,
            isSelected && styles.selectedDayText,
            isCurrentDay && styles.todayDayText,
            isPast && styles.pastDayText
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.calendarModal}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <ChevronLeft size={24} color={Colors.light.primary} />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <ChevronRight size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarWeekdays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {renderCalendar()}
          </View>
          
          <View style={styles.calendarActions}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              size="small"
              style={styles.calendarButton}
            />
            <Button
              title="Today"
              onPress={() => {
                onDateSelect(new Date());
                onClose();
              }}
              size="small"
              style={styles.calendarButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Time Picker Component
const TimePickerModal = ({
  visible,
  onClose,
  selectedTime,
  onTimeSelect
}: {
  visible: boolean;
  onClose: () => void;
  selectedTime: Date;
  onTimeSelect: (time: Date) => void;
}) => {
  const [hours, setHours] = useState(selectedTime.getHours());
  const [minutes, setMinutes] = useState(selectedTime.getMinutes());
  const [isAM, setIsAM] = useState(selectedTime.getHours() < 12);
  
  const handleConfirm = () => {
    const newTime = new Date(selectedTime);
    let adjustedHours = hours;
    if (!isAM && hours !== 12) adjustedHours += 12;
    if (isAM && hours === 12) adjustedHours = 0;
    
    newTime.setHours(adjustedHours, minutes);
    onTimeSelect(newTime);
    onClose();
  };
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.timeModal}>
          <Text style={styles.timeModalTitle}>Select Time</Text>
          
          <View style={styles.timePickerContainer}>
            <View style={styles.timePicker}>
              <Text style={styles.timeLabel}>Hour</Text>
              <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                  <TouchableOpacity
                    key={hour}
                    style={[styles.timeOption, hours === hour && styles.selectedTimeOption]}
                    onPress={() => setHours(hour)}
                  >
                    <Text style={[styles.timeOptionText, hours === hour && styles.selectedTimeOptionText]}>
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.timePicker}>
              <Text style={styles.timeLabel}>Minute</Text>
              <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                {Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
                  <TouchableOpacity
                    key={minute}
                    style={[styles.timeOption, minutes === minute && styles.selectedTimeOption]}
                    onPress={() => setMinutes(minute)}
                  >
                    <Text style={[styles.timeOptionText, minutes === minute && styles.selectedTimeOptionText]}>
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.timePicker}>
              <Text style={styles.timeLabel}>Period</Text>
              <View style={styles.periodContainer}>
                <TouchableOpacity
                  style={[styles.periodOption, isAM && styles.selectedPeriodOption]}
                  onPress={() => setIsAM(true)}
                >
                  <Text style={[styles.periodText, isAM && styles.selectedPeriodText]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.periodOption, !isAM && styles.selectedPeriodOption]}
                  onPress={() => setIsAM(false)}
                >
                  <Text style={[styles.periodText, !isAM && styles.selectedPeriodText]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.timeActions}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              size="small"
              style={styles.timeButton}
            />
            <Button
              title="Confirm"
              onPress={handleConfirm}
              size="small"
              style={styles.timeButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function CreateMeetingScreen() {
  const { createMeeting, isCreating } = useMeetingStore();
  const { name: hostName } = useUserStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<MeetingPlatform | 'custom'>('zoom');
  const [customPlatform, setCustomPlatform] = useState('');
  const [link, setLink] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setHours(new Date().getHours() + 1)));
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timePickerType, setTimePickerType] = useState<'start' | 'end'>('start');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<RecurringType>('weekly');
  const [isPublic, setIsPublic] = useState(true);
  const [invitees, setInvitees] = useState('');

  const handlePlatformSelect = (selectedPlatform: MeetingPlatform | 'custom') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPlatform(selectedPlatform);
    
    if (platform === 'custom' && selectedPlatform !== 'custom') {
      setCustomPlatform('');
    }
  };

  const handleDateSelect = (date: Date) => {
    setStartDate(date);
    
    // Ensure end date is after start date
    if (date > endDate) {
      const newEndDate = new Date(date);
      newEndDate.setHours(date.getHours() + 1);
      setEndDate(newEndDate);
    }
  };

  const handleTimeSelect = (time: Date) => {
    if (timePickerType === 'start') {
      setStartDate(time);
      
      // Ensure end time is after start time
      if (time > endDate) {
        const newEndDate = new Date(time);
        newEndDate.setHours(time.getHours() + 1);
        setEndDate(newEndDate);
      }
    } else {
      setEndDate(time);
    }
  };

  const openTimePicker = (type: 'start' | 'end') => {
    setTimePickerType(type);
    setShowTimeModal(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'short',
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

  const handleCreateMeeting = async () => {
    if (!validateForm()) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    const meetingData = {
      title,
      description,
      platform: platform === 'custom' ? customPlatform : platform,
      link: platform === 'in_person' ? '' : link,
      location: platform === 'in_person' ? location : '',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      isRecurring,
      recurringType: isRecurring ? recurringType : null,
      isPublic,
      host: hostName || 'Anonymous',
      invitees: invitees.split(',').map(email => email.trim()).filter(email => email),
      createdAt: new Date().toISOString(),
    };
    
    const success = await createMeeting(meetingData);
    if (success) {
      try {
        router.push('/(tabs)/meetings');
      } catch (error) {
        console.error('Navigation error after creating meeting:', error);
        // Fallback navigation
        try {
          router.replace('/(tabs)/meetings');
        } catch (fallbackError) {
          console.error('Fallback navigation error:', fallbackError);
          // Last resort - go to home
          router.replace('/');
        }
      }
    }
  };

  const handleCancel = () => {
    try {
      // Try to go back first
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        // If can't go back, navigate to meetings
        router.replace('/(tabs)/meetings');
      }
    } catch (error) {
      console.error('Navigation error on cancel:', error);
      // Fallback navigation
      try {
        router.replace('/(tabs)/meetings');
      } catch (fallbackError) {
        console.error('Fallback navigation error:', fallbackError);
        // Last resort - go to home
        router.replace('/');
      }
    }
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
            onPress={() => setShowCalendarModal(true)}
          >
            <Calendar size={18} color={Colors.light.primary} />
            <Text style={styles.dateTimeText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => openTimePicker('start')}
          >
            <Clock size={18} color={Colors.light.primary} />
            <Text style={styles.dateTimeText}>{formatTime(startDate)}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dateTimeColumn}>
          <Text style={styles.label}>End Date & Time*</Text>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowCalendarModal(true)}
          >
            <Calendar size={18} color={Colors.light.primary} />
            <Text style={styles.dateTimeText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => openTimePicker('end')}
          >
            <Clock size={18} color={Colors.light.primary} />
            <Text style={styles.dateTimeText}>{formatTime(endDate)}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
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
          title="Create Meeting"
          onPress={handleCreateMeeting}
          loading={isCreating}
          icon={<Video size={18} color={Colors.light.white} />}
          style={styles.createButton}
        />
      </View>

      {/* Calendar Modal */}
      <CalendarModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        selectedDate={startDate}
        onDateSelect={handleDateSelect}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        selectedTime={timePickerType === 'start' ? startDate : endDate}
        onTimeSelect={handleTimeSelect}
      />
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
    ...theme.shadows.small,
  },
  dateTimeText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.sm,
    fontWeight: '600',
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
  createButton: {
    flex: 2,
  },
  // Calendar Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...theme.shadows.large,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  calendarTitle: {
    ...theme.typography.subtitle,
    fontSize: 18,
    fontWeight: '700',
  },
  calendarWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.sm,
  },
  weekdayText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.textLight,
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    marginVertical: 2,
  },
  selectedDay: {
    backgroundColor: Colors.light.primary,
  },
  todayDay: {
    backgroundColor: Colors.light.secondary + '30',
    borderWidth: 1,
    borderColor: Colors.light.secondary,
  },
  pastDay: {
    opacity: 0.3,
  },
  calendarDayText: {
    ...theme.typography.body,
    fontSize: 14,
  },
  selectedDayText: {
    color: Colors.light.white,
    fontWeight: '700',
  },
  todayDayText: {
    color: Colors.light.secondary,
    fontWeight: '700',
  },
  pastDayText: {
    color: Colors.light.textLight,
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  // Time Modal Styles
  timeModal: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    width: '90%',
    maxWidth: 350,
    ...theme.shadows.large,
  },
  timeModalTitle: {
    ...theme.typography.subtitle,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  timePicker: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    ...theme.typography.caption,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: Colors.light.textLight,
  },
  timeScroll: {
    height: 120,
    width: 60,
  },
  timeOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginVertical: 2,
  },
  selectedTimeOption: {
    backgroundColor: Colors.light.primary,
  },
  timeOptionText: {
    ...theme.typography.body,
    fontSize: 16,
  },
  selectedTimeOptionText: {
    color: Colors.light.white,
    fontWeight: '700',
  },
  periodContainer: {
    marginTop: theme.spacing.sm,
  },
  periodOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginVertical: 2,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedPeriodOption: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  periodText: {
    ...theme.typography.body,
    fontSize: 14,
  },
  selectedPeriodText: {
    color: Colors.light.white,
    fontWeight: '700',
  },
  timeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});