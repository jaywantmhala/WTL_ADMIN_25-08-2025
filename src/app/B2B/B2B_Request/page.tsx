
"use client";
import React, { useState } from "react";
// import Navbar from "../../../container/components/Navbar";
import Navbar from "../../../container/components/Navbar"
import emailjs from "emailjs-com";

const RequestB2B = () => {
  // Use companyName and businessEmail for inputs.
  const [companyName, setCompanyName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [id, setId] = useState("");

  // EmailJS configuration values
  const serviceID = "service_tzo5m1e";
  const templateID = "template_v6q07bl";
  const publicKey = "Eg8OgIQYjByPpATWS";

  // When businessEmail input loses focus, fetch data by email
  const handleBusinessEmailBlur = async () => {
    if (!businessEmail) return;
    try {
      const response = await fetch(`http://localhost:8085/b2b/email/${businessEmail}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched record by email:", data);
        // Auto-populate company name and id if found
        setCompanyName(data.companyName || "");
        setId(data.id ? data.id.toString() : "");
      } else {
        // Clear if no record found
        console.log("No record found for the given email");
        setCompanyName("");
        setId("");
      }
    } catch (error) {
      console.error("Error fetching B2B data by email:", error);
      setCompanyName("");
      setId("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare template parameters using auto-fetched id and company name
    const templateParams = {
      company_name: companyName,         // {{company_name}}
      b2b_id: id || "Pending",           // {{b2b_id}} (will be actual id if record exists)
      business_email: businessEmail,     // {{business_email}}
      temporary_password: "B2B@123",     // {{temporary_password}}
      login_link: "http://localhost:3000/login" // {{login_link}}
    };

    try {
      const response = await emailjs.send(serviceID, templateID, templateParams, publicKey);
      console.log("Email sent successfully!", response.status, response.text);
      alert("Request Sent & Email Sent!");

      // Clear the form
      setCompanyName("");
      setBusinessEmail("");
      setId("");
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Request Sent, but failed to send email.");
    }
  };

  // Handle form reset
  const handleReset = () => {
    setCompanyName("");
    setBusinessEmail("");
    setId("");
  };

  return (
    <div className="flex">
      <Navbar />
      <div className="container mx-auto p-6 h-screen">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">Request B2B Registration</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Company Name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700">
              Business Email ID
            </label>
            <input
              type="email"
              id="businessEmail"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              onBlur={handleBusinessEmailBlur}
              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Business Email ID"
              required
            />
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-500 transition duration-200"
            >
              Send Request
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-red-400 text-white py-2 px-6 rounded-full hover:bg-red-500 transition duration-200"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestB2B;
