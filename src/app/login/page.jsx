"use client";

import { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Login() {
  // State to store username and password input
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null); // Store user response data

  // Router for redirection
  const router = useRouter();

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      // Make POST request to login API
      const response = await axios.post(" http://localhost:8085/wtlLogin", {
        username,
        password,
      });

      // Get user data from response and store it
      const data = response.data;
      setUser(data);

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data));

      // If the response contains a redirectUrl, use it; otherwise redirect to home page
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.push("/dashboard");
      }

      console.log("Login successful:", data);
    } catch (error) {
      console.error("Login failed:", error);
      // Optionally handle error display to the user here
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 mt-[-40px]">
        Login
      </h2>
      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-5 mt-[-20px]">
        {/* Username Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-6 flex items-center text-gray-500">
            <FaEnvelope className="mr-2" />
            <span>Username</span>
          </div>
          <input
            type="text"
            className="w-full pl-32 pr-5 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-6 flex items-center text-gray-500">
            <FaLock className="mr-2" />
            <span>Password</span>
          </div>
          <input
            type="password"
            className="w-full pl-36 pr-5 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none rounded-full shadow-md"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
