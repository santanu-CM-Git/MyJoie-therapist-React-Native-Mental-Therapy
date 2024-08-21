// VideoComponent.js
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import AgoraUIKit from 'agora-rn-uikit';

const VideoComponent = ({
    videoCall,
    setVideoCall,
    connectionData,
    rtcCallbacks,
    customPropsStyle,
    agoraConfig,
    route,
    responsiveHeight
}) => {
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
            <TouchableOpacity onPress={() => goingToactiveTab('audio')}>
                <View style={styles.ButtonView}>
                    <Image
                        source={defaultUserImg}
                        style={styles.ButtonImg}
                    />
                    <Text style={styles.ButtonText}>Switch to Audio Call</Text>
                </View>
            </TouchableOpacity>
            <View>
                {videoCall ? (
                    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                        {/* Agora Video Component */}
                        <View style={{ height: route?.params?.details?.prescription_checked === 'yes' ? responsiveHeight(75) : responsiveHeight(80) }}>
                            <AgoraUIKit
                                connectionData={connectionData}
                                rtcCallbacks={rtcCallbacks}
                                styleProps={customPropsStyle}
                                agoraConfig={agoraConfig}
                            />
                        </View>
                    </SafeAreaView>
                ) : (
                    <Text onPress={() => {
                        setVideoCall(true);
                    }}>
                        Start Call
                    </Text>
                )}
            </View>
        </>
    );
};

export default VideoComponent;
