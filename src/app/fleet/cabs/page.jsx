"use client";
import { FaPlus, FaArrowRight, FaSpinner } from "react-icons/fa"; // ✅ ADD: FaSpinner import
import React, { useState, useEffect } from "react";
import Navbar from "../../../container/components/Navbar";
import { useRouter } from "next/navigation";
import axios from "axios";

const Page = () => {
  const [formData, setFormData] = useState({
    vehicleNameAndRegNo: "",
    vehicleRcNo: "",
    carOtherDetails: "",
  });

  const [files, setFiles] = useState({
    vehicleRcImg: null,
    insurance: null,
    permit: null,
    fitnessCert: null,
    cabImage: null,
    frontImage: null,
    backImage: null,
    sideImage: null,
  });

  const [cab, setCab] = useState([]);
  const [filteredCab, setFilteredCab] = useState([]); // For search functionality
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // ✅ ADD: Loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default items per page
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles({
      ...files,
      [name]: selectedFiles[0],
    });
  };

  // ✅ UPDATED: Handle submit with loading state
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ START: Set loading to true when submission starts
    setIsLoading(true);

    const data = new FormData();
    data.append("vehicleNameAndRegNo", formData.vehicleNameAndRegNo);
    data.append("vehicleRcNo", formData.vehicleRcNo);
    data.append("carOtherDetails", formData.carOtherDetails);
    data.append("status", "PENDING");

    Object.keys(files).forEach((key) => {
      if (files[key]) {
        data.append(key, files[key]);
      }
    });

    try {
      const response = await axios.post(
        " https://api.worldtriplink.com/cabAdmin/save",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ SUCCESS: Show success popup and close form
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 1000);

      setShowForm(false);
      fetchCabs(); // Fetch updated list of cabs
      
      // ✅ OPTIONAL: Reset form data on success
      setFormData({
        vehicleNameAndRegNo: "",
        vehicleRcNo: "",
        carOtherDetails: "",
      });
      setFiles({
        vehicleRcImg: null,
        insurance: null,
        permit: null,
        fitnessCert: null,
        cabImage: null,
        frontImage: null,
        backImage: null,
        sideImage: null,
      });
      
    } catch (error) {
      // ✅ ERROR: Stop loading and show error message
      console.error("Error saving vehicle:", error);
      alert("Failed to save vehicle. Please try again.");
      setShowForm(false);
    } finally {
      // ✅ FINALLY: Always stop loading regardless of success/error
      setIsLoading(false);
    }
  };

  const fetchCabs = async () => {
    try {
      const response = await axios.get(" https://api.worldtriplink.com/cabAdmin/all");
      setCab(response.data);
      setFilteredCab(response.data); // Initialize filteredCab with all cabs
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  useEffect(() => {
    fetchCabs();
  }, []);

  const complet = cab.filter((cab) => cab.status === "COMPLETED");
  const c = complet.length;

  const pending = cab.filter((cab) => cab.status === "PENDING");
  const p = pending.length;

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showForm]);

  // Handle search functionality
  const handleSearch = (e) => {
    const search = e.target.value;
    if (search) {
      const searchData = cab.filter((data) =>
        data.vehicleNameAndRegNo.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCab(searchData);
      setCurrentPage(1); // Reset to the first page after search
    } else {
      setFilteredCab(cab); // Reset to all cabs if search is empty
    }
  };

  // Handle "Show" dropdown change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page when items per page changes
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCab.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableData = filteredCab.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - fixed and not scrollable */}
        <Navbar className="flex-shrink-0" />
        
        {/* Main content - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="text-black">
            <div className="p-6">
              {/* Rest of your existing content remains exactly the same */}
              <div className="bg-gray-200 p-4 flex items-center justify-between rounded-lg shadow">
                <h2 className="font-semibold text-lg flex items-center">
                  <span className="mr-2">🚖</span> All Cabs Details
                  <button
                    onClick={() => setShowForm(true)}
                    className="ml-4 border p-2 rounded-md bg-gray-200 hover:bg-gray-300"
                  >
                    <FaPlus />
                  </button>
                </h2>
              </div>

              {showSuccessPopup && (
                <div className="fixed top-0 left-0 right-0 z-50">
                  <div className="bg-green-500 text-white p-4 text-center animate-slide-down">
                    Cab saved successfully!
                  </div>
                </div>
              )}

              {showForm && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto relative">
                    
                    {/* ✅ LOADING OVERLAY: Show spinner when loading */}
                    {isLoading && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                        <div className="flex flex-col items-center">
                          <FaSpinner className="animate-spin text-4xl text-blue-500 mb-2" />
                          <span className="text-lg font-medium text-gray-700">Saving Vehicle...</span>
                          <span className="text-sm text-gray-500">Please wait</span>
                        </div>
                      </div>
                    )}

                    <h3 className="text-xl text-center flex items-center justify-center bg-gray-300 p-2 rounded-t-lg h-[80px]">
                      <span className="mr-2">🚖</span> Add Car/Cab Form
                    </h3>
                    <hr className="my-4 border-t-2 border-gray-300" />
                    <form onSubmit={handleSubmit}>
                      <div className="flex items-center mt-4">
                        <label className="w-1/3">Vehicle Name & Reg. No.</label>
                        <input
                          type="text"
                          name="vehicleNameAndRegNo"
                          value={formData.vehicleNameAndRegNo}
                          onChange={handleChange}
                          disabled={isLoading} // ✅ Disable inputs when loading
                          className={`border p-2 w-2/3 rounded-md mt-2 ${
                            isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div className="flex items-center mt-4">
                        <label className="w-1/3">Vehicle RC No.</label>
                        <input
                          type="text"
                          name="vehicleRcNo"
                          value={formData.vehicleRcNo}
                          onChange={handleChange}
                          disabled={isLoading}
                          className={`border p-2 w-1/2 rounded-md mt-2 ${
                            isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                        <input
                          type="file"
                          name="vehicleRcImg"
                          onChange={handleFileChange}
                          disabled={isLoading}
                          className={`border p-2 w-1/2 rounded-md mt-2 ml-2 ${
                            isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div className="flex items-center mt-4">
                        <label className="w-1/3">Insurance</label>
                        <input
                          type="file"
                          name="insurance"
                          onChange={handleFileChange}
                          disabled={isLoading}
                          className={`w-2/3 rounded-md mt-2 ${
                            isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div className="flex items-center mt-4">
                        <label className="w-1/3">Permit</label>
                        <input
                          type="file"
                          name="permit"
                          onChange={handleFileChange}
                          disabled={isLoading}
                          className={`w-2/3 rounded-md mt-2 ${
                            isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div className="flex items-center mt-4">
                        <label className="w-1/3">Fitness Certificate</label>
                        <input
                          type="file"
                          name="fitnessCert"
                          onChange={handleFileChange}
                          disabled={isLoading}
                          className={`w-2/3 rounded-md mt-2 ${
                            isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div className="flex items-center mt-4">
                        <label className="w-1/3">Cab's Image</label>
                        <input
                          type="file"
                          name="cabImage"
                          onChange={handleFileChange}
                          disabled={isLoading}
                          className={`w-2/3 rounded-md mt-2 ${
                            isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div className="flex items-center mt-4">
                        <label className="w-1/3">Front Image</label>
                        <input
                          type="file"
                          name="frontImage"
                          onChange={handleFileChange}
                          disabled={isLoading}
                          className={`w-2/3 rounded-md mt-2 ${
                            isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div className="flex items-center mt-4">
                        <label className="w-1/3">Back Image</label>
                        <input
                          type="file"
                          name="backImage"
                          onChange={handleFileChange}
                          disabled={isLoading}
                          className={`w-2/3 rounded-md mt-2 ${
                            isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div className="flex items-center mt-4">
                        <label className="w-1/3">Side Image</label>
                        <input
                          type="file"
                          name="sideImage"
                          onChange={handleFileChange}
                          disabled={isLoading}
                          className={`w-2/3 rounded-md mt-2 ${
                            isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                      <div className="flex items-center mt-4">
                        <label className="w-1/3">Cab's Other Details</label>
                        <input
                          type="text"
                          name="carOtherDetails"
                          value={formData.carOtherDetails}
                          onChange={handleChange}
                          disabled={isLoading}
                          className={`border p-2 w-2/3 rounded-md mt-2 ${
                            isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          placeholder="Enter Cab's Details"
                        />
                      </div>
                      
                      {/* ✅ UPDATED: Buttons with loading state */}
                      <div className="flex justify-center mt-6 space-x-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                            isLoading
                              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                              : 'bg-blue-500 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <FaSpinner className="animate-spin mr-2" />
                              Saving...
                            </div>
                          ) : (
                            'Submit'
                          )}
                        </button>
                        
                        <button
                          type="reset"
                          disabled={isLoading}
                          className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                            isLoading
                              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                              : 'bg-green-500 hover:bg-green-700 text-white'
                          }`}
                        >
                          Reset
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          disabled={isLoading}
                          className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                            isLoading
                              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                              : 'bg-red-500 hover:bg-red-700 text-white'
                          }`}
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md">
                  <img
                    src="https://imgd.aeplcdn.com/600x337/n/cw/ec/159099/swift-exterior-right-front-three-quarter.jpeg?isig=0&q=80"
                    alt="Hatchback"
                    className="w-full h-32 object-cover mb-2 rounded-md"
                  />
                  <h3 className="font-semibold text-lg">Hatchback</h3>
                  <p className="text-sm text-gray-600">3 +1 Seater</p>
                </div>
                <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md">
                  <img
                    src={`https://imgd.aeplcdn.com/600x337/n/cw/ec/127563/alto-k10-exterior-right-front-three-quarter-58.jpeg?isig=0&q=80`}
                    alt="Sedan"
                    className="w-full h-32 object-cover mb-2 rounded-md"
                  />
                  <h3 className="font-semibold text-lg">Hatchback</h3>
                  <p className="text-sm text-gray-600">3+1 Seater</p>
                </div>
                <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md">
                  <img
                    src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8l-ScnpWkIhxbxk_IbShOPh9opks7jOyLJQ&s`}
                    alt="SUV"
                    className="w-full h-32 object-cover mb-2 rounded-md"
                  />
                  <h3 className="font-semibold text-lg">Seden</h3>
                  <p className="text-sm text-gray-600">4+1 Seater</p>
                </div>
                <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md">
                  <img
                    src={`https://imgd-ct.aeplcdn.com/664x374/n/cw/ec/41160/tigor-exterior-right-front-three-quarter-21.jpeg?isig=0&q=80`}
                    alt="SUV+"
                    className="w-full h-32 object-cover mb-2 rounded-md"
                  />
                  <h3 className="font-semibold text-lg">Seden</h3>
                  <p className="text-sm text-gray-600">4+1 Seater</p>
                </div>
              </div>

              <div className="bg-white p-4 mt-6 rounded-lg shadow-lg">
                <div className="flex space-x-4">
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center shadow-sm"
                    onClick={() => router.push(`/status/cabs/PENDING`)}
                  >
                    Pending{" "}
                    <span className="ml-2 bg-white text-black px-2 py-0.5 rounded">
                      {p}
                    </span>
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center shadow-sm"
                    onClick={() => router.push(`/status/cabs/COMPLETED`)}
                  >
                    Approved{" "}
                    <span className="ml-2 bg-white text-black px-2 py-0.5 rounded">
                      {c}
                    </span>
                  </button>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <p className="font-semibold mr-2">Show</p>
                    <select
                      className="border p-2 rounded-md shadow-sm"
                      onChange={handleItemsPerPageChange}
                      value={itemsPerPage}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="20">20</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm">Search:</label>
                    <input
                      type="text"
                      className="border rounded p-1 ml-2"
                      onChange={handleSearch}
                      placeholder="Search by vehicle name"
                    />
                  </div>
                </div>
                <br></br>
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border px-4 py-2">Vcl Name</th>
                      <th className="border px-4 py-2">Vcl Reg.No</th>
                      <th className="border px-4 py-2">Insurance</th>
                      <th className="border px-4 py-2">Documents</th>
                      <th className="border px-4 py-2">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTableData.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                      >
                        <td className="border px-4 py-2">{row.vehicleName}</td>
                        <td className="border px-4 py-2">
                          {row.vehicleNameAndRegNo}
                        </td>
                        <td className="border px-4 py-2">
                          {" "}
                          {row.insurance ? "Available" : "Pending"}
                        </td>
                        <td className="border px-4 py-2">
                          {row.permit &&
                          row.fitnessCert &&
                          row.cabImage &&
                          row.frontImage &&
                          row.backImage &&
                          row.sideImage
                            ? "Available"
                            : "Pending"}
                        </td>
                        <td className="border px-4 py-2 flex justify-center">
                          <button
                            className="border rounded-full p-2 flex items-center justify-center"
                            onClick={() => router.push(`/fleet/arrow/${row.id}`)}
                          >
                            <FaArrowRight />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-4 py-2 border rounded-md"
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <span className="px-4 py-2 bg-blue-900 text-white rounded-md">
                  {currentPage}
                </span>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-4 py-2 border rounded-md"
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;