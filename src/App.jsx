// import React from 'react'
// import PotholeDashboard from './pages/PotholeDashboard'

// function App() {
//   return (
//     <div className=''>
//       <PotholeDashboard />
//     </div>
//   )
// }

// export default App

// import PotholeDashboard from "./pages/PotholeDashboard";
// import { LoadScript } from '@react-google-maps/api';

// // App Component with LoadScript wrapper
// function App() {
//   return (
//     <LoadScript
//       googleMapsApiKey={import.meta.env.VITE_GOOGLE_API_KEY}
//       loadingElement={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="mt-4 text-gray-600">Loading Google Maps...</p>
//         </div>
//       </div>}
//     >
//       <PotholeDashboard />
//     </LoadScript>
//   );
// }

// export default App;

import React, { useState } from "react";
import PotholeDashboard from "./pages/PotholeDashboard";
import { LoadScript } from "@react-google-maps/api";

function App() {
  const [googleReady, setGoogleReady] = useState(false);

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_API_KEY}
      onLoad={() => setGoogleReady(true)} // ✅ Ensures map API is ready
      loadingElement={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      }
    >
      {googleReady ? (
        <PotholeDashboard />
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Initializing map...</p>
          </div>
        </div>
      )}
    </LoadScript>
  );
}

export default App;
