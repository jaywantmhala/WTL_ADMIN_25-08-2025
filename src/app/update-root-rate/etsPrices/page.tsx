"use client"

import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "../../../container/components/Navbar";

// Type definition for existing price data
interface ExistingPrice {
  id?: number;
  sourceCity?: string;
  sourceState?: string;
  destinationCity?: string;
  destinationState?: string;
  desitnationState?: string; // Keep this typo as it might exist in the API
  pickupLocation?: string;
  dropLocation?: string;
  distance?: string;
  // Add other known properties as needed
}

const ETSPricing = () => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [prices, setPrices] = useState({
    hatchback: "",
    sedan: "",
    sedanPremium: "",
    suv: "",
    suvPlus: "",
  });
  const [distance, setDistance] = useState("");
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingPrice, setExistingPrice] = useState<ExistingPrice | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Service charge and GST state
  const [showServiceCharge, setShowServiceCharge] = useState(false);
  const [showGST, setShowGST] = useState(false);

  // Service charge and GST rates
  const SERVICE_CHARGE_RATE = 10; // 10%
  const GST_RATE = 5; // 5%

  // Refs for the autocomplete input fields
  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  // Helper functions for calculations
  const calculateServiceCharge = (price: number): number => {
    return (price * SERVICE_CHARGE_RATE) / 100;
  };

  const calculateGST = (price: number): number => {
    return (price * GST_RATE) / 100;
  };

  // const calculateTotalWithCharges = (price) => {
  //   let total = price;
  //   if (showServiceCharge) {
  //     total += calculateServiceCharge(price);
  //   }
  //   if (showGST) {
  //     total += calculateGST(price);
  //   }
  //   return total;
  // };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  // Load Google Maps API with Places library
  useEffect(() => {
    const loadGoogleMapsAPI = (): void => {
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyCelDo4I5cPQ72TfCTQW-arhPZ7ALNcp8w&libraries=places";
      script.async = true;
      script.onload = (): void => {
        setGoogleMapsLoaded(true);
        console.log("Google Maps API loaded");
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();
  }, []);

  // Initialize Autocomplete for Pickup and Drop inputs once API is loaded
  useEffect(() => {
    if (googleMapsLoaded && window.google && pickupRef.current && dropRef.current) {
      const pickupAutocomplete = new window.google.maps.places.Autocomplete(
        pickupRef.current,
        { types: ["geocode"] }
      );
      pickupAutocomplete.addListener("place_changed", () => {
        const place = pickupAutocomplete.getPlace();
        setPickup(place.formatted_address || place.name || "");
      });

      const dropAutocomplete = new window.google.maps.places.Autocomplete(
        dropRef.current,
        { types: ["geocode"] }
      );
      dropAutocomplete.addListener("place_changed", () => {
        const place = dropAutocomplete.getPlace();
        setDrop(place.formatted_address || place.name || "");
      });
    }
  }, [googleMapsLoaded]);

  const calculateDistance = useCallback((): void => {
    if (pickup && drop && googleMapsLoaded) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [pickup],
          destinations: [drop],
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK" && response && response.rows && response.rows[0] && response.rows[0].elements && response.rows[0].elements[0] && response.rows[0].elements[0].distance) {
            const calculatedDistance = response.rows[0].elements[0].distance.text;
            setDistance(calculatedDistance);
            console.log(`Calculated Distance: ${calculatedDistance}`);
          } else {
            console.error("Error calculating distance:", status);
            setDistance("Error calculating distance");
          }
        }
      );
    }
  }, [pickup, drop, googleMapsLoaded]);

  // Calculate distance when both locations are selected
  useEffect(() => {
    if (pickup && drop && googleMapsLoaded) {
      console.log("Both pickup and drop locations selected. Calculating distance.");
      calculateDistance();
    }
  }, [pickup, drop, googleMapsLoaded, calculateDistance]);

  // Search for existing price by pickup and drop location
  const searchPrice = async () => {
    if (!pickup || !drop) {
      alert("Please select both pickup and drop locations.");
      return;
    }

    setIsSearching(true);
    try {
      // Use POST method with form data as the API expects POST mapping
      const formData = new FormData();
      formData.append('pickupLocation', pickup);
      formData.append('dropLocation', drop);

      const response = await fetch('https://ets.worldtriplink.com/find', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.id) {
          setExistingPrice(data);
          // Pre-fill form with existing data - using correct field names from API response
          setPrices({
            hatchback: data.hatchback?.toString() || "",
            sedan: data.sedan?.toString() || "",
            sedanPremium: data.sedanpremium?.toString() || "",
            suv: data.suv?.toString() || "",
            suvPlus: data.suvplus?.toString() || "",
          });
          alert("Existing pricing found! You can update the values below.");
        } else {
          setExistingPrice(null);
          setPrices({
            hatchback: "",
            sedan: "",
            sedanPremium: "",
            suv: "",
            suvPlus: "",
          });
          alert("No existing pricing found. You can create new pricing below.");
        }
      } else {
        setExistingPrice(null);
        setPrices({
          hatchback: "",
          sedan: "",
          sedanPremium: "",
          suv: "",
          suvPlus: "",
        });
        alert("No existing pricing found. You can create new pricing below.");
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("Failed to search pricing. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Calculate total cost based on distance and price
  const calculateTotal = (price: number): number | null => {
    if (!distance || isNaN(price)) return null;
    const numericDistance = parseFloat(distance.replace(/[^\d.-]/g, ""));
    return numericDistance * price;
  };

  // Submit form (update existing price)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!pickup || !drop) {
      alert("Please select both pickup and drop locations.");
      return;
    }

    if (!existingPrice) {
      alert("Please search for existing pricing first before updating.");
      return;
    }

    // Validate that all prices are filled and are valid numbers
    const requiredFields = ['hatchback', 'sedan', 'sedanPremium', 'suv', 'suvPlus'];
    const emptyFields = requiredFields.filter(field => !prices[field as keyof typeof prices] || prices[field as keyof typeof prices] === '');

    if (emptyFields.length > 0) {
      alert(`Please fill in all price fields. Missing: ${emptyFields.join(', ')}`);
      return;
    }

    // Validate that all prices are valid numbers
    const invalidFields = requiredFields.filter(field => {
      const value = prices[field as keyof typeof prices];
      return isNaN(parseInt(value)) || parseInt(value) <= 0;
    });

    if (invalidFields.length > 0) {
      alert(`Please enter valid positive numbers for: ${invalidFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the existing price data for location information to ensure consistency
      const sourceCity = existingPrice?.sourceCity || "";
      const sourceState = existingPrice?.sourceState || "";
      const destinationCity = existingPrice?.destinationCity || "";
      const destinationState = existingPrice?.desitnationState || existingPrice?.destinationState || "";

      // Build query parameters for update API
      const queryParams = new URLSearchParams({
        sourceState: sourceState,
        destinationState: destinationState,
        sourceCity: sourceCity,
        destinationCity: destinationCity,
        hatchbackPrice: parseInt(prices.hatchback).toString(),
        sedanPrice: parseInt(prices.sedan).toString(),
        sedanPremiumPrice: parseInt(prices.sedanPremium).toString(),
        suvPrice: parseInt(prices.suv).toString(),
        suvPlusPrice: parseInt(prices.suvPlus).toString(),
        status: "active"
      }).toString();

      const apiUrl = `https://ets.worldtriplink.com/updatePrice/${(existingPrice).id}?${queryParams}`;

      const apiResponse = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('API Error:', errorText);
        throw new Error(`API call failed: ${apiResponse.status} - ${errorText}`);
      }

      const result = await apiResponse.json();
      console.log("API Response:", result);

      alert("ETS pricing updated successfully!");

      // Update existing price with new data
      setExistingPrice(result);

    } catch (err) {
      console.error("Error details:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      alert(`Error occurred while updating ETS pricing: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />
      <div className="container mx-auto px-4 py-8 overflow-y-auto flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">ETS Pricing Management</h1>
        </div>

        <div className="card bg-white shadow-md rounded-md mb-6">
          <div className="card-header bg-gray-200 px-4 py-2 rounded-t-md">
            <strong className="text-lg font-semibold flex items-center">
              <i className="mr-2 fa fa-money text-blue-500"></i>
              Update ETS Pricing
              <span className="ml-2 text-xl text-green-500">
                <i className="fa fa-inr"></i>
              </span>
            </strong>
          </div>
          <div className="card-body p-4">
            <div className="flex space-x-2">
              <a
                href="/update-root-rate"
                className="btn btn-secondary text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                One way Prices
              </a>
              <a
                href="/update-root-rate/roundPrice"
                className="btn btn-secondary text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                Round Prices
              </a>
              <a
                href="/update-root-rate/rentalPrice"
                className="btn btn-secondary text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                Rental Prices
              </a>
              <a
                href="/update-root-rate/1to150"
                className="btn btn-secondary text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                1 to 150 Prices
              </a>
              <a
                href="/update-root-rate/etsPrices"
                className="btn btn-secondary text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
              >
                ETS Prices
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium">Pickup Location</label>
              <input
                type="text"
                ref={pickupRef}
                placeholder="Enter pickup location (e.g., City, State)"
                className="block w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Drop Location</label>
              <input
                type="text"
                ref={dropRef}
                placeholder="Enter drop location (e.g., City, State)"
                className="block w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <button
              type="button"
              onClick={searchPrice}
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded transition-colors"
            >
              {isSearching ? "Searching..." : "Search Existing Pricing"}
            </button>
          </div>

          <div className="pt-2">
            {distance && <div className="text-sm text-gray-600">Distance: {distance}</div>}
          </div>

          {existingPrice && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-green-800">Existing Pricing Found:</h3>
              <p className="text-sm text-green-700">
                Route: {(existingPrice ).pickupLocation} → {(existingPrice ).dropLocation}
              </p>
              <p className="text-sm text-green-600">
                ID: {(existingPrice ).id} | Distance: {(existingPrice).distance} km
              </p>
              <p className="text-sm text-green-600">
                {(existingPrice).sourceCity}, {(existingPrice ).sourceState} → {(existingPrice).destinationCity}, {(existingPrice).desitnationState || (existingPrice).destinationState}
              </p>
            </div>
          )}

          {/* Service Charge and GST Options */}
          {existingPrice && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fa fa-calculator text-green-500"></i>
                Pricing Options
              </h3>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center">
                  <input
                    id="serviceCharge"
                    type="checkbox"
                    checked={showServiceCharge}
                    onChange={(e) => setShowServiceCharge(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="serviceCharge" className="ml-2 text-sm font-medium text-gray-700">
                    Include Service Charge ({SERVICE_CHARGE_RATE}%)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="gst"
                    type="checkbox"
                    checked={showGST}
                    onChange={(e) => setShowGST(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="gst" className="ml-2 text-sm font-medium text-gray-700">
                    Include GST ({GST_RATE}%)
                  </label>
                </div>
              </div>

              {(showServiceCharge || showGST) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> These charges are for display purposes only and will not be saved to the database.
                    Only the base prices will be stored.
                  </p>
                </div>
              )}
            </div>
          )}

          {existingPrice && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Update Prices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {["hatchback", "sedan", "sedanPremium", "suv", "suvPlus"].map((carType) => {
                  const basePrice = parseFloat(prices[carType as keyof typeof prices]) || 0;
                  const serviceCharge = showServiceCharge ? calculateServiceCharge(basePrice) : 0;
                  const gst = showGST ? calculateGST(basePrice) : 0;
                  const totalWithCharges = basePrice + serviceCharge + gst;

                  return (
                    <div key={carType} className="space-y-2">
                      <label className="block text-sm font-medium capitalize">
                        {carType.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={prices[carType as keyof typeof prices]}
                        onChange={(e) => setPrices({ ...prices, [carType]: e.target.value })}
                        className="block w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter price"
                        required
                      />

                      {/* Vehicle Type Label */}
                      {prices[carType as keyof typeof prices] && (
                        <div className="mt-2 text-sm text-gray-600">
                          {`${carType.charAt(0).toUpperCase() + carType.slice(1)} Cab`}
                        </div>
                      )}

                      {/* Price Breakdown */}
                      {basePrice > 0 && (showServiceCharge || showGST) && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-1 border">
                          <div className="flex justify-between">
                            <span>Base Price:</span>
                            <span className="font-medium">{formatCurrency(basePrice)}</span>
                          </div>
                          {showServiceCharge && (
                            <div className="flex justify-between text-blue-600">
                              <span>Service Charge ({SERVICE_CHARGE_RATE}%):</span>
                              <span className="font-medium">+{formatCurrency(serviceCharge)}</span>
                            </div>
                          )}
                          {showGST && (
                            <div className="flex justify-between text-green-600">
                              <span>GST ({GST_RATE}%):</span>
                              <span className="font-medium">+{formatCurrency(gst)}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t pt-1 font-semibold text-gray-800">
                            <span>Total:</span>
                            <span>{formatCurrency(totalWithCharges)}</span>
                          </div>
                        </div>
                      )}

                      {/* Distance-based calculation */}
                      {prices[carType as keyof typeof prices] && distance && (
                        <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded border">
                          <div className="font-medium">Distance Calculation:</div>
                          <div>Total: {calculateTotal(parseFloat(prices[carType as keyof typeof prices]) || 0)} INR (Price × Distance)</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {existingPrice && (
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 transition-colors"
              >
                {isSubmitting ? "Updating..." : "Update ETS Pricing"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ETSPricing;