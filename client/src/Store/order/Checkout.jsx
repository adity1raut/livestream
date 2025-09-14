import React, { useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, CreditCard, CheckCircle } from 'lucide-react';

export function Checkout() {
  const { createOrder, verifyPayment, orderLoading } = useProduct();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentStep, setPaymentStep] = useState('address');
  const [orderData, setOrderData] = useState(null);

  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
  };

  const proceedToPayment = async () => {
    if (!selectedAddress) {
      alert('Please select an address');
      return;
    }

    const result = await createOrder(selectedAddress);
    if (result.success) {
      setOrderData(result.data);
      initiateRazorpayPayment(result.data);
    } else {
      alert(result.message);
    }
  };

  const initiateRazorpayPayment = (orderData) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount * 100,
      currency: orderData.currency,
      name: orderData.name,
      description: orderData.description,
      order_id: orderData.orderId,
      prefill: orderData.prefill,
      theme: orderData.theme,
      handler: async (response) => {
        const paymentData = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          addressId: selectedAddress
        };

        const result = await verifyPayment(paymentData);
        if (result.success) {
          setPaymentStep('success');
          setOrderData(result.data);
        } else {
          alert(result.message);
        }
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal closed');
        }
      }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert('Razorpay SDK not loaded');
    }
  };

  if (paymentStep === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your order has been placed successfully</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{orderData?.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment ID:</span>
                <span className="font-mono">{orderData?.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>₹{orderData?.amount}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/orders'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pt-40">
      <h2 className="text-3xl font-bold mb-8">Checkout</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Delivery Address
          </h3>
          
          <div className="space-y-3">
            {user?.addresses?.map((address) => (
              <div
                key={address._id}
                onClick={() => handleAddressSelect(address._id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAddress === address._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={selectedAddress === address._id}
                    onChange={() => handleAddressSelect(address._id)}
                    className="text-blue-600"
                  />
                  <div>
                    <p className="font-medium">{address.name}</p>
                    <p className="text-sm text-gray-600">
                      {address.street}, {address.city}, {address.state} - {address.zipCode}
                    </p>
                    <p className="text-sm text-gray-500">Phone: {address.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-4">
              You will be redirected to Razorpay for secure payment processing
            </p>
            
            <button
              onClick={proceedToPayment}
              disabled={!selectedAddress || orderLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {orderLoading ? (
                'Processing...'
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Proceed to Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;