"use client";
import React from "react";
import Navbar from "../../container/components/Navbar";

const WebDashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden">
    {/* Sidebar - fixed and not scrollable */}
    <div className="h-full">
      <Navbar />
    </div>
    
    {/* Main content - scrollable */}
    <div className="flex-1 overflow-y-auto p-6 ml-10">
      <section>
        <div className="card mb-6 bg-white shadow-lg rounded-lg">
          <div className="flex">
            <div className="w-1/3">
              <img
                src="/images/wtlLogo.jpeg"
                className="rounded-l-lg max-h-24 object-contain"
                alt="WTL Logo"
              />
            </div>
            <div className="w-2/3 p-4">
              <h5 className="text-xl font-semibold">
                WorldTripLink DashBoard
              </h5>
              <p className="text-gray-600 mt-2">
                worldtriplink hosted on Hostinger platform with link:{" "}
                <a
                  href="http://www.worldtriplink.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  www.worldtriplink.com
                </a>
              </p>
            </div>
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1 */}
          <div>
            <div className="card bg-white shadow-lg rounded-lg mb-6">
              <div className="p-4">
                <h5 className="text-xl font-semibold">
                  Update Routes Rates
                </h5>
                <p className="text-gray-600 mt-2">
                  Update routes rates of website
                </p>
                <div className="mt-4">
                  <a
                    href="/update-root-rate"
                    className="btn bg-yellow-500 text-white hover:bg-yellow-600 py-2 px-4 rounded-full w-full text-center"
                  >
                    Go to Update rate Page
                  </a>
                </div>
              </div>
            </div>
  
            <div className="card bg-white shadow-lg rounded-lg mb-6">
              <div className="p-4">
                <h5 className="text-xl font-semibold">Add Rate By Km</h5>
                <p className="text-gray-600 mt-2">
                  Add Filter on City by Km
                </p>
                <div className="mt-4">
                  <a
                    href="/wtl-rate-update-by-km"
                    className="btn bg-blue-500 text-white hover:bg-blue-600 py-2 px-4 rounded-full w-full text-center"
                  >
                    Go to Rate By City Page
                  </a>
                </div>
              </div>
            </div>
  
            <div className="card bg-white shadow-lg rounded-lg mb-6">
              <div className="p-4">
                <h5 className="text-xl font-semibold">Add Offer</h5>
                <p className="text-gray-600 mt-2">
                  Add Offer images on wtl website
                </p>
                <div className="mt-4">
                  <a
                    href="/wtl-offer-page"
                    className="btn bg-red-500 text-white hover:bg-red-600 py-2 px-4 rounded-full w-full text-center"
                  >
                    Go to Add Offer Page
                  </a>
                </div>
              </div>
            </div>
          </div>
  
          {/* Column 2 */}
          <div>
            <div className="card bg-white shadow-lg rounded-lg mb-6">
              <div className="p-4">
                <h5 className="text-xl font-semibold">Add Rate By State</h5>
                <p className="text-gray-600 mt-2">
                  Add Rate According to the states and their kilometers
                </p>
                <div className="mt-4">
                  <a
                    href="/wtl-add-rate-by-state"
                    className="btn bg-blue-500 text-white hover:bg-blue-600 py-2 px-4 rounded-full w-full text-center"
                  >
                    Add Rate By State Page
                  </a>
                </div>
              </div>
            </div>
  
            <div className="card bg-white shadow-lg rounded-lg mb-6">
              <div className="p-4">
                <h5 className="text-xl font-semibold">
                  Update Default Rate
                </h5>
                <p className="text-gray-600 mt-2">
                  update Default Rate of website
                </p>
                <div className="mt-4">
                  <a
                    href="/wtl-defaultRate"
                    className="btn bg-yellow-500 text-white hover:bg-yellow-600 py-2 px-4 rounded-full w-full text-center"
                  >
                    Go to Update Default Rate Page
                  </a>
                </div>
              </div>
            </div>
  
            <div className="card bg-white shadow-lg rounded-lg mb-6">
              <div className="p-4">
                <h5 className="text-xl font-semibold">Saved User Data</h5>
                <p className="text-gray-600 mt-2">
                  Check the saved user data from the website popup
                </p>
                <div className="mt-4">
                  <a
                    href="/wtl-saved-user-data"
                    className="btn bg-red-500 text-white hover:bg-red-600 py-2 px-4 rounded-full w-full text-center"
                  >
                    Go to saved user data
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
  );
};

export default WebDashboard;
