"use client";
import React, { useState } from "react";

const page = () => {
  const [formData, setFormData] = useState({
    fromLocation: "",
    toLocation: "",
    tripType: "oneWay",
    startDate: "",
    returnDate: "",
    time: "",
    distance: "",
    userId: "",
    bookingId: "",
    name: "",
    email: "",
    phone: "",
    userPickup: "",
    userDrop: "",
    date: "",
    userTripType: "",
    bookid: "",
    car: "Sedan",
    baseAmount: "",
    amount: 0,
    status: 0,
    driverBhata: "0",
    nightCharges: 0,
    gst: 0,
    serviceCharge: 0,
    offer: "",
    offerPartial: 0,
    offerAmount: "",
    txnId: "0",
    payment: "",
    dateEnd: "",
    timeEnd: "",
    bookingType: "",
    description: "",
    collection:""
  });

  // Handle changes to form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">Booking Form</h2>

      <form>
        {/* From and To Location */}

        
        <div className="mb-4">
          <label
            htmlFor="fromLocation"
            className="block text-sm font-medium text-gray-700"
          >
            From Location
          </label>
          <input
            type="text"
            name="fromLocation"
            value={formData.fromLocation}
            onChange={handleChange}
            id="fromLocation"
            className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter from location"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="toLocation"
            className="block text-sm font-medium text-gray-700"
          >
            To Location
          </label>
          <input
            type="text"
            name="toLocation"
            value={formData.toLocation}
            onChange={handleChange}
            id="toLocation"
            className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter to location"
          />
        </div>

        {/* Trip Type Dropdown */}
        <div className="mb-4">
          <label
            htmlFor="tripType"
            className="block text-sm font-medium text-gray-700"
          >
            Trip Type
          </label>
          <select
            name="tripType"
            value={formData.tripType}
            onChange={handleChange}
            id="tripType"
            className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="One-way">One-way</option>
            <option value="Round Trip">Round Trip</option>
          </select>
        </div>

        {/* Car Type Dropdown */}
        <div className="mb-4">
          <label
            htmlFor="car"
            className="block text-sm font-medium text-gray-700"
          >
            Car Type
          </label>
          <select
            name="car"
            value={formData.car}
            onChange={handleChange}
            id="car"
            className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            <option value="SUV">SUV</option>
            <option value="INNOVA CRYSTA">INNOVA CRYSTA</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="mb-4">
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            id="startDate"
            className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Return Date (Only if Round Trip) */}
        {formData.tripType === "roundTrip" && (
          <div className="mb-4">
            <label
              htmlFor="returnDate"
              className="block text-sm font-medium text-gray-700"
            >
              Return Date
            </label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              id="returnDate"
              className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Time */}
        <div className="mb-4">
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700"
          >
            Time
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            id="time"
            className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Distance */}
        <div className="mb-4">
          <label
            htmlFor="distance"
            className="block text-sm font-medium text-gray-700"
          >
            Distance
          </label>
          <input
            type="text"
            name="distance"
            value={formData.distance}
            onChange={handleChange}
            id="distance"
            className="mt-1 p-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter distance"
          />
        </div>

        {/* Other fields */}
        {/* You can add the rest of the fields similarly */}

        {/* Submit Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Submit Booking
          </button>
        </div>
      </form>
    </div>
  );
};

export default page;
