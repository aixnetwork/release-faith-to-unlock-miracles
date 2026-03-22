import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { 
  Target, 
  Heart, 
  Book, 
  Dumbbell, 
  Moon, 
  Sun,
  Coffee,
  Music,
  Camera,
  Star,
  Zap,
  Leaf,
  Check,
  X
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import { useHabitStore } from '@/store/habitStore';
import { Habit } from '@/types';
import BottomNavigation from '@/components/BottomNavigation';
import { ENV } from '@/config/env';
import { useUserStore } from '@/store/userStore';

const { width } = Dimensions.get('window');

const HABIT_CATEGORIES = [
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'physical', label: 'Physical' },
  { id: 'mental', label: 'Mental' },
  { id: 'personal', label: 'Personal' },
  { id: 'social', label: 'Social' },
  { id: 'other', label: 'Other' },
];

const HABIT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const HABIT_ICONS = [
  { name: 'target', component: Target },
  { name: 'heart', component: Heart },
  { name: 'book', component: Book },
  { name: 'dumbbell', component: Dumbbell },
  { name: 'moon', component: Moon },
  { name: 'sun', component: Sun },
  { name: 'coffee', component: Coffee },
  { name: 'music', component: Music },
  { name: 'camera', component: Camera },
  { name: 'star', component: Star },
  { name: 'zap', component: Zap },
  { name: 'leaf', component: Leaf },
];

const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Daily', description: 'Every day' },
  { id: 'weekdays', label: 'Weekdays', description: 'Monday to Friday' },
  { id: 'weekends', label: 'Weekends', description: 'Saturday and Sunday' },
  { id: 'custom', label: 'Custom', description: 'Select specific days' },
];

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Mon', full: 'Monday' },
  { id: 'tuesday', label: 'Tue', full: 'Tuesday' },
  { id: 'wednesday', label: 'Wed', full: 'Wednesday' },
  { id: 'thursday', label: 'Thu', full: 'Thursday' },
  { id: 'friday', label: 'Fri', full: 'Friday' },
  { id: 'saturday', label: 'Sat', full: 'Saturday' },
  { id: 'sunday', label: 'Sun', full: 'Sunday' },
];

