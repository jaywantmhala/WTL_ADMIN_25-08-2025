"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../../../container/components/Navbar";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Bookings() {
  const [isOpen, setIsOpen] = useState(false);
  const [currBooking, setCurrBooking] = useState("All Bookings");
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const router = useRouter();

  const handleBookingValue = (value) => {
    setCurrBooking(value);
    if (value === "All Bookings") {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter((booking) => booking.tripType === value);
      setFilteredBookings(filtered);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(" https://api.worldtriplink.com/details");
      if (response.status === 200 && Array.isArray(response.data)) {
        setBookings(response.data);
        setFilteredBookings(response.data);
      } else {
        setBookings([]);
        setError("Invalid response structure");
      }
    } catch (error) {
      setError("Error fetching bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmed) return;

    // setDeleting(true);
    // setError(null);
    // setSuccessMessage(null);

    try {
      await axios.delete(` https://api.worldtriplink.com/delete/${bookingId}`);
      // setBookings((prevBookings) =>
      //   prevBookings.filter((booking) => booking.bookingId !== bookingId)
      // );
      // setFilteredBookings((prevFiltered) =>
      //   prevFiltered.filter((booking) => booking.bookingId !== bookingId)
      // );
      // setSuccessMessage(
      //   `Booking with ID ${bookingId} has been deleted successfully.`
      // );

      fetchBookings();
    } catch (error) {
      setError("Error deleting booking");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const response = await axios.put(
        ` https://api.worldtriplink.com/${bookingId}/status`,
        { status: newStatus }
      );
      setBooking(response.data);
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="flex">

      {/* <Navbar  style={{height:0}} /> */}
      <Navbar />
      <main className="flex-1 p-6 overflow-y-auto h-screen">
        <div className="mt-6">
          {/* Sorting Dropdown */}
          <div className="mb-4">
            <select
              className="p-2 border border-gray-300 rounded"
              value={currBooking}
              onChange={(e) => handleBookingValue(e.target.value)}
            >
              <option value="All Bookings">All Bookings</option>
              <option value="oneWay">One Way</option>
              <option value="roundTrip">Round Trip</option>
            </select>
          </div>

          {loading ? (
            <p>Loading bookings...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredBookings.length === 0 ? (
            <p>No bookings available.</p>
          ) : (
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="border border-gray-300 p-2">Sr No</th>
                  <th className="border border-gray-300 p-2">Booking ID</th>
                  <th className="border border-gray-300 p-2">User Name</th>
                  <th className="border border-gray-300 p-2">From Location</th>
                  <th className="border border-gray-300 p-2">To Location</th>
                  <th className="border border-gray-300 p-2">Trip Type</th>
                  <th className="border border-gray-300 p-2">Start Date</th>
                  <th className="border border-gray-300 p-2">Return Date</th>
                  <th className="border border-gray-300 p-2">Time</th>
                  <th className="border border-gray-300 p-2">Amount</th>
                  <th className="border border-gray-300 p-2">Status</th>
                  <th className="border border-gray-300 p-2">Delete</th>
                  <th className="border border-gray-300 p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => (
                  <tr
                    key={booking.bookingId}
                    className="odd:bg-gray-100 even:bg-gray-200"
                  >
                    <td className="border border-gray-300 p-2">{index + 1}</td>
                    <td className="border border-gray-300 p-2">
                      {booking.bookingId}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {booking.name}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {booking.fromLocation}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {booking.toLocation}
                    </td>
                    <td className="border border-gray-300 p-2">
                    {booking.tripType
    ? booking.tripType
        .replace(/[- ]/g, "") // Remove hyphens and spaces
        .replace(/^./, (match) => match.toUpperCase()) // Capitalize the first letter
    : ""}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {booking.startDate}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {booking.returnDate}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {booking.time}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {booking.amount}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <span
                        className={`px-2 py-1 rounded ${
                          booking.status === 0
                            ? "bg-yellow-500" // Pending
                            : booking.status === 1
                            ? "bg-blue-500" // Ongoing
                            : booking.status === 2
                            ? "bg-green-500" // Completed
                            : booking.status === 3
                            ? "bg-red-500" // Cancelled
                            : "bg-gray-500" // Default color for invalid or undefined status
                        } text-white`}
                      >
                        {booking.status === 0
                          ? "Pending"
                          : booking.status === 1
                          ? "Ongoing"
                          : booking.status === 2
                          ? "Completed"
                          :booking.status===5
                          ?"Reassign"
                          : booking.status === 3
                          ? "Cancelled"
                          : "Unknown"}
                      </span>
                    </td>

                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                        onClick={() => deleteBooking(booking.id)}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                        onClick={() =>
                          router.push(
                            `/online/online-booking/vendor/${booking.id}`
                          )
                        }
                      >
                        Action
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {successMessage && <p className="text-green-500">{successMessage}</p>}
        </div>
      </main>
    </div>
  );
}
