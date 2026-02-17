"use client"

import React, { useState, useEffect } from 'react';

interface IPhoto {
  _id: string;
  photoUrl: string;
  duration: number;
  active: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  data: IPhoto[];
}

const Home = () => {
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos');
        if (!response.ok) throw new Error('Failed to fetch photos');
        const result: ApiResponse = await response.json();
        
        if (result.success && result.data) {
          const activePhotos = result.data.filter(photo => photo.active === 1);
          setPhotos(activePhotos);
        } else {
          throw new Error('Invalid API response');
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;

    const currentPhoto = photos[currentIndex];
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, currentPhoto.duration * 1000);

    return () => clearTimeout(timer);
  }, [currentIndex, photos]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">No active photos to display</div>
      </div>
    );
  }

  
   return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <img
        src={photos[currentIndex].photoUrl}
        alt={`Photo ${currentIndex + 1}`}
        className="w-full h-[100vh] object-cover"
      />
    </div>
  );
  
};

export default Home;