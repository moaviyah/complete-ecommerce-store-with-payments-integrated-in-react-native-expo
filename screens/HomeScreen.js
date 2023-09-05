import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import {
  FOREGROUND_COLOR,
  primaryColor,
  PRIMARY_BACKGROUND_COLOR,
  SECONDARY_BACKGROUND_COLOR,
} from "../colors";
import Swiper from "react-native-swiper";
import {
  getDatabase,
  ref,
  get,
  child,
  query,
  onValue,
  onChildAdded,
  DataSnapshot,
} from "firebase/database";
import { Card } from "react-native-elements";
import ShineImage from "../components/ShineImage";
import { firebaseApp } from "../config";
import AllCategoriesScreen from "./AllCategories";
import UserInfo from "./UserInfo";
import { getAuth, updateProfile } from "firebase/auth";
import CategoryScreen from "./CategoryScreen";
import ChatlistScreen from "./ChatlistScreen";
import SearchProducts from "./SearchProducts";
import AllHotProducts from "./AllHotProducts";
import AllBestSellingProducts from "./AllBestSellingProducts";
import ProductScreen from "./ProductScreen";
import WheelProductScreen from "./WheelProductScreen";
import SearchLocalProducts from "./SearchLocalProducts";
import Reels from "./Reels";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const HomeScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [bestSeller, setBestSeller] = useState([]);
  const [advertiseContent, setAdvertiseContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [userInfoModalVisible, setUserInfoModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [chatListModalVisible, setChatListModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [allHotProductsModalVisible, setAllHotProductsModalVisible] =
    useState(false);
  const [allBestSellingModalVisible, setAllBestSellingModalVisible] =
    useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [wheelProductModalOpen, setWheelProductModalOpen] = useState(false);
  const [searchLocalProductModalVisible, setSearchLocalProductModalVisible] =
    useState(false);
  const [reelModalOpen, setReelModalOpen] = useState(false)
  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase();
    const userId = auth.currentUser.uid;
    const categoriesRef = ref(db, "categories/");
    const hotProductsRef = ref(db, "Hot Product");
    const bestSellerRef = ref(db, "Best Selling");
    const advertiseRef = ref(db, "advertise/");
    const userInfoRef = ref(db, `userinfo/${userId}`);
    const catRef = query(categoriesRef);
    const hotProductsQuery = query(hotProductsRef);
    const bestSellerQuery = query(bestSellerRef);
    const advertiseQuery = query(advertiseRef);
    const userInfoQuery = query(userInfoRef);
    setIsLoading(true);

    const unsubscribeCat = onValue(catRef, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      if (data) {
        const categoriesList = Object.keys(data).map((key) => ({
          id: key,
          image: data[key].categories_image,
          name: data[key].categories_name,
        }));

        const sortedCategories = categoriesList.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setCategories(sortedCategories);
      } else {
        setCategories([]);
      }
    });

    const unsubscribeHotProducts = onValue(
      hotProductsQuery,
      (querySnapShot) => {
        let data = querySnapShot.val();

        if (data) {
          const products = Object.values(data).sort((a, b) =>
            a.title.localeCompare(b.title)
          ).filter((product) => product.status === "approved"); // Sort the array alphabetically by title
          setHotProducts(products);
        } else {
          setHotProducts([]);
        }
      }
    );

    const unsubscribeBestSeller = onValue(bestSellerQuery, (querySnapShot) => {
      let data = querySnapShot.val();
      if (data) {
        const products = Object.values(data).sort((a, b) =>
          a.title.localeCompare(b.title)
        ).filter((product) => product.status === "approved");
        setBestSeller(products);
      } else {
        setBestSeller([]);
      }
    });

    const unsubscribeAdvertise = onValue(advertiseQuery, (querySnapShot) => {
      let data = querySnapShot.val();
      if (data) {
        const advertisement = Object.values(data);
        console.log("Advertisement", advertisement);
        setAdvertiseContent(advertisement);
        setIsLoading(false);
      } else {
        setAdvertiseContent([]);
      }
    });

    const unsubscribeUserInfo = onValue(userInfoQuery, (querySnapShot) => {
      let data = querySnapShot.val();
      if (data) {
        setUserInfoModalVisible(false);
      } else {
        setUserInfoModalVisible(true);
      }
    });

    return () => {
      unsubscribeCat();
      unsubscribeHotProducts();
      unsubscribeBestSeller();
      unsubscribeAdvertise();
      unsubscribeUserInfo();
    };
  }, []);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const ImageCard = ({ name, imageUrl }) => {
    const truncatedName = name.length > 10 ? name.slice(0, 10) + "..." : name;
    const handlePress = () => {
      setSelectedCategory(name);
      setCategoryModalVisible(true);
    };
    return (
      <TouchableOpacity onPress={handlePress}>
        <Card containerStyle={styles.cardContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image1} />
          <Text style={styles.name}>{truncatedName}</Text>
        </Card>
      </TouchableOpacity>
    );
  };

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

  const closeModal = () => {
    setModalVisible(false);
  };
  const closeUserInfoModal = () => {
    setUserInfoModalVisible(false);
  };
  const closeCategoryModal = () => {
    setCategoryModalVisible(false);
  };
  const closeChatListModal = () => {
    setChatListModalVisible(false);
  };
  const closeSearchModal = () => {
    setSearchModalVisible(false);
  };
  const closeLocalProductSearchModal = () => {
    setSearchLocalProductModalVisible(false);
  };
  const closeAllHotProductsModal = () => {
    setAllHotProductsModalVisible(false);
  };
  const closeAllBestSellingModal = () => {
    setAllBestSellingModalVisible(false);
  };
  const [sellerUid, setSellerUid] = useState("");
  const [productKey, setProductKey] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const openProductModal = (userId, productKey, productTitle) => {
    setSellerUid(userId),
      setProductKey(productKey),
      setProductTitle(productTitle);
    setProductModalOpen(true);
  };
  const closeproductModal = () => {
    setProductModalOpen(false);
  };

  const closeWheelProductModal = () => {
    setWheelProductModalOpen(false);
  };

  const openReelModal = ()=>{
    setReelModalOpen(true)
  }

  const closeReelModal = () =>{
    setReelModalOpen(false)
  }
  return (
    <ScrollView style={styles.container}>
      {isLoading ? (
        <Loader />
      ) : (
        <SafeAreaView>
          <Swiper
            autoplay
            style={styles.swiper}
            showsPagination={true}
            dotStyle={styles.dot}
            activeDotStyle={styles.activeDot}
            paginationStyle={styles.pagination}
            horizontal={true}
          >
            {advertiseContent.map((advertise, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (advertise.link) {
                    Linking.openURL(advertise.link);
                  }
                }}
              >
                <Image
                  source={{ uri: advertise.image }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </Swiper>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 5,
              paddingHorizontal: 15,
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity>
              <Text style={{ fontSize: 22, fontWeight: "600" }}>
                Let's get Started
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={styles.searchbtn}
                onPress={() => setSearchModalVisible(true)}
              >
                <View style={styles.btnContainer}>
                  <Image
                    source={require("../assets/location.png")}
                    style={{
                      width: 30,
                      height: 30,
                      alignSelf: "center",
                    }}
                  />
                </View>
              </TouchableOpacity>
              {searchModalVisible ? (
                <Modal>
                  <View>
                    <SearchProducts closeModal={closeSearchModal} />
                  </View>
                </Modal>
              ) : null}
              {searchLocalProductModalVisible ? (
                <Modal>
                  <View>
                    <SearchLocalProducts
                      closeModal={closeLocalProductSearchModal}
                    />
                  </View>
                </Modal>
              ) : null}
              <TouchableOpacity
                style={styles.msgContainer}
                onPress={() => setChatListModalVisible(true)}
              >
                <Image
                  source={require("../assets/chat.png")}
                  style={styles.imgIcon}
                />
              </TouchableOpacity>
            </View>
            {chatListModalVisible ? (
              <Modal isVisible={chatListModalVisible}>
                <View>
                  <ChatlistScreen closeModal={closeChatListModal} />
                </View>
              </Modal>
            ) : null}
          </View>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              paddingHorizontal: 30,
              paddingVertical: 20,
              backgroundColor: "white",
              margin: 15,
              justifyContent: "space-between",
              borderRadius: 10,
            }}
            onPress={() => setSearchLocalProductModalVisible(true)}
          >
            <Text style={{ fontSize: 20, fontWeight: "500" }}>
              Shop in your local area
            </Text>
            <Image
              source={require("../assets/search.png")}
              style={{ height: 24, width: 24 }}
            ></Image>
          </TouchableOpacity>
          <View style={styles.middleTab}>
            <Text style={styles.middletxt}>Shop by categories</Text>
            <Text
              style={styles.seeAlltxt}
              onPress={() => {
                setModalVisible(true);
              }}
            >
              See All
            </Text>
          </View>
          {modalVisible ? (
            <Modal
              isVisible={false}
              onBackdropPress={() => setModalVisible(false)}
            >
              <View>
                <AllCategoriesScreen closeModal={closeModal} />
              </View>
            </Modal>
          ) : null}
          {userInfoModalVisible ? (
            <Modal isVisible={false}>
              <View>
                <UserInfo closeModal={closeUserInfoModal} />
              </View>
            </Modal>
          ) : null}
          {
            reelModalOpen ? (
              <Modal visible={reelModalOpen}>
                <Reels closeModal = {closeReelModal}/>
              </Modal>
            )
            :
            null
          }
          <View
            style={{
              height: windowHeight * 0.25,
              marginHorizontal: windowWidth * 0.02,
            }}
          >
            <ScrollView>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  backgroundColor: "transparent",
                }}
              >
                {categories.map((item, index) => (
                  <ImageCard
                    key={index}
                    name={item.name}
                    imageUrl={item.image}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {categoryModalVisible ? (
            <Modal
              isVisible={categoryModalVisible}
              onBackdropPress={() => setModalVisible(false)}
            >
              <CategoryScreen
                catagoryName={selectedCategory}
                closeModal={closeCategoryModal}
              />
            </Modal>
          ) : null}

          <TouchableOpacity
            style={{ padding: 5 }}
            onPress={() => setWheelProductModalOpen(true)}
          >
            <Text
              style={{
                alignSelf: "center",
                fontWeight: "500",
                marginTop: 10,
              }}
            >
              Enter the wheel to WIN Items or Services.
            </Text>
            <ShineImage
              source={require("../assets/wheel_image_new.png")}
              style={{
                flex: 1,
                maxWidth: windowWidth * 0.9,
                borderRadius: 10,
                alignSelf: "center",
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {wheelProductModalOpen ? (
            <Modal isVisible={wheelProductModalOpen}>
              <WheelProductScreen closeModal={closeWheelProductModal} />
            </Modal>
          ) : null}

          <View style={styles.middleTab}>
            <Text style={styles.middletxt}>Hot Products</Text>
            <TouchableOpacity
              onPress={() => setAllHotProductsModalVisible(true)}
            >
              <Text style={styles.seeAlltxt}>See All</Text>
            </TouchableOpacity>
            {allHotProductsModalVisible ? (
              <Modal>
                <View>
                  <AllHotProducts closeModal={closeAllHotProductsModal} />
                </View>
              </Modal>
            ) : null}
          </View>

          <ScrollView horizontal={true}>
            {hotProducts.map((product, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  openProductModal(product.user_id, product.key, product.title)
                }
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
                <Image
                  source={{
                    uri: product.images[Object.keys(product.images)[0]],
                  }}
                  style={{
                    height: windowHeight * 0.3,
                    width: windowWidth * 0.3,
                  }}
                  resizeMode="contain"
                />
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
                  style={{ marginVertical: windowHeight * 0.01, color: "red" }}
                >
                  ${product.currentprice}.00
                </Text>
                <Text style={{ textDecorationLine: "line-through" }}>
                  ${product.beforeprice}.00
                </Text>
                <Text style={{ marginTop: windowHeight * 0.01, fontSize: 15 }}>
                  {product.city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {productModalOpen ? (
            <Modal isVisible={productModalOpen}>
              <ProductScreen
                closeModal={closeproductModal}
                sellerUid={sellerUid}
                productTitle={productTitle}
                productKey={productKey}
              />
            </Modal>
          ) : null}
          <View style={styles.middleTab}>
            <Text style={styles.middletxt}>Best Selling</Text>
            <TouchableOpacity
              onPress={() => setAllBestSellingModalVisible(true)}
            >
              <Text style={styles.seeAlltxt}>See All</Text>
            </TouchableOpacity>
            {allBestSellingModalVisible ? (
              <Modal>
                <View>
                  <AllBestSellingProducts
                    closeModal={closeAllBestSellingModal}
                  />
                </View>
              </Modal>
            ) : null}
          </View>
          <ScrollView horizontal={true}>
            {bestSeller.map((product, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  openProductModal(product.user_id, product.key, product.title)
                }
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
                <Image
                  source={{
                    uri: product.images[Object.keys(product.images)[0]],
                  }}
                  style={{
                    height: windowHeight * 0.3,
                    width: windowWidth * 0.3,
                  }}
                  resizeMode="contain"
                />
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
                  style={{ marginVertical: windowHeight * 0.01, color: "red" }}
                >
                  {product.currentprice}
                </Text>
                <Text style={{ textDecorationLine: "line-through" }}>
                  {product.beforeprice}
                </Text>
                <Text>{product.city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      )}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    marginTop: windowHeight * 0.03,
  },
  swiper: {
    height: 170,
    justifyContent: "flex-start",
    marginTop: 10,
  },
  image: {
    height: windowHeight * 0.15,
    width: windowWidth * 0.9,
    alignSelf: "center",
    borderRadius: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 5,
    marginRight: 5,
  },
  activeDot: {
    backgroundColor: "red",
  },
  imgIcon: {
    height: 25,
    width: 25,
  },
  searchbtn: {
    height: 50,
    backgroundColor: "#FFFFFF",
    width: 50,
    alignSelf: "center",
    borderRadius: 25,
    justifyContent: "center",
    paddingHorizontal: windowWidth * 0.05,
    marginHorizontal: windowWidth * 0.02,
    flexDirection: "row",
  },
  categoriesTab: {
    height: windowHeight * 0.3,
    backgroundColor: "#eaf4f4",
    margin: windowHeight * 0.02,
    borderRadius: 10,
  },
  btnContainer: {
    flexDirection: "row",
  },
  searchBtnTxt: {
    color: "#CFCFCF",
    marginHorizontal: windowWidth * 0.05,
    fontSize: 16,
    marginTop: windowHeight * 0.006,
  },
  msgContainer: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    padding: 10,
    alignItems: "center",
    borderRadius: 30,
  },
  categories_image: {
    height: windowHeight * 0.05,
    width: windowWidth * 0.1,
    borderRadius: 20,
  },

  middletxt: {
    fontWeight: "700",
  },
  seeAlltxt: {
    color: "#1167b1",
    fontSize: 16,
  },
  middleTab: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: windowWidth * 0.05,
    marginVertical: windowHeight * 0.01,
  },
  cardContainer: {
    marginHorizontal: 4,
    width: windowWidth * 0.17,
    backgroundColor: "transparent",
    borderWidth: 0, // Remove card border if necessary
    paddingHorizontal: 5, // Remove horizontal padding if necessary
    paddingVertical: 1,
    borderColor: "transparent",
    backfaceVisibility: "hidden",
  },
  image1: {
    height: windowHeight * 0.07,
    width: windowHeight * 0.07,
    alignSelf: "center", // Align image to the right,
    borderRadius: 25,
  },
  name: {
    marginTop: 5,
    fontSize: 11,
    alignSelf: "center", // Align text to the right
    color: "#1167b1",
  },
  loaderContainer: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
