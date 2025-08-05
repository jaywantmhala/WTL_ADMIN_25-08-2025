"use client";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import Navbar from "../../../container/components/Navbar";
import AddDriverModal from "../../../container/components/AddDriverModal";
import { useRouter } from "next/navigation";

// Dummy Data
const dData = [
  {
    drivers: "Driver 1",
    driversName: "John Doe",
    contactNo: "+91 9876543210",
    dlNo: "DL1234567890",
    pvcNo: "PVC0987654321",
    emailId: "john.doe@example.com",
    address: "123 Main St, New Delhi, India",
    status: "Active",
  },
  {
    drivers: "Driver 2",
    driversName: "Jane Smith",
    contactNo: "+91 8765432109",
    dlNo: "DL0987654321",
    pvcNo: "PVC1234567890",
    emailId: "jane.smith@example.com",
    address: "456 Park Ave, Mumbai, India",
    status: "Inactive",
  },
  {
    drivers: "Driver 3",
    driversName: "Rahul Sharma",
    contactNo: "+91 9123456789",
    dlNo: "DL5678901234",
    pvcNo: "PVC4567890123",
    emailId: "rahul.sharma@example.com",
    address: "789 Sector 15, Gurgaon, India",
    status: "Active",
  },
  {
    drivers: "Driver 4",
    driversName: "Aisha Khan",
    contactNo: "+91 9012345678",
    dlNo: "DL3456789012",
    pvcNo: "PVC6789012345",
    emailId: "aisha.khan@example.com",
    address: "321 MG Road, Bangalore, India",
    status: "Inactive",
  },
];

const page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [driversData, setDriversData] = useState(dData);
  const [filteredDrivers, setFilteredDrivers] = useState(dData); // For search functionality
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default items per page
  const router = useRouter();

  // Fetch drivers from the backend
  const [driver, setDriver] = useState([]);

  const fetchDrivers = async () => {
    try {
      const response = await fetch(" https://api.worldtriplink.com/driverAdmin/all");
      const data = await response.json();
      setDriver(data);
      setFilteredDrivers(data); // Initialize filteredDrivers with all drivers
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Handle search functionality
  const handleSearch = (e) => {
    const search = e.target.value;
    if (search) {
      const searchData = driver.filter((data) =>
        data.driverName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredDrivers(searchData);
      setCurrentPage(1); // Reset to the first page after search
    } else {
      setFilteredDrivers(driver); // Reset to all drivers if search is empty
    }
  };

  // Handle "Show" dropdown change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page when items per page changes
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableData = filteredDrivers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle status click
  const handleStatusClick = (status) => {
    router.push(`/status/drivers/${status}`);
  };

  // Count completed and pending drivers
  const complet = driver.filter((driver) => driver.status === "COMPLETED");
  const c = complet.length;

  const pending = driver.filter((driver) => driver.status === "PENDING");
  const p = pending.length;

  return (
    <>
      <div className="flex h-screen overflow-hidden">
      {/* Sidebar - fixed and not scrollable */}
      <Navbar className="flex-shrink-0" />
      
      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="text-black">
          <div className="p-6">
            {/* Header Section */}
            <div className="bg-gray-100 p-4 flex items-center justify-between rounded-lg shadow">
              <h2 className="font-semibold text-lg flex items-center">
                <span className="mr-2">🚖</span> All Drivers Details
              </h2>
              <button
                className="border p-2 rounded-md bg-gray-200 hover:bg-gray-300"
                onClick={() => setIsModalOpen(true)}
              >
                <FaPlus />
              </button>
              <AddDriverModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchDrivers}
              />
            </div>

            {/* Status Section */}
            <div className="bg-white p-4 mt-4 rounded-lg shadow">
              <div className="flex space-x-4">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center"
                  onClick={() => handleStatusClick("PENDING")}
                >
                  Pending{" "}
                  <span className="ml-2 bg-white text-black px-2 py-0.5 rounded">
                    {p}
                  </span>
                </button>
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded flex items-center"
                  onClick={() => handleStatusClick("COMPLETED")}
                >
                  Approved{" "}
                  <span className="ml-2 bg-white text-black px-2 py-0.5 rounded">
                    {c}
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
                    onChange={handleSearch}
                    placeholder="Search by driver name"
                  />
                </div>
              </div>

              {/* Table */}
              <table className="w-full border mt-4">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Drivers</th>
                    <th className="border px-4 py-2">Drivers Name</th>
                    <th className="border px-4 py-2">Contact No.</th>
                    <th className="border px-4 py-2">DL NO.</th>
                    <th className="border px-4 py-2">PVC NO.</th>
                    <th className="border px-4 py-2">Email_id</th>
                    <th className="border px-4 py-2">Address</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTableData.map((data, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{data.drivers}</td>
                      <td className="border px-4 py-2">{data.driverName}</td>
                      <td className="border px-4 py-2">{data.contactNo}</td>
                      <td className="border px-4 py-2">{data.drLicenseNo}</td>
                      <td className="border px-4 py-2 text-center">
                        {data.pvcNo2}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {data.emailId}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {data.adress}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {data.status}
                      </td>
                      <td className="border px-4 py-2 flex justify-center">
                        <button
                          className="border rounded-full p-2 flex items-center justify-center"
                          onClick={() => router.push(`/fleet/drivers/${data.id}`)}
                        >
                          <FaArrowRight />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <span>
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredDrivers.length)} of{" "}
                  {filteredDrivers.length} entries
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

export default page;