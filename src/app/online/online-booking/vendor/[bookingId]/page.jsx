"use client";

import Layout from "@/container/components/Navbar";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import $ from "jquery";
import { FaSpinner } from "react-icons/fa"; // ✅ ADD: FaSpinner import
import Navbar from "../../../../../container/components/Navbar";
import * as XLSX from "xlsx";

const Page = () => {
  const { bookingId } = useParams();
  const router = useRouter();
  console.log("Booking id from useParams:", bookingId);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [booking, setBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // State to control modal visibility

  // State for Vendor Cab and Driver
  const [vendorCab, setVendorCab] = useState({ isOpen: false }); // Add isOpen property
  const [vendorDriver, setVendorDriver] = useState({ isOpen: false });
  const [vendor, setVendor] = useState({ isOpen: false }); // Add isOpen property

  // State for Admin Cab and Driver accordions
  const [adminCab, setAdminCab] = useState({ isOpen: false });
  const [adminDriver, setAdminDriver] = useState({ isOpen: false });

  // Modals for assigning vendor/driver/cab
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isCabModalOpen, setIsCabModalOpen] = useState(false);
  const [cabAdmin, setCabAdmin] = useState([]);
  const [driverAdmin, setDriverAdmin] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ ADD: Loading states for different operations
  const [isAssigningVendor, setIsAssigningVendor] = useState(false);
  const [isAssigningCab, setIsAssigningCab] = useState(false);
  const [isAssigningDriver, setIsAssigningDriver] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Fetch booking details once when bookingId is available
  useEffect(() => {
    if (bookingId) {
      setLoading(true);
      setError(null);
      fetch(`http://localhost:8085/booking/${bookingId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error fetching booking details");
          return res.json();
        })
        .then((data) => {
          setBooking(data);
          // Simulate fetching vendor cab and driver details (replace with actual API calls)
          setVendorCab((prev) => ({ ...prev, ...data.vendorCab }));
          setVendorDriver((prev) => ({ ...prev, ...data.vendorDriver }));
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [bookingId]);

  const [vendors, setVendors] = useState([]); // Initialize vendors as an empty array

  console.log(booking);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch("http://localhost:8085/vendors/allVendors");

        // Check if the response is OK (status 200)
        if (!response.ok) {
          throw new Error("Failed to fetch vendors");
        }

        const data = await response.json();
        setVendors(data); // Update state with the fetched data
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchVendors();
  }, []);

  console.log(vendors);

  // ✅ UPDATED: Handle assign vendor with loading state
  const handleAssignVendor = async (vendorId) => {
    if (isAssigningVendor) return; // Prevent multiple submissions
    setIsAssigningVendor(true);
    
    try {
      // Make the PUT request to assign the vendor
      const response = await axios.put(
        `http://localhost:8085/${bookingId}/assignVendor/${vendorId}`
      );

      // Handle the successful response (booking updated)
      alert("Vendor assigned successfully!");
      handleUpdateStatus(0);

      setIsVendorModalOpen(false); // Close the modal after successful assignment
    } catch (error) {
      console.error("Error assigning vendor:", error);
      alert("Failed to assign vendor.");
    } finally {
      setIsAssigningVendor(false);
    }
  };

  // ✅ UPDATED: Handle assign cab with loading state
  const handleAssignCab = async (cabAdminId) => {
    if (isAssigningCab) return; // Prevent multiple submissions
    setIsAssigningCab(true);
    
    try {
      // Make the PUT request to assign the cab
      const response = await axios.put(
        `http://localhost:8085/${bookingId}/assignCabAdmin/${cabAdminId}`
      );

      // Handle the successful response (booking updated)
      alert("Cab assigned successfully!");
      handleUpdateStatus(0);

      setIsCabModalOpen(false); // Close the modal after successful assignment
    } catch (error) {
      console.error("Error assigning cab:", error);
      alert("Failed to assign cab.");
    } finally {
      setIsAssigningCab(false);
    }
  };

  // ✅ UPDATED: Handle assign driver with loading state
  const handleAssignDriver = async (driverAdminId) => {
    if (isAssigningDriver) return; // Prevent multiple submissions
    setIsAssigningDriver(true);
    
    try {
      // Make the PUT request to assign the driver
      const response = await axios.put(
        `http://localhost:8085/${bookingId}/assignDriveAdmin/${driverAdminId}`
      );

      // Handle the successful response (booking updated)
      alert("Driver assigned successfully!");
      handleUpdateStatus(0);

      setIsDriverModalOpen(false); // Close the modal after successful assignment
    } catch (error) {
      console.error("Error assigning driver:", error);
      alert("Failed to assign driver.");
    } finally {
      setIsAssigningDriver(false);
    }
  };

  // ✅ UPDATED: Handle update status with loading state
  const handleUpdateStatus = async (newStatus) => {
    if (isUpdatingStatus) return; // Prevent multiple submissions
    setIsUpdatingStatus(true);
    
    try {
      const response = await axios.put(
        `http://localhost:8085/${bookingId}/status`,
        { status: newStatus } // Send the new status in the request body
      );
      setBooking(response.data); // Update the booking status in state
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ✅ UPDATED: Handle complete with loading state
  const handleComplete = () => {
    if (isUpdatingStatus) return;
    if (window.confirm("Are you sure you want to mark the trip complete?")) {
      setIsUpdatingStatus(true);
      fetch(`http://localhost:8085/complete-trip/${bookingId}`, {
        method: "POST",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Trip complete failed");
          return res.text();
        })
        .then((message) => {
          alert(message);
          setBooking((prev) => (prev ? { ...prev, status: 1 } : prev));
        })
        .catch((err) => alert(err.message))
        .finally(() => setIsUpdatingStatus(false));
    }
  };

  const getCabAdmin = async () => {
    try {
      const response = await axios.get("http://localhost:8085/cabAdmin/all");
      setCabAdmin(response.data);
    } catch (error) {
      console.error("Error fetching cab admin data:", error);
    }
  };

  useEffect(() => {
    getCabAdmin();
  }, []);

  console.log(cabAdmin);

  const getDriverAdmin = async () => {
    try {
      const response = await axios.get("http://localhost:8085/driverAdmin/all");
      setDriverAdmin(response.data);
    } catch (error) {
      console.error("Error fetching driver admin data:", error);
    }
  };

  useEffect(() => {
    getDriverAdmin();
  }, []);

  // ✅ UPDATED: Handle cancel with loading state
  const handleCancel = () => {
    if (isUpdatingStatus) return;
    if (window.confirm("Are you sure you want to cancel the trip?")) {
      setIsUpdatingStatus(true);
      fetch(`http://localhost:8085/cancel-trip/${bookingId}`, {
        method: "POST",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Cancellation failed");
          return res.text();
        })
        .then((message) => {
          alert(message);
          setBooking((prev) => (prev ? { ...prev, status: 2 } : prev));
        })
        .catch((err) => alert(err.message))
        .finally(() => setIsUpdatingStatus(false));
    }
  };

  // For accordion
  const [vendorCabOpen, setVendorCabOpen] = useState(false);
  const [vendorDriverOpen, setVendorDriverOpen] = useState(false);

  // Toggle Vendor Cab Accordion
  const toggleVendorCab = () => {
    setVendorCabOpen(!vendorCabOpen);
    // jQuery slide animation
    if (!vendorCabOpen) {
      $(".vendor-cab-content").slideDown();
      $(".vendor-cab-icon").text("▲");
    } else {
      $(".vendor-cab-content").slideUp();
      $(".vendor-cab-icon").text("▼");
    }
  };

  // Toggle Vendor Driver Accordion
  const toggleVendorDriver = () => {
    setVendorDriverOpen(!vendorDriverOpen);
    // jQuery slide animation
    if (!vendorDriverOpen) {
      $(".vendor-driver-content").slideDown();
      $(".vendor-driver-icon").text("▲");
    } else {
      $(".vendor-driver-content").slideUp();
      $(".vendor-driver-icon").text("▼");
    }
  };

  const handleDownloadExcel = () => {
    if (!booking) return;
    // Prepare rows for Excel
    const rows = [
      ["Field", "Value"],
      ["Booking ID", booking.bookingId || ""],
      ["Name", booking.name || ""],
      ["Email", booking.email || ""],
      ["Phone", booking.phone || ""],
      ["From Location", booking.fromLocation || ""],
      ["To Location", booking.toLocation || ""],
      ["Trip Type", formatTripType(booking.tripType) || ""],
      ["Start Date", booking.startDate || ""],
      ["Return Date", booking.returnDate || "N/A"],
      ["Time", booking.time || ""],
      ["Collection", booking.collection || ""],
      ["Amount", booking.amount || ""],
      ["GST", booking.gst || ""],
      ["Service Charge", booking.serviceCharge || ""],
      ["Car", booking.car || ""],
      ["Status", booking.status === 0 ? "Pending" : booking.status === 1 ? "Confirmed" : booking.status === 2 ? "Cancelled" : "Unknown"],
      ["Booking Type", booking.bookingType || ""],
      ["Description", booking.description || ""],
      // Vendor Info
      ["Vendor ID", booking.vendor?.id || ""],
      ["Vendor Name", booking.vendor?.vendorCompanyName || ""],
      ["Vendor Email", booking.vendor?.vendorEmail || ""],
      ["Vendor Contact No", booking.vendor?.contactNo || ""],
      // Vendor Cab Info
      ["Vendor Cab ID", booking.vendorCab?.vendorCabId || ""],
      ["Vendor Cab Model", booking.vendorCab?.carName || ""],
      ["Vendor Cab License Plate", booking.vendorCab?.rCNo || ""],
      // Vendor Driver Info
      ["Vendor Driver ID", booking.vendorDriver?.vendorDriverId || ""],
      ["Vendor Driver Name", booking.vendorDriver?.driverName || ""],
      ["Vendor Driver Contact No", booking.vendorDriver?.contactNo || ""],
      // Admin Cab Info
      ["Admin Cab ID", booking.cabAdmin?.id || ""],
      ["Admin Cab Vehicle Name/Reg No", booking.cabAdmin?.vehicleNameAndRegNo || ""],
      ["Admin Cab RC No", booking.cabAdmin?.vehicleRcNo || ""],
      ["Admin Cab Other Details", booking.cabAdmin?.carOtherDetails || ""],
      ["Admin Cab Status", booking.cabAdmin?.status || ""],
      // Admin Driver Info
      ["Admin Driver ID", booking.driverAdmin?.id || ""],
      ["Admin Driver Name", booking.driverAdmin?.driverName || ""],
      ["Admin Driver Contact No", booking.driverAdmin?.contactNo || ""],
      ["Admin Driver Alt Mobile", booking.driverAdmin?.altMobNum || ""],
      ["Admin Driver Email", booking.driverAdmin?.emailId || ""]
    ];

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(rows);
    // Set column widths for readability
    ws["!cols"] = [{ wch: 25 }, { wch: 50 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Booking Details");
    // Download
    XLSX.writeFile(wb, `Booking_${booking.bookingId || "details"}.xlsx`);
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [editBooking, setEditBooking] = useState(null);

  // Add refs for Google Places Autocomplete in edit modal
  const fromLocationRef = useRef(null);
  const toLocationRef = useRef(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Load Google Maps API when edit modal is opened
  useEffect(() => {
    if (isEditMode) {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCelDo4I5cPQ72TfCTQW-arhPZ7ALNcp8w&libraries=places";
        script.async = true;
        script.onload = () => setGoogleMapsLoaded(true);
        document.head.appendChild(script);
      } else {
        setGoogleMapsLoaded(true);
      }
    }
  }, [isEditMode]);

  // Initialize Places Autocomplete for edit modal fields
  useEffect(() => {
    if (isEditMode && googleMapsLoaded && window.google) {
      if (fromLocationRef.current) {
        const fromAutocomplete = new window.google.maps.places.Autocomplete(fromLocationRef.current, { types: ["geocode"] });
        fromAutocomplete.addListener("place_changed", () => {
          const place = fromAutocomplete.getPlace();
          setEditBooking((prev) => ({ ...prev, fromLocation: place.formatted_address || place.name || "" }));
        });
      }
      if (toLocationRef.current) {
        const toAutocomplete = new window.google.maps.places.Autocomplete(toLocationRef.current, { types: ["geocode"] });
        toAutocomplete.addListener("place_changed", () => {
          const place = toAutocomplete.getPlace();
          setEditBooking((prev) => ({ ...prev, toLocation: place.formatted_address || place.name || "" }));
        });
      }
    }
  }, [isEditMode, googleMapsLoaded]);

  // ✅ UPDATED: Handle save edit with loading state
  const handleSaveEdit = async () => {
    if (!editBooking || isSavingEdit) return;
    setIsSavingEdit(true);
    
    try {
      // Remove nested objects
      const { vendor, vendorCab, vendorDriver, cabAdmin, driverAdmin, ...flatBooking } = editBooking;

      // Ensure only fields present in BookingDTO are sent, and all required fields are included.
      // Remove undefined fields and convert empty strings to null if needed
      const payload = {};
      Object.keys(flatBooking).forEach((key) => {
        // Only include fields with non-undefined values
        if (flatBooking[key] !== undefined) {
          payload[key] = flatBooking[key] === "" ? null : flatBooking[key];
        }
      });

      // Optionally, log the payload to debug
      console.log("Sending to backend:", payload);

      const response = await axios.put(`http://localhost:8085/updateBooking/${bookingId}`, payload);
      setBooking(response.data);
      setIsEditMode(false);
      alert("Booking updated successfully!");
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  if (loading) return <div style={{padding: 32}}>Loading booking data...</div>;
  if (error) return <div style={{color: 'red', padding: 32}}>Error: {error}</div>;
  if (!booking) return <div style={{padding: 32}}>No booking found.</div>;

  // Function to format trip type, moved out of JSX to avoid regex parsing issues
  const formatTripType = (tripType) => {
    if (!tripType) return "";
    return tripType
      .replace(/[- ]/g, "") // Remove hyphens and spaces
      .replace(/^./, (match) => match.toUpperCase()); // Capitalize the first letter
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>
      {/* Main Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 py-4">
        {/* Row 1: Assignment Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-4">
          <button
            onClick={() => setIsVendorModalOpen(true)}
            disabled={isAssigningVendor || (!!booking?.driverAdmin && !!booking?.cabAdmin)}
            className={`px-4 py-2 rounded font-medium transition duration-200 ${
              isAssigningVendor || (!!booking?.driverAdmin && !!booking?.cabAdmin)
                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
            title={booking?.driverAdmin ? "You can't assign this booking to vendor, you already assign self cab and driver" : ""}
          >
            {isAssigningVendor ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Assigning...
              </div>
            ) : (
              'Assign Vendor'
            )}
          </button>
          
          <button
            onClick={() => setIsDriverModalOpen(true)}
            disabled={isAssigningDriver || !!booking?.driverAdmin}
            className={`px-4 py-2 rounded font-medium transition duration-200 ${
              isAssigningDriver || !!booking?.driverAdmin
                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            title={booking?.driverAdmin ? "Driver is already assigned by Admin" : ""}
          >
            {isAssigningDriver ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Assigning...
              </div>
            ) : (
              'Assign Driver'
            )}
          </button>
          
          <button
            onClick={() => setIsCabModalOpen(true)}
            disabled={isAssigningCab || !!booking?.cabAdmin}
            className={`px-4 py-2 rounded font-medium transition duration-200 ${
              isAssigningCab || !!booking?.cabAdmin
                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                : "bg-yellow-600 hover:bg-yellow-700 text-white"
            }`}
            title={booking?.cabAdmin ? "Cab is already assigned by Admin" : ""}
          >
            {isAssigningCab ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Assigning...
              </div>
            ) : (
              'Assign Cab'
            )}
          </button>
          
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download Excel
          </button>
        </div>

        {/* Vendor Modal */}
        {isVendorModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
              
              {/* ✅ LOADING OVERLAY: Show spinner when assigning vendor */}
              {isAssigningVendor && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-500 mb-2" />
                    <span className="text-lg font-medium text-gray-700">Assigning Vendor...</span>
                    <span className="text-sm text-gray-500">Please wait</span>
                  </div>
                </div>
              )}
              
              <h2 className="text-xl font-bold mb-4">Assign Vendor</h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border px-4 py-2">Vendor Id</th>
                      <th className="border px-4 py-2">Vendor Company Name</th>
                      <th className="border px-4 py-2">Contact No</th>
                      <th className="border px-4 py-2">Email</th>
                      <th className="border px-4 py-2">Address</th>
                      <th className="border px-4 py-2">Assign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                      >
                        <td className="border px-4 py-2">{row.id}</td>
                        <td className="border px-4 py-2">{row.vendorCompanyName}</td>
                        <td className="border px-4 py-2">{row.contactNo}</td>
                        <td className="border px-4 py-2">{row.vendorEmail}</td>
                        <td className="border px-4 py-2">{row.city}</td>
                        <td className="border px-4 py-2 flex justify-center">
                          {booking.vendor && booking.vendor.id === row.id ? (
                            <div className="flex flex-col items-center">
                              <button
                                className="border rounded-full p-2 flex items-center justify-center bg-red-700 cursor-not-allowed"
                                disabled
                                title={
                                  booking.status === 5
                                    ? "This booking is cancel by this vendor. You can't assign them again."
                                    : "This booking is already assigned to a vendor. You can't assign them again."
                                }
                              >
                                Assign
                              </button>
                            </div>
                          ) : (
                            <button
                              className={`border rounded-full p-2 flex items-center justify-center ${
                                isAssigningVendor ? 'bg-gray-200 cursor-not-allowed' : 'hover:bg-gray-100'
                              }`}
                              onClick={() => handleAssignVendor(row.id)}
                              disabled={isAssigningVendor}
                            >
                              Assign
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => setIsVendorModalOpen(false)}
                disabled={isAssigningVendor}
                className={`mt-4 px-4 py-2 rounded w-full sm:w-auto ${
                  isAssigningVendor
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Assign Cab Modal */}
        {isCabModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
              
              {/* ✅ LOADING OVERLAY: Show spinner when assigning cab */}
              {isAssigningCab && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-500 mb-2" />
                    <span className="text-lg font-medium text-gray-700">Assigning Cab...</span>
                    <span className="text-sm text-gray-500">Please wait</span>
                  </div>
                </div>
              )}
              
              <h2 className="text-xl font-bold mb-4">Assign Admin Cab</h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border px-4 py-2">Cab Id</th>
                      <th className="border px-4 py-2">Vehicle Name/Registration No</th>
                      <th className="border px-4 py-2">Vehicle RC.No</th>
                      <th className="border px-4 py-2">Other Details</th>
                      <th className="border px-4 py-2">Status</th>
                      <th className="border px-4 py-2">Assign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cabAdmin.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                      >
                        <td className="border px-4 py-2">{row.id}</td>
                        <td className="border px-4 py-2">{row.vehicleNameAndRegNo}</td>
                        <td className="border px-4 py-2">{row.vehicleRcNo}</td>
                        <td className="border px-4 py-2">{row.carOtherDetails}</td>
                        <td className="border px-4 py-2">{row.status}</td>
                        <td className="border px-4 py-2 flex justify-center">
                          {booking.cabAdmin && booking.cabAdmin.id === row.id ? (
                            <div className="flex flex-col items-center">
                              <button
                                className="border rounded-full p-2 flex items-center justify-center bg-gray-300 cursor-not-allowed"
                                disabled
                                title={
                                  booking.status === 5
                                    ? "This booking is cancel by this vendor. You can't assign them again."
                                    : "This booking is already assigned to a cab. You can't assign them again."
                                }
                              >
                                Assign
                              </button>
                            </div>
                          ) : (
                            <button
                              className={`border rounded-full p-2 flex items-center justify-center ${
                                isAssigningCab ? 'bg-gray-200 cursor-not-allowed' : 'hover:bg-gray-100'
                              }`}
                              onClick={() => handleAssignCab(row.id)}
                              disabled={isAssigningCab}
                            >
                              Assign
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => setIsCabModalOpen(false)}
                disabled={isAssigningCab}
                className={`mt-4 px-4 py-2 rounded w-full sm:w-auto ${
                  isAssigningCab
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Assign Driver Modal */}
        {isDriverModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
              
              {/* ✅ LOADING OVERLAY: Show spinner when assigning driver */}
              {isAssigningDriver && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-500 mb-2" />
                    <span className="text-lg font-medium text-gray-700">Assigning Driver...</span>
                    <span className="text-sm text-gray-500">Please wait</span>
                  </div>
                </div>
              )}
              
              <h2 className="text-xl font-bold mb-4">Assign Driver</h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border px-4 py-2">Driver Id</th>
                      <th className="border px-4 py-2">Driver Name</th>
                      <th className="border px-4 py-2">Contact No</th>
                      <th className="border px-4 py-2">Alternate Contact No</th>
                      <th className="border px-4 py-2">Email</th>
                      <th className="border px-4 py-2">Assign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverAdmin.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                      >
                        <td className="border px-4 py-2">{row.id}</td>
                        <td className="border px-4 py-2">{row.driverName}</td>
                        <td className="border px-4 py-2">{row.contactNo}</td>
                        <td className="border px-4 py-2">{row.altMobNum}</td>
                        <td className="border px-4 py-2">{row.emailId}</td>
                        <td className="border px-4 py-2 flex justify-center">
                          {booking.driverAdmin && booking.driverAdmin.id === row.id ? (
                            <div className="flex flex-col items-center">
                              <button
                                className="border rounded-full p-2 flex items-center justify-center bg-gray-300 cursor-not-allowed"
                                disabled
                                title={
                                  booking.status === 5
                                    ? "This booking is cancel by this vendor. You can't assign them again."
                                    : "This booking is already assigned to a driver. You can't assign them again."
                                }
                              >
                                Assign
                              </button>
                            </div>
                          ) : (
                            <button
                              className={`border rounded-full p-2 flex items-center justify-center ${
                                isAssigningDriver ? 'bg-gray-200 cursor-not-allowed' : 'hover:bg-gray-100'
                              }`}
                              onClick={() => handleAssignDriver(row.id)}
                              disabled={isAssigningDriver}
                            >
                              Assign
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => setIsDriverModalOpen(false)}
                disabled={isAssigningDriver}
                className={`mt-4 px-4 py-2 rounded w-full sm:w-auto ${
                  isAssigningDriver
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Minimal Booking Summary */}
        {booking && (
          <div className="bg-white p-2 sm:p-4 rounded shadow-md mb-4 overflow-x-auto">
            <h2 className="text-base sm:text-lg font-bold mb-2">Client's Booking Summary</h2>
            <table className="w-full text-xs sm:text-sm border border-gray-300">
              <tbody>
                <tr className="border-b">
                  <th className="p-2 w-40 bg-gray-100">Booking ID</th>
                  <td className="p-2">{booking.bookingId}</td>
                </tr>
                <tr className="border-b">
                  <th className="p-2 bg-gray-100">Name</th>
                  <td className="p-2">{booking.name}</td>
                </tr>
                <tr className="border-b">
                  <th className="p-2 bg-gray-100">PickUp</th>
                  <td className="p-2">{booking.fromLocation}</td>
                </tr>
                <tr className="border-b">
                  <th className="p-2 bg-gray-100">Drop</th>
                  <td className="p-2">{booking.toLocation}</td>
                </tr>
                <tr className="border-b">
                  <th className="p-2 bg-gray-100">Trip Type</th>
                  <td className="p-2">{formatTripType(booking.tripType)}</td>
                </tr>
                <tr className="border-b">
                  <th className="p-2 bg-gray-100">Start Date</th>
                  <td className="p-2">{booking.startDate}</td>
                </tr>
                <tr className="border-b">
                  <th className="p-2 bg-gray-100">Return Date</th>
                  <td className="p-2">{booking.returnDate || "N/A"}</td>
                </tr>
                <tr className="border-b">
                  <th className="p-2 bg-gray-100">Time</th>
                  <td className="p-2">{booking.time}</td>
                </tr>
                {booking.bookingType === "custom_booking" ? (
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Collection</th>
                    <td className="p-2">{booking.collection}</td>
                  </tr>
                ) : null}
                <tr className="border-b">
                  <th className="p-2 bg-gray-100">Amount</th>
                  <td className="p-2">{booking.amount}</td>
                </tr>
                <tr className="border-b">
                  <th className="p-2 bg-gray-100">GST</th>
                  <td className="p-2">{booking.gst}</td>
                </tr>
                <tr className="border-b">
                  <th className="p-2 bg-gray-100">Service Charge</th>
                  <td className="p-2">{booking.serviceCharge}</td>
                </tr>
                <tr className="border-b">
                  <th className="p-2 bg-gray-100">Car</th>
                  <td className="p-2">{booking.car || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {booking && booking.vendor && (
          <div className="space-y-4">
            {/* Vendor Details Accordion */}
            <div className="bg-white p-4 rounded shadow-md">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setVendor((prev) => ({ ...prev, isOpen: !prev.isOpen }))}
              >
                <h2 className="text-lg font-bold">Vendor Details</h2>
                <span>{vendor.isOpen ? "▲" : "▼"}</span>
              </div>
              {vendor.isOpen && (
                <div className="mt-4">
                  {booking?.vendor ? (
                    <table className="w-full text-sm border border-gray-300">
                      <tbody>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Vendor ID</th>
                          <td className="p-2">{booking.vendor.id}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Company Name</th>
                          <td className="p-2">{booking.vendor.vendorCompanyName}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Email</th>
                          <td className="p-2">{booking.vendor.vendorEmail}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Contact No</th>
                          <td className="p-2">{booking.vendor.contactNo}</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">Not Assigned Yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Vendor Cab Accordion */}
            <div className="bg-white p-4 rounded shadow-md">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setVendorCab((prev) => ({ ...prev, isOpen: !prev.isOpen }))}
              >
                <h2 className="text-lg font-bold">Vendor Cab</h2>
                <span>{vendorCab.isOpen ? "▲" : "▼"}</span>
              </div>
              {vendorCab.isOpen && (
                <div className="mt-4">
                  {booking?.vendorCab ? (
                    <table className="w-full text-sm border border-gray-300">
                      <tbody>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Cab ID</th>
                          <td className="p-2">{booking.vendorCab.vendorCabId}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Cab Model</th>
                          <td className="p-2">{booking.vendorCab.carName}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">License Plate</th>
                          <td className="p-2">{booking.vendorCab.rCNo}</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">Not Assigned Yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Vendor Driver Accordion */}
            <div className="bg-white p-4 rounded shadow-md">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setVendorDriver((prev) => ({ ...prev, isOpen: !prev.isOpen }))
                }
              >
                <h2 className="text-lg font-bold">Vendor Driver</h2>
                <span>{vendorDriver.isOpen ? "▲" : "▼"}</span>
              </div>
              {vendorDriver.isOpen && (
                <div className="mt-4">
                  {booking?.vendorDriver ? (
                    <table className="w-full text-sm border border-gray-300">
                      <tbody>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Driver ID</th>
                          <td className="p-2">
                            {booking.vendorDriver.vendorDriverId}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Driver Name</th>
                          <td className="p-2">
                            {booking.vendorDriver.driverName}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Contact No</th>
                          <td className="p-2">
                            {booking.vendorDriver.contactNo}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">Not Assigned Yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Cab and Driver Sections */}
        {(booking && booking.cabAdmin) && (
          <div className="space-y-4 mt-4">
            {/* Admin Cab Details Accordion */}
            <div className="bg-white p-4 rounded shadow-md">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setAdminCab((prev) => ({ ...prev, isOpen: !prev.isOpen }))}
              >
                <h2 className="text-lg font-bold">Admin Cab Details</h2>
                <span>{adminCab.isOpen ? "▲" : "▼"}</span>
              </div>
              {adminCab.isOpen && (
                <div className="mt-4">
                  {booking?.cabAdmin ? (
                    <table className="w-full text-sm border border-gray-300">
                      <tbody>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Cab ID</th>
                          <td className="p-2">{booking.cabAdmin.id}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Vehicle Name/Registration No</th>
                          <td className="p-2">{booking.cabAdmin.vehicleNameAndRegNo}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Vehicle RC No</th>
                          <td className="p-2">{booking.cabAdmin.vehicleRcNo}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Other Details</th>
                          <td className="p-2">{booking.cabAdmin.carOtherDetails}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Status</th>
                          <td className="p-2">{booking.cabAdmin.status}</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">Not Assigned Yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {booking && booking.driverAdmin && (
          <div className="space-y-4 mt-4">
            {/* Admin Driver Details Accordion */}
            <div className="bg-white p-4 rounded shadow-md">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setAdminDriver((prev) => ({ ...prev, isOpen: !prev.isOpen }))}
              >
                <h2 className="text-lg font-bold">Admin Driver Details</h2>
                <span>{adminDriver.isOpen ? "▲" : "▼"}</span>
              </div>
              {adminDriver.isOpen && (
                <div className="mt-4">
                  {booking?.driverAdmin ? (
                    <table className="w-full text-sm border border-gray-300">
                      <tbody>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Driver ID</th>
                          <td className="p-2">{booking.driverAdmin.id}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Driver Name</th>
                          <td className="p-2">{booking.driverAdmin.driverName}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Contact No</th>
                          <td className="p-2">{booking.driverAdmin.contactNo}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Alternate Contact No</th>
                          <td className="p-2">{booking.driverAdmin.altMobNum || "N/A"}</td>
                        </tr>
                        <tr className="border-b">
                          <th className="p-2 bg-gray-100">Email ID</th>
                          <td className="p-2">{booking.driverAdmin.emailId}</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">Not Assigned Yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Row 4: Bottom Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
          <button
            onClick={() => setShowDetailsModal(true)}
            className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600"
          >
            Show Details
          </button>
          
          <button
            onClick={() => handleUpdateStatus(2)}
            disabled={isUpdatingStatus}
            className={`px-5 py-2 rounded font-medium transition duration-200 ${
              isUpdatingStatus
                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isUpdatingStatus ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              'Trip Complete'
            )}
          </button>
          
          <button className="bg-yellow-500 text-white px-5 py-2 rounded hover:bg-yellow-600">
            Send Email
          </button>
          
          <button
            onClick={() => handleUpdateStatus(3)}
            disabled={isUpdatingStatus}
            className={`px-5 py-2 rounded font-medium transition duration-200 ${
              isUpdatingStatus
                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {isUpdatingStatus ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              'Cancel'
            )}
          </button>
          
          <button
            onClick={() => {
              setEditBooking(booking);
              setIsEditMode(true);
            }}
            className="bg-purple-500 text-white px-5 py-2 rounded hover:bg-purple-600"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Modal for Full Booking Details */}
      {showDetailsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Full Booking Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300 min-w-[400px]">
                <tbody>
                  <tr className="border-b">
                    <th className="p-2 w-40 bg-gray-100">ID</th>
                    <td className="p-2">{booking.id}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Booking ID</th>
                    <td className="p-2">{booking.bookingId}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">User ID</th>
                    <td className="p-2">{booking.userId}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Name</th>
                    <td className="p-2">{booking.name}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Email</th>
                    <td className="p-2">{booking.email}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Phone</th>
                    <td className="p-2">{booking.phone}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">From Location</th>
                    <td className="p-2">{booking.fromLocation}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">To Location</th>
                    <td className="p-2">{booking.toLocation}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Distance</th>
                    <td className="p-2">{booking.distance}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Trip Type</th>
                    <td className="p-2">{formatTripType(booking.tripType)}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Start Date</th>
                    <td className="p-2">{booking.startDate}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Return Date</th>
                    <td className="p-2">{booking.returnDate || "N/A"}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Time</th>
                    <td className="p-2">{booking.time}</td>
                  </tr>
                  {booking.bookingType === "custom_booking" ? (
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Collection</th>
                      <td className="p-2">{booking.collection}</td>
                    </tr>
                  ) : null}
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Amount</th>
                    <td className="p-2">{booking.amount}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">GST</th>
                    <td className="p-2">{booking.gst}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Service Charge</th>
                    <td className="p-2">{booking.serviceCharge}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="p-2 bg-gray-100">Status</th>
                    <td className="p-2">
                      {booking.status === 0 ? "Pending" : booking.status === 1 ? "Confirmed" : "Cancelled"}
                    </td>
                  </tr>
                  <tr>
                    <th className="p-2 bg-gray-100">Booking Type</th>
                    <td className="p-2">{booking.bookingType || "N/A"}</td>
                  </tr>
                  <tr>
                    <th className="p-2 bg-gray-100">Description</th>
                    <td className="p-2">{booking.description || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal for Editing Booking Details */}
      {isEditMode && editBooking && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            
            {/* ✅ LOADING OVERLAY: Show spinner when saving edit */}
            {isSavingEdit && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center">
                  <FaSpinner className="animate-spin text-4xl text-blue-500 mb-2" />
                  <span className="text-lg font-medium text-gray-700">Saving Changes...</span>
                  <span className="text-sm text-gray-500">Please wait</span>
                </div>
              </div>
            )}
            
            <h2 className="text-xl font-bold mb-4">Edit Booking Details</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300 min-w-[400px]">
                  <tbody>
                    <tr className="border-b">
                      <th className="p-2 w-40 bg-gray-100">ID</th>
                      <td className="p-2">
                        <input
                          className="border p-1 w-full bg-gray-100"
                          value={editBooking.id || ""}
                          disabled
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Booking ID</th>
                      <td className="p-2">
                        <input
                          className="border p-1 w-full bg-gray-100"
                          value={editBooking.bookingId || ""}
                          disabled
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">User ID</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          value={editBooking.userId || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, userId: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Name</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          value={editBooking.name || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, name: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Email</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          value={editBooking.email || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, email: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Phone</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          value={editBooking.phone || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, phone: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">From Location</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          ref={fromLocationRef}
                          value={editBooking.fromLocation || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, fromLocation: e.target.value })}
                          placeholder="Enter Pickup Location"
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">To Location</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          ref={toLocationRef}
                          value={editBooking.toLocation || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, toLocation: e.target.value })}
                          placeholder="Enter Drop Location"
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Distance</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          type="number"
                          value={editBooking.distance || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, distance: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Trip Type</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          value={editBooking.tripType || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, tripType: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Start Date</th>
                      <td className="p-2">
                        <input
                          type="date"
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          value={editBooking.startDate || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, startDate: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Return Date</th>
                      <td className="p-2">
                        <input
                          type="date"
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          value={editBooking.returnDate || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, returnDate: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Time</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          value={editBooking.time || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, time: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Amount</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          type="number"
                          value={editBooking.amount || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, amount: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">GST</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          type="number"
                          value={editBooking.gst || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, gst: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Service Charge</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          type="number"
                          value={editBooking.serviceCharge || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, serviceCharge: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 bg-gray-100">Status</th>
                      <td className="p-2">
                        <select
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          value={editBooking.status}
                          onChange={(e) => setEditBooking({ ...editBooking, status: e.target.value })}
                          disabled={isSavingEdit}
                        >
                          <option value={0}>Pending</option>
                          <option value={1}>Confirmed</option>
                          <option value={2}>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <th className="p-2 bg-gray-100">Booking Type</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          value={editBooking.bookingType || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, bookingType: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="p-2 bg-gray-100">Description</th>
                      <td className="p-2">
                        <input
                          className={`border p-1 w-full ${
                            isSavingEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          value={editBooking.description || ""}
                          onChange={(e) => setEditBooking({ ...editBooking, description: e.target.value })}
                          disabled={isSavingEdit}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row justify-end mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  disabled={isSavingEdit}
                  className={`px-4 py-2 rounded w-full sm:w-auto ${
                    isSavingEdit
                      ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                      : 'bg-gray-400 hover:bg-gray-500 text-white'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className={`px-4 py-2 rounded w-full sm:w-auto ${
                    isSavingEdit
                      ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isSavingEdit ? (
                    <div className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </div>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;