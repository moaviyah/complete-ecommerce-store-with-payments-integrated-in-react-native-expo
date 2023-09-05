import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
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
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from "../colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const AllCategoriesScreen = ({ navigation, closeModal }) => {
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredproducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const db = getDatabase();
  const categoriesRef = ref(db, "categories/");
  const catRef = query(categoriesRef);
  const productRef = ref(db, "product/");
  const productQuery = query(productRef);

  useEffect(() => {
    const unsubscribeProducts = onValue(productQuery, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      if (data) {
        const productsArray = Object.keys(data).map((key) => data[key]).filter((product) => product.status === "approved");
        setProducts(productsArray);
        const filteredProducts = productsArray.filter(
          (product) => product.categories_name === selectedCategory
        );
        setFilteredproducts(filteredProducts);
        console.log("filtered Products", filteredProducts);
      } else {
        setFilteredproducts([]);
        console.log("noget");
      }
    });
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

        setIsLoading(false);
      } else {
        setCategories([]);
        console.log("noget");
      }
    });

    return () => {
      unsubscribeCat();
      unsubscribeProducts();
    };
  }, [selectedCategory]);

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
          <Text style={styles.maintxt}>Find Your suitable products now </Text>
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 10,
                backgroundColor: PRIMARY_BACKGROUND_COLOR,
              }}
            >
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => {
                    setIsLoading(true);
                    setSelectedCategory(category.name);
                    setSelectedCategoryIndex(index);
                    console.log(category.name, index);
                    const filteredProducts = products.filter(
                      (product) => product.categories_name === category.name
                    );
                    setFilteredproducts(filteredProducts);
                    setIsLoading(false);
                    console.log(filteredProducts);
                  }}
                  style={{ paddingHorizontal: 10 }}
                >
                  <Text
                    style={[
                      { fontSize: 16, marginBottom: 5, color: "#9095A6" },
                      selectedCategory === category.name && {
                        color: primaryColor,
                      },
                    ]}
                  >
                    {category.name}
                  </Text>
                  {selectedCategory === category.name && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        height: 2,
                        width: "50%",
                        backgroundColor: primaryColor,
                        borderRadius: 50,
                        marginHorizontal: 10,
                      }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              {filteredProducts.length === 0 ? (
                <Text style={styles.noProductText}>
                  Currently no products for this category
                </Text>
              ) : (
                filteredProducts.map((product, index) => (
                  <TouchableOpacity key={index} style={styles.productContainer}>
                    {product.images &&
                      Object.keys(product.images).length > 0 && (
                        <Image
                          source={{
                            uri: product.images[Object.keys(product.images)[0]],
                          }}
                          style={styles.productImage}
                          resizeMode="contain"
                        />
                      )}
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
                ))
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};

export default AllCategoriesScreen;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    height: windowHeight,
  },
  maintxt: {
    fontSize: 24,
    fontWeight: "700",
    marginVertical: 20,
    marginHorizontal: 20,
  },
  topContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchbtn: {
    height: 50,
    backgroundColor: "#FFFFFF",
    width: 300,
    alignSelf: "flex-start",
    borderRadius: 25,
    justifyContent: "center",
    paddingHorizontal: windowWidth * 0.05,
    marginHorizontal: 20,
    marginVertical: 10,
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
  scrollViewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
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
    color: "red",
  },
  productOldPrice: {
    textDecorationLine: "line-through",
    marginBottom: 3,
  },
});
