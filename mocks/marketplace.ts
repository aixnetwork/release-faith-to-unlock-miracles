import type { ServiceListing, ServiceBooking, ServiceReview, MarketplaceSettings, MarketplaceStats } from '@/types';

export const mockServiceListings: ServiceListing[] = [
  // Spiritual Guidance
  {
    id: 'service-1',
    title: 'Biblical Counseling & Life Coaching',
    description: 'Professional biblical counseling sessions to help you navigate life challenges through faith-based guidance. Specializing in marriage counseling, grief support, and spiritual growth.',
    category: 'spiritual-guidance',
    priceType: 'hourly',
    price: 75,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-1',
    provider: {
      id: 'provider-1',
      name: 'Pastor David Thompson',
      avatar: 'https://i.pravatar.cc/150?img=33',
      rating: 4.9,
      reviewCount: 127,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800'
    ],
    tags: ['counseling', 'marriage', 'grief', 'spiritual-growth', 'biblical'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
    location: {
      type: 'hybrid',
      city: 'Nashville',
      state: 'Tennessee',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '18:00' }
      ]
    },
    contactMethod: 'in-app',
    rating: 4.9,
    reviewCount: 127
  },
  {
    id: 'service-2',
    title: 'Prayer Warrior Intercession Service',
    description: 'Dedicated prayer support for your specific needs. Our team of experienced intercessors will pray for you daily for 30 days, providing spiritual coverage and breakthrough.',
    category: 'spiritual-guidance',
    priceType: 'donation',
    currency: 'USD',
    duration: 30,
    providerId: 'provider-2',
    provider: {
      id: 'provider-2',
      name: 'Sister Mary Johnson',
      avatar: 'https://i.pravatar.cc/150?img=44',
      rating: 5.0,
      reviewCount: 89,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1445445290350-18a3b86e0b5a?w=800'
    ],
    tags: ['prayer', 'intercession', 'spiritual-warfare', 'breakthrough'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-03-18T10:00:00Z',
    location: {
      type: 'online',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      timeSlots: [{ start: '00:00', end: '23:59' }]
    },
    contactMethod: 'email',
    contactValue: 'prayer@example.com',
    rating: 5.0,
    reviewCount: 89
  },

  // Music Ministry
  {
    id: 'service-3',
    title: 'Worship Team Training & Development',
    description: 'Comprehensive worship team training including vocal coaching, instrument lessons, and team dynamics. Perfect for churches looking to elevate their worship experience.',
    category: 'music-ministry',
    priceType: 'fixed',
    price: 500,
    currency: 'USD',
    duration: 480,
    providerId: 'provider-3',
    provider: {
      id: 'provider-3',
      name: 'Michael Rivers',
      avatar: 'https://i.pravatar.cc/150?img=12',
      rating: 4.8,
      reviewCount: 64,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800'
    ],
    tags: ['worship', 'music', 'training', 'vocals', 'instruments'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: true,
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-03-15T16:00:00Z',
    location: {
      type: 'in-person',
      city: 'Atlanta',
      state: 'Georgia',
      country: 'USA'
    },
    availability: {
      days: ['Saturday', 'Sunday'],
      timeSlots: [{ start: '10:00', end: '18:00' }]
    },
    contactMethod: 'in-app',
    rating: 4.8,
    reviewCount: 64
  },
  {
    id: 'service-4',
    title: 'Gospel Music Production & Recording',
    description: 'Professional music production services for gospel artists. Full studio recording, mixing, mastering, and distribution support.',
    category: 'music-ministry',
    priceType: 'hourly',
    price: 150,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-4',
    provider: {
      id: 'provider-4',
      name: 'Kingdom Sound Studios',
      avatar: 'https://i.pravatar.cc/150?img=65',
      rating: 4.7,
      reviewCount: 42,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'
    ],
    tags: ['recording', 'production', 'gospel', 'studio', 'mixing'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-03-10T11:00:00Z',
    location: {
      type: 'in-person',
      address: '123 Music Row',
      city: 'Nashville',
      state: 'Tennessee',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: [{ start: '09:00', end: '21:00' }]
    },
    contactMethod: 'phone',
    contactValue: '+1-555-0123',
    rating: 4.7,
    reviewCount: 42
  },

  // Event Planning
  {
    id: 'service-5',
    title: 'Church Event Planning & Coordination',
    description: 'Full-service event planning for church conferences, retreats, weddings, and special celebrations. From concept to execution, we handle every detail.',
    category: 'event-planning',
    priceType: 'fixed',
    price: 2500,
    currency: 'USD',
    providerId: 'provider-5',
    provider: {
      id: 'provider-5',
      name: 'Grace Events Co.',
      avatar: 'https://i.pravatar.cc/150?img=48',
      rating: 4.9,
      reviewCount: 156,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'
    ],
    tags: ['events', 'planning', 'conferences', 'weddings', 'retreats'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: true,
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-03-22T13:00:00Z',
    location: {
      type: 'hybrid',
      city: 'Dallas',
      state: 'Texas',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: [{ start: '08:00', end: '20:00' }]
    },
    contactMethod: 'in-app',
    rating: 4.9,
    reviewCount: 156
  },

  // Education
  {
    id: 'service-6',
    title: 'Biblical Hebrew & Greek Tutoring',
    description: 'Learn to read the Bible in its original languages. One-on-one tutoring for beginners to advanced students.',
    category: 'education',
    priceType: 'hourly',
    price: 45,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-6',
    provider: {
      id: 'provider-6',
      name: 'Dr. Sarah Mitchell',
      avatar: 'https://i.pravatar.cc/150?img=26',
      rating: 5.0,
      reviewCount: 73,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800'
    ],
    tags: ['hebrew', 'greek', 'biblical-languages', 'tutoring', 'education'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-02-15T11:00:00Z',
    updatedAt: '2024-03-19T15:00:00Z',
    location: {
      type: 'online',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: [
        { start: '16:00', end: '20:00' }
      ]
    },
    contactMethod: 'email',
    contactValue: 'biblicallanguages@example.com',
    rating: 5.0,
    reviewCount: 73
  },
  {
    id: 'service-7',
    title: 'Sunday School Curriculum Development',
    description: 'Custom Sunday school curriculum tailored to your church\'s needs. Age-appropriate lessons, activities, and teaching materials.',
    category: 'education',
    priceType: 'fixed',
    price: 800,
    currency: 'USD',
    providerId: 'provider-7',
    provider: {
      id: 'provider-7',
      name: 'Kingdom Kids Education',
      avatar: 'https://i.pravatar.cc/150?img=31',
      rating: 4.6,
      reviewCount: 38,
      verified: false
    },
    images: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'
    ],
    tags: ['sunday-school', 'curriculum', 'children', 'education', 'teaching'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-20T12:00:00Z',
    location: {
      type: 'online',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: [{ start: '09:00', end: '17:00' }]
    },
    contactMethod: 'in-app',
    rating: 4.6,
    reviewCount: 38
  },

  // Technology
  {
    id: 'service-8',
    title: 'Church Website Design & Development',
    description: 'Modern, responsive church websites with online giving, event management, and member portals. SEO optimized and mobile-friendly.',
    category: 'technology',
    priceType: 'fixed',
    price: 3500,
    currency: 'USD',
    providerId: 'provider-8',
    provider: {
      id: 'provider-8',
      name: 'FaithTech Solutions',
      avatar: 'https://i.pravatar.cc/150?img=60',
      rating: 4.8,
      reviewCount: 92,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800'
    ],
    tags: ['website', 'design', 'development', 'church', 'technology'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-03-21T09:00:00Z',
    location: {
      type: 'online',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: [{ start: '09:00', end: '18:00' }]
    },
    contactMethod: 'in-app',
    rating: 4.8,
    reviewCount: 92
  },
  {
    id: 'service-9',
    title: 'Live Streaming Setup & Support',
    description: 'Complete live streaming solution for churches. Equipment setup, training, and ongoing technical support.',
    category: 'technology',
    priceType: 'hourly',
    price: 85,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-9',
    provider: {
      id: 'provider-9',
      name: 'StreamFaith Media',
      avatar: 'https://i.pravatar.cc/150?img=52',
      rating: 4.7,
      reviewCount: 61,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1598743400863-0201c7e1445b?w=800'
    ],
    tags: ['streaming', 'technology', 'video', 'broadcast', 'support'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-02-05T13:00:00Z',
    updatedAt: '2024-03-18T14:00:00Z',
    location: {
      type: 'hybrid',
      city: 'Phoenix',
      state: 'Arizona',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      timeSlots: [{ start: '07:00', end: '22:00' }]
    },
    contactMethod: 'phone',
    contactValue: '+1-555-0456',
    rating: 4.7,
    reviewCount: 61
  },

  // Creative Services
  {
    id: 'service-10',
    title: 'Christian Book Cover Design',
    description: 'Professional book cover design for Christian authors. Eye-catching designs that reflect your message and appeal to your target audience.',
    category: 'creative-services',
    priceType: 'fixed',
    price: 450,
    currency: 'USD',
    providerId: 'provider-10',
    provider: {
      id: 'provider-10',
      name: 'Blessed Designs Studio',
      avatar: 'https://i.pravatar.cc/150?img=28',
      rating: 4.9,
      reviewCount: 118,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=800'
    ],
    tags: ['design', 'book-cover', 'graphic-design', 'publishing', 'creative'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-03-17T11:00:00Z',
    location: {
      type: 'online',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: [{ start: '10:00', end: '18:00' }]
    },
    contactMethod: 'email',
    contactValue: 'design@blessedstudio.com',
    rating: 4.9,
    reviewCount: 118
  },
  {
    id: 'service-11',
    title: 'Church Photography & Videography',
    description: 'Professional photography and videography services for church events, baptisms, weddings, and promotional materials.',
    category: 'creative-services',
    priceType: 'hourly',
    price: 125,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-11',
    provider: {
      id: 'provider-11',
      name: 'Capture the Kingdom',
      avatar: 'https://i.pravatar.cc/150?img=35',
      rating: 4.8,
      reviewCount: 87,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'
    ],
    tags: ['photography', 'videography', 'events', 'media', 'creative'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: true,
    createdAt: '2024-02-08T09:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
    location: {
      type: 'in-person',
      city: 'Los Angeles',
      state: 'California',
      country: 'USA'
    },
    availability: {
      days: ['Friday', 'Saturday', 'Sunday'],
      timeSlots: [{ start: '08:00', end: '20:00' }]
    },
    contactMethod: 'in-app',
    rating: 4.8,
    reviewCount: 87
  },

  // Business Consulting
  {
    id: 'service-12',
    title: 'Nonprofit Formation & 501(c)(3) Filing',
    description: 'Complete nonprofit formation services including 501(c)(3) application, bylaws, and board development for churches and ministries.',
    category: 'business-consulting',
    priceType: 'fixed',
    price: 1500,
    currency: 'USD',
    providerId: 'provider-12',
    provider: {
      id: 'provider-12',
      name: 'Ministry Legal Services',
      avatar: 'https://i.pravatar.cc/150?img=42',
      rating: 4.9,
      reviewCount: 203,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800'
    ],
    tags: ['nonprofit', '501c3', 'legal', 'formation', 'consulting'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-03-19T12:00:00Z',
    location: {
      type: 'hybrid',
      city: 'Washington',
      state: 'DC',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: [{ start: '09:00', end: '17:00' }]
    },
    contactMethod: 'email',
    contactValue: 'legal@ministryservices.com',
    rating: 4.9,
    reviewCount: 203
  },

  // Financial Services
  {
    id: 'service-13',
    title: 'Church Financial Management & Bookkeeping',
    description: 'Professional bookkeeping and financial management services specifically for churches and religious organizations.',
    category: 'financial-services',
    priceType: 'hourly',
    price: 65,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-13',
    provider: {
      id: 'provider-13',
      name: 'Kingdom Finance Solutions',
      avatar: 'https://i.pravatar.cc/150?img=55',
      rating: 4.7,
      reviewCount: 94,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800'
    ],
    tags: ['finance', 'bookkeeping', 'accounting', 'church', 'management'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-02-12T10:00:00Z',
    updatedAt: '2024-03-21T11:00:00Z',
    location: {
      type: 'online',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: [{ start: '09:00', end: '18:00' }]
    },
    contactMethod: 'in-app',
    rating: 4.7,
    reviewCount: 94
  },

  // Health & Wellness
  {
    id: 'service-14',
    title: 'Christian Fitness & Nutrition Coaching',
    description: 'Faith-based fitness and nutrition coaching. Honor your body as God\'s temple with personalized workout plans and biblical nutrition guidance.',
    category: 'health-wellness',
    priceType: 'hourly',
    price: 55,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-14',
    provider: {
      id: 'provider-14',
      name: 'Temple Fitness Ministry',
      avatar: 'https://i.pravatar.cc/150?img=38',
      rating: 4.8,
      reviewCount: 142,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800'
    ],
    tags: ['fitness', 'nutrition', 'health', 'wellness', 'christian'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: true,
    createdAt: '2024-01-30T08:00:00Z',
    updatedAt: '2024-03-22T09:00:00Z',
    location: {
      type: 'hybrid',
      city: 'Orlando',
      state: 'Florida',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: [
        { start: '06:00', end: '09:00' },
        { start: '17:00', end: '20:00' }
      ]
    },
    contactMethod: 'in-app',
    rating: 4.8,
    reviewCount: 142
  },
  {
    id: 'service-15',
    title: 'Christian Mental Health Counseling',
    description: 'Licensed mental health counseling with a Christian perspective. Specializing in anxiety, depression, trauma, and relationship issues.',
    category: 'health-wellness',
    priceType: 'hourly',
    price: 95,
    currency: 'USD',
    duration: 50,
    providerId: 'provider-15',
    provider: {
      id: 'provider-15',
      name: 'Dr. Rachel Green, LPC',
      avatar: 'https://i.pravatar.cc/150?img=45',
      rating: 5.0,
      reviewCount: 178,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800'
    ],
    tags: ['counseling', 'mental-health', 'therapy', 'christian', 'licensed'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-02-03T12:00:00Z',
    updatedAt: '2024-03-20T13:00:00Z',
    location: {
      type: 'hybrid',
      city: 'Chicago',
      state: 'Illinois',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      timeSlots: [{ start: '10:00', end: '19:00' }]
    },
    contactMethod: 'phone',
    contactValue: '+1-555-0789',
    rating: 5.0,
    reviewCount: 178
  },

  // Childcare
  {
    id: 'service-16',
    title: 'Christian Childcare & Babysitting',
    description: 'Trusted Christian childcare services for church events, date nights, and regular care. CPR certified and background checked.',
    category: 'childcare',
    priceType: 'hourly',
    price: 25,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-16',
    provider: {
      id: 'provider-16',
      name: 'Faithful Sitters Network',
      avatar: 'https://i.pravatar.cc/150?img=29',
      rating: 4.9,
      reviewCount: 234,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800'
    ],
    tags: ['childcare', 'babysitting', 'children', 'certified', 'trusted'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-03-21T10:00:00Z',
    location: {
      type: 'in-person',
      city: 'Houston',
      state: 'Texas',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      timeSlots: [{ start: '07:00', end: '22:00' }]
    },
    contactMethod: 'in-app',
    rating: 4.9,
    reviewCount: 234
  },

  // Home Repair
  {
    id: 'service-17',
    title: 'Handyman Services for Church Members',
    description: 'Reliable handyman services at fair prices for the faith community. General repairs, painting, plumbing, and electrical work.',
    category: 'home-repair',
    priceType: 'hourly',
    price: 45,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-17',
    provider: {
      id: 'provider-17',
      name: 'Brothers in Service',
      avatar: 'https://i.pravatar.cc/150?img=51',
      rating: 4.7,
      reviewCount: 167,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'
    ],
    tags: ['handyman', 'repairs', 'maintenance', 'plumbing', 'electrical'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-02-07T11:00:00Z',
    updatedAt: '2024-03-19T14:00:00Z',
    location: {
      type: 'in-person',
      city: 'Denver',
      state: 'Colorado',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: [{ start: '08:00', end: '18:00' }]
    },
    contactMethod: 'phone',
    contactValue: '+1-555-0234',
    rating: 4.7,
    reviewCount: 167
  },

  // Cleaning
  {
    id: 'service-18',
    title: 'Church Facility Cleaning Services',
    description: 'Professional cleaning services for churches, fellowship halls, and ministry facilities. Weekly, bi-weekly, or one-time deep cleaning.',
    category: 'cleaning',
    priceType: 'fixed',
    price: 350,
    currency: 'USD',
    providerId: 'provider-18',
    provider: {
      id: 'provider-18',
      name: 'Spotless Sanctuary Cleaning',
      avatar: 'https://i.pravatar.cc/150?img=47',
      rating: 4.8,
      reviewCount: 129,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1581578949510-fa7315c4c350?w=800'
    ],
    tags: ['cleaning', 'church', 'facility', 'professional', 'maintenance'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-03-18T11:00:00Z',
    location: {
      type: 'in-person',
      city: 'Seattle',
      state: 'Washington',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: [{ start: '06:00', end: '20:00' }]
    },
    contactMethod: 'email',
    contactValue: 'clean@spotlesssanctuary.com',
    rating: 4.8,
    reviewCount: 129
  },

  // Transportation
  {
    id: 'service-19',
    title: 'Church Van & Bus Transportation',
    description: 'Safe and reliable transportation for church events, youth groups, and senior ministry. Licensed and insured drivers.',
    category: 'transportation',
    priceType: 'hourly',
    price: 75,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-19',
    provider: {
      id: 'provider-19',
      name: 'Faithful Transport Services',
      avatar: 'https://i.pravatar.cc/150?img=53',
      rating: 4.9,
      reviewCount: 98,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'
    ],
    tags: ['transportation', 'bus', 'van', 'church', 'events'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-02-14T08:00:00Z',
    updatedAt: '2024-03-20T09:00:00Z',
    location: {
      type: 'in-person',
      city: 'San Antonio',
      state: 'Texas',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      timeSlots: [{ start: '06:00', end: '23:00' }]
    },
    contactMethod: 'in-app',
    rating: 4.9,
    reviewCount: 98
  },

  // Tutoring
  {
    id: 'service-20',
    title: 'Math & Science Tutoring (K-12)',
    description: 'Patient, faith-based tutoring for students struggling with math and science. In-person and online sessions available.',
    category: 'tutoring',
    priceType: 'hourly',
    price: 40,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-20',
    provider: {
      id: 'provider-20',
      name: 'Professor James Wilson',
      avatar: 'https://i.pravatar.cc/150?img=57',
      rating: 4.8,
      reviewCount: 156,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800'
    ],
    tags: ['tutoring', 'math', 'science', 'education', 'k12'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-01-16T12:00:00Z',
    updatedAt: '2024-03-21T13:00:00Z',
    location: {
      type: 'hybrid',
      city: 'Boston',
      state: 'Massachusetts',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      timeSlots: [
        { start: '15:00', end: '20:00' }
      ]
    },
    contactMethod: 'email',
    contactValue: 'tutoring@profwilson.com',
    rating: 4.8,
    reviewCount: 156
  },

  // Counseling
  {
    id: 'service-21',
    title: 'Marriage & Pre-Marital Counseling',
    description: 'Build a strong, God-centered marriage with professional counseling. Specializing in communication, conflict resolution, and intimacy.',
    category: 'counseling',
    priceType: 'fixed',
    price: 150,
    currency: 'USD',
    duration: 90,
    providerId: 'provider-21',
    provider: {
      id: 'provider-21',
      name: 'Rev. Mark & Lisa Anderson',
      avatar: 'https://i.pravatar.cc/150?img=34',
      rating: 4.9,
      reviewCount: 189,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800'
    ],
    tags: ['marriage', 'counseling', 'couples', 'pre-marital', 'relationships'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: true,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-03-22T11:00:00Z',
    location: {
      type: 'hybrid',
      city: 'Charlotte',
      state: 'North Carolina',
      country: 'USA'
    },
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday'],
      timeSlots: [
        { start: '10:00', end: '20:00' }
      ]
    },
    contactMethod: 'in-app',
    rating: 4.9,
    reviewCount: 189
  },

  // Free Services
  {
    id: 'service-22',
    title: 'Free Prayer Support Group',
    description: 'Join our weekly prayer support group. Share your burdens, receive encouragement, and experience the power of corporate prayer.',
    category: 'spiritual-guidance',
    priceType: 'free',
    currency: 'USD',
    duration: 60,
    providerId: 'provider-22',
    provider: {
      id: 'provider-22',
      name: 'Community Prayer Network',
      avatar: 'https://i.pravatar.cc/150?img=41',
      rating: 5.0,
      reviewCount: 312,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800'
    ],
    tags: ['prayer', 'support', 'group', 'free', 'community'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: true,
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-03-22T10:00:00Z',
    location: {
      type: 'online',
      country: 'Global'
    },
    availability: {
      days: ['Wednesday', 'Sunday'],
      timeSlots: [
        { start: '19:00', end: '20:30' }
      ]
    },
    contactMethod: 'in-app',
    rating: 5.0,
    reviewCount: 312
  },

  // Other
  {
    id: 'service-23',
    title: 'Christian Life Coaching',
    description: 'Discover your God-given purpose and achieve your goals with faith-based life coaching. Personal development from a biblical perspective.',
    category: 'other',
    priceType: 'hourly',
    price: 60,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-23',
    provider: {
      id: 'provider-23',
      name: 'Purpose Driven Coaching',
      avatar: 'https://i.pravatar.cc/150?img=36',
      rating: 4.7,
      reviewCount: 84,
      verified: false
    },
    images: [
      'https://images.unsplash.com/photo-1552581234-26160f608093?w=800'
    ],
    tags: ['coaching', 'life-coach', 'purpose', 'goals', 'christian'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-02-20T11:00:00Z',
    updatedAt: '2024-03-19T12:00:00Z',
    location: {
      type: 'online',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: [{ start: '09:00', end: '17:00' }]
    },
    contactMethod: 'email',
    contactValue: 'coach@purposedriven.com',
    rating: 4.7,
    reviewCount: 84
  },

  // Additional Services for Better Testing
  {
    id: 'service-24',
    title: 'Youth Ministry Leadership Training',
    description: 'Comprehensive training program for youth pastors and volunteers. Learn effective ministry strategies, communication skills, and leadership development.',
    category: 'education',
    priceType: 'fixed',
    price: 299,
    currency: 'USD',
    duration: 360,
    providerId: 'provider-24',
    provider: {
      id: 'provider-24',
      name: 'NextGen Ministry Institute',
      avatar: 'https://i.pravatar.cc/150?img=15',
      rating: 4.9,
      reviewCount: 145,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800'
    ],
    tags: ['youth', 'ministry', 'leadership', 'training', 'pastor'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: true,
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-03-22T15:00:00Z',
    location: {
      type: 'hybrid',
      city: 'Colorado Springs',
      state: 'Colorado',
      country: 'USA'
    },
    availability: {
      days: ['Saturday'],
      timeSlots: [{ start: '09:00', end: '15:00' }]
    },
    contactMethod: 'in-app',
    rating: 4.9,
    reviewCount: 145
  },
  {
    id: 'service-25',
    title: 'Christian Wedding Photography',
    description: 'Beautiful, faith-centered wedding photography that captures your special day with reverence and joy. Includes engagement session.',
    category: 'creative-services',
    priceType: 'fixed',
    price: 1800,
    currency: 'USD',
    providerId: 'provider-25',
    provider: {
      id: 'provider-25',
      name: 'Covenant Moments Photography',
      avatar: 'https://i.pravatar.cc/150?img=22',
      rating: 5.0,
      reviewCount: 67,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800'
    ],
    tags: ['wedding', 'photography', 'christian', 'engagement', 'couples'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: true,
    createdAt: '2024-01-28T11:00:00Z',
    updatedAt: '2024-03-20T16:00:00Z',
    location: {
      type: 'in-person',
      city: 'Nashville',
      state: 'Tennessee',
      country: 'USA'
    },
    availability: {
      days: ['Friday', 'Saturday', 'Sunday'],
      timeSlots: [{ start: '08:00', end: '22:00' }]
    },
    contactMethod: 'email',
    contactValue: 'bookings@covenantmoments.com',
    rating: 5.0,
    reviewCount: 67
  },
  {
    id: 'service-26',
    title: 'Addiction Recovery Support Group',
    description: 'Faith-based addiction recovery support group. Weekly meetings with licensed counselors and peer support in a safe, judgment-free environment.',
    category: 'counseling',
    priceType: 'free',
    currency: 'USD',
    duration: 90,
    providerId: 'provider-26',
    provider: {
      id: 'provider-26',
      name: 'New Life Recovery Center',
      avatar: 'https://i.pravatar.cc/150?img=18',
      rating: 4.8,
      reviewCount: 203,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800'
    ],
    tags: ['recovery', 'addiction', 'support-group', 'counseling', 'free'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-03-21T10:00:00Z',
    location: {
      type: 'hybrid',
      city: 'Phoenix',
      state: 'Arizona',
      country: 'USA'
    },
    availability: {
      days: ['Tuesday', 'Thursday', 'Sunday'],
      timeSlots: [{ start: '19:00', end: '20:30' }]
    },
    contactMethod: 'phone',
    contactValue: '+1-555-0987',
    rating: 4.8,
    reviewCount: 203
  },
  {
    id: 'service-27',
    title: 'Church Social Media Management',
    description: 'Professional social media management for churches. Content creation, posting schedules, engagement, and growth strategies across all platforms.',
    category: 'technology',
    priceType: 'hourly',
    price: 45,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-27',
    provider: {
      id: 'provider-27',
      name: 'Digital Ministry Solutions',
      avatar: 'https://i.pravatar.cc/150?img=39',
      rating: 4.6,
      reviewCount: 78,
      verified: false
    },
    images: [
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800'
    ],
    tags: ['social-media', 'marketing', 'church', 'digital', 'content'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-02-18T13:00:00Z',
    updatedAt: '2024-03-19T14:00:00Z',
    location: {
      type: 'online',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: [{ start: '09:00', end: '17:00' }]
    },
    contactMethod: 'in-app',
    rating: 4.6,
    reviewCount: 78
  },
  {
    id: 'service-28',
    title: 'Senior Care & Companionship',
    description: 'Compassionate care and companionship for elderly church members. Light housekeeping, meal preparation, and friendly visits.',
    category: 'other',
    priceType: 'hourly',
    price: 25,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-28',
    provider: {
      id: 'provider-28',
      name: 'Golden Years Ministry',
      avatar: 'https://i.pravatar.cc/150?img=43',
      rating: 4.9,
      reviewCount: 156,
      verified: true
    },
    images: [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800'
    ],
    tags: ['senior-care', 'companionship', 'elderly', 'ministry', 'care'],
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
    featured: false,
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-03-20T11:00:00Z',
    location: {
      type: 'in-person',
      city: 'Tampa',
      state: 'Florida',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: [{ start: '08:00', end: '18:00' }]
    },
    contactMethod: 'phone',
    contactValue: '+1-555-0654',
    rating: 4.9,
    reviewCount: 156
  },

  // Pending Listings for Admin Testing
  {
    id: 'service-29',
    title: 'Christian Dating & Relationship Coaching',
    description: 'Biblical guidance for singles seeking godly relationships. Learn about courtship, boundaries, and preparing for marriage from a Christian perspective.',
    category: 'counseling',
    priceType: 'hourly',
    price: 65,
    currency: 'USD',
    duration: 60,
    providerId: 'provider-29',
    provider: {
      id: 'provider-29',
      name: 'Sarah Williams, LMFT',
      avatar: 'https://i.pravatar.cc/150?img=25',
      rating: 0,
      reviewCount: 0,
      verified: false
    },
    images: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800'
    ],
    tags: ['dating', 'relationships', 'christian', 'singles', 'courtship'],
    isActive: true,
    isApproved: false,
    approvalStatus: 'pending_approval',
    featured: false,
    createdAt: '2024-03-23T10:00:00Z',
    updatedAt: '2024-03-23T10:00:00Z',
    location: {
      type: 'online',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: [{ start: '18:00', end: '21:00' }]
    },
    contactMethod: 'in-app',
    rating: 0,
    reviewCount: 0
  },
  {
    id: 'service-30',
    title: 'Prophetic Ministry & Dream Interpretation',
    description: 'Receive prophetic words and dream interpretation through the gifts of the Spirit. Helping believers understand God\'s voice and direction.',
    category: 'spiritual-guidance',
    priceType: 'donation',
    currency: 'USD',
    duration: 45,
    providerId: 'provider-30',
    provider: {
      id: 'provider-30',
      name: 'Prophet Michael Stone',
      avatar: 'https://i.pravatar.cc/150?img=58',
      rating: 0,
      reviewCount: 0,
      verified: false
    },
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
    ],
    tags: ['prophetic', 'dreams', 'interpretation', 'spiritual-gifts', 'ministry'],
    isActive: true,
    isApproved: false,
    approvalStatus: 'pending_approval',
    featured: false,
    createdAt: '2024-03-22T15:30:00Z',
    updatedAt: '2024-03-22T15:30:00Z',
    location: {
      type: 'hybrid',
      city: 'Kansas City',
      state: 'Missouri',
      country: 'USA'
    },
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
      timeSlots: [{ start: '19:00', end: '22:00' }]
    },
    contactMethod: 'phone',
    contactValue: '+1-555-0321',
    rating: 0,
    reviewCount: 0
  },
  {
    id: 'service-31',
    title: 'Cryptocurrency Investment Coaching',
    description: 'Learn to invest in cryptocurrency from a biblical stewardship perspective. Responsible investing strategies for Christian investors.',
    category: 'financial-services',
    priceType: 'fixed',
    price: 200,
    currency: 'USD',
    duration: 120,
    providerId: 'provider-31',
    provider: {
      id: 'provider-31',
      name: 'David Crypto Ministry',
      avatar: 'https://i.pravatar.cc/150?img=61',
      rating: 0,
      reviewCount: 0,
      verified: false
    },
    images: [
      'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800'
    ],
    tags: ['cryptocurrency', 'investment', 'stewardship', 'finance', 'bitcoin'],
    isActive: true,
    isApproved: false,
    approvalStatus: 'changes_requested',
    featured: false,
    createdAt: '2024-03-21T09:00:00Z',
    updatedAt: '2024-03-23T14:00:00Z',
    location: {
      type: 'online',
      country: 'USA'
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: [{ start: '20:00', end: '22:00' }]
    },
    contactMethod: 'email',
    contactValue: 'crypto@ministry.com',
    rating: 0,
    reviewCount: 0,
    changesRequested: 'Please provide more information about your qualifications and certifications. Also, clarify how this aligns with biblical financial principles.',
    reviewedBy: 'admin-1',
    reviewedAt: '2024-03-23T14:00:00Z'
  },
  {
    id: 'service-32',
    title: 'Deliverance & Spiritual Warfare Ministry',
    description: 'Freedom from spiritual bondage through deliverance ministry. Breaking generational curses and demonic oppression.',
    category: 'spiritual-guidance',
    priceType: 'free',
    currency: 'USD',
    duration: 180,
    providerId: 'provider-32',
    provider: {
      id: 'provider-32',
      name: 'Apostle John Deliverer',
      avatar: 'https://i.pravatar.cc/150?img=49',
      rating: 0,
      reviewCount: 0,
      verified: false
    },
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800'
    ],
    tags: ['deliverance', 'spiritual-warfare', 'freedom', 'ministry', 'healing'],
    isActive: true,
    isApproved: false,
    approvalStatus: 'rejected',
    featured: false,
    createdAt: '2024-03-20T11:00:00Z',
    updatedAt: '2024-03-23T16:00:00Z',
    location: {
      type: 'in-person',
      city: 'Birmingham',
      state: 'Alabama',
      country: 'USA'
    },
    availability: {
      days: ['Friday', 'Saturday', 'Sunday'],
      timeSlots: [{ start: '18:00', end: '21:00' }]
    },
    contactMethod: 'phone',
    contactValue: '+1-555-0987',
    rating: 0,
    reviewCount: 0,
    rejectionReason: 'This service requires proper credentials and oversight. Please provide documentation of training, ordination, and accountability structure.',
    reviewedBy: 'admin-1',
    reviewedAt: '2024-03-23T16:00:00Z'
  }
];

export const mockServiceBookings: ServiceBooking[] = [
  {
    id: 'booking-1',
    serviceId: 'service-1',
    service: mockServiceListings[0],
    clientId: 'user-1',
    client: {
      id: 'user-1',
      name: 'John Smith',
      email: 'john@example.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
      joinDate: '2024-01-01T00:00:00Z',
      plan: 'premium',
      isVerified: true
    },
    providerId: 'provider-1',
    provider: {
      id: 'provider-1',
      name: 'Pastor David Thompson',
      email: 'david@example.com',
      avatar: 'https://i.pravatar.cc/150?img=33',
      joinDate: '2024-01-01T00:00:00Z',
      plan: 'pro',
      isVerified: true
    },
    status: 'confirmed',
    scheduledAt: '2024-03-25T14:00:00Z',
    duration: 60,
    totalAmount: 75,
    currency: 'USD',
    paymentStatus: 'paid',
    notes: 'Looking forward to our session on marriage counseling.',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  },
  {
    id: 'booking-2',
    serviceId: 'service-3',
    service: mockServiceListings[2],
    clientId: 'user-2',
    client: {
      id: 'user-2',
      name: 'Grace Church',
      email: 'info@gracechurch.com',
      avatar: 'https://i.pravatar.cc/150?img=2',
      joinDate: '2024-01-01T00:00:00Z',
      plan: 'org_large',
      isVerified: true
    },
    providerId: 'provider-3',
    provider: {
      id: 'provider-3',
      name: 'Michael Rivers',
      email: 'michael@example.com',
      avatar: 'https://i.pravatar.cc/150?img=12',
      joinDate: '2024-01-01T00:00:00Z',
      plan: 'pro',
      isVerified: true
    },
    status: 'pending',
    scheduledAt: '2024-03-30T10:00:00Z',
    duration: 480,
    totalAmount: 500,
    currency: 'USD',
    paymentStatus: 'pending',
    notes: 'Full day workshop for our worship team.',
    createdAt: '2024-03-21T14:00:00Z',
    updatedAt: '2024-03-21T14:00:00Z'
  }
];

export const mockServiceReviews: ServiceReview[] = [
  {
    id: 'review-1',
    serviceId: 'service-1',
    bookingId: 'booking-old-1',
    clientId: 'user-3',
    client: {
      id: 'user-3',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'https://i.pravatar.cc/150?img=5',
      joinDate: '2024-01-01T00:00:00Z',
      plan: 'premium',
      isVerified: false
    },
    rating: 5,
    comment: 'Pastor David provided incredible guidance during a difficult time in my marriage. His biblical wisdom and compassionate approach made all the difference.',
    createdAt: '2024-03-15T10:00:00Z'
  },
  {
    id: 'review-2',
    serviceId: 'service-1',
    clientId: 'user-4',
    client: {
      id: 'user-4',
      name: 'Michael Brown',
      email: 'michael@example.com',
      avatar: 'https://i.pravatar.cc/150?img=8',
      joinDate: '2024-01-01T00:00:00Z',
      plan: 'free',
      isVerified: false
    },
    rating: 4,
    comment: 'Very helpful sessions. Would recommend to anyone seeking faith-based counseling.',
    createdAt: '2024-03-10T14:00:00Z'
  },
  {
    id: 'review-3',
    serviceId: 'service-3',
    clientId: 'user-5',
    client: {
      id: 'user-5',
      name: 'Faith Community Church',
      email: 'info@faithcommunity.com',
      avatar: 'https://i.pravatar.cc/150?img=10',
      joinDate: '2024-01-01T00:00:00Z',
      plan: 'org_medium',
      isVerified: true
    },
    rating: 5,
    comment: 'Michael transformed our worship team! His training was practical, spiritual, and exactly what we needed.',
    createdAt: '2024-03-05T09:00:00Z'
  }
];

export const mockMarketplaceSettings: MarketplaceSettings = {
  enabled: true,
  commissionRate: 10,
  requireApproval: true,
  allowedCategories: [
    'spiritual-guidance',
    'counseling',
    'music-ministry',
    'event-planning',
    'education',
    'technology',
    'creative-services',
    'business-consulting',
    'financial-services',
    'health-wellness',
    'childcare',
    'home-repair',
    'cleaning',
    'transportation',
    'tutoring',
    'other'
  ],
  featuredListingPrice: 29.99,
  maxImagesPerListing: 5,
  autoApproveVerifiedProviders: true,
  enableBookings: true,
  enablePayments: true,
  enableReviews: true,
  moderationEnabled: true
};

export const mockMarketplaceStats: MarketplaceStats = {
  totalListings: 32,
  activeListings: 28,
  totalProviders: 32,
  totalBookings: 234,
  totalRevenue: 67890.45,
  averageRating: 4.8,
  categoryBreakdown: {
    'spiritual-guidance': 2,
    'counseling': 2,
    'music-ministry': 2,
    'event-planning': 1,
    'education': 3,
    'technology': 3,
    'creative-services': 3,
    'business-consulting': 1,
    'financial-services': 1,
    'health-wellness': 2,
    'childcare': 1,
    'home-repair': 1,
    'cleaning': 1,
    'transportation': 1,
    'tutoring': 1,
    'other': 3
  },
  monthlyGrowth: {
    listings: 18.2,
    bookings: 25.7,
    revenue: 21.4
  }
};

// Helper function to get featured listings
export const getFeaturedListings = () => {
  return mockServiceListings.filter(listing => listing.featured);
};

// Helper function to get listings by category
export const getListingsByCategory = (category: string) => {
  return mockServiceListings.filter(listing => listing.category === category);
};

// Helper function to search listings
export const searchListings = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return mockServiceListings.filter(listing =>
    listing.title.toLowerCase().includes(lowerQuery) ||
    listing.description.toLowerCase().includes(lowerQuery) ||
    listing.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    listing.provider.name.toLowerCase().includes(lowerQuery)
  );
};