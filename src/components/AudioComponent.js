import React from 'react';
import { View, TouchableOpacity, Image, Text, ImageBackground } from 'react-native';

const AudioComponent = ({ activeTab, goingToactiveTab, micOn, toggleMic, speakerOn, toggleSpeaker, styles, audioBgImg, defaultUserImg, audiooffIcon, audioonIcon, speakeroffIcon, speakeronIcon }) => {
  return (
    <>
      <TouchableOpacity onPress={() => goingToactiveTab('chat')}>
        <View style={styles.ButtonView}>
          <Image
            source={defaultUserImg}
            style={styles.ButtonImg}
          />
          <Text style={styles.ButtonText}>Switch to Chat</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => goingToactiveTab('video')}>
        <View style={styles.ButtonView}>
          <Image
            source={defaultUserImg}
            style={styles.ButtonImg}
          />
          <Text style={styles.ButtonText}>Switch to Video Call</Text>
        </View>
      </TouchableOpacity>

      <ImageBackground source={audioBgImg} style={styles.BackgroundImage}>
        <View style={styles.AudioControls}>
          <TouchableOpacity onPress={toggleMic}>
            <Image source={micOn ? audioonIcon : audiooffIcon} style={styles.AudioIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleSpeaker}>
            <Image source={speakerOn ? speakeronIcon : speakeroffIcon} style={styles.AudioIcon} />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </>
  );
};

export default AudioComponent;
