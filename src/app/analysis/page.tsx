"use client"
import React, { useState, useEffect, ChangeEvent } from 'react';

// Define interfaces for type safety
interface Booking {
  id?: number;
  bookingId?: string;
  bookid?: string;
  companyName?: string;
  name?: string;
  email?: string;
  phone?: string;
  userId?: string;
  fromLocation?: string;
  toLocation?: string;
  userPickup?: string;
  userDrop?: string;
  tripType?: string;
  userTripType?: string;
  car?: string;
  distance?: string;
  startDate?: string;
  returnDate?: string;
  date?: string;
  time?: string;
  dateEnd?: string;
  timeEnd?: string;
  baseAmount?: string;
  amount?: number;
  status?: number;
  driverBhata?: string;
  nightCharges?: number;
  gst?: number;
  serviceCharge?: number;
  offer?: string;
  offerPartial?: number;
  offerAmount?: string;
  txnId?: string;
  payment?: string;
  bookingType?: string;
  description?: string;
  vendor?: string;
  collection?: number;
  cabAdmin?: string;
  driverAdmin?: string;
  vendorDriverName?: string;
  vendorCabName?: string;
  cabPlateNo?: string;
  vendorName?: string;
  masterAdminDriverName?: string;
  masterAdminCabName?: string;
  masterAdminCabNoPlate?: string;
}

