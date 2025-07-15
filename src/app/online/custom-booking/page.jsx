"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../../../container/components/Navbar";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";

const Bookings = () => {
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tripType, setTripType] = useState("oneWay");
  const [userPickup, setUserPickUp] = useState("");
  const [userDrop, setUserDrop] = useState("");
  const [startDate, setStartDate] = useState("");
  const [time, setTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [car, setCar] = useState("Sedan");
  const [amount, setAmount] = useState("");
  const [collection, setCollection] = useState("0");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  // Google Maps Autocomplete states
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [loadingDistance, setLoadingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState("");

  // Refs for autocomplete
  const pickupRef = useRef(null);
  const dropRef = useRef(null);
  const pickupAutocomplete = useRef(null);
  const dropAutocomplete = useRef(null);
  const mapRef = useRef(null);

  const router = useRouter();

  // Bookings from backend
  const [bookings, setBookings] = useState([]);

  // Filter state for trip type (all, oneWay, roundTrip)
  const [filterTrip, setFilterTrip] = useState("all");

  const API_KEY = "AIzaSyCelDo4I5cPQ72TfCTQW-arhPZ7ALNcp8w";

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google) {
        initializeAutocomplete();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);
    };

    if (isFormOpen) {
      loadGoogleMapsScript();
    }
  }, [isFormOpen]);

  const initializeAutocomplete = () => {
    if (!window.google || !pickupRef.current || !dropRef.current) return;

    // Initialize pickup autocomplete
    pickupAutocomplete.current = new window.google.maps.places.Autocomplete(
      pickupRef.current,
      {
        types: ['geocode'],
        componentRestrictions: { country: 'in' } // Restrict to India
      }
    );

    // Initialize drop autocomplete
    dropAutocomplete.current = new window.google.maps.places.Autocomplete(
      dropRef.current,
      {
        types: ['geocode'],
        componentRestrictions: { country: 'in' } // Restrict to India
      }
    );

    // Add listeners
    pickupAutocomplete.current.addListener('place_changed', () => {
      const place = pickupAutocomplete.current.getPlace();
      setUserPickUp(place.formatted_address || place.name);
      calculateDistance();
    });

    dropAutocomplete.current.addListener('place_changed', () => {
      const place = dropAutocomplete.current.getPlace();
      setUserDrop(place.formatted_address || place.name);
      calculateDistance();
    });
  };

  const calculateDistance = async () => {
    const pickup = pickupRef.current?.value;
    const drop = dropRef.current?.value;

    if (!pickup || !drop || pickup.length < 3 || drop.length < 3) {
      setDistance('');
      setDuration('');
      return;
    }

    if (!window.google) {
      setDistanceError('Google Maps API not loaded');
      return;
    }

    setLoadingDistance(true);
    setDistanceError('');

    try {
      const service = new window.google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix(
        {
          origins: [pickup],
          destinations: [drop],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: true,
        },
        (response, status) => {
          setLoadingDistance(false);
          
          if (status === 'OK') {
            const element = response.rows[0].elements[0];
            if (element.status === 'OK') {
              setDistance(element.distance.text);
              setDuration(element.duration.text);
              setDistanceError('');
            } else {
              setDistanceError('Unable to calculate distance between these locations');
              setDistance('');
              setDuration('');
            }
          } else {
            setDistanceError('Error calculating distance. Please try again.');
            setDistance('');
            setDuration('');
          }
        }
      );
    } catch (err) {
      console.error('Distance calculation error:', err);
      setDistanceError('Error calculating distance. Please try again.');
      setDistance('');
      setDuration('');
      setLoadingDistance(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const params = new URLSearchParams();
    params.append("bookingType", "custom_booking");
    params.append("tripType", tripType);
    params.append("userPickup", userPickup);
    params.append("userDrop", userDrop);
    params.append("startDate", startDate);
    params.append("time", time);
    if (returnDate) params.append("returnDate", returnDate);
    params.append("car", car);
    params.append("amount", amount);
    params.append("name", name);
    params.append("email", email);
    params.append("phone", phone);
    params.append("collection", collection);
    params.append("companyName", companyName);

    try {
      const response = await fetch("https://api.worldtriplink.com/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (response.ok) {
        const resultText = await response.text();
        console.log(resultText);
        setSuccessMessage("Booking created successfully.");
        fetchBookings();
        setIsFormOpen(false);
        // Reset form
        setUserPickUp("");
        setUserDrop("");
        setDistance("");
        setDuration("");
        setName("");
        setEmail("");
        setPhone("");
        setCompanyName("");
        setStartDate("");
        setTime("");
        setReturnDate("");
        setAmount("");
        setCollection("0");
        setTripType("oneWay");
      } else {
        const errorText = await response.text();
        console.error("Failed to create booking:", errorText);
        setError("Failed to create booking");
      }
    } catch (error) {
      console.error("Error during booking creation:", error);
      setError("Network or server error");
    }
  };

  // Fetch bookings from the backend
  const fetchBookings = async () => {
    try {
      const response = await axios.get("https://api.worldtriplink.com/details");
      if (response.status === 200 && Array.isArray(response.data)) {
        setBookings(response.data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings", error);
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings to show only custom bookings and then by trip type if needed.
  const filteredBookings = bookings.filter((b) => {
    return (
      b.bookingType === "custom_booking" &&
      (filterTrip === "all" || b.tripType === filterTrip)
    );
  });

  const deleteBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`https://api.worldtriplink.com/delete/${bookingId}`);
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.bookingId !== bookingId)
      );
      fetchBookings();
    } catch (error) {
      setError("Error deleting booking");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - fixed and not scrollable */}
      <Navbar className="flex-shrink-0" />
      
      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto p-6">
          {/* Header Section */}
          <div className="bg-gray-100 p-4 flex items-center justify-between rounded-lg shadow">
            <h2 className="font-semibold text-lg flex items-center">
              <span className="mr-2">🚖</span> Custom Bookings
            </h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="border p-2 rounded-md bg-black hover:bg-gray-800 text-white transition duration-300"
            >
              <FaPlus className="text-white" />
            </button>
          </div>

          {/* Filter Options */}
          <div className="mt-4 flex items-center space-x-4">
            <label className="text-gray-700">Filter by Trip Type:</label>
            <select
              value={filterTrip}
              onChange={(e) => setFilterTrip(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">All Bookings</option>
              <option value="oneWay">One Way</option>
              <option value="roundTrip">Round Trip</option>
            </select>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Booking Form */}
          {isFormOpen && (
            <div className="bg-gradient-to-br from-white to-blue-50 p-8 shadow-2xl rounded-2xl mt-6 border border-blue-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Add New Custom Booking
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    // Reset form when closing
                    setUserPickUp("");
                    setUserDrop("");
                    setDistance("");
                    setDuration("");
                    setDistanceError("");
                    setName("");
                    setEmail("");
                    setPhone("");
                    setCompanyName("");
                    setStartDate("");
                    setTime("");
                    setReturnDate("");
                    setAmount("");
                    setCollection("0");
                    setTripType("oneWay");
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 hover:bg-red-50 rounded-full"
                >
                  <FaTimes size={22} />
                </button>
              </div>
            
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trip Type */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">
                    Trip Type
                  </label>
                  <div className="flex items-center space-x-6">
                    {["oneWay", "roundTrip"].map((type) => (
                      <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="tripType"
                          value={type}
                          checked={tripType === type}
                          onChange={() => setTripType(type)}
                          className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-gray-700 group-hover:text-blue-600 transition-colors duration-200 font-medium">
                          {type === "oneWay" ? "One Way" : "Round Trip"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
            
                {/* Personal Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter company name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
            
                {/* Trip Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Trip Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pickup Location
                      </label>
                      <input
                        ref={pickupRef}
                        type="text"
                        placeholder="Enter pickup location"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={userPickup}
                        onChange={(e) => {
                          setUserPickUp(e.target.value);
                          // Clear distance when manually typing
                          if (distance) {
                            setDistance('');
                            setDuration('');
                          }
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Drop Location
                      </label>
                      <input
                        ref={dropRef}
                        type="text"
                        placeholder="Enter drop location"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={userDrop}
                        onChange={(e) => {
                          setUserDrop(e.target.value);
                          // Clear distance when manually typing
                          if (distance) {
                            setDistance('');
                            setDuration('');
                          }
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Distance Display */}
                  {(distance || duration || loadingDistance || distanceError) && (
                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">📍</span>
                        Distance Information
                      </h4>
                      
                      {loadingDistance && (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-blue-600">Calculating distance...</span>
                        </div>
                      )}

                      {distanceError && (
                        <div className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                          <span className="font-medium">⚠️ Error:</span> {distanceError}
                        </div>
                      )}

                      {distance && duration && !loadingDistance && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-md shadow-sm border border-blue-100">
                            <div className="text-sm text-gray-600 mb-1">🛣️ Distance</div>
                            <div className="text-2xl font-bold text-blue-600">{distance}</div>
                          </div>
                          <div className="bg-white p-4 rounded-md shadow-sm border border-green-100">
                            <div className="text-sm text-gray-600 mb-1">⏱️ Estimated Time</div>
                            <div className="text-2xl font-bold text-green-600">{duration}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                      />
                    </div>
                    {tripType === "roundTrip" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Return Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Car Type
                      </label>
                      <select
                        value={car}
                        onChange={(e) => setCar(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-white"
                      >
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Ertiga">Ertiga</option>
                      </select>
                    </div>
                  </div>
                </div>
            
                {/* Financial Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Billing Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Amount
                      </label>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Collection
                      </label>
                      <input
                        type="number"
                        placeholder="Enter collection amount"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={collection}
                        onChange={(e) => setCollection(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
            
                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    Create Booking
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white shadow-lg rounded-lg p-4 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Custom Bookings Overview
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Booking ID
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      PickUp Location
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Drop Location
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Date/Time
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Trip Type
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Car Type
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Start Date
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Return Date
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Collection
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Delete
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.bookingId}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.userPickup}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.userDrop}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.startDate} {row.time}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                      {row.tripType
        ? row.tripType
            .replace(/[- ]/g, "") // Remove hyphens and spaces
            .replace(/^./, (match) => match.toUpperCase()) // Capitalize the first letter
        : ""}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.car}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.startDate}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.returnDate || "N/A"}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.amount}
                      </td>
                      <td className="px-2 py-2 text-gray-700 text-xs">
                        {row.collection}
                      </td>
                      <td className=" p-2">
                        <span
                          className={`px-2 py-1 rounded ${
                            row.status === 0
                              ? "bg-yellow-500" // Pending
                              : row.status === 1
                              ? "bg-blue-500" // Ongoing
                              : row.status === 2
                              ? "bg-green-500" // Completed
                              : row.status === 3
                              ? "bg-red-500" // Cancelled
                              : "bg-gray-500" // Default color for invalid or undefined status
                          } text-white`}
                        >
                          {row.status === 0
                            ? "Pending"
                            : row.status === 1
                            ? "Ongoing"
                            : row.status === 2
                            ? "Completed"
                            : row.status === 3
                            ? "Cancelled"
                            : "Unknown"}
                        </span>
                      </td>

                      <td className="p-2 text-center">
                        <button
                          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                          onClick={() => deleteBooking(row.id)}
                          disabled={deleting}
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                      <td className=" p-2 text-center">
                        <button
                          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                          onClick={() =>
                            router.push(`/online/online-booking/vendor/${row.id}`)
                          }
                        >
                          Action
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && (
                <p className="text-center text-gray-500 mt-4">
                  No custom bookings found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;