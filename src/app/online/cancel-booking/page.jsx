import React from "react";
import "./cancel-booking.css"; // Import the CSS file for full-screen styling

const CancelBooking = () => {
  return (
    <div className="container mx-auto p-4 full-screen">
      <h1 className="text-2xl font-bold mb-4">Cancel Booking</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Booking ID</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="Enter Booking ID"
              />
            </div>
            <div>
              <label className="block text-gray-700">
                Reason for Cancellation
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded mt-1"
                placeholder="Enter Reason"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="w-full md:w-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelBooking;
