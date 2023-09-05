import { StripeProvider } from '@stripe/stripe-react-native'
import { Alert, Button, StyleSheet, Text, TextInput, View, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { useStripe } from '@stripe/stripe-react-native'
import { primaryColor, PRIMARY_BACKGROUND_COLOR } from '../colors'
import { SafeAreaView } from 'react-native'
import { getDatabase, ref, push, set } from 'firebase/database';
import { getAuth } from 'firebase/auth'

const StripePayment = ({ closeModal, amount, product }) => {
    const [email, setEmail] = useState('')
    console.log(product)
    const stripe = useStripe()
    const db = getDatabase();
    const auth = getAuth()
    const subscribe = async () => {
        try {

            console.log(amount)
            const response = await fetch('https://cb03-39-40-82-128.ngrok-free.app/pay', {
                method: 'POST',
                body: JSON.stringify({ email, amount }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            if (!response.ok) return Alert.alert(data.message);
            const clientSecret = data.clientSecret;
            const initSheet = await stripe.initPaymentSheet({
                paymentIntentClientSecret: clientSecret,
                merchantDisplayName: 'Merchant Name',
            });
            if (initSheet.error) return Alert.alert(initSheet.error.message)
            const presentSheet = await stripe.presentPaymentSheet({
                clientSecret
            })
            if (presentSheet.error) return Alert.alert(presentSheet.error.message)

            const orderDetails = {
                userEmail: email,
                userName: auth.currentUser.displayName, // Replace with the actual user name
                productName: product.title, // Assuming the product object has a "name" property
                price: product.currentprice // Assuming the product object has an "id" property
                
            };
            // Push the order details to the "placedOrders" node in Firebase
            const newOrderRef = push(ref(db, 'placedOrders'));
            await set(newOrderRef, orderDetails);
            Alert.alert(`Payment Complete and sent to admin`)
        } catch (err) {
            console.error('payment did not complete:', err.message);
            Alert.alert("Something went wrong. Try again later")
        }
    }
    return (
        <View style={styles.container}>
            <StripeProvider publishableKey='pk_test_51NfqNlHcg1JCt6USlFkhcazNvherp8bcTK5rPnGEQh4UZESynEpTGOLhqnHqroymjdR4vbd3Ej1BBnNKQHfkz7x100pJDyBzfu'>
                <SafeAreaView style={styles.container}>

                    <View style={{ paddingHorizontal: 10 }}>
                        <TouchableOpacity style={styles.topContainer} onPress={closeModal}>
                            <Image
                                source={require("../assets/left-arrow.png")}
                                style={{ height: 35, width: 35 }}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 22, margin: 10 }}>
                        Please Enter your email
                    </Text>
                    <TextInput
                        value={email}
                        placeholder='Email'
                        onChangeText={(text) => setEmail(text)}
                        style={styles.input}
                    />
                    <TouchableOpacity style={styles.payBtn} onPress={subscribe}>
                        <Text style={styles.payBtnTxt}>
                            Pay $ {amount}
                        </Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </StripeProvider>
        </View>
    )
}

export default StripePayment

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: "100%",
        backgroundColor: PRIMARY_BACKGROUND_COLOR,
        paddingTop: 10,
        width: '100%'
    },
    topContainer: {
        paddingVertical: 10,

    },
    input: {
        width: '90%',
        fontSize: 20,
        padding: 10,
        borderWidth: 1,
        alignSelf: 'center',
        borderRadius: 10
    },
    payBtn: {
        backgroundColor: primaryColor,
        padding: 15,
        margin: 15,
        borderRadius: 15,
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    payBtnTxt: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white'
    }
})