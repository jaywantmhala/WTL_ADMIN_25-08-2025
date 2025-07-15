// 'use client';
// import Navbar from '../container/components/Navbar';  // Import your Navbar component
// import { useEffect, useState } from 'react';
// import '../styles/globals.css';  // Add your global styles

// export default function Layout({ children }) {
//   return (
//     <div className="flex min-h-auto bg-gray-100">
//       {/* Sidebar */}
//       <div className="w-64 bg-blue-600 text-white p-5">
//         <img className="mb-6 w-32 mx-auto" src="/images/wtlLogo.jpeg" alt="WTL Logo" />
//         <ul>
//           {/* Dashboard Link */}
//           <li>
//             <Link href="dashboard" className="block py-2 px-4 hover:bg-blue-500 rounded">
//               Dashboard
//             </Link>
//           </li>
//           {/* Dropdown Menu */}
//           <li className="relative">
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="flex items-center justify-between w-full py-2 px-4 hover:bg-blue-500 rounded"
//             >
//               All Booking
//               <FaChevronDown className={`ml-2 transform ${isOpen ? 'rotate-180' : ''}`} />
//             </button>
//             {isOpen && (
//               <ul className="absolute left-0 top-full mt-2 bg-white text-gray-700 rounded shadow-md z-10 w-48">
//                 <li>
//                   <Link
//                     href="/online-booking"
//                     className="flex items-center py-2 px-4 hover:bg-blue-100 rounded"
//                   >
//                     <FaGlobe className="mr-2" />
//                     Online Booking
//                   </Link>
//                 </li>
//                 <li>
//                   <Link
//                     href="/custom-booking"
//                     className="flex items-center py-2 px-4 hover:bg-blue-100 rounded"
//                   >
//                     <FaEdit className="mr-2" />
//                     Custom Booking
//                   </Link>
//                 </li>
//                 <li>
//                   <Link
//                     href="/cancel-booking"
//                     className="flex items-center py-2 px-4 hover:bg-blue-100 rounded"
//                   >
//                     <FaTimes className="mr-2" />
//                     Cancel Booking
//                   </Link>
//                 </li>
//               </ul>
//             )}
//           </li>

//           {/* Other Links */}
//           <li>
//             <Link href="/users" className="block py-2 px-4 hover:bg-blue-500 rounded">
//               Users
//             </Link>
//           </li>
//           <li>
//             <Link href="/settings" className="block py-2 px-4 hover:bg-blue-500 rounded">
//               Settings
//             </Link>
//           </li>
//         </ul>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-10">
//         {/* Navbar Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div className="text-xl font-semibold">Tourism Admin Panel</div>
//           <button className="text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700">
//             Logout
//           </button>
//         </div>

//         {/* Page Content (Dynamic) */}
//         {children}
//       </div>
//     </div>
//   );
// }
