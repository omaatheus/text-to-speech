import { View, StyleSheet, Button, TextInput, TouchableOpacity, Text, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Home() {
  const [texto, setTexto] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const listAllVoiceOptions = async () => {
    let voices = await Speech.getAvailableVoicesAsync();
    console.log(voices);
  };

  const speak = async () => {
    listAllVoiceOptions();
    const thingToSay = texto;
    const options = {
      language: 'pt-BR',
      onDone: async () => {
        setIsSpeaking(false);
        await schedulePushNotification();
      },
    };
    Speech.speak(thingToSay, options);
    setIsSpeaking(true);
  };

  const pauseSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Insira seu texto aqui (Máximo 500 caracteres)"
        onChangeText={setTexto}
        value={texto}
        maxLength={500}
        multiline
      />

      <TouchableOpacity
        style={[styles.button, isSpeaking && styles.buttonDisabled]}
        onPress={speak}
        disabled={isSpeaking}
      >
        <Text style={styles.buttonText}>Escute!</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={pauseSpeech}
        disabled={!isSpeaking}
      >
        <Text style={styles.buttonText}>Pausar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: 16,
  },
  input: {
    height: 150,
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
});

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Áudio foi gerado',
      body: 'O texto foi convertido em áudio com sucesso!',
    },
    trigger: null,
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
