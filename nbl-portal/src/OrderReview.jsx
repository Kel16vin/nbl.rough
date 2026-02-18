import React, { useState } from 'react';
import { ChevronLeft, CheckCircle, X, Users, Clock, Beer, MapPin, DollarSign } from 'lucide-react';

const OrderReview = ({ orderDetails, onConfirm, onCancel, isLoading }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleConfirmOrder = async () => {
    setConfirmLoading(true);
    await onConfirm();
    setConfirmLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B6F47] to-[#4B2315] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-white font-bold text-sm hover:opacity-80 transition mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Edit
          </button>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Review Your Order</h1>
          <p className="text-amber-100 text-lg">Confirm all details before placing your order</p>
        </div>

        {/* Order Summary Cards */}
        <div className="space-y-4 mb-8">
          {/* Party Details Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#921A28] to-red-700 px-6 py-4">
              <h2 className="text-white font-black text-lg">Party Details</h2>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-6">
              {/* Guests */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase">Number of Guests</p>
                  <p className="text-3xl font-black text-gray-900">{orderDetails.guests}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase">Event Duration</p>
                  <p className="text-3xl font-black text-gray-900">{orderDetails.eventDuration} <span className="text-lg">hrs</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Crates & Pricing Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h2 className="text-white font-black text-lg">Your Order</h2>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-6">
              {/* Total Crates */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Beer className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase">Total Crates</p>
                  <p className="text-3xl font-black text-gray-900">{orderDetails.crates}</p>
                </div>
              </div>

              {/* Total Price */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase">Total Price</p>
                  <p className="text-2xl font-black text-green-600">
                    UGX {orderDetails.totalCost?.toLocaleString() || 'Calculating...'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Mix Breakdown */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-white font-black text-lg">Smart Mix Breakdown</h2>
            </div>
            <div className="p-6 grid sm:grid-cols-3 gap-4">
              {/* Nile Special */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border-l-4 border-[#D1A33C]">
                <p className="text-xs font-bold text-gray-600 uppercase mb-2">Nile Special</p>
                <p className="text-4xl font-black text-[#D1A33C]">{orderDetails.smartMix?.nile || 0}</p>
                <p className="text-xs text-gray-600 mt-2 font-semibold">Crates</p>
              </div>

              {/* Club Pilsener */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-l-4 border-blue-500">
                <p className="text-xs font-bold text-gray-600 uppercase mb-2">Club Pilsener</p>
                <p className="text-4xl font-black text-blue-600">{orderDetails.smartMix?.club || 0}</p>
                <p className="text-xs text-gray-600 mt-2 font-semibold">Crates</p>
              </div>

              {/* Castle Lite */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-l-4 border-gray-400">
                <p className="text-xs font-bold text-gray-600 uppercase mb-2">Castle Lite</p>
                <p className="text-4xl font-black text-gray-700">{orderDetails.smartMix?.castle || 0}</p>
                <p className="text-xs text-gray-600 mt-2 font-semibold">Crates</p>
              </div>
            </div>
          </div>

          {/* Delivery Information Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h2 className="text-white font-black text-lg">Delivery Address</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-600 uppercase mb-1">Delivery Location</p>
                  <p className="text-xl font-bold text-gray-900 break-words">
                    {orderDetails.deliveryAddress || 'Not selected'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    📦 Estimated delivery within 2 business days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex gap-3">
            <div className="text-2xl flex-shrink-0">ℹ️</div>
            <div>
              <p className="font-bold text-amber-900 text-sm">Please review all details carefully</p>
              <p className="text-xs text-amber-800 mt-1">Once you confirm, your order will be sent to NBL Hub for processing. You'll receive an order confirmation with tracking details.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4 sticky bottom-0 bg-gradient-to-br from-[#8B6F47] to-[#4B2315] pt-6">
          <button
            onClick={onCancel}
            disabled={isLoading || confirmLoading}
            className="bg-white text-[#4B2315] py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back to Edit
          </button>
          <button
            onClick={handleConfirmOrder}
            disabled={isLoading || confirmLoading}
            className="bg-[#921A28] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Confirm & Place Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;
