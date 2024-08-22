import React, { useState, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    Button,
    StyleSheet,
    PermissionsAndroid,
    Platform,
} from 'react-native';
import {
    ClientRoleType,
    createAgoraRtcEngine,
    ChannelProfileType,
    RtcSurfaceView
} from 'react-native-agora';

const appId = '65f24fadce1247f98c8f7c77a232ec8e';
const channelName = 'testChannel';
const token = '007eJxTYJhVtlH76s/3ao1JOg/6nolv+XLKOfs+t7JXZEbea/6dPx0VGMxM04xM0hJTklMNjUzM0ywtki3SzJPNzRONjI1Sky1Sj147ltYQyMgQW32IhZEBAkF8boaS1OIS54zEvLzUHAYGAO/KJOM=';
const uid = 0;

const TestPage = () => {
    const agoraEngineRef = useRef(null);
    const [isJoined, setIsJoined] = useState(false);
    const [remoteUid, setRemoteUid] = useState(null);
    const [message, setMessage] = useState('');
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);

    useEffect(() => {
        setupVideoSDKEngine();
        return () => {
            agoraEngineRef.current?.destroy();
        };
    }, []);

    const setupVideoSDKEngine = async () => {
        try {
            if (Platform.OS === 'android') {
                await getPermission();
            }
            agoraEngineRef.current = createAgoraRtcEngine();
            const agoraEngine = agoraEngineRef.current;

            agoraEngine.registerEventHandler({
                onJoinChannelSuccess: () => {
                    showMessage('Successfully joined the channel: ' + channelName);
                    setIsJoined(true);
                },
                onUserJoined: (_connection, Uid) => {
                    showMessage('Remote user ' + Uid + ' has joined');
                    setRemoteUid(Uid);
                },
                onUserOffline: (_connection, Uid) => {
                    showMessage('Remote user ' + Uid + ' has left the channel');
                    setRemoteUid(null);
                },
            });

            agoraEngine.initialize({
                appId: appId,
            });
        } catch (e) {
            console.log(e);
        }
    };

    const getPermission = async () => {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.CAMERA,
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            ]);
            return granted;
        } catch (err) {
            console.warn(err);
        }
    };

    const joinChannel = async () => {
        const agoraEngine = agoraEngineRef.current;
        agoraEngine?.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
        agoraEngine?.startPreview();
        agoraEngine?.joinChannel(token, channelName, uid, {
            clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        });
    };

    const leaveChannel = () => {
        const agoraEngine = agoraEngineRef.current;
        agoraEngine?.leaveChannel();
        setRemoteUid(null);
        setIsJoined(false);
        setIsVideoEnabled(false);
        showMessage('You left the channel');
    };

    const startVideoCall = async () => {
        const agoraEngine = agoraEngineRef.current;
        agoraEngine?.enableVideo();
        setIsVideoEnabled(true);
    };

    const startAudioCall = async () => {
        const agoraEngine = agoraEngineRef.current;
        agoraEngine?.disableVideo();
        setIsVideoEnabled(false);
    };

    const showMessage = (msg) => {
        setMessage(msg);
        console.log(msg);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Agora Audio/Video Call</Text>
            <View style={styles.buttonContainer}>
                {isJoined ? (
                    <>
                        <Button
                            title={isVideoEnabled ? 'Switch to Audio' : 'Switch to Video'}
                            onPress={isVideoEnabled ? startAudioCall : startVideoCall}
                        />
                        <Button title="Leave Channel" onPress={leaveChannel} />
                    </>
                ) : (
                    <Button title="Join Channel" onPress={joinChannel} />
                )}
            </View>

            {isVideoEnabled && (
                <View style={styles.videoContainer}>
                    {/* Replace with correct Agora video view component */}
                    {/* Example placeholder components */}
                    {/* <View style={styles.localVideo}>
                        <Text>Local Video</Text>
                    </View> */}
                    <RtcSurfaceView canvas={{ uid: 0 }} style={styles.localVideo} />
                    {remoteUid !== null && (
                        // <View style={styles.remoteVideo}>
                        //     {/* Replace with RtcRemoteView.SurfaceView */}
                        //     <Text>Remote Video</Text>
                        // </View>
                        <RtcSurfaceView
                            canvas={{ uid: remoteUid }}
                            style={styles.remoteVideo}
                        />

                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
    },
    buttonContainer: {
        marginVertical: 10,
    },
    videoContainer: {
        width: '100%',
        height: 400,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    localVideo: {
        width: '100%',
        height: 400,
    },
    remoteVideo: {
        width: '100%',
        height: 200,
        marginTop: 10,
    },
});

export default TestPage;
