"use client"
import { useEffect, useState } from 'react';

import Navbar from "../../../container/components/Navbar";
import axios from 'axios';

const visitorData = [
  {
    id: 1,
    name: 'John Doe',
    phone: '1234567890',
    pickupLocation: 'Airport Terminal A',
    dropLocation: 'Grand Hotel',
    date: '2023-05-15',
    triptype: 'oneway',
    cartype: 'seDan',
    visitdate: '2023-05-15'
  },
  {
    id: 2,
    name: 'Jane Smith',
    phone: '9876543210',
    pickupLocation: 'Central Station',
    dropLocation: 'Beach Resort',
    date: '2023-05-16'
  },
  {
    id: 3,
    name: 'Robert Johnson',
    phone: '5551234567',
    pickupLocation: 'City Mall',
    dropLocation: 'Business Center',
    triptype: 'oneway',
    date: '2023-05-17'
  },

  {
    id: 4,
    name: 'Emily Davis',
    phone: '4445556666',
    pickupLocation: 'University',
    dropLocation: 'Library',
    date: '2023-05-18'
  },
  {
    id: 5,
    name: 'Michael Wilson',
    phone: '7778889999',
    pickupLocation: 'Tech Park',
    dropLocation: 'Conference Center',
    date: '2023-05-19'
  },
  {
    id: 6,
    name: 'Sarah Brown',
    phone: '1112223333',
    pickupLocation: 'Hospital',
    dropLocation: 'Hotel',
    date: '2023-05-20'
  },
  {
    id: 7,
    name: 'David Taylor',
    phone: '9990001111',
    pickupLocation: 'Stadium',
    dropLocation: 'Restaurant',
    date: '2023-05-21'
  },
  {
    id: 8,
    name: 'Jessica Miller',
    phone: '2223334444',
    pickupLocation: 'Shopping Mall',
    dropLocation: 'Apartment',
    date: '2023-05-22'
  },
  {
    id: 9,
    name: 'Thomas Anderson',
    phone: '6667778888',
    pickupLocation: 'Train Station',
    dropLocation: 'Office',
    date: '2023-05-23'
  },
  {
    id: 10,
    name: 'Lisa Martinez',
    phone: '3334445555',
    pickupLocation: 'Bus Terminal',
    dropLocation: 'Home',
    date: '2023-05-24'
  },
  {
    id: 11,
    name: 'Kevin Robinson',
    phone: '8889990000',
    pickupLocation: 'Airport Terminal B',
    dropLocation: 'Resort',
    date: '2023-05-25'
  }
];

// Add this pagination range generator function at the top level
const getPaginationRange = (currentPage, totalPages) => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  range.push(1);

  if (totalPages <= 1) return range;

  for (let i = currentPage - delta; i <= currentPage + delta; i++) {
    if (i > 1 && i < totalPages) {
      range.push(i);
    }
  }
  range.push(totalPages);

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

export default function VisitorDetails() {
  const [currentPage, setCurrentPage] = useState(1);
  const [visitorsPerPage] = useState(6);
  const [vistor, setVisitor] = useState([]);

  // Calculate current visitors
  const indexOfLastVisitor = currentPage * visitorsPerPage;
  const indexOfFirstVisitor = indexOfLastVisitor - visitorsPerPage;
  const currentVisitors = vistor.slice(indexOfFirstVisitor, indexOfLastVisitor);
  const totalPages = Math.ceil(vistor.length / visitorsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getAllVisitor = async() => {
    const response = await axios.get(" http://localhost:8085/api/getAllVisitor")
    setVisitor(response.data);
  }
 
  useEffect(() => {
    getAllVisitor();
  }, [])

  return (
<div className="flex h-screen overflow-hidden">
  <Navbar />
 
  <div className="flex-1 overflow-auto bg-gray-50">
    <div className="py-12 px-4 sm:px-6 lg:px-8 min-h-full">
     
     
      <div className="max-w-6xl mx-auto">
        <div className="sm:flex sm:items-center mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">Visitor Details</h1>
            {/* <p className="mt-2 text-sm text-gray-700">
              A list of all visitors including their name, phone number, and locations.
            </p> */}
          </div>
        </div>
       
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 text-gray-900 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    Visit Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Pickup Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Drop Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Trip Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    cartype
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentVisitors.map((visitor) => (
                  <tr key={visitor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {visitor.visitDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {visitor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.pickupLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.dropLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.tripType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.cartype || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         
          {/* Replace the entire Pagination section */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstVisitor + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastVisitor, vistor.length)}</span>{' '}
                  of <span className="font-medium">{vistor.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {getPaginationRange(currentPage, totalPages).map((pageNumber, idx) => (
                    pageNumber === '...' ? (
                      <span
                        key={`dots-${idx}`}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  ))}

                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}