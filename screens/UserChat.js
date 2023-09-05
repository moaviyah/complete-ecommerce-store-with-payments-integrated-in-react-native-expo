import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Image,
  SafeAreaView,
} from "react-native";
import {
  getDatabase,
  ref,
  query,
  onChildAdded,
  off,
  push,
  set,
  child,
  onValue,
  runTransaction,
} from "firebase/database";
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from "../colors";

const UserChat = ({ closeModal, senderId, recieverId }) => {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const db = getDatabase();
    const chatRef = ref(db, "Chats");
    const messagesQuery = query(chatRef);

    const fetchMessages = (snapshot) => {
      const messageData = snapshot.val();
      const isUser = messageData.sender === senderId;
      if (
        (messageData.sender === senderId &&
          messageData.receiver === recieverId) ||
        (messageData.sender === recieverId && messageData.receiver === senderId)
      ) {
        const timestamp = new Date(parseInt(messageData.time));
        const formatTime = (timestamp) => {
          const hours = timestamp.getHours();
          const minutes = timestamp.getMinutes();
          const amOrPm = hours >= 12 ? "PM" : "AM";
          const formattedHours = hours % 12 || 12;
          const formattedMinutes = minutes.toString().padStart(2, "0");
          return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
        };
        const formattedTimestamp = formatTime(timestamp); // Format timestamp in 12-hour format
        const chatMessage = {
          id: snapshot.key,
          text: messageData.message,
          isUser: isUser,
          timestamp: formattedTimestamp,
          textAbout: messageData.textabout,
          textImage: messageData.textimage,
        };
        setChatMessages((prevMessages) => [...prevMessages, chatMessage]);
      }
    };

    const messagesListener = onChildAdded(messagesQuery, fetchMessages);
    const userInfoRef = ref(db, "userinfo");
    const receiverInfoQuery = query(child(userInfoRef, recieverId));

    const fetchReceiverInfo = (snapshot) => {
      const receiverData = snapshot.val();
      setReceiverInfo(receiverData);
      setIsLoading(false);
    };

    const receiverInfoListener = onValue(receiverInfoQuery, fetchReceiverInfo);
    return () => {
      messagesListener();
      receiverInfoListener();
    };
  }, [senderId]);

  const handleSend = () => {
    if (message.trim() !== "") {
      const db = getDatabase();
      const chatRef = ref(db, "Chats");
      const newChatMessageRef = push(chatRef);
      const chatId = newChatMessageRef.key;
      const timestamp = Date.now().toString();

      const chatMessage = {
        isseen: false,
        message: message,
        receiver: recieverId,
        sender: senderId,
        time: timestamp,
      };

      set(newChatMessageRef, chatMessage)
        .then(() => {
          // const newChatMessage = {
          //   id: chatId,
          //   text: message,
          //   isUser: true,
          //   timestamp: new Date().toLocaleTimeString(),
          // };
          // setChatMessages((prevMessages) => [...prevMessages, newChatMessage]);
          setMessage("");
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });

      // Add user to chat fragment for current user
      const chatListRef = ref(db, `Chatlist/${senderId}/${recieverId}`);
      set(chatListRef, { id: recieverId });

      // Add current user to chat fragment for receiver
      const chatRefReceiver = ref(db, `Chatlist/${recieverId}/${senderId}`);
      set(chatRefReceiver, { id: senderId });
    }
  };

  const renderChatMessage = ({ item }) => {
    if (item.textAbout && item.textImage) {
      return (
        <View
          style={[
            styles.messageContainer,
            item.isUser
              ? styles.userMessageContainer
              : styles.otherMessageContainer,
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
          <View style={{ backgroundColor: "transparent" }}>
            <Text style={{ color: "gray", marginTop: 10 }}>
              Talking about: {item.textAbout}{" "}
            </Text>
            <Image
              source={{ uri: item.textimage }}
              style={styles.attachmentImage}
            />
          </View>
        </View>
      );
    } else {
      return (
        <View
          style={[
            styles.messageContainer,
            item.isUser
              ? styles.userMessageContainer
              : styles.otherMessageContainer,
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
        </View>
      );
    }
  };

  const sortedChatMessages = [...chatMessages].sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    return timeA - timeB;
  });
  const reversedChatMessages = sortedChatMessages.reverse();

  return (
    <SafeAreaView style={{ backgroundColor: PRIMARY_BACKGROUND_COLOR }}>
      {isLoading ? (
        <View>
          <Text>Loading</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
              <Image
                source={require("../assets/left-arrow.png")}
                style={{ height: 35, width: 35 }}
              />
            </TouchableOpacity>

            <View style={styles.receiverInfoContainer}>
              <Image
                source={{ uri: receiverInfo.image }}
                style={styles.receiverImage}
              />
              <Text style={styles.receiverName}>{receiverInfo.name}</Text>
            </View>
          </View>
          <FlatList
            style={styles.chatContainer}
            data={reversedChatMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderChatMessage}
            contentContainerStyle={styles.chatContentContainer}
            inverted={true}
          />
          <KeyboardAvoidingView
            style={styles.inputContainer}
            behavior="padding"
          >
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="gray"
              value={message}
              onChangeText={(text) => setMessage(text)}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  chatContainer: {
    flex: 1,
  },
  chatContentContainer: {
    paddingVertical: 10,
  },
  messageContainer: {
    maxWidth: "80%",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C5",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#f2f2f2",
  },
  messageText: {
    fontSize: 16,
  },
  messageTimestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: primaryColor,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  topContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  receiverInfoContainer: {
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row",
    alignContent: "center",
  },
  receiverImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginBottom: 10,
    marginTop: 10,
    marginRight: 10,
  },
  receiverName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  attachmentImage: {
    width: 150,
    height: 150,
    // resizeMode: 'contain',
    borderRadius: 10,
  },
});

export default UserChat;
