import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Modal } from 'react-native'
import React, { useState } from 'react'
import Chat from './Chat';
import UserChat from './UserChat';
import { primaryColor } from '../colors';
import StripePayment from './StripePayment';


const SlidingWindow = ({ closeModal, senderId, recieverId, textAbout, productImage,product, amount }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [adminChatOpen, setAdminChatOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  const openChat = () => {
    setChatOpen(true)

  }
  const closeChat = () => {
    setChatOpen(false)
  }

  const openAdminChat = () => {
    setAdminChatOpen(true)
  }

  const closeAdminChat = () => {
    setAdminChatOpen(false)
  }
  const openPayment = ()=>{
    setPaymentModalOpen(true)
  }
  const closePayment = ()=>{
    setPaymentModalOpen(false)
  }
  return (
    <View style={styles.slideWindowContainer}>
      <View style={styles.slideWindow}>
        <TouchableOpacity style={[styles.slideButton, {backgroundColor:primaryColor}]} onPress={() => openPayment()}>
          <Text style={[styles.slideButtonText, {color:'white'}]}>Pay by card</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.slideButton} onPress={() => openChat()}>
          <Text style={styles.slideButtonText}>Chat with the Seller</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.slideButton} onPress={openAdminChat}>
          <Text style={styles.slideButtonText}>Discuss Advertising with Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.slideButton} onPress={() => openChat()}>
          <Text style={styles.slideButtonText}>Discuss Shipping with Seller</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.slideButton} onPress={() => openChat()}>
          <Text style={styles.slideButtonText}>Discuss Pick-Up time with Seller</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
      {chatOpen ? (
        <Modal isVisible={chatOpen}>
          <Chat closeModal={closeChat} senderId={senderId} recieverId={recieverId} textAbout={textAbout} productImage={productImage} />
        </Modal>
      )
        :
        null
      }
      {
        paymentModalOpen ? (
          <Modal isVisible={paymentModalOpen}>
            <StripePayment closeModal={closePayment} amount ={amount} product={product}/>
          </Modal>
        ):
        null
      }
      {
        adminChatOpen
          ?
          <Modal visible={adminChatOpen} animationType="slide">
            <UserChat closeModal={closeAdminChat} senderId={senderId} recieverId={'support'} />
          </Modal>
          :
          null
      }

    </View>
  )
}

export default SlidingWindow

const styles = StyleSheet.create({

  slideWindowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    height: '100%',
    width: '100%'
  },
  slideWindow: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    height: '80%',
  },
  slideButton: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#e6e6e6',
    borderRadius: 5,
    alignItems: 'center',
  },
  slideButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  closeButton: {
    padding: 20,
    backgroundColor: 'red',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})