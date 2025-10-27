// import React, { useState, useEffect, useRef } from 'react';
// import { Filter, Navigation, List, BarChart3, AlertCircle, Clock, CheckCircle, MapPin } from 'lucide-react';

// const API_URL = 'http://localhost:5000/api';
// const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// const PotholeDashboard = () => {
//     const [potholes, setPotholes] = useState([]);
//     const [filteredPotholes, setFilteredPotholes] = useState([]);
//     const [view, setView] = useState('map');
//     const [filters, setFilters] = useState({
//         status: 'all',
//         severity: 'all',
//         position: 'all'
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
//         mild: 0
//     });

//     const mapRef = useRef(null);
//     const googleMapRef = useRef(null);
//     const markersRef = useRef([]);

//     // Load Google Maps
//     useEffect(() => {
//         if (window.google && window.google.maps) {
//             return;
//         }

//         const script = document.createElement('script');
//         script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
//         script.async = true;
//         script.defer = true;
//         document.head.appendChild(script);
//     }, []);

//     // Initialize Google Map
//     useEffect(() => {
//         if (!window.google || !window.google.maps || !mapRef.current || view !== 'map') {
//             return;
//         }

//         if (!googleMapRef.current) {
//             googleMapRef.current = new window.google.maps.Map(mapRef.current, {
//                 center: { lat: 26.4499, lng: 80.3319 },
//                 zoom: 12,
//                 mapTypeControl: true,
//                 streetViewControl: true,
//                 fullscreenControl: true,
//             });
//         }
//     }, [view, mapRef.current, window.google]);

//     // Update markers when filtered potholes change
//     useEffect(() => {
//         if (!googleMapRef.current || !window.google) return;

//         // Clear existing markers
//         markersRef.current.forEach(marker => marker.setMap(null));
//         markersRef.current = [];

//         const bounds = new window.google.maps.LatLngBounds();

//         filteredPotholes.forEach((pothole) => {
//             const position = {
//                 lat: pothole.location.latitude,
//                 lng: pothole.location.longitude
//             };

//             bounds.extend(position);

//             const markerColor = getSeverityMarkerColor(pothole.severity);

//             const marker = new window.google.maps.Marker({
//                 position: position,
//                 map: googleMapRef.current,
//                 title: pothole.location.address,
//                 icon: {
//                     path: window.google.maps.SymbolPath.CIRCLE,
//                     scale: 12,
//                     fillColor: markerColor,
//                     fillOpacity: 1,
//                     strokeColor: '#ffffff',
//                     strokeWeight: 3,
//                 },
//                 animation: pothole.status === 'reported' ? window.google.maps.Animation.BOUNCE : null
//             });

//             const infoWindow = new window.google.maps.InfoWindow({
//                 content: `
//           <div style="padding: 10px; min-width: 250px;">
//             <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">${pothole.location.address}</h3>
//             <div style="margin-bottom: 8px;">
//               <span style="
//                 display: inline-block;
//                 padding: 4px 10px;
//                 background-color: ${markerColor};
//                 color: white;
//                 border-radius: 4px;
//                 font-size: 12px;
//                 font-weight: bold;
//                 text-transform: uppercase;
//               ">${pothole.severity}</span>
//             </div>
//             <p style="margin: 6px 0; font-size: 13px;"><strong>Position:</strong> ${pothole.position}</p>
//             <p style="margin: 6px 0; font-size: 13px;"><strong>Status:</strong> ${pothole.status}</p>
//             <p style="margin: 6px 0; font-size: 13px; color: #666;">${pothole.description}</p>
//             <p style="margin: 6px 0 0 0; font-size: 12px; color: #999;">Reported by ${pothole.reportedBy} on ${new Date(pothole.timestamp).toLocaleDateString()}</p>
//           </div>
//         `
//             });

//             marker.addListener('click', () => {
//                 infoWindow.open(googleMapRef.current, marker);
//                 setSelectedPothole(pothole);
//             });

//             markersRef.current.push(marker);
//         });

//         if (filteredPotholes.length > 0) {
//             googleMapRef.current.fitBounds(bounds);
//         }
//     }, [filteredPotholes, googleMapRef.current]);

//     // Focus on selected pothole
//     useEffect(() => {
//         if (googleMapRef.current && selectedPothole) {
//             googleMapRef.current.panTo({
//                 lat: selectedPothole.location.latitude,
//                 lng: selectedPothole.location.longitude
//             });
//             googleMapRef.current.setZoom(16);
//         }
//     }, [selectedPothole]);

//     const fetchPotholes = async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             const params = new URLSearchParams();
//             if (filters.status !== 'all') params.append('status', filters.status);
//             if (filters.severity !== 'all') params.append('severity', filters.severity);

//             const response = await fetch(`${API_URL}/potholes?${params.toString()}`);
//             const data = await response.json();

//             if (data.success) {
//                 setPotholes(data.data);
//                 setFilteredPotholes(data.data);
//             } else {
//                 setError('Failed to fetch potholes');
//             }
//         } catch (err) {
//             setError('Network error: ' + err.message);
//             console.error('Error fetching potholes:', err);

//             // Demo data fallback
//             const demoData = [
//                 {
//                     _id: '1',
//                     location: { address: 'Mall Road, Kanpur', latitude: 26.4499, longitude: 80.3319 },
//                     severity: 'dangerous',
//                     position: 'middle',
//                     status: 'reported',
//                     description: 'Large pothole causing traffic issues',
//                     reportedBy: 'John Doe',
//                     timestamp: new Date().toISOString()
//                 },
//                 {
//                     _id: '2',
//                     location: { address: 'Civil Lines, Kanpur', latitude: 26.4670, longitude: 80.3500 },
//                     severity: 'severe',
//                     position: 'left',
//                     status: 'in-progress',
//                     description: 'Deep pothole near intersection',
//                     reportedBy: 'Jane Smith',
//                     timestamp: new Date(Date.now() - 86400000).toISOString()
//                 },
//                 {
//                     _id: '3',
//                     location: { address: 'Swaroop Nagar, Kanpur', latitude: 26.4720, longitude: 80.3150 },
//                     severity: 'mild',
//                     position: 'right',
//                     status: 'resolved',
//                     description: 'Small pothole on service road',
//                     reportedBy: 'City Worker',
//                     timestamp: new Date(Date.now() - 172800000).toISOString()
//                 },
//                 {
//                     _id: '4',
//                     location: { address: 'Kakadeo, Kanpur', latitude: 26.4290, longitude: 80.3410 },
//                     severity: 'dangerous',
//                     position: 'full-width',
//                     status: 'reported',
//                     description: 'Major road damage across entire width',
//                     reportedBy: 'Traffic Police',
//                     timestamp: new Date(Date.now() - 3600000).toISOString()
//                 },
//                 {
//                     _id: '5',
//                     location: { address: 'Panki, Kanpur', latitude: 26.4100, longitude: 80.2800 },
//                     severity: 'severe',
//                     position: 'middle',
//                     status: 'in-progress',
//                     description: 'Growing pothole near industrial area',
//                     reportedBy: 'Local Resident',
//                     timestamp: new Date(Date.now() - 259200000).toISOString()
//                 },
//                 {
//                     _id: '6',
//                     location: { address: 'Kalyanpur, Kanpur', latitude: 26.5100, longitude: 80.2300 },
//                     severity: 'mild',
//                     position: 'left',
//                     status: 'reported',
//                     description: 'Small surface damage',
//                     reportedBy: 'Anonymous',
//                     timestamp: new Date(Date.now() - 7200000).toISOString()
//                 }
//             ];

//             setPotholes(demoData);
//             setFilteredPotholes(demoData);

//             // Calculate demo stats
//             const demoStats = {
//                 total: demoData.length,
//                 reported: demoData.filter(p => p.status === 'reported').length,
//                 inProgress: demoData.filter(p => p.status === 'in-progress').length,
//                 resolved: demoData.filter(p => p.status === 'resolved').length,
//                 dangerous: demoData.filter(p => p.severity === 'dangerous').length,
//                 severe: demoData.filter(p => p.severity === 'severe').length,
//                 mild: demoData.filter(p => p.severity === 'mild').length
//             };
//             setStats(demoStats);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchStats = async () => {
//         try {
//             const response = await fetch(`${API_URL}/stats`);
//             const data = await response.json();

//             if (data.success) {
//                 setStats({
//                     total: data.data.total,
//                     reported: data.data.byStatus.reported,
//                     inProgress: data.data.byStatus.inProgress,
//                     resolved: data.data.byStatus.resolved,
//                     dangerous: data.data.bySeverity.dangerous || 0,
//                     severe: data.data.bySeverity.severe || 0,
//                     mild: data.data.bySeverity.mild || 0
//                 });
//             }
//         } catch (err) {
//             console.error('Error fetching stats:', err);
//         }
//     };

