import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Truck, Clock, MapPin, Users, Beer, Home, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderConfirmation = ({ orderData, onNewOrder }) => {
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState('pending');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!orderData) {
      navigate('/');
      return;
    }

    // Simulate status progression
    const statusTimer = setTimeout(() => {
      setOrderStatus('confirmed');
    }, 2000);

    return () => clearTimeout(statusTimer);
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const handleNewOrder = () => {
    if (onNewOrder) {
      onNewOrder();
    }
    navigate('/');
  };

  const getStatusIcon = () => {
    if (orderData.success) {
      return <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />;
    }
    return <XCircle className="w-16 h-16 text-red-500" />;
  };

  const getStatusColor = () => {
    if (orderData.success) return 'bg-green-50 border-green-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusTextColor = () => {
    if (orderData.success) return 'text-green-700';
    return 'text-red-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B6F47] to-[#4B2315] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Success/Error Card */}
        <div className={`${getStatusColor()} border-2 rounded-2xl p-8 mb-6 text-center`}>
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>

          {orderData.success ? (
            <>
              <h1 className="text-4xl font-black text-green-700 mb-2">Order Confirmed! 🍺</h1>
              <p className="text-green-600 text-lg font-bold mb-4">
                Your party is getting stocked!
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-black text-red-700 mb-2">Order Failed</h1>
              <p className="text-red-600 text-lg font-bold mb-4">
                {orderData.error || 'Something went wrong. Please try again.'}
              </p>
            </>
          )}
        </div>

        {/* Order Details */}
        {orderData.success && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            {/* Order Header */}
            <div className="border-b-4 border-[#921A28] pb-6 mb-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm font-bold uppercase tracking-wider mb-2">
                  Order Number
                </p>
                <p className="text-4xl font-black text-[#921A28] font-mono">
                  {orderData.orderNumber}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Order ID: #{orderData.orderId}
                </p>
              </div>
            </div>

            {/* Order Stats Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {/* Guests */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-l-4 border-blue-500">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase">Guests</p>
                    <p className="text-2xl font-black text-blue-700">{orderData.guests}</p>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-l-4 border-orange-500">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase">Duration</p>
                    <p className="text-2xl font-black text-orange-700">{orderData.eventDuration} hrs</p>
                  </div>
                </div>
              </div>

              {/* Total Crates */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-l-4 border-purple-500">
                <div className="flex items-center gap-3">
                  <Beer className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase">Crates</p>
                    <p className="text-2xl font-black text-purple-700">{orderData.crates}</p>
                  </div>
                </div>
              </div>

              {/* Total Cost */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-l-4 border-green-500">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase">Total Cost</p>
                    <p className="text-2xl font-black text-green-700">
                      UGX {orderData.totalCost?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Mix Breakdown */}
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 mb-6">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
                Smart Mix Breakdown
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Nile */}
                <div className="bg-white p-4 rounded-lg border-b-4 border-[#D1A33C]">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Nile Special</p>
                  <p className="text-3xl font-black text-[#D1A33C]">{orderData.smartMix?.nile || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Crates</p>
                </div>

                {/* Club */}
                <div className="bg-white p-4 rounded-lg border-b-4 border-blue-400">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Club</p>
                  <p className="text-3xl font-black text-blue-500">{orderData.smartMix?.club || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Crates</p>
                </div>

                {/* Castle */}
                <div className="bg-white p-4 rounded-lg border-b-4 border-gray-300">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Castle Lite</p>
                  <p className="text-3xl font-black text-gray-600">{orderData.smartMix?.castle || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Crates</p>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <Truck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    Estimated Delivery
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {orderData.estimatedDelivery 
                      ? new Date(orderData.estimatedDelivery).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Within 2 days'}
                  </p>
                  {orderData.delivery?.address && (
                    <div className="flex items-center gap-2 mt-3 text-gray-700">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold">{orderData.delivery.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 mb-6">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
                Order Status
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Order Confirmed</p>
                    <p className="text-xs text-gray-600">Just now</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    ⏳
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Preparing for Delivery</p>
                    <p className="text-xs text-gray-600">Within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    🚚
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">On Its Way</p>
                    <p className="text-xs text-gray-600">Within 2 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg mb-6 flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-800">Questions?</p>
                <p className="text-sm text-gray-700 mt-1">
                  Call our NBL Hub team at <span className="font-bold">+256 XXX XXX XXX</span> or email <span className="font-bold">orders@nblhub.ug</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={handleNewOrder}
            className="bg-[#921A28] text-white py-4 rounded-xl font-black uppercase tracking-wider hover:bg-red-900 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            New Order
          </button>
          <button
            onClick={() => {
              // Could open WhatsApp or tracking page
              if (orderData.orderNumber) {
                window.open(`https://wa.me/256XXX?text=I'm interested in tracking order ${orderData.orderNumber}`, '_blank');
              }
            }}
            className="bg-green-600 text-white py-4 rounded-xl font-black uppercase tracking-wider hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <div className="w-5 h-5">💬</div>
            Chat on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
