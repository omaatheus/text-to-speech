import { View, StyleSheet, Button, TextInput, TouchableOpacity, Text } from 'react-native';
import * as Speech from 'expo-speech';
import { useState } from 'react';

export default function Home() {
  const [texto, setTexto] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Função para listar vozes disponíveis
  const listAllVoiceOptions = async () => {
    let voices = await Speech.getAvailableVoicesAsync();
    console.log(voices);
  };

  // Função para iniciar a fala
  const speak = () => {
    listAllVoiceOptions();
    const thingToSay = texto;
    const options = {
      language: 'pt-BR',
      onDone: () => { // Callback para quando o áudio terminar
        setIsSpeaking(false); // Atualiza o estado para permitir o botão novamente
      },
    };
    Speech.speak(thingToSay, options);
    setIsSpeaking(true);
  };

  // Função para pausar a fala
  const pauseSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  // Função para retroceder (parar e reiniciar a fala)
  const rewindSpeech = () => {
    Speech.stop(); // Para a fala atual
    speak(); // Reinicia a fala do início
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Insira seu texto aqui (Máximo 500 caracacteres)"
        onChangeText={setTexto}
        value={texto}
        maxLength={500}
        multiline
      />

      <TouchableOpacity
        style={[styles.button, isSpeaking && styles.buttonDisabled]}
        onPress={speak}
        disabled={isSpeaking} // Desabilita o botão enquanto estiver falando
      >
        <Text style={styles.buttonText}>Escute!</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={pauseSpeech}
        disabled={!isSpeaking} // Desabilita o botão se não estiver falando
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
    textAlignVertical: 'top', // Faz o texto começar no topo do input
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
