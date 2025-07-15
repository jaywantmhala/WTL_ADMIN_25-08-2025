"use client";
import React, { useEffect, useState } from "react";
import Home from "../../container/components/Navbar";
import axios from "axios";

const Page = () => {
  const [filter, setFilter] = useState("companyName");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vendors, setVendors] = useState([]);
  const [penalties, setPenalties] = useState([]); // Penalties by ID or companyName
  const [showModal, setShowModal] = useState(false);
  const [allPenalties, setAllPenalties] = useState([]); // All penalties
  const [filteredPenalties, setFilteredPenalties] = useState([]); // Penalties filtered by date

  // Fetch all vendors on component mount
  useEffect(() => {
    const getAllVendors = async () => {
      try {
        const response = await axios.get("https://api.worldtriplink.com/vendors/allVendors");
        setVendors(response.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    getAllVendors();
  }, []);

  // Fetch penalties by ID or company name when selectedVendor changes
  useEffect(() => {
    const fetchPenalties = async () => {
      if (selectedVendor) {
        try {
          let url = "";
          if (filter === "id") {
            url = `https://api.worldtriplink.com/getPenalty/${selectedVendor}`; // Fetch by ID
          } else if (filter === "companyName") {
            url = `https://api.worldtriplink.com/getByName/${selectedVendor}`; // Fetch by company name
          }

          const response = await axios.get(url);
          setPenalties(response.data);
        } catch (error) {
          console.error("Error fetching penalties:", error);
        }
      } else {
        setPenalties([]);
      }
    };

    fetchPenalties();
  }, [selectedVendor, filter]);

  // Apply date range filter to penalties or allPenalties
  useEffect(() => {
    if (startDate && endDate) {
      const dataToFilter = showModal ? allPenalties : penalties; // Use allPenalties if modal is open, otherwise use penalties
      const filtered = dataToFilter.filter((penalty) => {
        const penaltyDate = new Date(penalty.date);
        return penaltyDate >= new Date(startDate) && penaltyDate <= new Date(endDate);
      });
      setFilteredPenalties(filtered);
    } else {
      setFilteredPenalties([]); // Reset filteredPenalties if no date range is selected
    }
  }, [startDate, endDate, penalties, allPenalties, showModal]);

  // Handle filter change (companyName or id)
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setSelectedVendor("");
    setStartDate("");
    setEndDate("");
    setPenalties([]);
    setFilteredPenalties([]);
  };

  // Handle vendor selection
  const handleVendorChange = (e) => {
    setSelectedVendor(e.target.value);
  };

  // Fetch all penalties for the modal
  const fetchAllPenalties = async () => {
    try {
      const response = await axios.get("https://api.worldtriplink.com/getAllPenalties");
      setAllPenalties(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching all penalties:", error);
    }
  };

  // Determine which data to display
  const dataToDisplay = showModal
    ? filteredPenalties.length > 0
      ? filteredPenalties
      : allPenalties
    : filteredPenalties.length > 0
    ? filteredPenalties
    : penalties;

  // Calculate total amount
  const totalAmount = dataToDisplay.reduce((sum, penalty) => sum + penalty.amount, 0);

  return (
    <div className="flex h-screen overflow-hidden"> {/* Add h-screen and overflow-hidden to prevent entire page scrolling */}
    <div className="h-full"> {/* Sidebar - fixed height */}
      <Home />
    </div>

    <div className="flex-1 p-10 text-black overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Penalty</h1>

        {/* Filter and Vendor Selection */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700">
              Filter By:
            </label>
            <select
              id="filter"
              name="filter"
              value={filter}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="companyName">By Company Name</option>
              <option value="id">By ID</option>
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">
              Select Vendor:
            </label>
            <select
              id="vendor"
              name="vendor"
              value={selectedVendor}
              onChange={handleVendorChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Select a vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={filter === "companyName" ? vendor.vendorCompanyName : vendor.id}>
                  {filter === "companyName" ? vendor.vendorCompanyName : vendor.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Show All Penalties Button and Date Range Inputs */}
        <div className="mt-6 flex gap-4">
          <button onClick={fetchAllPenalties} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Show All Penalties
          </button>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Display Penalties */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Penalties</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Penalty ID</th>
                <th className="border border-gray-300 px-4 py-2">Booking ID</th>
                <th className="border border-gray-300 px-4 py-2">Amount</th>
                <th className="border border-gray-300 px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {dataToDisplay.map((penalty) => (
                <tr key={penalty.id}>
                  <td className="border border-gray-300 px-4 py-2">{penalty.pId}</td>
                  <td className="border border-gray-300 px-4 py-2">{penalty.booking.bookingId}</td>
                  <td className="border border-gray-300 px-4 py-2">₹{penalty.amount}</td>
                  <td className="border border-gray-300 px-4 py-2">{penalty.date}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 font-bold">
                <td colSpan="2" className="border border-gray-300 px-4 py-2">
                  Total Amount
                </td>
                <td className="border border-gray-300 px-4 py-2">₹{totalAmount}</td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
    
  );
};

export default Page;