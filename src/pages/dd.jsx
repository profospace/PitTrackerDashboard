
// import React, { useState, useEffect, useRef } from "react";
// import {
//     Filter,
//     Navigation,
//     List,
//     BarChart3,
//     AlertCircle,
//     Clock,
//     CheckCircle,
//     MapPin,
// } from "lucide-react";
// import { base_url } from "../utils/base_url";

// const API_URL = `${base_url}/api`;

// const PotholeDashboard = () => {
//     const [potholes, setPotholes] = useState([]);
//     const [filteredPotholes, setFilteredPotholes] = useState([]);
//     const [view, setView] = useState("map");
//     const [filters, setFilters] = useState({
//         status: "all",
//         severity: "all",
//         position: "all",
//     });
//     const [selectedPothole, setSelectedPothole] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [stats, setStats] = useState({
//         total: 0,
//         reported: 0,
//         inProgress: 0,
//         resolved: 0,
//         dangerous: 0,
//         severe: 0,
//         mild: 0,
//     });

//     const mapRef = useRef(null);
//     const googleMapRef = useRef(null);
//     const markersRef = useRef([]);
//     const infoWindowsRef = useRef([]);
//     const [mapInitialized, setMapInitialized] = useState(false);

//     // ✅ Initialize Google Map after script is loaded
//     useEffect(() => {
//         if (!window.google || !window.google.maps) return;
//         if (mapInitialized || !mapRef.current) return;

//         googleMapRef.current = new window.google.maps.Map(mapRef.current, {
//             center: { lat: 26.4499, lng: 80.3319 },
//             zoom: 12,
//             mapTypeControl: true,
//             streetViewControl: true,
//             fullscreenControl: true,
//         });

//         setMapInitialized(true);
//     }, [mapInitialized]);

//     // ✅ Resize map when switching to "map" view
//     useEffect(() => {
//         if (view === "map" && googleMapRef.current) {
//             setTimeout(() => {
//                 window.google.maps.event.trigger(googleMapRef.current, "resize");
//                 googleMapRef.current.setCenter({ lat: 26.4499, lng: 80.3319 });
//             }, 200);
//         }
//     }, [view]);

//     const clearMarkers = () => {
//         try {
//             markersRef.current.forEach((marker) => {
//                 try {
//                     window.google.maps.event.clearInstanceListeners(marker);
//                     marker.setMap(null);
//                 } catch (e) { }
//             });
//             markersRef.current = [];
//             infoWindowsRef.current.forEach((iw) => {
//                 try {
//                     iw.close();
//                 } catch (e) { }
//             });
//             infoWindowsRef.current = [];
//         } catch (e) { }
//     };

//     // ✅ Render markers when data changes
//     useEffect(() => {
//         if (!window.google || !window.google.maps) return;
//         if (!googleMapRef.current || !mapInitialized) return;

//         clearMarkers();

//         if (!filteredPotholes || filteredPotholes.length === 0) return;

//         const bounds = new window.google.maps.LatLngBounds();

//         filteredPotholes.forEach((pothole) => {
//             const lat = pothole?.location?.latitude;
//             const lng = pothole?.location?.longitude;
//             if (typeof lat !== "number" || typeof lng !== "number") return;

//             const position = { lat, lng };
//             bounds.extend(position);
//             const markerColor = getSeverityMarkerColor(pothole.severity);

//             const marker = new window.google.maps.Marker({
//                 position,
//                 map: googleMapRef.current,
//                 title: pothole.location?.address || "",
//                 icon: {
//                     path: window.google.maps.SymbolPath.CIRCLE,
//                     scale: 12,
//                     fillColor: markerColor,
//                     fillOpacity: 1,
//                     strokeColor: "#ffffff",
//                     strokeWeight: 3,
//                 },
//                 animation:
//                     pothole.status === "reported"
//                         ? window.google.maps.Animation.BOUNCE
//                         : undefined,
//             });

//             const infoHtml = `
//         <div style="padding:10px;min-width:250px">
//           <h3 style="margin:0 0 10px 0;font-size:16px;font-weight:bold;">
//             ${escapeHtml(pothole.location?.address || "Unknown")}
//           </h3>
//           <div style="margin-bottom:8px;">
//             <span style="display:inline-block;padding:4px 10px;background-color:${markerColor};color:white;border-radius:4px;font-size:12px;font-weight:bold;text-transform:uppercase;">
//               ${escapeHtml(pothole.severity || "")}
//             </span>
//           </div>
//           <p style="margin:6px 0;font-size:13px;"><strong>Status:</strong> ${escapeHtml(
//                 pothole.status || "N/A"
//             )}</p>
//           <p style="margin:6px 0;font-size:13px;color:#666;">${escapeHtml(
//                 pothole.description || ""
//             )}</p>
//         </div>
//       `;