const CompanyBookingManagement: React.FC = () => {
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Fetch unique company names on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async (): Promise<void> => {
    try {
      setLoadingCompanies(true);
      const response = await fetch(' https://api.worldtriplink.com/unique-company-names');
      const data: string[] = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchBookingsByCompany = async (companyName: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(` https://api.worldtriplink.com/byCompany?companyName=${encodeURIComponent(companyName)}`);
      const data: Booking | Booking[] = await response.json();
      const bookingsArray: Booking[] = Array.isArray(data) ? data : [data];
      setAllBookings(bookingsArray);
      filterBookings(bookingsArray, startDate, endDate);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setAllBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = (bookings: Booking[], start: string, end: string): void => {
    let filtered = bookings;

    if (start || end) {
      filtered = bookings.filter(booking => {
        if (!booking.date) return false;
        
        const bookingDate = new Date(booking.date);
        const startDateObj = start ? new Date(start) : null;
        const endDateObj = end ? new Date(end) : null;

        if (startDateObj && endDateObj) {
          return bookingDate >= startDateObj && bookingDate <= endDateObj;
        } else if (startDateObj) {
          return bookingDate >= startDateObj;
        } else if (endDateObj) {
          return bookingDate <= endDateObj;
        }
        return true;
      });
    }

    setFilteredBookings(filtered);
  };

  const handleCompanyChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const companyName = event.target.value;
    setSelectedCompany(companyName);
    setStartDate('');
    setEndDate('');
    if (companyName) {
      fetchBookingsByCompany(companyName);
    } else {
      setAllBookings([]);
      setFilteredBookings([]);
    }
  };

  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const newStartDate = event.target.value;
    setStartDate(newStartDate);
    filterBookings(allBookings, newStartDate, endDate);
  };

  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const newEndDate = event.target.value;
    setEndDate(newEndDate);
    filterBookings(allBookings, startDate, newEndDate);
  };

  const clearDateFilters = (): void => {
    setStartDate('');
    setEndDate('');
    filterBookings(allBookings, '', '');
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const exportToExcel = async (): Promise<void> => {
    if (filteredBookings.length === 0) return;

    try {
      // Dynamically import XLSX
      const XLSX = await import('xlsx');

      // Prepare data for Excel
      const excelData = filteredBookings.map((booking, index) => ({
        'S.No': index + 1,
        'Booking ID': booking.bookingId || '',
        'Book ID': booking.bookid || '',
        'Company Name': booking.companyName || '',
        'Customer Name': booking.name || '',
        'Email': booking.email || '',
        'Phone': booking.phone || '',
        'User ID': booking.userId || '',
        'From Location': booking.fromLocation || '',
        'To Location': booking.toLocation || '',
        'User Pickup': booking.userPickup || '',
        'User Drop': booking.userDrop || '',
        'Trip Type': booking.tripType || '',
        'User Trip Type': booking.userTripType || '',
        'Car': booking.car || '',
        'Distance': booking.distance || '',
        'Start Date': booking.startDate || '',
        'Return Date': booking.returnDate || '',
        'Booking Date': booking.date || '',
        'Time': booking.time || '',
        'Date End': booking.dateEnd || '',
        'Time End': booking.timeEnd || '',
        'Base Amount': booking.baseAmount || '',
        'Amount': booking.amount || 0,
        'Status': booking.status || 0,
        'Driver Bhata': booking.driverBhata || '0',
        'Night Charges': booking.nightCharges || 0,
        'GST': booking.gst || 0,
        'Service Charge': booking.serviceCharge || 0,
        'Offer': booking.offer || '',
        'Offer Partial': booking.offerPartial || 0,
        'Offer Amount': booking.offerAmount || '',
        'Transaction ID': booking.txnId || '0',
        'Payment': booking.payment || '',
        'Booking Type': booking.bookingType || '',
        'Description': booking.description || '',
        'Vendor': booking.vendor || '',
        'Collection': booking.collection || 0,
        'Cab Admin': booking.cabAdmin || '',
        'Driver Admin': booking.driverAdmin || '',
        'Vendor Driver Name': booking.vendorDriverName || '',
        'Vendor Cab Name': booking.vendorCabName || '',
        'Cab Plate No': booking.cabPlateNo || '',
        'Vendor Name': booking.vendorName || '',
        'Master Admin Driver Name': booking.masterAdminDriverName || '',
        'Master Admin Cab Name': booking.masterAdminCabName || '',
        'Master Admin Cab No Plate': booking.masterAdminCabNoPlate || ''
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      
      // Set column widths for better readability
      const colWidths = [
        { wch: 8 },   // S.No
        { wch: 20 },  // Booking ID
        { wch: 20 },  // Book ID
        { wch: 15 },  // Company Name
        { wch: 20 },  // Customer Name
        { wch: 25 },  // Email
        { wch: 15 },  // Phone
        { wch: 12 },  // User ID
        { wch: 30 },  // From Location
        { wch: 30 },  // To Location
        { wch: 30 },  // User Pickup
        { wch: 30 },  // User Drop
        { wch: 12 },  // Trip Type
        { wch: 15 },  // User Trip Type
        { wch: 15 },  // Car
        { wch: 10 },  // Distance
        { wch: 12 },  // Start Date
        { wch: 12 },  // Return Date
        { wch: 12 },  // Booking Date
        { wch: 10 },  // Time
        { wch: 12 },  // Date End
        { wch: 10 },  // Time End
        { wch: 12 },  // Base Amount
        { wch: 10 },  // Amount
        { wch: 8 },   // Status
        { wch: 12 },  // Driver Bhata
        { wch: 12 },  // Night Charges
        { wch: 8 },   // GST
        { wch: 12 },  // Service Charge
        { wch: 15 },  // Offer
        { wch: 12 },  // Offer Partial
        { wch: 12 },  // Offer Amount
        { wch: 15 },  // Transaction ID
        { wch: 12 },  // Payment
        { wch: 15 },  // Booking Type
        { wch: 20 },  // Description
        { wch: 15 },  // Vendor
        { wch: 10 },  // Collection
        { wch: 15 },  // Cab Admin
        { wch: 15 },  // Driver Admin
        { wch: 20 },  // Vendor Driver Name
        { wch: 20 },  // Vendor Cab Name
        { wch: 15 },  // Cab Plate No
        { wch: 15 },  // Vendor Name
        { wch: 25 },  // Master Admin Driver Name
        { wch: 25 },  // Master Admin Cab Name
        { wch: 20 }   // Master Admin Cab No Plate
      ];
      
      ws['!cols'] = colWidths;
      
      // Add worksheet to workbook
      const sheetName = `${selectedCompany}_Bookings_${new Date().toISOString().split('T')[0]}`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Generate filename
      const dateRange = startDate && endDate 
        ? `_${startDate}_to_${endDate}`
        : startDate 
        ? `_from_${startDate}`
        : endDate 
        ? `_until_${endDate}`
        : '';
      
      const filename = `${selectedCompany}_Bookings${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Download file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please make sure you have installed the xlsx package.');
    }
  };

  // Alternative CSV export function (doesn't require external library)
  const exportToCSV = (): void => {
    if (filteredBookings.length === 0) return;

    // Prepare CSV headers
    const headers = [
      'S.No', 'Booking ID', 'Book ID', 'Company Name', 'Customer Name', 'Email', 'Phone', 'User ID',
      'From Location', 'To Location', 'User Pickup', 'User Drop', 'Trip Type', 'User Trip Type',
      'Car', 'Distance', 'Start Date', 'Return Date', 'Booking Date', 'Time', 'Date End', 'Time End',
      'Base Amount', 'Amount', 'Status', 'Driver Bhata', 'Night Charges', 'GST', 'Service Charge',
      'Offer', 'Offer Partial', 'Offer Amount', 'Transaction ID', 'Payment', 'Booking Type',
      'Description', 'Vendor', 'Collection', 'Cab Admin', 'Driver Admin', 'Vendor Driver Name',
      'Vendor Cab Name', 'Cab Plate No', 'Vendor Name', 'Master Admin Driver Name',
      'Master Admin Cab Name', 'Master Admin Cab No Plate'
    ];

    // Prepare CSV data
    const csvData = filteredBookings.map((booking, index) => [
      index + 1,
      booking.bookingId || '',
      booking.bookid || '',
      booking.companyName || '',
      booking.name || '',
      booking.email || '',
      booking.phone || '',
      booking.userId || '',
      booking.fromLocation || '',
      booking.toLocation || '',
      booking.userPickup || '',
      booking.userDrop || '',
      booking.tripType || '',
      booking.userTripType || '',
      booking.car || '',
      booking.distance || '',
      booking.startDate || '',
      booking.returnDate || '',
      booking.date || '',
      booking.time || '',
      booking.dateEnd || '',
      booking.timeEnd || '',
      booking.baseAmount || '',
      booking.amount || 0,
      booking.status || 0,
      booking.driverBhata || '0',
      booking.nightCharges || 0,
      booking.gst || 0,
      booking.serviceCharge || 0,
      booking.offer || '',
      booking.offerPartial || 0,
      booking.offerAmount || '',
      booking.txnId || '0',
      booking.payment || '',
      booking.bookingType || '',
      booking.description || '',
      booking.vendor || '',
      booking.collection || 0,
      booking.cabAdmin || '',
      booking.driverAdmin || '',
      booking.vendorDriverName || '',
      booking.vendorCabName || '',
      booking.cabPlateNo || '',
      booking.vendorName || '',
      booking.masterAdminDriverName || '',
      booking.masterAdminCabName || '',
      booking.masterAdminCabNoPlate || ''
    ]);

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        row.map(field => 
          typeof field === 'string' && field.includes(',') 
            ? `"${field}"` 
            : field
        ).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const dateRange = startDate && endDate 
      ? `_${startDate}_to_${endDate}`
      : startDate 
      ? `_from_${startDate}`
      : endDate 
      ? `_until_${endDate}`
      : '';
    
    const filename = `${selectedCompany}_Bookings${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl mb-8 overflow-hidden backdrop-blur-sm bg-white/95">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 sm:p-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">Company Booking Management</h1>
            <p className="text-lg sm:text-xl opacity-90 font-medium">Select a company to view all bookings</p>
          </div>

          <div className="p-6 sm:p-8 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                <label className="text-lg sm:text-xl font-semibold text-gray-700 whitespace-nowrap">
                  Select Company:
                </label>
                {loadingCompanies ? (
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-md">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    <span className="text-gray-600 font-medium">Loading companies...</span>
                  </div>
                ) : (
                  <select
                    value={selectedCompany}
                    onChange={handleCompanyChange}
                    className="px-4 sm:px-6 py-3 text-base sm:text-lg border-2 border-gray-300 rounded-xl bg-white text-gray-700 cursor-pointer transition-all duration-300 hover:border-indigo-500 hover:shadow-lg focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 min-w-[200px] sm:min-w-[250px] shadow-md"
                  >
                    <option value="" className="text-gray-500">Choose a company...</option>
                    {companies.map((company, index) => (
                      <option key={index} value={company} className="text-gray-700">
                        {company}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date Filters */}
              {selectedCompany && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/30">
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
                    <h3 className="text-lg font-semibold text-gray-700 whitespace-nowrap">Filter by Date:</h3>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Start Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={handleStartDateChange}
                          className="px-4 py-3 text-base border-2 border-gray-300 rounded-xl bg-white text-gray-700 cursor-pointer transition-all duration-300 hover:border-indigo-500 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 shadow-md"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">End Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={handleEndDateChange}
                          min={startDate}
                          className="px-4 py-3 text-base border-2 border-gray-300 rounded-xl bg-white text-gray-700 cursor-pointer transition-all duration-300 hover:border-indigo-500 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 shadow-md"
                        />
                      </div>
                      
                      {(startDate || endDate) && (
                        <button
                          onClick={clearDateFilters}
                          className="mt-6 sm:mt-0 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          Clear Dates
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {(startDate || endDate) && (
                    <div className="mt-4 text-center">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Filtered: {startDate && `From ${new Date(startDate).toLocaleDateString()}`}
                        {startDate && endDate && ' - '}
                        {endDate && `To ${new Date(endDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-4 bg-white/95 backdrop-blur-sm px-6 sm:px-8 py-4 sm:py-6 rounded-2xl shadow-2xl border border-white/20">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
              <span className="text-lg sm:text-xl text-gray-700 font-medium">Loading bookings...</span>
            </div>
          </div>
        )}

        {/* Bookings Display */}
        {!loading && filteredBookings.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Bookings for {selectedCompany} ({filteredBookings.length}{allBookings.length !== filteredBookings.length ? ` of ${allBookings.length}` : ''})
              </h2>
              {(startDate || endDate) && (
                <p className="text-xl text-white/90 font-medium mb-4">
                  {startDate && endDate 
                    ? `From ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
                    : startDate 
                    ? `From ${new Date(startDate).toLocaleDateString()}`
                    : `Until ${new Date(endDate).toLocaleDateString()}`
                  }
                </p>
              )}
              
              {/* Download Buttons */}
              <div className="flex justify-center gap-4 mb-6 flex-wrap">
                <button
                  onClick={exportToExcel}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Excel ({filteredBookings.length} records)
                </button>
                
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download CSV ({filteredBookings.length} records)
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8">
              {filteredBookings.map((booking) => (
                <div key={booking.id || booking.bookingId} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl border border-white/20">
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 sm:p-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg sm:text-xl font-bold tracking-wide">#{booking.bookingId}</h3>
                      <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg ${
                        booking.status === 5 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                        booking.status === 0 ? 'bg-red-100 text-red-800 border border-red-200' : 
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        Status: {booking.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-600">Customer:</span>
                        <p className="text-gray-800 font-medium">{booking.name}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Phone:</span>
                        <p className="text-gray-800">{booking.phone}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="font-medium text-gray-700">From:</span>
                        <span className="text-gray-800">{booking.fromLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="font-medium text-gray-700">To:</span>
                        <span className="text-gray-800">{booking.toLocation}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-semibold text-gray-600">Trip Type:</span>
                        <p className="text-gray-800 capitalize">{booking.tripType}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Car:</span>
                        <p className="text-gray-800">{booking.car}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Booking Date:</span>
                        <p className="text-gray-800 font-medium text-indigo-600">{formatDate(booking.date)}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Time:</span>
                        <p className="text-gray-800">{booking.time}</p>
                      </div>
                    </div>

                    {booking.vendorDriverName && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <span className="font-semibold text-blue-700">Driver:</span>
                        <p className="text-blue-800">{booking.vendorDriverName}</p>
                        {booking.cabPlateNo && (
                          <p className="text-blue-600 text-sm">Vehicle: {booking.cabPlateNo}</p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <span className="font-semibold text-gray-600">Distance:</span>
                        <span className="text-gray-800 ml-2">{booking.distance} km</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-600">Amount:</span>
                        <span className="text-2xl font-bold text-green-600 ml-2">₹{booking.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No bookings message */}
        {!loading && selectedCompany && filteredBookings.length === 0 && allBookings.length > 0 && (
          <div className="text-center py-12">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 inline-block border border-white/20">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Bookings in Date Range</h3>
              <p className="text-gray-600 mb-4">
                No bookings found for {selectedCompany} between the selected dates
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Total bookings available: {allBookings.length}
              </p>
              <button
                onClick={clearDateFilters}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Show All Bookings
              </button>
            </div>
          </div>
        )}

        {/* No bookings for company */}
        {!loading && selectedCompany && allBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 inline-block border border-white/20">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Bookings Found</h3>
              <p className="text-gray-600">No bookings available for {selectedCompany}</p>
            </div>
          </div>
        )}

        {/* Initial state message */}
        {!loading && !selectedCompany && filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 inline-block border border-white/20">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Select a Company</h3>
              <p className="text-gray-600">Choose a company from the dropdown to view bookings</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyBookingManagement;