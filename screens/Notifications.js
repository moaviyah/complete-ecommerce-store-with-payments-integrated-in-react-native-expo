import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from "../colors";
import { getDatabase, ref, onValue, off } from "firebase/database";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Notifications = ({ closeModal }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const notificationsRef = ref(db, "Notifications");

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsArray = Object.keys(data).map((key) => data[key]);
        const sortedNotifications = notificationsArray.sort((a, b) => {
          // Convert date strings to "YYYY-MM-DD" format for proper sorting
          const aDate = a.date.split("/").reverse().join("-");
          const bDate = b.date.split("/").reverse().join("-");
          return new Date(bDate) - new Date(aDate);
        });
        setNotifications(sortedNotifications);
      } else {
        setNotifications([]);
      }
    });

    // Clean up the listener when the component unmounts
    return () => {
      off(notificationsRef, "value", unsubscribe);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
        <Image
          source={require("../assets/left-arrow.png")}
          style={{ height: 35, width: 35 }}
        />
      </TouchableOpacity>
      <Text style={styles.heading}>Notifications</Text>
      {notifications.map((notification, index) => (
        <View key={index} style={styles.notificationContainer}>
          <Image
            source={require("../assets/newlogo.jpeg")}
            style={{ height: 35, width: 35, borderRadius: 25 }}
          />
          <View style={styles.notificationTextContainer}>
            <Text style={styles.message}>{notification.notification}</Text>
            <View
              style={{
                flexDirection: "row",
                alignSelf: "flex-end",
                marginTop: 5,
              }}
            >
              <Text style={styles.date}>{notification.date} at </Text>
              <Text style={styles.time}>{notification.time}</Text>
            </View>
          </View>
        </View>
      ))}
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    height: windowHeight,
    width: windowWidth,
  },
  topContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginHorizontal: 20,
    color: primaryColor,
  },
  notificationContainer: {
    marginBottom: 20,
    flexDirection: "row",
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  notificationTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  date: {
    fontSize: 11,
    marginBottom: 5,
  },
  time: {
    fontSize: 12,
    color: "gray",
    marginBottom: 5,
  },
  message: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "justify",
  },
});
