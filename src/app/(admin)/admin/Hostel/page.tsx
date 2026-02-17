"use client";
import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, UserPlus, Eye } from "lucide-react";
import { RiHome4Line } from "@remixicon/react";

interface Hostel {
  _id: string;
  name: string;
  totalRooms: number;
  createdAt: string;
}

interface RoomAllocation {
  _id: string;
  roomNo: string;
  seatAllocate: number;
  seatNumbers: Record<string, number>; // e.g., { "A1": 0, "A2": 1 } where 0 = vacant, 1 = booked
  createdAt: string;
}

interface RoomAllocationResponse {
  success: boolean;
  totalRooms: number;
  data: RoomAllocation[];
}

const HostelManager = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [roomAllocations, setRoomAllocations] = useState<RoomAllocation[]>([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [loadingAllocations, setLoadingAllocations] = useState(false);
  const [deletingAllocationId, setDeletingAllocationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    totalRooms: ""
  });
  const [seatFormData, setSeatFormData] = useState({
    roomNo: "",
    seatAllocate: ""
  });
  const [seatNumbers, setSeatNumbers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    fetchHostels();
  }, []);

  // Update seat numbers array when seat count changes
  useEffect(() => {
    const count = parseInt(seatFormData.seatAllocate) || 0;
    if (count > 0) {
      setSeatNumbers(new Array(count).fill(""));
    } else {
      setSeatNumbers([]);
    }
  }, [seatFormData.seatAllocate]);

  const fetchHostels = async () => {
    try {
      const res = await fetch(
        `/api/hostel`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data?.success) {
        setHostels(data.data);
      }
    } catch (error) {
      console.error("Error fetching hostels:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomAllocations = async (hostelId: string) => {
    setLoadingAllocations(true);
    try {
      const res = await fetch(`/api/hostel/${hostelId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data: RoomAllocationResponse = await res.json();
      if (data?.success) {
        setRoomAllocations(data.data);
        setTotalRooms(data.totalRooms);
      }
    } catch (error) {
      console.error("Error fetching room allocations:", error);
    } finally {
      setLoadingAllocations(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.totalRooms) return;
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        totalRooms: Number(formData.totalRooms)
      };

      const url = editingHostel
        ? `/api/hostel/${editingHostel._id}`
        : `/api/hostel`;

      const res = await fetch(url, {
        method: editingHostel ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (data?.success) {
        fetchHostels();
        closeModal();
      }
    } catch (error) {
      console.error("Error submitting hostel:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeatAllocation = async () => {
    if (!seatFormData.roomNo || !seatFormData.seatAllocate || !selectedHostel) return;
    
    // Check if all seat numbers are filled
    const allSeatsFilled = seatNumbers.every(seat => seat.trim() !== "");
    if (!allSeatsFilled) {
      alert("Please fill all seat numbers");
      return;
    }

    setAllocating(true);

    try {
      const payload = {
        roomNo: seatFormData.roomNo,
        seatAllocate: Number(seatFormData.seatAllocate),
        seatNumbers: seatNumbers.filter(seat => seat.trim() !== "")
      };

      const res = await fetch(`/api/hostel/${selectedHostel._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (data?.success) {
        fetchHostels();
        closeSeatModal();
      }
    } catch (error) {
      console.error("Error allocating seat:", error);
    } finally {
      setAllocating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hostel?")) return;

    try {
      const res = await fetch(
        `/api/hostel/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (data?.success) {
        fetchHostels();
      }
    } catch (error) {
      console.error("Error deleting hostel:", error);
    }
  };

  const handleDeleteRoomAllocation = async (hostelId: string, allocationId: string) => {
    if (!confirm("Are you sure you want to delete this room allocation?")) return;

    setDeletingAllocationId(allocationId);
    try {
      const res = await fetch(`/api/hostel/${hostelId}/room/${allocationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();
      if (data?.success) {
        // Refresh the room allocations list
        await fetchRoomAllocations(hostelId);
      }
    } catch (error) {
      console.error("Error deleting room allocation:", error);
    } finally {
      setDeletingAllocationId(null);
    }
  };

  const handleSeatNumberChange = (index: number, value: string) => {
    const newSeatNumbers = [...seatNumbers];
    newSeatNumbers[index] = value;
    setSeatNumbers(newSeatNumbers);
  };

  const openModal = (hostel?: Hostel) => {
    if (hostel) {
      setEditingHostel(hostel);
      setFormData({
        name: hostel.name,
        totalRooms: hostel.totalRooms.toString()
      });
    } else {
      setEditingHostel(null);
      setFormData({ name: "", totalRooms: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHostel(null);
    setFormData({ name: "", totalRooms: "" });
  };

  const openSeatModal = (hostel: Hostel) => {
    setSelectedHostel(hostel);
    setSeatFormData({ roomNo: "", seatAllocate: "" });
    setSeatNumbers([]);
    setIsSeatModalOpen(true);
  };

  const closeSeatModal = () => {
    setIsSeatModalOpen(false);
    setSelectedHostel(null);
    setSeatFormData({ roomNo: "", seatAllocate: "" });
    setSeatNumbers([]);
  };

  const openViewModal = async (hostel: Hostel) => {
    setSelectedHostel(hostel);
    setIsViewModalOpen(true);
    await fetchRoomAllocations(hostel._id);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedHostel(null);
    setRoomAllocations([]);
    setTotalRooms(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Hostel Management</h1>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add Hostel
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Hostel Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Total Rooms
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Created Date
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                 Add Room & Seat
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {hostels.map((hostel) => (
                <tr key={hostel._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {hostel.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {hostel.totalRooms}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(hostel.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openViewModal(hostel)}
                        className="flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1.5 rounded hover:bg-purple-100 transition"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openSeatModal(hostel)}
                        className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded hover:bg-green-100 transition"
                      >
                         <RiHome4Line size={16} />
                        Allocate
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(hostel)}
                        className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(hostel._id)}
                        className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {hostels.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hostels added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingHostel ? "Edit Hostel" : "Add Hostel"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div>
              {/* Hostel Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter hostel name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Total Rooms */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Rooms
                </label>
                <input
                  type="number"
                  value={formData.totalRooms}
                  onChange={(e) =>
                    setFormData({ ...formData, totalRooms: e.target.value })
                  }
                  min="1"
                  placeholder="Enter total Rooms"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.name || !formData.totalRooms}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving..." : editingHostel ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seat Allocation Modal */}
      {isSeatModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Allocate Seat - {selectedHostel?.name}
              </h2>
              <button
                onClick={closeSeatModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div>
              {/* Room Number */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  value={seatFormData.roomNo}
                  onChange={(e) =>
                    setSeatFormData({ ...seatFormData, roomNo: e.target.value })
                  }
                  placeholder="Enter room number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Seat Allocate */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Seats
                </label>
                <input
                  type="number"
                  value={seatFormData.seatAllocate}
                  onChange={(e) =>
                    setSeatFormData({ ...seatFormData, seatAllocate: e.target.value })
                  }
                  min="1"
                  placeholder="Enter number of seats"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Dynamic Seat Number Inputs */}
              {seatNumbers.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Seat Numbers
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {seatNumbers.map((seat, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-20">
                          Seat {index + 1}:
                        </span>
                        <input
                          type="text"
                          value={seat}
                          onChange={(e) => handleSeatNumberChange(index, e.target.value)}
                          placeholder={`e.g., ${String.fromCharCode(97 + index)}`}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeSeatModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSeatAllocation}
                  disabled={
                    allocating || 
                    !seatFormData.roomNo || 
                    !seatFormData.seatAllocate ||
                    seatNumbers.length === 0 ||
                    seatNumbers.some(seat => seat.trim() === "")
                  }
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {allocating ? "Allocating..." : "Allocate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Room Allocations Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full flex flex-col max-h-[85vh]">
            {/* Header - Fixed */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Room Allocations - {selectedHostel?.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Total Rooms: {totalRooms}
                </p>
              </div>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingAllocations ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                </div>
              ) : roomAllocations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2">
                          Room No
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b-2">
                          Total Seats
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b-2">
                          Vacant
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b-2">
                          Booked
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2">
                          Seat Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2">
                          Created Date
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b-2">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {roomAllocations.map((allocation) => {
                        const bookedSeats = Object.values(allocation.seatNumbers).filter(status => status === 1).length;
                        const vacantSeats = Object.values(allocation.seatNumbers).filter(status => status === 0).length;
                        
                        return (
                          <tr key={allocation._id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                              Room {allocation.roomNo}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {allocation.seatAllocate}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                {vacantSeats}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                {bookedSeats}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(allocation.seatNumbers).map(([seatNo, status]) => (
                                  <span
                                    key={seatNo}
                                    className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                                      status === 0
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                    }`}
                                    title={status === 0 ? 'Vacant' : 'Booked'}
                                  >
                                    {seatNo}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {new Date(allocation.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleDeleteRoomAllocation(selectedHostel!._id, allocation._id)}
                                disabled={deletingAllocationId === allocation._id}
                                className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition disabled:bg-red-200 disabled:cursor-not-allowed text-sm"
                              >
                                <Trash2 size={14} />
                                {deletingAllocationId === allocation._id ? "Deleting..." : "Delete"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No room allocations found</p>
                </div>
              )}
            </div>

            {/* Footer - Fixed */}
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={closeViewModal}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelManager;