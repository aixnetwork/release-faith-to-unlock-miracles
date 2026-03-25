// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  plan: 'free' | 'premium' | 'pro' | 'lifetime' | 'org_small' | 'org_medium' | 'org_large';
  isVerified: boolean;
  role?: string;
  roleId?: string;
  organizationId?: string;
  accessToken?: string;
}

// Prayer Types
export interface Prayer {
  id: string;
  title: string;
  content: string;
  category: 'personal' | 'family' | 'health' | 'work' | 'world' | 'gratitude' | 'guidance';
  isPrivate: boolean;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  prayerCount: number;
  isAnswered: boolean;
  answeredAt?: string;
  answeredNote?: string;
}

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  isUrgent: boolean;
  isAnonymous: boolean;
  userId: string;
  userName?: string;
  createdAt: string;
  prayerCount: number;
  comments: PrayerComment[];
}

export interface PrayerComment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

export interface CommunityPrayer {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  prayerCount: number;
  hasPrayed: boolean;
  isAnonymous: boolean;
  category?: string;
}

export interface MentalHealthContent {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'breathing' | 'affirmation' | 'prayer' | 'scripture';
  duration: number;
  audioUrl?: string;
  scriptureReferences?: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Testimonial Types
export interface Testimonial {
  id: string;
  title: string;
  content: string;
  category: 'healing' | 'provision' | 'guidance' | 'salvation' | 'breakthrough' | 'protection' | 'peace';
  type: 'text' | 'video';
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked: boolean;
  tags: string[];
  isVerified: boolean;
  location?: string;
  images?: string[];
  youtubeUrl?: string;
  author: string;
  date: string;
  suggestedScripture?: string;
  suggestedSong?: string;
}

// Song Types
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre: 'worship' | 'contemporary' | 'hymn' | 'gospel' | 'praise' | 'spiritual';
  category?: string;
  duration: number; // in seconds
  lyrics?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  imageUrl?: string;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  playCount: number;
  likes: number;
  isLiked: boolean;
  key?: string; // Musical key
  tempo?: number; // BPM
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  organizationId?: number;
  status?: string;
  date_created?: string;
  date_updated?: string;
  user_created?: string;
  user_updated?: string;
}

// Quote Types
export interface Quote {
  id: string;
  text: string;
  author: string;
  category: 'faith' | 'hope' | 'love' | 'peace' | 'strength' | 'wisdom' | 'encouragement';
  source?: string; // Book, speech, etc.
  imageUrl: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked: boolean;
  isFavorite: boolean;
  shareCount: number;
}

// Promise Types
export interface Promise {
  id: string;
  title?: string;
  verse: string;
  reference: string; // Bible reference
  category?: 'healing' | 'provision' | 'protection' | 'guidance' | 'peace' | 'strength' | 'love' | string;
  description?: string;
  tags?: string[];
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
  claims?: number; // How many people claimed this promise
  isClaimed?: boolean;
  testimonies?: PromiseTestimony[];
  mentalHealthFocus?: boolean;
  language?: string;
}

export interface PromiseTestimony {
  id: string;
  promiseId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  isVerified: boolean;
}

// Meeting Types
export interface Meeting {
  id: string;
  title: string;
  description: string;
  type: 'prayer' | 'bible-study' | 'worship' | 'fellowship' | 'service' | 'youth' | 'women' | 'men';
  startTime: string;
  endTime: string;
  timezone: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  location?: {
    type: 'physical' | 'virtual' | 'hybrid';
    address?: string;
    virtualLink?: string;
    platform?: 'zoom' | 'teams' | 'meet' | 'other';
  };
  organizerId: string;
  organizerName: string;
  maxParticipants?: number;
  currentParticipants: number;
  participants: MeetingParticipant[];
  isPublic: boolean;
  requiresApproval: boolean;
  tags: string[];
  resources: MeetingResource[];
  createdAt: string;
  updatedAt: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  
  host?: string;
  platform?: 'zoom' | 'google_meet' | 'ms_teams' | 'whatsapp' | 'in_person';
  link?: string;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  meetingLink?: string;
  invitees?: string[];
  isOnline?: boolean;
  hostName?: string;
  attendees?: any[];
}

export interface MeetingParticipant {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'organizer' | 'co-host' | 'participant';
  joinedAt: string;
  status: 'confirmed' | 'pending' | 'declined';
}

export interface MeetingResource {
  id: string;
  name: string;
  type: 'document' | 'video' | 'audio' | 'link' | 'image';
  url: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  description?: string;
  type: 'church' | 'ministry' | 'nonprofit' | 'community';
  memberCount: number;
  groupCount: number;
  plan: 'basic' | 'premium' | 'enterprise';
  settings: OrganizationSettings;
  createdAt: string;
  updatedAt: string;
  contactEmail: string;
  website?: string;
  address?: string;
  phone?: string;
  logo?: string;
  coverImage?: string;
  stats: OrganizationStats;
}

export interface OrganizationSettings {
  publicProfile: boolean;
  allowMemberJoin: boolean;
  requireApproval: boolean;
  emailNotifications: boolean;
  customDomain?: string;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
  };
}

export interface OrganizationStats {
  totalMembers: number;
  activePrayerPlans: number;
  totalMeetings: number;
  monthlyGrowth?: number;
}

// Content Category Types
export interface ContentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  itemCount: number;
  isPopular: boolean;
  tags: string[];
}

// Bible Game Types
export interface BibleGame {
  id: string;
  name: string;
  description: string;
  type: 'quiz' | 'memory' | 'trivia' | 'word-search' | 'crossword' | 'matching';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'old-testament' | 'new-testament' | 'psalms' | 'proverbs' | 'gospels' | 'epistles' | 'prophets' | 'general' | 'mathematics' | 'science' | 'leadership';
  questions: BibleGameQuestion[];
  timeLimit?: number; // in seconds
  pointsPerCorrect: number;
  pointsPerIncorrect: number;
  minScore: number; // minimum score to pass
  maxAttempts?: number;
  isUnlocked: boolean;
  prerequisiteGames?: string[];
  rewards: GameReward[];
  createdAt: string;
  updatedAt: string;
}

export interface BibleGameQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching' | 'ordering';
  options?: string[]; // for multiple choice
  correctAnswer: string | string[]; // can be array for matching/ordering
  explanation?: string;
  scriptureReference?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  hints?: string[];
  category: string;
}

export interface GameSession {
  id: string;
  gameId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  score: number;
  maxScore: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  answers: GameAnswer[];
  status: 'in-progress' | 'completed' | 'abandoned';
  difficulty: string;
  hintsUsed: number;
  streakCount: number;
  achievements: string[]; // achievement IDs earned in this session
}

export interface GameAnswer {
  questionId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
  points: number;
}

export interface GameReward {
  type: 'points' | 'badge' | 'achievement' | 'unlock';
  value: string | number;
  condition: 'completion' | 'perfect-score' | 'time-bonus' | 'streak' | 'high-score';
  description: string;
}

export interface BibleGameStats {
  userId: string;
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  perfectGames: number;
  currentStreak: number;
  longestStreak: number;
  favoriteCategory: string;
  totalTimeSpent: number; // in minutes
  achievementsEarned: number;
  badgesEarned: number;
  difficulty: {
    easy: { played: number; won: number; avgScore: number };
    medium: { played: number; won: number; avgScore: number };
    hard: { played: number; won: number; avgScore: number };
    expert: { played: number; won: number; avgScore: number };
  };
  categoryStats: Record<string, {
    played: number;
    won: number;
    avgScore: number;
    bestScore: number;
  }>;
  weeklyProgress: {
    week: string;
    gamesPlayed: number;
    score: number;
    achievements: number;
  }[];
}

export interface BibleGameLeaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category?: string;
  difficulty?: string;
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  score: number;
  gamesPlayed: number;
  averageScore: number;
  badges: string[];
  isCurrentUser?: boolean;
}

// Achievement and Gamification Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'prayer' | 'community' | 'growth' | 'sharing' | 'consistency' | 'bible-game';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: AchievementRequirement[];
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  requirement?: number;
}

export interface AchievementRequirement {
  type: 'prayer_count' | 'streak_days' | 'testimonial_count' | 'meeting_attendance' | 'sharing_count' | 'bible_game_score' | 'bible_game_streak' | 'bible_game_perfect' | 'bible_game_category';
  target: number;
  current: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'milestone' | 'special' | 'seasonal' | 'community';
  earnedAt?: string;
  isRare: boolean;
}

export interface PrayerStreak {
  currentStreak: number;
  longestStreak: number;
  lastPrayerDate?: string;
  streakStartDate?: string;
}

// Prayer Plan Types
export interface PrayerPlan {
  id: string;
  title: string;
  description: string;
  category: 'devotional' | 'topical' | 'biblical' | 'seasonal' | 'life-stage';
  duration: number; // days
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author: string;
  authorBio?: string;
  imageUrl?: string;
  tags: string[];
  days: PrayerPlanDay[];
  participantCount: number;
  rating: number;
  reviewCount: number;
  isPopular: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  price?: number; // 0 for free
  isPremium: boolean;
}

export interface PrayerPlanDay {
  day: number;
  title: string;
  scripture?: string;
  scriptureReference?: string;
  reflection: string;
  prayer: string;
  questions?: string[];
  additionalResources?: PrayerPlanResource[];
}

export interface PrayerPlanResource {
  type: 'article' | 'video' | 'audio' | 'book';
  title: string;
  url: string;
  description?: string;
}

export interface UserPrayerPlan {
  planId: string;
  startDate: string;
  currentDay: number;
  isCompleted: boolean;
  completedDays: number[];
  notes?: Record<number, string>; // Day number -> note
  lastAccessedAt?: string;
  progressId?: string;
}

// External Integration Types
export interface ExternalIntegration {
  id: string;
  name: string;
  type: 'bible' | 'music' | 'calendar' | 'social' | 'payment' | 'ai' | 'church';
  isConnected: boolean;
  settings?: Record<string, any>;
  connectedAt?: string;
  lastSyncAt?: string;
  syncStatus?: 'success' | 'error' | 'pending';
  errorMessage?: string;
}

// AI and LLM Types
export interface AIConversation {
  id: string;
  title: string;
  type: 'prayer' | 'devotional' | 'scripture' | 'general';
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  model?: string;
  provider?: 'openai' | 'anthropic' | 'google' | 'mistral';
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    tokens?: number;
    cost?: number;
  };
}

export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
  isConnected: boolean;
  apiKey?: string;
  settings?: AIProviderSettings;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPer1kTokens: number;
  capabilities: ('text' | 'image' | 'audio' | 'video')[];
  isRecommended?: boolean;
}

export interface AIProviderSettings {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// Mental Health Types
export interface MentalHealthResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'exercise' | 'meditation';
  category: 'anxiety' | 'depression' | 'stress' | 'grief' | 'relationships' | 'self-care' | 'mindfulness';
  duration?: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  url?: string;
  content?: string;
  author: string;
  authorCredentials?: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  isPopular: boolean;
  isProfessional: boolean; // Created by licensed professional
  createdAt: string;
  updatedAt: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  mood: 1 | 2 | 3 | 4 | 5; // 1 = very low, 5 = very high
  emotions: string[]; // happy, sad, anxious, peaceful, etc.
  notes?: string;
  triggers?: string[];
  activities?: string[];
  gratitude?: string[];
  prayerRequests?: string[];
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'prayer_reminder' | 'meeting_reminder' | 'achievement' | 'community' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  scheduledFor?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// Analytics Types
export interface UserAnalytics {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  prayerCount: number;
  prayerStreak: number;
  meetingsAttended: number;
  testimonialsShared: number;
  communityInteractions: number;
  favoriteCategories: string[];
  activeHours: number[];
  growthMetrics: {
    prayerGrowth: number;
    engagementGrowth: number;
    consistencyScore: number;
  };
}

// AI Suggestion Types
export interface AISuggestion {
  scripture: string;
  song: string;
  explanation: string;
}

// Habit Tracking Types
export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: 'spiritual' | 'physical' | 'mental' | 'social' | 'personal' | 'other';
  frequency: 'daily' | 'weekly' | 'custom';
  scheduleDays: string[];
  targetFrequency?: number; // times per period
  targetPeriod?: 'day' | 'week' | 'month';
  reminderTime?: string | null; // HH:MM format
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  streak: number;
  longestStreak: number;
  totalCompletions: number;
  color: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  notes?: string;
  targetValue?: number;
  unit?: string;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  completedAt?: string;
  notes?: string;
  mood?: 1 | 2 | 3 | 4 | 5; // 1 = very low, 5 = very high
  effort?: 1 | 2 | 3 | 4 | 5; // 1 = very easy, 5 = very hard
  satisfaction?: 1 | 2 | 3 | 4 | 5; // 1 = not satisfied, 5 = very satisfied
  context?: string; // where, with whom, etc.
  triggers?: string[]; // what prompted the habit
  obstacles?: string[]; // what made it difficult
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // percentage
  averageMood?: number;
  averageEffort?: number;
  averageSatisfaction?: number;
  weeklyProgress: {
    week: string; // YYYY-WW format
    completions: number;
    target: number;
    rate: number;
  }[];
  monthlyProgress: {
    month: string; // YYYY-MM format
    completions: number;
    target: number;
    rate: number;
  }[];
  bestDays: string[]; // days of week with highest completion rate
  commonTriggers: string[];
  commonObstacles: string[];
  insights: HabitInsight[];
}

