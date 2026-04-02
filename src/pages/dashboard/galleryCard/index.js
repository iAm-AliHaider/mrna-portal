import React, { useState } from "react";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const GalleryCard = ({
  title,
  images = [],
  isVideo = false,
  loading = false,
}) => {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (images.length > 0) {
      setCurrent((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrev = () => {
    if (images.length > 0) {
      setCurrent((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getYouTubeThumbnail = (videoUrl) => {
    // Extract YouTube video ID
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = videoUrl.match(youtubeRegex);
    
    if (match) {
      const videoId = match[1];
      // Return high quality YouTube thumbnail
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return videoUrl; // Return original URL if not YouTube
  };

  const handleVideoClick = (videoUrl) => {
    // Extract YouTube video ID and redirect
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = videoUrl.match(youtubeRegex);
    
    if (match) {
      const videoId = match[1];
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      window.open(youtubeUrl, '_blank');
    } else {
      // If not a YouTube URL, open as is
      window.open(videoUrl, '_blank');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border w-full mb-5">
        <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
          {title}
        </div>
        <div className="p-4">
          <div className="w-full h-[200px] bg-gray-200 animate-pulse rounded flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show placeholder when no images
  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow border w-full mb-5">
        <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
          {title}
        </div>
        <div className="p-4">
          <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No {title.toLowerCase()} available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border w-full mb-5">
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        {title}
      </div>

      <div className="relative p-4">
        <img
          src={isVideo ? getYouTubeThumbnail(images[current]) : images[current]}
          alt={`${title}-${current + 1}`}
          className="w-full h-[200px] object-cover rounded"
          onError={(e) => {
            e.target.src = '/assets/images/placeholder_image.png';
          }}
        />
        {isVideo && (
          <div 
            className="absolute inset-0 cursor-pointer flex items-center justify-center"
            onClick={() => handleVideoClick(images[current])}
          >
            <div className="bg-black bg-opacity-30 rounded-full p-2 hover:bg-opacity-50 transition-all">
              <PlayCircleOutlineIcon
                className="text-white text-5xl"
                style={{ filter: "drop-shadow(0px 0px 4px #000)" }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between text-xs text-gray-600 p-2 px-4">
        <button 
          onClick={handlePrev} 
          className="hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={images.length <= 1}
        >
          ‹ Previous
        </button>
        <span className="text-gray-500">
          {current + 1} of {images.length}
        </span>
        <button 
          onClick={handleNext} 
          className="hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={images.length <= 1}
        >
          Next ›
        </button>
      </div>
    </div>
  );
};

export default GalleryCard;
