import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import * as React from 'react';
import {Text, View, Button, Alert} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import RNFS from 'react-native-fs';
const audioRecorderPlayer = new AudioRecorderPlayer();
audioRecorderPlayer.setSubscriptionDuration(0.09);
const dirs = RNFetchBlob.fs.dirs;
const path = Platform.select({
  ios: 'hello.m4a',
  android: `${dirs.CacheDir}/hello.mp3`,
});
const Recorder = () => {
  const [state, setState] = React.useState({
    isLoggingIn: false,
    recordSecs: 0,
    recordTime: '00:00:00',
    currentPositionSec: 0,
    currentDurationSec: 0,
    playTime: '00:00:00',
    duration: '00:00:00',
  });

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setState({
      ...state,
      recordSecs: 0,
    });
    console.log('saved in: ' + RNFS.ExternalDirectoryPath + '/hello.mp3');
    RNFS.copyFile(result, RNFS.ExternalDirectoryPath + '/hello.mp3');

    console.log(result);
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
    const uri = await audioRecorderPlayer.startRecorder(path, audioSet);
    audioRecorderPlayer.addRecordBackListener(e => {
      setState({
        ...state,
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
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
      <Text>{state.recordTime}</Text>

      <Button title="record" onPress={() => onStartRecord()} />

      <Button title="stop" mode="outlined" onPress={() => onStopRecord()}>
        title
      </Button>
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
