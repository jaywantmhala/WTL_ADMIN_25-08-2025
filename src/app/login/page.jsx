"use client";

import { useState,useEffect } from "react";
import axios from "axios";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { messaging} from '../../firebase-config';

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

      
      if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);

          // Get token
          getToken(messaging, {
            vapidKey: "BFeBBpUyxnCf54AL_Z16F357mX3oYFetAsdoMNhMrBmd1rPSFbpfFidAmq4Ho2NKNeSLe_7ogKudgk6lx8w5mts",
            serviceWorkerRegistration: registration,
          })
            .then((currentToken) => {
              if (currentToken) {
                console.log("FCM Token:", currentToken);
                // Send to backend if needed
               const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.id; // or get from Redux/context
                 console.log("userId", userId);

            fetch("http://localhost:8085/api/register-admin-token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                fcmToken: currentToken,
                userId: userId
              })
            });
              } else {
                console.log("No registration token available.");
              }
            })
            .catch((err) => {
              console.error("An error occurred while retrieving token.", err);
            });
        });
    }

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

  useEffect(() => {
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    // You can show in-app toast/notification here
  });
}, []);

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
