import React from "react";
import { useInspirationVideos } from "../../../utils/hooks/api/inspirationVideos";
import { useNavigate } from "react-router-dom";

const InspiringVideosCard = () => {
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 3;
  const currentPage = 1;

  const { data: videos, loading: fetchLoading } = useInspirationVideos(
    currentPage,
    ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      {/* Header */}
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Inspiring Videos
      </div>

      {fetchLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!fetchLoading && (
        <div className="p-4">
          {/* Main Video */}

          {videos?.length > 0 && (
            <a
              href={videos?.[0]?.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div>
                <div className="relative mb-2 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                  <img
                    src={videos?.[0]?.attachment_path}
                    alt={videos?.[0]?.title}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x225/cccccc/666666?text=Video+Thumbnail";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white bg-opacity-70 p-2 rounded-full hover:bg-opacity-90 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-indigo-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">
                  {videos?.[0]?.title}
                </div>
              </div>
            </a>
          )}

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {videos?.slice(1)?.map((video, index) => (
                <a href={video?.url} target="_blank" rel="noopener noreferrer">
                  <div
                    key={index + 1}
                    className="flex gap-2 items-start cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={video?.attachment_path}
                        alt={video?.title}
                        className="w-12 h-12 object-cover rounded-md"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/48x48/cccccc/666666?text=Video";
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 p-1 rounded">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between text-[12px] text-gray-700 flex-1">
                      <div className="font-medium leading-snug line-clamp-2 hover:text-indigo-600 transition-colors">
                        {video?.title}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* View More Button */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/inspiration-videos")}
              className="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors"
            >
              View More Videos →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspiringVideosCard;
