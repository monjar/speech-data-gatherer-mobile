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
import {getFileNameFromPath} from './utils';
import {Card, Button, Text} from '@rneui/themed';
import RNFS, {stat} from 'react-native-fs';
const audioRecorderPlayer = new AudioRecorderPlayer();
audioRecorderPlayer.setSubscriptionDuration(0.09);
const dirs = RNFetchBlob.fs.dirs;
const cachedir = dirs.CacheDir;
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
  const DirectoryPath =
    RNFS.ExternalDirectoryPath +
    `/${getFileNameFromPath(props.textFilePath)}-${props.userId}`;

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
      isPlaying: false,
    });
  }, [props.fileName]);
  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setState({
      ...state,
      recordSecs: 0,
      couldBeSaved: true,
      isPlaying: false,
    });
  };
  const onSaveRecord = async fileName => {
    const savepath = DirectoryPath + `/${fileName}.mp3`;
    const cachePath = cachedir + `/${fileName}.mp3`;
    await RNFS.copyFile('file://' + cachePath, savepath);
    console.log('saved in: ' + savepath);
    props.onRecordSave(savepath);
    setState({
      ...state,
      couldBeSaved: false,
    });
  };

  const onStartPlay = async fileName => {
    console.log('onStartPlay');
    const msg = await audioRecorderPlayer.startPlayer(
      cachedir + `/${fileName}.mp3`,
    );
    console.log(msg);
    audioRecorderPlayer.addPlayBackListener(e => {
      setState({
        ...state,
        currentPositionSec: e.currentPosition,
        currentDurationSec: e.duration,
        playTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
        duration: audioRecorderPlayer.mmssss(Math.floor(e.duration)),
        isPlaying: true,
      });
      return;
    });
  };

  const onPausePlay = async () => {
    await audioRecorderPlayer.pausePlayer();
    setState({
      ...state,
      isPlaying: false,
    });
  };

  const onStopPlay = async () => {
    console.log('onStopPlay');
    audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    setState({
      ...state,
      isPlaying: false,
    });
  };

  const onStartRecord = async fileName => {
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };
    console.log('audioSet', audioSet);
    const uri = await audioRecorderPlayer.startRecorder(
      cachedir + `/${fileName}.mp3`,
      audioSet,
    );
    audioRecorderPlayer.addRecordBackListener(e => {
      setState({
        ...state,
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
        couldBeSaved: false,
        isPlaying: false,
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
        {state.isPlaying
          ? `${state.playTime}/${state.duration}`
          : state.recordTime}
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
            onPress={() => onStartRecord(props.fileName)}
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
            disabled={props.disabled || !state.couldBeSaved}
            title={'Play'}
            onPress={() => onStartPlay(props.fileName)}
          />
        </View>
        <View style={{marginHorizontal: 5}}>
          <Button
            containerStyle={{
              width: 100,
              borderRadius: 7,
            }}
            disabled={props.disabled || !state.couldBeSaved}
            title="Stop"
            mode="outlined"
            onPress={() => onStopPlay()}
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
