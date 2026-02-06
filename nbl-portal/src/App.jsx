import React, { useState, useEffect } from 'react';
import { Beer, Users, Clock, ShoppingCart, CheckCircle } from 'lucide-react';

const NBLPartyPortal = () => {
  const [guests, setGuests] = useState(50);
  const [hours, setHours] = useState(4);
  const [crates, setCrates] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // NBL Logic: 1 beer per person per hour. 25 bottles per crate.
  // Average crate price estimation: 85,000 UGX
  const CRATE_CAPACITY = 25;
  const AVG_CRATE_PRICE = 85000;

  useEffect(() => {
    const totalBeers = guests * hours;
    const neededCrates = Math.ceil(totalBeers / CRATE_CAPACITY);
    setCrates(neededCrates);
    setTotalCost(neededCrates * AVG_CRATE_PRICE);
  }, [guests, hours]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0E111E]">
      {/* Navigation */}
      <nav className="bg-[#0E111E] p-4 text-white flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold tracking-tighter text-[#1E57F7]">NILE BREWERIES <span className="text-white">PORTAL</span></h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm hidden md:block text-gray-400">Making a Difference Through Beer</span>
          <ShoppingCart className="w-6 h-6 cursor-pointer hover:text-[#1E57F7]" />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-[#1E57F7] py-16 px-6 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Plan Your Legend.</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">Calculate and order bulk drinks for your wedding, kwanjula, or birthday directly from the source.</p>
      </div>

      {/* Main Calculator Card */}
      <div className="max-w-4xl mx-auto -mt-12 p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 grid md:grid-cols-2 gap-12 border border-gray-100">
          
          {/* Inputs Column */}
          <div className="space-y-8">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-4 uppercase tracking-wider text-gray-500">
                <Users className="w-4 h-4" /> Number of Guests: <span className="text-[#1E57F7] ml-auto">{guests}</span>
              </label>
              <input 
                type="range" min="10" max="1000" step="10"
                value={guests} onChange={(e) => setGuests(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1E57F7]"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-4 uppercase tracking-wider text-gray-500">
                <Clock className="w-4 h-4" /> Event Duration: <span className="text-[#1E57F7] ml-auto">{hours} Hours</span>
              </label>
              <input 
                type="range" min="1" max="12" step="1"
                value={hours} onChange={(e) => setHours(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1E57F7]"
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 italic text-sm text-blue-800">
              "We recommend 1 bottle per guest per hour for a balanced celebration."
            </div>
          </div>

          {/* Results Column */}
          <div className="bg-[#0E111E] rounded-xl p-8 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Subtle background icon */}
            <Beer className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
            
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Order Summary</p>
              <div className="text-5xl font-black text-[#1E57F7] mb-1">{crates} <span className="text-xl">Crates</span></div>
              <p className="text-sm text-gray-500 mb-6">Total bottles: {guests * hours}</p>
              
              <div className="border-t border-gray-800 pt-6 mt-6">
                <p className="text-gray-400 text-sm">Estimated Total (UGX)</p>
                <p className="text-3xl font-bold text-white">Shs {totalCost.toLocaleString()}</p>
              </div>
            </div>

            <button className="mt-8 w-full bg-[#1E57F7] hover:bg-white hover:text-[#1E57F7] text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2">
              Proceed to Mobile Money <CheckCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Branding Footer */}
      <footer className="mt-20 py-10 text-center border-t border-gray-200">
        <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Official NBL Direct Portal</p>
        <div className="flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
          <span className="font-bold">NILE SPECIAL</span>
          <span className="font-bold">CLUB</span>
          <span className="font-bold">CASTLE LITE</span>
          <span className="font-bold">EAGLE</span>
        </div>
      </footer>
    </div>
  );
};

export default NBLPartyPortal;