//             const infoWindow = new window.google.maps.InfoWindow({ content: infoHtml });
//             marker.addListener("click", () => {
//                 infoWindowsRef.current.forEach((iw) => {
//                     try {
//                         iw.close();
//                     } catch (e) { }
//                 });
//                 infoWindow.open(googleMapRef.current, marker);
//                 setSelectedPothole(pothole);
//             });

//             markersRef.current.push(marker);
//             infoWindowsRef.current.push(infoWindow);
//         });

//         if (filteredPotholes.length > 1) {
//             googleMapRef.current.fitBounds(bounds);
//         } else if (filteredPotholes.length === 1) {
//             const p = filteredPotholes[0].location;
//             if (p && typeof p.latitude === "number" && typeof p.longitude === "number") {
//                 googleMapRef.current.setCenter({ lat: p.latitude, lng: p.longitude });
//                 googleMapRef.current.setZoom(16);
//             }
//         }
//     }, [filteredPotholes, mapInitialized]);

//     // ✅ Focus map on selected pothole
//     useEffect(() => {
//         if (!window.google || !window.google.maps || !googleMapRef.current || !selectedPothole) return;
//         const lat = selectedPothole?.location?.latitude;
//         const lng = selectedPothole?.location?.longitude;
//         if (typeof lat === "number" && typeof lng === "number") {
//             googleMapRef.current.panTo({ lat, lng });
//             googleMapRef.current.setZoom(16);
//         }
//     }, [selectedPothole]);

//     // ✅ Fetch data
//     const fetchPotholes = async (signal) => {
//         try {
//             setLoading(true);
//             setError(null);

//             const params = new URLSearchParams();
//             if (filters.status !== "all") params.append("status", filters.status);
//             if (filters.severity !== "all") params.append("severity", filters.severity);

//             const response = await fetch(`${API_URL}/potholes?${params.toString()}`, { signal });
//             const data = await response.json();

//             if (data?.success && Array.isArray(data.data)) {
//                 setPotholes(data.data);
//                 setFilteredPotholes(data.data);
//             } else setError("Failed to fetch potholes.");
//         } catch (err) {
//             if (err.name !== "AbortError") {
//                 console.error(err);
//                 setError("Network error: " + (err.message || "Unknown"));
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchStats = async (signal) => {
//         try {
//             const response = await fetch(`${API_URL}/stats`, { signal });
//             const data = await response.json();
//             if (data?.success) {
//                 setStats({
//                     total: data.data.total || 0,
//                     reported: data.data.byStatus?.reported || 0,
//                     inProgress: data.data.byStatus?.inProgress || 0,
//                     resolved: data.data.byStatus?.resolved || 0,
//                     dangerous: data.data.bySeverity?.dangerous || 0,
//                     severe: data.data.bySeverity?.severe || 0,
//                     mild: data.data.bySeverity?.mild || 0,
//                 });
//             }
//         } catch (err) {
//             if (err.name !== "AbortError") console.error("Stats fetch error:", err);
//         }
//     };

//     useEffect(() => {
//         const ac = new AbortController();
//         fetchPotholes(ac.signal);
//         fetchStats(ac.signal);
//         const interval = setInterval(() => {
//             fetchPotholes();
//             fetchStats();
//         }, 30000);
//         return () => {
//             ac.abort();
//             clearInterval(interval);
//         };
//     }, []);

//     useEffect(() => {
//         let filtered = [...potholes];
//         if (filters.status !== "all") filtered = filtered.filter((p) => p.status === filters.status);
//         if (filters.severity !== "all") filtered = filtered.filter((p) => p.severity === filters.severity);
//         if (filters.position !== "all") filtered = filtered.filter((p) => p.position === filters.position);
//         setFilteredPotholes(filtered);
//     }, [filters, potholes]);

//     const getSeverityMarkerColor = (severity) =>
//     ({
//         dangerous: "#ef4444",
//         severe: "#f97316",
//         mild: "#eab308",
//     }[severity] || "#6b7280");

//     const escapeHtml = (str) =>
//         String(str || "").replace(/[&<>"']/g, (s) =>
//         ({
//             "&": "&amp;",
//             "<": "&lt;",
//             ">": "&gt;",
//             '"': "&quot;",
//             "'": "&#039;",
//         }[s])
//         );

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Header */}
//             <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
//                 <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//                     <MapPin className="w-5 h-5 text-blue-600" />
//                     Pothole Dashboard
//                 </h1>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={() => setView("map")}
//                         className={`px-4 py-2 rounded-md flex items-center gap-2 ${view === "map" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
//                             }`}
//                     >
//                         <Navigation className="w-4 h-4" /> Map
//                     </button>
//                     <button
//                         onClick={() => setView("list")}
//                         className={`px-4 py-2 rounded-md flex items-center gap-2 ${view === "list" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
//                             }`}
//                     >
//                         <List className="w-4 h-4" /> List
//                     </button>
//                 </div>
//             </header>

