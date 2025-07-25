"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import emailjs from "@emailjs/browser";
import Navbar from "../../container/components/Navbar";

export default function RequestVendorForm() {
  const [email, setEmail] = useState("");
  const [vendorName, setVendorName] = useState(""); // Added state for vendor name
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fetch Vendor Details by Email
      const vendorResponse = await fetch(` http://localhost:8085/vendors/email/${email}`);
      if (!vendorResponse.ok) {
        throw new Error("Failed to fetch vendor details");
      }

      const vendorData = await vendorResponse.json();
      setVendorName(vendorData.vendorCompanyName); // Update state
      const vendorId = vendorData.id; // ✅ Ensure correct property name
      const staticPassword = "Vendor@123"; // Static password for all vendors
      const loginLink = "https://vendor.worldtriplink.com/Login"; // Login page URL

      // Prepare Email Template Parameters
      const templateParams = {
        vendor_name: vendorData.vendorCompanyName,
        vendor_id: vendorId,
        to_email: email,
        password: staticPassword,
        login_link: loginLink, // ✅ Use plain text
      };

      console.log("Sending email with params:", templateParams);

      // Send Email via EmailJS
      const response = await emailjs.send(
        "service_q4a1qrb", // Service ID
        "template_7ggs4ra", // Template ID
        templateParams,
        "U6PgPbYIwxN_Gor3g" // Public Key
      );

      console.log("Email sent successfully:", response);
      alert("Request Sent Successfully!");
      router.push("/request-vendor/success");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send email. Please check your backend or EmailJS configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Navbar>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
          <h2 className="text-3xl font-bold text-blue-500 text-center">Request Vendor</h2>
          <p className="text-gray-500 text-center mb-6">
            Fill the form below to send a link for registration.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              
                
            <label className="block text-gray-700 font-medium">Vendor Name:</label>
                  <input 
                  type="text"
                  value={vendorName} 
                    onChange={(e) => setVendorName(e.target.value)} // ✅ Allow manual input
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
                    />


              <label className="block text-gray-700 font-medium">Email ID:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
                required
              />
              
            </div>

            <div className="flex justify-center space-x-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md flex items-center 
                  ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
              >
                {loading ? "Sending..." : <><span className="mr-2">⏺</span> Send Request</>}
              </button>
              <button
                type="reset"
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 flex items-center"
                onClick={() => {
                  setEmail("");
                  setVendorName(""); // ✅ Clear vendor name on reset
                }}
              >
                <span className="mr-2">⭕</span> Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </Navbar>
  );
}