interface ColorSelectorProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ selectedColor, onColorSelect }) => {
  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Choose Color</Text>
      <View style={styles.colorGrid}>
        {HABIT_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColorOption
            ]}
            onPress={() => onColorSelect(color)}
          >
            {selectedColor === color && (
              <Check size={16} color="white" strokeWidth={3} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

interface IconSelectorProps {
  selectedIcon: string;
  selectedColor: string;
  onIconSelect: (icon: string) => void;
}

const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, selectedColor, onIconSelect }) => {
  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Choose Icon</Text>
      <View style={styles.iconGrid}>
        {HABIT_ICONS.map((icon) => {
          const IconComponent = icon.component;
          return (
            <TouchableOpacity
              key={icon.name}
              style={[
                styles.iconOption,
                { backgroundColor: selectedColor + '20' },
                selectedIcon === icon.name && styles.selectedIconOption
              ]}
              onPress={() => onIconSelect(icon.name)}
            >
              <IconComponent 
                size={24} 
                color={selectedIcon === icon.name ? selectedColor : Colors.light.textMedium} 
              />
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  );
};

interface FrequencySelectorProps {
  selectedFrequency: string;
  selectedDays: string[];
  onFrequencySelect: (frequency: string) => void;
  onDayToggle: (day: string) => void;
}

const FrequencySelector: React.FC<FrequencySelectorProps> = ({ 
  selectedFrequency, 
  selectedDays, 
  onFrequencySelect, 
  onDayToggle 
}) => {
  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Frequency</Text>
      <View style={styles.frequencyOptions}>
        {FREQUENCY_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.frequencyOption,
              selectedFrequency === option.id && styles.selectedFrequencyOption
            ]}
            onPress={() => onFrequencySelect(option.id)}
          >
            <View style={styles.frequencyContent}>
              <Text style={[
                styles.frequencyLabel,
                selectedFrequency === option.id && styles.selectedFrequencyLabel
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.frequencyDescription,
                selectedFrequency === option.id && styles.selectedFrequencyDescription
              ]}>
                {option.description}
              </Text>
            </View>
            {selectedFrequency === option.id && (
              <Check size={20} color={Colors.light.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {selectedFrequency === 'custom' && (
        <View style={styles.customDaysContainer}>
          <Text style={styles.customDaysTitle}>Select Days</Text>
          <View style={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayOption,
                  selectedDays.includes(day.id) && styles.selectedDayOption
                ]}
                onPress={() => onDayToggle(day.id)}
              >
                <Text style={[
                  styles.dayLabel,
                  selectedDays.includes(day.id) && styles.selectedDayLabel
                ]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, fetchHabits } = useHabitStore();
  const { user } = useUserStore();
  
  const [habit, setHabit] = useState<Habit | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('spiritual');
  const [selectedColor, setSelectedColor] = useState<string>(HABIT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<string>(HABIT_ICONS[0].name);
  const [selectedFrequency, setSelectedFrequency] = useState<string>('daily');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      const foundHabit = habits.find(h => h.id === id);
      if (foundHabit) {
        setHabit(foundHabit);
        setName(foundHabit.name);
        setDescription(foundHabit.description || '');
        setSelectedCategory(foundHabit.category);
        setSelectedColor(foundHabit.color);
        setSelectedIcon(foundHabit.icon);
        
        if (foundHabit.frequency === 'daily') {
          setSelectedFrequency('daily');
        } else if (foundHabit.frequency === 'weekly') {
          const days = foundHabit.scheduleDays || [];
          if (days.length === 5 && !days.includes('saturday') && !days.includes('sunday')) {
            setSelectedFrequency('weekdays');
          } else if (days.length === 2 && days.includes('saturday') && days.includes('sunday')) {
            setSelectedFrequency('weekends');
          } else {
            setSelectedFrequency('custom');
            setSelectedDays(days);
          }
        } else {
          setSelectedFrequency('custom');
          setSelectedDays(foundHabit.scheduleDays || []);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Habit not found',
        });
        router.back();
      }
      setIsLoading(false);
    }
  }, [id, habits]);

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleUpdateHabit = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a habit name',
      });
      return;
    }

    if (selectedFrequency === 'custom' && selectedDays.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select at least one day for custom frequency',
      });
      return;
    }

    if (!user?.accessToken || !user?.id || !habit) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'You must be logged in to update a habit',
      });
      return;
    }

    setIsSaving(true);

    try {
      const customDaysJson = selectedFrequency === 'custom' ? selectedDays : null;

      const habitPayload = {
        title: name.trim(),
        description: description.trim(),
        category: selectedCategory,
        target_frequency: selectedFrequency,
        color: selectedColor,
        icon: selectedIcon,
        custom_days: customDaysJson
      };

      const url = `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/habits/${habit.id}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update habit:', errorText);
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: 'Failed to update habit. Please try again.',
        });
        return;
      }

      await fetchHabits();
      
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Your habit has been updated successfully.',
      });
      
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error('Error updating habit:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'An error occurred while updating the habit.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !habit) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Edit Habit',
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.text,
          }}
        />
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      </>
    );
  }

  const isFormValid = name.trim().length > 0 && 
    (selectedFrequency !== 'custom' || selectedDays.length > 0);

  return (
    <>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Edit Habit',
            headerStyle: { backgroundColor: Colors.light.background },
            headerTintColor: Colors.light.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            ),
          }}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Habit Name *</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Read for 30 minutes"
                placeholderTextColor={Colors.light.textMedium}
                maxLength={50}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add a description to help you stay motivated..."
                placeholderTextColor={Colors.light.textMedium}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category *</Text>
              <View style={styles.categoryGrid}>
                {HABIT_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category.id && styles.selectedCategoryOption
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={[
                      styles.categoryLabel,
                      selectedCategory === category.id && styles.selectedCategoryLabel
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ColorSelector 
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />

            <IconSelector 
              selectedIcon={selectedIcon}
              selectedColor={selectedColor}
              onIconSelect={setSelectedIcon}
            />

            <FrequencySelector 
              selectedFrequency={selectedFrequency}
              selectedDays={selectedDays}
              onFrequencySelect={setSelectedFrequency}
              onDayToggle={handleDayToggle}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !isFormValid && styles.saveButtonDisabled
            ]}
            onPress={handleUpdateHabit}
            disabled={!isFormValid || isSaving}
          >
            <Text style={[
              styles.saveButtonText,
              !isFormValid && styles.saveButtonTextDisabled
            ]}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomNavigation />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerButton: {
    padding: 8,
    marginLeft: -8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textMedium,
    marginTop: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 160,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectorContainer: {
    marginBottom: theme.spacing.xl,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: theme.spacing.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: (width - theme.spacing.lg * 2 - 40) / 5,
    height: 50,
    borderRadius: 25,
    marginBottom: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: Colors.light.text,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconOption: {
    width: (width - theme.spacing.lg * 2 - 50) / 6,
    height: 50,
    borderRadius: 25,
    marginBottom: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIconOption: {
    borderColor: Colors.light.primary,
  },
  frequencyOptions: {
    marginBottom: theme.spacing.md,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
  },
  selectedFrequencyOption: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  frequencyContent: {
    flex: 1,
  },
  frequencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  selectedFrequencyLabel: {
    color: Colors.light.primary,
  },
  frequencyDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  selectedFrequencyDescription: {
    color: Colors.light.primary,
  },
  customDaysContainer: {
    marginTop: theme.spacing.md,
  },
  customDaysTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: theme.spacing.sm,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayOption: {
    width: (width - theme.spacing.lg * 2 - 60) / 7,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: theme.spacing.sm,
  },
  selectedDayOption: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMedium,
  },
  selectedDayLabel: {
    color: 'white',
  },
  footer: {
    position: 'absolute',
    bottom: 85,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.light.borderLight,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  saveButtonTextDisabled: {
    color: Colors.light.textMedium,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
  },
  selectedCategoryOption: {
    backgroundColor: Colors.light.primary + '10',
    borderColor: Colors.light.primary,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textMedium,
  },
  selectedCategoryLabel: {
    color: Colors.light.primary,
  },
});