//     useEffect(() => {
//         fetchPotholes();
//         fetchStats();

//         const interval = setInterval(() => {
//             fetchPotholes();
//             fetchStats();
//         }, 30000);

//         return () => clearInterval(interval);
//     }, []);

//     useEffect(() => {
//         applyFilters();
//     }, [filters, potholes]);

//     const applyFilters = () => {
//         let filtered = [...potholes];

//         if (filters.status !== 'all') {
//             filtered = filtered.filter(p => p.status === filters.status);
//         }
//         if (filters.severity !== 'all') {
//             filtered = filtered.filter(p => p.severity === filters.severity);
//         }
//         if (filters.position !== 'all') {
//             filtered = filtered.filter(p => p.position === filters.position);
//         }

//         setFilteredPotholes(filtered);
//     };

//     const updatePotholeStatus = async (id, newStatus) => {
//         try {
//             const response = await fetch(`${API_URL}/potholes/${id}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ status: newStatus }),
//             });

//             const data = await response.json();

//             if (data.success) {
//                 fetchPotholes();
//                 fetchStats();
//             } else {
//                 alert('Failed to update status');
//             }
//         } catch (err) {
//             console.error('Error updating pothole:', err);
//             alert('Error updating pothole status');
//         }
//     };

//     const getSeverityColor = (severity) => {
//         switch (severity) {
//             case 'dangerous': return 'bg-red-500';
//             case 'severe': return 'bg-orange-500';
//             case 'mild': return 'bg-yellow-500';
//             default: return 'bg-gray-500';
//         }
//     };

//     const getSeverityMarkerColor = (severity) => {
//         switch (severity) {
//             case 'dangerous': return '#ef4444';
//             case 'severe': return '#f97316';
//             case 'mild': return '#eab308';
//             default: return '#6b7280';
//         }
//     };

//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'reported': return 'text-red-600 bg-red-100';
//             case 'in-progress': return 'text-blue-600 bg-blue-100';
//             case 'resolved': return 'text-green-600 bg-green-100';
//             default: return 'text-gray-600 bg-gray-100';
//         }
//     };

//     const getStatusIcon = (status) => {
//         switch (status) {
//             case 'reported': return <AlertCircle className="w-4 h-4" />;
//             case 'in-progress': return <Clock className="w-4 h-4" />;
//             case 'resolved': return <CheckCircle className="w-4 h-4" />;
//             default: return null;
//         }
//     };

//     const focusOnPothole = (pothole) => {
//         setSelectedPothole(pothole);
//         setView('map');
//     };

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <header className="bg-white shadow-sm border-b">
//                 <div className="px-6 py-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <h1 className="text-2xl font-bold text-gray-900">Pothole Tracker Dashboard</h1>
//                             <p className="text-sm text-gray-600 mt-1">City Infrastructure Management System</p>
//                         </div>
//                         <div className="flex gap-2">
//                             <button
//                                 onClick={() => setView('map')}
//                                 className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${view === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                                     }`}
//                             >
//                                 <Navigation className="w-4 h-4" />
//                                 Map
//                             </button>
//                             <button
//                                 onClick={() => setView('list')}
//                                 className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                                     }`}
//                             >
//                                 <List className="w-4 h-4" />
//                                 List
//                             </button>
//                             <button
//                                 onClick={() => setView('stats')}
//                                 className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${view === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                                     }`}
//                             >
//                                 <BarChart3 className="w-4 h-4" />
//                                 Stats
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </header>

//             {error && (
//                 <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//                     <p className="font-semibold">Error</p>
//                     <p className="text-sm">{error}</p>
//                     <button
//                         onClick={fetchPotholes}
//                         className="mt-2 text-sm underline hover:no-underline"
//                     >
//                         Try again
//                     </button>
//                 </div>
//             )}

//             <div className="px-6 py-4">
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                     <div className="bg-white p-4 rounded-lg shadow">
//                         <div className="text-sm text-gray-600">Total Reports</div>
//                         <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
//                     </div>
//                     <div className="bg-white p-4 rounded-lg shadow">
//                         <div className="text-sm text-gray-600">Reported</div>
//                         <div className="text-2xl font-bold text-red-600 mt-1">{stats.reported}</div>
//                     </div>
//                     <div className="bg-white p-4 rounded-lg shadow">
//                         <div className="text-sm text-gray-600">In Progress</div>
//                         <div className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</div>
//                     </div>
//                     <div className="bg-white p-4 rounded-lg shadow">
//                         <div className="text-sm text-gray-600">Resolved</div>
//                         <div className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</div>
//                     </div>
//                 </div>
//             </div>

//             <div className="px-6 py-4">
//                 <div className="bg-white p-4 rounded-lg shadow">
//                     <div className="flex items-center gap-2 mb-3">
//                         <Filter className="w-5 h-5 text-gray-600" />
//                         <h3 className="font-semibold text-gray-900">Filters</h3>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <select
//                             value={filters.status}
//                             onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                             className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                             <option value="all">All Status</option>
//                             <option value="reported">Reported</option>
//                             <option value="in-progress">In Progress</option>
//                             <option value="resolved">Resolved</option>
//                         </select>
//                         <select
//                             value={filters.severity}
//                             onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
//                             className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                             <option value="all">All Severity</option>
//                             <option value="mild">Mild</option>
//                             <option value="severe">Severe</option>
//                             <option value="dangerous">Dangerous</option>
//                         </select>
//                         <select
//                             value={filters.position}
//                             onChange={(e) => setFilters({ ...filters, position: e.target.value })}
//                             className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                             <option value="all">All Positions</option>
//                             <option value="left">Left</option>
//                             <option value="middle">Middle</option>
//                             <option value="right">Right</option>
//                             <option value="full-width">Full Width</option>
//                         </select>
//                     </div>
//                 </div>
//             </div>

//             <div className="px-6 pb-6">
//                 {loading && (
//                     <div className="bg-white rounded-lg shadow p-8 text-center">
//                         <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                         <p className="mt-4 text-gray-600">Loading potholes...</p>
//                     </div>
//                 )}

//                 {!loading && view === 'map' && (
//                     <div className="bg-white rounded-lg shadow overflow-hidden">
//                         <div className="p-4 border-b bg-gray-50">
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                                 <MapPin className="w-4 h-4" />
//                                 <span>Showing {filteredPotholes.length} potholes on map</span>
//                             </div>
//                         </div>
//                         <div className="relative">
//                             <div
//                                 ref={mapRef}
//                                 style={{ height: '600px', width: '100%' }}
//                             />

