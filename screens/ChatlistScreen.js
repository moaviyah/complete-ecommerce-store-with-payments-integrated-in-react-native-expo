import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  SafeAreaView,
} from "react-native";
import React from "react";
import {
  getDatabase,
  ref,
  onValue,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import UserChat from "./UserChat";

const ChatlistScreen = ({ closeModal }) => {
  const [isLoading, setIsLoading] = useState(true);
  const db = getDatabase();
  const auth = getAuth();
  const [conversations, setConversations] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const userId = auth.currentUser.uid;
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [recieverId, setRecieverId] = useState();
  const [senderId, setSenderId] = useState();
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // Fetch the conversations for the current user
        const chatRef = ref(db, `Chatlist/${userId}`);
        const chatSnapshot = await get(chatRef);

        if (chatSnapshot.exists()) {
          const conversationIds = Object.keys(chatSnapshot.val());

          // Fetch the user information and last message for each conversation
          const conversationsData = await Promise.all(
            conversationIds.map(async (conversationId) => {
              const userRef = ref(db, `userinfo/${conversationId}`);
              const userSnapshot = await get(userRef);

              const user = userSnapshot.val();

              const messagesRef = ref(db, "Chats");
              const messagesQuery = query(messagesRef);

              const messagesSnapshot = await get(messagesQuery);
              const messages = messagesSnapshot.val();

              let lastMessage = "";
              if (messages) {
                const filteredMessages = Object.values(messages).filter(
                  (message) =>
                    (message.receiver === conversationId &&
                      message.sender === userId) ||
                    (message.sender === conversationId &&
                      message.receiver === userId)
                );
                if (filteredMessages.length > 0) {
                  lastMessage =
                    filteredMessages[filteredMessages.length - 1].message;
                }
              }

              return {
                id: conversationId,
                name: user.name,
                image: user.image,
                lastMessage: lastMessage,
              };
            })
          );

          setConversations(conversationsData);
        }
        setIsLoading(false);
      } catch (error) {
        console.log("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, []);

  const openChatModal = (recieverId) => {
    setChatModalVisible(true);
    setRecieverId(recieverId);
    console.log(recieverId);
  };

  const closeChatModal = () => {
    setChatModalVisible(false);
  };

  const renderConversationItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => openChatModal(item.id)}
      >
        <Image source={{ uri: item.image }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        </View>
        {chatModalVisible ? (
          <Modal isVisible={chatModalVisible}>
            <View>
              <UserChat
                closeModal={closeChatModal}
                senderId={userId}
                recieverId={recieverId}
              />
            </View>
          </Modal>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView>
      {isLoading ? (
        <View>
          <Text>Loading</Text>
        </View>
      ) : conversations.length > 0 ? (
        <View style={styles.container}>
          <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
            <Image
              source={require("../assets/left-arrow.png")}
              style={{ height: 35, width: 35 }}
            />
          </TouchableOpacity>
          <View>
            <FlatList
              data={conversations}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false} // Hide horizontal scroll indicator
              contentContainerStyle={styles.conversationList} // Apply custom styles to the container of conversation items
            />
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
            <Image
              source={require("../assets/left-arrow.png")}
              style={{ height: 35, width: 35 }}
            />
          </TouchableOpacity>
          <View style={styles.noMessageContainer}>
            <Text style={styles.noMessageText}>No messages yet</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ChatlistScreen;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    paddingHorizontal: 20,
  },
  topContainer: {
    paddingVertical: 10,
  },
  conversationList: {
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
  },
  conversationItem: {
    marginRight: 10,
    alignItems: "flex-start",
    flexDirection: "row",
    marginVertical: 10,
    borderBottomWidth: 0.5,
    paddingVertical: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  name: {
    marginTop: 5,
    fontWeight: "600",
  },
  lastMessage: {
    marginTop: 2,
    color: "gray",
    fontSize: 15,
  },
  noMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMessageText: {
    fontSize: 16,
    color: "gray",
  },
});
