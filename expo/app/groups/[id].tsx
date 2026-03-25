import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Send, Users, Settings, Heart, Reply, MoreVertical, Pin, Smile, Image, Mic, Phone, Video } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import BottomNavigation from '@/components/BottomNavigation';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'prayer' | 'announcement';
  reactions: { emoji: string; count: number; users: string[] }[];
  isReply?: boolean;
  replyTo?: string;
  isPinned?: boolean;
}

interface GroupInfo {
  id: string;
  title: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  category: string;
  creator: string;
  isAdmin: boolean;
  isModerator: boolean;
}

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plan, isLoggedIn, user } = useUserStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const hasGroupAccess = plan && ['org_small', 'org_medium', 'org_large'].includes(plan);

  // Mock group info based on ID
  const getGroupInfo = (groupId: string): GroupInfo => {
    const groups = {
      '1': {
        title: 'Daily Prayer Circle',
        description: 'Start your day with prayer requests, testimonies, and spiritual encouragement',
        memberCount: 127,
        category: 'prayer',
        creator: 'Pastor John Williams',
      },
      '2': {
        title: 'Young Adults Bible Study',
        description: 'Exploring faith, life questions, and Scripture together',
        memberCount: 43,
        category: 'youth',
        creator: 'Sarah Martinez',
      },
      '3': {
        title: 'Worship Team Hub',
        description: 'Coordination and spiritual preparation for worship leaders',
        memberCount: 18,
        category: 'worship',
        creator: 'David Chen',
      },
      '4': {
        title: 'Marriage & Family Life',
        description: 'Supporting each other through parenting and marriage growth',
        memberCount: 89,
        category: 'fellowship',
        creator: 'Pastor Mike & Linda Thompson',
      },
      '5': {
        title: 'Romans Study Group',
        description: 'Chapter-by-chapter study with theological discussions',
        memberCount: 56,
        category: 'bible-study',
        creator: 'Dr. Elizabeth Harper',
      },
      '6': {
        title: 'College & Career',
        description: 'Navigating faith in college, career decisions, and building Christian community',
        memberCount: 34,
        category: 'youth',
        creator: 'Josh Rodriguez',
      },
      '7': {
        title: 'Women\'s Ministry Circle',
        description: 'Encouraging women in their walk with God through Bible study and sisterhood',
        memberCount: 72,
        category: 'fellowship',
        creator: 'Rebecca Johnson',
      },
      '8': {
        title: 'Men\'s Accountability',
        description: 'Iron sharpens iron - supporting men in spiritual growth and integrity',
        memberCount: 41,
        category: 'fellowship',
        creator: 'Mark Stevens',
      },
      '9': {
        title: 'Missions & Outreach',
        description: 'Coordinating local and global missions and community service',
        memberCount: 38,
        category: 'fellowship',
        creator: 'Maria Gonzalez',
      },
      '10': {
        title: 'New Members Welcome',
        description: 'A warm space for newcomers to ask questions and get connected',
        memberCount: 23,
        category: 'fellowship',
        creator: 'Pastor John Williams',
      },
    };

    const group = groups[groupId as keyof typeof groups] || groups['1'];
    return {
      id: groupId || '1',
      ...group,
      isPrivate: groupId === '3' || groupId === '8',
      isAdmin: user?.email === 'admin@church.com',
      isModerator: user?.email === 'moderator@church.com',
    };
  };

  const groupInfo = getGroupInfo(id || '1');

  // Mock messages based on group type
  const getGroupMessages = (groupId: string): Message[] => {
    const messagesByGroup = {
      '1': [ // Daily Prayer Circle
        {
          id: '1',
          userId: 'pastor-john',
          userName: 'Pastor John Williams',
          content: 'Good morning, prayer warriors! Let\'s lift each other up in prayer today. 🙏',
          timestamp: '7:30 AM',
          type: 'text' as const,
          reactions: [{ emoji: '🙏', count: 18, users: ['user1', 'user2'] }],
          isPinned: true,
        },
        {
          id: '2',
          userId: 'sarah-m',
          userName: 'Sarah Martinez',
          content: 'Please pray for my grandmother who is having surgery today. She\'s 87 and we\'re trusting God for healing.',
          timestamp: '8:15 AM',
          type: 'prayer' as const,
          reactions: [
            { emoji: '🙏', count: 24, users: ['user1', 'user2'] },
            { emoji: '❤️', count: 12, users: ['user3', 'user4'] }
          ],
        },
        {
          id: '3',
          userId: 'david-c',
          userName: 'David Chen',
          content: 'Praying for your grandmother, Sarah. The Great Physician is with her! 💙',
          timestamp: '8:18 AM',
          type: 'text' as const,
          reactions: [{ emoji: '❤️', count: 8, users: ['user1'] }],
          isReply: true,
          replyTo: '2',
        },
        {
          id: '4',
          userId: 'maria-g',
          userName: 'Maria Gonzalez',
          content: 'Praise report! My son got accepted into the college program he wanted. God is faithful! 🎉',
          timestamp: '9:45 AM',
          type: 'text' as const,
          reactions: [
            { emoji: '🎉', count: 22, users: ['user1', 'user2'] },
            { emoji: '🙌', count: 15, users: ['user3'] }
          ],
        },
        {
          id: '5',
          userId: 'admin',
          userName: 'Church Admin',
          content: '📢 Prayer meeting tonight at 7 PM. We\'ll be praying for our missionaries and community outreach.',
          timestamp: '10:30 AM',
          type: 'announcement' as const,
          reactions: [{ emoji: '✅', count: 8, users: ['user1'] }],
        },
      ],
      '2': [ // Young Adults Bible Study
        {
          id: '1',
          userId: 'sarah-m',
          userName: 'Sarah Martinez',
          content: 'Hey everyone! Tonight we\'re diving into John 15 - the vine and branches. Come with questions! 🍇',
          timestamp: '2:00 PM',
          type: 'text' as const,
          reactions: [{ emoji: '📖', count: 12, users: ['user1', 'user2'] }],
          isPinned: true,
        },
        {
          id: '2',
          userId: 'josh-r',
          userName: 'Josh Rodriguez',
          content: 'I\'ve been struggling with what it means to "abide" in Christ. Looking forward to tonight\'s discussion!',
          timestamp: '3:30 PM',
          type: 'text' as const,
          reactions: [{ emoji: '🤔', count: 6, users: ['user1', 'user2'] }],
        },
        {
          id: '3',
          userId: 'emma-w',
          userName: 'Emma Wilson',
          content: 'Same here Josh! I think it\'s about staying connected through prayer and His Word, but I want to understand it deeper.',
          timestamp: '3:45 PM',
          type: 'text' as const,
          reactions: [{ emoji: '💭', count: 4, users: ['user3', 'user4'] }],
          isReply: true,
          replyTo: '2',
        },
        {
          id: '4',
          userId: 'alex-k',
          userName: 'Alex Kim',
          content: 'Can someone bring extra Bibles tonight? I forgot mine at home and my phone battery is dying 😅',
          timestamp: '5:15 PM',
          type: 'text' as const,
          reactions: [{ emoji: '😂', count: 8, users: ['user1', 'user2'] }],
        },
        {
          id: '5',
          userId: 'sarah-m',
          userName: 'Sarah Martinez',
          content: 'I\'ll bring extras Alex! See you all at 7 PM in room 204. Can\'t wait to see what God teaches us tonight! 🙏',
          timestamp: '5:30 PM',
          type: 'text' as const,
          reactions: [{ emoji: '🙏', count: 10, users: ['user3'] }],
        },
      ],
      '3': [ // Worship Team Hub
        {
          id: '1',
          userId: 'david-c',
          userName: 'David Chen',
          content: 'Team meeting Sunday at 8 AM. We\'ll run through the new song "Goodness of God" before service.',
          timestamp: '6:00 PM',
          type: 'text' as const,
          reactions: [{ emoji: '🎵', count: 8, users: ['user1', 'user2'] }],
          isPinned: true,
        },
        {
          id: '2',
          userId: 'lisa-p',
          userName: 'Lisa Park',
          content: 'I\'ve been practicing the bridge section. The key change is tricky but I think I\'ve got it down!',
          timestamp: '6:15 PM',
          type: 'text' as const,
          reactions: [{ emoji: '🎹', count: 5, users: ['user1', 'user2'] }],
        },
        {
          id: '3',
          userId: 'mike-t',
          userName: 'Mike Thompson',
          content: 'Can we go over the drum pattern for the chorus one more time? I want to make sure I\'m not overplaying it.',
          timestamp: '6:30 PM',
          type: 'text' as const,
          reactions: [{ emoji: '🥁', count: 3, users: ['user3', 'user4'] }],
        },
        {
          id: '4',
          userId: 'david-c',
          userName: 'David Chen',
          content: 'Absolutely Mike! Let\'s spend extra time on that. Remember, we\'re leading people into worship, not performing.',
          timestamp: '6:35 PM',
          type: 'text' as const,
          reactions: [{ emoji: '🙏', count: 12, users: ['user1', 'user2'] }],
          isReply: true,
          replyTo: '3',
        },
        {
          id: '5',
          userId: 'anna-s',
          userName: 'Anna Smith',
          content: 'I love how this song declares God\'s faithfulness. Let\'s pray before we practice that our hearts are prepared to lead others.',
          timestamp: '7:00 PM',
          type: 'text' as const,
          reactions: [{ emoji: '❤️', count: 9, users: ['user3'] }],
        },
      ],
      '4': [ // Marriage & Family Life
        {
          id: '1',
          userId: 'pastor-mike',
          userName: 'Pastor Mike Thompson',
          content: 'Great discussion last week on communication in marriage. This week: "Training Children in the Way They Should Go"',
          timestamp: '10:00 AM',
          type: 'text' as const,
          reactions: [{ emoji: '👨‍👩‍👧‍👦', count: 15, users: ['user1', 'user2'] }],
          isPinned: true,
        },
        {
          id: '2',
          userId: 'jennifer-l',
          userName: 'Jennifer Lopez',
          content: 'My 4-year-old has been having meltdowns lately. Any advice on discipline with love?',
          timestamp: '11:30 AM',
          type: 'text' as const,
          reactions: [{ emoji: '🤗', count: 8, users: ['user1', 'user2'] }],
        },
        {
          id: '3',
          userId: 'robert-w',
          userName: 'Robert Wilson',
          content: 'We went through the same thing Jennifer. Consistency and patience were key. Also lots of prayer! 😊',
          timestamp: '11:45 AM',
          type: 'text' as const,
          reactions: [{ emoji: '🙏', count: 6, users: ['user3', 'user4'] }],
          isReply: true,
          replyTo: '2',
        },
        {
          id: '4',
          userId: 'linda-t',
          userName: 'Linda Thompson',
          content: 'Remember that discipline is about teaching, not punishment. We\'re shaping their hearts, not just their behavior.',
          timestamp: '12:15 PM',
          type: 'text' as const,
          reactions: [{ emoji: '💝', count: 12, users: ['user1', 'user2'] }],
        },
        {
          id: '5',
          userId: 'carlos-m',
          userName: 'Carlos Martinez',
          content: 'My wife and I have been doing family devotions with our kids. It\'s amazing how God speaks through them!',
          timestamp: '1:30 PM',
          type: 'text' as const,
          reactions: [
            { emoji: '🙌', count: 18, users: ['user1', 'user2'] },
            { emoji: '📖', count: 7, users: ['user3'] }
          ],
        },
      ],
      '5': [ // Romans Study Group
        {
          id: '1',
          userId: 'dr-elizabeth',
          userName: 'Dr. Elizabeth Harper',
          content: 'Today we\'re examining Romans 8:28-30. How does God\'s sovereignty work with human responsibility?',
          timestamp: '7:00 PM',
          type: 'text' as const,
          reactions: [{ emoji: '🤔', count: 14, users: ['user1', 'user2'] }],
          isPinned: true,
        },
        {
          id: '2',
          userId: 'thomas-b',
          userName: 'Thomas Brown',
          content: 'This passage has always challenged me. If God predestines, do our choices really matter?',
          timestamp: '7:15 PM',
          type: 'text' as const,
          reactions: [{ emoji: '💭', count: 9, users: ['user1', 'user2'] }],
        },
        {
          id: '3',
          userId: 'rachel-d',
          userName: 'Rachel Davis',
          content: 'I think Paul is showing us that God\'s plan doesn\'t negate our responsibility to respond to His call.',
          timestamp: '7:30 PM',
          type: 'text' as const,
          reactions: [{ emoji: '✨', count: 7, users: ['user3', 'user4'] }],
          isReply: true,
          replyTo: '2',
        },
        {
          id: '4',
          userId: 'dr-elizabeth',
          userName: 'Dr. Elizabeth Harper',
          content: 'Excellent insight Rachel! The Greek word "proginōskō" suggests intimate foreknowledge, not just intellectual awareness.',
          timestamp: '7:45 PM',
          type: 'text' as const,
          reactions: [{ emoji: '📚', count: 11, users: ['user1', 'user2'] }],
        },
        {
          id: '5',
          userId: 'mark-s',
          userName: 'Mark Stevens',
          content: 'This gives me such comfort knowing that God works ALL things together for good for those who love Him.',
          timestamp: '8:00 PM',
          type: 'text' as const,
          reactions: [
            { emoji: '🙏', count: 16, users: ['user1', 'user2'] },
            { emoji: '❤️', count: 8, users: ['user3'] }
          ],
        },
      ],
      '6': [ // College & Career
        {
          id: '1',
          userId: 'josh-r',
          userName: 'Josh Rodriguez',
          content: 'Hey everyone! Let\'s talk about balancing faith and career ambitions. How do you stay grounded in Christ during job interviews?',
          timestamp: '9:00 AM',
          type: 'text' as const,
          reactions: [{ emoji: '💼', count: 8, users: ['user1', 'user2'] }],
          isPinned: true,
        },
        {
          id: '2',
          userId: 'emma-w',
          userName: 'Emma Wilson',
          content: 'I just graduated and starting my first job next week! Nervous but excited. Prayers appreciated! 🎓',
          timestamp: '10:30 AM',
          type: 'text' as const,
          reactions: [
            { emoji: '🙏', count: 12, users: ['user1', 'user2'] },
            { emoji: '🎉', count: 8, users: ['user3', 'user4'] }
          ],
        },
        {
          id: '3',
          userId: 'alex-k',
          userName: 'Alex Kim',
          content: 'Congrats Emma! Remember Jeremiah 29:11 - God has plans for your future. You\'ve got this! 💪',
          timestamp: '10:45 AM',
          type: 'text' as const,
          reactions: [{ emoji: '❤️', count: 6, users: ['user1', 'user2'] }],
          isReply: true,
          replyTo: '2',
        },
        {
          id: '4',
          userId: 'sarah-j',
          userName: 'Sarah Johnson',
          content: 'Anyone else struggling with work-life balance? I feel like I\'m always either working or sleeping 😴',
          timestamp: '2:15 PM',
          type: 'text' as const,
          reactions: [{ emoji: '😅', count: 10, users: ['user1', 'user2'] }],
        },
        {
          id: '5',
          userId: 'mike-d',
          userName: 'Mike Davis',
          content: 'Sarah, I feel you! I started doing morning devotions before work. Game changer for my perspective and energy.',
          timestamp: '2:30 PM',
          type: 'text' as const,
          reactions: [{ emoji: '🌅', count: 7, users: ['user3'] }],
          isReply: true,
          replyTo: '4',
        },
      ],
      '7': [ // Women's Ministry Circle
        {
          id: '1',
          userId: 'rebecca-j',
          userName: 'Rebecca Johnson',
          content: 'Good morning, beautiful sisters! Today\'s devotion: "She is clothed with strength and dignity" - Proverbs 31:25 💪✨',
          timestamp: '7:00 AM',
          type: 'text' as const,
          reactions: [{ emoji: '👑', count: 18, users: ['user1', 'user2'] }],
          isPinned: true,
        },
        {
          id: '2',
          userId: 'maria-g',
          userName: 'Maria Gonzalez',
          content: 'I needed this reminder today! Sometimes I forget how God sees me - as His beloved daughter.',
          timestamp: '8:30 AM',
          type: 'text' as const,
          reactions: [{ emoji: '💕', count: 14, users: ['user1', 'user2'] }],
        },
        {
          id: '3',
          userId: 'jennifer-l',
          userName: 'Jennifer Lopez',
          content: 'Ladies, can we pray for my friend going through a difficult divorce? She needs God\'s peace and wisdom.',
          timestamp: '11:00 AM',
          type: 'prayer' as const,
          reactions: [
            { emoji: '🙏', count: 22, users: ['user1', 'user2'] },
            { emoji: '💝', count: 8, users: ['user3', 'user4'] }
          ],
        },
        {
          id: '4',
          userId: 'anna-s',
          userName: 'Anna Smith',
          content: 'Absolutely praying Jennifer. God is close to the brokenhearted. Sending love to your friend! 🤗',
          timestamp: '11:15 AM',
          type: 'text' as const,
          reactions: [{ emoji: '❤️', count: 12, users: ['user1', 'user2'] }],
          isReply: true,
          replyTo: '3',
        },
        {
          id: '5',
          userId: 'lisa-p',
          userName: 'Lisa Park',
          content: 'Reminder: Women\'s retreat registration closes Friday! Theme: "Renewed in His Love" 🌸',
          timestamp: '3:00 PM',
          type: 'announcement' as const,
          reactions: [{ emoji: '🌸', count: 16, users: ['user1', 'user2'] }],
        },
      ],
      '8': [ // Men's Accountability
        {
          id: '1',
          userId: 'mark-s',
          userName: 'Mark Stevens',
          content: 'Brothers, let\'s check in. How are we doing with our commitments from last week? Iron sharpens iron. 🔥',
          timestamp: '6:00 AM',
          type: 'text' as const,
          reactions: [{ emoji: '💪', count: 12, users: ['user1', 'user2'] }],
          isPinned: true,
        },
        {
          id: '2',
          userId: 'robert-w',
          userName: 'Robert Wilson',
          content: 'I struggled with anger this week. Had a moment with my kids but caught myself and apologized. Growth is messy.',
          timestamp: '6:30 AM',
          type: 'text' as const,
          reactions: [{ emoji: '🙏', count: 8, users: ['user1', 'user2'] }],
        },
        {
          id: '3',
          userId: 'carlos-m',
          userName: 'Carlos Martinez',
          content: 'Thanks for sharing Robert. That takes courage. Praying for patience and wisdom in your parenting journey.',
          timestamp: '6:45 AM',
          type: 'text' as const,
          reactions: [{ emoji: '🤝', count: 6, users: ['user3', 'user4'] }],
          isReply: true,
          replyTo: '2',
        },
        {
          id: '4',
          userId: 'thomas-b',
          userName: 'Thomas Brown',
          content: 'Challenge for this week: Random act of service for our wives. No expecting anything in return. Who\'s in?',
          timestamp: '7:15 AM',
          type: 'text' as const,
          reactions: [
            { emoji: '💍', count: 15, users: ['user1', 'user2'] },
            { emoji: '✋', count: 10, users: ['user3'] }
          ],
        },
        {
          id: '5',
          userId: 'david-c',
          userName: 'David Chen',
          content: 'Count me in Thomas! Leadership starts at home. Let\'s be the husbands and fathers God calls us to be.',
          timestamp: '7:30 AM',
          type: 'text' as const,
          reactions: [{ emoji: '👨‍👩‍👧‍👦', count: 11, users: ['user1', 'user2'] }],
        },
      ],
      '9': [ // Missions & Outreach
        {
          id: '1',
          userId: 'maria-g',
          userName: 'Maria Gonzalez',
          content: 'Update from our food bank ministry: We served 150 families this month! God is moving through your generosity! 🍞',
          timestamp: '10:00 AM',
          type: 'text' as const,
          reactions: [{ emoji: '🙌', count: 20, users: ['user1', 'user2'] }],
          isPinned: true,
        },
        {
          id: '2',
          userId: 'pastor-john',
          userName: 'Pastor John Williams',
          content: 'Praise God! This is the heart of the Gospel in action. "Faith without works is dead" - James 2:26',
          timestamp: '10:30 AM',
          type: 'text' as const,
          reactions: [{ emoji: '📖', count: 12, users: ['user1', 'user2'] }],
        },
        {
          id: '3',
          userId: 'anna-s',
          userName: 'Anna Smith',
          content: 'Volunteers needed for Saturday\'s community cleanup! Meet at the church at 8 AM. Bring gloves and water! 🧤',
          timestamp: '1:00 PM',
          type: 'announcement' as const,
          reactions: [{ emoji: '🌍', count: 14, users: ['user1', 'user2'] }],
        },
        {
          id: '4',
          userId: 'josh-r',
          userName: 'Josh Rodriguez',
          content: 'I\'ll be there Anna! Also, our college group wants to adopt a local school. Any suggestions?',
          timestamp: '1:15 PM',
          type: 'text' as const,
          reactions: [{ emoji: '🎒', count: 8, users: ['user3', 'user4'] }],
        },
        {
          id: '5',
          userId: 'rebecca-j',
          userName: 'Rebecca Johnson',
          content: 'Josh, Lincoln Elementary could use help with their after-school program. I have contacts there!',
          timestamp: '2:00 PM',
          type: 'text' as const,
          reactions: [{ emoji: '🏫', count: 10, users: ['user1', 'user2'] }],
          isReply: true,
          replyTo: '4',
        },
      ],
      '10': [ // New Members Welcome
        {
          id: '1',
          userId: 'pastor-john',
          userName: 'Pastor John Williams',
          content: 'Welcome to our church family! This is a safe space to ask questions and get connected. We\'re so glad you\'re here! 🏠',
          timestamp: '9:00 AM',
          type: 'text' as const,
          reactions: [{ emoji: '🤗', count: 15, users: ['user1', 'user2'] }],
          isPinned: true,
        },
        {
          id: '2',
          userId: 'new-member-1',
          userName: 'Jessica Taylor',
          content: 'Hi everyone! Just moved to town and visited last Sunday. Everyone was so welcoming! When are small groups?',
          timestamp: '11:00 AM',
          type: 'text' as const,
          reactions: [{ emoji: '👋', count: 12, users: ['user1', 'user2'] }],
        },
        {
          id: '3',
          userId: 'sarah-m',
          userName: 'Sarah Martinez',
          content: 'Hi Jessica! Small groups start Wednesday evenings at 7 PM. I\'ll send you the details. So excited to have you!',
          timestamp: '11:15 AM',
          type: 'text' as const,
          reactions: [{ emoji: '💕', count: 8, users: ['user3', 'user4'] }],
          isReply: true,
          replyTo: '2',
        },
        {
          id: '4',
          userId: 'new-member-2',
          userName: 'Michael Chen',
          content: 'Quick question - is there a dress code for Sunday service? I want to be respectful but not sure what\'s expected.',
          timestamp: '2:30 PM',
          type: 'text' as const,
          reactions: [{ emoji: '👔', count: 6, users: ['user1', 'user2'] }],
        },
        {
          id: '5',
          userId: 'pastor-john',
          userName: 'Pastor John Williams',
          content: 'Michael, come as you are! We care about your heart, not your clothes. Casual to formal - all are welcome! 😊',
          timestamp: '2:45 PM',
          type: 'text' as const,
          reactions: [
            { emoji: '❤️', count: 18, users: ['user1', 'user2'] },
            { emoji: '🙏', count: 9, users: ['user3'] }
          ],
          isReply: true,
          replyTo: '4',
        },
      ],
    };

    return messagesByGroup[groupId as keyof typeof messagesByGroup] || messagesByGroup['1'];
  };

  useEffect(() => {
    const mockMessages = getGroupMessages(id || '1');
    setMessages(mockMessages);
  }, [id]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to send messages.');
      return;
    }

    if (!hasGroupAccess) {
      Alert.alert('Upgrade Required', 'Group chat requires a church plan.');
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: user?.id || 'current-user',
      userName: user?.name || 'You',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text' as const,
      reactions: [],
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!hasGroupAccess) {
      Alert.alert('Upgrade Required', 'Reactions require a church plan.');
      return;
    }

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          // Toggle reaction
          const hasUserReacted = existingReaction.users.includes(user?.id || 'current-user');
          if (hasUserReacted) {
            existingReaction.count--;
            existingReaction.users = existingReaction.users.filter(u => u !== (user?.id || 'current-user'));
          } else {
            existingReaction.count++;
            existingReaction.users.push(user?.id || 'current-user');
          }
          return { ...msg, reactions: msg.reactions.filter(r => r.count > 0) };
        } else {
          // Add new reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1, users: [user?.id || 'current-user'] }]
          };
        }
      }
      return msg;
    }));
  };

  const getMessageTypeStyle = (type: string) => {
    switch (type) {
      case 'prayer':
        return { backgroundColor: Colors.light.primary + '10', borderLeftColor: Colors.light.primary };
      case 'announcement':
        return { backgroundColor: Colors.light.warning + '10', borderLeftColor: Colors.light.warning };
      default:
        return {};
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'prayer':
        return '🙏';
      case 'announcement':
        return '📢';
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: groupInfo.title,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <Phone size={20} color={Colors.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Video size={20} color={Colors.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push(`/groups/${id}/settings`)}
              >
                <Settings size={20} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Group Info Header */}
      <LinearGradient
        colors={[Colors.light.primary + '20', Colors.light.primary + '10'] as const}
        style={styles.groupHeader}
      >
        <View style={styles.groupInfo}>
          <Text style={styles.groupTitle}>{groupInfo.title}</Text>
          <View style={styles.groupMeta}>
            <Users size={14} color={Colors.light.textMedium} />
            <Text style={styles.groupMembers}>{groupInfo.memberCount} members</Text>
            {isTyping && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.typingIndicator}>Someone is typing...</Text>
              </>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {!hasGroupAccess && (
          <View style={styles.upgradePrompt}>
            <LinearGradient
              colors={[Colors.light.warning + '20', Colors.light.warning + '10'] as const}
              style={styles.upgradeCard}
            >
              <Users size={32} color={Colors.light.warning} />
              <Text style={styles.upgradeTitle}>Upgrade to Join the Conversation</Text>
              <Text style={styles.upgradeDescription}>
                Church plans unlock group discussions and real-time chat features.
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.push('/membership')}
              >
                <Text style={styles.upgradeButtonText}>View Plans</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        <View style={styles.messagesList}>
          {messages.map((msg) => {
            const isCurrentUser = msg.userId === (user?.id || 'current-user');
            const typeIcon = getMessageTypeIcon(msg.type);
            
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageContainer,
                  isCurrentUser && styles.currentUserMessage
                ]}
              >
                {msg.isPinned && (
                  <View style={styles.pinnedIndicator}>
                    <Pin size={12} color={Colors.light.warning} />
                    <Text style={styles.pinnedText}>Pinned Message</Text>
                  </View>
                )}
                
                <View style={[
                  styles.messageBubble,
                  isCurrentUser && styles.currentUserBubble,
                  getMessageTypeStyle(msg.type)
                ]}>
                  {!isCurrentUser && (
                    <Text style={styles.userName}>{msg.userName}</Text>
                  )}
                  
                  {msg.isReply && (
                    <View style={styles.replyIndicator}>
                      <Reply size={12} color={Colors.light.textMedium} />
                      <Text style={styles.replyText}>Replying to message</Text>
                    </View>
                  )}
                  
                  <View style={styles.messageContent}>
                    {typeIcon && <Text style={styles.typeIcon}>{typeIcon}</Text>}
                    <Text style={[
                      styles.messageText,
                      isCurrentUser && styles.currentUserText
                    ]}>
                      {msg.content}
                    </Text>
                  </View>
                  
                  <View style={styles.messageFooter}>
                    <Text style={[
                      styles.timestamp,
                      isCurrentUser && styles.currentUserTimestamp
                    ]}>
                      {msg.timestamp}
                    </Text>
                    
                    <TouchableOpacity style={styles.moreButton}>
                      <MoreVertical size={14} color={Colors.light.textMedium} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {msg.reactions.length > 0 && (
                  <View style={[
                    styles.reactionsContainer,
                    isCurrentUser && styles.currentUserReactions
                  ]}>
                    {msg.reactions.map((reaction, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.reaction}
                        onPress={() => handleReaction(msg.id, reaction.emoji)}
                      >
                        <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                        <Text style={styles.reactionCount}>{reaction.count}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.addReaction}
                      onPress={() => handleReaction(msg.id, '❤️')}
                    >
                      <Text style={styles.addReactionText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.inputButton}>
            <Image size={20} color={Colors.light.primary} />
          </TouchableOpacity>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={hasGroupAccess ? "Type a message..." : "Upgrade to chat..."}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              editable={hasGroupAccess}
              placeholderTextColor={Colors.light.textMedium}
            />
            <TouchableOpacity style={styles.inputButton}>
              <Smile size={20} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.inputButton}>
            <Mic size={20} color={Colors.light.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || !hasGroupAccess) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || !hasGroupAccess}
          >
            <Send size={20} color={Colors.light.white} />
          </TouchableOpacity>
        </View>
      </View>
      <BottomNavigation />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
  groupHeader: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  groupInfo: {
    alignItems: 'center',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  groupMembers: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  separator: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  typingIndicator: {
    fontSize: 12,
    color: Colors.light.primary,
    fontStyle: 'italic',
  },
  messagesContainer: {
    flex: 1,
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
  messagesList: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  messageContainer: {
    alignItems: 'flex-start',
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  pinnedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.xs,
  },
  pinnedText: {
    fontSize: 12,
    color: Colors.light.warning,
    fontWeight: '600' as const,
  },
  messageBubble: {
    maxWidth: '80%',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  currentUserBubble: {
    backgroundColor: Colors.light.primary,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.primary,
    marginBottom: theme.spacing.xs,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.xs,
    opacity: 0.7,
  },
  replyText: {
    fontSize: 12,
    color: Colors.light.textMedium,
    fontStyle: 'italic',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  typeIcon: {
    fontSize: 16,
  },
  messageText: {
    fontSize: 16,
    color: Colors.light.textPrimary,
    lineHeight: 22,
    flex: 1,
  },
  currentUserText: {
    color: Colors.light.white,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  currentUserTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  moreButton: {
    padding: 2,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  currentUserReactions: {
    alignSelf: 'flex-end',
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    gap: 2,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.textMedium,
  },
  addReaction: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addReactionText: {
    fontSize: 16,
    color: Colors.light.textMedium,
  },
  inputContainer: {
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    padding: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  inputButton: {
    padding: theme.spacing.sm,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.textPrimary,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.textLight,
  },
});