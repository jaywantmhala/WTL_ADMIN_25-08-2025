"use client";
import { FaPlus, FaArrowRight } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import Navbar from "../../../container/components/Navbar";
import Outsourceform from "../../../container/components/Outsourceform";
import { useRouter } from "next/navigation";

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Track search input
  const [source, setSource] = useState([]); // State for outsource vehicles
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState(5); // Items per page
  const router = useRouter();

  // Fetch outsource vehicles from the backend
  const fetchSource = async () => {
    try {
      const response = await fetch(" http://localhost:8085/vehicle/all");
      const data = await response.json();
      setSource(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const handleStatusClick = (status) => {
    router.push(`/status/vehicle/${status}`);
  };


  useEffect(() => {
    fetchSource(); // Fetch data on initial render
  }, []);

  // Handle search functionality
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page after search
  };

  // Filter data based on search term
  const filteredData = source.filter(
    (vehicle) =>
      vehicle.vehicleNameAndRegNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleRcNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.carOtherDetails?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Handle "Show" dropdown change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page when items per page changes
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden">
    {/* Sidebar - fixed and not scrollable */}
    <div className="h-full overflow-y-auto">
      <Navbar />
    </div>
    
    {/* Main content - scrollable */}
    <div className="flex-1 overflow-y-auto">
      <div className="text-black">
        <div className="p-6">
          {/* Header Section */}
          <div className="bg-gray-100 p-4 flex items-center justify-between rounded-lg shadow">
            <h2 className="font-semibold text-lg flex items-center">
              <span className="mr-2">🚖</span> All Outsource Details
            </h2>
            <button
              className="border p-2 rounded-md bg-gray-200 hover:bg-gray-300"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus />
            </button>
          </div>

            {/* Modal */}
            <Outsourceform
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSuccess={fetchSource} // Pass the callback to refresh the data
/>

            {/* Status Section */}
            <div className="bg-white p-4 mt-4 rounded-lg shadow">
              <div className="flex space-x-4">
                <button className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center"             
                      onClick={() => handleStatusClick("PENDING")}
                >
                  Pending
                  <span className="ml-2 bg-white text-black px-2 py-0.5 rounded">
                    {source.filter((vehicle) => vehicle.status === "PENDING").length}
                  </span>
                </button>
                <button className="bg-green-600 text-white px-3 py-1 rounded flex items-center"     
                              onClick={() => handleStatusClick("COMPLETED")}
                >
                  Approved
                  <span className="ml-2 bg-white text-black px-2 py-0.5 rounded">
                    {source.filter((vehicle) => vehicle.status === "COMPLETED").length}
                  </span>
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white p-4 mt-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-sm">Show</label>
                  <select
                    className="border rounded p-1 mx-2"
                    onChange={handleItemsPerPageChange}
                    value={itemsPerPage}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                  </select>
                  entries
                </div>
                <div>
                  <label className="text-sm">Search:</label>
                  <input
                    type="text"
                    className="border rounded p-1 ml-2"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search by reg no, RC no, or details"
                  />
                </div>
              </div>

              {/* Table */}
              <table className="w-full border mt-4">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">OutCab Reg.No.</th>
                    <th className="border px-4 py-2">OutCab RC No.</th>
                    <th className="border px-4 py-2">OutCab Img</th>
                    <th className="border px-4 py-2">Other</th>
                    <th className="border px-4 py-2">View</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTableData.length > 0 ? (
                    currentTableData.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="border px-4 py-2">
                          {vehicle.vehicleNameAndRegNo}
                        </td>
                        <td className="border px-4 py-2">
                          {vehicle.vehicleRcNo}
                        </td>
                        <td className="border px-4 py-2">
                          {vehicle.carImage && (
                            <img
                              src={` http://localhost:8085/vehicle/${vehicle.carImage}`}
                              alt="Car"
                              className="w-16 h-16 object-cover"
                            />
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          {vehicle.carOtherDetails}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <button
                            className="p-1 bg-gray-300 rounded-full hover:bg-gray-400"
                            onClick={() =>
                              router.push(`/fleet/outsource/${vehicle.id}`)
                            }
                          >
                            <FaArrowRight />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-500 py-4">
                        No matching results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <span>
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                  {filteredData.length} entries
                </span>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 border rounded bg-gray-200"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 border rounded bg-black text-white">
                    {currentPage}
                  </span>
                  <button
                    className="px-3 py-1 border rounded bg-gray-200"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Page;