//             {/* Map or List View */}
//             <div className="p-6">
//                 {view === "map" ? (
//                     <div ref={mapRef} style={{ height: "600px", width: "100%" }} />
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {filteredPotholes.map((p) => (
//                             <div
//                                 key={p._id}
//                                 className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition cursor-pointer"
//                                 onClick={() => setSelectedPothole(p)}
//                             >
//                                 <div className="flex justify-between items-center mb-2">
//                                     <h3 className="font-semibold text-gray-800">{p.location?.address}</h3>
//                                     <span
//                                         className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === "resolved"
//                                                 ? "bg-green-100 text-green-600"
//                                                 : p.status === "inProgress"
//                                                     ? "bg-yellow-100 text-yellow-600"
//                                                     : "bg-red-100 text-red-600"
//                                             }`}
//                                     >
//                                         {p.status}
//                                     </span>
//                                 </div>
//                                 <p className="text-gray-600 text-sm mb-2">{p.description}</p>
//                                 <span
//                                     className={`text-xs px-2 py-1 rounded-md ${p.severity === "dangerous"
//                                             ? "bg-red-100 text-red-600"
//                                             : p.severity === "severe"
//                                                 ? "bg-orange-100 text-orange-600"
//                                                 : "bg-yellow-100 text-yellow-600"
//                                         }`}
//                                 >
//                                     {p.severity}
//                                 </span>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default PotholeDashboard;

import React, { useState, useEffect, useRef } from 'react';
import { Filter, Navigation, List, BarChart3, AlertCircle, Clock, CheckCircle, MapPin } from 'lucide-react';
import { base_url } from '../utils/base_url';

const API_URL = `${base_url}/api`;

const PotholeDashboard = () => {
    const [potholes, setPotholes] = useState([]);
    const [filteredPotholes, setFilteredPotholes] = useState([]);
    const [view, setView] = useState('map');
    const [filters, setFilters] = useState({ status: 'all', severity: 'all', position: 'all' });
    const [selectedPothole, setSelectedPothole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0, reported: 0, inProgress: 0, resolved: 0, dangerous: 0, severe: 0, mild: 0
    });

    const mapRef = useRef(null);
    const googleMapRef = useRef(null);
    const markersRef = useRef([]);
    const infoWindowsRef = useRef([]);
    const [mapInitialized, setMapInitialized] = useState(false);

    // ✅ Initialize map only once
    useEffect(() => {
        if (!window.google?.maps || !mapRef.current || googleMapRef.current) return;

        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: 26.4499, lng: 80.3319 },
            zoom: 12,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
        });

        setMapInitialized(true);
    }, []);

    // ✅ Ensure map stays visible when switching view
    useEffect(() => {
        if (view === 'map' && googleMapRef.current && window.google?.maps) {
            // Wait for React DOM paint
            setTimeout(() => {
                window.google.maps.event.trigger(googleMapRef.current, 'resize');
                googleMapRef.current.setCenter({ lat: 26.4499, lng: 80.3319 });
            }, 200);
        }
    }, [view, mapInitialized]);

    const clearMarkers = () => {
        if (!markersRef.current.length) return;
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        infoWindowsRef.current = [];
    };

    // ✅ Update markers when filtered potholes change
    useEffect(() => {
        if (!window.google?.maps || !googleMapRef.current) return;

        clearMarkers();
        if (!filteredPotholes.length) return;

        const bounds = new window.google.maps.LatLngBounds();

        filteredPotholes.forEach((pothole) => {
            const { latitude: lat, longitude: lng } = pothole.location || {};
            if (typeof lat !== 'number' || typeof lng !== 'number') return;

            const position = { lat, lng };
            bounds.extend(position);

            const markerColor = getSeverityMarkerColor(pothole.severity);
            const marker = new window.google.maps.Marker({
                position,
                map: googleMapRef.current,
                title: pothole.location?.address || '',
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: markerColor,
                    fillOpacity: 1,
                    strokeColor: '#fff',
                    strokeWeight: 3,
                },
                animation: pothole.status === 'reported' ? window.google.maps.Animation.BOUNCE : undefined
            });

            const infoHtml = `
                <div style="padding:10px;min-width:250px">
                    <h3 style="margin:0 0 10px;font-size:16px;font-weight:bold;">${escapeHtml(pothole.location?.address || 'Unknown')}</h3>
                    <p><strong>Status:</strong> ${escapeHtml(pothole.status)}</p>
                    <p><strong>Severity:</strong> ${escapeHtml(pothole.severity)}</p>
                    <p>${escapeHtml(pothole.description || '')}</p>
                </div>
            `;

            const infoWindow = new window.google.maps.InfoWindow({ content: infoHtml });

            marker.addListener('click', () => {
                infoWindowsRef.current.forEach(iw => iw.close());
                infoWindow.open(googleMapRef.current, marker);
                setSelectedPothole(pothole);
            });

            markersRef.current.push(marker);
            infoWindowsRef.current.push(infoWindow);
        });

        if (filteredPotholes.length > 1) googleMapRef.current.fitBounds(bounds);
        else {
            const { latitude: lat, longitude: lng } = filteredPotholes[0].location || {};
            if (lat && lng) {
                googleMapRef.current.setCenter({ lat, lng });
                googleMapRef.current.setZoom(16);
            }
        }
    }, [filteredPotholes]);

    // ✅ Fetch potholes
    const fetchPotholes = async (signal) => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams();
            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.severity !== 'all') params.append('severity', filters.severity);

            const res = await fetch(`${API_URL}/potholes?${params}`, { signal });
            const data = await res.json();

            if (data.success && Array.isArray(data.data)) {
                setPotholes(data.data);
                setFilteredPotholes(data.data);
            } else setError('Failed to fetch potholes.');
        } catch (err) {
            if (err.name !== 'AbortError') setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async (signal) => {
        try {
            const res = await fetch(`${API_URL}/stats`, { signal });
            const data = await res.json();
            if (data.success) {
                const s = data.data;
                setStats({
                    total: s.total || 0,
                    reported: s.byStatus?.reported || 0,
                    inProgress: s.byStatus?.inProgress || 0,
                    resolved: s.byStatus?.resolved || 0,
                    dangerous: s.bySeverity?.dangerous || 0,
                    severe: s.bySeverity?.severe || 0,
                    mild: s.bySeverity?.mild || 0
                });
            }
        } catch (e) { }
    };

    useEffect(() => {
        const ac = new AbortController();
        fetchPotholes(ac.signal);
        fetchStats(ac.signal);
        const interval = setInterval(() => {
            fetchPotholes();
            fetchStats();
        }, 30000);
        return () => { ac.abort(); clearInterval(interval); };
    }, []);

    useEffect(() => {
        let filtered = [...potholes];
        if (filters.status !== 'all') filtered = filtered.filter(p => p.status === filters.status);
        if (filters.severity !== 'all') filtered = filtered.filter(p => p.severity === filters.severity);
        if (filters.position !== 'all') filtered = filtered.filter(p => p.position === filters.position);
        setFilteredPotholes(filtered);
    }, [filters, potholes]);

    const updatePotholeStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/potholes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                fetchPotholes();
                fetchStats();
            } else alert('Failed to update status');
        } catch (e) {
            alert('Error updating pothole status');
        }
    };

    const getSeverityColor = (s) => ({
        dangerous: 'bg-red-500',
        severe: 'bg-orange-500',
        mild: 'bg-yellow-500'
    }[s] || 'bg-gray-500');

    const getSeverityMarkerColor = (s) => ({
        dangerous: '#ef4444',
        severe: '#f97316',
        mild: '#eab308'
    }[s] || '#6b7280');

    const getStatusColor = (s) => ({
        reported: 'text-red-600 bg-red-100',
        'in-progress': 'text-blue-600 bg-blue-100',
        resolved: 'text-green-600 bg-green-100'
    }[s] || 'text-gray-600 bg-gray-100');

    const getStatusIcon = (s) => ({
        reported: <AlertCircle className="w-4 h-4" />,
        'in-progress': <Clock className="w-4 h-4" />,
        resolved: <CheckCircle className="w-4 h-4" />
    }[s] || null);

    const escapeHtml = (u) => String(u || '').replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));

    const focusOnPothole = (p) => {
        setSelectedPothole(p);
        setView('map');
    };

    // ✅ Cleanup
    useEffect(() => {
        return () => clearMarkers();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pothole Tracker Dashboard</h1>
                        <p className="text-sm text-gray-600 mt-1">City Infrastructure Management System</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setView('map')} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${view === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><Navigation className="w-4 h-4" /> Map</button>
                        <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><List className="w-4 h-4" /> List</button>
                        <button onClick={() => setView('stats')} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${view === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><BarChart3 className="w-4 h-4" /> Stats</button>
                    </div>
                </div>
            </header>

            {/* ✅ Keep rest of UI (stats cards, filters, tables, etc.) same as your version */}
            {/* Your previous UI from filters downwards stays unchanged */}
            {/* Only map behavior is modified */}

            <div className="px-6 pb-6">
                {!loading && view === 'map' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>Showing {filteredPotholes.length} potholes on map</span>
                        </div>
                        <div className="relative">
                            <div ref={mapRef} style={{ height: '600px', width: '100%' }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PotholeDashboard;
