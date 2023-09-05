import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { PRIMARY_BACKGROUND_COLOR } from "../colors";
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

const AllBestSellingProducts = ({ closeModal }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const db = getDatabase();
  const productRef = ref(db, "Best Selling");
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

  useEffect(() => {
    const unsubscribeProducts = onValue(productQuery, (querySnapShot) => {
      let data = querySnapShot.val() || {};

      if (data) {
        const productsArray = Object.keys(data).map((key) => data[key]).filter((product) => product.status === "approved");
        setProducts(productsArray);
        console.log("best selling");
        setFilteredProducts(productsArray);
        setIsLoading(false);
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
      const filtered = products.filter(
        (product) =>
          product.title &&
          product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  return (
    <SafeAreaView>
      {isLoading ? (
        <View>
          <Text>Loading</Text>
        </View>
      ) : (
        <View style={styles.container}>
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
                placeholder="Search by Name, City, State, Zip Code or Country"
                placeholderTextColor="gray"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.scrollViewContainer}>
              {filteredProducts
                ?.sort((a, b) => a.title.localeCompare(b.title)) // Sort the array alphabetically by title
                .map((product, index) => {
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
        </View>
      )}
    </SafeAreaView>
  );
};

export default AllBestSellingProducts;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    padding: 20,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
  },
  topContainer: {
    paddingVertical: 10,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 13,
    borderRadius: 10,
    paddingHorizontal: 10,
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
