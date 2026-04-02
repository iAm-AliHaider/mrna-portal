"use client"

import { useState } from "react"

export default function ImageCarousel({ images, renderAction }) {
  const [selectedIndex, setSelectedIndex] = useState(null)

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 sm:h-64 relative rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No photos</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading some photos.</p>
        </div>
      </div>
    )
  }

  // If no image is selected, show grid view
  if (selectedIndex === null) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity group bg-gray-100"
              onClick={() => setSelectedIndex(index)}
            >
              <img 
                src={img || "/placeholder.svg"} 
                alt={`Image ${index + 1}`} 
                className="object-contain w-full h-full bg-gray-100" 
              />

              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
              {renderAction && (
                <div
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderAction(img)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Featured view with selected image and thumbnails
  const goToNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <div className="w-full max-h-[80vh] flex flex-col">
      {/* Header with close button */}
      <div className="flex justify-between items-center mb-3 sm:mb-4 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Image {selectedIndex + 1} of {images.length}
        </h3>
        <button
          onClick={() => setSelectedIndex(null)}
          className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 flex-1 min-h-0">
        {/* Main featured image */}
        <div className="flex-1 min-h-0">
          <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 xl:h-96 rounded-lg sm:rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={images[selectedIndex] || "/placeholder.svg"}
              alt={`Featured image ${selectedIndex + 1}`}
              className="object-contain w-full h-full bg-gray-100"
            />

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute top-1/2 left-2 sm:left-4 z-30 transform -translate-y-1/2 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 6 10">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 1 1 5l4 4"
                    />
                  </svg>
                </button>

                <button
                  onClick={goToNext}
                  className="absolute top-1/2 right-2 sm:right-4 z-30 transform -translate-y-1/2 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 6 10">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail sidebar */}
        <div className="w-full lg:w-32 xl:w-40 flex-shrink-0">
          <div className="h-32 sm:h-40 lg:h-80 xl:h-96 overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-2 gap-1 sm:gap-2 pb-2">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`aspect-square relative rounded-md overflow-hidden cursor-pointer transition-all flex-shrink-0 bg-gray-100 ${
                    index === selectedIndex
                      ? "ring-1 sm:ring-2 ring-blue-500 ring-offset-1 sm:ring-offset-2"
                      : "hover:opacity-80"
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    className="object-contain w-full h-full bg-gray-100"
                  />
                  {index === selectedIndex && <div className="absolute inset-0 bg-blue-500 bg-opacity-20"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
