"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../../container/components/Navbar";

const Page = () => {
  const params = useParams();
  const router = useRouter();

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  const [cab, setCab] = useState([]);

  const status = params.status;
  const formattedStatus = capitalizeFirstLetter(status);
  console.log(`Cab ${formattedStatus} List`);

  useEffect(() => {
    const fetchCab = async () => {
      try {
        const response = await axios.get(
          `https://api.worldtriplink.com/cabAdmin/cab/${params.status}`
        );
        setCab(response.data);
      } catch (error) {
        console.error("Error fetching cab data:", error);
      }
    };

    fetchCab();
  }, [params.status]);

  console.log(cab);

  // Assuming your images are served from this URL:
  const imageBaseUrl = "https://api.worldtriplink.com/images/";

  return (
    <div className="flex">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white shadow-lg rounded-lg p-4 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Cab {formattedStatus} List
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200 rounded-lg shadow-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                    Vehicle Name & Reg No
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                    Vehicle RC No
                  </th>

                  <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                    Car Other Details
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {cab.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100`}
                  >
                    <td className="px-2 py-2 text-gray-700 text-xs">
                      WTL_CAB{row.id}
                    </td>
                    <td className="px-2 py-2 text-gray-700 text-xs">
                      {row.vehicleNameAndRegNo}
                    </td>
                    <td className="px-2 py-2 text-gray-700 text-xs">
                      {row.vehicleRcNo}
                    </td>

                    <td className="px-2 py-2 text-gray-700 text-xs">
                      {row.carOtherDetails}
                    </td>
                    <td className="px-2 py-2 text-gray-700 text-xs">
                      {row.status}
                    </td>
                  </tr>
                ))}
                {cab.length === 0 && (
                  <tr>
                    <td colSpan="13" className="text-center text-gray-500 py-4">
                      No cab data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
