'use client';
import { useEffect, useState } from 'react';
import Home from '../../container/components/Navbar';
import { FaBusinessTime, FaCheck, FaUsers, FaCar, FaTimes } from 'react-icons/fa';

const Dashboard = () => {
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
  const [bookings, setBookings] = useState([]); // Store all bookings
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [canceledCount, setCanceledCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all booking data and compute counts
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.worldtriplink.com/details'); // Adjust API URL if needed
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBookings(data);

      // Count bookings based on their status.
      // Adjust conditions if your API returns numbers (0,1,2) or strings.
      const pending = data.filter(booking => booking.status === "Pending" || booking.status === 0).length;
      const completed = data.filter(booking => booking.status === "Completed" || booking.status === 2).length;
      const canceled = data.filter(booking => booking.status === "Canceled" || booking.status === 3).length;

      setPendingCount(pending);
      setCompletedCount(completed);
      setCanceledCount(canceled);
    } catch (err) {
      console.error('Error fetching booking data:', err);
      setError('Error fetching booking data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Delete a booking and update counts
  const deleteBooking = async (bookingId) => {
    try {
      const response = await fetch(`https://api.worldtriplink.com/details/${bookingId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }
      // Find the booking to determine its status before deletion
      const deletedBooking = bookings.find(booking => booking.bookingId === bookingId);

      // Update bookings state by filtering out the deleted booking
      const updatedBookings = bookings.filter(booking => booking.bookingId !== bookingId);
      setBookings(updatedBookings);

      // Recalculate the counts based on the updated bookings
      const pending = updatedBookings.filter(booking => booking.status === "Pending" || booking.status === 0).length;
      const completed = updatedBookings.filter(booking => booking.status === "Completed" || booking.status === 2).length;
      const canceled = updatedBookings.filter(booking => booking.status === "Canceled" || booking.status === 3).length;
      setPendingCount(pending);
      setCompletedCount(completed);
      setCanceledCount(canceled);
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('Error deleting booking. Please try again later.');
    }
  };

  // Total trips count
  const totalCount = bookings.length;

  const toggleDropdown = (dropdownKey) => {
    setOpenDropdown(openDropdown === dropdownKey ? null : dropdownKey);
  };

  return (
    <div className="flex h-screen overflow-hidden">
  {/* Sidebar - fixed and not scrollable */}
  <div className="h-full">
    <Home />
  </div>
  
  {/* Main content - scrollable */}
  <div className="flex-1 overflow-y-auto relative top-11">
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Loading bookings...</div>
      ) : (
        <>
          {/* Dashboard Cards */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-md">
                <FaBusinessTime className="text-blue-500 text-4xl" />
                <div>
                  <h3 className="text-xl font-semibold">Business</h3>
                  <p className="text-gray-500">Manage your business</p>
                </div>
              </div>

              {/* Rest of your dashboard cards remain exactly the same */}
              <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-md">
                <FaCar className="text-blue-500 text-4xl" />
                <div>
                  <h3 className="text-xl font-semibold">All Trips</h3>
                  <p className="text-gray-500">{totalCount} Trips</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-md">
                <FaUsers className="text-blue-500 text-4xl" />
                <div>
                  <h3 className="text-xl font-semibold">Vendors</h3>
                  <p className="text-gray-500">Manage vendors</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-md">
                <div>
                  <h3 className="text-xl font-semibold">All Pending Trips</h3>
                  <p className="text-gray-500">{pendingCount} Pending</p>
                </div>
                <FaCheck className="text-yellow-500 text-4xl" />
              </div>

              <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-md">
                <div>
                  <h3 className="text-xl font-semibold">All Completed Trips</h3>
                  <p className="text-gray-500">{completedCount} Completed</p>
                </div>
                <FaCheck className="text-green-500 text-4xl" />
              </div>

              <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-md">
                <div>
                  <h3 className="text-xl font-semibold">All Cancelled Trips</h3>
                  <p className="text-gray-500">{canceledCount} Cancelled</p>
                </div>
                <FaTimes className="text-red-500 text-4xl" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
</div>
  );
};

export default Dashboard;
