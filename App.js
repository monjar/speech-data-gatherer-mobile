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
  useColorScheme,
  View,
  Alert,
  Dimensions,
} from 'react-native';
import Share from 'react-native-share';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import DocumentPicker from 'react-native-document-picker';
import Recorder from './Recorder';
import RNFS from 'react-native-fs';
import {Card, Button, Text} from '@rneui/themed';
import SelectDropdown from 'react-native-select-dropdown';

const tags = {
  Source: ['Book', 'Instagram', 'Telegram'],
  Noise: ['Low', 'Medium', 'High'],
  Length: ['Short', 'Medium', 'Long'],
};
const ScreenHeight = Dimensions.get('window').height;

const App = () => {
  const isDarkMode = false;
  const [loadedTexts, setLoadedTexts] = React.useState([]);
  const [savedRecordPath, setSavedRecordPath] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState({});
  const backgroundStyle = {
    backgroundColor: '#f0f5fa',
    height: ScreenHeight,
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

  const onRecordSave = savePath => {
    setSavedRecordPath(savePath);
  };

  const setVoiceForText = (text, voicePath, tags) => {
    loadedTexts
      .filter(data => data.text === text)
      .forEach(data => {
        data.voicePath = voicePath;
        data.hasVoice = true;
        data.tags;
      });
    setLoadedTexts([...loadedTexts]);
    setSavedRecordPath('');
  };
  const chooseFileAndRead = async () => {
    try {
      const pickerResult = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      console.log('pickerResult: ' + JSON.stringify(pickerResult, null, 2));
      const fileContents = await readFile(pickerResult.fileCopyUri);
      setLoadedTexts(
        fileContents
          .split('\n')
          .map(str => ({text: str, voicePath: '', hasVoice: false, tags: {}})),
      );

      setSavedRecordPath('');
    } catch (e) {
      onErr(e);
    }
  };

  const singleShare = async (path, text, sTags) => {
    const shareMessage = `
    Text: ${text}
    ----------------------
    Tags
    ${Object.keys(sTags).map(
      tagKey => `${tagKey}: ${sTags[tagKey]}
    `,
    )}
    `.replace(/,/g, '');
    alert(shareMessage);
    try {
      await Share.open({
        title: 'Share',
        message: shareMessage,
        url: 'file://' + path,
        type: 'audio/mp3',
      });
    } catch (err) {
      console.log(err);
    }
  };

  const currentData = loadedTexts.find(data => !data.hasVoice)?.text;
  return (
    <SafeAreaView style={backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: backgroundStyle.backgroundColor,
            padding: 10,
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            alignContent: 'center',
            alignSelf: 'center',
            justifyContent: 'space-around',
            width: '100%',
            // height: ScreenHeight,
            margin: 0,
          }}>
          <Button
            containerStyle={{
              width: '50%',
              borderRadius: 7,
              marginBottom: 20,
            }}
            title="Choose txt file"
            onPress={chooseFileAndRead}
          />
          <View
            style={{
              marginVertical: 5,
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              alignContent: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
            }}>
            {Object.keys(tags).map(function (key, index) {
              return (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignContent: 'center',
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text>{key}:</Text>
                  <SelectDropdown
                    buttonStyle={{
                      borderRadius: 7,
                      margin: 5,
                    }}
                    data={tags[key]}
                    onSelect={(selectedItem, index) => {
                      selectedTags[key] = selectedItem;
                      setSelectedTags({...selectedTags});
                    }}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem;
                    }}
                    rowTextForSelection={(item, index) => {
                      return item;
                    }}
                  />
                </View>
              );
            })}
          </View>
          <Card
            onTouchEnd={
              currentData && savedRecordPath?.length > 0
                ? () =>
                    setVoiceForText(currentData, savedRecordPath, selectedTags)
                : null
            }
            containerStyle={{
              width: '80%',
              height: 100,
              flex: 1,
              padding: 10,
              borderRadius: 7,
            }}>
            <Text
              style={{
                fontSize: 12,
                color: '#777777',
              }}>
              {currentData}
            </Text>
          </Card>

          <Recorder
            fileName={currentData}
            disabled={!currentData}
            onRecordSave={onRecordSave}
          />
          {savedRecordPath && (
            <Card
              containerStyle={{
                width: '80%',
                padding: 3,
                borderRadius: 10,
                marginTop: -30,
                marginBottom: 20,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  color: 'gray',
                }}>
                {'File saved to:' + savedRecordPath}
              </Text>
            </Card>
          )}

          <View
            style={{
              marginVertical: 5,
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              alignContent: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
              marginBottom: 30,
            }}>
            <Button
              containerStyle={{
                width: 100,
                borderRadius: 10,
              }}
              disabled={!savedRecordPath}
              onPress={async () => {
                await singleShare(savedRecordPath, currentData, selectedTags);
              }}
              title="Share"
            />
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
