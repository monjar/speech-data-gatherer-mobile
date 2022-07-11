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
import {Card, Button, Text, Input} from '@rneui/themed';
import SelectDropdown from 'react-native-select-dropdown';
import {zip, unzip, unzipAssets, subscribe} from 'react-native-zip-archive';

import {getFileNameFromPath} from './utils';
const tags = {
  Source: ['Book', 'Instagram', 'Telegram'],
  Noise: ['Low', 'Medium', 'High'],
  Length: ['Short', 'Medium', 'Long'],
};
const ScreenHeight = Dimensions.get('window').height;
const saveFileLocation = RNFS.ExternalDirectoryPath + '/save.json';
const App = () => {
  const isDarkMode = false;
  const [textFilePath, setTextFilePath] = React.useState('');
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0);
  const [loadedTexts, setLoadedTexts] = React.useState([]);
  const [selectedTags, setSelectedTags] = React.useState({});
  const [userId, setUserId] = React.useState('');
  const backgroundStyle = {
    backgroundColor: '#f0f5fa',
    height: ScreenHeight,
  };

  const saveStates = async () => {
    const saveObject = {
      loadedTexts,
      textFilePath,
      selectedTags,
      userId,
      currentTextIndex,
    };
    await RNFS.writeFile(
      saveFileLocation,
      JSON.stringify(saveObject, null, 2),
      'utf8',
    );
    console.log('Saved app state to: ' + saveFileLocation);
  };
  const setUserID = input => {
    setLoadedTexts([]);
    setCurrentTextIndex(0);
    setTextFilePath('');
    setSelectedTags({});
    setUserId(input);
  };
  React.useEffect(() => {
    const loadStates = async () => {
      try {
        const savedState = await RNFS.readFile(saveFileLocation, 'utf8');
        const parsedSavedState = JSON.parse(savedState);
        setTextFilePath(parsedSavedState.textFilePath);
        setCurrentTextIndex(parsedSavedState.currentTextIndex);
        setLoadedTexts(parsedSavedState.loadedTexts);
        setSelectedTags(parsedSavedState.selectedTags);
        setUserId(parsedSavedState.userId);
        console.log('Loaded app state from: ' + saveFileLocation);
      } catch (e) {
        console.log('No save files available.');
      }
    };
    loadStates();
  }, []);
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
  React.useEffect(() => {
    setSelectedTags(
      loadedTexts.length > 0 &&
        loadedTexts[currentTextIndex] &&
        loadedTexts[currentTextIndex].tags
        ? loadedTexts[currentTextIndex].tags
        : {},
    );
  }, [currentTextIndex]);
  const makeid = length => {
    var result = '';
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return userId + '-' + result;
  };
  const saveOutputFile = () => {
    const saveObject = {
      userId: userId,
      texts: loadedTexts,
    };
    RNFS.writeFile(
      RNFS.ExternalDirectoryPath +
        `/${getFileNameFromPath(textFilePath)}-${userId}/texts.json`,
      JSON.stringify(saveObject, null, 2),
      'utf8',
    )
      .then(success => {
        console.log('FILE WRITTEN!');
      })
      .catch(err => {
        console.log(err.message);
      });
    setLoadedTexts([...loadedTexts]);
  };

  const onRecordSave = savePath => {
    loadedTexts[currentTextIndex].voicePath = savePath;
    loadedTexts[currentTextIndex].hasVoice = true;
    loadedTexts[currentTextIndex].tags = selectedTags;

    nextInfile();
    saveOutputFile();
    saveStates();
  };

  const updateTags = () => {
    loadedTexts[currentTextIndex].tags = selectedTags;
    saveOutputFile();
    saveStates();
  };

  const setVoiceForText = (text, voicePath, tags) => {};
  const chooseFileAndRead = async () => {
    try {
      const pickerResult = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      console.log('pickerResult: ' + JSON.stringify(pickerResult, null, 2));
      const DirectoryPath =
        RNFS.ExternalDirectoryPath +
        `/${getFileNameFromPath(pickerResult.fileCopyUri)}-${userId}`;
      await RNFS.mkdir(DirectoryPath);
      console.log('Directory: ' + DirectoryPath);
      setTextFilePath(pickerResult.fileCopyUri);
      const fileContents = await readFile(pickerResult.fileCopyUri);
      const split = fileContents
        .split('.')
        .filter(str => str.trim().length > 0);
      console.log('File data:');
      split.forEach(line => {
        console.log(line + '\n--------------------------------------');
      });
      setLoadedTexts(
        split.map(str => ({
          text: str.trim(),
          voicePath: '',
          hasVoice: false,
          tags: {},
          fileName: makeid(6),
        })),
      );
    } catch (e) {
      onErr(e);
    }
  };

  const singleShare = async (filePath, loadedTextData) => {
    const DirectoryPath =
      RNFS.ExternalDirectoryPath +
      `/${getFileNameFromPath(filePath)}-${userId}`;

    RNFS.readDir(DirectoryPath)
      .then(async result => {
        const fileNames = loadedTextData.map(tData => tData.fileName + '.mp3');
        console.log('ValidFileNames: ', JSON.stringify(fileNames, null, 2));
        console.log('GOT RESULT', JSON.stringify(result, null, 2));
        for (const file of result) {
          if (file.name.endsWith('mp3') && !fileNames.includes(file.name)) {
            await RNFS.unlink(file.path);
          }
        }
        const targetPath = `${DirectoryPath}.zip`;
        zip(DirectoryPath, targetPath)
          .then(async zippath => {
            console.log(`zip completed at ${zippath}`);
            const shareMessage = JSON.stringify(loadedTextData, null, 2);
            alert(shareMessage);
            try {
              await Share.open({
                title: 'Share',
                message: shareMessage,
                url: 'file://' + targetPath,
                type: 'application/zip',
              });
            } catch (err) {
              console.log(err);
            }
          })
          .catch(error => {
            console.error(error);
          });
      })
      .catch(err => {
        console.log(err.message, err.code);
      });
  };

  const nextInfile = () => {
    setCurrentTextIndex((currentTextIndex + 1) % loadedTexts.length);
  };
  const prevInFile = () => {
    setCurrentTextIndex(
      currentTextIndex > 0 ? currentTextIndex - 1 : loadedTexts.length - 1,
    );
  };
  const currentData = loadedTexts[currentTextIndex]?.text;
  const currentFileName = loadedTexts[currentTextIndex]?.fileName;
  const savedRecordPath = loadedTexts[currentTextIndex]?.voicePath;
  const doneTextsNumber = loadedTexts.filter(text => text.hasVoice).length;
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
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              alignContent: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
              width: '50%',
            }}>
            <Text style={{fontSize: 20}}>ID: </Text>
            <Input
              value={userId}
              placeholder="User ID"
              inputStyle={{fontSize: 10}}
              containerStyle={{
                height: 20,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center',
                alignSelf: 'center',
                justifyContent: 'center',
                margin: 20,
                borderStyle: 'solid',
                borderWidth: 2,
                borderRadius: 7,
                padding: 20,
                borderColor: '#0275d8',
              }}
              onChangeText={textValue => setUserID(textValue)}
            />
          </View>
          <Button
            disabled={userId.length === 0}
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
              marginTop: 5,
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              alignContent: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
            }}>
            {Object.keys(tags).map(function (key, index) {
              console.log(key + ' ' + JSON.stringify(selectedTags));
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
                    defaultValue={selectedTags[key]}
                    defaultValueByIndex={selectedTags[key] ? null : -1}
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
            <Button
              disabled={
                userId.length === 0 ||
                !savedRecordPath ||
                savedRecordPath.length === 0
              }
              containerStyle={{
                width: '30%',
                borderRadius: 7,
                marginBottom: 20,
              }}
              title="Update tags"
              onPress={updateTags}
            />
          </View>
          <Text
            style={{
              marginTop: 10,
              marginBottom: -10,
            }}>
            {currentTextIndex + 1}/{loadedTexts.length}
          </Text>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              alignContent: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
            }}>
            <Button
              containerStyle={{
                borderRadius: 50,
                marginHorizontal: 5,
              }}
              title="<"
              onPress={prevInFile}
            />
            <Card
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
            <Button
              containerStyle={{
                borderRadius: 50,
                marginHorizontal: 5,
              }}
              title=">"
              onPress={nextInfile}
            />
          </View>
          <Recorder
            fileName={currentFileName}
            disabled={!currentData}
            onRecordSave={onRecordSave}
            textFilePath={textFilePath}
            userId={userId}
          />
          {savedRecordPath?.length > 0 && (
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

          <Text>
            Done: {doneTextsNumber}/{loadedTexts.length}
          </Text>
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
              disabled={!(doneTextsNumber === loadedTexts.length)}
              onPress={async () => {
                await singleShare(textFilePath, loadedTexts);
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
