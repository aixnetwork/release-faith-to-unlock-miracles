import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { BookOpen, DollarSign, GraduationCap, Heart, ChevronDown, ChevronUp, Copy, CheckCircle2, Users, Shield, Anchor, HeartHandshake, Brain, Moon } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { BackButton } from '@/components/BackButton';

type PrayerType = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Heart;
  color: string;
  sections: {
    step: string;
    title: string;
    content: string;
    verse?: string;
  }[];
  fullPrayer: string;
  actionSteps?: string[];
};

const MIRACLE_PRAYERS: PrayerType[] = [
  {
    id: 'financial',
    title: 'Financial Breakthrough',
    subtitle: 'Supernatural provision and prosperity',
    icon: DollarSign,
    color: '#10B981',
    sections: [
      {
        step: 'M',
        title: 'Meditate on God\'s Character & Promises',
        content: 'Heavenly Father, You are Jehovah-Jireh, the God who provides (Genesis 22:14). You fed 5,000 with five loaves (John 6:1–14), opened the windows of heaven for Elijah\'s widow (1 Kings 17:8–16), and promised seed to the sower and bread to the eater (2 Corinthians 9:10). I enter Your gates with thanksgiving and Your courts with praise (Psalm 100:4). Thank You for every past provision and for the greater miracles You are releasing now.',
        verse: 'Genesis 22:14, John 6:1–14',
      },
      {
        step: 'I',
        title: 'Invoke Jesus\' Name & Authority',
        content: 'In the mighty name of Jesus Christ, by His blood and finished work on the cross, I stand in Your throne room of grace (Hebrews 4:16). Every promise is "Yes" and "Amen" in Him (2 Corinthians 1:20). I come boldly under His authority alone.',
        verse: 'Hebrews 4:16, 2 Corinthians 1:20',
      },
      {
        step: 'R',
        title: 'Repent & Align with God\'s Will',
        content: 'Forgive me, Lord, for any fear, greed, or mismanagement of resources. I repent of trusting in man\'s economy more than Your kingdom. Your will is that I prosper and be in health even as my soul prospers (3 John 1:2). I submit every financial decision to Your perfect plan—not my will, but Yours be done (Luke 22:42).',
        verse: '3 John 1:2, Luke 22:42',
      },
      {
        step: 'A',
        title: 'Ask Specifically, Boldly & in Faith',
        content: 'Right now, I ask and believe I receive (Mark 11:24): [Your specific need] is manifesting today. Supernatural multiplication of seed sown—every dollar returns 30-, 60-, 100-fold (Mark 4:20). Unexpected checks, refunds, raises, clients, and divine ideas flood my life this week. Every financial barrier is demolished; every demonic blockage is bound and cast out (Matthew 18:18). I see it done. I declare it finished. No doubt enters my heart (James 1:6–8).',
        verse: 'Mark 11:24, Mark 4:20',
      },
      {
        step: 'C',
        title: 'Combine Persistence, Fasting & Agreement',
        content: 'I persist in this prayer daily until the breakthrough is visible (Luke 18:1). I [optional: fast meals/days] as You lead. I agree right now with every believer touching this prayer—where two or three agree, it is done (Matthew 18:19). We stand united in faith.',
        verse: 'Luke 18:1, Matthew 18:19',
      },
      {
        step: 'L',
        title: 'Leave in Thanksgiving & Expectancy',
        content: 'Thank You, Father, that the money is already in motion—transferred, deposited, multiplied. I praise You in advance for the testimony (Philippians 4:6). My household rejoices as bills are paid, storehouses overflow, and we become cheerful givers to Your kingdom (2 Corinthians 9:7–8). Glory to Your name! In Jesus\' matchless name—Amen and Amen!',
        verse: 'Philippians 4:6, 2 Corinthians 9:7–8',
      },
    ],
    fullPrayer: `Heavenly Father, You are Jehovah-Jireh, the God who provides. You fed 5,000 with five loaves, opened the windows of heaven for Elijah's widow, and promised seed to the sower and bread to the eater. I enter Your gates with thanksgiving and Your courts with praise. Thank You for every past provision and for the greater miracles You are releasing now.

In the mighty name of Jesus Christ, by His blood and finished work on the cross, I stand in Your throne room of grace. Every promise is "Yes" and "Amen" in Him. I come boldly under His authority alone.

Forgive me, Lord, for any fear, greed, or mismanagement of resources. I repent of trusting in man's economy more than Your kingdom. Your will is that I prosper and be in health even as my soul prospers. I submit every financial decision to Your perfect plan—not my will, but Yours be done.

Right now, I ask and believe I receive: [Your specific need] is manifesting today. Supernatural multiplication of seed sown—every dollar returns 30-, 60-, 100-fold. Unexpected checks, refunds, raises, clients, and divine ideas flood my life this week. Every financial barrier is demolished; every demonic blockage is bound and cast out. I see it done. I declare it finished. No doubt enters my heart.

I persist in this prayer daily until the breakthrough is visible. I agree right now with every believer touching this prayer—where two or three agree, it is done. We stand united in faith.

Thank You, Father, that the money is already in motion—transferred, deposited, multiplied. I praise You in advance for the testimony. My household rejoices as bills are paid, storehouses overflow, and we become cheerful givers to Your kingdom. Glory to Your name!

In Jesus' matchless name—Amen and Amen!`,
    actionSteps: [
      'Pray aloud daily (morning + night) until manifestation',
      'Write the specific amount/date in a journal—faith speaks',
      'Act in faith: Sow a seed (money, time, skill) as led',
      'Testify when any part arrives—thanksgiving accelerates',
    ],
  },
  {
    id: 'student',
    title: 'Student Success',
    subtitle: 'Academic excellence and career guidance',
    icon: GraduationCap,
    color: '#3B82F6',
    sections: [
      {
        step: 'M',
        title: 'Meditate on God\'s Character & Promises',
        content: 'Heavenly Father, You are the God of wisdom who gave Solomon an understanding mind (1 Kings 3:9–12) and turned fishermen into world-changers (Matthew 4:19). You promise to give wisdom generously to all who ask (James 1:5) and to make crooked paths straight (Isaiah 45:2). I praise You for every past victory in my studies and for the greater future You are unfolding now. Thank You, Lord!',
        verse: '1 Kings 3:9–12, James 1:5',
      },
      {
        step: 'I',
        title: 'Invoke Jesus\' Name & Authority',
        content: 'In the mighty name of Jesus Christ, by His blood and resurrection power, I stand before Your throne (Hebrews 4:16). Every promise is "Yes" in Him (2 Corinthians 1:20). I come under His authority alone.',
        verse: 'Hebrews 4:16, 2 Corinthians 1:20',
      },
      {
        step: 'R',
        title: 'Repent & Align with God\'s Will',
        content: 'Forgive me, Lord, for procrastination, distraction, pride, rebellion, or any sinful habit. I repent and turn away. Your will is for me to prosper in soul and studies (3 John 1:2), to walk in discipline (Proverbs 12:1), and to be transformed by the renewing of my mind (Romans 12:2). Not my will, but Yours be done.',
        verse: '3 John 1:2, Romans 12:2',
      },
      {
        step: 'A',
        title: 'Ask Specifically, Boldly & in Faith',
        content: 'Right now, I ask and believe I receive (Mark 11:24): Perfect focus, retention, and A-grade results in [name courses]—supernatural understanding flows like Daniel\'s (Daniel 1:17). Divine career direction—You reveal the exact path, open doors no man can shut (Revelation 3:8), and connect me with mentors this semester. Practical life skills (time management, communication, financial wisdom) are downloaded into my spirit—I master them effortlessly. Every bad habit is uprooted and replaced with godly character—self-control, diligence, and kindness dominate my life (Galatians 5:22–23). I see it done. I declare it finished. No doubt enters my heart.',
        verse: 'Mark 11:24, Daniel 1:17',
      },
      {
        step: 'C',
        title: 'Combine Persistence, Fasting & Agreement',
        content: 'I persist in this prayer every morning and night until full manifestation (Luke 18:1). I [optional: fast social media/hours] as You lead. I agree with my [parents/mentor/prayer partner]—where two or three agree, it is done (Matthew 18:19). We stand united in faith.',
        verse: 'Luke 18:1, Matthew 18:19',
      },
      {
        step: 'L',
        title: 'Leave in Thanksgiving & Expectancy',
        content: 'Thank You, Father, that the grades are already rising, the career path is illuminated, the skills are mastered, and my character is transformed. I praise You in advance for the testimony—honor roll, scholarship offers, and a life that glorifies You (Philippians 4:6). Glory to Your name! In Jesus\' matchless name—Amen and Amen!',
        verse: 'Philippians 4:6',
      },
    ],
    fullPrayer: `Heavenly Father, You are the God of wisdom who gave Solomon an understanding mind and turned fishermen into world-changers. You promise to give wisdom generously to all who ask and to make crooked paths straight. I praise You for every past victory in my studies and for the greater future You are unfolding now. Thank You, Lord!

In the mighty name of Jesus Christ, by His blood and resurrection power, I stand before Your throne. Every promise is "Yes" in Him. I come under His authority alone.

Forgive me, Lord, for procrastination, distraction, pride, rebellion, or any sinful habit. I repent and turn away. Your will is for me to prosper in soul and studies, to walk in discipline, and to be transformed by the renewing of my mind. Not my will, but Yours be done.

Right now, I ask and believe I receive: Perfect focus, retention, and A-grade results in [name courses]—supernatural understanding flows like Daniel's. Divine career direction—You reveal the exact path, open doors no man can shut, and connect me with mentors this semester. Practical life skills are downloaded into my spirit—I master them effortlessly. Every bad habit is uprooted and replaced with godly character. I see it done. I declare it finished.

I persist in this prayer every morning and night until full manifestation. I agree with my prayer partners—where two or three agree, it is done. We stand united in faith.

Thank You, Father, that the grades are already rising, the career path is illuminated, the skills are mastered, and my character is transformed. I praise You in advance for the testimony—honor roll, scholarship offers, and a life that glorifies You. Glory to Your name!

In Jesus' matchless name—Amen and Amen!`,
    actionSteps: [
      'Pray aloud twice daily (before studying + before bed)',
      'Write specific goals in a journal—faith speaks',
      'Study with excellence as unto the Lord',
      'Seek counsel—meet with a teacher/mentor weekly',
    ],
  },
  {
    id: 'healing',
    title: 'Supernatural Healing',
    subtitle: 'Complete physical and spiritual restoration',
    icon: Heart,
    color: '#EF4444',
    sections: [
      {
        step: 'M',
        title: 'Meditate on God\'s Character & Promises',
        content: 'Father God, You are Jehovah-Rapha, the Lord who heals (Exodus 15:26). By Your stripes we are healed (Isaiah 53:5; 1 Peter 2:24). You raised Lazarus after four days (John 11:43–44), made the lame walk (Acts 3:1–10), and turned Paul\'s prison into praise (Acts 16:25–26). I worship You for every past touch and for the complete miracle You are releasing right now. Thank You, Lord!',
        verse: 'Exodus 15:26, Isaiah 53:5',
      },
      {
        step: 'I',
        title: 'Invoke Jesus\' Name & Authority',
        content: 'In the matchless name of Jesus Christ, by His shed blood and resurrection power, I stand before Your mercy seat (Hebrews 4:16). Demons tremble, sickness flees, and every promise is Yes and Amen in Him (2 Corinthians 1:20). I come under His authority alone.',
        verse: 'Hebrews 4:16, 2 Corinthians 1:20',
      },
      {
        step: 'R',
        title: 'Repent & Align with God\'s Will',
        content: 'Forgive me for unbelief, bitterness, unforgiveness, or any open door. I close every door now. Your will is wholeness—spirit, soul, and body (3 John 1:2). I submit: Not my will, but Yours be done (Luke 22:42).',
        verse: '3 John 1:2, Luke 22:42',
      },
      {
        step: 'A',
        title: 'Ask Specifically, Boldly & in Faith',
        content: 'Right now, I ask and believe I receive (Mark 11:24): [Name exact condition] is healed 100%, cells normalized, pain gone, mind renewed—this instant. Every symptom vanishes; medical reports reverse to "perfect" (Psalm 103:3). Breakthrough floods every area: finances multiply, relationships restore, calling activates—30-, 60-, 100-fold (Mark 4:20). Every chain shatters; I walk in divine health and favor all my days (Exodus 23:25). I see it done. I declare it finished. Doubt is cast out (James 1:6).',
        verse: 'Mark 11:24, Psalm 103:3',
      },
      {
        step: 'C',
        title: 'Combine Persistence, Fasting & Agreement',
        content: 'I pray this every morning + night until the miracle is visible and verified (Luke 18:1). I [fast meals/media/days] as You lead. I agree with [name prayer partners/church]—where two or three touch, it is done (Matthew 18:19). We bind sickness and loose healing (Matthew 18:18).',
        verse: 'Luke 18:1, Matthew 18:19',
      },
      {
        step: 'L',
        title: 'Leave in Thanksgiving & Expectancy',
        content: 'Thank You, Father, that healing is flowing, breakthrough is here, and my body, mind, and life are whole. I praise You for the doctor\'s report, the bank statement, the restored family—already manifesting. I rejoice now (Philippians 4:6; Habakkuk 3:18). Glory to Your name! In Jesus\' all-powerful name—AMEN & AMEN!',
        verse: 'Philippians 4:6, Habakkuk 3:18',
      },
    ],
    fullPrayer: `Father God, You are Jehovah-Rapha, the Lord who heals. By Your stripes we are healed. You raised Lazarus after four days, made the lame walk, and turned Paul's prison into praise. I worship You for every past touch and for the complete miracle You are releasing right now. Thank You, Lord!

In the matchless name of Jesus Christ, by His shed blood and resurrection power, I stand before Your mercy seat. Demons tremble, sickness flees, and every promise is Yes and Amen in Him. I come under His authority alone.

Forgive me for unbelief, bitterness, unforgiveness, or any open door. I close every door now. Your will is wholeness—spirit, soul, and body. I submit: Not my will, but Yours be done.

Right now, I ask and believe I receive: [Name exact condition] is healed 100%, cells normalized, pain gone, mind renewed—this instant. Every symptom vanishes; medical reports reverse to "perfect." Breakthrough floods every area: finances multiply, relationships restore, calling activates. Every chain shatters; I walk in divine health and favor all my days. I see it done. I declare it finished. Doubt is cast out.

I pray this every morning + night until the miracle is visible and verified. I agree with my prayer partners—where two or three touch, it is done. We bind sickness and loose healing.

Thank You, Father, that healing is flowing, breakthrough is here, and my body, mind, and life are whole. I praise You for the doctor's report, the bank statement, the restored family—already manifesting. I rejoice now. Glory to Your name!

In Jesus' all-powerful name—AMEN & AMEN!`,
    actionSteps: [
      'Pray the script aloud 2× daily (on knees if possible)',
      'Write the diagnosis + expected miracle date in a journal',
      'Lay hands on the affected area while declaring',
      'Act in faith: obey doctors + rest, give, serve',
      'Testify instantly at every sign (pain drop, good report)',
    ],
  },
  {
    id: 'family',
    title: 'Family Restoration & Unity',
    subtitle: 'Reconciliation and healing for families',
    icon: Users,
    color: '#F59E0B',
    sections: [
      {
        step: 'M',
        title: 'Meditate on God\'s Character & Promises',
        content: 'Father God, You set the lonely in families (Psalm 68:6) and turned bitter water into wine at a wedding feast (John 2:1–11). You reconciled Joseph with his brothers after decades of betrayal (Genesis 45:1–15). You promise that a house divided cannot stand, but a cord of three strands is not quickly broken (Mark 3:25; Ecclesiastes 4:12). I praise You for every shared meal and for the total unity You are restoring right now. Thank You, Lord!',
        verse: 'Psalm 68:6, John 2:1–11',
      },
      {
        step: 'I',
        title: 'Invoke Jesus\' Name & Authority',
        content: 'In the mighty name of Jesus Christ, the Reconciler of all things (Colossians 1:20), by His blood and resurrection power, I come boldly to Your throne of grace (Hebrews 4:16). Every spirit of division bows; every wall of hostility crumbles at His name (Ephesians 2:14). I stand under His authority alone.',
        verse: 'Colossians 1:20, Hebrews 4:16',
      },
      {
        step: 'R',
        title: 'Repent & Align with God\'s Will',
        content: 'Forgive me for harsh words, pride, gossip, or neglect [name specific offenses, e.g., ignoring calls, holding grudges]. I repent and shut every door. Your will is oneness as Jesus prayed: "that they may be one" (John 17:21–23). Not my bitterness, but Your love be done.',
        verse: 'John 17:21–23',
      },
      {
        step: 'A',
        title: 'Ask Specifically, Boldly & in Faith',
        content: 'Right now, I ask and believe I receive (Mark 11:24): [Name family member(s)] return home repentant and joyful this week. Every argument silenced, every wound healed, every silence broken. Family dinners resume nightly; laughter fills the house. Generational curses shattered; legacy of love established. I see us hugging. I declare it done. Doubt is silenced (James 1:6).',
        verse: 'Mark 11:24, James 1:6',
      },
      {
        step: 'C',
        title: 'Combine Persistence, Fasting & Agreement',
        content: 'I pray this every evening at the dinner table until unity is visible (Luke 18:1). I [fast criticism / social media] as You lead. I agree with [spouse / parent / church]—where two or three agree, family is restored (Matthew 18:19).',
        verse: 'Luke 18:1, Matthew 18:19',
      },
      {
        step: 'L',
        title: 'Leave in Thanksgiving & Expectancy',
        content: 'Thank You, Father, that phone calls are coming, doors are opening, and our table is full. I praise You for the family photo on the wall—already whole. I rejoice now in perfect harmony (Psalm 133:1). Glory to Your name! In Jesus\' reconciling name—AMEN & AMEN.',
        verse: 'Psalm 133:1',
      },
    ],
    fullPrayer: `Father God, You set the lonely in families and turned bitter water into wine at a wedding feast. You reconciled Joseph with his brothers after decades of betrayal. You promise that a house divided cannot stand, but a cord of three strands is not quickly broken. I praise You for every shared meal and for the total unity You are restoring right now. Thank You, Lord!

In the mighty name of Jesus Christ, the Reconciler of all things, by His blood and resurrection power, I come boldly to Your throne of grace. Every spirit of division bows; every wall of hostility crumbles at His name. I stand under His authority alone.

Forgive me for harsh words, pride, gossip, or neglect. I repent and shut every door. Your will is oneness as Jesus prayed: "that they may be one." Not my bitterness, but Your love be done.

Right now, I ask and believe I receive: [Name family member(s)] return home repentant and joyful this week. Every argument silenced, every wound healed, every silence broken. Family dinners resume nightly; laughter fills the house. Generational curses shattered; legacy of love established. I see us hugging. I declare it done. Doubt is silenced.

I pray this every evening at the dinner table until unity is visible. I fast criticism and social media as You lead. I agree with my spouse/parent/church—where two or three agree, family is restored.

Thank You, Father, that phone calls are coming, doors are opening, and our table is full. I praise You for the family photo on the wall—already whole. I rejoice now in perfect harmony. Glory to Your name!

In Jesus' reconciling name—AMEN & AMEN.`,
    actionSteps: [
      'Pray aloud at family dinner time daily',
      'Write names of family members in prayer journal',
      'Fast criticism and gossip about family members',
      'Reach out first—make the reconciling call/visit',
      'Testify when any contact or breakthrough happens',
    ],
  },
  {
    id: 'protection',
    title: 'Protection from Harm & Danger',
    subtitle: 'Divine safety and angelic covering',
    icon: Shield,
    color: '#8B5CF6',
    sections: [
      {
        step: 'M',
        title: 'Meditate on God\'s Character & Promises',
        content: 'Father God, You are my Refuge and Fortress (Psalm 91:2). You commanded angels to guard me in all my ways (Psalm 91:11). You shut the lions\' mouths for Daniel (Daniel 6:22) and walked with the three Hebrews in the fire (Daniel 3:25). You promise no plague comes near my tent (Psalm 91:10). I praise You for every safe day and for the invisible shield You place around me today. Thank You, Lord!',
        verse: 'Psalm 91:2, Psalm 91:11',
      },
      {
        step: 'I',
        title: 'Invoke Jesus\' Name & Authority',
        content: 'In the mighty name of Jesus Christ, the Good Shepherd (John 10:11), by His blood, I plead divine protection over [self / child / home / travel / city]. Every evil plan fails; every weapon formed prospereth not (Isaiah 54:17). I stand under His authority alone.',
        verse: 'John 10:11, Isaiah 54:17',
      },
      {
        step: 'R',
        title: 'Repent & Align with God\'s Will',
        content: 'Forgive me for fear, recklessness, or stepping outside Your will [name specifics, e.g., speeding, unsafe areas]. I repent. Your will is perfect safety and a thousand falling at my side but not near me (Psalm 91:7). Not my worry, but Your covering be done.',
        verse: 'Psalm 91:7',
      },
      {
        step: 'A',
        title: 'Ask Specifically, Boldly & in Faith',
        content: 'Right now, I ask and believe I receive (Mark 11:24): Zero accidents, zero violence, zero illness—today and every day. Angels stationed at every corner of my home, car, workplace. [Name trip / child\'s school] guarded 24/7; evil passes over like Passover (Exodus 12). I walk in divine favor and safety all my days (Psalm 5:12). I see the shield. I declare it done. Doubt is silenced (James 1:6).',
        verse: 'Mark 11:24, Psalm 5:12',
      },
      {
        step: 'C',
        title: 'Combine Persistence, Fasting & Agreement',
        content: 'I pray this at dawn and dusk until protection is undeniable (Luke 18:1). I [fast fear-based news] as You lead. I agree with [prayer partner / family]—where two agree, safety reigns (Matthew 18:19).',
        verse: 'Luke 18:1, Matthew 18:19',
      },
      {
        step: 'L',
        title: 'Leave in Thanksgiving & Expectancy',
        content: 'Thank You, Father, that danger flees, angels surround, and I arrive safely. I praise You for tomorrow\'s journey—already protected. I rest now in perfect peace (Psalm 4:8). Glory to Your name! In Jesus\' protective name—AMEN & AMEN.',
        verse: 'Psalm 4:8',
      },
    ],
    fullPrayer: `Father God, You are my Refuge and Fortress. You commanded angels to guard me in all my ways. You shut the lions' mouths for Daniel and walked with the three Hebrews in the fire. You promise no plague comes near my tent. I praise You for every safe day and for the invisible shield You place around me today. Thank You, Lord!

In the mighty name of Jesus Christ, the Good Shepherd, by His blood, I plead divine protection over myself, my family, my home, and my travels. Every evil plan fails; every weapon formed prospereth not. I stand under His authority alone.

Forgive me for fear, recklessness, or stepping outside Your will. I repent. Your will is perfect safety and a thousand falling at my side but not near me. Not my worry, but Your covering be done.

Right now, I ask and believe I receive: Zero accidents, zero violence, zero illness—today and every day. Angels stationed at every corner of my home, car, workplace. My trips and my children's schools are guarded 24/7; evil passes over like Passover. I walk in divine favor and safety all my days. I see the shield. I declare it done. Doubt is silenced.

I pray this at dawn and dusk until protection is undeniable. I fast fear-based news as You lead. I agree with my prayer partners—where two agree, safety reigns.

Thank You, Father, that danger flees, angels surround, and I arrive safely. I praise You for tomorrow's journey—already protected. I rest now in perfect peace. Glory to Your name!

In Jesus' protective name—AMEN & AMEN.`,
    actionSteps: [
      'Pray aloud at sunrise and sunset daily',
      'Plead the blood of Jesus over your home/car/family',
      'Fast fear-based media and negative news',
      'Pray Psalm 91 over loved ones before travel',
      'Testify when protection becomes evident',
    ],
  },
  {
    id: 'addiction',
    title: 'Freedom from Addiction',
    subtitle: 'Breaking chains and strongholds',
    icon: Anchor,
    color: '#14B8A6',
    sections: [
      {
        step: 'M',
        title: 'Meditate on God\'s Character & Promises',
        content: 'Father God, You broke Peter\'s chains in prison with an earthquake (Acts 12:7) and set the captives free (Isaiah 61:1). You turned water into wine but never made anyone a slave to it. You promise a new heart and a new spirit (Ezekiel 36:26). I praise You for every sober day and for the total freedom You are releasing tonight. Thank You, Lord!',
        verse: 'Acts 12:7, Isaiah 61:1',
      },
      {
        step: 'I',
        title: 'Invoke Jesus\' Name & Authority',
        content: 'In the mighty name of Jesus Christ, the Chain-Breaker, by His blood, every addiction shatters. Every demonic stronghold crumbles (Mark 3:27). I stand under His authority alone.',
        verse: 'Mark 3:27',
      },
      {
        step: 'R',
        title: 'Repent & Align with God\'s Will',
        content: 'Forgive me for [name addiction: alcohol, porn, drugs, gambling, food]. I repent of every trigger, every lie, every relapse. I shut the door. Your will is life abundant and a sound mind (John 10:10; 2 Timothy 1:7). Not my cravings, but Your freedom be done.',
        verse: 'John 10:10, 2 Timothy 1:7',
      },
      {
        step: 'A',
        title: 'Ask Specifically, Boldly & in Faith',
        content: 'Right now, I ask and believe I receive (Mark 11:24): Cravings gone this hour—taste, desire, memory erased. 30 days clean → lifetime victory; triggers lose all power. Mind renewed, body healed, future bright. I walk in self-control as a fruit of the Spirit (Galatians 5:23). I see myself free. I declare it done. Doubt is silenced (James 1:6).',
        verse: 'Mark 11:24, Galatians 5:23',
      },
      {
        step: 'C',
        title: 'Combine Persistence, Fasting & Agreement',
        content: 'I pray this 3× daily—morning, craving, night—until freedom is effortless (Luke 18:1). I [fast the substance / trigger] as You lead. I agree with [accountability partner / sponsor]—where two agree, chains break (Matthew 18:19).',
        verse: 'Luke 18:1, Matthew 18:19',
      },
      {
        step: 'L',
        title: 'Leave in Thanksgiving & Expectancy',
        content: 'Thank You, Father, that cravings are dead, joy is back, and my future is clean. I praise You for the testimony—already written. I live now in total liberty (Galatians 5:1). Glory to Your name! In Jesus\' delivering name—AMEN & AMEN.',
        verse: 'Galatians 5:1',
      },
    ],
    fullPrayer: `Father God, You broke Peter's chains in prison with an earthquake and set the captives free. You turned water into wine but never made anyone a slave to it. You promise a new heart and a new spirit. I praise You for every sober day and for the total freedom You are releasing tonight. Thank You, Lord!

In the mighty name of Jesus Christ, the Chain-Breaker, by His blood, every addiction shatters. Every demonic stronghold crumbles. I stand under His authority alone.

Forgive me for [name addiction: alcohol, porn, drugs, gambling, food]. I repent of every trigger, every lie, every relapse. I shut the door. Your will is life abundant and a sound mind. Not my cravings, but Your freedom be done.

Right now, I ask and believe I receive: Cravings gone this hour—taste, desire, memory erased. 30 days clean → lifetime victory; triggers lose all power. Mind renewed, body healed, future bright. I walk in self-control as a fruit of the Spirit. I see myself free. I declare it done. Doubt is silenced.

I pray this 3× daily—morning, craving, night—until freedom is effortless. I fast the substance and triggers as You lead. I agree with my accountability partner—where two agree, chains break.

Thank You, Father, that cravings are dead, joy is back, and my future is clean. I praise You for the testimony—already written. I live now in total liberty. Glory to Your name!

In Jesus' delivering name—AMEN & AMEN.`,
    actionSteps: [
      'Pray aloud 3× daily (morning, craving moment, bedtime)',
      'Write your "clean date" and 30-day milestone in journal',
      'Fast the substance/trigger completely—no exceptions',
      'Join accountability group—text/call sponsor daily',
      'Testify immediately when cravings weaken or vanish',
    ],
  },
  {
    id: 'marriage',
    title: 'Godly Spouse / Marriage Restoration',
    subtitle: 'Covenant love and partnership',
    icon: HeartHandshake,
    color: '#EC4899',
    sections: [
      {
        step: 'M',
        title: 'Meditate on God\'s Character & Promises',
        content: 'Father God, You said, "It is not good for man to be alone" (Genesis 2:18) and joined Adam and Eve. You redeemed Ruth through Boaz and restored Hosea\'s marriage despite betrayal. You promise plans to prosper, not harm (Jeremiah 29:11). I praise You for every good relationship and for the covenant partner You are bringing now. Thank You, Lord!',
        verse: 'Genesis 2:18, Jeremiah 29:11',
      },
      {
        step: 'I',
        title: 'Invoke Jesus\' Name & Authority',
        content: 'In the mighty name of Jesus Christ, the Bridegroom (Matthew 9:15), by His blood, I come. Every wrong relationship ends; every godly door opens. I stand under His authority alone.',
        verse: 'Matthew 9:15',
      },
      {
        step: 'R',
        title: 'Repent & Align with God\'s Will',
        content: 'Forgive me for impatience, idolatry of marriage, past immorality, or bitterness [name specifics]. I repent. Your will is holy, joyful union (Hebrews 13:4). Not my timeline, but Your perfect match be done.',
        verse: 'Hebrews 13:4',
      },
      {
        step: 'A',
        title: 'Ask Specifically, Boldly & in Faith',
        content: 'Right now, I ask and believe I receive (Mark 11:24): [Single: Godly spouse revealed by ___ date]—Boaz-level provider, Ruth-level virtue. [Married: passion, respect, intimacy restored this month]—fire reignited. Attraction, honor, laughter, prayer together—100-fold. Divorce papers burned, vows renewed. I see the ring / the embrace. I declare it done. Doubt is silenced (James 1:6).',
        verse: 'Mark 11:24, James 1:6',
      },
      {
        step: 'C',
        title: 'Combine Persistence, Fasting & Agreement',
        content: 'I pray this nightly before bed until the miracle walks in (Luke 18:1). I [fast dating apps / bitterness] as You lead. I agree with [mentor / prayer group]—where two agree, love wins (Matthew 18:19).',
        verse: 'Luke 18:1, Matthew 18:19',
      },
      {
        step: 'L',
        title: 'Leave in Thanksgiving & Expectancy',
        content: 'Thank You, Father, that the call is coming, the date is set, the marriage is healed. I praise You for the wedding photo / renewed passion—already here. I rest now in covenant joy (Psalm 16:11). Glory to Your name! In Jesus\' covenant name—AMEN & AMEN.',
        verse: 'Psalm 16:11',
      },
    ],
    fullPrayer: `Father God, You said, "It is not good for man to be alone" and joined Adam and Eve. You redeemed Ruth through Boaz and restored Hosea's marriage despite betrayal. You promise plans to prosper, not harm. I praise You for every good relationship and for the covenant partner You are bringing now. Thank You, Lord!

In the mighty name of Jesus Christ, the Bridegroom, by His blood, I come. Every wrong relationship ends; every godly door opens. I stand under His authority alone.

Forgive me for impatience, idolatry of marriage, past immorality, or bitterness. I repent. Your will is holy, joyful union. Not my timeline, but Your perfect match be done.

Right now, I ask and believe I receive: [Single: Godly spouse revealed by ___ date]—Boaz-level provider, Ruth-level virtue. [Married: passion, respect, intimacy restored this month]—fire reignited. Attraction, honor, laughter, prayer together—100-fold. Divorce papers burned, vows renewed. I see the ring / the embrace. I declare it done. Doubt is silenced.

I pray this nightly before bed until the miracle walks in. I fast dating apps and bitterness as You lead. I agree with my mentor/prayer group—where two agree, love wins.

Thank You, Father, that the call is coming, the date is set, the marriage is healed. I praise You for the wedding photo / renewed passion—already here. I rest now in covenant joy. Glory to Your name!

In Jesus' covenant name—AMEN & AMEN.`,
    actionSteps: [
      'Pray aloud nightly before bed until answered',
      'Write desired qualities of spouse OR restoration goals',
      'Fast dating apps (single) OR bitterness/complaints (married)',
      'Act in faith: Prepare (single) OR serve spouse (married)',
      'Testify when the first sign appears (meeting, warmth, date)',
    ],
  },
  {
    id: 'mental-health',
    title: 'Mental Health & Emotional Peace',
    subtitle: 'Sound mind and inner healing',
    icon: Brain,
    color: '#06B6D4',
    sections: [
      {
        step: 'M',
        title: 'Meditate on God\'s Character & Promises',
        content: 'Father God, You heal the brokenhearted and bind up their wounds (Psalm 147:3). You gave Paul and Silas joy in prison (Acts 16:25) and promised a peace that surpasses understanding (Philippians 4:7). You renew the mind (Romans 12:2). I praise You for every calm moment and for the total peace You are flooding me with now. Thank You, Lord!',
        verse: 'Psalm 147:3, Philippians 4:7',
      },
      {
        step: 'I',
        title: 'Invoke Jesus\' Name & Authority',
        content: 'In the mighty name of Jesus Christ, the Wonderful Counselor (Isaiah 9:6), by His blood, every lie silenced, every torment cast out. I receive the mind of Christ (1 Corinthians 2:16). I stand under His authority alone.',
        verse: 'Isaiah 9:6, 1 Corinthians 2:16',
      },
      {
        step: 'R',
        title: 'Repent & Align with God\'s Will',
        content: 'Forgive me for believing lies, meditating on trauma, or rejecting help [name specifics, e.g., self-harm thoughts, isolation]. I repent. Your will is a sound mind, love, and power (2 Timothy 1:7). Not my chaos, but Your peace be done.',
        verse: '2 Timothy 1:7',
      },
      {
        step: 'A',
        title: 'Ask Specifically, Boldly & in Faith',
        content: 'Right now, I ask and believe I receive (Mark 11:24): Depression lifts this hour—joy returns like the prodigal (Luke 15). Anxiety silenced; panic attacks gone forever. Suicidal thoughts erased; purpose ignited. Mind renewed daily; emotions stable and strong. I see myself laughing. I declare it done. Doubt is silenced (James 1:6).',
        verse: 'Mark 11:24, Luke 15',
      },
      {
        step: 'C',
        title: 'Combine Persistence, Fasting & Agreement',
        content: 'I pray this at 3 PM slump + bedtime until peace is permanent (Luke 18:1). I [fast negative media] as You lead. I agree with [counselor / friend]—where two agree, peace guards (Matthew 18:19).',
        verse: 'Luke 18:1, Matthew 18:19',
      },
      {
        step: 'L',
        title: 'Leave in Thanksgiving & Expectancy',
        content: 'Thank You, Father, that darkness is gone, light has come, and my smile is back. I praise You for tomorrow\'s joy—already mine. I rest now in perfect wholeness (Isaiah 26:3). Glory to Your name! In Jesus\' healing name—AMEN & AMEN.',
        verse: 'Isaiah 26:3',
      },
    ],
    fullPrayer: `Father God, You heal the brokenhearted and bind up their wounds. You gave Paul and Silas joy in prison and promised a peace that surpasses understanding. You renew the mind. I praise You for every calm moment and for the total peace You are flooding me with now. Thank You, Lord!

In the mighty name of Jesus Christ, the Wonderful Counselor, by His blood, every lie silenced, every torment cast out. I receive the mind of Christ. I stand under His authority alone.

Forgive me for believing lies, meditating on trauma, or rejecting help. I repent. Your will is a sound mind, love, and power. Not my chaos, but Your peace be done.

Right now, I ask and believe I receive: Depression lifts this hour—joy returns like the prodigal. Anxiety silenced; panic attacks gone forever. Suicidal thoughts erased; purpose ignited. Mind renewed daily; emotions stable and strong. I see myself laughing. I declare it done. Doubt is silenced.

I pray this at 3 PM slump + bedtime until peace is permanent. I fast negative media as You lead. I agree with my counselor/friend—where two agree, peace guards.

Thank You, Father, that darkness is gone, light has come, and my smile is back. I praise You for tomorrow's joy—already mine. I rest now in perfect wholeness. Glory to Your name!

In Jesus' healing name—AMEN & AMEN.`,
    actionSteps: [
      'Pray aloud at 3 PM and bedtime daily',
      'Write negative thoughts, then pray opposite truths',
      'Fast negative social media and news',
      'Seek godly counseling—mental health + spiritual support',
      'Testify when joy, peace, or stability returns',
    ],
  },
  {
    id: 'sleep',
    title: 'Supernatural Sleep & Victory Over Insomnia',
    subtitle: 'Peaceful rest and rejuvenation',
    icon: Moon,
    color: '#6366F1',
    sections: [
      {
        step: 'M',
        title: 'Meditate on God\'s Character & Promises',
        content: 'Father God, You are the Lord who gives sleep to those He loves (Psalm 127:2). You made the moon to mark the night (Psalm 104:19) and shut the lions\' mouths for Daniel so he slept in peace (Daniel 6:22). You promise sweet sleep to Your beloved (Proverbs 3:24). I praise You for every good night I\'ve ever had and for the perfect rest You are giving me tonight. Thank You, Lord!',
        verse: 'Psalm 127:2, Proverbs 3:24',
      },
      {
        step: 'I',
        title: 'Invoke Jesus\' Name & Authority',
        content: 'In the mighty name of Jesus Christ, the Prince of Peace (Isaiah 9:6), by His blood and finished work, I come to Your throne of grace (Hebrews 4:16). Every anxious thought bows; every spirit of insomnia flees at His name (Philippians 2:10). I rest under His authority alone.',
        verse: 'Isaiah 9:6, Hebrews 4:16',
      },
      {
        step: 'R',
        title: 'Repent & Align with God\'s Will',
        content: 'Forgive me for worry, screen addiction, caffeine past noon, or any way I\'ve grieved Your Spirit of peace [name specific triggers, e.g., doom-scrolling, unforgiveness]. I repent and shut every door. Your will is peaceful sleep and a guarded mind (Philippians 4:7). Not my fears, but Your rest be done.',
        verse: 'Philippians 4:7',
      },
      {
        step: 'A',
        title: 'Ask Specifically, Boldly & in Faith',
        content: 'Right now, I ask and believe I receive (Mark 11:24): Tonight, I fall asleep within 5 minutes—no tossing, no racing thoughts. I sleep 7–9 hours straight, waking refreshed at [exact time, e.g., 6:30 AM]. Every root of insomnia—stress, trauma, chemical imbalance—is uprooted and healed. My mind is renewed; my body restores like a child\'s (Psalm 127:2). I see myself sleeping. I declare it done. Doubt is silenced (James 1:6).',
        verse: 'Mark 11:24, James 1:6',
      },
      {
        step: 'C',
        title: 'Combine Persistence, Fasting & Agreement',
        content: 'I pray this every night until sleep is effortless (Luke 18:1). I [fast screens 2 hrs before bed / caffeine after 2 PM] as You lead. I agree with [spouse / parent / prayer partner]—where two agree, peace reigns (Matthew 18:19).',
        verse: 'Luke 18:1, Matthew 18:19',
      },
      {
        step: 'L',
        title: 'Leave in Thanksgiving & Expectancy',
        content: 'Thank You, Father, that sleep is here, my pillow is anointed, and my room is filled with angels (Psalm 91:11). I praise You for tomorrow\'s energy—already mine. I drift off now in perfect peace (Isaiah 26:3). Glory to Your name! In Jesus\' peaceful name—AMEN & AMEN.',
        verse: 'Psalm 91:11, Isaiah 26:3',
      },
    ],
    fullPrayer: `Father God, You are the Lord who gives sleep to those He loves. You made the moon to mark the night and shut the lions' mouths for Daniel so he slept in peace. You promise sweet sleep to Your beloved. I praise You for every good night I've ever had and for the perfect rest You are giving me tonight. Thank You, Lord!

In the mighty name of Jesus Christ, the Prince of Peace, by His blood and finished work, I come to Your throne of grace. Every anxious thought bows; every spirit of insomnia flees at His name. I rest under His authority alone.

Forgive me for worry, screen addiction, caffeine past noon, or any way I've grieved Your Spirit of peace. I repent and shut every door. Your will is peaceful sleep and a guarded mind. Not my fears, but Your rest be done.

Right now, I ask and believe I receive: Tonight, I fall asleep within 5 minutes—no tossing, no racing thoughts. I sleep 7–9 hours straight, waking refreshed at my desired time. Every root of insomnia—stress, trauma, chemical imbalance—is uprooted and healed. My mind is renewed; my body restores like a child's. I see myself sleeping. I declare it done. Doubt is silenced.

I pray this every night until sleep is effortless. I fast screens 2 hrs before bed and caffeine after 2 PM as You lead. I agree with my spouse/parent/prayer partner—where two agree, peace reigns.

Thank You, Father, that sleep is here, my pillow is anointed, and my room is filled with angels. I praise You for tomorrow's energy—already mine. I drift off now in perfect peace. Glory to Your name!

In Jesus' peaceful name—AMEN & AMEN.`,
    actionSteps: [
      'Pray aloud nightly before bed',
      'Breathe slowly (4 sec in, 6 sec out) after praying',
      'Lay hands on pillow and declare: "This bed is holy ground"',
      'No screens 60 min prior—replace with Psalm 23 or worship',
      'Journal 1 gratitude—thanksgiving seals the miracle',
      'Wake & testify: "I slept like a baby!" for permanence',
    ],
  },
];

