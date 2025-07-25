
"use client";

import React, { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

const Bookings = () => {
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tripType, setTripType] = useState("oneWay");
  const [userPickup, setUserPickUp] = useState("");
  const [userDrop, setUserDrop] = useState("");
  const [startDate, setStartDate] = useState("");
  const [time, setTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [car, setCar] = useState("Sedan");
  const [baseAmount, setBaseAmount] = useState("");
  const [collection, setCollection] = useState("0");
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [driverBhata, setDriverBhata] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [gst, setGst] = useState(0);
  const [serviceChargePercent, setServiceChargePercent] = useState("10");
  const [gstPercent, setGstPercent] = useState("5");
  const [distance, setDistance] = useState("");
  const [parking, setParking] = useState("0");
  const [toll, setToll] = useState("0");
  const [packageName, setPackageName] = useState("4hrs/40km"); // For rental trips
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const [includeDriverBhatta, setIncludeDriverBhatta] = useState(false);
  const [includeServiceCharge, setIncludeServiceCharge] = useState(false);
  const [includeGST, setIncludeGST] = useState(false);

  // Function to calculate total amount with all charges
  const calculateTotalAmount = (basePrice) => {
    if (!basePrice) return { total: 0, breakdown: { basePrice: 0, driverBhata: 0, serviceCharge: 0, gst: 0, parking: 0, toll: 0 } };

    let total = parseFloat(basePrice);
    let breakdown = {
      basePrice: total,
      driverBhata: 0,
      serviceCharge: 0,
      gst: 0,
      parking: parseFloat(parking) || 0,
      toll: parseFloat(toll) || 0
    };

    // Driver Bhata: 300 per day (assuming 1 day for simplicity)
    if (includeDriverBhatta) {
      breakdown.driverBhata = 300;
      total += breakdown.driverBhata;
    }

    // Add parking and toll charges
    total += breakdown.parking + breakdown.toll;

    // Service Charge: User-defined percentage
    if (includeServiceCharge && serviceChargePercent) {
      breakdown.serviceCharge = total * (parseFloat(serviceChargePercent) / 100);
      total += breakdown.serviceCharge;
    }

    // GST: User-defined percentage
    if (includeGST && gstPercent) {
      breakdown.gst = total * (parseFloat(gstPercent) / 100);
      total += breakdown.gst;
    }

    return { total: Math.round(total), breakdown };
  };

  // Function to handle form submission and generate PDF
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate required fields
    if (!userPickup || !userDrop || !startDate || !time || !name || !phone || !baseAmount || !distance) {
      setError("Please fill in all required fields (Pickup, Drop, Start Date, Time, Name, Phone, Amount, Distance)");
      return;
    }

    if (tripType === 'roundTrip' && !returnDate) {
      setError("Return date is required for round trip");
      return;
    }

    if (tripType === 'rental' && !packageName) {
      setError("Package selection is required for rental trips");
      return;
    }

    if (parseFloat(serviceChargePercent) < 0 || parseFloat(gstPercent) < 0) {
      setError("Service charge and GST percentages cannot be negative");
      return;
    }

    if (parseFloat(parking) < 0 || parseFloat(toll) < 0 || parseFloat(collection) < 0) {
      setError("Parking, toll, and collection amounts cannot be negative");
      return;
    }

    // Calculate total amount and breakdown
    const totalData = calculateTotalAmount(baseAmount);
    const totalAmount = totalData.total;
    const breakdown = totalData.breakdown;

    // Prepare booking data for PDF
    const bookingData = {
      bookingId: `BOOK${Math.floor(100000 + Math.random() * 900000)}`, // Generate a random booking ID
      tripType,
      userPickup,
      userDrop,
      startDate,
      time,
      returnDate: tripType === 'roundTrip' ? returnDate : null,
      packageName: tripType === 'rental' ? packageName : null,
      car,
      baseAmount: parseFloat(baseAmount),
      amount: totalAmount,
      collection: parseFloat(collection) || 0,
      name,
      email,
      phone,
      companyName,
      driverBhata: breakdown.driverBhata,
      serviceCharge: Math.round(breakdown.serviceCharge),
      gst: Math.round(breakdown.gst),
      parking: breakdown.parking,
      toll: breakdown.toll,
      distance: parseFloat(distance) || 0,
      days: tripType === 'roundTrip' && startDate && returnDate
        ? Math.ceil((new Date(returnDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
        : 1
    };

    // Generate and download PDF
    setGeneratingInvoice(true);
    setInvoiceError("");
    try {
      await generatePDFInvoice(bookingData);
      setSuccessMessage("Booking created and invoice downloaded successfully.");
      setError(null);
      setIsFormOpen(false);
      // Reset form
      setUserPickUp("");
      setUserDrop("");
      setDistance("");
      setName("");
      setEmail("");
      setPhone("");
      setCompanyName("");
      setStartDate("");
      setTime("");
      setReturnDate("");
      setBaseAmount("");
      setCollection("0");
      setTripType("oneWay");
      setPackageName("4hrs/40km");
      setIncludeDriverBhatta(false);
      setIncludeServiceCharge(false);
      setIncludeGST(false);
      setDriverBhata(0);
      setServiceCharge(0);
      setGst(0);
      setServiceChargePercent("10");
      setGstPercent("5");
      setParking("0");
      setToll("0");
    } catch (error) {
      setInvoiceError(`Failed to generate invoice: ${error.message}`);
      setError(`Failed to generate invoice: ${error.message}`);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Function to generate PDF from booking data
  const generatePDFInvoice = async (bookingData) => {
    const invoiceHTML = createInvoiceHTML(bookingData);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();

    printWindow.onload = async () => {
      try {
        const element = printWindow.document.querySelector('.container');
        element.style.width = '100%';
        element.style.maxWidth = '800px';
        element.style.margin = '0 auto';
        element.style.padding = '20px';
        element.style.boxSizing = 'border-box';

        await loadHTML2PDF(printWindow);

        const opt = {
          margin: [10, 10, 10, 10],
          filename: generatePDFFilename(bookingData),
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 1.2,
            useCORS: true,
            allowTaint: true,
            width: 800,
            height: null,
            scrollX: 0,
            scrollY: 0,
            letterRendering: true,
            logging: false
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await printWindow.html2pdf().set(opt).from(element).save();
        printWindow.close();
      } catch (error) {
        console.error('PDF download failed:', error);
        const printStyles = printWindow.document.createElement('style');
        printStyles.textContent = `
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          @media print {
            body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
            }
            .container {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 15mm !important;
              border: none !important;
              box-shadow: none !important;
              overflow: visible !important;
            }
            table {
              width: 100% !important;
              table-layout: fixed !important;
            }
            td, th {
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
          }
        `;
        printWindow.document.head.appendChild(printStyles);
        alert('PDF download failed. The print dialog will open - please select "Save as PDF" and choose A4 paper size for best results.');
        printWindow.print();
        printWindow.close();
      }
    };
  };

  // Function to load html2pdf library dynamically
  const loadHTML2PDF = (targetWindow) => {
    return new Promise((resolve, reject) => {
      const script = targetWindow.document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = resolve;
      script.onerror = reject;
      targetWindow.document.head.appendChild(script);
    });
  };

  // Function to generate PDF filename
  const generatePDFFilename = (bookingData) => {
    const bookingId = bookingData.bookingId || 'Unknown';
    const date = bookingData.startDate || new Date().toISOString().split('T')[0];
    const formattedDate = date.replace(/-/g, '');
    return `Invoice_${bookingId}_${formattedDate}.pdf`;
  };

  // Function to create HTML content for invoice
  const createInvoiceHTML = (bookingData) => {
    const formatDate = (dateString) => {
      if (!dateString || dateString === 'N/A') return 'N/A';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const getTripTypeDisplay = (tripType) => {
      switch(tripType) {
        case 'roundTrip': return 'Round';
        case 'oneWay': return 'One Way';
        case 'rental': return 'Rental';
        default: return 'One Way';
      }
    };

    const calculateDays = (bookingData) => {
      if (bookingData.days && bookingData.days > 0) return parseInt(bookingData.days);
      if (bookingData.startDate && bookingData.returnDate) {
        const startDate = new Date(bookingData.startDate);
        const endDate = new Date(bookingData.returnDate);
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }
      return 1;
    };

    const calculateSubtotal = (bookingData) => {
      const baseAmount = parseFloat(bookingData.baseAmount || bookingData.amount || 0);
      const driverBhata = parseFloat(bookingData.driverBhata || 0);
      const parking = parseFloat(bookingData.parking || 0);
      const toll = parseFloat(bookingData.toll || 0);
      return baseAmount + driverBhata + parking + toll;
    };

    const invoiceData = {
      bookid: bookingData.bookingId || 'N/A',
      car: bookingData.car || 'N/A',
      phone: bookingData.phone || 'N/A',
      pickup: bookingData.userPickup || 'N/A',
      drop: bookingData.userDrop || 'N/A',
      date: bookingData.startDate || 'N/A',
      time: bookingData.time || 'N/A',
      dateend: bookingData.returnDate || 'N/A',
      timeend: bookingData.time || '06:00 PM',
      trip: getTripTypeDisplay(bookingData.tripType),
      tripType: bookingData.tripType || 'oneWay',
      name: bookingData.name || 'N/A',
      email: bookingData.email || 'N/A',
      service: parseFloat(bookingData.serviceCharge || 0),
      parking: parseFloat(bookingData.parking || 0),
      toll: parseFloat(bookingData.toll || 0),
      gst: parseFloat(bookingData.gst || 0),
      distance: parseFloat(bookingData.distance || 0),
      amount: parseFloat(bookingData.baseAmount || bookingData.amount || 0),
      driver: parseFloat(bookingData.driverBhata || 0),
      days: calculateDays(bookingData),
      new_amount: calculateSubtotal(bookingData),
      totalpaidAmt: parseFloat(bookingData.amount || 0),
      remainAmt: parseFloat(bookingData.collection || 0),
      companyname: bookingData.companyName || '',
      companyaddress: '',
      gstno: ''
    };

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tax Invoice - ${invoiceData.bookid}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.3;
            font-size: 9pt;
            margin: 0;
            padding: 0;
            background-color: #fdfdfd;
        }
        .container {
            width: 100%;
            max-width: 800px;
            margin: 10px auto;
            padding: 20px;
            min-height: 100vh;
            border: 1px solid #eee;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            box-sizing: border-box;
            overflow: visible;
        }
        .container * {
            box-sizing: border-box;
            max-width: 100%;
        }
        @media print {
            body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
            }
            .container {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 15mm !important;
                border: none !important;
                box-shadow: none !important;
                page-break-inside: avoid;
                overflow: visible !important;
            }
            table {
                width: 100% !important;
                table-layout: fixed !important;
            }
            td, th {
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
            }
        }
        .invoice-header {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .logo {
            float: left;
            width: 30%;
            text-align: left;
        }
        .invoice-title {
            text-align: center;
            float: left;
            width: 40%;
            padding-top: 5px;
        }
        .invoice-info {
            float: right;
            width: 30%;
            text-align: right;
            padding-top: 5px;
        }
        .invoice-info p {
            margin: 3px 0;
        }
        .clearfix:after {
            content: "";
            display: table;
            clear: both;
        }
        .company-details {
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
        }
        .client-details {
            float: left;
            width: 48%;
            padding: 2px;
        }
        .provider-details {
            float: right;
            width: 48%;
            text-align: right;
            padding: 2px;
        }
        .client-details h4,
        .provider-details h4 {
            color: #333;
            font-weight: bold;
        }
        .section-title {
            background-color: #4285f4;
            color: white;
            padding: 4px 8px;
            font-weight: bold;
            border-radius: 3px 3px 0 0;
            margin-bottom: 0;
            font-size: 10pt;
        }
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .invoice-table th,
        .invoice-table td {
            padding: 3px 6px;
            border: 1px solid #ddd;
            font-size: 9pt;
        }
        .invoice-table th {
            background-color: #f1f1f1;
            text-align: left;
        }
        .invoice-table td {
            background-color: white;
        }
        .trip-details,
        .booking-details {
            margin-bottom: 8px;
        }
        .trip-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .trip-table th {
            background-color: #f1f1f1;
            border: 1px solid #ddd;
            padding: 3px 6px;
            text-align: left;
            font-size: 9pt;
            width: 33.33%;
        }
        .trip-table td {
            background-color: white;
            border: 1px solid #ddd;
            padding: 3px 6px;
            font-size: 9pt;
            width: 33.33%;
        }
        .subtotal-row {
            background-color: #f9f9f9;
            font-weight: bold;
        }
        .total-row {
            background-color: #f1f1f1;
            font-weight: bold;
        }
        .footer-container {
            margin-top: 4px;
            border-top: 1px solid #ddd;
            padding-top: 4px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .bank-details {
            float: left;
            width: 48%;
            padding: 2px;
        }
        .bank-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .bank-table th,
        .bank-table td {
            padding: 3px 6px;
            border: 1px solid #ddd;
            font-size: 9pt;
        }
        .bank-table th {
            background-color: #f1f1f1;
            text-align: left;
            width: 40%;
        }
        .bank-table td {
            background-color: white;
            width: 60%;
        }
        .signature-section {
            float: right;
            width: 48%;
            text-align: right;
            padding: 2px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }
        .terms-conditions {
            margin-top: 3px;
            margin-bottom: 6px;
            font-size: 9pt;
            clear: both;
        }
        .stamp-container {
            position: relative;
            height: 180px;
            margin-top: 0;
            text-align: right;
        }
        .stamp {
            position: relative;
            display: inline-block;
            margin-bottom: 10px;
        }
        .signature-text {
            margin-top: 5px;
            text-align: right;
            position: relative;
            z-index: 2;
        }
        .footer-note {
            clear: both;
            font-size: 7pt;
            padding-top: 4px;
        }
        hr.divider {
            height: 2px;
            background-color: #4285f4;
            border: none;
            margin: 0 0 12px 0;
        }
        h4 {
            margin: 4px 0;
            font-size: 10pt;
            font-weight: bold;
        }
        p {
            margin: 2px 0;
            line-height: 1.4;
        }
        strong {
            font-weight: bold;
        }
        .invoice-number {
            font-size: 11pt;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="invoice-header clearfix">
            <div class="logo">
                <img src="/images/wtlLogo.jpeg" height="60px" width="80px" alt="WTL Tourism Logo" style="margin: 0 auto; display: block; object-fit: contain;">
            </div>
            <div class="invoice-title">
                <h1 style="font-size: 30px; margin: 0; font-weight: bold;">TAX INVOICE</h1>
            </div>
            <div class="invoice-info">
                <p style="margin: 3px 0;"><strong>Date:</strong> ${formatDate(invoiceData.date)}</p>
                <p style="margin: 3px 0;">Invoice No: <span class="invoice-number">${invoiceData.bookid}</span></p>
            </div>
        </div>

        <hr class="divider">

        <div class="company-details clearfix">
            <div class="client-details">
                <p style="margin: 2px 0;"><strong>Company Name:</strong> ${invoiceData.companyname || 'N/A'}</p>
                ${invoiceData.companyaddress ? `<p style="margin: 2px 0;"><strong>Company Address:</strong> ${invoiceData.companyaddress}</p>` : ''}
                <p style="margin: 2px 0;"><strong>Name:</strong> ${invoiceData.name}</p>
                <p style="margin: 2px 0;"><strong>Mobile:</strong> ${invoiceData.phone} | <strong>Email:</strong> ${invoiceData.email}</p>
                <p style="margin: 2px 0;"><strong>GSTIN:</strong> ${invoiceData.gstno || 'N/A'}</p>
            </div>
            <div class="provider-details">
                <p style="margin: 2px 0;"><strong>WTL Tourism Pvt. Ltd.</strong></p>
                <p style="margin: 2px 0;"><strong>Mobile:</strong> 9325578091</p>
                <p style="margin: 2px 0;"><strong>Email:</strong> contact@worldtriplink.com</p>
                <p style="margin: 2px 0;"><strong>GSTIN:</strong> 27AADCW8531C1ZD</p>
            </div>
        </div>

        <div class="trip-details">
            <h3 class="section-title">TRIP DETAILS</h3>
            <table class="trip-table">
                <thead>
                    <tr>
                        <th>Pickup Location</th>
                        <th>Drop Location</th>
                        <th>Journey Type</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${invoiceData.pickup}</td>
                        <td>${invoiceData.drop}</td>
                        <td>${invoiceData.trip === 'Round' ? `${invoiceData.days} Days Round Trip` : invoiceData.trip}</td>
                    </tr>
                    <tr>
                        <th>Distance (Km)</th>
                        <th>${invoiceData.tripType === 'roundTrip' ? 'Start Date' : 'Pickup Date'}</th>
                        <th>${invoiceData.tripType === 'roundTrip' ? 'Start Time' : 'Pickup Time'}</th>
                    </tr>
                    <tr>
                        <td>${invoiceData.distance}</td>
                        <td>${formatDate(invoiceData.date)}</td>
                        <td>${invoiceData.time}</td>
                    </tr>
                    ${invoiceData.tripType === 'roundTrip' ? `
                    <tr>
                        <th>End Date</th>
                        <th>End Time</th>
                        <th></th>
                    </tr>
                    <tr>
                        <td>${formatDate(invoiceData.dateend)}</td>
                        <td>${invoiceData.timeend}</td>
                        <td></td>
                    </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>

        <div class="booking-details">
            <h3 class="section-title">BOOKING DETAILS</h3>
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th width="70%">Description</th>
                        <th width="30%">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Vehicle Type: ${invoiceData.car}</td>
                        <td>Rs.${invoiceData.amount}</td>
                    </tr>
                    ${invoiceData.trip === 'Round' && invoiceData.driver > 0 ? `
                    <tr>
                        <td>Driver Allowance</td>
                        <td>Rs.${invoiceData.driver}</td>
                    </tr>
                    ` : ''}
                    ${invoiceData.toll > 0 ? `
                    <tr>
                        <td>Toll Charges</td>
                        <td>Rs.${invoiceData.toll}</td>
                    </tr>
                    ` : ''}
                    ${invoiceData.parking > 0 ? `
                    <tr>
                        <td>Parking Charges</td>
                        <td>Rs.${invoiceData.parking}</td>
                    </tr>
                    ` : ''}
                    <tr class="subtotal-row">
                        <td>Subtotal</td>
                        <td>Rs.${invoiceData.new_amount}</td>
                    </tr>
                    ${invoiceData.service > 0 ? `
                    <tr>
                        <td>Service Charge (${serviceChargePercent}%)</td>
                        <td>Rs.${invoiceData.service}</td>
                    </tr>
                    ` : ''}
                    ${invoiceData.gst > 0 ? `
                    <tr>
                        <td>GST (${gstPercent}%)</td>
                        <td>Rs.${invoiceData.gst}</td>
                    </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td>Total Paid Amount</td>
                        <td>Rs.${invoiceData.totalpaidAmt}</td>
                    </tr>
                    ${invoiceData.new_amount !== invoiceData.totalpaidAmt ? `
                    <tr>
                        <td>Remaining Amount</td>
                        <td>Rs.${invoiceData.remainAmt}</td>
                    </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>

        <div class="terms-conditions">
            <h3 class="section-title">TERMS AND CONDITIONS</h3>
            <p style="margin: 2px 0; line-height: 1.2;">1. Extra Kilometer charges applicable beyond agreed distance. Toll, Parking and other charges additional as per actuals.</p>
            <p style="margin: 2px 0; line-height: 1.2;">2. Payment to be made in full before trip starts. Cancellation should be intimated 2 hours in advance for refund eligibility.</p>
        </div>

        <div class="footer-container clearfix">
            <div class="bank-details">
                <h3 class="section-title">BANK DETAILS</h3>
                <table class="bank-table">
                    <tr>
                        <th>Account Name</th>
                        <td>WTL Tourism Private Limited</td>
                    </tr>
                    <tr>
                        <th>Bank Name</th>
                        <td>AU Small Finance Bank Limited</td>
                    </tr>
                    <tr>
                        <th>Account Number</th>
                        <td>2402262260634299</td>
                    </tr>
                    <tr>
                        <th>IFSC CODE</th>
                        <td>AUBL0002622</td>
                    </tr>
                    <tr>
                        <th>Branch Name</th>
                        <td>Magarpatta</td>
                    </tr>
                </table>
            </div>

            <div class="signature-section">
                <div class="stamp-container">
                    <img src="/images/wtl-stamp.png" height="180px" width="200px" alt="WTL Tourism Stamp" class="stamp"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                         style="object-fit: contain; max-width: 200px; max-height: 180px; position: absolute; top: 26px;">
                    <div style="display:none; text-align:center; padding:20px; border:2px solid #1a237e; border-radius:50%; width:180px; height:180px; line-height:20px;">
                        <strong style="color:#1a237e;">WTL TOURISM<br>PUNE<br>PVT LTD</strong><br>
                        <small>Authorized Signature</small>
                    </div>
                </div>
                <p style="position: relative; right: -164px;"><strong>WTL Tourism Pvt. Ltd.</strong></p>
            </div>

            <div class="footer-note">
                ${invoiceData.toll === 0 && invoiceData.parking === 0 ? '<p><strong>Note: </strong>This is a computer-generated invoice. Toll, Parking and Extra KM charges will be as per the receipt.</p>' : ''}
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto p-6">
          <div className="bg-gray-100 p-4 flex items-center justify-between rounded-lg shadow">
            <h2 className="font-semibold text-lg flex items-center">
              <span className="mr-2">🚖</span> Create Custom Booking
            </h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="border p-2 rounded-md bg-black hover:bg-gray-800 text-white transition duration-300"
            >
              <FaPlus className="text-white" />
            </button>
          </div>

          {successMessage && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {isFormOpen && (
            <div className="bg-gradient-to-br from-white to-blue-50 p-8 shadow-2xl rounded-2xl mt-6 border border-blue-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Add New Custom Booking
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    setUserPickUp("");
                    setUserDrop("");
                    setDistance("");
                    setName("");
                    setEmail("");
                    setPhone("");
                    setCompanyName("");
                    setStartDate("");
                    setTime("");
                    setReturnDate("");
                    setBaseAmount("");
                    setCollection("0");
                    setTripType("oneWay");
                    setPackageName("4hrs/40km");
                    setIncludeDriverBhatta(false);
                    setIncludeServiceCharge(false);
                    setIncludeGST(false);
                    setDriverBhata(0);
                    setServiceCharge(0);
                    setGst(0);
                    setServiceChargePercent("10");
                    setGstPercent("5");
                    setParking("0");
                    setToll("0");
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 hover:bg-red-50 rounded-full"
                >
                  <FaTimes size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">
                    Trip Type
                  </label>
                  <div className="flex items-center space-x-6">
                    {["oneWay", "roundTrip", "rental"].map((type) => (
                      <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="tripType"
                          value={type}
                          checked={tripType === type}
                          onChange={() => setTripType(type)}
                          className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-gray-700 group-hover:text-blue-600 transition-colors duration-200 font-medium">
                          {type === "oneWay" ? "One Way" : type === "roundTrip" ? "Round Trip" : "Rental"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter company name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Trip Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pickup Location
                      </label>
                      <input
                        type="text"
                        placeholder="Enter pickup location"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={userPickup}
                        onChange={(e) => setUserPickUp(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Drop Location
                      </label>
                      <input
                        type="text"
                        placeholder="Enter drop location"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={userDrop}
                        onChange={(e) => setUserDrop(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Distance (km)
                      </label>
                      <input
                        type="number"
                        placeholder="Enter distance in km"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                      />
                    </div>
                    {tripType === "roundTrip" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Return Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    {tripType === "rental" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Package Type
                        </label>
                        <select
                          value={packageName}
                          onChange={(e) => setPackageName(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-white"
                        >
                          <option value="4hrs/40km">4hrs/40km Package</option>
                          <option value="8hrs/80km">8hrs/80km Package</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Car Type
                      </label>
                      <select
                        value={car}
                        onChange={(e) => setCar(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-white"
                      >
                        <option value="Hatchback">Hatchback</option>
                        <option value="Sedan">Sedan</option>
                        <option value="SedanPremium">Sedan Premium</option>
                        <option value="SUV">SUV</option>
                        <option value="SUVPlus">SUV Plus</option>
                        <option value="Ertiga">Ertiga</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Additional Charges
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-800">🚗 Driver Bhatta</span>
                          <span className="ml-2 text-sm text-gray-600">(₹300 per day)</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Daily allowance for driver accommodation and meals
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={includeDriverBhatta}
                          onChange={(e) => {
                            setIncludeDriverBhatta(e.target.checked);
                            const totalData = calculateTotalAmount(baseAmount);
                            setDriverBhata(totalData.breakdown.driverBhata);
                            setServiceCharge(Math.round(totalData.breakdown.serviceCharge));
                            setGst(Math.round(totalData.breakdown.gst));
                            setParking(totalData.breakdown.parking.toString());
                            setToll(totalData.breakdown.toll.toString());
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-800">💼 Service Charge</span>
                          <input
                            type="number"
                            placeholder="%"
                            className="ml-2 w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            value={serviceChargePercent}
                            onChange={(e) => {
                              setServiceChargePercent(e.target.value);
                              const totalData = calculateTotalAmount(baseAmount);
                              setDriverBhata(totalData.breakdown.driverBhata);
                              setServiceCharge(Math.round(totalData.breakdown.serviceCharge));
                              setGst(Math.round(totalData.breakdown.gst));
                              setParking(totalData.breakdown.parking.toString());
                              setToll(totalData.breakdown.toll.toString());
                            }}
                            min="0"
                          />
                          <span className="ml-1 text-sm text-gray-600">%</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Service fee for booking and customer support
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={includeServiceCharge}
                          onChange={(e) => {
                            setIncludeServiceCharge(e.target.checked);
                            const totalData = calculateTotalAmount(baseAmount);
                            setDriverBhata(totalData.breakdown.driverBhata);
                            setServiceCharge(Math.round(totalData.breakdown.serviceCharge));
                            setGst(Math.round(totalData.breakdown.gst));
                            setParking(totalData.breakdown.parking.toString());
                            setToll(totalData.breakdown.toll.toString());
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-800">📋 GST</span>
                          <input
                            type="number"
                            placeholder="%"
                            className="ml-2 w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                            value={gstPercent}
                            onChange={(e) => {
                              setGstPercent(e.target.value);
                              const totalData = calculateTotalAmount(baseAmount);
                              setDriverBhata(totalData.breakdown.driverBhata);
                              setServiceCharge(Math.round(totalData.breakdown.serviceCharge));
                              setGst(Math.round(totalData.breakdown.gst));
                              setParking(totalData.breakdown.parking.toString());
                              setToll(totalData.breakdown.toll.toString());
                            }}
                            min="0"
                          />
                          <span className="ml-1 text-sm text-gray-600">%</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Goods and Services Tax as per government regulations
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={includeGST}
                          onChange={(e) => {
                            setIncludeGST(e.target.checked);
                            const totalData = calculateTotalAmount(baseAmount);
                            setDriverBhata(totalData.breakdown.driverBhata);
                            setServiceCharge(Math.round(totalData.breakdown.serviceCharge));
                            setGst(Math.round(totalData.breakdown.gst));
                            setParking(totalData.breakdown.parking.toString());
                            setToll(totalData.breakdown.toll.toString());
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-800">🅿️ Parking Charges</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Additional charges for parking fees
                        </p>
                      </div>
                      <input
                        type="number"
                        placeholder="Enter parking charges"
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        value={parking}
                        onChange={(e) => {
                          setParking(e.target.value);
                          const totalData = calculateTotalAmount(baseAmount);
                          setDriverBhata(totalData.breakdown.driverBhata);
                          setServiceCharge(Math.round(totalData.breakdown.serviceCharge));
                          setGst(Math.round(totalData.breakdown.gst));
                          setParking(e.target.value || "0");
                          setToll(totalData.breakdown.toll.toString());
                        }}
                        min="0"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-800">🚧 Toll Charges</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Additional charges for toll fees
                        </p>
                      </div>
                      <input
                        type="number"
                        placeholder="Enter toll charges"
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        value={toll}
                        onChange={(e) => {
                          setToll(e.target.value);
                          const totalData = calculateTotalAmount(baseAmount);
                          setDriverBhata(totalData.breakdown.driverBhata);
                          setServiceCharge(Math.round(totalData.breakdown.serviceCharge));
                          setGst(Math.round(totalData.breakdown.gst));
                          setParking(totalData.breakdown.parking.toString());
                          setToll(e.target.value || "0");
                        }}
                        min="0"
                      />
                    </div>

                    {baseAmount > 0 && (
                      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">💰 Price Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base Price ({car}):</span>
                            <span className="font-medium">₹{parseFloat(baseAmount).toLocaleString()}</span>
                          </div>
                          {includeDriverBhatta && (
                            <div className="flex justify-between text-blue-700">
                              <span>Driver Bhata:</span>
                              <span className="font-medium">₹{driverBhata.toLocaleString()}</span>
                            </div>
                          )}
                          {parking > 0 && (
                            <div className="flex justify-between text-purple-700">
                              <span>Parking Charges:</span>
                              <span className="font-medium">₹{parseFloat(parking).toLocaleString()}</span>
                            </div>
                          )}
                          {toll > 0 && (
                            <div className="flex justify-between text-indigo-700">
                              <span>Toll Charges:</span>
                              <span className="font-medium">₹{parseFloat(toll).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-300 pt-2 flex justify-between font-bold">
                            <span>Subtotal:</span>
                            <span>₹{(parseFloat(baseAmount) + driverBhata + parseFloat(parking) + parseFloat(toll)).toLocaleString()}</span>
                          </div>
                          {includeServiceCharge && serviceCharge > 0 && (
                            <div className="flex justify-between text-green-700">
                              <span>Service Charge ({serviceChargePercent}%):</span>
                              <span className="font-medium">₹{serviceCharge.toLocaleString()}</span>
                            </div>
                          )}
                          {includeGST && gst > 0 && (
                            <div className="flex justify-between text-yellow-700">
                              <span>GST ({gstPercent}%):</span>
                              <span className="font-medium">₹{gst.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-300 pt-2 flex justify-between text-lg font-bold text-gray-800">
                            <span>Total Paid Amount:</span>
                            <span>₹{(calculateTotalAmount(baseAmount).total).toLocaleString()}</span>
                          </div>
                          {collection > 0 && (
                            <div className="flex justify-between text-red-700">
                              <span>Remaining Amount:</span>
                              <span className="font-medium">₹{parseFloat(collection).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Billing Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Base Amount
                      </label>
                      <input
                        type="number"
                        placeholder="Enter base amount"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={baseAmount}
                        onChange={(e) => {
                          setBaseAmount(e.target.value);
                          const totalData = calculateTotalAmount(e.target.value);
                          setDriverBhata(totalData.breakdown.driverBhata);
                          setServiceCharge(Math.round(totalData.breakdown.serviceCharge));
                          setGst(Math.round(totalData.breakdown.gst));
                          setParking(totalData.breakdown.parking.toString());
                          setToll(totalData.breakdown.toll.toString());
                        }}
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Collection (Remaining Amount)
                      </label>
                      <input
                        type="number"
                        placeholder="Enter remaining amount"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                        value={collection}
                        onChange={(e) => setCollection(e.target.value)}
                        required
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={generatingInvoice}
                    className={`w-full font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 ${
                      generatingInvoice
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl transform hover:scale-[1.02] focus:ring-blue-300'
                    }`}
                  >
                    {generatingInvoice ? 'Generating Invoice...' : 'Create Booking & Download Invoice'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;