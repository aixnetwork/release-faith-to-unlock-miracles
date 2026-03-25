import { BibleGame, BibleGameStats, BibleGameLeaderboard } from '@/types';

export const mockBibleGames: BibleGame[] = [
  {
    id: 'genesis-quiz',
    name: 'Genesis Knowledge',
    description: 'Test your knowledge of the book of Genesis',
    type: 'quiz',
    difficulty: 'easy',
    category: 'old-testament',
    timeLimit: 300, // 5 minutes
    pointsPerCorrect: 10,
    pointsPerIncorrect: -2,
    minScore: 60,
    maxAttempts: 3,
    isUnlocked: true,
    rewards: [
      {
        type: 'points',
        value: 100,
        condition: 'completion',
        description: 'Complete the Genesis quiz'
      },
      {
        type: 'badge',
        value: 'genesis-scholar',
        condition: 'perfect-score',
        description: 'Perfect score on Genesis quiz'
      }
    ],
    questions: [
      {
        id: 'gen-1',
        question: 'How many days did God take to create the world?',
        type: 'multiple-choice',
        options: ['5 days', '6 days', '7 days', '8 days'],
        correctAnswer: '6 days',
        explanation: 'God created the world in 6 days and rested on the 7th day.',
        scriptureReference: 'Genesis 1:31-2:2',
        difficulty: 'easy',
        points: 10,
        hints: ['God rested on the 7th day', 'It was less than a week of work'],
        category: 'creation'
      },
      {
        id: 'gen-2',
        question: 'Who was the first man created by God?',
        type: 'multiple-choice',
        options: ['Abel', 'Cain', 'Adam', 'Seth'],
        correctAnswer: 'Adam',
        explanation: 'Adam was the first man, created from the dust of the ground.',
        scriptureReference: 'Genesis 2:7',
        difficulty: 'easy',
        points: 10,
        hints: ['His name means "man" or "mankind"', 'He was made from dust'],
        category: 'creation'
      },
      {
        id: 'gen-3',
        question: 'What was the name of the garden where Adam and Eve lived?',
        type: 'multiple-choice',
        options: ['Garden of Gethsemane', 'Garden of Eden', 'Garden of Paradise', 'Garden of Life'],
        correctAnswer: 'Garden of Eden',
        explanation: 'The Garden of Eden was the paradise where Adam and Eve first lived.',
        scriptureReference: 'Genesis 2:8',
        difficulty: 'easy',
        points: 10,
        hints: ['It means "delight" or "pleasure"', 'It was eastward'],
        category: 'creation'
      },
      {
        id: 'gen-4',
        question: 'Who built the ark to survive the great flood?',
        type: 'multiple-choice',
        options: ['Abraham', 'Moses', 'Noah', 'David'],
        correctAnswer: 'Noah',
        explanation: 'Noah was chosen by God to build the ark and save his family and the animals.',
        scriptureReference: 'Genesis 6:14',
        difficulty: 'easy',
        points: 10,
        hints: ['He was righteous in his generation', 'He had three sons'],
        category: 'flood'
      },
      {
        id: 'gen-5',
        question: 'How many of each clean animal did Noah take into the ark?',
        type: 'multiple-choice',
        options: ['Two', 'Seven pairs', 'One pair', 'Twelve'],
        correctAnswer: 'Seven pairs',
        explanation: 'Noah took seven pairs of every clean animal and one pair of unclean animals.',
        scriptureReference: 'Genesis 7:2',
        difficulty: 'medium',
        points: 15,
        hints: ['More than two', 'It was for sacrificial purposes'],
        category: 'flood'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'psalms-memory',
    name: 'Psalms Memory Challenge',
    description: 'Memorize and recall famous Psalm verses',
    type: 'memory',
    difficulty: 'medium',
    category: 'psalms',
    timeLimit: 240, // 4 minutes
    pointsPerCorrect: 15,
    pointsPerIncorrect: -3,
    minScore: 70,
    maxAttempts: 2,
    isUnlocked: true,
    rewards: [
      {
        type: 'points',
        value: 150,
        condition: 'completion',
        description: 'Complete the Psalms memory challenge'
      }
    ],
    questions: [
      {
        id: 'psalm-1',
        question: 'Complete this verse: "The Lord is my shepherd, I shall not..."',
        type: 'fill-blank',
        correctAnswer: 'want',
        explanation: 'This is from Psalm 23:1, one of the most beloved psalms.',
        scriptureReference: 'Psalm 23:1',
        difficulty: 'easy',
        points: 15,
        hints: ['It means to lack or need something'],
        category: 'shepherd-psalm'
      },
      {
        id: 'psalm-2',
        question: 'Which Psalm begins with "Blessed is the man who walks not in the counsel of the ungodly"?',
        type: 'multiple-choice',
        options: ['Psalm 1', 'Psalm 23', 'Psalm 91', 'Psalm 119'],
        correctAnswer: 'Psalm 1',
        explanation: 'Psalm 1 is about the blessed man who delights in God\'s law.',
        scriptureReference: 'Psalm 1:1',
        difficulty: 'medium',
        points: 15,
        hints: ['It\'s the very first psalm', 'It contrasts the righteous and wicked'],
        category: 'wisdom-psalm'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'new-testament-trivia',
    name: 'New Testament Trivia',
    description: 'Challenge yourself with New Testament facts and stories',
    type: 'trivia',
    difficulty: 'hard',
    category: 'new-testament',
    timeLimit: 600, // 10 minutes
    pointsPerCorrect: 20,
    pointsPerIncorrect: -5,
    minScore: 80,
    maxAttempts: 2,
    isUnlocked: false,
    prerequisiteGames: ['genesis-quiz'],
    rewards: [
      {
        type: 'points',
        value: 200,
        condition: 'completion',
        description: 'Complete the New Testament trivia'
      },
      {
        type: 'achievement',
        value: 'nt-scholar',
        condition: 'perfect-score',
        description: 'Perfect score on New Testament trivia'
      }
    ],
    questions: [
      {
        id: 'nt-1',
        question: 'How many apostles did Jesus choose?',
        type: 'multiple-choice',
        options: ['10', '11', '12', '13'],
        correctAnswer: '12',
        explanation: 'Jesus chose 12 apostles to be his closest disciples.',
        scriptureReference: 'Matthew 10:1-4',
        difficulty: 'easy',
        points: 20,
        hints: ['Same number as tribes of Israel', 'Judas was replaced later'],
        category: 'apostles'
      },
      {
        id: 'nt-2',
        question: 'In which city was Jesus born?',
        type: 'multiple-choice',
        options: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Capernaum'],
        correctAnswer: 'Bethlehem',
        explanation: 'Jesus was born in Bethlehem, the city of David.',
        scriptureReference: 'Matthew 2:1',
        difficulty: 'easy',
        points: 20,
        hints: ['City of David', 'Prophesied in Micah'],
        category: 'birth'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'proverbs-wisdom',
    name: 'Proverbs Wisdom Match',
    description: 'Match wise sayings with their meanings',
    type: 'matching',
    difficulty: 'medium',
    category: 'proverbs',
    timeLimit: 180, // 3 minutes
    pointsPerCorrect: 12,
    pointsPerIncorrect: -2,
    minScore: 65,
    isUnlocked: true,
    rewards: [
      {
        type: 'points',
        value: 120,
        condition: 'completion',
        description: 'Complete the Proverbs wisdom match'
      }
    ],
    questions: [
      {
        id: 'prov-1',
        question: 'Match: "Trust in the Lord with all your heart"',
        type: 'matching',
        options: ['Lean on your own understanding', 'And lean not on your own understanding', 'And he will make your paths straight', 'In all your ways acknowledge him'],
        correctAnswer: 'And lean not on your own understanding',
        explanation: 'This is the continuation of Proverbs 3:5.',
        scriptureReference: 'Proverbs 3:5',
        difficulty: 'medium',
        points: 12,
        hints: ['It\'s about not relying on yourself', 'Opposite of trusting in the Lord'],
        category: 'trust'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'biblical-math',
    name: 'Biblical Mathematics',
    description: 'Explore numbers and mathematics in the Bible',
    type: 'quiz',
    difficulty: 'medium',
    category: 'mathematics',
    timeLimit: 420, // 7 minutes
    pointsPerCorrect: 15,
    pointsPerIncorrect: -3,
    minScore: 70,
    maxAttempts: 3,
    isUnlocked: true,
    rewards: [
      {
        type: 'points',
        value: 180,
        condition: 'completion',
        description: 'Complete the Biblical Mathematics quiz'
      },
      {
        type: 'badge',
        value: 'math-scholar',
        condition: 'perfect-score',
        description: 'Perfect score on Biblical Mathematics'
      }
    ],
    questions: [
      {
        id: 'math-1',
        question: 'How many years did the Israelites wander in the wilderness?',
        type: 'multiple-choice',
        options: ['30 years', '40 years', '50 years', '60 years'],
        correctAnswer: '40 years',
        explanation: 'The Israelites wandered for 40 years due to their disobedience.',
        scriptureReference: 'Numbers 14:33-34',
        difficulty: 'easy',
        points: 15,
        hints: ['Same number of days it rained during the flood', 'A generation'],
        category: 'wilderness'
      },
      {
        id: 'math-2',
        question: 'If Jesus fed 5,000 men with 5 loaves and 2 fish, and there were also women and children, approximately how many people were fed?',
        type: 'multiple-choice',
        options: ['5,000', '10,000', '15,000', '20,000'],
        correctAnswer: '15,000',
        explanation: 'With women and children included, scholars estimate 15,000-20,000 people were fed.',
        scriptureReference: 'Matthew 14:21',
        difficulty: 'medium',
        points: 20,
        hints: ['Men were counted separately from families', 'Multiply by family size'],
        category: 'miracles'
      },
      {
        id: 'math-3',
        question: 'How many baskets of leftover fragments were collected after feeding the 5,000?',
        type: 'multiple-choice',
        options: ['7 baskets', '10 baskets', '12 baskets', '15 baskets'],
        correctAnswer: '12 baskets',
        explanation: 'Twelve baskets were filled with leftover fragments, one for each apostle.',
        scriptureReference: 'Matthew 14:20',
        difficulty: 'easy',
        points: 15,
        hints: ['Same number as the apostles', 'A dozen'],
        category: 'miracles'
      },
      {
        id: 'math-4',
        question: 'What percentage of his income did Abraham give to Melchizedek?',
        type: 'multiple-choice',
        options: ['5%', '10%', '15%', '20%'],
        correctAnswer: '10%',
        explanation: 'Abraham gave a tenth (tithe) of everything to Melchizedek.',
        scriptureReference: 'Genesis 14:20',
        difficulty: 'medium',
        points: 20,
        hints: ['This became the standard for tithing', 'One-tenth'],
        category: 'stewardship'
      },
      {
        id: 'math-5',
        question: 'How many times did Jesus say we should forgive someone who sins against us?',
        type: 'multiple-choice',
        options: ['7 times', '70 times', '77 times', '490 times'],
        correctAnswer: '490 times',
        explanation: 'Jesus said "seventy times seven" which equals 490, meaning unlimited forgiveness.',
        scriptureReference: 'Matthew 18:22',
        difficulty: 'hard',
        points: 25,
        hints: ['Seventy times seven', 'It means unlimited forgiveness'],
        category: 'forgiveness'
      },
      {
        id: 'math-6',
        question: 'If Solomon\'s temple was 60 cubits long, 20 cubits wide, and 30 cubits high, what was its volume in cubic cubits?',
        type: 'multiple-choice',
        options: ['36,000', '3,600', '360', '36'],
        correctAnswer: '36,000',
        explanation: 'Volume = length × width × height = 60 × 20 × 30 = 36,000 cubic cubits.',
        scriptureReference: '1 Kings 6:2',
        difficulty: 'hard',
        points: 25,
        hints: ['Multiply length × width × height', '60 × 20 × 30'],
        category: 'temple'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'biblical-science',
    name: 'Biblical Science & Nature',
    description: 'Discover scientific principles and natural phenomena in Scripture',
    type: 'quiz',
    difficulty: 'medium',
    category: 'science',
    timeLimit: 480, // 8 minutes
    pointsPerCorrect: 18,
    pointsPerIncorrect: -4,
    minScore: 75,
    maxAttempts: 3,
    isUnlocked: true,
    rewards: [
      {
        type: 'points',
        value: 200,
        condition: 'completion',
        description: 'Complete the Biblical Science quiz'
      },
      {
        type: 'badge',
        value: 'science-explorer',
        condition: 'high-score',
        description: 'Score above 90% on Biblical Science'
      }
    ],
    questions: [
      {
        id: 'sci-1',
        question: 'According to Genesis, what did God create on the fourth day that helps determine seasons and time?',
        type: 'multiple-choice',
        options: ['Plants and trees', 'Sun, moon, and stars', 'Land and sea', 'Birds and fish'],
        correctAnswer: 'Sun, moon, and stars',
        explanation: 'God created the sun, moon, and stars to separate day from night and mark seasons.',
        scriptureReference: 'Genesis 1:14-19',
        difficulty: 'easy',
        points: 18,
        hints: ['They mark seasons and times', 'Celestial bodies'],
        category: 'creation'
      },
      {
        id: 'sci-2',
        question: 'What natural phenomenon did God use to part the Red Sea for the Israelites?',
        type: 'multiple-choice',
        options: ['Earthquake', 'Strong east wind', 'Lightning', 'Tsunami'],
        correctAnswer: 'Strong east wind',
        explanation: 'God used a strong east wind all night to part the waters.',
        scriptureReference: 'Exodus 14:21',
        difficulty: 'medium',
        points: 22,
        hints: ['It blew all night', 'Came from the east'],
        category: 'miracles'
      },
      {
        id: 'sci-3',
        question: 'Which book of the Bible describes the water cycle: "All streams flow into the sea, yet the sea is never full"?',
        type: 'multiple-choice',
        options: ['Psalms', 'Proverbs', 'Ecclesiastes', 'Job'],
        correctAnswer: 'Ecclesiastes',
        explanation: 'Ecclesiastes 1:7 describes the continuous cycle of water from streams to sea to evaporation.',
        scriptureReference: 'Ecclesiastes 1:7',
        difficulty: 'hard',
        points: 25,
        hints: ['Written by Solomon', 'Book about the meaning of life'],
        category: 'wisdom'
      },
      {
        id: 'sci-4',
        question: 'What did Jesus use to demonstrate principles of growth and multiplication in nature?',
        type: 'multiple-choice',
        options: ['Rocks and minerals', 'Seeds and plants', 'Stars and planets', 'Rivers and oceans'],
        correctAnswer: 'Seeds and plants',
        explanation: 'Jesus frequently used parables about seeds, plants, and agricultural principles.',
        scriptureReference: 'Matthew 13:1-23',
        difficulty: 'easy',
        points: 18,
        hints: ['Parable of the sower', 'Agricultural examples'],
        category: 'parables'
      },
      {
        id: 'sci-5',
        question: 'According to Job, God "hangs the earth on nothing." What scientific principle does this reflect?',
        type: 'multiple-choice',
        options: ['Gravity', 'Magnetism', 'Orbital mechanics', 'Atmospheric pressure'],
        correctAnswer: 'Orbital mechanics',
        explanation: 'This ancient text describes Earth suspended in space, supported by gravitational forces.',
        scriptureReference: 'Job 26:7',
        difficulty: 'hard',
        points: 25,
        hints: ['Earth floating in space', 'No physical support needed'],
        category: 'cosmology'
      },
      {
        id: 'sci-6',
        question: 'What biological process is referenced when Jesus said "unless a grain of wheat falls and dies, it remains alone"?',
        type: 'multiple-choice',
        options: ['Photosynthesis', 'Germination', 'Pollination', 'Decomposition'],
        correctAnswer: 'Germination',
        explanation: 'Jesus described how a seed must "die" (break down) to germinate and produce new life.',
        scriptureReference: 'John 12:24',
        difficulty: 'medium',
        points: 22,
        hints: ['Seed breaking down to grow', 'New life from apparent death'],
        category: 'life-principles'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'biblical-leadership',
    name: 'Biblical Leadership Principles',
    description: 'Learn leadership lessons from biblical figures and teachings',
    type: 'quiz',
    difficulty: 'hard',
    category: 'leadership',
    timeLimit: 540, // 9 minutes
    pointsPerCorrect: 20,
    pointsPerIncorrect: -5,
    minScore: 80,
    maxAttempts: 2,
    isUnlocked: true,
    rewards: [
      {
        type: 'points',
        value: 250,
        condition: 'completion',
        description: 'Complete the Biblical Leadership quiz'
      },
      {
        type: 'achievement',
        value: 'leadership-scholar',
        condition: 'perfect-score',
        description: 'Perfect score on Biblical Leadership'
      }
    ],
    questions: [
      {
        id: 'lead-1',
        question: 'What leadership principle did Jesus demonstrate when He washed His disciples\' feet?',
        type: 'multiple-choice',
        options: ['Authoritative command', 'Servant leadership', 'Delegation of tasks', 'Leading by example'],
        correctAnswer: 'Servant leadership',
        explanation: 'Jesus demonstrated that true leadership involves serving others, not being served.',
        scriptureReference: 'John 13:1-17',
        difficulty: 'medium',
        points: 20,
        hints: ['Opposite of being served', 'Humility in action'],
        category: 'service'
      },
      {
        id: 'lead-2',
        question: 'When Moses felt overwhelmed leading the Israelites, what leadership solution did Jethro suggest?',
        type: 'multiple-choice',
        options: ['Pray more', 'Delegate responsibilities', 'Work harder', 'Find a replacement'],
        correctAnswer: 'Delegate responsibilities',
        explanation: 'Jethro advised Moses to appoint capable leaders over groups of people to share the workload.',
        scriptureReference: 'Exodus 18:17-23',
        difficulty: 'medium',
        points: 20,
        hints: ['Share the workload', 'Appoint other leaders'],
        category: 'delegation'
      },
      {
        id: 'lead-3',
        question: 'What was King David\'s response when confronted about his sin with Bathsheba?',
        type: 'multiple-choice',
        options: ['Denied the accusation', 'Blamed others', 'Acknowledged and repented', 'Ignored the prophet'],
        correctAnswer: 'Acknowledged and repented',
        explanation: 'David immediately acknowledged his sin and repented when confronted by Nathan.',
        scriptureReference: '2 Samuel 12:13',
        difficulty: 'medium',
        points: 20,
        hints: ['He took responsibility', 'Showed genuine remorse'],
        category: 'accountability'
      },
      {
        id: 'lead-4',
        question: 'According to Proverbs, what happens when there is no vision among the people?',
        type: 'multiple-choice',
        options: ['They become wealthy', 'They perish', 'They multiply', 'They become wise'],
        correctAnswer: 'They perish',
        explanation: '"Where there is no vision, the people perish" - leadership requires clear direction.',
        scriptureReference: 'Proverbs 29:18',
        difficulty: 'easy',
        points: 20,
        hints: ['Without direction, people suffer', 'Vision is essential'],
        category: 'vision'
      },
      {
        id: 'lead-5',
        question: 'What leadership quality did Nehemiah demonstrate when rebuilding Jerusalem\'s walls?',
        type: 'multiple-choice',
        options: ['Micromanagement', 'Strategic planning', 'Avoiding conflict', 'Working alone'],
        correctAnswer: 'Strategic planning',
        explanation: 'Nehemiah carefully planned, organized teams, and overcame opposition through strategic leadership.',
        scriptureReference: 'Nehemiah 2-6',
        difficulty: 'hard',
        points: 25,
        hints: ['He organized and planned carefully', 'Overcame opposition systematically'],
        category: 'planning'
      },
      {
        id: 'lead-6',
        question: 'What did Jesus say about leadership and greatness in His kingdom?',
        type: 'multiple-choice',
        options: ['The greatest should rule over others', 'The greatest should be the servant of all', 'The greatest should accumulate wealth', 'The greatest should seek recognition'],
        correctAnswer: 'The greatest should be the servant of all',
        explanation: 'Jesus taught that true greatness comes through serving others, not ruling over them.',
        scriptureReference: 'Mark 10:43-44',
        difficulty: 'easy',
        points: 20,
        hints: ['Opposite of worldly leadership', 'Serving rather than being served'],
        category: 'kingdom-principles'
      },
      {
        id: 'lead-7',
        question: 'How did Joshua prepare the Israelites before crossing the Jordan River?',
        type: 'multiple-choice',
        options: ['Built boats', 'Consecrated themselves', 'Waited for summer', 'Sent spies only'],
        correctAnswer: 'Consecrated themselves',
        explanation: 'Joshua told the people to consecrate themselves because God would do wonders among them.',
        scriptureReference: 'Joshua 3:5',
        difficulty: 'hard',
        points: 25,
        hints: ['Spiritual preparation', 'Getting ready for God\'s work'],
        category: 'preparation'
      },
      {
        id: 'lead-8',
        question: 'What leadership principle is demonstrated in Paul\'s approach to training Timothy?',
        type: 'multiple-choice',
        options: ['Harsh criticism', 'Mentorship and encouragement', 'Competition', 'Independence'],
        correctAnswer: 'Mentorship and encouragement',
        explanation: 'Paul mentored Timothy with love, encouragement, and practical guidance for ministry.',
        scriptureReference: '1 Timothy 1:2, 2 Timothy 1:6',
        difficulty: 'medium',
        points: 20,
        hints: ['Father-son relationship', 'Developing the next generation'],
        category: 'mentorship'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const mockGameStats: BibleGameStats = {
  userId: 'current-user',
  totalGamesPlayed: 15,
  totalScore: 1250,
  averageScore: 83.3,
  perfectGames: 3,
  currentStreak: 5,
  longestStreak: 8,
  favoriteCategory: 'old-testament',
  totalTimeSpent: 120, // 2 hours
  achievementsEarned: 7,
  badgesEarned: 4,
  difficulty: {
    easy: { played: 8, won: 7, avgScore: 88.5 },
    medium: { played: 5, won: 4, avgScore: 76.2 },
    hard: { played: 2, won: 1, avgScore: 65.0 },
    expert: { played: 0, won: 0, avgScore: 0 }
  },
  categoryStats: {
    'old-testament': { played: 6, won: 5, avgScore: 85.0, bestScore: 95 },
    'new-testament': { played: 4, won: 3, avgScore: 78.5, bestScore: 88 },
    'psalms': { played: 3, won: 3, avgScore: 90.0, bestScore: 100 },
    'proverbs': { played: 2, won: 2, avgScore: 82.5, bestScore: 87 },
    'mathematics': { played: 1, won: 1, avgScore: 88.0, bestScore: 88 },
    'science': { played: 1, won: 0, avgScore: 72.0, bestScore: 72 },
    'leadership': { played: 1, won: 1, avgScore: 92.0, bestScore: 92 }
  },
  weeklyProgress: [
    { week: '2024-W01', gamesPlayed: 3, score: 245, achievements: 1 },
    { week: '2024-W02', gamesPlayed: 4, score: 320, achievements: 2 },
    { week: '2024-W03', gamesPlayed: 2, score: 165, achievements: 0 },
    { week: '2024-W04', gamesPlayed: 6, score: 520, achievements: 4 }
  ]
};

export const mockLeaderboard: BibleGameLeaderboard = {
  period: 'weekly',
  category: 'all',
  entries: [
    {
      rank: 1,
      userId: 'user-1',
      userName: 'David Scripture',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      score: 1450,
      gamesPlayed: 12,
      averageScore: 90.8,
      badges: ['genesis-scholar', 'psalm-master', 'nt-expert']
    },
    {
      rank: 2,
      userId: 'current-user',
      userName: 'You',
      score: 1250,
      gamesPlayed: 15,
      averageScore: 83.3,
      badges: ['genesis-scholar', 'psalm-master'],
      isCurrentUser: true
    },
    {
      rank: 3,
      userId: 'user-3',
      userName: 'Sarah Wisdom',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      score: 1180,
      gamesPlayed: 10,
      averageScore: 88.2,
      badges: ['proverbs-sage', 'memory-champion']
    },
    {
      rank: 4,
      userId: 'user-4',
      userName: 'John Knowledge',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      score: 1050,
      gamesPlayed: 8,
      averageScore: 87.5,
      badges: ['trivia-master']
    },
    {
      rank: 5,
      userId: 'user-5',
      userName: 'Mary Faith',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      score: 980,
      gamesPlayed: 14,
      averageScore: 70.0,
      badges: ['consistent-player']
    }
  ],
  lastUpdated: new Date().toISOString()
};

// Bible Game Achievements
export const bibleGameAchievements = [
  {
    id: 'first_game',
    title: 'First Steps',
    description: 'Complete your first Bible game',
    icon: '🎯',
    category: 'bible-game' as const,
    requirement: 1,
    progress: 0,
  },
  {
    id: 'perfect_score',
    title: 'Perfect Scholar',
    description: 'Get a perfect score on any game',
    icon: '💯',
    category: 'bible-game' as const,
    requirement: 1,
    progress: 0,
  },
  {
    id: 'game_streak_5',
    title: 'Consistent Learner',
    description: 'Win 5 games in a row',
    icon: '🔥',
    category: 'bible-game' as const,
    requirement: 5,
    progress: 0,
  },
  {
    id: 'ot_master',
    title: 'Old Testament Master',
    description: 'Complete all Old Testament games',
    icon: '📜',
    category: 'bible-game' as const,
    requirement: 10,
    progress: 0,
  },
  {
    id: 'nt_scholar',
    title: 'New Testament Scholar',
    description: 'Complete all New Testament games',
    icon: '✝️',
    category: 'bible-game' as const,
    requirement: 8,
    progress: 0,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a game in under 2 minutes',
    icon: '⚡',
    category: 'bible-game' as const,
    requirement: 1,
    progress: 0,
  },
  {
    id: 'wisdom_seeker',
    title: 'Wisdom Seeker',
    description: 'Complete 25 Bible games',
    icon: '🦉',
    category: 'bible-game' as const,
    requirement: 25,
    progress: 0,
  },
  {
    id: 'leaderboard_top3',
    title: 'Top Performer',
    description: 'Reach top 3 on the leaderboard',
    icon: '🏆',
    category: 'bible-game' as const,
    requirement: 1,
    progress: 0,
  }
];