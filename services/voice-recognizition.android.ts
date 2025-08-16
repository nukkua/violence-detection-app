// VoiceRecognitionService.js
import * as TaskManager from 'expo-task-manager';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import * as Notifications from 'expo-notifications';
import { VOICE_RECOGNITION_TASK } from './voice-task-manager.android';

export class VoiceRecognitionService {
    constructor() {
        this.isListening = false;
        this.setupNotifications();
    }

    async setupNotifications() {
        await Notifications.setNotificationChannelAsync('voice-channel', {
            name: 'Reconocimiento de Voz',
            importance: Notifications.AndroidImportance.HIGH,
            sound: null,
        });
    }

    async startForegroundService() {
        try {
            // Verificar si TaskManager está disponible
            const isAvailable = await TaskManager.isAvailableAsync();
            if (!isAvailable) {
                throw new Error('TaskManager no está disponible en este dispositivo');
            }

            // Verificar permisos
            const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!granted) {
                throw new Error('Permisos de micrófono denegados');
            }

            // Verificar si la tarea ya está registrada
            const isRegistered = await TaskManager.isTaskRegisteredAsync(VOICE_RECOGNITION_TASK);
            console.log('Task registered status:', isRegistered);

            // Mostrar notificación persistente
            await this.showPersistentNotification();

            // Iniciar reconocimiento continuo
            await this.startContinuousRecognition();

            console.log('✅ Servicio de voz iniciado');

        } catch (error) {
            console.error('Error iniciando servicio:', error);
            throw error;
        }
    }

    async showPersistentNotification() {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🎤 Reconocimiento de Voz Activo',
                body: 'El asistente está escuchando. Toca para abrir.',
                data: { screen: 'voice' },
                sound: null,
                sticky: true,
                ongoing: true, // Android: notificación persistente
            },
            trigger: null,
        });
    }

    async startContinuousRecognition() {
        this.isListening = true;

        const recognition = {
            lang: 'es-ES',
            interimResults: true,
            continuous: true,
            maxAlternatives: 1,
        };

        // Función para iniciar reconocimiento
        const startRecognition = () => {
            if (!this.isListening) return;

            ExpoSpeechRecognitionModule.start(recognition);
        };

        // Iniciar por primera vez
        startRecognition();

        // Configurar reinicio automático y manejo de eventos
        this.setupRecognitionEvents(startRecognition);
    }

    setupRecognitionEvents(restartFn) {
        // Manejar resultados
        ExpoSpeechRecognitionModule.onResult = (event) => {
            const transcript = event.results[0]?.transcript;
            const isFinal = event.results[0]?.isFinal;

            if (transcript) {
                // Enviar datos a la tarea en segundo plano
                this.sendToBackgroundTask({
                    transcript,
                    isFinal,
                    timestamp: Date.now()
                });
            }
        };

        // Reiniciar cuando termine
        ExpoSpeechRecognitionModule.onEnd = () => {
            console.log('Speech recognition ended, restarting...');
            if (this.isListening) {
                setTimeout(() => {
                    restartFn();
                }, 1000);
            }
        };

        // Manejar errores
        ExpoSpeechRecognitionModule.onError = (event) => {
            console.log('Speech recognition error:', event);
            if (this.isListening && event.error !== 'network') {
                // Reintentar después de error (excepto errores de red)
                setTimeout(() => {
                    restartFn();
                }, 2000);
            }
        };
    }

    async sendToBackgroundTask(data) {
        // Simular envío de datos a tarea en segundo plano
        // En una implementación real, esto podría usar AsyncStorage o 
        // algún mecanismo de comunicación entre tareas
        console.log('Sending to background task:', data);
    }

    async stopForegroundService() {
        try {
            this.isListening = false;

            // Detener reconocimiento
            ExpoSpeechRecognitionModule.stop();

            // Limpiar notificaciones
            await Notifications.dismissAllNotificationsAsync();

            // Opcional: desregistrar tarea
            const isRegistered = await TaskManager.isTaskRegisteredAsync(VOICE_RECOGNITION_TASK);
            if (isRegistered) {
                await TaskManager.unregisterTaskAsync(VOICE_RECOGNITION_TASK);
                console.log('Task unregistered');
            }

            console.log('🛑 Servicio de voz detenido');

        } catch (error) {
            console.error('Error deteniendo servicio:', error);
        }
    }

    async getTaskInfo() {
        try {
            const tasks = await TaskManager.getRegisteredTasksAsync();
            const voiceTask = tasks.find(task => task.taskName === VOICE_RECOGNITION_TASK);
            return voiceTask || null;
        } catch (error) {
            console.error('Error getting task info:', error);
            return null;
        }
    }
}
