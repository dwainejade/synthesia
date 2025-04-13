import { useState } from 'react';
import { usePalette } from 'color-thief-react';

const AlbumArtGradient = () => {
  const [imageUrl, setImageUrl] = useState(
    'https://m.media-amazon.com/images/I/71K-Mc4zsoL.jpg',
  );
  const [colorCount, setColorCount] = useState(5);

  // Use the usePalette hook from color-thief-react
  const {
    data: palette,
    loading,
    error,
  } = usePalette(imageUrl, colorCount, 'rgb', {
    crossOrigin: 'anonymous',
    quality: 10,
  });

  // Create a CSS gradient using the first two colors if available
  const getBackgroundStyle = () => {
    if (palette && palette.length >= 2) {
      return {
        background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
        transition: 'background 0.5s ease',
      };
    }
    return { background: '#f5f5f5' };
  };

  // Handle image URL change
  const handleUrlChange = (e: any) => {
    setImageUrl(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  // Sample album covers
  const sampleImages = [
    'https://m.media-amazon.com/images/I/71K-Mc4zsoL.jpg',
    'https://m.media-amazon.com/images/I/81hF9lE0AeL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/71rrUlGrQlL._SL1200_.jpg',
    'https://m.media-amazon.com/images/I/A18QUHExFgL._SL1500_.jpg',
  ];

  // Use a sample image
  const useSampleImage = (url: string) => {
    setImageUrl(url);
  };

  return (
    <div className="mx-auto max-w-4xl p-6 font-sans">
      <h1 className="mb-6 text-center text-2xl font-bold">
        iOS Music App Style Gradient
      </h1>

      {/* Main content area with dynamic background */}
      <div
        className="mb-8 flex min-h-96 flex-col items-center justify-center rounded-lg p-8 shadow-lg"
        style={getBackgroundStyle()}
      >
        <div className="mb-6 inline-block rounded-lg bg-white p-4 shadow-md">
          <img
            src={imageUrl}
            alt="Album cover"
            className="max-h-64 max-w-64 rounded"
            style={{
              maxWidth: '500px',
              maxHeight: '500px',
              objectFit: 'contain',
            }}
            crossOrigin="anonymous"
          />
        </div>

        {loading ? (
          <p className="rounded bg-black bg-opacity-50 p-2 text-white">
            Extracting colors...
          </p>
        ) : null}
        {error ? (
          <p className="rounded bg-white bg-opacity-75 p-2 text-red-600">
            Error extracting colors. The image might be protected by CORS
            policy.
          </p>
        ) : null}

        {palette && palette.length > 0 ? (
          <div className="mt-4 rounded-lg bg-black bg-opacity-25 p-4 text-center backdrop-blur-sm">
            <p className="mb-2 text-white">Extracted Color Palette:</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {palette.map((color, index) => (
                <div
                  key={index}
                  className="h-10 w-10 rounded shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Controls */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <form onSubmit={handleSubmit} className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Enter an image URL:
          </label>
          <div className="flex">
            <input
              type="text"
              value={imageUrl}
              onChange={handleUrlChange}
              className="flex-1 rounded-l-md border border-gray-300 p-2"
              placeholder="https://example.com/image.jpg"
            />
            <button
              type="submit"
              className="rounded-r-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Load
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Note: Some images may be protected by CORS policy and won't work.
          </p>
        </form>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Number of Colors:
          </label>
          <input
            type="range"
            min="2"
            max="8"
            value={colorCount}
            onChange={(e) => setColorCount(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-center">{colorCount}</div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Sample Album Covers:
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sampleImages.map((url, index) => (
              <button
                key={index}
                onClick={() => useSampleImage(url)}
                className="rounded border border-gray-200 p-1 hover:bg-gray-100"
              >
                <img
                  src={url}
                  alt={`Sample ${index + 1}`}
                  className="h-16 w-full rounded object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 rounded-lg bg-gray-100 p-4">
        <h2 className="mb-2 text-lg font-semibold">How it works</h2>
        <p className="text-sm">
          This component uses color-thief-react to extract a color palette from
          the album artwork. It creates a gradient background using the two most
          dominant colors, mimicking the effect seen in the iOS Music app. You
          can adjust the number of colors extracted using the slider.
        </p>
        <p className="mt-2 text-sm">
          In a real application, you would need to install this library with:
          <code className="mt-1 block rounded bg-gray-200 p-2">
            npm install color-thief-react
          </code>
        </p>
      </div>
    </div>
  );
};

export default AlbumArtGradient;
