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
} from 'react-native';

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

    // ========================================
    // AUDIO SETUP
    // ========================================

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);
    const pulseAnim = useMemo(() => new Animated.Value(1), []);

    // ========================================
    // EFFECTS
    // ========================================

    // Recording button pulse animation
    useEffect(() => {
        if (recorderState.isRecording) {
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnimation.start();
            return () => pulseAnimation.stop();
        } else {
            pulseAnim.setValue(1);
        }
    }, [recorderState.isRecording, pulseAnim]);

    // Recording timer
    useEffect(() => {
        let interval;
        if (recorderState.isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [recorderState.isRecording]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (currentPlayerRef.current) {
                try {
                    currentPlayerRef.current.pause();
                } catch (error) {
                }
                try {
                    currentPlayerRef.current.release();
                } catch (error) {
                }
                currentPlayerRef.current = null;
            }
            if (playbackCheckIntervalRef.current) {
                clearInterval(playbackCheckIntervalRef.current);
                playbackCheckIntervalRef.current = null;
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
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
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            await setRecordingMode();

            // Stop any active playback safely
            if (currentPlayerRef.current) {
                try {
                    await currentPlayerRef.current.pause();
                } catch (error) {
                } finally {
                    try {
                        currentPlayerRef.current.release();
                    } catch (releaseError) {
                    }
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

            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
        } catch (error) {
            console.error('Error starting recording:', error);
            Alert.alert('Error', 'No se pudo iniciar la grabación');
        }
    }, [requestPermissions, setRecordingMode, audioRecorder]);

    const stopRecording = useCallback(async () => {
        try {
            if (!recorderState.isRecording) return;

            await audioRecorder.stop();
            const uri = audioRecorder.uri;
            await setPlaybackMode();

            if (uri) {
                const recordingsDir = `${FileSystem.documentDirectory}recordings/`;
                await FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true });

                const timestamp = Date.now();
                const fileName = `recording_${timestamp}.m4a`;
                const newUri = `${recordingsDir}${fileName}`;

                await FileSystem.moveAsync({
                    from: uri,
                    to: newUri,
                });

                const newRecording = {
                    id: timestamp.toString(),
                    uri: newUri,
                    name: `Grabación ${recordings.length + 1}`,
                    date: timestamp,
                    duration: recordingTime,
                };

                const updatedRecordings = [newRecording, ...recordings];
                setRecordings(updatedRecordings);
                await saveRecordings(updatedRecordings);

            }
        } catch (error) {
            console.error('Error stopping recording:', error);
            Alert.alert('Error', 'No se pudo guardar la grabación');
        }
    }, [recorderState.isRecording, audioRecorder, recordings, recordingTime, saveRecordings, setPlaybackMode]);

    // ========================================
    // ENHANCED PLAYBACK FUNCTIONS
    // ========================================

    const playRecording = useCallback(async (recordingItem) => {
        try {
            // CASO 1: Si es la misma grabación y está reproduciendo/pausada, toggle pause/resume
            if (currentlyPlaying === recordingItem.id && currentPlayerRef.current) {
                if (isPlaybackPaused) {
                    // RESUME: Reanudar desde donde se pausó
                    await currentPlayerRef.current.play();
                    setIsPlaybackPaused(false);

                    // Reanudar tracking del progreso desde la posición pausada
                    playbackStartTimeRef.current = Date.now() - (pausedPositionRef.current * 1000);

                    progressIntervalRef.current = setInterval(() => {
                        const elapsed = (Date.now() - playbackStartTimeRef.current) / 1000;
                        const progress = Math.min(elapsed / recordingItem.duration, 1);

                        setPlaybackProgress(progress);
                        setCurrentPlaybackTime(Math.floor(elapsed));

                        if (progress >= 1) {
                            if (progressIntervalRef.current) {
                                clearInterval(progressIntervalRef.current);
                                progressIntervalRef.current = null;
                            }

                            setTimeout(() => {
                                if (currentlyPlaying === recordingItem.id) {
                                    setCurrentlyPlaying(null);
                                    setPlaybackProgress(0);
                                    setCurrentPlaybackTime(0);
                                    setIsPlaybackPaused(false);
                                    pausedPositionRef.current = 0;
                                }
                            }, 100);
                        }
                    }, 100);

                } else {
                    // PAUSE: Pausar el audio realmente
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

            // CASO 2: Detener cualquier otro audio que esté reproduciéndose
            if (currentPlayerRef.current) {
                currentPlayerRef.current.pause();
                currentPlayerRef.current.release();
                currentPlayerRef.current = null;

                if (playbackCheckIntervalRef.current) {
                    clearInterval(playbackCheckIntervalRef.current);
                    playbackCheckIntervalRef.current = null;
                }
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
            }

            await setPlaybackMode();

            // CASO 3: Crear nuevo reproductor y empezar desde el inicio
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
                        }
                        currentPlayerRef.current = null;
                    }
                }
            });

            // Start progress tracking
            playbackStartTimeRef.current = Date.now();
            progressIntervalRef.current = setInterval(() => {
                const elapsed = (Date.now() - playbackStartTimeRef.current) / 1000;
                const progress = Math.min(elapsed / recordingItem.duration, 1);

                setPlaybackProgress(progress);
                setCurrentPlaybackTime(Math.floor(elapsed));

                if (progress >= 1) {
                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                        progressIntervalRef.current = null;
                    }

                    setTimeout(() => {
                        if (currentlyPlaying === recordingItem.id) {
                            setCurrentlyPlaying(null);
                            setPlaybackProgress(0);
                            setCurrentPlaybackTime(0);
                            setIsPlaybackPaused(false);
                            pausedPositionRef.current = 0;
                        }
                    }, 100);
                }
            }, 100);

            await player.play();

        } catch (error) {
            console.error('Error playing recording:', error);
            Alert.alert('Error', 'No se pudo reproducir la grabación');
            setCurrentlyPlaying(null);
            setPlaybackProgress(0);
            setCurrentPlaybackTime(0);
            setIsPlaybackPaused(false);
            pausedPositionRef.current = 0;

            if (currentPlayerRef.current) {
                currentPlayerRef.current.release();
                currentPlayerRef.current = null;
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        }
    }, [currentlyPlaying, isPlaybackPaused, currentPlaybackTime, setPlaybackMode]);

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
                            // Si estamos eliminando la grabación que se está reproduciendo, detenerla
                            if (currentlyPlaying === recordingToDelete.id) {
                                if (currentPlayerRef.current) {
                                    currentPlayerRef.current.pause();
                                    currentPlayerRef.current.release();
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

                            await FileSystem.deleteAsync(recordingToDelete.uri, { idempotent: true });
                            const updatedRecordings = recordings.filter(r => r.id !== recordingToDelete.id);
                            setRecordings(updatedRecordings);
                            await saveRecordings(updatedRecordings);
                        } catch (error) {
                            console.error('Error deleting recording:', error);
                            Alert.alert('Error', 'No se pudo eliminar la grabación');
                        }
                    },
                },
            ]
        );
    }, [recordings, saveRecordings, currentlyPlaying]);

    // ========================================
    // RENDER FUNCTIONS
    // ========================================

    const renderRecordingItem = useCallback(({ item }) => (
        <RecordingItem
            item={item}
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Recording Section */}
            <View style={styles.recordingSection}>
                {recorderState.isRecording && (
                    <View style={styles.recordingStatus}>
                        <View style={styles.recordingIndicator} />
                        <Text style={styles.recordingText}>GRABANDO</Text>
                        <Text style={styles.recordingTimer}>{formatTime(recordingTime)}</Text>
                    </View>
                )}

                <Animated.View style={[styles.recordButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <TouchableOpacity
                        style={[
                            styles.recordButton,
                            recorderState.isRecording && styles.recordButtonActive
                        ]}
                        onPress={recorderState.isRecording ? stopRecording : startRecording}
                    >
                        <View style={[
                            styles.recordButtonInner,
                            recorderState.isRecording && styles.recordButtonInnerActive
                        ]} />
                    </TouchableOpacity>
                </Animated.View>

                <Text style={styles.recordingInstruction}>
                    {recorderState.isRecording ? 'Toca para detener' : 'Toca para grabar'}
                </Text>
            </View>

            {/* Recordings List */}
            <View style={styles.listSection}>
                <Text style={styles.listTitle}>
                    Grabaciones ({recordings.length})
                </Text>

                {recordings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No hay grabaciones</Text>
                        <Text style={styles.emptyStateSubtext}>Toca el botón de arriba para comenzar</Text>
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
        </SafeAreaView>
    );
}

// ============================================================================
// ENHANCED RECORDING ITEM COMPONENT
// ============================================================================

const RecordingItem = React.memo(({
    item,
    currentlyPlaying,
    playbackProgress,
    currentPlaybackTime,
    isPlaybackPaused,
    onPlay,
    onDelete,
    formatDate,
    formatTime
}) => {
    const isPlaying = currentlyPlaying === item.id;
    const waveAnim = useMemo(() => new Animated.Value(0), []);

    // Audio wave animation when playing (pero NO cuando está pausado)
    useEffect(() => {
        if (isPlaying && !isPlaybackPaused) {
            const waveAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(waveAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: false,
                    }),
                    Animated.timing(waveAnim, {
                        toValue: 0,
                        duration: 600,
                        useNativeDriver: false,
                    }),
                ])
            );
            waveAnimation.start();
            return () => waveAnimation.stop();
        } else {
            waveAnim.setValue(0);
        }
    }, [isPlaying, isPlaybackPaused, waveAnim]);

    const getPlayButtonIcon = () => {
        if (isPlaying) {
            return isPlaybackPaused ? '▶' : '⏸';
        }
        return '▶';
    };

    const getButtonStyle = () => {
        if (isPlaying) {
            return isPlaybackPaused ? styles.pausedButton : styles.playingButton;
        }
        return styles.playButton;
    };

    return (
        <View
            style={[
                styles.recordingItem,
                isPlaying && styles.recordingItemPlaying
            ]}
        >
            <View style={styles.recordingInfo}>
                <View style={styles.recordingNameContainer}>
                    <Text style={[styles.recordingName, isPlaying && styles.recordingNamePlaying]}>
                        {item.name}
                    </Text>
                    {isPlaying && !isPlaybackPaused && (
                        <View style={styles.playingIndicator}>
                            {[0, 1, 2].map((index) => (
                                <Animated.View
                                    key={index}
                                    style={[
                                        styles.playingDot,
                                        {
                                            opacity: waveAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.3, 1]
                                            }),
                                            transform: [{
                                                scaleY: waveAnim.interpolate({
                                                    inputRange: [0, 0.5, 1],
                                                    outputRange: [0.5, 1.5, 0.5]
                                                })
                                            }]
                                        }
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                    {isPlaying && isPlaybackPaused && (
                        <View style={styles.pausedIndicator}>
                            <Text style={styles.pausedText}>PAUSADO</Text>
                        </View>
                    )}
                </View>

                <Text style={[styles.recordingDate, isPlaying && styles.recordingDatePlaying]}>
                    {formatDate(item.date)}
                </Text>

                <View style={styles.recordingTimeContainer}>
                    {isPlaying ? (
                        <Text style={styles.currentTimeText}>
                            {formatTime(currentPlaybackTime)} / {formatTime(item.duration)}
                        </Text>
                    ) : (
                        <Text style={styles.recordingDuration}>
                            Duración: {formatTime(item.duration)}
                        </Text>
                    )}
                </View>

                {/* Progress bar */}
                {isPlaying && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressTrack}>
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${playbackProgress * 100}%`,
                                        backgroundColor: isPlaybackPaused ? '#fbbf24' : (waveAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['#22c55e', '#16a34a']
                                        }))
                                    }
                                ]}
                            />
                            <Animated.View
                                style={[
                                    styles.progressThumb,
                                    {
                                        left: `${playbackProgress * 100}%`,
                                        backgroundColor: isPlaybackPaused ? '#fbbf24' : '#22c55e',
                                        transform: [{
                                            scale: isPlaybackPaused ? 1.1 : (waveAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 1.3]
                                            }))
                                        }]
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
                        getButtonStyle()
                    ]}
                    onPress={() => onPlay(item)}
                >
                    <Text style={styles.actionButtonText}>
                        {getPlayButtonIcon()}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => onDelete(item)}
                >
                    <Text style={styles.deleteButtonText}>🗑</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    // Main container
    container: {
        flex: 1,
        backgroundColor: '#1e293b',
    },

    // Recording section
    recordingSection: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    recordingStatus: {
        alignItems: 'center',
        marginBottom: 30,
    },
    recordingIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#dc2626',
        marginBottom: 8,
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 5,
    },
    recordingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#dc2626',
        letterSpacing: 1,
        marginBottom: 4,
    },
    recordingTimer: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc',
        fontFamily: 'monospace',
    },
    recordButtonContainer: {
        marginBottom: 20,
    },
    recordButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#334155',
        borderWidth: 3,
        borderColor: '#22c55e',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
    },
    recordButtonActive: {
        borderColor: '#dc2626',
        shadowColor: '#dc2626',
        backgroundColor: '#475569',
    },
    recordButtonInner: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#22c55e',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    recordButtonInnerActive: {
        borderRadius: 4,
        backgroundColor: '#dc2626',
        shadowColor: '#dc2626',
    },
    recordingInstruction: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },

    // List section
    listSection: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#f8fafc',
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 20,
    },

    // Recording item
    recordingItem: {
        backgroundColor: '#334155',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: '#22c55e',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
        position: 'relative',
    },
    recordingItemPlaying: {
        backgroundColor: '#3f4a5e',
        borderLeftColor: '#16a34a',
        shadowColor: '#22c55e',
        shadowOpacity: 0.4,
        elevation: 12,
    },

    // Progress indicators
    progressContainer: {
        marginTop: 4,
    },
    progressTrack: {
        height: 4,
        backgroundColor: 'rgba(148, 163, 184, 0.3)',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 2,
    },
    progressThumb: {
        position: 'absolute',
        top: -2,
        width: 8,
        height: 8,
        backgroundColor: '#22c55e',
        borderRadius: 4,
        marginLeft: -4,
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 3,
    },

    // Recording info
    recordingInfo: {
        flex: 1,
        zIndex: 1,
    },
    recordingNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    recordingName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f8fafc',
        marginRight: 8,
    },
    recordingNamePlaying: {
        color: '#ffffff',
        fontWeight: '700',
    },
    playingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    playingDot: {
        width: 3,
        height: 12,
        backgroundColor: '#22c55e',
        borderRadius: 1.5,
    },
    pausedIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fbbf24',
    },
    pausedText: {
        fontSize: 10,
        color: '#fbbf24',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    recordingDate: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 2,
    },
    recordingDatePlaying: {
        color: '#cbd5e1',
    },
    recordingTimeContainer: {
        marginBottom: 8,
    },
    recordingDuration: {
        fontSize: 12,
        color: '#22c55e',
        fontWeight: '500',
    },
    currentTimeText: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: '600',
        fontFamily: 'monospace',
    },

    // Action buttons
    recordingActions: {
        flexDirection: 'row',
        gap: 8,
        zIndex: 1,
    },

    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    playButton: {
        backgroundColor: '#22c55e',
    },
    playingButton: {
        backgroundColor: '#16a34a',
        shadowColor: '#22c55e',
        shadowOpacity: 0.6,
        elevation: 8,
    },
    pausedButton: {
        backgroundColor: '#fbbf24',
        shadowColor: '#fbbf24',
        shadowOpacity: 0.6,
        elevation: 8,
    },
    deleteButton: {
        backgroundColor: '#dc2626',
    },
    actionButtonText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    deleteButtonText: {
        fontSize: 16,
        color: '#ffffff',
    },

    // Empty state
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        color: '#94a3b8',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
});
