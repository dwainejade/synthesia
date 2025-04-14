import { useState, useEffect } from 'react';
import ColorThief from 'colorthief';
import LastFmSearch from './LastFmSearch';

const AlbumArtGradient = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [displayImageUrl, setDisplayImageUrl] = useState('');
  const [colorCount, setColorCount] = useState(5);
  const [palette, setPalette] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLastFmSearch, setShowLastFmSearch] = useState(false);
  const [albumInfo, setAlbumInfo] = useState<{
    name: string;
    artist: string;
  } | null>(null);

  // Your Last.fm API key should be stored in an environment variable in a real app
  // This is just a placeholder - you need to replace this with your actual API key
  const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

  // Sample album covers using placeholder images that don't have CORS issues
  const sampleImages = [
    'https://lastfm.freetls.fastly.net/i/u/300x300/3c737386c1604655951f7ee93231f29f.png',
    'https://lastfm.freetls.fastly.net/i/u/300x300/1f161965ef64dd3369a41745c6682b32.png',
    'https://lastfm.freetls.fastly.net/i/u/300x300/1de9e3e9a3908045d96965eaea977215.png',
    'https://lastfm.freetls.fastly.net/i/u/300x300/dff2a20f9c0848cf92eda1e3c6c618b3.png',
  ];

  // Initialize with first sample image
  useEffect(() => {
    if (!imageUrl) {
      handleSampleImageSelect(sampleImages[0]);
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
      setAlbumInfo(null);

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
      setAlbumInfo(null);
    }
  };

  // Use a sample image
  const handleSampleImageSelect = (url: string) => {
    setImageUrl(url);
    extractColors(url, colorCount);
    setAlbumInfo(null);
  };

  // Handle album selection from Last.fm
  const handleAlbumSelect = (
    url: string,
    albumData: { name: string; artist: string },
  ) => {
    setImageUrl(url);
    extractColors(url, colorCount);
    setAlbumInfo(albumData);
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

        {albumInfo ? (
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-white">{albumInfo.name}</h2>
            <p className="text-white opacity-80">{albumInfo.artist}</p>
          </div>
        ) : null}

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
                    {/* {color} */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="">
        {/* Last.fm Search Component */}
        <LastFmSearch
          onSelectAlbum={handleAlbumSelect}
          apiKey={LASTFM_API_KEY}
        />

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
                onClick={() => handleSampleImageSelect(url)}
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
    </div>
  );
};

export default AlbumArtGradient;
