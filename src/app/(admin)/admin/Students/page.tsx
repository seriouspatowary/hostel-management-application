'use client';

import { RiHome4Line, RiLogoutBoxRLine } from '@remixicon/react';
import { UserPlus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface Boarder {
  _id: string;
  name: string;
  email: string;
  dob: string;
  phone: string;
  photo: string;
  aadharCard: string;
  isStudent: string;
  organisation: string;
  parentName: string;
  parentNumber: string;
  createdAt: string;
  isAllocated: boolean;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Room {
  roomId: string;
  roomNo: string;
  seatAllocate: number;
  seatNumbers: Record<string, number>; // Keys are seat identifiers, values are 0 (available) or 1 (booked)
}

interface Hostel {
  hostelId: string;
  hostelName: string;
  rooms: Room[];
}

interface HostelResponse {
  success: boolean;
  data: Hostel[];
}

interface AllocationDetailsData {
  boarderName: string;
  phone: string;
  hostelName: string;
  roomNo: string;
  seatNumber: string;
  allocatedAt: string;
}

export default function RegisteredBoardersPage() {
  const [boarders, setBoarders] = useState<Boarder[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBoarder, setSelectedBoarder] = useState<Boarder | null>(null);
  
  // Room allocation states
  const [showRoomAllocation, setShowRoomAllocation] = useState(false);
  const [selectedBoarderForRoom, setSelectedBoarderForRoom] = useState<Boarder | null>(null);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loadingHostels, setLoadingHostels] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [allocating, setAllocating] = useState(false);

  // Allocation details state
  const [showAllocationDetails, setShowAllocationDetails] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Boarder | null>(null);
  const [loadingAllocationDetails, setLoadingAllocationDetails] = useState(false);
  const [allocationDetailsData, setAllocationDetailsData] = useState<AllocationDetailsData | null>(null);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<string>('');


  // Fetch boarders from API
  const fetchBoarders = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/registration?${params}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setBoarders(result.data);
        setPagination(result.pagination);
      } else {
        setError(result.message || 'Failed to fetch boarders');
      }
    } catch (err) {
      console.error('Error fetching boarders:', err);
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch hostels and rooms
  const fetchHostels = async () => {
    setLoadingHostels(true);
    try {
      const response = await fetch('/api/hostels');
      const result: HostelResponse = await response.json();

      if (response.ok && result.success) {
        setHostels(result.data);
      } else {
        alert('Failed to fetch hostels');
      }
    } catch (err) {
      console.error('Error fetching hostels:', err);
      alert('An error occurred while fetching hostels');
    } finally {
      setLoadingHostels(false);
    }
  };

  // Open room allocation popup
  const openRoomAllocation = (boarder: Boarder) => {
    setSelectedBoarderForRoom(boarder);
    setShowRoomAllocation(true);
    setSelectedHostelId('');
    setSelectedRoomId('');
    setSelectedSeatNumber('');
    fetchHostels();
  };

  // Close room allocation popup
  const closeRoomAllocation = () => {
    setShowRoomAllocation(false);
    setSelectedBoarderForRoom(null);
    setSelectedHostelId('');
    setSelectedRoomId('');
    setSelectedSeatNumber('');
  };


  const handleDisallocation = async(boarder:Boarder)=>{
        try {
      // TODO: Replace with your actual API endpoint for room allocation
      const response = await fetch(`/api/allocate-room/${boarder._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Room Disallocated successfully!');
        closeRoomAllocation();
        fetchBoarders(pagination.page, search); // Refresh the list
      } else {
        alert(result.message || 'Failed to allocate room');
      }
    } catch (err) {
      console.error('Error allocating room:', err);
      alert('An error occurred while allocating room');
    }

  }

  // Handle room allocation
  const handleAllocateRoom = async () => {
    if (!selectedRoomId || !selectedBoarderForRoom || !selectedSeatNumber) {
      alert('Please select a room and seat number');
      return;
    }

    // Get the selected room details
    const selectedHostel = hostels.find(h => h.hostelId === selectedHostelId);
    const selectedRoom = selectedHostel?.rooms.find(r => r.roomId === selectedRoomId);

    if (!selectedRoom) {
      alert('Room not found');
      return;
    }

    setAllocating(true);
    try {
      // TODO: Replace with your actual API endpoint for room allocation
      const response = await fetch('/api/allocate-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boarderId: selectedBoarderForRoom._id,
          roomId: selectedRoomId,
          hostelId: selectedHostelId,
          roomNo: selectedRoom.roomNo,
          seatNumber: selectedSeatNumber,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Room allocated successfully!');
        closeRoomAllocation();
        fetchBoarders(pagination.page, search); // Refresh the list
      } else {
        alert(result.message || 'Failed to allocate room');
      }
    } catch (err) {
      console.error('Error allocating room:', err);
      alert('An error occurred while allocating room');
    } finally {
      setAllocating(false);
    }
  };




  // Get available rooms for selected hostel (rooms with at least one available seat)
  const getAvailableRooms = (): Room[] => {
    if (!selectedHostelId) return [];
    const hostel = hostels.find(h => h.hostelId === selectedHostelId);
    return hostel?.rooms.filter(room => {
      // Check if room has at least one available seat (value 0)
      return Object.values(room.seatNumbers).some(status => status === 0);
    }) || [];
  };

  // Get available seats for selected room
  const getAvailableSeats = (): string[] => {
    if (!selectedRoomId || !selectedHostelId) return [];
    const hostel = hostels.find(h => h.hostelId === selectedHostelId);
    const room = hostel?.rooms.find(r => r.roomId === selectedRoomId);
    
    if (!room) return [];
    
    // Return seat numbers where status is 0 (available)
    return Object.entries(room.seatNumbers)
      .filter(([_, status]) => status === 0)
      .map(([seatNo, _]) => seatNo);
  };

  // Get booked seats count for a room
  const getBookedSeatsCount = (room: Room): number => {
    return Object.values(room.seatNumbers).filter(status => status === 1).length;
  };

  // Initial load
  useEffect(() => {
    fetchBoarders(1, '');
  }, [fetchBoarders]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchBoarders(1, searchInput);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchBoarders(newPage, search);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    fetchBoarders(1, '');
  };

  // View boarder details
  const viewDetails = (boarder: Boarder) => {
    setSelectedBoarder(boarder);
  };

  // Close modal
  const closeModal = () => {
    setSelectedBoarder(null);
  };

  // View allocation details
  const viewAllocationDetails = async (boarder: Boarder) => {
    setSelectedAllocation(boarder);
    setShowAllocationDetails(true);
    setLoadingAllocationDetails(true);

    try {
      const response = await fetch(`/api/allocate-room/${boarder._id}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setAllocationDetailsData(result.data);
      } else {
        alert('Failed to fetch allocation details');
        closeAllocationDetails();
      }
    } catch (err) {
      console.error('Error fetching allocation details:', err);
      alert('An error occurred while fetching allocation details');
      closeAllocationDetails();
    } finally {
      setLoadingAllocationDetails(false);
    }
  };

  // Close allocation details modal
  const closeAllocationDetails = () => {
    setShowAllocationDetails(false);
    setSelectedAllocation(null);
    setAllocationDetailsData(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Registered Boarders</h1>
              <p className="text-gray-600 mt-1">
                Total: {pagination.total} boarder{pagination.total !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, email, phone..."
                  className="w-full md:w-80 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading boarders...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => fetchBoarders(pagination.page, search)}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && boarders.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No boarders found</h3>
            <p className="mt-2 text-gray-600">
              {search ? 'Try adjusting your search terms.' : 'No registrations yet.'}
            </p>
          </div>
        )}

        {/* Boarders List */}
        {!loading && !error && boarders.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Photo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room Allocate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Allocation Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered On
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {boarders.map((boarder) => (
                      <tr key={boarder._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                            <img
                              src={boarder.photo}
                              alt={boarder.name}
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{boarder.name}</div>
                          <div className="text-sm font-medium text-red-500">{boarder.phone}</div>
                        </td>
            
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            
                            {/* Allocate Button */}
                            <button
                              onClick={() => openRoomAllocation(boarder)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm inline-flex items-center gap-2"
                            >
                             
                              <UserPlus size={16} />
                              Allocate
                            </button>

                            {/* Show Disallocate only if allocated */}
                            {boarder.isAllocated && (
                              <button
                                onClick={() => handleDisallocation(boarder)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm inline-flex items-center gap-2"
                              >
                                <RiLogoutBoxRLine size={16} />
                                  Leave
                              </button>
                            )}

                          </div>
                        </td>



                        <td className="px-6 py-4 whitespace-nowrap">
                          {boarder.isAllocated ? (
                            <button
                              onClick={() => viewAllocationDetails(boarder)}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                              title="View allocation details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                              </svg>
                              <span className="text-sm font-medium">View</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-500 rounded-lg" title="Not allocated">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                              </svg>
                              <span className="text-sm font-medium">Not Allocated</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{formatDate(boarder.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => viewDetails(boarder)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {boarders.map((boarder) => (
                <div key={boarder._id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={boarder.photo}
                        alt={boarder.name}
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{boarder.name}</h3>
                      <p className="text-sm text-gray-600">{boarder.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => openRoomAllocation(boarder)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm inline-flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                      </svg>
                      Allocate Room
                    </button>
                    {boarder.isAllocated ? (
                      <button
                        onClick={() => viewAllocationDetails(boarder)}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        <span className="text-sm font-medium">View Allocation</span>
                      </button>
                    ) : (
                      <div className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-500 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                        <span className="text-sm font-medium">Not Allocated</span>
                      </div>
                    )}
                    <button
                      onClick={() => viewDetails(boarder)}
                      className="w-full text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>

                <div className="flex items-center gap-2">
                  {/* First Page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                    </svg>
                  </button>

                  {/* Previous */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="hidden sm:flex items-center gap-2">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg border font-medium transition ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Current Page (Mobile) */}
                  <div className="sm:hidden px-4 py-2 rounded-lg border border-gray-300 bg-blue-600 text-white font-medium">
                    {pagination.page}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                  >
                    Next
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {selectedBoarder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Boarder Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Photo and Basic Info */}
              <div className="flex items-center gap-6">
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src={selectedBoarder.photo}
                    alt={selectedBoarder.name}
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedBoarder.name}</h3>
                  <span className={`inline-flex mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedBoarder.isStudent === 'yes' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedBoarder.isStudent === 'yes' ? 'Student' : 'Working Professional'}
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedBoarder.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedBoarder.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedBoarder.dob)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Organisation</p>
                    <p className="font-medium text-gray-900">{selectedBoarder.organisation}</p>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Parent/Guardian Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Parent&apos;s Name</p>
                    <p className="font-medium text-gray-900">{selectedBoarder.parentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Parent&apos;s Number</p>
                    <p className="font-medium text-gray-900">{selectedBoarder.parentNumber}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Documents</h4>
                <div className="flex gap-4">
                  <a 
                    href={selectedBoarder.aadharCard}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    View Aadhar Card
                  </a>
                </div>
              </div>

              {/* Registration Date */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Registered on: <span className="font-medium text-gray-900">{formatDate(selectedBoarder.createdAt)}</span>
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Allocation Modal */}
      {showRoomAllocation && selectedBoarderForRoom && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Allocate Room</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Allocating room for: <span className="font-semibold text-gray-900">{selectedBoarderForRoom.name}</span>
                  </p>
                </div>
                <button
                  onClick={closeRoomAllocation}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingHostels ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading hostels...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Hostel Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Hostel
                    </label>
                    <select
                      value={selectedHostelId}
                      onChange={(e) => {
                        setSelectedHostelId(e.target.value);
                        setSelectedRoomId('');
                        setSelectedSeatNumber('');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Select Hostel --</option>
                      {hostels.map((hostel) => (
                        <option key={hostel.hostelId} value={hostel.hostelId}>
                          {hostel.hostelName} ({hostel.rooms.filter(r => Object.values(r.seatNumbers).some(status => status === 0)).length} rooms available)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Room Selection */}
                  {selectedHostelId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Room
                      </label>
                      {getAvailableRooms().length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                          <p className="text-yellow-800 font-medium">No available rooms in this hostel</p>
                          <p className="text-sm text-yellow-600 mt-1">All rooms are fully booked</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {getAvailableRooms().map((room) => {
                            const bookedCount = getBookedSeatsCount(room);
                            const availableCount = room.seatAllocate - bookedCount;
                            
                            return (
                              <button
                                key={room.roomId}
                                onClick={() => {
                                  setSelectedRoomId(room.roomId);
                                  setSelectedSeatNumber('');
                                }}
                                className={`p-4 border-2 rounded-lg text-left transition ${
                                  selectedRoomId === room.roomId
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-gray-900">Room {room.roomNo}</span>
                                  {selectedRoomId === room.roomId && (
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                    </svg>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  <div className="flex items-center gap-2 mb-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                    <span>Total Seats: {room.seatAllocate}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span className="text-green-600 font-medium">
                                      {availableCount} seat(s) available
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Seat Selection */}
                  {selectedRoomId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Seat Number
                      </label>
                      {getAvailableSeats().length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                          <p className="text-yellow-800 font-medium">No available seats in this room</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {getAvailableSeats().map((seatNo) => (
                            <button
                              key={seatNo}
                              onClick={() => setSelectedSeatNumber(seatNo)}
                              className={`p-4 border-2 rounded-lg text-center transition font-semibold ${
                                selectedSeatNumber === seatNo
                                  ? 'border-green-600 bg-green-50 text-green-900'
                                  : 'border-gray-200 hover:border-green-300 text-gray-700'
                              }`}
                            >
                              <div className="text-lg">{seatNo}</div>
                              {selectedSeatNumber === seatNo && (
                                <svg className="w-5 h-5 mx-auto mt-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected Info */}
                  {selectedRoomId && selectedSeatNumber && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Allocation Summary</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><span className="font-medium">Boarder:</span> {selectedBoarderForRoom.name}</p>
                        <p><span className="font-medium">Hostel:</span> {hostels.find(h => h.hostelId === selectedHostelId)?.hostelName}</p>
                        <p><span className="font-medium">Room:</span> {hostels.find(h => h.hostelId === selectedHostelId)?.rooms.find(r => r.roomId === selectedRoomId)?.roomNo}</p>
                        <p><span className="font-medium">Seat:</span> {selectedSeatNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeRoomAllocation}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocateRoom}
                disabled={!selectedRoomId || !selectedSeatNumber || allocating}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {allocating ? 'Allocating...' : 'Confirm Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Allocation Details Modal */}
      {showAllocationDetails && selectedAllocation && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Allocation Details</h2>
                <button
                  onClick={closeAllocationDetails}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingAllocationDetails ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading allocation details...</p>
                </div>
              ) : allocationDetailsData ? (
                <div className="space-y-6">
                  {/* Boarder Info */}
                  <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                    <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={selectedAllocation.photo}
                        alt={allocationDetailsData.boarderName}
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{allocationDetailsData.boarderName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{selectedAllocation.email}</p>
                      <p className="text-sm text-gray-600">{allocationDetailsData.phone}</p>
                    </div>
                  </div>

                  {/* Allocation Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                      </svg>
                      Room Allocation
                    </h4>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Hostel Name</p>
                          <p className="text-lg font-semibold text-gray-900">{allocationDetailsData.hostelName}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Room Number</p>
                          <p className="text-lg font-semibold text-gray-900">{allocationDetailsData.roomNo}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Seat Number</p>
                          <p className="text-lg font-semibold text-gray-900">{allocationDetailsData.seatNumber}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Allocated On</p>
                        <p className="text-base font-medium text-gray-900">
                          {formatDate(allocationDetailsData.allocatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-center pt-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span className="font-semibold">Room Allocated</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-red-600">Failed to load allocation details</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={closeAllocationDetails}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}