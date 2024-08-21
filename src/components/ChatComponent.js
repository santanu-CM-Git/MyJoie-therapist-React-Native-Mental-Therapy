import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

const ChatComponent = ({ messages, onSend, customtInputToolbar, customRenderComposer, renderBubble, scrollToBottomComponent, renderChatFooter, renderSend, therapistId, styles }) => {
    const onSend = (newMessages = []) => {
        setMessages(GiftedChat.append(messages, newMessages));
    };

    return (
        <>
            <TouchableOpacity onPress={() => goingToactiveTab('audio')}>
                <View style={styles.ButtonView}>
                    <Image
                        source={callIcon}
                        style={styles.ButtonImg}
                    />
                    <Text style={styles.ButtonText}>Switch to Audio Call</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goingToactiveTab('video')}>
                <View style={styles.ButtonView}>
                    <Image
                        source={videoIcon}
                        style={styles.ButtonImg}
                    />
                    <Text style={styles.ButtonText}>Switch to Video Call</Text>
                </View>
            </TouchableOpacity>

            <GiftedChat
                messages={messages}
                renderInputToolbar={props => customtInputToolbar(props)}
                renderComposer={customRenderComposer}
                renderBubble={renderBubble}
                isTyping
                alwaysShowSend
                scrollToBottom
                scrollToBottomComponent={scrollToBottomComponent}
                renderChatFooter={renderChatFooter}
                renderSend={renderSend}
                onSend={messages => onSend(messages)}
                style={styles.messageContainer}
                user={{
                    _id: therapistId,
                    //avatar: { uri: therapistProfilePic },
                }}
                renderAvatar={null}
            //user={user}
            />
        </>
    );
};

export default ChatComponent;
