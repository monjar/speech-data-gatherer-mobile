import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import * as React from 'react';
import {View, Alert} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import {Card, Button, Text} from '@rneui/themed';
import RNFS from 'react-native-fs';
const audioRecorderPlayer = new AudioRecorderPlayer();
audioRecorderPlayer.setSubscriptionDuration(0.09);
const dirs = RNFetchBlob.fs.dirs;
const cachePath = Platform.select({
  ios: 'cached.m4a',
  android: `${dirs.CacheDir}/cached.mp3`,
});
const Recorder = props => {
  const [state, setState] = React.useState({
    isLoggingIn: false,
    recordSecs: 0,
    recordTime: '00:00:00',
    currentPositionSec: 0,
    currentDurationSec: 0,
    playTime: '00:00:00',
    duration: '00:00:00',
    couldBeSaved: false,
  });
  React.useEffect(() => {
    setState({
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      currentPositionSec: 0,
      currentDurationSec: 0,
      playTime: '00:00:00',
      duration: '00:00:00',
      couldBeSaved: false,
    });
  }, [props.fileName]);
  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setState({
      ...state,
      recordSecs: 0,
      couldBeSaved: true,
    });

    console.log('Stopped record: ' + cachePath);
  };
  const onSaveRecord = async fileName => {
    const savepath = RNFS.ExternalDirectoryPath + `/${fileName}.mp3`;
    console.log('saved in: ' + savepath);
    await RNFS.copyFile('file://' + cachePath, savepath);
    props.onRecordSave(savepath);
    setState({
      ...state,
      couldBeSaved: false,
    });
  };
  const onStartRecord = async () => {
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };
    console.log('audioSet', audioSet);
    const uri = await audioRecorderPlayer.startRecorder(cachePath, audioSet);
    audioRecorderPlayer.addRecordBackListener(e => {
      setState({
        ...state,
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
        couldBeSaved: false,
      });
    });
    console.log(`uri: ${uri}`);
  };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
      }}>
      <Text
        style={{
          fontSize: 20,
          color: '#888888',
          fontWeight: 'bold',
          marginVertical: 20,
        }}>
        {state.recordTime}
      </Text>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          alignContent: 'center',
          alignSelf: 'center',
          marginVertical: 5,
        }}>
        <View style={{marginHorizontal: 5}}>
          <Button
            containerStyle={{
              width: 100,
              borderRadius: 7,
            }}
            disabled={props.disabled}
            title="record"
            onPress={() => onStartRecord()}
          />
        </View>
        <View style={{marginHorizontal: 5}}>
          <Button
            containerStyle={{
              width: 100,
              borderRadius: 7,
            }}
            disabled={props.disabled || state.recordSecs <= 0}
            title="Stop"
            mode="outlined"
            onPress={() => onStopRecord()}
          />
        </View>
      </View>
      <View style={{margin: 5}}>
        <Button
          containerStyle={{
            width: 100,
            borderRadius: 7,
            marginBottom: 50,
          }}
          disabled={props.disabled || !state.couldBeSaved}
          title="Save"
          mode="outlined"
          onPress={() => onSaveRecord(props.fileName)}
        />
      </View>
      {/* 
      <Text>
        {state.playTime} / {state.duration}
      </Text>

      <Button mode="contained" title="play" onPress={() => onStartPlay()}>
        PLAY
      </Button>

      <Button title="pause" mode="contained" onPress={() => onPausePlay()}>
        PAUSE
      </Button>

      <Button title="stop" mode="outlined" onPress={() => onStopPlay()}>
        STOP
      </Button> */}
    </View>
  );
};

export default Recorder;
