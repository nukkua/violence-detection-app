// VoiceTaskManager.js - Debe importarse en el nivel más alto de tu app
import * as TaskManager from 'expo-task-manager';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import * as Notifications from 'expo-notifications';

const VOICE_RECOGNITION_TASK = 'voice-recognition-task';

TaskManager.defineTask(VOICE_RECOGNITION_TASK, ({ data, error, executionInfo }) => {
    if (error) {
        console.error('Voice recognition task error:', error.message);
        return;
    }

    if (data) {
        const { transcript, isFinal } = data;

        console.log('Background voice recognition:', {
            transcript,
            isFinal,
            appState: executionInfo.appState,
            eventId: executionInfo.eventId
        });

        // Procesar comandos de voz en segundo plano
        if (isFinal && transcript) {
            processVoiceCommandInBackground(transcript);
        }
    }
});

const processVoiceCommandInBackground = async (transcript) => {
    const command = transcript.toLowerCase();

    if (command.includes('emergencia') || command.includes('ayuda')) {
        // Enviar notificación de emergencia
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🚨 Comando de Emergencia Detectado',
                body: `Comando: "${transcript}"`,
                sound: true,
                priority: 'max',
            },
            trigger: null,
        });
    }

    // Aquí puedes agregar más lógica de comandos
    console.log('Procesando comando en background:', command);
};

export { VOICE_RECOGNITION_TASK };
