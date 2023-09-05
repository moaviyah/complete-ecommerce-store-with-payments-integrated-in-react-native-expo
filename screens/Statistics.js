import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from "../colors";
import {
  getDatabase,
  orderByChild,
  ref,
  query,
  onValue,
} from "firebase/database";
import { auth } from "../config";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Statistics = ({ closeModal }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProducts, setFilteredproducts] = useState([]);
  const db = getDatabase();
  const userId = auth.currentUser.uid;
  const productRef = ref(db, "product/");
  const productQuery = query(productRef);
  useEffect(() => {
    const unsubscribeProducts = onValue(productQuery, (querySnapShot) => {
      let data = querySnapShot.val() || {};

      if (data) {
        const productsArray = Object.keys(data).map((key) => {
          const product = data[key];
          const visitors = product.visitors || {};
          const numberOfVisitors = Object.keys(visitors).length;

          return {
            ...product,
            numberOfVisitors: numberOfVisitors,
          };
        });
        setProducts(productsArray);
        const filteredProducts = productsArray.filter(
          (product) => product.user_id === userId
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
          <Text>Loading...</Text>
        </View>
      ) : (
        <SafeAreaView>
          <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
            <Image
              source={require("../assets/left-arrow.png")}
              style={{ height: 35, width: 35 }}
            />
          </TouchableOpacity>
          <Text style={styles.heading}>Statistics</Text>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            {filteredProducts?.map((product, index) => {
              const imageUri = product.images
                ? product.images[Object.keys(product.images)[0]]
                : null;
              return (
                <View key={index} style={styles.productContainer}>
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
                  <Text style={styles.vistorTxt}>
                    Visitors: {product.numberOfVisitors}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    height: windowHeight,
    width: windowWidth,
  },
  topContainer: {
    paddingVertical: 10,
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
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: primaryColor,
  },
  vistorTxt: {
    marginVertical: 5,
    color: "green",
  },
});
