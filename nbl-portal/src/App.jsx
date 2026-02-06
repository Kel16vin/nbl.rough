import React, { useState, useEffect, useRef } from 'react';
import { Beer, Users, Clock, ShoppingCart, Phone, MapPin } from 'lucide-react';

const NBLPartyPortal = () => {
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

  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');

  const placeOrder = () => {
    setOrderError('');
    setOrderSuccess('');
    // validations
    if (useCustom) {
      if (!customCrates || customCrates <= 0) {
        setOrderError('Please enter a valid number of crates when customizing.');
        return;
      }
      if (!selectedBrands || selectedBrands.length === 0) {
        setOrderError('Please select at least one brand when customizing crates.');
        return;
      }
    }
    if (!deliveryLocation && !deliveryInput) {
      setOrderError('Please select or enter a delivery location.');
      return;
    }

    // Build order payload
    const payload = {
      guests: Number(guests),
      eventDate: eventDate || null,
      eventDuration: Number(eventDuration),
      crates: crates,
      customCrates: customCrates || null,
      brands: useCustom ? selectedBrands : ['All Brands'],
      brandCounts: useCustom ? selectedBrandCounts : null,
      delivery: {
        address: deliveryLocation || deliveryInput,
        coords: deliveryCoords || null,
      },
      timestamp: new Date().toISOString(),
    };

    // For now we'll console.log and show a success message (you can POST this payload to your API)
    console.log('Order payload:', payload);
    setOrderSuccess('Order prepared — check console for payload (or implement API POST).');
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
      <div className="bg-white py-4 px-8 flex justify-between items-center border-b border-gray-200">
        <img src="https://www.nilebreweries.com/wp-content/uploads/2023/10/nbl-logo.png" alt="NBL Logo" className="h-12" />
        <div className="hidden md:flex gap-6 text-sm font-bold uppercase text-gray-600">
          <span>Home</span> <span>About Us</span> <span>Our Brands</span> <span>Sustainability</span>
        </div>
      </div>

      {/* Secondary Nav - Deep Malt Brown */}
      <div className="bg-[#4B2315] text-white py-3 px-8 flex justify-between items-center shadow-md">
        <div className="flex gap-6 text-xs font-bold uppercase">
          <span>News & Media</span> <span>Events</span> <span>Careers</span> <span>Contact Us</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold bg-[#921A28] px-4 py-1 rounded-full">
          <Phone className="w-4 h-4" /> 0800 204 204
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-12 px-6 text-center">
        <h2 className="text-4xl font-black uppercase tracking-tight mb-2 italic">PARTY STARTER</h2>
        <p className="text-gray-600 max-w-xl mx-auto border-b-2 border-[#921A28] pb-4">
          With our iconic brands, we have you covered for your event.
        </p>
      </div>

      {/* Calculator Card */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
          
          {/* Inputs */}
          <div className="p-8 md:w-1/2 space-y-8">
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

          {/* Result Area - Styled like the NBL Product Page */}
          <div className="bg-[#FDF8E4] p-8 md:w-1/2 border-l border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="bg-[#921A28] p-4 rounded-full mb-4 shadow-lg">
               <Beer className="text-white w-8 h-8" />
            </div>
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-1 text-center">Recommended Stock</h3>
            {useCustom && (
              <p className="text-xs font-bold text-[#921A28] uppercase mb-3">
                {selectedBrands.length > 0 ? selectedBrands.join(', ') : 'All Brands'}
              </p>
            )}
            <div className="text-6xl font-black text-[#4B2315]">{crates}</div>
            <p className="text-sm font-bold text-[#921A28] uppercase mt-2">Crates of Beer</p>
            
            <button className="mt-8 bg-[#4B2315] text-white px-8 py-3 rounded-md font-bold uppercase tracking-widest hover:bg-[#921A28] transition-colors shadow-lg">
              Place Order Now
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-16 py-12 bg-white text-center">
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

export default NBLPartyPortal;