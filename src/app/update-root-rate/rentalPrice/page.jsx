'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../../container/components/Navbar';

const UpdateTripPricing = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [dStates, setDStates] = useState([]);
  const [dCities, setDCities] = useState([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDState, setSelectedDState] = useState('');
  const [selectedDCity, setSelectedDCity] = useState('');

  const [prices, setPrices] = useState({
    hatchback: '',
    sedan: '',
    sedanPremium: '',
    suv: '',
    suvPlus: '',
  });

  useEffect(() => {
    // Fetch initial state data
    fetch('/api/states') // Adjust your API endpoint
      .then((res) => res.json())
      .then((data) => {
        setStates(data);
        setDStates(data);
      })
      .catch((error) => console.error('Error fetching states:', error));
  }, []);

  const handleStateChange = async (stateId) => {
    setSelectedState(stateId);
    try {
      const response = await fetch(`/api/cities?stateId=${stateId}`);
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleDStateChange = async (stateId) => {
    setSelectedDState(stateId);
    try {
      const response = await fetch(`/api/dCities?stateId=${stateId}`);
      const data = await response.json();
      setDCities(data);
    } catch (error) {
      console.error('Error fetching destination cities:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted Prices:', prices);
    console.log('Selected Locations:', {
      selectedState,
      selectedCity,
      selectedDState,
      selectedDCity,
    });
    // Additional logic to submit data to the server can be added here
  };

  return (
    <div className="flex">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Rental Prices Outstation
        </h1>
        <div className="card bg-white shadow-md rounded-md mb-6">
          <div className="card-header bg-gray-200 px-4 py-2 rounded-t-md">
            <strong className="text-lg font-semibold flex items-center">
              <i className="mr-2 fa fa-money text-blue-500"></i>
              Update Trip Pricing
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
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source State and City */}
            <div>
              <label className="block text-sm font-medium">Source State</label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Source City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination State and City */}
            <div>
              <label className="block text-sm font-medium">Destination State</label>
              <select
                value={selectedDState}
                onChange={(e) => handleDStateChange(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select State</option>
                {dStates.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Destination City</label>
              <select
                value={selectedDCity}
                onChange={(e) => setSelectedDCity(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select City</option>
                {dCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Prices</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {['hatchback', 'sedan', 'sedanPremium', 'suv', 'suvPlus'].map((carType) => (
                <div key={carType}>
                  <label className="block text-sm font-medium capitalize">
                    {carType.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={prices[carType]}
                    onChange={(e) =>
                      setPrices({ ...prices, [carType]: e.target.value })
                    }
                    className="block w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTripPricing;
