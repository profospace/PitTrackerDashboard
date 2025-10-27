import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, AlertCircle, Clock, ArrowLeft } from "lucide-react";
import { base_url } from "../utils/base_url";

const API_URL = `${base_url}/api/potholes`;

const PotholeDetails = () => {
    const { id } = useParams();
    const [pothole, setPothole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPothole = async () => {
            try {
                const res = await fetch(`${API_URL}/${id}`);
                const data = await res.json();
                if (data.success) setPothole(data.data);
            } catch (err) {
                console.error("❌ Error fetching pothole:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPothole();
    }, [id]);

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen text-lg text-gray-500">
                Loading pothole details...
            </div>
        );

    if (!pothole)
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                Pothole not found
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            {/* Header Image */}
            <div className="relative w-full h-72 md:h-52 overflow-hidden">
                <img
                    src={pothole.image || "https://via.placeholder.com/1200x500?text=No+Image"}
                    alt="Pothole"
                    className="w-full h-full object-cover brightness-90"
                />

                {/* Back button */}
                <Link
                    to="/"
                    className="absolute top-6 left-6 bg-white/80 hover:bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/50 to-transparent p-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Pothole Report</h1>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
                {/* Location */}
                <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="text-red-500 w-5 h-5" />
                    <span className="text-lg">
                        {pothole.location?.address || "Unknown Location"}
                    </span>
                </div>

                {/* Info Grid */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <InfoCard title="Severity" value={pothole.severity} />
                    <InfoCard title="Position" value={pothole.position} />
                    <InfoCard
                        title="Status"
                        value={pothole.status}
                        icon={
                            <AlertCircle
                                className={`w-5 h-5 ${pothole.status === "resolved"
                                        ? "text-green-600"
                                        : pothole.status === "in-progress"
                                            ? "text-yellow-500"
                                            : "text-red-500"
                                    }`}
                            />
                        }
                    />
                    <InfoCard title="Reported By" value={pothole.reportedBy || "Anonymous"} />
                    <InfoCard
                        title="Reported On"
                        value={new Date(pothole.timestamp).toLocaleString()}
                        icon={<Clock className="w-5 h-5 text-gray-500" />}
                    />
                </div>

                {/* Description */}
                {pothole.description && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-gray-700 leading-relaxed bg-white/70 p-4 rounded-xl shadow-sm">
                            {pothole.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ✅ Small reusable subcomponent for clean layout
const InfoCard = ({ title, value, icon }) => (
    <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition">
        <div>
            <h4 className="text-sm text-gray-500">{title}</h4>
            <p className="text-lg font-semibold capitalize">{value}</p>
        </div>
        {icon && <div>{icon}</div>}
    </div>
);

export default PotholeDetails;
