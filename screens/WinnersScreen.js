import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  get,
  query,
  onValue,
  orderByChild,
  equalTo,
} from "firebase/database";
import {
  primaryColor,
  PRIMARY_BACKGROUND_COLOR,
  SECONDARY_BACKGROUND_COLOR,
} from "../colors";
import Wheel from "./Wheel";
import { auth } from "../config";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const WinnersScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [winners, setWinners] = useState([]);
  const userId = auth.currentUser.uid;
  const userName = auth.currentUser.displayName;
  const [requestedProducts, setRequestedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wheelModalOpen, setWheelModalOpen] = useState(false);
  const [selectedProductKey, setSelectedProductKey] = useState("");
  const db = getDatabase();
  // Fetch the product title based on the productKey
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
      } else {
        setNotifications([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching winners:", error);
    }
  };

  useEffect(() => {
    const winnersRef = ref(db, "wheeluser/");
    const winnersQuery = query(winnersRef);
    const unsubscribeWinners = onValue(winnersQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const winners = Object.values(data);
        setWinners(winners);

        const productKeys = Object.keys(data);
        const fetchRequestedProducts = () => {
          setRequestedProducts([]);
          const productKeys = Object.keys(data);

          productKeys.forEach((productKey) => {
            const requestsRef = ref(db, `wheeluser/${productKey}`);
            const requestsQuery = query(
              requestsRef,
              orderByChild("key"),
              equalTo(userId)
            );

            get(requestsQuery).then((requestsSnapshot) => {
              if (requestsSnapshot.exists()) {
                const pro = Object.values(requestsSnapshot.val());
                pro.forEach((request) => {
                  if (request.accepted === true) {
                    const productsRef = ref(db, `product/${productKey}`);
                    const productsQuery = query(productsRef);

                    get(productsQuery).then((productsSnapshot) => {
                      if (productsSnapshot.exists()) {
                        const productData = productsSnapshot.val();
                        const requestedProduct = {
                          id: productKey,
                          ...productData,
                        };

                        setRequestedProducts((prevRequestedProducts) => [
                          ...prevRequestedProducts,
                          requestedProduct,
                        ]);
                      }
                    });
                  }
                });
              }
            });
          });
        };

        // Fetch requested products initially
        // ...
        fetchRequestedProducts();
      } else {
        setWinners([]);
      }
    });

    return () => {
      unsubscribeWinners();
    };
  }, [userId]);
  useEffect(() => {
    return () => fetchWinners();
  });
  const Loader = () => {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator
          size="small"
          color={primaryColor}
          style={{ alignSelf: "center" }}
        />
      </SafeAreaView>
    );
  };

  const openWheelModal = (productId) => {
    setSelectedProductKey(productId);
    setWheelModalOpen(true);
    console.log(productId);
  };
  const closeWheelModal = () => {
    setWheelModalOpen(false);
  };

  return (
    <View style={styles.container}>
      <View>
        {isLoading ? (
          <Loader />
        ) : (
          <ScrollView>
            <SafeAreaView>
              <Text style={styles.heading}>Your Enrolled Wheels</Text>
              <ScrollView horizontal>
                {requestedProducts.length === 0 ? (
                  <Text style={{ margin: 10 }}>
                    You have not enrolled in any wheel
                  </Text>
                ) : (
                  <ScrollView horizontal>
                    {requestedProducts.map((product, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => openWheelModal(product.id)}
                        style={{
                          alignItems: "center",
                          backgroundColor: "#ffffff",
                          marginHorizontal: windowWidth * 0.03,
                          elevation: 3,
                          shadowColor: "black",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 2,
                          borderRadius: 10,
                          paddingHorizontal: 9,
                          width: windowWidth * 0.4,
                        }}
                      >
                        {product.images &&
                          Object.keys(product.images).length > 0 && (
                            <Image
                              source={{
                                uri: product.images[
                                  Object.keys(product.images)[0]
                                ],
                              }}
                              style={{
                                height: windowHeight * 0.3,
                                width: windowWidth * 0.3,
                              }}
                              resizeMode="contain"
                            />
                          )}
                        <Text
                          numberOfLines={2}
                          lineBreakMode="clip"
                          style={{
                            flexShrink: 1,
                            fontWeight: "600",
                            marginHorizontal: windowWidth * 0.05,
                          }}
                        >
                          {product.title}
                        </Text>
                        <Text
                          style={{
                            marginVertical: windowHeight * 0.01,
                            color: "red",
                          }}
                        >
                          ${product.currentprice}.00
                        </Text>
                        <Text style={{ textDecorationLine: "line-through" }}>
                          ${product.beforeprice}.00
                        </Text>
                        <Text
                          style={{
                            marginTop: windowHeight * 0.01,
                            fontSize: 15,
                          }}
                        >
                          {product.city}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </ScrollView>
              {wheelModalOpen ? (
                <Modal>
                  <Wheel
                    closeModal={closeWheelModal}
                    productKey={selectedProductKey}
                  />
                </Modal>
              ) : null}

              <Text style={styles.heading1}>Winners</Text>
            </SafeAreaView>
            {notifications.map((winner) => (
              <View style={styles.card} key={winner.key}>
                <View style={styles.cardContent}>
                  <Image source={{ uri: winner.image }} style={styles.image} />
                  <View style={styles.textContainer}>
                    <Text style={styles.name}>{winner.productTitle}</Text>
                    <Text style={{ marginVertical: 5 }}>
                      Winner: {winner.name}
                    </Text>

                    <Text>{winner.date}</Text>
                    <Text style={{ marginHorizontal: 10 }}>{winner.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default WinnersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    padding: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    margin: windowWidth * 0.03,
    color: primaryColor,
  },
  enrollTxt: {
    fontSize: 16,
    alignSelf: "center",
    color: "gray",
    fontWeight: "500",
  },
  heading1: {
    fontSize: 20,
    fontWeight: "700",
    margin: windowWidth * 0.03,
    color: primaryColor,
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

    color: SECONDARY_BACKGROUND_COLOR,
  },
  loaderContainer: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
