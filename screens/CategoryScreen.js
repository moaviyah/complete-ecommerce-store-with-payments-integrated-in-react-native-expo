import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
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
} from "firebase/database";
import ProductScreen from "./ProductScreen";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const CategoryScreen = ({ catagoryName, closeModal }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProducts, setFilteredproducts] = useState([]);
  const db = getDatabase();
  const productRef = ref(db, "product/");
  const productQuery = query(productRef);
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
        const filteredProducts = productsArray.filter(
          (product) => product.categories_name === catagoryName
        );
        setFilteredproducts(filteredProducts);
        setIsLoading(false);
      } else {
        setFilteredproducts([]);
        console.log("noget");
      }
    });

    return () => {
      unsubscribeProducts();
    };
  }, []);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View>
          <Text>Loading</Text>
        </View>
      ) : (
        <SafeAreaView>
          <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
            <Image
              source={require("../assets/left-arrow.png")}
              style={{ height: 35, width: 35 }}
            />
          </TouchableOpacity>
          <Text style={styles.heading}>{catagoryName}</Text>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
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
          </ScrollView>
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
        </SafeAreaView>
      )}
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    padding: 10,
  },
  topContainer: {
    paddingVertical: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: primaryColor,
  },
  scrollViewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
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
    height: windowHeight * 0.3,
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
    color: "red",
  },
});