//                             <div className="absolute right-4 top-4 bottom-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
//                                 <div className="p-4 bg-blue-600 text-white font-semibold">
//                                     Pothole Locations ({filteredPotholes.length})
//                                 </div>
//                                 <div className="overflow-y-auto h-full pb-20">
//                                     {filteredPotholes.length === 0 ? (
//                                         <div className="p-4 text-center text-gray-500">
//                                             No potholes found with current filters
//                                         </div>
//                                     ) : (
//                                         filteredPotholes.map((pothole) => (
//                                             <div
//                                                 key={pothole._id}
//                                                 onClick={() => setSelectedPothole(pothole)}
//                                                 className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedPothole?._id === pothole._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
//                                                     }`}
//                                             >
//                                                 <div className="flex items-start justify-between gap-2">
//                                                     <div className="flex-1">
//                                                         <div className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white mb-2 ${getSeverityColor(pothole.severity)}`}>
//                                                             {pothole.severity.toUpperCase()}
//                                                         </div>
//                                                         <p className="font-semibold text-sm">{pothole.location.address}</p>
//                                                         <p className="text-xs text-gray-600 mt-1">
//                                                             Position: <span className="font-medium capitalize">{pothole.position}</span>
//                                                         </p>
//                                                         <p className="text-xs text-gray-600 mt-1">{pothole.description}</p>
//                                                         <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium mt-2 ${getStatusColor(pothole.status)}`}>
//                                                             {getStatusIcon(pothole.status)}
//                                                             {pothole.status}
//                                                         </div>
//                                                     </div>
//                                                     <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
//                                                 </div>
//                                                 <div className="text-xs text-gray-500 mt-2">
//                                                     {new Date(pothole.timestamp).toLocaleString()}
//                                                 </div>
//                                             </div>
//                                         ))
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {!loading && view === 'list' && (
//                     <div className="bg-white rounded-lg shadow">
//                         {filteredPotholes.length === 0 ? (
//                             <div className="p-8 text-center text-gray-500">
//                                 No potholes found with current filters
//                             </div>
//                         ) : (
//                             <div className="overflow-x-auto">
//                                 <table className="w-full">
//                                     <thead className="bg-gray-50 border-b">
//                                         <tr>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Severity</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Position</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reporter</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y">
//                                         {filteredPotholes.map((pothole) => (
//                                             <tr key={pothole._id} className="hover:bg-gray-50">
//                                                 <td className="px-4 py-3 text-sm font-mono text-gray-600">#{pothole._id.slice(-6)}</td>
//                                                 <td className="px-4 py-3 text-sm">
//                                                     <div className="flex items-center gap-2">
//                                                         <MapPin className="w-4 h-4 text-gray-400" />
//                                                         <div className="font-medium">{pothole.location.address}</div>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-4 py-3">
//                                                     <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${getSeverityColor(pothole.severity)}`}>
//                                                         {pothole.severity}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-4 py-3 text-sm capitalize">{pothole.position}</td>
//                                                 <td className="px-4 py-3">
//                                                     <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(pothole.status)}`}>
//                                                         {getStatusIcon(pothole.status)}
//                                                         {pothole.status}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-4 py-3 text-sm">{pothole.reportedBy}</td>
//                                                 <td className="px-4 py-3 text-sm">{new Date(pothole.timestamp).toLocaleDateString()}</td>
//                                                 <td className="px-4 py-3">
//                                                     <div className="flex gap-2">
//                                                         <select
//                                                             value={pothole.status}
//                                                             onChange={(e) => updatePotholeStatus(pothole._id, e.target.value)}
//                                                             className="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                                         >
//                                                             <option value="reported">Reported</option>
//                                                             <option value="in-progress">In Progress</option>
//                                                             <option value="resolved">Resolved</option>
//                                                         </select>
//                                                         <button
//                                                             onClick={() => focusOnPothole(pothole)}
//                                                             className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
//                                                         >
//                                                             View
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {!loading && view === 'stats' && (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="bg-white p-6 rounded-lg shadow">
//                             <h3 className="font-semibold text-lg mb-4">Severity Distribution</h3>
//                             <div className="space-y-4">
//                                 <div>
//                                     <div className="flex justify-between mb-2">
//                                         <span className="text-sm font-medium">Dangerous</span>
//                                         <span className="text-sm text-gray-600">{stats.dangerous} ({stats.total > 0 ? Math.round((stats.dangerous / stats.total) * 100) : 0}%)</span>
//                                     </div>
//                                     <div className="w-full bg-gray-200 rounded-full h-3">
//                                         <div className="bg-red-500 h-3 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.dangerous / stats.total) * 100 : 0}%` }}></div>
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <div className="flex justify-between mb-2">
//                                         <span className="text-sm font-medium">Severe</span>
//                                         <span className="text-sm text-gray-600">{stats.severe} ({stats.total > 0 ? Math.round((stats.severe / stats.total) * 100) : 0}%)</span>
//                                     </div>
//                                     <div className="w-full bg-gray-200 rounded-full h-3">
//                                         <div className="bg-orange-500 h-3 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.severe / stats.total) * 100 : 0}%` }}></div>
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <div className="flex justify-between mb-2">
//                                         <span className="text-sm font-medium">Mild</span>
//                                         <span className="text-sm text-gray-600">{stats.mild} ({stats.total > 0 ? Math.round((stats.mild / stats.total) * 100) : 0}%)</span>
//                                     </div>
//                                     <div className="w-full bg-gray-200 rounded-full h-3">
//                                         <div className="bg-yellow-500 h-3 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.mild / stats.total) * 100 : 0}%` }}></div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white p-6 rounded-lg shadow">
//                             <h3 className="font-semibold text-lg mb-4">Status Overview</h3>
//                             <div className="space-y-4">
//                                 <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
//                                     <div className="flex items-center gap-3">
//                                         <AlertCircle className="w-6 h-6 text-red-600" />
//                                         <div>
//                                             <div className="font-medium text-gray-900">Reported</div>
//                                             <div className="text-xs text-gray-600">Awaiting action</div>
//                                         </div>
//                                     </div>
//                                     <span className="text-2xl font-bold text-red-600">{stats.reported}</span>
//                                 </div>
//                                 <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
//                                     <div className="flex items-center gap-3">
//                                         <Clock className="w-6 h-6 text-blue-600" />
//                                         <div>
//                                             <div className="font-medium text-gray-900">In Progress</div>
//                                             <div className="text-xs text-gray-600">Being fixed</div>
//                                         </div>
//                                     </div>
//                                     <span className="text-2xl font-bold text-blue-600">{stats.inProgress}</span>
//                                 </div>
//                                 <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
//                                     <div className="flex items-center gap-3">
//                                         <CheckCircle className="w-6 h-6 text-green-600" />
//                                         <div>
//                                             <div className="font-medium text-gray-900">Resolved</div>
//                                             <div className="text-xs text-gray-600">Completed</div>
//                                         </div>
//                                     </div>
//                                     <span className="text-2xl font-bold text-green-600">{stats.resolved}</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
//                             <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
//                             <div className="space-y-3">
//                                 {potholes.slice(0, 5).map((pothole) => (
//                                     <div key={pothole._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                                         <div className="flex items-center gap-3">
//                                             <div className={`w-2 h-2 rounded-full ${getSeverityColor(pothole.severity)}`}></div>
//                                             <div>
//                                                 <div className="text-sm font-medium">{pothole.location.address}</div>
//                                                 <div className="text-xs text-gray-600">
//                                                     Reported by {pothole.reportedBy} • {new Date(pothole.timestamp).toLocaleString()}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(pothole.status)}`}>
//                                             {getStatusIcon(pothole.status)}
//                                             {pothole.status}
//                                         </span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default PotholeDashboard;


// import React, { useState, useEffect, useRef } from 'react';
// import { Filter, Navigation, List, BarChart3, AlertCircle, Clock, CheckCircle, MapPin } from 'lucide-react';

// const API_URL = 'http://localhost:5000/api';
// const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// // Promise-based Google Maps loader (prevents duplicate script injection & race)
// function loadGoogleMaps(apiKey) {
//     if (typeof window === 'undefined') return Promise.reject(new Error('No window object'));
//     if (window.__gmapsLoaderPromise) return window.__gmapsLoaderPromise;

//     window.__gmapsLoaderPromise = new Promise((resolve, reject) => {
//         if (window.google && window.google.maps) return resolve(window.google);

//         const existing = document.querySelector('script[data-gmaps="true"]');
//         if (existing) {
//             existing.addEventListener('load', () => {
//                 if (window.google && window.google.maps) resolve(window.google);
//                 else reject(new Error('Google Maps failed to load'));
//             });
//             existing.addEventListener('error', () => reject(new Error('Google Maps script error')));
//             return;
//         }

//         const script = document.createElement('script');
//         script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
//         script.async = true;
//         script.defer = true;
//         script.setAttribute('data-gmaps', 'true');

//         script.onload = () => {
//             if (window.google && window.google.maps) resolve(window.google);
//             else reject(new Error('Google Maps loaded but window.google missing'));
//         };
//         script.onerror = (err) => reject(new Error('Failed to load Google Maps script: ' + (err?.message || 'unknown')));

//         document.head.appendChild(script);
//     });

//     return window.__gmapsLoaderPromise;
// }

// const PotholeDashboard = () => {
//     const [potholes, setPotholes] = useState([]);
//     const [filteredPotholes, setFilteredPotholes] = useState([]);
//     const [view, setView] = useState('map');
//     const [filters, setFilters] = useState({ status: 'all', severity: 'all', position: 'all' });
//     const [selectedPothole, setSelectedPothole] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [stats, setStats] = useState({
//         total: 0, reported: 0, inProgress: 0, resolved: 0, dangerous: 0, severe: 0, mild: 0
//     });

//     const mapRef = useRef(null);
//     const googleMapRef = useRef(null);
//     const googleLoadedRef = useRef(false);
//     const markersRef = useRef([]);
//     const infoWindowsRef = useRef([]);

//     // Load Google maps script once
//     useEffect(() => {
//         let mounted = true;
//         loadGoogleMaps(GOOGLE_MAPS_API_KEY)
//             .then(() => {
//                 if (!mounted) return;
//                 googleLoadedRef.current = true;
//                 // initialize map immediately only if map view visible and container present
//                 if (view === 'map' && mapRef.current && !googleMapRef.current) {
//                     googleMapRef.current = new window.google.maps.Map(mapRef.current, {
//                         center: { lat: 26.4499, lng: 80.3319 },
//                         zoom: 12,
//                         mapTypeControl: true,
//                         streetViewControl: true,
//                         fullscreenControl: true,
//                     });
//                 }
//             })
//             .catch((err) => {
//                 console.error('Google Maps load error:', err);
//                 setError('Failed to load Google Maps.');
//             });

//         return () => { mounted = false; };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     // Ensure map exists when switching to map view
//     useEffect(() => {
//         if (!googleLoadedRef.current) return;
//         if (view !== 'map') return;
//         if (!mapRef.current) return;

//         if (!googleMapRef.current) {
//             googleMapRef.current = new window.google.maps.Map(mapRef.current, {
//                 center: { lat: 26.4499, lng: 80.3319 },
//                 zoom: 12,
//                 mapTypeControl: true,
//                 streetViewControl: true,
//                 fullscreenControl: true,
//             });
//         }
//     }, [view]);

//     // Clear markers and info windows helper
//     const clearMarkers = () => {
//         try {
//             markersRef.current.forEach(marker => {
//                 try { window.google && window.google.maps.event.clearInstanceListeners(marker); } catch (e) { }
//                 try { marker.setMap(null); } catch (e) { }
//             });
//             markersRef.current = [];
//             infoWindowsRef.current.forEach(iw => { try { iw.close(); } catch (e) { } });
//             infoWindowsRef.current = [];
//         } catch (e) {
//             // ignore
//         }
//     };

//     // Create/update markers when filteredPotholes change
//     useEffect(() => {
//         if (!googleLoadedRef.current) return;
//         if (!googleMapRef.current) return;

//         clearMarkers();

//         if (!filteredPotholes || filteredPotholes.length === 0) return;

//         const bounds = new window.google.maps.LatLngBounds();

//         filteredPotholes.forEach((pothole) => {
//             const lat = pothole?.location?.latitude;
//             const lng = pothole?.location?.longitude;
//             if (typeof lat !== 'number' || typeof lng !== 'number') return;

//             const position = { lat, lng };
//             bounds.extend(position);

//             const markerColor = getSeverityMarkerColor(pothole.severity);

//             const marker = new window.google.maps.Marker({
//                 position,
//                 map: googleMapRef.current,
//                 title: pothole.location?.address || '',
//                 icon: {
//                     path: window.google.maps.SymbolPath.CIRCLE,
//                     scale: 12,
//                     fillColor: markerColor,
//                     fillOpacity: 1,
//                     strokeColor: '#ffffff',
//                     strokeWeight: 3,
//                 },
//                 // animation: pothole.status === 'reported' ? window.google.maps.Animation.BOUNCE : undefined
//             });

//             const infoHtml = `
//         <div style="padding:10px;min-width:250px">
//           <h3 style="margin:0 0 10px 0;font-size:16px;font-weight:bold;">${escapeHtml(pothole.location?.address || 'Unknown')}</h3>
//           <div style="margin-bottom:8px;">
//             <span style="display:inline-block;padding:4px 10px;background-color:${markerColor};color:white;border-radius:4px;font-size:12px;font-weight:bold;text-transform:uppercase;">
//               ${escapeHtml(pothole.severity || '')}
//             </span>
//           </div>
//           <p style="margin:6px 0;font-size:13px;"><strong>Position:</strong> ${escapeHtml(pothole.position || 'N/A')}</p>
//           <p style="margin:6px 0;font-size:13px;"><strong>Status:</strong> ${escapeHtml(pothole.status || 'N/A')}</p>
//           <p style="margin:6px 0;font-size:13px;color:#666;">${escapeHtml(pothole.description || '')}</p>
//           <p style="margin:6px 0 0 0;font-size:12px;color:#999;">Reported by ${escapeHtml(pothole.reportedBy || 'Unknown')} on ${formatDate(pothole.timestamp)}</p>
//         </div>
//       `;

//             const infoWindow = new window.google.maps.InfoWindow({ content: infoHtml });

//             marker.addListener('click', () => {
//                 infoWindowsRef.current.forEach(iw => { try { iw.close(); } catch (e) { } });
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
//             if (p && typeof p.latitude === 'number' && typeof p.longitude === 'number') {
//                 googleMapRef.current.setCenter({ lat: p.latitude, lng: p.longitude });
//                 googleMapRef.current.setZoom(16);
//             }
//         }

//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [filteredPotholes]);

//     // Pan to selected pothole
//     useEffect(() => {
//         if (!googleLoadedRef.current) return;
//         if (!googleMapRef.current) return;
//         if (!selectedPothole) return;
//         const lat = selectedPothole?.location?.latitude;
//         const lng = selectedPothole?.location?.longitude;
//         if (typeof lat === 'number' && typeof lng === 'number') {
//             googleMapRef.current.panTo({ lat, lng });
//             googleMapRef.current.setZoom(16);
//         }
//     }, [selectedPothole]);

//     // --- Map-related updates only ---
//     useEffect(() => {
//         let mounted = true;
//         loadGoogleMaps(GOOGLE_MAPS_API_KEY)
//             .then(() => {
//                 if (!mounted) return;
//                 googleLoadedRef.current = true;

//                 // Initialize map if map view is active
//                 if (view === 'map' && mapRef.current && !googleMapRef.current) {
//                     googleMapRef.current = new window.google.maps.Map(mapRef.current, {
//                         center: { lat: 26.4499, lng: 80.3319 },
//                         zoom: 12,
//                         mapTypeControl: true,
//                         streetViewControl: true,
//                         fullscreenControl: true,
//                     });
//                 }
//             })
//             .catch((err) => {
//                 console.error('Google Maps load error:', err);
//                 setError('Failed to load Google Maps.');
//             });

//         return () => { mounted = false; };
//     }, []);

//     useEffect(() => {
//         if (!googleLoadedRef.current) return;
//         if (view !== 'map') return;
//         if (!mapRef.current) return;

//         // If map not initialized yet, create it
//         if (!googleMapRef.current) {
//             googleMapRef.current = new window.google.maps.Map(mapRef.current, {
//                 center: { lat: 26.4499, lng: 80.3319 },
//                 zoom: 12,
//                 mapTypeControl: true,
//                 streetViewControl: true,
//                 fullscreenControl: true,
//             });
//         }

//         // Trigger a resize to ensure map is fully visible
//         window.google.maps.event.trigger(googleMapRef.current, 'resize');
//     }, [view]);

//     useEffect(() => {
//         if (!googleLoadedRef.current || !googleMapRef.current) return;

//         clearMarkers();

//         if (!filteredPotholes || filteredPotholes.length === 0) return;

//         const bounds = new window.google.maps.LatLngBounds();

//         filteredPotholes.forEach((pothole) => {
//             const lat = pothole?.location?.latitude;
//             const lng = pothole?.location?.longitude;
//             if (typeof lat !== 'number' || typeof lng !== 'number') return;

//             const position = { lat, lng };
//             bounds.extend(position);

//             const markerColor = getSeverityMarkerColor(pothole.severity);

//             const marker = new window.google.maps.Marker({
//                 position,
//                 map: googleMapRef.current,
//                 title: pothole.location?.address || '',
//                 icon: {
//                     path: window.google.maps.SymbolPath.CIRCLE,
//                     scale: 12,
//                     fillColor: markerColor,
//                     fillOpacity: 1,
//                     strokeColor: '#ffffff',
//                     strokeWeight: 3,
//                 },
//                 animation: pothole.status === 'reported' ? window.google.maps.Animation.BOUNCE : undefined
//             });

//             const infoHtml = `
//             <div style="padding:10px;min-width:250px">
//                 <h3 style="margin:0 0 10px 0;font-size:16px;font-weight:bold;">${escapeHtml(pothole.location?.address || 'Unknown')}</h3>
//                 <div style="margin-bottom:8px;">
//                     <span style="display:inline-block;padding:4px 10px;background-color:${markerColor};color:white;border-radius:4px;font-size:12px;font-weight:bold;text-transform:uppercase;">
//                         ${escapeHtml(pothole.severity || '')}
//                     </span>
//                 </div>
//                 <p style="margin:6px 0;font-size:13px;"><strong>Position:</strong> ${escapeHtml(pothole.position || 'N/A')}</p>
//                 <p style="margin:6px 0;font-size:13px;"><strong>Status:</strong> ${escapeHtml(pothole.status || 'N/A')}</p>
//                 <p style="margin:6px 0;font-size:13px;color:#666;">${escapeHtml(pothole.description || '')}</p>
//                 <p style="margin:6px 0 0 0;font-size:12px;color:#999;">Reported by ${escapeHtml(pothole.reportedBy || 'Unknown')} on ${formatDate(pothole.timestamp)}</p>
//             </div>
//         `;

//             const infoWindow = new window.google.maps.InfoWindow({ content: infoHtml });

//             marker.addListener('click', () => {
//                 infoWindowsRef.current.forEach(iw => { try { iw.close(); } catch (e) { } });
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
//             if (p && typeof p.latitude === 'number' && typeof p.longitude === 'number') {
//                 googleMapRef.current.setCenter({ lat: p.latitude, lng: p.longitude });
//                 googleMapRef.current.setZoom(16);
//             }
//         }
//     }, [filteredPotholes]);

//     // --- Ensure map pans when selecting a pothole ---
//     useEffect(() => {
//         if (!googleLoadedRef.current || !googleMapRef.current || !selectedPothole) return;
//         const lat = selectedPothole?.location?.latitude;
//         const lng = selectedPothole?.location?.longitude;
//         if (typeof lat === 'number' && typeof lng === 'number') {
//             googleMapRef.current.panTo({ lat, lng });
//             googleMapRef.current.setZoom(16);
//         }
//     }, [selectedPothole]);


//     // Fetch puddles/potholes from API
//     const fetchPotholes = async (signal) => {
//         try {
//             setLoading(true);
//             setError(null);

//             const params = new URLSearchParams();
//             if (filters.status !== 'all') params.append('status', filters.status);
//             if (filters.severity !== 'all') params.append('severity', filters.severity);

//             const response = await fetch(`${API_URL}/potholes?${params.toString()}`, { signal });
//             const data = await response.json();

//             if (data && data.success && Array.isArray(data.data)) {
//                 setPotholes(data.data);
//                 setFilteredPotholes(data.data);
//             } else {
//                 // keep behavior: surface API failure to UI
//                 setError('Failed to fetch potholes from server.');
//             }
//         } catch (err) {
//             if (err.name === 'AbortError') return;
//             console.error('Error fetching potholes:', err);
//             setError('Network error: ' + (err.message || 'Unknown'));
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fetch stats from API
//     const fetchStats = async (signal) => {
//         try {
//             const response = await fetch(`${API_URL}/stats`, { signal });
//             const data = await response.json();
//             if (data && data.success) {
//                 setStats({
//                     total: data.data.total || 0,
//                     reported: data.data.byStatus?.reported || 0,
//                     inProgress: data.data.byStatus?.inProgress || 0,
//                     resolved: data.data.byStatus?.resolved || 0,
//                     dangerous: data.data.bySeverity?.dangerous || 0,
//                     severe: data.data.bySeverity?.severe || 0,
//                     mild: data.data.bySeverity?.mild || 0
//                 });
//             }
//         } catch (err) {
//             if (err.name === 'AbortError') return;
//             console.error('Error fetching stats:', err);
//         }
//     };

//     // Initial load + periodic refresh (keeps your API flow intact)
//     useEffect(() => {
//         const ac = new AbortController();
//         fetchPotholes(ac.signal);
//         fetchStats(ac.signal);

//         const interval = setInterval(() => {
//             fetchPotholes(); // no abort here — let each complete normally
//             fetchStats();
//         }, 30000);

//         return () => {
//             ac.abort();
//             clearInterval(interval);
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     // Apply filters locally
//     useEffect(() => {
//         let filtered = [...potholes];
//         if (filters.status !== 'all') filtered = filtered.filter(p => p.status === filters.status);
//         if (filters.severity !== 'all') filtered = filtered.filter(p => p.severity === filters.severity);
//         if (filters.position !== 'all') filtered = filtered.filter(p => p.position === filters.position);
//         setFilteredPotholes(filtered);
//     }, [filters, potholes]);

//     const updatePotholeStatus = async (id, newStatus) => {
//         try {
//             const response = await fetch(`${API_URL}/potholes/${id}`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ status: newStatus })
//             });
//             const data = await response.json();
//             if (data && data.success) {
//                 fetchPotholes();
//                 fetchStats();
//             } else {
//                 alert('Failed to update status');
//             }
//         } catch (err) {
//             console.error('Error updating pothole:', err);
//             alert('Error updating pothole status');
//         }
//     };

//     const getSeverityColor = (severity) => {
//         switch (severity) {
//             case 'dangerous': return 'bg-red-500';
//             case 'severe': return 'bg-orange-500';
//             case 'mild': return 'bg-yellow-500';
//             default: return 'bg-gray-500';
//         }
//     };
//     const getSeverityMarkerColor = (severity) => {
//         switch (severity) {
//             case 'dangerous': return '#ef4444';
//             case 'severe': return '#f97316';
//             case 'mild': return '#eab308';
//             default: return '#6b7280';
//         }
//     };
//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'reported': return 'text-red-600 bg-red-100';
//             case 'in-progress': return 'text-blue-600 bg-blue-100';
//             case 'resolved': return 'text-green-600 bg-green-100';
//             default: return 'text-gray-600 bg-gray-100';
//         }
//     };
//     const getStatusIcon = (status) => {
//         switch (status) {
//             case 'reported': return <AlertCircle className="w-4 h-4" />;
//             case 'in-progress': return <Clock className="w-4 h-4" />;
//             case 'resolved': return <CheckCircle className="w-4 h-4" />;
//             default: return null;
//         }
//     };

//     const focusOnPothole = (pothole) => {
//         setSelectedPothole(pothole);
//         setView('map');
//     };

//     // cleanup on unmount
//     useEffect(() => {
//         return () => {
//             try {
//                 clearMarkers();
//                 if (window.google && window.google.maps && googleMapRef.current) {
//                     window.google.maps.event.clearInstanceListeners(googleMapRef.current);
//                 }
//             } catch (e) { }
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     // small helpers
//     function formatDate(ts) {
//         if (!ts) return 'Unknown';
//         try { return new Date(ts).toLocaleDateString(); } catch (e) { return 'Unknown'; }
//     }
//     function escapeHtml(unsafe) {
//         if (!unsafe && unsafe !== 0) return '';
//         return String(unsafe)
//             .replace(/&/g, '&amp;')
//             .replace(/</g, '&lt;')
//             .replace(/>/g, '&gt;')
//             .replace(/"/g, '&quot;')
//             .replace(/'/g, '&#039;');
//     }

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <header className="bg-white shadow-sm border-b">
//                 <div className="px-6 py-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <h1 className="text-2xl font-bold text-gray-900">Pothole Tracker Dashboard</h1>
//                             <p className="text-sm text-gray-600 mt-1">City Infrastructure Management System</p>
//                         </div>
//                         <div className="flex gap-2">
//                             <button onClick={() => setView('map')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${view === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
//                                 <Navigation className="w-4 h-4" /> Map
//                             </button>
//                             <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
//                                 <List className="w-4 h-4" /> List
//                             </button>
//                             <button onClick={() => setView('stats')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${view === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
//                                 <BarChart3 className="w-4 h-4" /> Stats
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </header>

//             {error && (
//                 <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//                     <p className="font-semibold">Error</p>
//                     <p className="text-sm">{error}</p>
//                     <button onClick={() => fetchPotholes()} className="mt-2 text-sm underline hover:no-underline">Try again</button>
//                 </div>
//             )}

//             <div className="px-6 py-4">
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                     <div className="bg-white p-4 rounded-lg shadow">
//                         <div className="text-sm text-gray-600">Total Reports</div>
//                         <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
//                     </div>
//                     <div className="bg-white p-4 rounded-lg shadow">
//                         <div className="text-sm text-gray-600">Reported</div>
//                         <div className="text-2xl font-bold text-red-600 mt-1">{stats.reported}</div>
//                     </div>
//                     <div className="bg-white p-4 rounded-lg shadow">
//                         <div className="text-sm text-gray-600">In Progress</div>
//                         <div className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</div>
//                     </div>
//                     <div className="bg-white p-4 rounded-lg shadow">
//                         <div className="text-sm text-gray-600">Resolved</div>
//                         <div className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</div>
//                     </div>
//                 </div>
//             </div>

//             <div className="px-6 py-4">
//                 <div className="bg-white p-4 rounded-lg shadow">
//                     <div className="flex items-center gap-2 mb-3">
//                         <Filter className="w-5 h-5 text-gray-600" />
//                         <h3 className="font-semibold text-gray-900">Filters</h3>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
//                             <option value="all">All Status</option>
//                             <option value="reported">Reported</option>
//                             <option value="in-progress">In Progress</option>
//                             <option value="resolved">Resolved</option>
//                         </select>
//                         <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
//                             <option value="all">All Severity</option>
//                             <option value="mild">Mild</option>
//                             <option value="severe">Severe</option>
//                             <option value="dangerous">Dangerous</option>
//                         </select>
//                         <select value={filters.position} onChange={(e) => setFilters({ ...filters, position: e.target.value })} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
//                             <option value="all">All Positions</option>
//                             <option value="left">Left</option>
//                             <option value="middle">Middle</option>
//                             <option value="right">Right</option>
//                             <option value="full-width">Full Width</option>
//                         </select>
//                     </div>
//                 </div>
//             </div>

//             <div className="px-6 pb-6">
//                 {loading && (
//                     <div className="bg-white rounded-lg shadow p-8 text-center">
//                         <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                         <p className="mt-4 text-gray-600">Loading potholes...</p>
//                     </div>
//                 )}

//                 {!loading && view === 'map' && (
//                     <div className="bg-white rounded-lg shadow overflow-hidden">
//                         <div className="p-4 border-b bg-gray-50">
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                                 <MapPin className="w-4 h-4" />
//                                 <span>Showing {filteredPotholes.length} potholes on map</span>
//                             </div>
//                         </div>
//                         <div className="relative">
//                             <div ref={mapRef} style={{ height: '600px', width: '100%' }} />

//                             <div className="absolute right-4 top-4 bottom-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
//                                 <div className="p-4 bg-blue-600 text-white font-semibold">Pothole Locations ({filteredPotholes.length})</div>
//                                 <div className="overflow-y-auto h-full pb-20">
//                                     {filteredPotholes.length === 0 ? (
//                                         <div className="p-4 text-center text-gray-500">No potholes found with current filters</div>
//                                     ) : (
//                                         filteredPotholes.map((pothole) => (
//                                             <div key={pothole._id} onClick={() => setSelectedPothole(pothole)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedPothole?._id === pothole._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}>
//                                                 <div className="flex items-start justify-between gap-2">
//                                                     <div className="flex-1">
//                                                         <div className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white mb-2 ${getSeverityColor(pothole.severity)}`}>{String(pothole.severity || '').toUpperCase()}</div>
//                                                         <p className="font-semibold text-sm">{pothole.location.address}</p>
//                                                         <p className="text-xs text-gray-600 mt-1">Position: <span className="font-medium capitalize">{pothole.position}</span></p>
//                                                         <p className="text-xs text-gray-600 mt-1">{pothole.description}</p>
//                                                         <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium mt-2 ${getStatusColor(pothole.status)}`}>
//                                                             {getStatusIcon(pothole.status)}
//                                                             {pothole.status}
//                                                         </div>
//                                                     </div>
//                                                     <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
//                                                 </div>
//                                                 <div className="text-xs text-gray-500 mt-2">{new Date(pothole.timestamp).toLocaleString()}</div>
//                                             </div>
//                                         ))
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {!loading && view === 'list' && (
//                     <div className="bg-white rounded-lg shadow">
//                         {filteredPotholes.length === 0 ? (
//                             <div className="p-8 text-center text-gray-500">No potholes found with current filters</div>
//                         ) : (
//                             <div className="overflow-x-auto">
//                                 <table className="w-full">
//                                     <thead className="bg-gray-50 border-b">
//                                         <tr>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Severity</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Position</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reporter</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
//                                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y">
//                                         {filteredPotholes.map((pothole) => (
//                                             <tr key={pothole._id} className="hover:bg-gray-50">
//                                                 <td className="px-4 py-3 text-sm font-mono text-gray-600">#{String(pothole._id).slice(-6)}</td>
//                                                 <td className="px-4 py-3 text-sm">
//                                                     <div className="flex items-center gap-2">
//                                                         <MapPin className="w-4 h-4 text-gray-400" />
//                                                         <div className="font-medium">{pothole.location.address}</div>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-4 py-3">
//                                                     <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${getSeverityColor(pothole.severity)}`}>{pothole.severity}</span>
//                                                 </td>
//                                                 <td className="px-4 py-3 text-sm capitalize">{pothole.position}</td>
//                                                 <td className="px-4 py-3">
//                                                     <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(pothole.status)}`}>
//                                                         {getStatusIcon(pothole.status)}
//                                                         {pothole.status}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-4 py-3 text-sm">{pothole.reportedBy}</td>
//                                                 <td className="px-4 py-3 text-sm">{new Date(pothole.timestamp).toLocaleDateString()}</td>
//                                                 <td className="px-4 py-3">
//                                                     <div className="flex gap-2">
//                                                         <select value={pothole.status} onChange={(e) => updatePotholeStatus(pothole._id, e.target.value)} className="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
//                                                             <option value="reported">Reported</option>
//                                                             <option value="in-progress">In Progress</option>
//                                                             <option value="resolved">Resolved</option>
//                                                         </select>
//                                                         <button onClick={() => focusOnPothole(pothole)} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">View</button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {!loading && view === 'stats' && (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="bg-white p-6 rounded-lg shadow">
//                             <h3 className="font-semibold text-lg mb-4">Severity Distribution</h3>
//                             <div className="space-y-4">
//                                 <div>
//                                     <div className="flex justify-between mb-2"><span className="text-sm font-medium">Dangerous</span><span className="text-sm text-gray-600">{stats.dangerous} ({stats.total > 0 ? Math.round((stats.dangerous / stats.total) * 100) : 0}%)</span></div>
//                                     <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-red-500 h-3 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.dangerous / stats.total) * 100 : 0}%` }}></div></div>
//                                 </div>
//                                 <div>
//                                     <div className="flex justify-between mb-2"><span className="text-sm font-medium">Severe</span><span className="text-sm text-gray-600">{stats.severe} ({stats.total > 0 ? Math.round((stats.severe / stats.total) * 100) : 0}%)</span></div>
//                                     <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-orange-500 h-3 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.severe / stats.total) * 100 : 0}%` }}></div></div>
//                                 </div>
//                                 <div>
//                                     <div className="flex justify-between mb-2"><span className="text-sm font-medium">Mild</span><span className="text-sm text-gray-600">{stats.mild} ({stats.total > 0 ? Math.round((stats.mild / stats.total) * 100) : 0}%)</span></div>
//                                     <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-yellow-500 h-3 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.mild / stats.total) * 100 : 0}%` }}></div></div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white p-6 rounded-lg shadow">
//                             <h3 className="font-semibold text-lg mb-4">Status Overview</h3>
//                             <div className="space-y-4">
//                                 <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"><div className="flex items-center gap-3"><AlertCircle className="w-6 h-6 text-red-600" /><div><div className="font-medium text-gray-900">Reported</div><div className="text-xs text-gray-600">Awaiting action</div></div></div><span className="text-2xl font-bold text-red-600">{stats.reported}</span></div>
//                                 <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"><div className="flex items-center gap-3"><Clock className="w-6 h-6 text-blue-600" /><div><div className="font-medium text-gray-900">In Progress</div><div className="text-xs text-gray-600">Being fixed</div></div></div><span className="text-2xl font-bold text-blue-600">{stats.inProgress}</span></div>
//                                 <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"><div className="flex items-center gap-3"><CheckCircle className="w-6 h-6 text-green-600" /><div><div className="font-medium text-gray-900">Resolved</div><div className="text-xs text-gray-600">Completed</div></div></div><span className="text-2xl font-bold text-green-600">{stats.resolved}</span></div>
//                             </div>
//                         </div>

//                         <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
//                             <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
//                             <div className="space-y-3">
//                                 {potholes.slice(0, 5).map((pothole) => (
//                                     <div key={pothole._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                                         <div className="flex items-center gap-3">
//                                             <div className={`w-2 h-2 rounded-full ${getSeverityColor(pothole.severity)}`}></div>
//                                             <div>
//                                                 <div className="text-sm font-medium">{pothole.location.address}</div>
//                                                 <div className="text-xs text-gray-600">Reported by {pothole.reportedBy} • {new Date(pothole.timestamp).toLocaleString()}</div>
//                                             </div>
//                                         </div>
//                                         <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(pothole.status)}`}>{getStatusIcon(pothole.status)}{pothole.status}</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
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
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';

const API_URL = `${base_url}/api`;

// Main Dashboard Component
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
    const navigate = useNavigate()

    // Initialize map only once when component mounts and Google Maps is loaded
    useEffect(() => {
        if (!window.google || !window.google.maps) return;
        if (googleMapRef.current) return; // Already initialized
        if (!mapRef.current) return;

        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: 26.4499, lng: 80.3319 },
            zoom: 12,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
        });
    }, []);

    // Trigger resize when switching to map view
    useEffect(() => {
        if (view === 'map' && googleMapRef.current && window.google && window.google.maps) {
            setTimeout(() => {
                window.google.maps.event.trigger(googleMapRef.current, 'resize');
                googleMapRef.current.setCenter({ lat: 26.4499, lng: 80.3319 });
            }, 100);
        }
    }, [view]);

    // Clear markers helper
    const clearMarkers = () => {
        try {
            markersRef.current.forEach(marker => {
                try {
                    if (window.google && window.google.maps) {
                        window.google.maps.event.clearInstanceListeners(marker);
                    }
                    marker.setMap(null);
                } catch (e) { }
            });
            markersRef.current = [];
            infoWindowsRef.current.forEach(iw => { try { iw.close(); } catch (e) { } });
            infoWindowsRef.current = [];
        } catch (e) {
            // ignore
        }
    };

    // Create/update markers when filteredPotholes change
    useEffect(() => {
        if (!window.google || !window.google.maps) return;
        if (!googleMapRef.current) return;

        clearMarkers();

        if (!filteredPotholes || filteredPotholes.length === 0) return;

        const bounds = new window.google.maps.LatLngBounds();

        filteredPotholes.forEach((pothole) => {
            const lat = pothole?.location?.latitude;
            const lng = pothole?.location?.longitude;
            if (typeof lat !== 'number' || typeof lng !== 'number') return;

            const position = { lat, lng };
            bounds.extend(position);

            const markerColor = getSeverityMarkerColor(pothole.severity);

            // const marker = new window.google.maps.Marker({
            //     position,
            //     map: googleMapRef.current,
            //     title: pothole.location?.address || '',
            //     icon: {
            //         path: window.google.maps.SymbolPath.CIRCLE,
            //         scale: 12,
            //         fillColor: markerColor,
            //         fillOpacity: 1,
            //         strokeColor: '#ffffff',
            //         strokeWeight: 3,
            //     },
            //     animation: pothole.status === 'reported' ? window.google.maps.Animation.BOUNCE : undefined
            // });

            const marker = new window.google.maps.Marker({
                position,
                map: googleMapRef.current,
                title: pothole.location?.address || '',
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: markerColor,
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                },
                // animation: pothole.status === 'reported' ? window.google.maps.Animation.BOUNCE : undefined
            });

            marker._id = pothole._id; // 🔹 Save reference


            // const infoHtml = `
            //     <div style="padding:10px;min-width:250px">
            //         <h3 style="margin:0 0 10px 0;font-size:16px;font-weight:bold;">${escapeHtml(pothole.location?.address || 'Unknown')}</h3>
            //          ${pothole?.image
            //         ? `<img src="${escapeHtml(pothole.image)}" 
            //             alt="Pothole Image"
            //             style="width:100%;height:auto;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:8px;border:1px solid #ddd;" />`
            //         : `<div style="width:100%;height:150px;background:#f2f2f2;display:flex;align-items:center;justify-content:center;border-radius:8px;margin-bottom:8px;color:#999;font-size:13px;">No Image</div>`
            //     }

            //         <div style="margin-bottom:8px;">
            //             <span style="display:inline-block;padding:4px 10px;background-color:${markerColor};color:white;border-radius:4px;font-size:12px;font-weight:bold;text-transform:uppercase;">
            //                 ${escapeHtml(pothole.severity || '')}
            //             </span>
            //         </div>
            //         <p style="margin:6px 0;font-size:13px;"><strong>Position:</strong> ${escapeHtml(pothole.position || 'N/A')}</p>
            //         <p style="margin:6px 0;font-size:13px;"><strong>Status:</strong> ${escapeHtml(pothole.status || 'N/A')}</p>
            //         <p style="margin:6px 0;font-size:13px;color:#666;">${escapeHtml(pothole.description || '')}</p>
            //         <p style="margin:6px 0 0 0;font-size:12px;color:#999;">Reported by ${escapeHtml(pothole.reportedBy || 'Unknown')} on ${formatDate(pothole.timestamp)}</p>
            //     </div>
            // `;

            // const infoWindow = new window.google.maps.InfoWindow({ content: infoHtml });

            const infoHtml = `
  <div style="padding:10px;min-width:250px;font-family:system-ui,Segoe UI,Roboto;">
    <h3 style="margin:0 0 10px 0;font-size:16px;font-weight:600;color:#222;">
      ${escapeHtml(pothole.location?.address || "Unknown")}
    </h3>

    ${pothole?.image
                    ? `<img src="${escapeHtml(pothole.image)}" 
            alt="Pothole Image"
            style="width:100%;height:auto;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:8px;border:1px solid #ddd;" />`
                    : `<div style="width:100%;height:150px;background:#f2f2f2;display:flex;align-items:center;justify-content:center;border-radius:8px;margin-bottom:8px;color:#999;font-size:13px;">No Image</div>`
                }

    <div style="margin-bottom:8px;">
      <span style="display:inline-block;padding:4px 10px;background-color:${markerColor};color:white;border-radius:4px;font-size:12px;font-weight:bold;text-transform:uppercase;">
        ${escapeHtml(pothole.severity || "")}
      </span>
    </div>

    
    <p style="margin:6px 0;font-size:13px;"><strong>Position:</strong> ${escapeHtml(pothole.position || "N/A")}</p>
    <p style="margin:6px 0;font-size:13px;"><strong>Status:</strong> ${escapeHtml(pothole.status || "N/A")}</p>
    <p style="margin:6px 0;font-size:13px;color:#555;">${escapeHtml(pothole.description || "")}</p>
    <p style="margin:8px 0 10px 0;font-size:12px;color:#888;">Reported by ${escapeHtml(pothole.reportedBy || "Unknown")} on ${formatDate(pothole.timestamp)}</p>
    
    <!-- ✅ View Details Button -->
   <div style="display:flex;justify-content:flex-end;margin-top:10px;">
     <a 
       href="/pothole/${escapeHtml(pothole._id)}"
       style="display:inline-block;padding:8px 14px;background:#2563eb;color:white;font-size:13px;font-weight:500;
       text-decoration:none;border-radius:6px;box-shadow:0 2px 4px rgba(0,0,0,0.15);
       transition:all 0.2s ease;"
       onmouseover="this.style.background='#1e4fd1';"
       onmouseout="this.style.background='#2563eb';"
     >
       View Details
     </a>
   </div>
   
  </div>
`;

            const infoWindow = new window.google.maps.InfoWindow({ content: infoHtml });


            // marker.addListener('click', () => {
            //     infoWindowsRef.current.forEach(iw => { try { iw.close(); } catch (e) { } });
            //     infoWindow.open(googleMapRef.current, marker);
            //     setSelectedPothole(pothole);
            // });

            marker.addListener('click', () => {
                infoWindowsRef.current.forEach(iw => { try { iw.close(); } catch (e) { } });
                infoWindow.open(googleMapRef.current, marker);
                setSelectedPothole(pothole);
            });


            markersRef.current.push(marker);
            infoWindowsRef.current.push(infoWindow);
        });

        if (filteredPotholes.length > 1) {
            googleMapRef.current.fitBounds(bounds);
        } else if (filteredPotholes.length === 1) {
            const p = filteredPotholes[0].location;
            if (p && typeof p.latitude === 'number' && typeof p.longitude === 'number') {
                googleMapRef.current.setCenter({ lat: p.latitude, lng: p.longitude });
                googleMapRef.current.setZoom(16);
            }
        }
    }, [filteredPotholes]);

    // Pan to selected pothole
    useEffect(() => {
        if (!window.google || !window.google.maps) return;
        if (!googleMapRef.current) return;
        if (!selectedPothole) return;
        const lat = selectedPothole?.location?.latitude;
        const lng = selectedPothole?.location?.longitude;
        if (typeof lat === 'number' && typeof lng === 'number') {
            googleMapRef.current.panTo({ lat, lng });
            googleMapRef.current.setZoom(16);
        }
    }, [selectedPothole]);

    // Fetch potholes from API
    const fetchPotholes = async (signal) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.severity !== 'all') params.append('severity', filters.severity);

            const response = await fetch(`${API_URL}/potholes?${params.toString()}`, { signal });
            const data = await response.json();

            if (data && data.success && Array.isArray(data.data)) {
                setPotholes(data.data);
                setFilteredPotholes(data.data);
            } else {
                setError('Failed to fetch potholes from server.');
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error('Error fetching potholes:', err);
            setError('Network error: ' + (err.message || 'Unknown'));
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats from API
    const fetchStats = async (signal) => {
        try {
            const response = await fetch(`${API_URL}/stats`, { signal });
            const data = await response.json();
            if (data && data.success) {
                setStats({
                    total: data.data.total || 0,
                    reported: data.data.byStatus?.reported || 0,
                    inProgress: data.data.byStatus?.inProgress || 0,
                    resolved: data.data.byStatus?.resolved || 0,
                    dangerous: data.data.bySeverity?.dangerous || 0,
                    severe: data.data.bySeverity?.severe || 0,
                    mild: data.data.bySeverity?.mild || 0
                });
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error('Error fetching stats:', err);
        }
    };

    // Initial load + periodic refresh
    useEffect(() => {
        const ac = new AbortController();
        fetchPotholes(ac.signal);
        fetchStats(ac.signal);

        const interval = setInterval(() => {
            fetchPotholes();
            fetchStats();
        }, 30000);

        return () => {
            ac.abort();
            clearInterval(interval);
        };
    }, []);

    // Apply filters locally
    useEffect(() => {
        let filtered = [...potholes];
        if (filters.status !== 'all') filtered = filtered.filter(p => p.status === filters.status);
        if (filters.severity !== 'all') filtered = filtered.filter(p => p.severity === filters.severity);
        if (filters.position !== 'all') filtered = filtered.filter(p => p.position === filters.position);
        setFilteredPotholes(filtered);
    }, [filters, potholes]);

    const updatePotholeStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/potholes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data && data.success) {
                fetchPotholes();
                fetchStats();
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            console.error('Error updating pothole:', err);
            alert('Error updating pothole status');
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'dangerous': return 'bg-red-500';
            case 'severe': return 'bg-orange-500';
            case 'mild': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const getSeverityMarkerColor = (severity) => {
        switch (severity) {
            case 'dangerous': return '#ef4444';
            case 'severe': return '#f97316';
            case 'mild': return '#eab308';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'reported': return 'text-red-600 bg-red-100';
            case 'in-progress': return 'text-blue-600 bg-blue-100';
            case 'resolved': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'reported': return <AlertCircle className="w-4 h-4" />;
            case 'in-progress': return <Clock className="w-4 h-4" />;
            case 'resolved': return <CheckCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const focusOnPothole = (pothole) => {
        setSelectedPothole(pothole);
        setView('map');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearMarkers();
            if (window.google && window.google.maps && googleMapRef.current) {
                try {
                    window.google.maps.event.clearInstanceListeners(googleMapRef.current);
                } catch (e) { }
            }
        };
    }, []);

    function formatDate(ts) {
        if (!ts) return 'Unknown';
        try { return new Date(ts).toLocaleDateString(); } catch (e) { return 'Unknown'; }
    }

    function escapeHtml(unsafe) {
        if (!unsafe && unsafe !== 0) return '';
        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    const handleCardClick = (pothole) => {
        setSelectedPothole(pothole);

        // Find the corresponding marker
        const markerIndex = markersRef.current.findIndex(m => m._id === pothole._id);
        const marker = markersRef.current[markerIndex];
        const infoWindow = infoWindowsRef.current[markerIndex];

        if (marker && infoWindow && window.google && window.google.maps) {
            // Close other info windows
            infoWindowsRef.current.forEach(iw => { try { iw.close(); } catch (e) { } });
            // Open the clicked one
            infoWindow.open(googleMapRef.current, marker);
            // Center and zoom map
            googleMapRef.current.panTo(marker.getPosition());
            googleMapRef.current.setZoom(16);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pothole Tracker Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1">City Infrastructure Management System</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setView('map')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${view === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                <Navigation className="w-4 h-4" /> Map
                            </button>
                            <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                <List className="w-4 h-4" /> List
                            </button>
                            <button onClick={() => setView('stats')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${view === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                <BarChart3 className="w-4 h-4" /> Stats
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {error && (
                <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                    <button onClick={() => fetchPotholes()} className="mt-2 text-sm underline hover:no-underline">Try again</button>
                </div>
            )}

            <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Total Reports</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Reported</div>
                        <div className="text-2xl font-bold text-red-600 mt-1">{stats.reported}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-600">In Progress</div>
                        <div className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Resolved</div>
                        <div className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Status</option>
                            <option value="reported">Reported</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Severity</option>
                            <option value="mild">Mild</option>
                            <option value="severe">Severe</option>
                            <option value="dangerous">Dangerous</option>
                        </select>
                        <select value={filters.position} onChange={(e) => setFilters({ ...filters, position: e.target.value })} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Positions</option>
                            <option value="left">Left</option>
                            <option value="middle">Middle</option>
                            <option value="right">Right</option>
                            <option value="full-width">Full Width</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-6">
                {loading && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading potholes...</p>
                    </div>
                )}

                {!loading && view === 'map' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-4 border-b bg-gray-50">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>Showing {filteredPotholes.length} potholes on map</span>
                            </div>
                        </div>
                        <div className="relative">
                            <div ref={mapRef} style={{ height: '600px', width: '100%' }} />

                            <div className="absolute right-4 top-4 bottom-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="p-4 bg-blue-600 text-white font-semibold">Pothole Locations ({filteredPotholes.length})</div>
                                <div className="overflow-y-auto h-full pb-20">
                                    {filteredPotholes.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">No potholes found with current filters</div>
                                    ) : (
                                        filteredPotholes.map((pothole) => (
                                            <div key={pothole._id} onClick={() => handleCardClick(pothole)}
                                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedPothole?._id === pothole._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <div className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white mb-2 ${getSeverityColor(pothole.severity)}`}>{String(pothole.severity || '').toUpperCase()}</div>
                                                        <p className="font-semibold text-sm">{pothole.location.address}</p>
                                                        <p className="text-xs text-gray-600 mt-1">Position: <span className="font-medium capitalize">{pothole.position}</span></p>
                                                        <p className="text-xs text-gray-600 mt-1">{pothole.description}</p>
                                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium mt-2 ${getStatusColor(pothole.status)}`}>
                                                            {getStatusIcon(pothole.status)}
                                                            {pothole.status}
                                                        </div>
                                                    </div>
                                                    {/* <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" /> */}
                                                    <CustomButton
                                                        label="View"
                                                        to={`/pothole/${pothole?._id}`}
                                                        color="blue"
                                                    />
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2">{new Date(pothole.timestamp).toLocaleString()}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && view === 'list' && (
                    <div className="bg-white rounded-lg shadow">
                        {filteredPotholes.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No potholes found with current filters</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Severity</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Position</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reporter</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredPotholes.map((pothole) => (
                                            <tr key={pothole._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-mono text-gray-600">#{String(pothole._id).slice(-6)}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <div className="font-medium">{pothole.location.address}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${getSeverityColor(pothole.severity)}`}>{pothole.severity}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm capitalize">{pothole.position}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(pothole.status)}`}>
                                                        {getStatusIcon(pothole.status)}
                                                        {pothole.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{pothole.reportedBy}</td>
                                                <td className="px-4 py-3 text-sm">{new Date(pothole.timestamp).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <select value={pothole.status} onChange={(e) => updatePotholeStatus(pothole._id, e.target.value)} className="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                            <option value="reported">Reported</option>
                                                            <option value="in-progress">In Progress</option>
                                                            <option value="resolved">Resolved</option>
                                                        </select>
                                                        <button onClick={() => focusOnPothole(pothole)} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">View</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {!loading && view === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-semibold text-lg mb-4">Severity Distribution</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2"><span className="text-sm font-medium">Dangerous</span><span className="text-sm text-gray-600">{stats.dangerous} ({stats.total > 0 ? Math.round((stats.dangerous / stats.total) * 100) : 0}%)</span></div>
                                    <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-red-500 h-3 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.dangerous / stats.total) * 100 : 0}%` }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2"><span className="text-sm font-medium">Severe</span><span className="text-sm text-gray-600">{stats.severe} ({stats.total > 0 ? Math.round((stats.severe / stats.total) * 100) : 0}%)</span></div>
                                    <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-orange-500 h-3 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.severe / stats.total) * 100 : 0}%` }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2"><span className="text-sm font-medium">Mild</span><span className="text-sm text-gray-600">{stats.mild} ({stats.total > 0 ? Math.round((stats.mild / stats.total) * 100) : 0}%)</span></div>
                                    <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-yellow-500 h-3 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.mild / stats.total) * 100 : 0}%` }}></div></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-semibold text-lg mb-4">Status Overview</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"><div className="flex items-center gap-3"><AlertCircle className="w-6 h-6 text-red-600" /><div><div className="font-medium text-gray-900">Reported</div><div className="text-xs text-gray-600">Awaiting action</div></div></div><span className="text-2xl font-bold text-red-600">{stats.reported}</span></div>
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"><div className="flex items-center gap-3"><Clock className="w-6 h-6 text-blue-600" /><div><div className="font-medium text-gray-900">In Progress</div><div className="text-xs text-gray-600">Being fixed</div></div></div><span className="text-2xl font-bold text-blue-600">{stats.inProgress}</span></div>
                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"><div className="flex items-center gap-3"><CheckCircle className="w-6 h-6 text-green-600" /><div><div className="font-medium text-gray-900">Resolved</div><div className="text-xs text-gray-600">Completed</div></div></div><span className="text-2xl font-bold text-green-600">{stats.resolved}</span></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
                            <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                {potholes.slice(0, 5).map((pothole) => (
                                    <div key={pothole._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${getSeverityColor(pothole.severity)}`}></div>
                                            <div>
                                                <div className="text-sm font-medium">{pothole.location.address}</div>
                                                <div className="text-xs text-gray-600">Reported by {pothole.reportedBy} • {new Date(pothole.timestamp).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(pothole.status)}`}>{getStatusIcon(pothole.status)}{pothole.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PotholeDashboard

