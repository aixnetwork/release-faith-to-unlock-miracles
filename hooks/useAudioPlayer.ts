import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface AudioPlayerState {
  isLoading: boolean;
  isPlaying: boolean;
  duration: number;
  position: number;
  error: string | null;
}

export function useAudioPlayer(audioUrl?: string) {
  const [state, setState] = useState<AudioPlayerState>({
    isLoading: false,
    isPlaying: false,
    duration: 0,
    position: 0,
    error: null,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const positionUpdateRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (positionUpdateRef.current) {
        clearInterval(positionUpdateRef.current);
      }
    };
  }, []);

  const loadAudio = async (url: string) => {
    if (Platform.OS === 'web') {
      setState(prev => ({ ...prev, error: 'Audio playback not supported on web' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false }
      );

      soundRef.current = sound;

      // Get duration
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          duration: status.durationMillis || 0,
        }));
      }

      // Set up status update callback
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setState(prev => ({
            ...prev,
            isPlaying: status.isPlaying,
            position: status.positionMillis || 0,
          }));
        }
      });

    } catch (error: any) {
      console.error('Error loading audio:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load audio',
      }));
    }
  };

  const play = async () => {
    if (Platform.OS === 'web') {
      setState(prev => ({ ...prev, error: 'Audio playback not supported on web' }));
      return;
    }

    try {
      if (!soundRef.current) {
        if (audioUrl) {
          await loadAudio(audioUrl);
        }
        return;
      }

      await soundRef.current.playAsync();
    } catch (error: any) {
      console.error('Error playing audio:', error);
      setState(prev => ({ ...prev, error: error.message || 'Failed to play audio' }));
    }
  };

  const pause = async () => {
    if (Platform.OS === 'web') return;

    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
    } catch (error: any) {
      console.error('Error pausing audio:', error);
      setState(prev => ({ ...prev, error: error.message || 'Failed to pause audio' }));
    }
  };

  const stop = async () => {
    if (Platform.OS === 'web') return;

    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
      }
    } catch (error: any) {
      console.error('Error stopping audio:', error);
      setState(prev => ({ ...prev, error: error.message || 'Failed to stop audio' }));
    }
  };

  const seekTo = async (positionMillis: number) => {
    if (Platform.OS === 'web') return;

    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(positionMillis);
      }
    } catch (error: any) {
      console.error('Error seeking audio:', error);
      setState(prev => ({ ...prev, error: error.message || 'Failed to seek audio' }));
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    ...state,
    loadAudio,
    play,
    pause,
    stop,
    seekTo,
    formatTime,
  };
}