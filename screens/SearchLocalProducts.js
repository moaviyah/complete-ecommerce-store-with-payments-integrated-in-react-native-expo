import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import { PRIMARY_BACKGROUND_COLOR, primaryColor } from "../colors";
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
import ProductScreen from "./ProductScreen";
import { SafeAreaView } from "react-native";
import { auth } from "../config";

const SearchLocalProducts = ({ closeModal }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const db = getDatabase();
  const productRef = ref(db, "product/");
  const productQuery = query(productRef);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [sellerUid, setSellerUid] = useState("");
  const [productKey, setProductKey] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const openProductModal = (userId, productKey, productTitle) => {
    setSellerUid(userId),
      setProductKey(productKey),
      setProductTitle(productTitle);
    setProductModalOpen(true);
  };
  const closeProductModal = () => {
    setProductModalOpen(false);
  };
  // Fetch the user's zip code and country from userInfo
  const fetchUserZipCodeAndCountry = async () => {
    const userId = auth.currentUser.uid;
    try {
      const userRef = ref(db, `userinfo/${userId}`);
      const userSnapshot = await get(userRef);
      const userInfo = userSnapshot.val();

      if (userInfo) {
        console.log(userInfo);
        const userZipCode = userInfo.zipcode;
        const userCountry = userInfo.country;

        // Filter the products based on user's zip code and country
        const filteredProducts = products.filter(
          (product) =>
            product.zipcode === userZipCode && product.country === userCountry
        );

        setFilteredProducts(filteredProducts);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Error fetching user information:", error);
    }
  };

  useEffect(() => {
    // Fetch the user's zip code and country
    fetchUserZipCodeAndCountry();

    const unsubscribeProducts = onValue(productQuery, (querySnapShot) => {
      let data = querySnapShot.val() || {};

      if (data) {
        const productsArray = Object.keys(data).map((key) => data[key]).filter((product) => product.status === "approved");
        setProducts(productsArray);
      } else {
        setProducts([]);
        console.log("noget");
      }
    });

    return () => {
      unsubscribeProducts();
    };
  }, []);

  useEffect(() => {
    // Perform filtering whenever the search query changes
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) => {
        const { title, city, country, zipcode } = product;
        const lowerCaseSearchQuery = searchQuery.toLowerCase();

        return (
          (title && title.toLowerCase().includes(lowerCaseSearchQuery)) ||
          (city && city.toLowerCase().includes(lowerCaseSearchQuery)) ||
          (country && country.toLowerCase().includes(lowerCaseSearchQuery)) ||
          (zipcode && zipcode.toLowerCase().includes(lowerCaseSearchQuery))
        );
      });
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View>
          <Text>Loading</Text>
        </View>
      ) : (
        <SafeAreaView>
          <ScrollView>
            <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
              <Image
                source={require("../assets/left-arrow.png")}
                style={{ height: 35, width: 35 }}
              />
            </TouchableOpacity>

            <View style={styles.searchContainer}>
              <Image
                source={require("../assets/product3.png")}
                style={{ width: 24, height: 24 }}
              />
              <TextInput
                placeholder="Search in your City, State, Zip Code or Country"
                placeholderTextColor={"black"}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.scrollViewContainer}>
              {filteredProducts?.map((product, index) => {
                const imageUri = product.images
                  ? product.images[Object.keys(product.images)[0]]
                  : null;
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.productContainer}
                    onPress={() =>
                      openProductModal(
                        product.user_id,
                        product.key,
                        product.title
                      )
                    }
                  >
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                    <Text
                      numberOfLines={2}
                      lineBreakMode="clip"
                      style={styles.productTitle}
                    >
                      {product.title}
                    </Text>
                    <Text style={styles.productPrice}>
                      {product.currentprice}
                    </Text>
                    <Text style={styles.productOldPrice}>
                      {product.beforeprice}
                    </Text>
                    <Text>{product.city}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {productModalOpen ? (
              <Modal isVisible={productModalOpen}>
                <ProductScreen
                  closeModal={closeProductModal}
                  sellerUid={sellerUid}
                  productTitle={productTitle}
                  productKey={productKey}
                />
              </Modal>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
};

export default SearchLocalProducts;

const styles = StyleSheet.create({
  container: {
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    paddingHorizontal: 15,
  },
  topContainer: {
    paddingVertical: 10,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderWidth: 0.5,
  },
  searchInput: {
    fontSize: 12,
    marginHorizontal: 5,
  },

  productContainer: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderRadius: 10,
    paddingHorizontal: 9,
    width: "48%", // Adjust the width as needed
  },
  productImage: {
    height: 200,
    width: "100%",
  },
  productTitle: {
    flexShrink: 1,
    fontWeight: "600",
    marginHorizontal: 5,
    marginTop: 5,
    marginBottom: 3,
  },
  productPrice: {
    marginBottom: 3,
    color: "red",
  },
  productOldPrice: {
    textDecorationLine: "line-through",
    marginBottom: 3,
  },
  scrollViewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
  },
});
