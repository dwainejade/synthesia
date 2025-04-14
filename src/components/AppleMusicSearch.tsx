import { useState, useEffect } from 'react';

// Add MusicKit types to the global Window interface
declare global {
  interface Window {
    MusicKit: any;
    music: any;
  }
}

interface Album {
  id: string;
  name: string;
  artistName: string;
  artworkUrl: string;
}

interface AppleMusicSearchProps {
  onSelectAlbum: (
    imageUrl: string,
    albumInfo: { name: string; artist: string },
  ) => void;
}

const AppleMusicSearch = ({ onSelectAlbum }: AppleMusicSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Initialize MusicKit JS
  useEffect(() => {
    // Load MusicKit JS script
    const script = document.createElement('script');
    script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';
    script.async = true;

    script.onload = () => {
      // MusicKit JS is loaded, now we can initialize it
      initializeMusicKit();
    };

    document.body.appendChild(script);

    return () => {
      // Clean up if needed
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeMusicKit = async () => {
    try {
      // Replace with your developer token - in production this should be fetched from your server
      // You can get a developer token from Apple's developer portal after signing up for MusicKit
      const developerToken = 'YOUR_DEVELOPER_TOKEN'; // This should be provided by your server

      // Configure MusicKit
      window.music = await window.MusicKit.configure({
        developerToken,
        app: {
          name: 'Album Cover Color Extractor',
          build: '1.0.0',
        },
      });

      // Check if user is already authorized
      if (window.music.isAuthorized) {
        setIsAuthorized(true);
      }
    } catch (err) {
      setError(
        'Failed to initialize MusicKit: ' +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  const handleAuthorize = async () => {
    try {
      if (!window.music) {
        setError('MusicKit is not initialized');
        return;
      }

      await window.music.authorize();
      setIsAuthorized(true);
      setError(null);
    } catch (err) {
      setError(
        'Authorization failed: ' +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    if (!window.music) {
      setError('MusicKit is not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Search for albums
      const result = await window.music.api.music(
        '/v1/catalog/{{storefrontId}}/search',
        {
          params: {
            term: searchTerm,
            types: 'albums',
            limit: 25,
          },
        },
      );

      // Parse the results
      if (result.data.results.albums && result.data.results.albums.data) {
        const albumData = result.data.results.albums.data.map((album: any) => ({
          id: album.id,
          name: album.attributes.name,
          artistName: album.attributes.artistName,
          // Format artwork URL to get the appropriate size
          artworkUrl: formatArtworkUrl(album.attributes.artwork),
        }));

        setAlbums(albumData);
      } else {
        setAlbums([]);
      }
    } catch (err) {
      setError(
        'Search failed: ' + (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Format the artwork URL with the desired dimensions
  const formatArtworkUrl = (artwork: any): string => {
    if (!artwork || !artwork.url) return '';

    // Apple Music artwork URLs have {w} and {h} placeholders for width and height
    return artwork.url.replace('{w}', '600').replace('{h}', '600');
  };

  // Handle selecting an album
  const handleAlbumSelect = (album: Album) => {
    onSelectAlbum(album.artworkUrl, {
      name: album.name,
      artist: album.artistName,
    });
  };

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Search Apple Music</h2>

      {!isAuthorized ? (
        <div className="mb-4 text-center">
          <p className="mb-2">Connect to Apple Music to search for albums</p>
          <button
            onClick={handleAuthorize}
            className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Connect to Apple Music
          </button>
          {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
        </div>
      ) : (
        <>
          <div className="mb-4 flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for albums..."
              className="flex-1 rounded-l border border-gray-300 p-2"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="rounded-r bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}

          {albums.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md mb-2 font-medium">Results:</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="cursor-pointer overflow-hidden rounded border border-gray-200 transition-all hover:shadow-md"
                    onClick={() => handleAlbumSelect(album)}
                  >
                    <img
                      src={album.artworkUrl}
                      alt={album.name}
                      className="h-auto w-full object-cover"
                    />
                    <div className="p-2">
                      <p className="truncate text-sm font-medium">
                        {album.name}
                      </p>
                      <p className="truncate text-xs text-gray-600">
                        {album.artistName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {albums.length === 0 && searchTerm && !isLoading ? (
            <p className="text-center text-gray-500">No albums found</p>
          ) : null}
        </>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Note: You need an Apple Music account to use this feature.</p>
      </div>
    </div>
  );
};

export default AppleMusicSearch;
