

"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../container/components/Navbar";
import * as XLSX from "xlsx";
import axios from "axios";

const UpdateTripPricing = ({ params }) => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  const [prices, setPrices] = useState({
    hatchback: "",
    sedan: "",
    sedanPremium: "",
    suv: "",
    suvPlus: "",
    ertiga:""
  });
  const [distance, setDistance] = useState("");
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  // const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [tripData, setTripData] = useState([]); // To display fetched oneWayTrip data if needed

  // Service charge and GST state
  const [showServiceCharge, setShowServiceCharge] = useState(false);
  const [showGST, setShowGST] = useState(false);

  // Service charge and GST rates
  const SERVICE_CHARGE_RATE = 10; // 10%
  const GST_RATE = 5; // 5%

  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  // Helper functions for calculations
  const calculateServiceCharge = (price) => {
    return (price * SERVICE_CHARGE_RATE) / 100;
  };

  const calculateGST = (price) => {
    return (price * GST_RATE) / 100;
  };

  const calculateTotalWithCharges = (price) => {
    let total = price;
    if (showServiceCharge) {
      total += calculateServiceCharge(price);
    }
    if (showGST) {
      total += calculateGST(price);
    }
    return total;
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyCelDo4I5cPQ72TfCTQW-arhPZ7ALNcp8w&libraries=places";
      script.async = true;
      script.onload = () => {
        setGoogleMapsLoaded(true);
        console.log("Google Maps API loaded");
      };
      document.head.appendChild(script);
    };
    loadGoogleMapsAPI();
  }, []);

  useEffect(() => {
    if (googleMapsLoaded && window.google) {
      const pickupAutocomplete = new window.google.maps.places.Autocomplete(
        pickupRef.current,
        { types: ["geocode"] }
      );
      pickupAutocomplete.addListener("place_changed", () => {
        const place = pickupAutocomplete.getPlace();
        setPickup(place.formatted_address || place.name);
      });

      const dropAutocomplete = new window.google.maps.places.Autocomplete(
        dropRef.current,
        { types: ["geocode"] }
      );
      dropAutocomplete.addListener("place_changed", () => {
        const place = dropAutocomplete.getPlace();
        setDrop(place.formatted_address || place.name);
      });
    }
  }, [googleMapsLoaded]);

  useEffect(() => {
    if (pickup && drop && googleMapsLoaded) {
      console.log("Both pickup and drop locations selected. Calculating distance.");
      calculateDistance();
    } else {
      if (!pickup || !drop) console.log("Either pickup or drop location is not selected.");
      if (!googleMapsLoaded) console.log("Google Maps API not loaded yet.");
    }
  }, [pickup, drop, googleMapsLoaded]);

  const calculateDistance = () => {
    if (pickup && drop && googleMapsLoaded) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [pickup],
          destinations: [drop],
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK") {
            const calculatedDistance = response.rows[0].elements[0].distance.text;
            setDistance(calculatedDistance);
            console.log(`Calculated Distance: ${calculatedDistance}`);
          } else {
            console.error("Error calculating distance:", status);
            setDistance("Error calculating distance");
          }
        }
      );
    } else {
      console.log("Cannot calculate distance. Either pickup or drop is missing.");
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!pickup || !drop) {
  //     alert("Please select both pickup and drop locations.");
  //     return;
  //   }

   
  //   const pickupParts = pickup.split(",").map((part) => part.trim());
  //   const dropParts = drop.split(",").map((part) => part.trim());
  //   const sourceCity = pickupParts[0] || "";
  //   const sourceState = pickupParts[1] || "";
  //   const destinationCity = dropParts[0] || "";
  //   const destinationState = dropParts[1] || "";

  //   try {
  //     const getUrl = `http://localhost:8085/oneWay2/${encodeURIComponent(pickup)}/${encodeURIComponent(drop)}`;
  //     const getResponse = await fetch(getUrl);
  //     let existingTrips = [];
  //     if (getResponse.ok) {
  //       existingTrips = await getResponse.json();
  //     } else {
  //       console.error("GET request error:", getResponse.status);
  //     }

  //     let apiUrl;
  //     let method;

  //     if (!existingTrips || existingTrips.length === 0) {
  //       apiUrl = "http://localhost:8085/oneprice";
  //       method = "POST";
  //     } else {
  //       apiUrl = "http://localhost:8085/update-prices";
  //       method = "PUT";
  //     }

  //     const queryParams = new URLSearchParams({
  //       sourceState: sourceState,
  //       destinationState: destinationState,
  //       sourceCity: sourceCity,
  //       destinationCity: destinationCity,
  //       hatchbackPrice: prices.hatchback,
  //       sedanPrice: prices.sedan,
  //       sedanPremiumPrice: prices.sedanPremium,
  //       suvPrice: prices.suv,
  //       suvPlusPrice: prices.suvPlus,
  //       ertigaPrice : prices.ertiga,
  //       ...(method === "POST" ? { status: "s" } : {}),
  //     }).toString();

  //     const apiUrlWithParams = `${apiUrl}?${queryParams}`;

  //     const apiResponse = await fetch(apiUrlWithParams, { method });
  //     if (!apiResponse.ok) {
  //       throw new Error("API call failed");
  //     }

  //     const result = await apiResponse.json();
  //     alert(method === "POST" ? "Trip pricing created successfully!" : "Trip pricing updated successfully!");
  //   } catch (err) {
  //     console.error(err);
  //     alert("Error occurred while processing trip pricing");
  //   }
  // };


  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!pickup || !drop) {
    alert("Please select both pickup and drop locations.");
    return;
  }

  const pickupParts = pickup.split(",").map((part) => part.trim());
  const dropParts = drop.split(",").map((part) => part.trim());
  const sourceCity = pickupParts[0] || "";
  const sourceState = pickupParts[1] || "";
  const destinationCity = dropParts[0] || "";
  const destinationState = dropParts[1] || "";

  try {
    const getUrl = `http://localhost:8085/oneWay2/${encodeURIComponent(pickup)}/${encodeURIComponent(drop)}`;
    const getResponse = await fetch(getUrl);
    let existingTrips = [];
    if (getResponse.ok) {
      existingTrips = await getResponse.json();
    } else {
      console.error("GET request error:", getResponse.status);
    }

    let apiUrl;
    let method;

    if (!existingTrips || existingTrips.length === 0) {
      apiUrl = "http://localhost:8085/oneprice";
      method = "POST";
    } else {
      apiUrl = "http://localhost:8085/update-prices";
      method = "PUT";
    }

    // ✅ FIXED: Changed parameter names to match backend expectations
    const queryParams = new URLSearchParams({
      sourceState: sourceState,
      destinationState: destinationState,
      sourceCity: sourceCity,
      destinationCity: destinationCity,
      hatchbackPrice: prices.hatchback,
      sedanPrice: prices.sedan,
      sedanPremiumPrice: prices.sedanPremium,
      suvPrice: prices.suv,
      suvPlusPrice: prices.suvPlus,
      ertiga: prices.ertiga,  // ✅ FIXED: Changed from "ertigaPrice" to "ertiga"
      ...(method === "POST" ? { status: "s" } : {}),
    }).toString();

    const apiUrlWithParams = `${apiUrl}?${queryParams}`;

    const apiResponse = await fetch(apiUrlWithParams, { 
      method,
      headers: {
        'Content-Type': 'application/json',  // ✅ ADDED: Proper headers
      }
    });
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('API Error:', errorText);
      throw new Error(`API call failed: ${apiResponse.status} - ${errorText}`);
    }

    const result = await apiResponse.json();
    alert(method === "POST" ? "Trip pricing created successfully!" : "Trip pricing updated successfully!");
    
    // ✅ ADDED: Clear form after successful submission
    setPrices({
      hatchback: "",
      sedan: "",
      sedanPremium: "",
      suv: "",
      suvPlus: "",
      ertiga: ""
    });
    
  } catch (err) {
    console.error('Full error:', err);
    alert(`Error occurred while processing trip pricing: ${err.message}`);
  }
};

  const calculateTotal = (price) => {
    if (!distance || isNaN(price)) return null;
    const numericDistance = parseFloat(distance.replace(/[^\d.-]/g, ""));
    return numericDistance * price;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setFileData(parsedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmitExcel = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);

    try {
      const response = await fetch("http://localhost:8085/upload/excel", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      alert("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    }
  };

  const [jobs, setJobs] = useState([]);
  const [file, setFile] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:8085/upload/excel/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const deleteJob = async () => {
    try {
      const res = await axios.delete("http://localhost:8085/upload/excel/delete");
      alert(res.data);
      fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file || !startDate || !endDate) {
      alert("Please select file, start date, and end date.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);

    try {
      const res = await axios.post("http://localhost:8085/upload/excel", formData);
      alert(res.data);
      fetchJobs();
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Upload failed.");
    }
  };


  return (
    <div className="flex h-screen overflow-hidden"> {/* Add h-screen and overflow-hidden to prevent entire page scrolling */}
  <Navbar /> {/* Sidebar will remain fixed */}
  <div className="container mx-auto px-4 py-8 overflow-y-auto flex-1"> {/* Add overflow-y-auto and flex-1 to enable scrolling only in content area */}
    {/* Rest of your existing content remains exactly the same */}
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold">One Way Trip Prices Outstation</h1>
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          window.location.href = "http://localhost:8085/upload/excel/export";
        }}
      >
        Export Prices
      </button>
    </div>
        {/* <h1 className="text-4xl font-bold text-center mb-8">One Way Trip Prices Outstation</h1> */}
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
               <a
                href="/update-root-rate/1to150"
                className="btn btn-secondary text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                1 to 150 Prices
              </a>
               <a
                href="/update-root-rate/etsPrices"
                className="btn btn-secondary text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                ETS Prices
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Pickup Location</label>
              <input
                type="text"
                id="pickup"
                ref={pickupRef}
                placeholder="Enter pickup location (e.g., City, State)"
                className="block w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Drop Location</label>
              <input
                type="text"
                id="drop"
                ref={dropRef}
                placeholder="Enter drop location (e.g., City, State)"
                className="block w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="pt-2">
            {distance && <div>Distance: {distance}</div>}
          </div>

          {/* Service Charge and GST Options */}
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

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Prices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {["hatchback", "sedan", "sedanPremium", "suv", "suvPlus","ertiga"].map((carType) => {
                const basePrice = parseFloat(prices[carType]) || 0;
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
                      min="0"
                      value={prices[carType]}
                      onChange={(e) => setPrices({ ...prices, [carType]: e.target.value })}
                      className="block w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    {/* Vehicle Type Label */}
                    {prices[carType] && (
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

                    {/* Distance-based calculation (existing functionality) */}
                    {prices[carType] && distance && (
                      <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded border">
                        <div className="font-medium">Distance Calculation:</div>
                        <div>Total: {calculateTotal(prices[carType])} (Price × Distance)</div>
                      </div>
                    )}
                  </div>
                );
              })}
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

        <div className="p-2 max-w-xl ">
  <h2 className="text-2xl font-bold mb-4">Excel Job Manager</h2>
  <form onSubmit={handleFileUpload} className="mb-6 flex items-center space-x-4">
    <input
      type="file"
      accept=".xlsx"
      onChange={(e) => setFile(e.target.files[0])}
      className="block"
    />
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="border rounded p-2"
    />
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="border rounded p-2"
    />
    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
     Schedule File
    </button>
  </form>
  
  <div className="mb-4">
    <h3 className="text-lg font-semibold">Scheduled Jobs</h3>
    {jobs.length === 0 ? (
      <p>No jobs scheduled</p>
    ) : (
      <ul className="list-disc pl-5">
        {jobs.map((job, i) => (
          <li key={i} className="mb-1">
            <strong>{job.jobName}</strong> – Next Fire: {job.nextFireTime}
          </li>
        ))}
      </ul>
    )}
  </div>
  
  {jobs.length > 0 && (
    <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={deleteJob}>
      Delete Job & Excel
    </button>
  )}
</div>



        {fileData.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Uploaded File Data</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border border-gray-300">Pickup Location</th>
                  <th className="p-2 border border-gray-300">Drop Location</th>
                  <th className="p-2 border border-gray-300">Hatchback</th>
                  <th className="p-2 border border-gray-300">Sedan</th>
                  <th className="p-2 border border-gray-300">Sedan Premium</th>
                  <th className="p-2 border border-gray-300">SUV</th>
                  <th className="p-2 border border-gray-300">SUV Plus</th>
                </tr>
              </thead>
              <tbody>
                {fileData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="p-2 border border-gray-300">{row.pickupLocation}</td>
                    <td className="p-2 border border-gray-300">{row.dropLocation}</td>
                    <td className="p-2 border border-gray-300">{row.hatchback}</td>
                    <td className="p-2 border border-gray-300">{row.sedan}</td>
                    <td className="p-2 border border-gray-300">{row.sedanPremium}</td>
                    <td className="p-2 border border-gray-300">{row.suv}</td>
                    <td className="p-2 border border-gray-300">{row.suvPlus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tripData.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">One Way Trip Data</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border border-gray-300">Pickup Location</th>
                  <th className="p-2 border border-gray-300">Drop Location</th>
                  <th className="p-2 border border-gray-300">Hatchback Price</th>
                  <th className="p-2 border border-gray-300">Sedan Price</th>
                  <th className="p-2 border border-gray-300">Sedan Premium Price</th>
                  <th className="p-2 border border-gray-300">SUV Price</th>
                  <th className="p-2 border border-gray-300">SUV Plus Price</th>
                  <th className="p-2 border border-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {tripData.map((trip, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="p-2 border border-gray-300">{trip.pickupLocation}</td>
                    <td className="p-2 border border-gray-300">{trip.dropLocation}</td>
                    <td className="p-2 border border-gray-300">{trip.hatchbackPrice}</td>
                    <td className="p-2 border border-gray-300">{trip.sedanPrice}</td>
                    <td className="p-2 border border-gray-300">{trip.sedanPremiumPrice}</td>
                    <td className="p-2 border border-gray-300">{trip.suvPrice}</td>
                    <td className="p-2 border border-gray-300">{trip.suvPlusPrice}</td>
                    <td className="p-2 border border-gray-300">{trip.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default UpdateTripPricing;
