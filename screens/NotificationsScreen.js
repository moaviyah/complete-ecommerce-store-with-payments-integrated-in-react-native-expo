import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  getDatabase,
  ref,
  get,
  child,
  query,
  onValue,
} from "firebase/database";
import {
  FOREGROUND_COLOR,
  primaryColor,
  PRIMARY_BACKGROUND_COLOR,
  SECONDARY_BACKGROUND_COLOR,
} from "../colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]); // Initialize as an empty array
  const [isLoading, setIsLoading] = useState(true);
  const db = getDatabase();
  const fetchWinners = async () => {
    const notificationsRef = ref(db, "winner/");
    const notificationQuery = query(notificationsRef);

    try {
      const snapshot = await get(notificationQuery);
      const data = snapshot.val();

      if (data) {
        const notificationsPromises = Object.values(data).map(
          async (winner) => {
            const productKey = winner.productkey;
            const productRef = ref(db, `product/${productKey}`);
            const productSnapshot = await get(productRef);
            const product = productSnapshot.val();

            if (product) {
              return {
                ...winner,
                productTitle: product.title,
              };
            }
          }
        );

        const notifications = await Promise.all(notificationsPromises);
        setNotifications(notifications);
        setIsLoading(false);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.log("Error fetching winners:", error);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <ScrollView>
          <View
            style={{ flexDirection: "row", marginBottom: windowHeight * 0.03 }}
          >
            <Image
              source={require("../assets/ic_launcher-playstore.png")}
              style={{
                height: windowWidth * 0.12,
                width: windowWidth * 0.12,
                borderRadius: 25,
              }}
            />
            <Text style={styles.winnerTxt}> Winners Notifications</Text>
          </View>
          {notifications.map((winner) => (
            <View style={styles.card} key={winner.key}>
              <View style={styles.cardContent}>
                <Image source={{ uri: winner.image }} style={styles.image} />
                <View style={styles.textContainer}>
                  <Text style={styles.name}>{winner.name}</Text>
                  <Text>
                    {winner.name} has recently won {winner.productTitle}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
  },
  winnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  winnerTxt: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: windowWidth * 0.02,
    color: primaryColor,
  },
});
