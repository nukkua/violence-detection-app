import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Animated,
    AppState,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/IconSymbol';

import {
    useAudioRecorder,
    useAudioRecorderState,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
} from 'expo-audio';

import { useStorageState } from '@/hooks/useStorageState';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GuardianAudioRecorder() {
    // ========================================
    // STATE MANAGEMENT
    // ========================================

    const [[isLoadingRecordings, recordingsData], setRecordingsData] = useStorageState('audio_recordings');
    const [recordings, setRecordings] = useState([]);
    const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordingStartTime, setRecordingStartTime] = useState(null);
    const [playbackProgress, setPlaybackProgress] = useState(0);
    const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
    const [isPlaybackPaused, setIsPlaybackPaused] = useState(false);

    // ========================================
    // REFS
    // ========================================

    const currentPlayerRef = useRef(null);
    const playbackCheckIntervalRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const pausedPositionRef = useRef(0);
    const playbackStartTimeRef = useRef(0);
    const recordingTimerRef = useRef(null);

    // ========================================
    // AUDIO SETUP
    // ========================================

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);
    
    // Enhanced animations
    const pulseAnim = useMemo(() => new Animated.Value(1), []);
    const recordingIndicatorAnim = useMemo(() => new Animated.Value(0), []);
    const slideUpAnim = useMemo(() => new Animated.Value(50), []);
    const fadeInAnim = useMemo(() => new Animated.Value(0), []);

    // ========================================
    // EFFECTS
    // ========================================

    // Subtle recording button animation
    useEffect(() => {
        if (recorderState.isRecording) {
            // Very subtle pulse
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.02,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                ])
            );
            
            // Subtle recording indicator
            const indicatorAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(recordingIndicatorAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(recordingIndicatorAnim, {
                        toValue: 0.6,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            );

            pulseAnimation.start();
            indicatorAnimation.start();
            
            return () => {
                pulseAnimation.stop();
                indicatorAnimation.stop();
            };
        } else {
            pulseAnim.setValue(1);
            recordingIndicatorAnim.setValue(0);
        }
    }, [recorderState.isRecording, pulseAnim, recordingIndicatorAnim]);

    // Initial load animations
    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideUpAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(fadeInAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // REAL background-aware recording timer
    useEffect(() => {
        if (recorderState.isRecording && recordingStartTime) {
            const updateTimer = () => {
                const now = Date.now();
                const elapsed = Math.floor((now - recordingStartTime) / 1000);
                setRecordingTime(elapsed);
            };

            // Update immediately
            updateTimer();
            
            // Clear any existing timer
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            
            // Start new timer
            recordingTimerRef.current = setInterval(updateTimer, 1000);
            
            return () => {
                if (recordingTimerRef.current) {
                    clearInterval(recordingTimerRef.current);
                    recordingTimerRef.current = null;
                }
            };
        } else {
            // Not recording - clear timer
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
            if (!recorderState.isRecording) {
                setRecordingTime(0);
            }
        }
    }, [recorderState.isRecording, recordingStartTime]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Audio cleanup
            if (currentPlayerRef.current) {
                try {
                    currentPlayerRef.current.pause();
                    currentPlayerRef.current.release();
                } catch (error) {
                    console.log('Cleanup error:', error);
                }
                currentPlayerRef.current = null;
            }
            
            // Interval cleanup
            if (playbackCheckIntervalRef.current) {
                clearInterval(playbackCheckIntervalRef.current);
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, []);

    // Load recordings from storage
    useEffect(() => {
        if (!isLoadingRecordings && recordingsData) {
            try {
                const parsedRecordings = JSON.parse(recordingsData);
                loadAndValidateRecordings(parsedRecordings);
            } catch (error) {
                console.error('Error parsing recordings data:', error);
                setRecordings([]);
            }
        } else if (!isLoadingRecordings && !recordingsData) {
            if (recordings.length > 0) {
                setRecordings([]);
            }
        }
    }, [isLoadingRecordings, recordingsData]);

    // App state handler for background sync
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'active' && recorderState.isRecording && recordingStartTime) {
                // App became active while recording - sync timer immediately
                const now = Date.now();
                const elapsed = Math.floor((now - recordingStartTime) / 1000);
                setRecordingTime(elapsed);
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        
        return () => {
            subscription?.remove();
        };
    }, [recorderState.isRecording, recordingStartTime]);

    // Request permissions on mount
    useEffect(() => {
        requestPermissions();
    }, []);

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const formatDate = useCallback((timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    // ========================================
    // STORAGE FUNCTIONS
    // ========================================

    const loadAndValidateRecordings = useCallback(async (parsedRecordings) => {
        try {
            const existingRecordings = [];
            for (const recording of parsedRecordings) {
                const fileInfo = await FileSystem.getInfoAsync(recording.uri);
                if (fileInfo.exists) {
                    existingRecordings.push(recording);
                }
            }

            if (JSON.stringify(existingRecordings) !== JSON.stringify(recordings)) {
                setRecordings(existingRecordings);

                if (existingRecordings.length !== parsedRecordings.length) {
                    setRecordingsData(JSON.stringify(existingRecordings));
                }
            }
        } catch (error) {
            console.error('Error validating recordings:', error);
            setRecordings([]);
        }
    }, [recordings, setRecordingsData]);

    const saveRecordings = useCallback(async (newRecordings) => {
        try {
            setRecordingsData(JSON.stringify(newRecordings));
        } catch (error) {
            console.error('Error saving recordings:', error);
        }
    }, [setRecordingsData]);

    // ========================================
    // AUDIO PERMISSION & MODE FUNCTIONS
    // ========================================

    const requestPermissions = useCallback(async () => {
        try {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert(
                    'Permisos requeridos',
                    'Se necesitan permisos de micrófono para grabar audio'
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting permissions:', error);
            return false;
        }
    }, []);

    const setRecordingMode = useCallback(async () => {
        try {
            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
                interruptionMode: 'duckOthers',
                shouldPlayInBackground: true,
            });
        } catch (error) {
            console.error('Error setting recording mode:', error);
        }
    }, []);

    const setPlaybackMode = useCallback(async () => {
        try {
            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: false,
                interruptionMode: 'duckOthers',
                shouldPlayInBackground: true,
            });
        } catch (error) {
            console.error('Error setting playback mode:', error);
        }
    }, []);

    // ========================================
    // RECORDING FUNCTIONS
    // ========================================

    const startRecording = useCallback(async () => {
        try {
            if (currentlyPlaying) {
                Alert.alert('Audio en reproducción', 'Detén la reproducción antes de grabar un nuevo audio');
                return;
            }

            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            await setRecordingMode();

            // Clean up any existing playback
            if (currentPlayerRef.current) {
                try {
                    await currentPlayerRef.current.pause();
                    currentPlayerRef.current.release();
                } catch (error) {
                    console.log('Player cleanup error:', error);
                } finally {
                    currentPlayerRef.current = null;
                    setCurrentlyPlaying(null);
                    setIsPlaybackPaused(false);

                    if (playbackCheckIntervalRef.current) {
                        clearInterval(playbackCheckIntervalRef.current);
                        playbackCheckIntervalRef.current = null;
                    }
                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                        progressIntervalRef.current = null;
                    }
                }
            }

            // Start recording
            await audioRecorder.prepareToRecordAsync();
            
            // Set the exact start time
            const startTime = Date.now();
            setRecordingStartTime(startTime);
            
            await audioRecorder.record();
        } catch (error) {
            console.error('Error starting recording:', error);
            Alert.alert('Error', 'No se pudo iniciar la grabación');
            setRecordingStartTime(null);
        }
    }, [requestPermissions, setRecordingMode, audioRecorder, currentlyPlaying]);

    const stopRecording = useCallback(async () => {
        try {
            if (!recorderState.isRecording || !recordingStartTime) return;

            await audioRecorder.stop();
            const uri = audioRecorder.uri;
            
            // Calculate the EXACT duration
            const exactDuration = Math.floor((Date.now() - recordingStartTime) / 1000);
            
            await setPlaybackMode();

            if (uri) {
                const recordingsDir = `${FileSystem.documentDirectory}recordings/`;
                await FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true });

                const timestamp = Date.now();
                const fileName = `recording_${timestamp}.m4a`;
                const newUri = `${recordingsDir}${fileName}`;

                await FileSystem.moveAsync({ from: uri, to: newUri });

                const newRecording = {
                    id: timestamp.toString(),
                    uri: newUri,
                    name: `Grabación ${recordings.length + 1}`,
                    date: timestamp,
                    duration: exactDuration,
                };

                const updatedRecordings = [newRecording, ...recordings];
                setRecordings(updatedRecordings);
                await saveRecordings(updatedRecordings);
            }
            
            // Reset states
            setRecordingStartTime(null);
            setRecordingTime(0);
            
        } catch (error) {
            console.error('Error stopping recording:', error);
            Alert.alert('Error', 'No se pudo guardar la grabación');
        }
    }, [recorderState.isRecording, audioRecorder, recordings, recordingStartTime, saveRecordings, setPlaybackMode]);

    // Fixed playback function with proper pause/resume logic
    const playRecording = useCallback(async (recordingItem) => {
        try {
            // If same recording is currently playing/paused, toggle pause/resume
            if (currentlyPlaying === recordingItem.id && currentPlayerRef.current) {
                if (isPlaybackPaused) {
                    // RESUME: Continue from exact paused position
                    await currentPlayerRef.current.play();
                    setIsPlaybackPaused(false);
                    
                    // Resume progress tracking from paused position
                    playbackStartTimeRef.current = Date.now() - (pausedPositionRef.current * 1000);
                    
                    progressIntervalRef.current = setInterval(() => {
                        const elapsed = (Date.now() - playbackStartTimeRef.current) / 1000;
                        const progress = Math.min(elapsed / recordingItem.duration, 1);

                        setPlaybackProgress(progress);
                        setCurrentPlaybackTime(Math.floor(elapsed));

                        if (progress >= 0.998) {
                            // Clean finish
                            setCurrentlyPlaying(null);
                            setPlaybackProgress(0);
                            setCurrentPlaybackTime(0);
                            setIsPlaybackPaused(false);
                            pausedPositionRef.current = 0;

                            if (progressIntervalRef.current) {
                                clearInterval(progressIntervalRef.current);
                                progressIntervalRef.current = null;
                            }

                            if (currentPlayerRef.current) {
                                try {
                                    currentPlayerRef.current.release();
                                } catch (error) {
                                    console.log('Player cleanup error');
                                }
                                currentPlayerRef.current = null;
                            }
                        }
                    }, 100);
                    
                } else {
                    // PAUSE: Just pause without changing position
                    await currentPlayerRef.current.pause();
                    setIsPlaybackPaused(true);
                    pausedPositionRef.current = currentPlaybackTime;
                    
                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                        progressIntervalRef.current = null;
                    }
                }
                return;
            }

            // Stop any current playback and start new
            if (currentPlayerRef.current) {
                try {
                    await currentPlayerRef.current.pause();
                    currentPlayerRef.current.release();
                } catch (error) {
                    console.log('Error stopping previous playback');
                }
                currentPlayerRef.current = null;

                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
            }

            await setPlaybackMode();

            // Create new player and start playback from beginning
            const { createAudioPlayer } = await import('expo-audio');
            const player = createAudioPlayer({ uri: recordingItem.uri });

            currentPlayerRef.current = player;
            setCurrentlyPlaying(recordingItem.id);
            setPlaybackProgress(0);
            setCurrentPlaybackTime(0);
            setIsPlaybackPaused(false);
            pausedPositionRef.current = 0;

            // Setup finish listener
            player.addListener('playbackStatusUpdate', (status) => {
                if (status.didJustFinish) {
                    setCurrentlyPlaying(null);
                    setPlaybackProgress(0);
                    setCurrentPlaybackTime(0);
                    setIsPlaybackPaused(false);
                    pausedPositionRef.current = 0;

                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                        progressIntervalRef.current = null;
                    }

                    if (currentPlayerRef.current) {
                        try {
                            currentPlayerRef.current.release();
                        } catch (error) {
                            console.log('Player cleanup error');
                        }
                        currentPlayerRef.current = null;
                    }
                }
            });

            // Start progress tracking from the beginning
            playbackStartTimeRef.current = Date.now();
            progressIntervalRef.current = setInterval(() => {
                const elapsed = (Date.now() - playbackStartTimeRef.current) / 1000;
                const progress = Math.min(elapsed / recordingItem.duration, 1);

                setPlaybackProgress(progress);
                setCurrentPlaybackTime(Math.floor(elapsed));

                if (progress >= 0.998) {
                    // Clean finish
                    setCurrentlyPlaying(null);
                    setPlaybackProgress(0);
                    setCurrentPlaybackTime(0);
                    setIsPlaybackPaused(false);
                    pausedPositionRef.current = 0;

                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                        progressIntervalRef.current = null;
                    }

                    if (currentPlayerRef.current) {
                        try {
                            currentPlayerRef.current.release();
                        } catch (error) {
                            console.log('Player cleanup error');
                        }
                        currentPlayerRef.current = null;
                    }
                }
            }, 100);

            await player.play();

        } catch (error) {
            console.error('Error playing recording:', error);
            Alert.alert('Error', 'No se pudo reproducir la grabación');
            
            // Reset all states on error
            setCurrentlyPlaying(null);
            setPlaybackProgress(0);
            setCurrentPlaybackTime(0);
            setIsPlaybackPaused(false);
            pausedPositionRef.current = 0;

            if (currentPlayerRef.current) {
                try {
                    currentPlayerRef.current.release();
                } catch (releaseError) {
                    console.log('Error releasing player');
                }
                currentPlayerRef.current = null;
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        }
    }, [currentlyPlaying, isPlaybackPaused, currentPlaybackTime, setPlaybackMode]);

    // Enhanced delete function with smooth removal animation
    const deleteRecording = useCallback((recordingToDelete) => {
        Alert.alert(
            'Eliminar grabación',
            '¿Estás seguro de que quieres eliminar esta grabación?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Stop playback if this recording is currently playing
                            if (currentlyPlaying === recordingToDelete.id) {
                                if (currentPlayerRef.current) {
                                    try {
                                        await currentPlayerRef.current.pause();
                                        currentPlayerRef.current.release();
                                    } catch (error) {
                                        console.log('Error stopping playback during delete');
                                    }
                                    currentPlayerRef.current = null;
                                }
                                
                                if (progressIntervalRef.current) {
                                    clearInterval(progressIntervalRef.current);
                                    progressIntervalRef.current = null;
                                }
                                
                                setCurrentlyPlaying(null);
                                setPlaybackProgress(0);
                                setCurrentPlaybackTime(0);
                                setIsPlaybackPaused(false);
                                pausedPositionRef.current = 0;
                            }
                            
                            // Try to delete the file, but don't fail if it doesn't work in Expo Go
                            try {
                                const cleanUri = recordingToDelete.uri.replace(/\/+$/, '');
                                await FileSystem.deleteAsync(cleanUri, { idempotent: true });
                                console.log('File deleted successfully');
                            } catch (fileError) {
                                console.log('Could not delete physical file (normal in Expo Go):', fileError.message);
                            }
                            
                            // Mark recording for deletion animation
                            setRecordings(prevRecordings => 
                                prevRecordings.map(recording => 
                                    recording.id === recordingToDelete.id 
                                        ? { ...recording, isDeleting: true }
                                        : recording
                                )
                            );
                            
                            // After animation, remove from list
                            setTimeout(async () => {
                                const updatedRecordings = recordings.filter(r => r.id !== recordingToDelete.id);
                                setRecordings(updatedRecordings);
                                await saveRecordings(updatedRecordings);
                            }, 400); // Match animation duration
                            
                        } catch (error) {
                            console.error('Error deleting recording:', error);
                            // Even if there's an error, try to remove from list
                            try {
                                const updatedRecordings = recordings.filter(r => r.id !== recordingToDelete.id);
                                setRecordings(updatedRecordings);
                                await saveRecordings(updatedRecordings);
                            } catch (listError) {
                                Alert.alert('Error', 'No se pudo eliminar la grabación de la lista');
                            }
                        }
                    },
                },
            ]
        );
    }, [recordings, saveRecordings, currentlyPlaying]);

    // ========================================
    // RENDER FUNCTIONS
    // ========================================

    const renderRecordingItem = useCallback(({ item, index }) => (
        <RecordingItem
            item={item}
            index={index}
            currentlyPlaying={currentlyPlaying}
            playbackProgress={playbackProgress}
            currentPlaybackTime={currentPlaybackTime}
            isPlaybackPaused={isPlaybackPaused}
            onPlay={playRecording}
            onDelete={deleteRecording}
            formatDate={formatDate}
            formatTime={formatTime}
        />
    ), [currentlyPlaying, playbackProgress, currentPlaybackTime, isPlaybackPaused, playRecording, deleteRecording, formatDate, formatTime]);

    const keyExtractor = useCallback((item) => item.id, []);

    // ========================================
    // MAIN RENDER
    // ========================================

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.backgroundGradient}
            />

            <Animated.View style={[styles.content, { opacity: fadeInAnim }]}>
                {/* Enhanced Recording Section */}
                <Animated.View style={[
                    styles.recordingSection,
                    { transform: [{ translateY: slideUpAnim }] }
                ]}>
                    {recorderState.isRecording && (
                        <View style={styles.recordingStatus}>
                            <View style={styles.recordingIndicator}>
                                <Animated.View 
                                    style={[
                                        styles.recordingDot,
                                        { opacity: recordingIndicatorAnim }
                                    ]} 
                                />
                            </View>
                            <View style={styles.recordingTextContainer}>
                                <Text style={styles.recordingText}>Grabando</Text>
                                <Text style={styles.recordingTimer}>{formatTime(recordingTime)}</Text>
                            </View>
                        </View>
                    )}

                    <Animated.View style={[
                        styles.recordButtonContainer,
                        { transform: [{ scale: pulseAnim }] }
                    ]}>
                        <TouchableOpacity
                            style={[
                                styles.recordButton,
                                recorderState.isRecording && styles.recordButtonActive
                            ]}
                            onPress={recorderState.isRecording ? stopRecording : startRecording}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={recorderState.isRecording ? 
                                    ['#ef4444', '#dc2626'] : 
                                    ['#22c55e', '#16a34a']
                                }
                                style={styles.recordButtonGradient}
                            >
                                <View style={[
                                    styles.recordButtonInner,
                                    recorderState.isRecording && styles.recordButtonInnerActive
                                ]} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    <Text style={styles.recordingInstruction}>
                        {recorderState.isRecording ? 'Toca para detener' : 'Toca para grabar'}
                    </Text>
                </Animated.View>

                {/* Enhanced Recordings List */}
                <View style={styles.listSection}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>
                            Grabaciones
                        </Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{recordings.length}</Text>
                        </View>
                    </View>

                    {recordings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <IconSymbol name="waveform" size={48} color="#d1d5db" />
                            </View>
                            <Text style={styles.emptyStateText}>No hay grabaciones</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Toca el botón de grabación para comenzar
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={recordings}
                            keyExtractor={keyExtractor}
                            renderItem={renderRecordingItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={10}
                            windowSize={10}
                        />
                    )}
                </View>
            </Animated.View>
        </View>
    );
}

