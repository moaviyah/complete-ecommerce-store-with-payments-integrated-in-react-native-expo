import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from "../colors";
import Icon from "react-native-vector-icons/Ionicons";
import UploadProduct from "./UploadProduct";
import {
  getDatabase,
  ref,
  get,
  child,
  query,
  onValue,
  onChildAdded,
  DataSnapshot,
  remove
} from "firebase/database";
import { auth } from "../config";
import EditProduct from "./EditProduct";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Addproduct = ({ closeModal }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = auth.currentUser.uid;
  const [filteredProducts, setFilteredproducts] = useState([]);
  const db = getDatabase();
  const productRef = ref(db, "product/");
  const productQuery = query(productRef);
  const [uploadProductModal, setUploadProductModal] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);

  const openUploadProductModal = () => {
    setUploadProductModal(true);
  };

  const closeUploadProductModal = () => {
    setUploadProductModal(false);
  };

  const openEditProductModal = ()=>{
    setEditProductModalOpen(true)
  }

  const closeEditProductModal = () =>{
    setEditProductModalOpen(false)
  }

  useEffect(() => {
    const unsubscribeProducts = onValue(productQuery, (querySnapShot) => {
      let data = querySnapShot.val() || {};

      if (data) {
        const productsArray = Object.keys(data).map((key) => data[key]);
        setProducts(productsArray);
        const filteredProducts = productsArray.filter(
          (product) => product.user_id === userId
        );
        setFilteredproducts(filteredProducts);
        setIsLoading(false);
        console.log('all prodcuts')
      } else {
        setFilteredproducts([]);
        console.log("noget");
      }
    });

    return () => {
      unsubscribeProducts();
    };
  }, [deleteProduct]);

  const deleteProduct = (productId) => {
    const productToDeleteRef = ref(db, `product/${productId}`);

    remove(productToDeleteRef)
      .then(() => {
        console.log("Product deleted successfully");
        Alert.alert('Product Deleted Successfully')
      })
      .catch((error) => {
        console.log("Error deleting product:", error);
      });
  };


  return (
    <SafeAreaView>
      {isLoading ? (
        <View>
          <Text>Loading...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
            <Image
              source={require("../assets/left-arrow.png")}
              style={{ height: 35, width: 35 }}
            />
          </TouchableOpacity>
          <Text style={styles.heading}>All Products</Text>
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
                  <Text style={styles.productOldPrice}>
                    {product.beforeprice}
                  </Text>
                  <Text>{product.city}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => setEditProductModalOpen(true)}
                    >
                      <Image source={require('../assets/pen.png')} style={{ height: 24, width: 24, alignSelf: 'center' }} />
                      <Text style={[styles.deleteButtonText, { color: 'blue' }]}>Edit</Text>
                    </TouchableOpacity>
                    <Modal visible={editProductModalOpen}>
                      <EditProduct closeModal={closeEditProductModal} productId = {product.productId}/>
                    </Modal>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => { deleteProduct(product.productId) }}
                    >
                      <Image source={require('../assets/remove.png')} style={{ height: 24, width: 24, alignSelf: 'center' }} />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>

                  </View>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.addButton}
            onPress={openUploadProductModal}
          >
            <Image
              source={require("../assets/plus.png")}
              style={{ height: 65, width: 65 }}
            />
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={uploadProductModal}>
        <UploadProduct closeModal={closeUploadProductModal} />
      </Modal>
      
    </SafeAreaView>
  );
};

export default Addproduct;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: PRIMARY_BACKGROUND_COLOR,
    height: "100%",
    width: "100%",
    paddingHorizontal: 20,
  },
  topContainer: {
    paddingVertical: 10,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
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
    color: "red",
  },
  deleteButton: {
    padding: 5,
    borderRadius: 5,
    marginVertical: 5,
  },
  deleteButtonText: {
    color: "red",
    fontWeight: "700",
    textAlign: "center",
  },
});
