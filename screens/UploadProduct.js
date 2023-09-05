import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Image, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from '../colors'
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, child, query, onValue, onChildAdded, DataSnapshot, push, set } from 'firebase/database';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, uploadString, getDownloadURL, uploadBytes, ref as StorageRef} from 'firebase/storage';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const UploadProduct = ({ closeModal }) => {
    const auth = getAuth()
    const db = getDatabase();
    const userId = auth.currentUser.uid
    const [user, setUser] = useState();
    const categoriesRef = ref(db, 'categories/');
    const catagoriesQuery = query(categoriesRef);
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('Catagory');
    const [loading, setLoading] = useState(true);
    const [showCategoryItems, setShowCategoryItems] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);
    const [title, setTitle] = useState('');
    const [beforePrice, setBeforePrice] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('')
    const [fetchAddress, setFetchAddress] = useState('')
    const [fetchCity, setFetchCity] = useState('')
    const [fetchCountry, setFetchCountry] = useState('')
    const [fetchLat, setFetchLat ] = useState('')
    const [fetchLong, setFetchLong] = useState('')
    const [fetchPostalCode, setFetchPostalCode] = useState('')
    const [fetchState, setFetchState] = useState('')
    const [zipCode, setZipCode] = useState('')

            
    const fetchUserInfo =()=>{
        const userInfoRef = ref(db, `userinfo/${userId}`);
        onValue(userInfoRef, (snapshot) => {
            const userInfo = snapshot.val();
            console.log(userInfo.city)
            setUser(userInfo);
            setCity(userInfo.city);
            setCountry(userInfo.country);
            setFetchAddress(userInfo.fetchAddress);
            setFetchCity(userInfo.city);
            setFetchCountry(userInfo.fetchCountry);
            setFetchLat(userInfo.lattitude);
            setFetchLong(userInfo.longitude);
            setFetchPostalCode(userInfo.fetchPostalCode);
            setFetchState(userInfo.fetchState);
            setZipCode(userInfo.zipcode)
         })
    }

    useEffect(() => {

        const unsubscribeCat = onValue(catagoriesQuery, (querySnapShot) => {
            let data = querySnapShot.val() || {};
            if (data) {
                const categoriesList = Object.keys(data).map((key) => ({
                    id: key,
                    image: data[key].categories_image,
                    name: data[key].categories_name,
                  }));
                setCategories(categoriesList)
            
                
                setLoading(false)
                
            } else {
                setCategories([]);
                setLoading(true)
            }
        });

        return () => {
            fetchUserInfo()
            unsubscribeCat()
        }
    }, [selectedCategory])

    

    const handleCategorySelection = (category) => {
        setSelectedCategory(category);
      };

      const selectImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission to access camera roll is required!');
          return;
        }
      
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
        });
      
        if (!result.canceled) {
          const storage = getStorage();
          const selectedImages = result.assets;
          const uploadedImageUrls = [];
      
          for (let i = 0; i < selectedImages.length; i++) {
            try {
              const imageUri = selectedImages[i].uri;
              const response = await fetch(imageUri);
              const blob = await response.blob();
              const fileExtension = selectedImages[i].uri.split('.').pop();
              const fileName = `${Date.now()}.${fileExtension}`;
      
              const storageRef = StorageRef(storage, `Product_images/${fileName}_${i}`);
              await uploadBytes(storageRef, blob);
      
              const downloadUrl = await getDownloadURL(storageRef);
              uploadedImageUrls.push(downloadUrl);
              console.log(uploadedImageUrls)
            } catch (error) {
              console.log('Error uploading image:', error);
            }
          }
      
          setSelectedImages(selectedImages);
          setImageUrls(uploadedImageUrls);
          setLoading(false)
        }else{
            setLoading(false)
        }
      };

      const saveProduct = async () => {

        if (!selectedImages.length || !title || !currentPrice || selectedCategory === 'Category' || !description) {
            Alert.alert('Fill all the required fields');
            return;
          }
       
        const productRef = push(ref(db, "product"));
        const productKey = productRef.key; // Get the generated product key
        try {
          await set(productRef, {
            beforeprice: beforePrice,
            categories_name: selectedCategory,
            city: city,
            country: country,
            currentprice: currentPrice,
            description:description,
            discountprice:'',
            fetchAddress: fetchAddress,
            fetchCity: fetchCity,
            fetchCountry:fetchCountry,
            fetchLat:fetchLat,
            fetchLong:fetchLong,
            fetchPostalCode:fetchPostalCode,
            fetchState:fetchState,
            status: 'not approved',
            title:title,
            type:'not_sold',
            user_id:userId,
            productId:productKey,
            wheel:'false',
            zipcode:zipCode,
            images: imageUrls.reduce((acc, url, index) => {
              acc[index] = url;
              return acc;
            }, {}),
          });
          console.log("Product saved successfully!");
          Alert.alert('Product uploaded successfully')
          
        } catch (error) {
          console.log("Error saving product:", error);
          Alert.alert('Something Went Wrong')
        }
    
      };
      

    return (
        <View style={styles.container}>
            {
                loading
                    ?
                    (<View style={{justifyContent:'center', alignItems:'center', height:'100%'}}>
                        <ActivityIndicator/>
                    </View>)
                    :
                    (   
                    <ScrollView>
                        <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
                            <Image source={require('../assets/left-arrow.png')} style={{ height: 35, width: 35 }} />
                        </TouchableOpacity>
                        <Text style={styles.heading}>Upload Product</Text>

                        <View style={styles.imagesContainer}>
                            <Text style={styles.imgTxt}>
                                Product Images
                            </Text>
                            <TouchableOpacity style={styles.plusBtn} onPress={()=>{setLoading(true);selectImages()}}>
                                <Image source={require('../assets/plus1.png')} style={{ height: 30, width: 30 }} />
                            </TouchableOpacity>
                        </View>
                            {selectedImages.length > 0 && (
                                <View>
                                    <ScrollView horizontal>
                                        {selectedImages.map((image, index) => (
                                            <Image key={index} source={{ uri: image.uri }} style={styles.selectedImages} />
                                        ))}
                                        <Text></Text>
                                    </ScrollView>
                                    <Text onPress={()=>setSelectedImages([])} style={{alignSelf:'flex-end',marginVertical:10, fontSize:16, color:'blue'}}>Clear</Text>
                                </View>
                            )}

                        <TextInput style={styles.input} placeholder='Title' placeholderTextColor={'gray'} onChangeText={(text)=>setTitle(text)}/>
                        <View style={styles.inputContainer}>
                            <TextInput style={[styles.input, {width:160}]} placeholder='Before Price' placeholderTextColor={'gray'} onChangeText={(text)=>setBeforePrice(text)}/>
                            <TextInput style={[styles.input, {width:160}]} placeholder='Current Price' placeholderTextColor={'gray'} onChangeText={(text)=>setCurrentPrice(text)}/>
                        </View>
                            <TouchableOpacity onPress={() => setShowCategoryItems(!showCategoryItems)} style={[styles.input, {justifyContent:'center'}]}>
                                <Text style={{ fontSize:18}}>{selectedCategory}</Text>
                            </TouchableOpacity>
                            {showCategoryItems && (
                                <Picker
                                    selectedValue={selectedCategory}
                                    onValueChange={handleCategorySelection}
                                >
                                    {categories.map((category) => (
                                        <Picker.Item key={category.id} label={category.name} value={category.name} />
                                    ))}
                                </Picker>
                            )}
                            <TextInput style={[styles.input, {height:150}]} placeholder='Description' placeholderTextColor={'gray'} onChangeText={(text)=>setDescription(text)}/>

                            <TouchableOpacity style={styles.saveBtn} onPress={saveProduct}>
                                <Text style={styles.saveBtnTxt}>Save</Text>
                            </TouchableOpacity>
                    </ScrollView>
                    )
            }

        </View>
    )
}

export default UploadProduct

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        backgroundColor: PRIMARY_BACKGROUND_COLOR,
        height: windowHeight,
        width: windowWidth,
        paddingHorizontal: 20
    },
    topContainer: {
        paddingVertical: 10
    },
    heading: {
        fontSize: 20,
        fontWeight: '700',
        color: primaryColor
    },
    imagesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    imgTxt: {
        marginVertical: 15,
        fontWeight: '700',
        fontSize: 16
    },
    input: {
        borderWidth: 0.5,
        height: 55,
        borderRadius: 10,
        marginVertical: 10,
        paddingHorizontal: 20,
        fontSize: 18
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        
    },
    picker:{
        height:55,
        borderWidth:0.5,
        borderRadius:10,
        marginVertical:10,
        
    },
    saveBtn:{
        backgroundColor:primaryColor,
        height:55,
        width:'80%',
        alignSelf:'center',
        borderRadius:10,
        justifyContent:'center',
        alignItems:'center',
        marginTop:10
    },
    saveBtnTxt:{
        fontWeight:'600',
        fontSize:16,
        color:'#FFFFFF'
    },
    selectedImages:{
        height:200,
        width:200,
        borderRadius:10,
        marginHorizontal:10
    }
})