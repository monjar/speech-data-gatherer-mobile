/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  Alert,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import DocumentPicker from 'react-native-document-picker';

import RNFS from 'react-native-fs';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [loadedTexts, setLoadedTexts] = React.useState([]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const onErr = e => {
    console.log('Pick errror' + e);
  };
  const readFile = async path => {
    try {
      const contents = await RNFS.readFile(path, 'utf8');
      console.log('Reading file' + contents);
      return '' + contents;
    } catch (e) {
      alert('Error: ' + e);
    }
  };
  const setVoiceForText = (text, voicePath) => {
    loadedTexts
      .filter(data => data.text === text)
      .forEach(data => {
        data.voicePath = voicePath;
        data.hasVoice = true;
      });
    alert(JSON.stringify(loadedTexts, null, 2));
    setLoadedTexts([...loadedTexts]);
  };
  const chooseFileAndRead = async () => {
    try {
      const pickerResult = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      const fileContents = await readFile(pickerResult.fileCopyUri);
      setLoadedTexts(
        fileContents
          .split('\n')
          .map(str => ({text: str, voicePath: '', hasVoice: false})),
      );
    } catch (e) {
      onErr(e);
    }
  };
  const currentData = loadedTexts.find(data => !data.hasVoice)?.text;
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Button title="Choose txt file" onPress={chooseFileAndRead} />

          <View
            onTouchEnd={
              currentData ? () => setVoiceForText(currentData, 'aaa') : null
            }>
            <Text> {currentData}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;