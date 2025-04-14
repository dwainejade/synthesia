import { useState, useEffect } from 'react';
import ColorThief from 'colorthief';

const AlbumArtGradient = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [displayImageUrl, setDisplayImageUrl] = useState('');
  const [colorCount, setColorCount] = useState(5);
  const [palette, setPalette] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample album covers using placeholder images that don't have CORS issues
  const sampleImages = [
    'https://via.placeholder.com/400x400/3498db/ffffff?text=Album+1',
    'https://via.placeholder.com/400x400/e74c3c/ffffff?text=Album+2',
    'https://via.placeholder.com/400x400/2ecc71/ffffff?text=Album+3',
    'https://via.placeholder.com/400x400/9b59b6/ffffff?text=Album+4',
  ];

  // Initialize with first sample image
  useEffect(() => {
    if (!imageUrl) {
      useSampleImage(sampleImages[0]);
    }
  }, []);

  // Function to extract colors using the workaround approach
  const extractColors = (url: string, count: number) => {
    setLoading(true);
    setError(null);

    // Set the display image URL immediately
    setDisplayImageUrl(url);

    // Create a new image element programmatically
    const img = new Image();

    img.onload = function () {
      try {
        const colorThief = new ColorThief();
        const colors = colorThief.getPalette(img, count);

        if (colors) {
          // Convert RGB arrays to CSS color strings
          const colorStrings = colors.map(
            (color: number[]) => `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
          );

          setPalette(colorStrings);
        } else {
          setError('Failed to extract colors from the image');
        }
      } catch (err) {
        console.error('Color extraction error:', err);
        setError(
          `Error extracting colors: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      } finally {
        setLoading(false);
      }
    };

    img.onerror = function () {
      setLoading(false);
      setError(
        'Failed to load the image. It might be protected by CORS policy.',
      );
    };

    // Important: set crossOrigin before setting src
    img.crossOrigin = 'Anonymous';
    img.src = url;
  };

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

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      setPalette([]);
      setLoading(true);
      setError(null);

      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setImageUrl(event.target.result);
          extractColors(event.target.result, colorCount);
        }
      };

      reader.onerror = () => {
        setLoading(false);
        setError('Failed to read the selected file');
      };

      reader.readAsDataURL(file);
    }
  };

  // Handle direct URL input
  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get('imageUrl') as string;

    if (url) {
      setImageUrl(url);
      extractColors(url, colorCount);
    }
  };

  // Use a sample image
  const useSampleImage = (url: string) => {
    setImageUrl(url);
    extractColors(url, colorCount);
  };

  // Update colors when colorCount changes
  useEffect(() => {
    if (imageUrl) {
      extractColors(imageUrl, colorCount);
    }
  }, [colorCount]);

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
        <div className="mb-6 inline-block rounded-lg shadow-md">
          {displayImageUrl ? (
            <img
              src={displayImageUrl}
              alt="Album cover"
              className="max-h-64 max-w-64 rounded"
              style={{
                maxWidth: '300px',
                maxHeight: '300px',
                objectFit: 'contain',
              }}
              crossOrigin="anonymous"
            />
          ) : null}
        </div>

        {loading ? (
          <p className="rounded bg-black bg-opacity-50 p-2 text-white">
            Processing...
          </p>
        ) : null}

        {error ? (
          <p className="rounded bg-white bg-opacity-75 p-2 text-red-600">
            {error}
          </p>
        ) : null}

        {palette.length > 0 && (
          <div className="mt-4 rounded-lg bg-black bg-opacity-25 p-4 text-center backdrop-blur-sm">
            <p className="mb-2 text-white">Extracted Color Palette:</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {palette.map((color, index) => (
                <div
                  key={index}
                  className="relative h-10 w-10 rounded shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  <div className="absolute -bottom-6 left-0 right-0 overflow-hidden text-ellipsis text-center text-xs text-white">
                    {color}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        {/* Method 1: Upload a file */}
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Option 1: Upload an Image (Recommended)
          </h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full rounded-md border border-gray-300 p-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            This method bypasses CORS restrictions completely
          </p>
        </div>

        {/* Method 2: Direct URL */}
        <form onSubmit={handleUrlSubmit} className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Option 2: Enter an Image URL
          </h3>
          <div className="flex">
            <input
              type="text"
              name="imageUrl"
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
            Note: This method may fail due to CORS restrictions
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

        {/* Method 3: Sample images */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Option 3: Try These Samples
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
          <p className="mt-1 text-xs text-gray-500">
            These sample images should work without CORS issues
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 rounded-lg bg-gray-100 p-4">
        <h2 className="mb-2 text-lg font-semibold">How It Works</h2>
        <p className="text-sm">
          This component uses the ColorThief library to extract a color palette
          from the album artwork. It creates a gradient background using the two
          most dominant colors, mimicking the effect seen in the iOS Music app.
        </p>
        <p className="mt-2 text-sm">
          <strong>CORS Issue Fix:</strong> This implementation uses a workaround
          that creates a new Image object programmatically with crossOrigin set
          to 'Anonymous' before setting the src attribute. This can help with
          some CORS issues, but the most reliable method is still to upload your
          own images directly.
        </p>
        <p className="mt-2 text-sm">
          In a real application, you would need to install:
          <code className="mt-1 block rounded bg-gray-200 p-2">
            npm install colorthief
          </code>
        </p>
      </div>
    </div>
  );
};

export default AlbumArtGradient;
