import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Beer, Users, Clock, ShoppingCart, Phone, MapPin, ChevronRight } from 'lucide-react';
import OrderConfirmation from './OrderConfirmation';
import OrderReview from './OrderReview';

const NBLPartyPortalCalculator = ({ onOrderSuccess, onShowReview, orderData }) => {
  const [guests, setGuests] = useState(50);
  const [eventDate, setEventDate] = useState('');
  const [eventDuration, setEventDuration] = useState(4);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedBrandCounts, setSelectedBrandCounts] = useState({});
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [deliveryInput, setDeliveryInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [crates, setCrates] = useState(0);
  const [customCrates, setCustomCrates] = useState(null);
  const [useCustom, setUseCustom] = useState(false);

  const CRATE_CAPACITY = 25;
  const AVG_CRATE_PRICE = 75000;
  const BRANDS = ['Nile Special', 'Club', 'Castle Lite', 'Eagle Lager', 'Extra Lager', 'Redd’s', 'Happos', 'Nile Gold'];

  useEffect(() => {
    if (!useCustom) {
      const totalBeers = guests * eventDuration;
      setCrates(Math.ceil(totalBeers / CRATE_CAPACITY));
      setCustomCrates(null);
    }
  }, [guests, eventDuration, useCustom]);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) => {
      if (prev.includes(brand)) {
        // removing brand -> remove its count
        setSelectedBrandCounts((counts) => {
          const next = { ...counts };
          delete next[brand];
          const total = sumBrandCounts(next);
          setCustomCrates(total || null);
          setCrates(total || 0);
          return next;
        });
        return prev.filter((b) => b !== brand);
      }
      // add brand with existing allocation or zero
      setSelectedBrandCounts((counts) => ({ ...counts, [brand]: counts[brand] || 0 }));
      return [...prev, brand];
    });
  };

  // Compute allocation of custom crates across selected brands
  const getBrandAllocation = () => {
    const total = customCrates || 0;
    const brands = selectedBrands && selectedBrands.length > 0 ? selectedBrands : [];
    if (total <= 0 || brands.length === 0) return {};
    const base = Math.floor(total / brands.length);
    let remainder = total - base * brands.length;
    const alloc = {};
    for (let i = 0; i < brands.length; i++) {
      alloc[brands[i]] = base + (remainder > 0 ? 1 : 0);
      remainder -= 1;
    }
    return alloc;
  };

  // compute allocation for an explicit total (used when user sets total)
  const computeAllocationFor = (total) => {
    const brands = selectedBrands && selectedBrands.length > 0 ? selectedBrands : [];
    if (total <= 0 || brands.length === 0) return {};
    const base = Math.floor(total / brands.length);
    let remainder = total - base * brands.length;
    const alloc = {};
    for (let i = 0; i < brands.length; i++) {
      alloc[brands[i]] = base + (remainder > 0 ? 1 : 0);
      remainder -= 1;
    }
    return alloc;
  };

  const sumBrandCounts = (counts) => {
    return Object.values(counts || {}).reduce((s, v) => s + (Number(v) || 0), 0);
  };

  // Calculate smart mix breakdown
  const getBreakdown = () => {
    const total = crates;
    const nile = selectedBrandCounts['Nile Special'] || Math.ceil(total * 0.4);
    const club = selectedBrandCounts['Club'] || Math.ceil(total * 0.3);
    const castle = selectedBrandCounts['Castle Lite'] || Math.ceil(total * 0.3);
    return { total, nile, club, castle };
  };

  const breakdown = getBreakdown();

  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');

  const placeOrder = async () => {
    setOrderError('');
    setOrderSuccess('');

    // 1. Prepare the data package
    const orderData = {
      guests: Number(guests),
      eventDuration: Number(eventDuration),
      totalCrates: crates,
      breakdown: useCustom ? selectedBrandCounts : breakdown,
      location: deliveryInput,
      timestamp: new Date().toISOString(),
    };

    try {
      // 2. Send the data to your backend
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        setOrderSuccess(`Order #${result.orderId} received! NBL is processing your legend plan.`);
        alert("Order Successful! Check the backend terminal to see the data.");
      } else {
        setOrderError("Something went wrong on our end.");
      }
    } catch (err) {
      setOrderError("Cannot connect to the NBL server. Is the backend running?");
      console.error("Connection Error:", err);
    }
  };

  // helper to select a search result (from Nominatim)
  const selectSearchResult = (result) => {
    if (!result) return;
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon || result.lon || result.lon);
    setDeliveryLocation(result.display_name || result.name || 'Selected Location');
    setDeliveryInput(result.display_name || result.name || '');
    setDeliveryCoords({ lat, lon });
    setSearchResults([]);
    // ensure map is visible
    setShowMap(true);
    // move map and marker
    setTimeout(() => {
      if (mapRef.current) {
        try {
          mapRef.current.setView([lat, lon], 16);
          if (!markerRef.current) {
            markerRef.current = window.L.marker([lat, lon]).addTo(mapRef.current);
          } else {
            markerRef.current.setLatLng([lat, lon]);
          }
        } catch (e) {
          console.error('map setView error', e);
        }
      }
    }, 100);
  };

  // Initialize or update Leaflet map when shown
  useEffect(() => {
    if (!showMap) return;
    if (typeof window === 'undefined') return;
    // ensure Leaflet is available globally
    const L = window.L;
    if (!L) {
      console.warn('Leaflet not loaded');
      return;
    }

    if (!mapRef.current) {
      mapRef.current = L.map('leaflet-map').setView([0.3476, 32.5825], 11); // Kampala default

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      mapRef.current.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        // place marker
        if (!markerRef.current) {
          markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        } else {
          markerRef.current.setLatLng([lat, lng]);
        }
        setDeliveryCoords({ lat, lon: lng });
        // reverse geocode with Nominatim
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
          const json = await res.json();
          if (json && json.display_name) {
            setDeliveryLocation(json.display_name);
            setDeliveryInput(json.display_name);
          } else {
            setDeliveryLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            setDeliveryInput(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          }
        } catch (err) {
          console.error('reverse geocode failed', err);
          setDeliveryLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          setDeliveryInput(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      });
    } else {
      // map already exists — invalidate size in case container appeared
      mapRef.current.invalidateSize();
    }
  }, [showMap]);

  // helper: render highlighted match for suggestion
  const renderHighlighted = (text = '', query = '') => {
    if (!query) return text;
    try {
      const q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(q, 'i');
      const match = text.match(re);
      if (!match) return text;
      const start = match.index;
      const end = start + match[0].length;
      return (
        <>
          {text.substring(0, start)}
          <mark className="bg-yellow-200">{text.substring(start, end)}</mark>
          {text.substring(end)}
        </>
      );
    } catch (e) {
      return text;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8E4] font-sans text-[#333]">
      {/* Top Bar - Brand Red */}
      <div className="bg-white py-2 px-6 flex justify-between items-center border-b border-gray-200">
        <img src="/src/assets/WhatsApp Image 2026-02-06 at 15.44.26.jpeg" alt="NBL Logo" className="h-16" />
        <div className="hidden md:flex gap-6 text-sm font-bold uppercase text-gray-600">
          <span>Home</span> <span>About Us</span> <span>Our Brands</span> <span>Sustainability</span>
        </div>
      </div>

      {/* Secondary Nav - Deep Malt Brown */}
      <div className="bg-[#4B2315] text-white py-2 px-6 flex justify-between items-center shadow-md">
        <div className="flex gap-6 text-xs font-bold uppercase">
          <span>News & Media</span> <span>Events</span> <span>Careers</span> <span>Contact Us</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold bg-[#921A28] px-4 py-1 rounded-full">
          <Phone className="w-4 h-4" /> 0800 204 204
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-6 px-6 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-2 italic">PARTY STARTER</h2>
        <p className="text-gray-600 max-w-xl mx-auto border-b-2 border-[#921A28] pb-4">
          With our iconic brands, we have you covered for your event.
        </p>
      </div>

      {/* Error Alert */}
      {orderError && (
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
            <p className="text-red-700 font-bold text-sm">{orderError}</p>
          </div>
        </div>
      )}

      {/* Calculator Card with Smart Mix */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Inputs (Left) */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-xl p-6 border border-gray-200">
            <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-4 tracking-widest">Expected Guests</label>
              <div className="flex gap-3">
                <input 
                  type="range" min="10" max="1000" step="10"
                  value={guests} onChange={(e) => setGuests(e.target.value)}
                  className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#921A28]"
                />
                <input 
                  type="number" 
                  min="10" 
                  max="1000"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm font-bold text-center focus:outline-none focus:border-[#921A28]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-4 tracking-widest">Event Date</label>
              <input 
                type="date"
                value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-bold focus:outline-none focus:border-[#921A28]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-4 tracking-widest">Event Duration (Hours)</label>
              <div className="flex gap-3">
                <input 
                  type="range" min="1" max="24" step="1"
                  value={eventDuration} onChange={(e) => setEventDuration(e.target.value)}
                  className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#921A28]"
                />
                <input 
                  type="number" 
                  min="1" 
                  max="24"
                  value={eventDuration}
                  onChange={(e) => setEventDuration(e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm font-bold text-center focus:outline-none focus:border-[#921A28]"
                />
              </div>
            </div>
            {/* Brand selection is shown when user chooses custom crates */}
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-4 tracking-widest">Delivery Location</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={deliveryInput}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDeliveryInput(v);
                      setHighlightIndex(-1);
                      // debounce search
                      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                      searchTimeoutRef.current = setTimeout(async () => {
                        const q = v.trim();
                        if (!q) {
                          setSearchResults([]);
                          return;
                        }
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=6`);
                          const json = await res.json();
                          setSearchResults(json || []);
                        } catch (err) {
                          console.error('search error', err);
                          setSearchResults([]);
                        }
                      }, 300);
                    }}
                    onKeyDown={(e) => {
                      const len = searchResults.length;
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setHighlightIndex((i) => Math.min(len - 1, i + 1));
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setHighlightIndex((i) => Math.max(-1, i - 1));
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (highlightIndex >= 0 && highlightIndex < len) {
                          selectSearchResult(searchResults[highlightIndex]);
                        } else if (len > 0) {
                          selectSearchResult(searchResults[0]);
                        }
                      } else if (e.key === 'Escape') {
                        setSearchResults([]);
                      }
                    }}
                    onBlur={() => {
                      // small timeout to allow click to register
                      setTimeout(() => setSearchResults([]), 150);
                    }}
                    onFocus={() => {
                      // show existing results if any
                    }}
                    placeholder="Search address..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-bold focus:outline-none focus:border-[#921A28]"
                  />
                  {searchResults && searchResults.length > 0 && (
                    <ul className="absolute z-50 left-0 right-0 bg-white border border-gray-200 mt-1 max-h-56 overflow-auto text-left">
                      {searchResults.map((r, idx) => (
                        <li
                          key={r.place_id || idx}
                          onMouseEnter={() => setHighlightIndex(idx)}
                          onMouseLeave={() => setHighlightIndex(-1)}
                          onMouseDown={(e) => e.preventDefault()} /* keep input focused */
                          onClick={() => selectSearchResult(r)}
                          className={`px-3 py-2 cursor-pointer text-sm ${highlightIndex === idx ? 'bg-gray-100' : ''}`}
                        >
                          {renderHighlighted(r.display_name, deliveryInput)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="bg-[#921A28] hover:bg-[#4B2315] text-white px-4 py-2 rounded-md font-bold transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> {showMap ? 'Hide' : 'Map'}
                </button>
              </div>
              {showMap && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-300">
                  <div id="leaflet-map" style={{ height: 400, width: '100%' }} />
                  <div className="bg-gray-50 p-3 text-xs text-gray-600">
                    <p className="font-bold mb-2">Instructions:</p>
                    <p>1. Click anywhere on the map to select delivery location.</p>
                    <p>2. Or type an address above and press Enter to search.</p>
                    <p>3. Selected address will appear in the input field.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t pt-6">
              <label className="flex items-center gap-3 mb-4">
                <input 
                  type="checkbox" 
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                  className="w-4 h-4 accent-[#921A28] cursor-pointer"
                />
                <span className="text-xs font-black uppercase text-gray-500 tracking-widest cursor-pointer">Customize Number of Crates</span>
              </label>
              {useCustom && (
                <>
                  <div className="mb-4">
                    <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">Choose Brands</label>
                    <div className="flex flex-wrap gap-3">
                      {BRANDS.map((b) => (
                        <label key={b} className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-md cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(b)}
                            onChange={() => toggleBrand(b)}
                            className="w-4 h-4 accent-[#921A28]"
                          />
                          <span className="text-sm font-bold">{b}</span>
                          {selectedBrands.includes(b) && (
                            <input
                              type="number"
                              min="0"
                              value={selectedBrandCounts[b] ?? ''}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setSelectedBrandCounts((prev) => {
                                  const next = { ...prev, [b]: val };
                                  const total = sumBrandCounts(next);
                                  setCustomCrates(total || null);
                                  setCrates(total || 0);
                                  return next;
                                });
                              }}
                              placeholder={getBrandAllocation()[b] || 0}
                              className="w-20 ml-2 px-2 py-1 border border-gray-200 rounded text-sm"
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                  <input 
                    type="number" 
                    min="1" 
                    value={customCrates || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || null;
                      setCustomCrates(val);
                      if (val) setCrates(val);
                      // if brands selected and no per-brand counts set, populate allocation
                      if (val && selectedBrands.length > 0) {
                        const noneSet = selectedBrands.every((b) => !selectedBrandCounts[b]);
                        if (noneSet) {
                          const alloc = computeAllocationFor(val);
                          setSelectedBrandCounts((prev) => ({ ...prev, ...alloc }));
                        }
                      }
                    }}
                    placeholder="Enter number of crates"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-bold focus:outline-none focus:border-[#921A28]"
                  />
                </>
              )}
            </div>
            </div>
          </div>

          {/* Center/Right: Smart Mix Results */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#921A28] text-white p-6 rounded-xl shadow-xl relative overflow-hidden">
               <Beer className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
               <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-80 mb-2">Total Suggested Order</p>
               <h2 className="text-6xl font-black">{breakdown.total} <span className="text-xl uppercase opacity-60">Crates</span></h2>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {/* Nile Special Card */}
              <div className="bg-white p-4 rounded-xl border-b-4 border-[#D1A33C] shadow-sm">
                <div className="text-[8px] font-black text-gray-400 uppercase mb-1">Flagship</div>
                <div className="text-xl font-black text-[#4B2315]">{breakdown.nile} Crates</div>
                <div className="text-xs font-bold text-[#D1A33C] uppercase mt-2 italic">Nile Special</div>
              </div>

              {/* Club Card */}
              <div className="bg-white p-4 rounded-xl border-b-4 border-blue-400 shadow-sm">
                <div className="text-[8px] font-black text-gray-400 uppercase mb-1">Refreshing</div>
                <div className="text-xl font-black text-[#4B2315]">{breakdown.club} Crates</div>
                <div className="text-xs font-bold text-blue-500 uppercase mt-2 italic">Club Pilsener</div>
              </div>

              {/* Castle Lite Card */}
              <div className="bg-white p-4 rounded-xl border-b-4 border-gray-300 shadow-sm">
                <div className="text-[8px] font-black text-gray-400 uppercase mb-1">Premium</div>
                <div className="text-xl font-black text-[#4B2315]">{breakdown.castle} Crates</div>
                <div className="text-xs font-bold text-gray-400 uppercase mt-2 italic">Castle Lite</div>
              </div>
            </div>

            <button onClick={placeOrder} className="w-full bg-[#4B2315] text-white py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all group text-sm">
              Confirm Selection & Order <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-4 py-6 bg-white text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-6">Proudly part of ABInBev</p>
        <div className="flex justify-center gap-12 grayscale opacity-60">
           <span className="font-black text-xl">NILE SPECIAL</span>
           <span className="font-black text-xl text-[#921A28]">CLUB</span>
           <span className="font-black text-xl">EAGLE</span>
        </div>
      </div>
    </div>
  );
};

// Main App with routing
const App = () => {
  const [orderData, setOrderData] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShowReview = (data) => {
    setReviewData(data);
    window.location.hash = '#/review';
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guests: reviewData.guests,
          eventDuration: reviewData.eventDuration,
          crates: reviewData.crates,
          smartMix: reviewData.smartMix,
          delivery: reviewData.delivery,
        })
      });
      
      const data = await response.json();
      if (data.success) {
        const completeOrderData = {
          ...data,
          ...reviewData
        };
        setOrderData(completeOrderData);
        setReviewData(null);
        window.location.hash = '#/order';
      } else {
        alert('Error: ' + (data.error || 'Failed to place order'));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to connect to NBL Hub. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEdit = () => {
    setReviewData(null);
    window.location.hash = '#/';
  };

  const handleOrderSuccess = (data) => {
    setOrderData(data);
    window.location.hash = '#/order';
  };

  const handleNewOrder = () => {
    setOrderData(null);
    setReviewData(null);
    window.location.hash = '#/';
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<NBLPartyPortalCalculator onOrderSuccess={handleOrderSuccess} onShowReview={handleShowReview} orderData={orderData} />} />
        <Route path="/review" element={<OrderReview orderDetails={reviewData} onConfirm={handleConfirmOrder} onCancel={handleBackToEdit} isLoading={isSubmitting} />} />
        <Route path="/order" element={<OrderConfirmation orderData={orderData} onNewOrder={handleNewOrder} />} />
      </Routes>
    </Router>
  );
};

export default App;