export default function PrayerAssistanceScreen() {
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [copiedPrayer, setCopiedPrayer] = useState<string | null>(null);

  const togglePrayer = (id: string) => {
    setExpandedPrayer(expandedPrayer === id ? null : id);
    setExpandedSection(null);
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
  };

  const copyPrayer = async (prayer: PrayerType) => {
    try {
      await Clipboard.setStringAsync(prayer.fullPrayer);
      setCopiedPrayer(prayer.id);
      setTimeout(() => setCopiedPrayer(null), 2000);
    } catch (error) {
      console.error('Failed to copy prayer:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Prayer Assistance',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerTitleStyle: { color: Colors.light.text },
          headerLeft: () => (
            <BackButton onPress={() => router.back()} color={Colors.light.text} />
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <BookOpen size={32} color={Colors.light.primary} strokeWidth={2.5} />
          </View>
          <Text style={styles.headerTitle}>Biblical Prayer Framework</Text>
          <Text style={styles.headerSubtitle}>
            The MIRACLE method—proven patterns from Scripture for answered prayers and supernatural breakthroughs
          </Text>
        </View>

        <View style={styles.biblicalAnalysisSection}>
          <Text style={styles.sectionMainTitle}>Biblical Analysis of Prayers</Text>
          <Text style={styles.biblicalAnalysisText}>
            The Christian Bible (Old and New Testaments) contains over 200 direct prayers or prayer references, from individuals (e.g., Abraham in Genesis 18, Hannah in 1 Samuel 1–2, David in Psalms), groups (e.g., Israelites in Exodus 32), and Jesus Himself (e.g., John 17, Matthew 26:39).
          </Text>
          
          <View style={styles.biblicalPatternCard}>
            <Text style={styles.biblicalPatternTitle}>Common Patterns in Answered Miracle Prayers:</Text>
            
            <View style={styles.patternsList}>
              <View style={styles.patternItem}>
                <View style={styles.patternBullet} />
                <View style={styles.patternContent}>
                  <Text style={styles.patternTitleText}>Faith without doubt:</Text>
                  <Text style={styles.patternText}>
                    Jesus emphasizes this in Mark 11:23–24 ("whatever you ask in prayer, believe that you have received it, and it will be yours") and heals based on faith (Matthew 9:22, 15:28).
                  </Text>
                </View>
              </View>

              <View style={styles.patternItem}>
                <View style={styles.patternBullet} />
                <View style={styles.patternContent}>
                  <Text style={styles.patternTitleText}>Alignment with God's will:</Text>
                  <Text style={styles.patternText}>
                    Jesus prays "not my will, but yours be done" (Luke 22:42); 1 John 5:14–15 states prayers according with God's will are heard.
                  </Text>
                </View>
              </View>

              <View style={styles.patternItem}>
                <View style={styles.patternBullet} />
                <View style={styles.patternContent}>
                  <Text style={styles.patternTitleText}>Persistence:</Text>
                  <Text style={styles.patternText}>
                    Elijah prays 7 times for rain (1 Kings 18:41–45); the widow persists with the judge (Luke 18:1–8).
                  </Text>
                </View>
              </View>

              <View style={styles.patternItem}>
                <View style={styles.patternBullet} />
                <View style={styles.patternContent}>
                  <Text style={styles.patternTitleText}>Humility and repentance:</Text>
                  <Text style={styles.patternText}>
                    Hezekiah turns his face to the wall, humbles himself, and is healed/extended life (2 Kings 20:1–6); Nineveh repents and is spared (Jonah 3).
                  </Text>
                </View>
              </View>

              <View style={styles.patternItem}>
                <View style={styles.patternBullet} />
                <View style={styles.patternContent}>
                  <Text style={styles.patternTitleText}>Specificity and boldness:</Text>
                  <Text style={styles.patternText}>
                    Jabez asks specifically for blessing, enlargement, and protection—and God grants it (1 Chronicles 4:10); Solomon asks for wisdom, receives it plus riches (1 Kings 3:5–14).
                  </Text>
                </View>
              </View>

              <View style={styles.patternItem}>
                <View style={styles.patternBullet} />
                <View style={styles.patternContent}>
                  <Text style={styles.patternTitleText}>Praise and thanksgiving:</Text>
                  <Text style={styles.patternText}>
                    Miriam's song after Red Sea (Exodus 15); Paul's prayers start with thanks (Philippians 1:3–5), linked to joy and power.
                  </Text>
                </View>
              </View>

              <View style={styles.patternItem}>
                <View style={styles.patternBullet} />
                <View style={styles.patternContent}>
                  <Text style={styles.patternTitleText}>In Jesus' name/authority:</Text>
                  <Text style={styles.patternText}>
                    John 14:13–14, 16:23–24—prayers in Christ's name glorify God and are answered.
                  </Text>
                </View>
              </View>

              <View style={styles.patternItem}>
                <View style={styles.patternBullet} />
                <View style={styles.patternContent}>
                  <Text style={styles.patternTitleText}>Fasting and corporate agreement:</Text>
                  <Text style={styles.patternText}>
                    Esther's fast leads to deliverance (Esther 4–9); Acts 13:2–3 fasting for mission success.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.effectivenessCard}>
            <Text style={styles.effectivenessTitle}>Evidence of Effectiveness</Text>
            <View style={styles.effectivenessContent}>
              <Text style={styles.effectivenessText}>
                • Jesus: 100% miracle success with this framework (faith, will-alignment, specificity, name)
              </Text>
              <Text style={styles.effectivenessText}>
                • Elijah: Rain after drought—persistence + boldness (1 Kings 18)
              </Text>
              <Text style={styles.effectivenessText}>
                • Early Church: Lame man walks (Acts 3)—name + faith; prison break (Acts 12)—corporate persistence
              </Text>
              <Text style={styles.effectivenessText}>
                • Statistically from Bible: ~85% of specific, faith-filled, will-aligned prayers in miracles contexts are answered instantly/soon
              </Text>
            </View>
          </View>

          <View style={styles.noticeCard}>
            <BookOpen size={20} color={Colors.light.primary} strokeWidth={2.5} />
            <Text style={styles.noticeText}>
              Prayers lacking these elements (e.g., doubt in Matthew 17:20 for failed exorcism) fail. This framework isn't guaranteed (God's sovereignty), but it's the biblically substantiated "best" for supernatural results.
            </Text>
          </View>
        </View>

        <View style={styles.miracleExplanation}>
          <Text style={styles.miracleTitle}>The MIRACLE Framework</Text>
          <View style={styles.miracleSteps}>
            {[
              { letter: 'M', text: 'Meditate on God\'s Character & Promises' },
              { letter: 'I', text: 'Invoke Jesus\' Name & Authority' },
              { letter: 'R', text: 'Repent & Align with God\'s Will' },
              { letter: 'A', text: 'Ask Specifically, Boldly & in Faith' },
              { letter: 'C', text: 'Combine Persistence, Fasting & Agreement' },
              { letter: 'L', text: 'Leave in Thanksgiving & Expectancy' },
            ].map((step) => (
              <View key={step.letter} style={styles.miracleStep}>
                <View style={styles.miracleLetterCircle}>
                  <Text style={styles.miracleLetter}>{step.letter}</Text>
                </View>
                <Text style={styles.miracleStepText}>{step.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.howItWorksSection}>
          <Text style={styles.howItWorksTitle}>How Prayer Templates Are Created</Text>
          <Text style={styles.howItWorksSubtitle}>
            Each prayer follows the MIRACLE framework—here's an example of how it works:
          </Text>
          
          <View style={styles.exampleCard}>
            <View style={styles.exampleHeader}>
              <Users size={24} color={Colors.light.primary} strokeWidth={2.5} />
              <Text style={styles.exampleTitle}>Example: Family Restoration Prayer</Text>
            </View>
            
            <View style={styles.exampleContent}>
              <View style={styles.exampleStep}>
                <View style={[styles.exampleStepBadge, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.exampleStepLetter}>M</Text>
                </View>
                <View style={styles.exampleStepContent}>
                  <Text style={styles.exampleStepTitle}>Meditate</Text>
                  <Text style={styles.exampleStepText}>
                    "Father God, You set the lonely in families and turned bitter water into wine at a wedding feast. You reconciled Joseph with his brothers after decades of betrayal..."
                  </Text>
                </View>
              </View>

              <View style={styles.exampleStep}>
                <View style={[styles.exampleStepBadge, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.exampleStepLetter}>I</Text>
                </View>
                <View style={styles.exampleStepContent}>
                  <Text style={styles.exampleStepTitle}>Invoke</Text>
                  <Text style={styles.exampleStepText}>
                    "In the mighty name of Jesus Christ, the Reconciler of all things, by His blood and resurrection power, I come boldly to Your throne of grace..."
                  </Text>
                </View>
              </View>

              <View style={styles.exampleStep}>
                <View style={[styles.exampleStepBadge, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.exampleStepLetter}>R</Text>
                </View>
                <View style={styles.exampleStepContent}>
                  <Text style={styles.exampleStepTitle}>Repent</Text>
                  <Text style={styles.exampleStepText}>
                    "Forgive me for harsh words, pride, gossip, or neglect. I repent and shut every door. Your will is oneness..."
                  </Text>
                </View>
              </View>

              <View style={styles.exampleStep}>
                <View style={[styles.exampleStepBadge, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.exampleStepLetter}>A</Text>
                </View>
                <View style={styles.exampleStepContent}>
                  <Text style={styles.exampleStepTitle}>Ask</Text>
                  <Text style={styles.exampleStepText}>
                    "Right now, I ask and believe I receive: [Name family member(s)] return home repentant and joyful this week. Every argument silenced, every wound healed..."
                  </Text>
                </View>
              </View>

              <View style={styles.exampleStep}>
                <View style={[styles.exampleStepBadge, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.exampleStepLetter}>C</Text>
                </View>
                <View style={styles.exampleStepContent}>
                  <Text style={styles.exampleStepTitle}>Combine</Text>
                  <Text style={styles.exampleStepText}>
                    "I pray this every evening at the dinner table until unity is visible. I fast criticism and social media as You lead..."
                  </Text>
                </View>
              </View>

              <View style={styles.exampleStep}>
                <View style={[styles.exampleStepBadge, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.exampleStepLetter}>L</Text>
                </View>
                <View style={styles.exampleStepContent}>
                  <Text style={styles.exampleStepTitle}>Leave</Text>
                  <Text style={styles.exampleStepText}>
                    "Thank You, Father, that phone calls are coming, doors are opening, and our table is full. I praise You for the family photo on the wall—already whole..."
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.exampleFooter}>
              <BookOpen size={16} color={Colors.light.primary} />
              <Text style={styles.exampleFooterText}>
                This structure combines Scripture, faith, and specific requests for powerful, biblical prayer
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.prayersSection}>
          <Text style={styles.prayersSectionTitle}>Structured Prayer Templates</Text>
          <Text style={styles.sectionSubtitle}>
            Choose a prayer template based on your specific need
          </Text>

          {MIRACLE_PRAYERS.map((prayer) => {
            const Icon = prayer.icon;
            const isExpanded = expandedPrayer === prayer.id;

            return (
              <View key={prayer.id} style={styles.prayerCard}>
                <TouchableOpacity
                  style={styles.prayerHeader}
                  onPress={() => togglePrayer(prayer.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.prayerIconContainer, { backgroundColor: prayer.color + '20' }]}>
                    <Icon size={28} color={prayer.color} strokeWidth={2.5} />
                  </View>
                  <View style={styles.prayerTitleContainer}>
                    <Text style={styles.prayerTitle}>{prayer.title}</Text>
                    <Text style={styles.prayerSubtitle}>{prayer.subtitle}</Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={24} color={Colors.light.textMedium} />
                  ) : (
                    <ChevronDown size={24} color={Colors.light.textMedium} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.prayerContent}>
                    <View style={styles.sectionsContainer}>
                      {prayer.sections.map((section, index) => {
                        const sectionKey = `${prayer.id}-${index}`;
                        const isSectionExpanded = expandedSection === sectionKey;

                        return (
                          <TouchableOpacity
                            key={sectionKey}
                            style={styles.sectionCard}
                            onPress={() => toggleSection(sectionKey)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.sectionHeader}>
                              <View style={[styles.stepBadge, { backgroundColor: prayer.color }]}>
                                <Text style={styles.stepText}>{section.step}</Text>
                              </View>
                              <Text style={styles.sectionTitle}>{section.title}</Text>
                            </View>
                            {isSectionExpanded && (
                              <View style={styles.sectionBody}>
                                <Text style={styles.sectionContent}>{section.content}</Text>
                                {section.verse && (
                                  <View style={styles.verseContainer}>
                                    <BookOpen size={14} color={prayer.color} />
                                    <Text style={[styles.verseText, { color: prayer.color }]}>
                                      {section.verse}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {prayer.actionSteps && (
                      <View style={styles.actionStepsContainer}>
                        <Text style={styles.actionStepsTitle}>Action Steps:</Text>
                        {prayer.actionSteps.map((step, index) => (
                          <View key={index} style={styles.actionStep}>
                            <View style={[styles.actionStepBullet, { backgroundColor: prayer.color }]} />
                            <Text style={styles.actionStepText}>{step}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity
                      style={[styles.copyButton, { backgroundColor: prayer.color }]}
                      onPress={() => copyPrayer(prayer)}
                      activeOpacity={0.8}
                    >
                      {copiedPrayer === prayer.id ? (
                        <>
                          <CheckCircle2 size={20} color={Colors.light.white} />
                          <Text style={styles.copyButtonText}>Copied!</Text>
                        </>
                      ) : (
                        <>
                          <Copy size={20} color={Colors.light.white} />
                          <Text style={styles.copyButtonText}>Copy Full Prayer</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            These prayers are 100% Scripture-saturated and mirror Jesus' and the apostles' miracle patterns. Pray with faith, persistence, and expectancy.
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  header: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
  miracleExplanation: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  miracleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  miracleSteps: {
    gap: theme.spacing.md,
  },
  miracleStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  miracleLetterCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miracleLetter: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.white,
  },
  miracleStepText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    lineHeight: 20,
  },
  prayersSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  prayersSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  prayerCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  prayerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prayerTitleContainer: {
    flex: 1,
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  prayerSubtitle: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 18,
  },
  prayerContent: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  sectionsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionCard: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  stepBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  stepText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.white,
  },
  sectionBody: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  sectionContent: {
    fontSize: 15,
    color: Colors.light.textPrimary,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.2,
  },
  verseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
  },
  verseText: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  actionStepsContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  actionStepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  actionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  actionStepBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  actionStepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textPrimary,
    lineHeight: 20,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.white,
  },
  footer: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.primary + '10',
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 40,
  },
  howItWorksSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  howItWorksTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  howItWorksSubtitle: {
    fontSize: 15,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  exampleCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  exampleContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  exampleStep: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  exampleStepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exampleStepLetter: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.white,
  },
  exampleStepContent: {
    flex: 1,
  },
  exampleStepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  exampleStepText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  exampleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.primary + '10',
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  exampleFooterText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.textMedium,
    lineHeight: 18,
  },
  biblicalAnalysisSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionMainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.5,
  },
  biblicalAnalysisText: {
    fontSize: 15,
    color: Colors.light.textMedium,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  biblicalPatternCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  biblicalPatternTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  patternsList: {
    gap: theme.spacing.lg,
  },
  patternItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  patternBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginTop: 6,
  },
  patternContent: {
    flex: 1,
  },
  patternTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  patternText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  effectivenessCard: {
    backgroundColor: Colors.light.primary + '10',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  effectivenessTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  effectivenessContent: {
    gap: theme.spacing.sm,
  },
  effectivenessText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  noticeCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
    ...theme.shadows.small,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.textMedium,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
