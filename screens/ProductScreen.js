import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from "../colors";
import {
  getDatabase,
  ref,
  get,
  child,
  query,
  onValue,
  onChildAdded,
  DataSnapshot,
  set,
  push,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import Chat from "./Chat";
import SlidingWindow from "./SlidingWindow";

const ProductScreen = ({ closeModal, sellerUid, productTitle }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProducts, setFilteredproducts] = useState([]);
  const [productImages, setProductImages] = useState();
  const [chatOpen, setChatOpen] = useState(false);
  const [senderId, setSenderId] = useState();
  const [receiverId, setReceiverId] = useState();
  const [textAbout, setTextAbout] = useState();
  const [productImage, setProductImage] = useState();
  const [productKey, setProductKey] = useState();
  const [user, setUser] = useState();
  const [reactions, setReactions] = useState({});
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState("");
  const [reactionsCount, setReactionsCount] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showSlideWindow, setShowSlideWindow] = useState(false);
  const db = getDatabase();
  const productRef = ref(db, "product/");
  const productQuery = query(productRef);
  const auth = getAuth();
  const userId = auth.currentUser.uid;

  const handleLikeLongPress = () => {
    setShowReactions(true);
  };

  const handleReactionSelect = (reaction) => {
    setSelectedReaction(reaction);
    setShowReactions(false);

    const db = getDatabase();
    const reactionsRef = ref(db, `reactions/${productKey}/${userId}`);
    const userReactionRef = ref(
      db,
      `userinfo/${userId}/reaction/${productKey}`
    );
    const newReactionRef = reactionsRef;

    const newReactionData = {
      reactText: reaction,
      username: auth.currentUser.displayName,
    };
    const userReactData = {
      reactText: reaction,
    };

    set(newReactionRef, newReactionData);
    set(userReactionRef, userReactData);
  };

  const calculateReactionsCount = (updatedReactions) => {
    const counts = {};

    Object.values(updatedReactions).forEach((reaction) => {
      const { reactText } = reaction;

      if (counts[reactText]) {
        counts[reactText]++;
      } else {
        counts[reactText] = 1;
      }
    });
    return counts;
  };

  const fetchProducts = () => {
    onValue(productQuery, (querySnapShot) => {
      let data = querySnapShot.val() || {};

      if (data) {
        const productsArray = Object.keys(data).map((key) => ({
          key,
          ...data[key],
        }));
        setProducts(productsArray);
        const filtered = productsArray.filter(
          (product) => product.title === productTitle
        );
        const productKey = filtered?.map((product) => product.key);
        setProductKey(productKey);
        setFilteredproducts(filtered);
        fetchReaction(productKey);
        fetchUserReaction(productKey);
      } else {
        setFilteredproducts([]);
        console.log("no get");
      }
    });
  };

  const fetchReaction = async (key) => {
    const reactionsRef = ref(db, `reactions/${key}`);

    onChildAdded(reactionsRef, (snapshot) => {
      const reaction = snapshot.val();
      if (reaction) {
        setReactions((prevReactions) => ({
          ...prevReactions,
          [snapshot.key]: reaction,
        }));
        const updatedReactions = {
          ...reactions,
          [snapshot.key]: reaction,
        };

        const counts = calculateReactionsCount(updatedReactions);
        setReactionsCount(counts);
      } else {
        ("No reaction got!");
      }
    });
  };

  useEffect(() => {
    if (filteredProducts.length > 0) {
      const images = Object.values(filteredProducts[0].images);
      setProductImages(images);
      setProductImage(images[0]);
      setIsLoading(false);
    }
  }, [filteredProducts]);

  const userInfoRef = ref(db, `userinfo/${userId}`);
  const fetchUserInfo = () => {
    onValue(userInfoRef, (snapshot) => {
      const userInfo = snapshot.val();
      if (userInfo) {
        setUser(userInfo);
      } else {
        setUser([]);
        console.log("no user got");
      }
    });
  };

  const fetchUserReaction = (key) => {
    const reactionsRef = ref(db, `reactions/${key}/${userId}`);

    onValue(reactionsRef, (snapshot) => {
      const userReaction = snapshot.val();
      if (userReaction) {
        setUserReaction(userReaction);
      } else {
        console.log(productKey, userId);
        console.log("Can't get user reaction");
      }
    });
  };

  const calculateDistance = () => {
    const lat1 = parseFloat(user?.lattitude);
    const lon1 = parseFloat(user?.longitude);
    const lat2 = parseFloat(filteredProducts[0]?.fetchLat);
    const lon2 = parseFloat(filteredProducts[0]?.fetchLong);

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180); // Convert latitude difference to radians
    const dLon = (lon2 - lon1) * (Math.PI / 180); // Convert longitude difference to radians

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    setDistance(distance.toFixed(2)); // Set the distance with 2 decimal places
  };

  useEffect(() => {
    fetchUserInfo();
    calculateDistance();
    addVisitor(productKey, userId);
  }, [isLoading]);
  const addVisitor = async (productID, visitorID) => {
    const db = getDatabase();
    const date = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const visitorsRef = ref(
      db,
      `product/${productID}/visitors/${visitorID}${date}`
    );

    const visitorData = {
      date: new Date().toLocaleDateString(),
      key: visitorID,
      productID: productID,
      visitorID: visitorID + date,
    };
    try {
      await set(visitorsRef, visitorData);
    } catch (error) {}
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedReaction]);

  const openChat = (senderId, receiverUserId, productTitle) => {
    setChatOpen(true);
    setSenderId(senderId);
    setReceiverId(receiverUserId);
    setTextAbout(productTitle);
  };
  const closeChat = () => {
    setChatOpen(false);
  };

  const getReactionIcon = (reactionText) => {
    switch (reactionText) {
      case "Like":
        return require("../assets/like.png");
      case "Love":
        return require("../assets/heart.png");
      case "Haha":
        return require("../assets/Haha.png");
      case "Wow":
        return require("../assets/wow.png");
      case "Sad":
        return require("../assets/sad.png");
      case "Angry":
        return require("../assets/angry.png");
      default:
        return null;
    }
  };

  const openSlideWindow = (senderId, receiverUserId, productTitle) => {
    setShowSlideWindow(true);
    setSenderId(senderId);
    setReceiverId(receiverUserId);
    setTextAbout(productTitle);
  };

  // Function to close the slide window
  const closeSlideWindow = () => {
    setShowSlideWindow(false);
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View>
          <Text>Loading....</Text>
        </View>
      ) : (
        <ScrollView>
          <SafeAreaView>
            <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
              <Image
                source={require("../assets/left-arrow.png")}
                style={{ height: 35, width: 35 }}
              />
            </TouchableOpacity>
            <Text style={styles.heading}>{productTitle}</Text>
            <View>
              <ScrollView horizontal>
                {productImages &&
                  productImages.map((image, index) => (
                    <Image
                      key={index}
                      source={{ uri: image }}
                      style={styles.productImage}
                    />
                  ))}
              </ScrollView>
            </View>
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 10,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../assets/distance.png")}
                  style={{ height: 35, width: 35 }}
                />
                <Text style={{ marginHorizontal: 5 }}>{distance} KM AWAY</Text>
              </View>
              <Text>
                {filteredProducts[0]?.city
                  ? `City: ${filteredProducts[0]?.city}`
                  : null}
              </Text>
            </View>
            <Text style={styles.categoryTxt}>
              Catagory: {filteredProducts[0]?.categories_name}
            </Text>
            <View style={{ flexDirection: "row", marginHorizontal: 10 }}>
              {Object.entries(reactionsCount)?.map(
                ([reactionText, count], index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          alignSelf: "center",
                          marginLeft: 10,
                          marginRight: 5,
                          fontSize: 20,
                          color:
                            reactionText === selectedReaction
                              ? primaryColor
                              : "gray",
                        }}
                      >
                        {count}
                      </Text>
                      <Image
                        source={getReactionIcon(reactionText)}
                        style={{ height: 24, width: 24, alignSelf: "center" }}
                      />
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginHorizontal: 10,
              }}
            >
              <View style={{ alignSelf: "center" }}>
                <Text style={{ fontSize: 18 }}>
                  Current Price: ${filteredProducts[0]?.currentprice}
                </Text>
                <Text style={{}}>
                  Original Price: ${filteredProducts[0]?.beforeprice}
                </Text>
              </View>
              {userReaction ? (
                <TouchableOpacity
                  onPress={handleLikeLongPress}
                  style={styles.likeBtn}
                >
                  <Image
                    source={getReactionIcon(userReaction.reactText)}
                    style={{ height: 35, width: 35 }}
                  />
                  <Text style={{ marginLeft: 5, color: "gray" }}>
                    {userReaction.reactText}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleLikeLongPress}
                  style={styles.likeBtn}
                >
                  <Image
                    source={require("../assets/like.png")}
                    style={{ height: 35, width: 35 }}
                  />
                  <Text style={{ marginLeft: 5, color: "gray" }}>Like</Text>
                </TouchableOpacity>
              )}
              {showReactions && (
                <View style={styles.reactionMenu}>
                  <TouchableOpacity
                    onPress={() => handleReactionSelect("Like")}
                    style={styles.reactionButton}
                  >
                    <Text>Like</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleReactionSelect("Love")}
                    style={styles.reactionButton}
                  >
                    <Text>Love</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleReactionSelect("Haha")}
                    style={styles.reactionButton}
                  >
                    <Text>Haha</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleReactionSelect("Wow")}
                    style={styles.reactionButton}
                  >
                    <Text>Wow</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleReactionSelect("Sad")}
                    style={styles.reactionButton}
                  >
                    <Text>Sad</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleReactionSelect("Angry")}
                    style={styles.reactionButton}
                  >
                    <Text>Angry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Text style={[styles.heading, { marginVertical: 10 }]}>
              Description
            </Text>
            <Text
              style={{
                textAlign: "justify",
                marginHorizontal: 10,
                color: "gray",
              }}
            >
              {filteredProducts[0]?.description}
            </Text>

            <TouchableOpacity
              style={styles.msgBtn}
              onPress={() =>
                openChat(
                  userId,
                  filteredProducts[0]?.user_id,
                  filteredProducts[0]?.title
                )
              }
            >
              <Image
                source={require("../assets/email.png")}
                style={{ height: 35, width: 35 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.purchaseBtn}
              onPress={() =>
                openSlideWindow(
                  userId,
                  filteredProducts[0]?.user_id,
                  filteredProducts[0]?.title
                )
              }
            >
              <Text style={styles.btnTxt}>Ways To Purchase</Text>
            </TouchableOpacity>
            {chatOpen ? (
              <Modal isVisible={chatOpen}>
                <Chat
                  closeModal={closeChat}
                  senderId={senderId}
                  recieverId={receiverId}
                  textAbout={textAbout}
                  productImage={productImage}
                />
              </Modal>
            ) : null}
          </SafeAreaView>
          
        </ScrollView>
      )}
      <Modal
        visible={showSlideWindow}
        animationType="slide"
        transparent={true}
        userId={userId}
      >
        <SlidingWindow
          closeModal={closeSlideWindow}
          senderId={senderId}
          recieverId={receiverId}
          textAbout={textAbout}
          productImage={productImage}
          product={filteredProducts[0]}
          amount={filteredProducts[0]?.currentprice}
        />
      </Modal>
    </View>
  );
};

export default ProductScreen;

const styles = StyleSheet.create({
  container: {
    flex:1,
    height: "100%",
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  topContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: primaryColor,
    paddingHorizontal: 10,
  },
  productImage: {
    height: 220,
    width: 335,
    marginRight: 10,
    borderWidth: 0.5,
    alignSelf: "center",
    marginVertical: 15,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  categoryTxt: {
    marginHorizontal: 10,
    marginVertical: 10,
  },

  purchaseBtn: {
    backgroundColor: primaryColor,
    height: 55,
    width: "95%",
    alignSelf: "center",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  btnTxt: {
    fontWeight: "600",
    fontSize: 16,
    color: "#FFFFFF",
  },
  msgBtn: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    height: 60,
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 35,
    alignSelf: "flex-end",
  },
  likeBtn: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    paddingVertical: 5,
    borderRadius: 10,
  },
  reactionMenu: {
    position: "absolute",
    bottom: 20,
    left: 20,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  reactionButton: {
    marginRight: 10,
  },
});