// ============================================================================
// ENHANCED RECORDING ITEM COMPONENT
// ============================================================================

const RecordingItem = React.memo(({
    item,
    index,
    currentlyPlaying,
    playbackProgress,
    currentPlaybackTime,
    isPlaybackPaused,
    onPlay,
    onDelete,
    formatDate,
    formatTime
}) => {
    // Check if THIS specific item is playing
    const isThisItemPlaying = currentlyPlaying === item.id;
    const isThisItemPaused = isThisItemPlaying && isPlaybackPaused;
    const slideInAnim = useMemo(() => new Animated.Value(50), []);
    const fadeInAnim = useMemo(() => new Animated.Value(0), []);
    const waveAnim = useMemo(() => new Animated.Value(0), []);
    const scaleAnim = useMemo(() => new Animated.Value(1), []);
    const progressAnim = useMemo(() => new Animated.Value(0), []);
    const deleteAnim = useMemo(() => new Animated.Value(1), []);

    useEffect(() => {
        // Staggered entrance animation
        Animated.parallel([
            Animated.timing(slideInAnim, {
                toValue: 0,
                duration: 600,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(fadeInAnim, {
                toValue: 1,
                duration: 800,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [index]);

    // Delete animation
    useEffect(() => {
        if (item.isDeleting) {
            Animated.parallel([
                Animated.timing(deleteAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideInAnim, {
                    toValue: -100,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [item.isDeleting]);

    // Wave animation ONLY for this specific item when it's playing and not paused
    useEffect(() => {
        if (isThisItemPlaying && !isPlaybackPaused) {
            const waveAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(waveAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: false,
                    }),
                    Animated.timing(waveAnim, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: false,
                    }),
                ])
            );
            waveAnimation.start();
            return () => waveAnimation.stop();
        } else {
            waveAnim.setValue(0);
        }
    }, [isThisItemPlaying, isPlaybackPaused]);

    // Progress animation ONLY for this specific item
    useEffect(() => {
        if (isThisItemPlaying) {
            Animated.timing(progressAnim, {
                toValue: playbackProgress,
                duration: 100,
                useNativeDriver: false,
            }).start();
        } else {
            progressAnim.setValue(0);
        }
    }, [isThisItemPlaying, playbackProgress]);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.98,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
        
        onPlay(item);
    };

    const getPlayButtonIcon = () => {
        if (isThisItemPlaying) {
            return isPlaybackPaused ? 'play.fill' : 'pause.fill';
        }
        return 'play.fill';
    };

    // Get border color based on state
    const getBorderColor = () => {
        if (isThisItemPaused) return '#f59e0b'; // Orange for paused
        if (isThisItemPlaying) return '#22c55e'; // Green for playing
        return '#e5e7eb'; // Default gray
    };

    return (
        <Animated.View
            style={[
                styles.recordingItem,
                {
                    transform: [
                        { translateY: slideInAnim },
                        { scale: scaleAnim }
                    ],
                    opacity: item.isDeleting ? deleteAnim : fadeInAnim,
                    borderColor: getBorderColor(),
                },
                (isThisItemPlaying || isThisItemPaused) && styles.recordingItemActive
            ]}
        >
            <LinearGradient
                colors={isThisItemPlaying ? 
                    ['#ffffff', '#f8fafc'] : 
                    ['#ffffff', '#ffffff']
                }
                style={styles.recordingItemGradient}
            />

            <View style={styles.recordingContent}>
                <View style={styles.recordingInfo}>
                    <View style={styles.recordingNameContainer}>
                        <Text style={[
                            styles.recordingName,
                            isThisItemPlaying && styles.recordingNamePlaying,
                            isThisItemPaused && styles.recordingNamePaused
                        ]}>
                            {item.name}
                        </Text>
                        
                        {/* Status ONLY for this specific item when playing */}
                        {isThisItemPlaying && (
                            <View style={styles.statusContainer}>
                                {isPlaybackPaused ? (
                                    <View style={styles.pausedBadge}>
                                        <Text style={styles.pausedText}>Pausado</Text>
                                    </View>
                                ) : (
                                    <View style={styles.playingIndicator}>
                                        {[0, 1, 2].map((i) => (
                                            <Animated.View
                                                key={i}
                                                style={[
                                                    styles.playingBar,
                                                    {
                                                        transform: [{
                                                            scaleY: waveAnim.interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: [0.5, 1.1 + (i * 0.1)]
                                                            })
                                                        }]
                                                    }
                                                ]}
                                            />
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    <Text style={[
                        styles.recordingDate,
                        isThisItemPlaying && styles.recordingDatePlaying
                    ]}>
                        {formatDate(item.date)}
                    </Text>

                    <View style={styles.recordingTimeContainer}>
                        {isThisItemPlaying ? (
                            <Text style={styles.currentTimeText}>
                                {formatTime(currentPlaybackTime)} / {formatTime(item.duration)}
                            </Text>
                        ) : (
                            <Text style={styles.recordingDuration}>
                                {formatTime(item.duration)}
                            </Text>
                        )}
                    </View>

                    {/* Progress bar ONLY for this specific item */}
                    {isThisItemPlaying && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressTrack}>
                                <Animated.View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: progressAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0%', '100%'],
                                                extrapolate: 'clamp',
                                            }),
                                            backgroundColor: isPlaybackPaused ? '#f59e0b' : '#22c55e'
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.recordingActions}>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            styles.playButton,
                            isThisItemPlaying && styles.activeButton,
                            isThisItemPaused && styles.pausedButton
                        ]}
                        onPress={handlePress}
                        activeOpacity={0.8}
                    >
                        <IconSymbol
                            name={getPlayButtonIcon()}
                            size={16}
                            color={isThisItemPlaying ? '#ffffff' : '#6b7280'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => onDelete(item)}
                        activeOpacity={0.8}
                    >
                        <IconSymbol
                            name="trash"
                            size={16}
                            color="#ef4444"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
});

// ============================================================================
// MODERN STYLES - MERU/VERCEL INSPIRED
// ============================================================================

const styles = StyleSheet.create({
    // Main container
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },

    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },

    content: {
        flex: 1,
        paddingHorizontal: 24,
    },

    // Enhanced Recording section
    recordingSection: {
        alignItems: 'center',
        paddingVertical: 48,
        marginBottom: 24,
    },

    recordingStatus: {
        alignItems: 'center',
        marginBottom: 32,
        backgroundColor: 'rgba(239, 68, 68, 0.06)',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 20,
        // Removed border completely for cleaner look
    },

    recordingIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'transparent',
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 4,
    },

    recordingTextContainer: {
        alignItems: 'center',
    },

    recordingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ef4444',
        letterSpacing: 0.5,
        marginBottom: 4,
    },

    recordingTimer: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },

    recordButtonContainer: {
        marginBottom: 24,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
    },

    recordButton: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    recordButtonActive: {
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },

    recordButtonGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 42,
        justifyContent: 'center',
        alignItems: 'center',
    },

    recordButtonInner: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },

    recordButtonInnerActive: {
        borderRadius: 6,
        width: 24,
        height: 24,
    },

    recordingInstruction: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
        textAlign: 'center',
    },

    // Enhanced List section
    listSection: {
        flex: 1,
        marginBottom: 20,
    },

    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    listTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        letterSpacing: -0.5,
    },

    countBadge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },

    countText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },

    listContent: {
        paddingBottom: 100,
    },

    // Enhanced Recording item with fixed layout
    recordingItem: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },

    recordingItemPlaying: {
        borderColor: '#22c55e',
        shadowColor: '#22c55e',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },

    recordingItemActive: {
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },

    recordingItemGradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },

    // Fixed content layout
    recordingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },

    recordingInfo: {
        flex: 1,
        marginRight: 16,
    },

    recordingNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    recordingName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
        letterSpacing: -0.2,
        flex: 1,
    },

    recordingNamePlaying: {
        color: '#059669',
        fontWeight: '700',
    },

    recordingNamePaused: {
        color: '#d97706',
        fontWeight: '700',
    },

    statusContainer: {
        marginLeft: 12,
    },

    playingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },

    playingBar: {
        width: 3,
        height: 16,
        backgroundColor: '#22c55e',
        borderRadius: 1.5,
    },

    pausedBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },

    pausedText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#f59e0b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    recordingDate: {
        fontSize: 14,
        color: '#9ca3af',
        fontWeight: '500',
        marginBottom: 8,
    },

    recordingDatePlaying: {
        color: '#6b7280',
    },

    recordingTimeContainer: {
        marginBottom: 12,
    },

    recordingDuration: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
        fontFamily: 'monospace',
    },

    currentTimeText: {
        fontSize: 13,
        color: '#059669',
        fontWeight: '600',
        fontFamily: 'monospace',
    },

    // Enhanced Progress bar
    progressContainer: {
        marginTop: 4,
    },

    progressTrack: {
        height: 3,
        backgroundColor: '#f3f4f6',
        borderRadius: 2,
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        borderRadius: 2,
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },

    // Fixed Action buttons layout
    recordingActions: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
    },

    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },

    playButton: {
        backgroundColor: '#f9fafb',
    },

    activeButton: {
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
        shadowColor: '#22c55e',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },

    pausedButton: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        shadowColor: '#f59e0b',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },

    deleteButton: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
    },

    // Enhanced Empty state
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },

    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },

    emptyStateText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        textAlign: 'center',
    },

    emptyStateSubtext: {
        fontSize: 15,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    },
});