export interface HabitInsight {
  id: string;
  habitId: string;
  type: 'pattern' | 'suggestion' | 'milestone' | 'warning' | 'encouragement';
  title: string;
  description: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  isRead: boolean;
  actionable: boolean;
  actionText?: string;
  actionData?: Record<string, any>;
}

export interface HabitGoal {
  id: string;
  habitId: string;
  type: 'streak' | 'total' | 'rate' | 'consistency';
  target: number;
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
  isActive: boolean;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  reward?: string;
}

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  benefits: string[];
  tips: string[];
  relatedHabits: string[];
  isPopular: boolean;
  usageCount: number;
  rating: number;
  tags: string[];
}

// Meeting Platform and Recurring Types
export type MeetingPlatform = 'zoom' | 'google_meet' | 'ms_teams' | 'whatsapp' | 'in_person';
export type RecurringType = 'daily' | 'weekly' | 'monthly';

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  userId?: string;
  context?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Marketplace Types
export type ServiceCategory =
  | 'spiritual-guidance'
  | 'counseling'
  | 'music-ministry'
  | 'event-planning'
  | 'education'
  | 'technology'
  | 'creative-services'
  | 'business-consulting'
  | 'financial-services'
  | 'health-wellness'
  | 'childcare'
  | 'home-repair'
  | 'cleaning'
  | 'transportation'
  | 'tutoring'
  | 'other';

export type PriceType = 'free' | 'fixed' | 'hourly' | 'donation';

export type ServiceApprovalStatus = 'pending_approval' | 'approved' | 'rejected' | 'changes_requested';

export interface ServiceListing {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  categoryName?: string;
  priceType: PriceType;
  price?: number;
  currency: string;
  duration?: number;
  providerId: string;
  provider: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
  };
  images: string[];
  tags: string[];
  isActive: boolean;
  isApproved: boolean;
  approvalStatus: ServiceApprovalStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  location?: {
    type: 'online' | 'in-person' | 'hybrid';
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  availability?: {
    days: string[];
    timeSlots: { start: string; end: string }[];
  };
  contactMethod: 'in-app' | 'email' | 'phone';
  contactValue?: string;
  rating?: number;
  reviewCount?: number;
  adminNotes?: string;
  rejectionReason?: string;
  changesRequested?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ServiceBooking {
  id: string;
  serviceId: string;
  service: ServiceListing;
  clientId: string;
  client: User;
  providerId: string;
  provider: User;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledAt: string;
  duration: number;
  totalAmount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceReview {
  id: string;
  serviceId: string;
  bookingId?: string;
  clientId: string;
  client: User;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface MarketplaceSettings {
  enabled: boolean;
  commissionRate: number;
  requireApproval: boolean;
  allowedCategories: ServiceCategory[];
  featuredListingPrice: number;
  maxImagesPerListing: number;
  autoApproveVerifiedProviders: boolean;
  enableBookings: boolean;
  enablePayments: boolean;
  enableReviews: boolean;
  moderationEnabled: boolean;
}

export interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  totalProviders: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  categoryBreakdown: Record<ServiceCategory, number>;
  monthlyGrowth: {
    listings: number;
    bookings: number;
    revenue: number;
  };
}

// Search Types
export interface SearchResult {
  id: string;
  type: 'prayer' | 'testimonial' | 'song' | 'quote' | 'promise' | 'meeting' | 'user';
  title: string;
  description?: string;
  imageUrl?: string;
  relevanceScore: number;
  category?: string;
  tags: string[];
  createdAt: string;
}

export interface SearchFilters {
  type?: string[];
  category?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// Subscription and Billing Types
export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium' | 'pro' | 'org_small' | 'org_medium' | 'org_large';
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  paymentMethod?: PaymentMethod;
  lastPayment?: Payment;
  nextPayment?: {
    amount: number;
    currency: string;
    date: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_account';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  description: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  description: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  paidAt?: string;
  downloadUrl?: string;
}