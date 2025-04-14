import { useState } from 'react';

interface Album {
  name: string;
  artist: string;
  imageUrl: string;
  mbid?: string;
  // Include all image sizes for fallback options
  allImages: {
    small: string;
    medium: string;
    large: string;
    extralarge: string;
  };
}

interface LastFmSearchProps {
  onSelectAlbum: (
    imageUrl: string,
    albumInfo: { name: string; artist: string },
  ) => void;
  apiKey: string;
}

const LastFmSearch = ({ onSelectAlbum, apiKey }: LastFmSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to format image URLs with the proxy
  const formatImageUrl = (originalUrl: string): string => {
    if (!originalUrl) return '';
    return `http://localhost:3001/proxy-image?url=${encodeURIComponent(
      originalUrl,
    )}`;
  };

  console.log(formatImageUrl('https://example.com/image.jpg'));

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Using the album.search method from Last.fm API
      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(
          searchTerm,
        )}&api_key=${apiKey}&format=json&limit=20`,
        { mode: 'cors' },
      );

      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`Last.fm API error: ${data.message}`);
      }

      if (
        data.results &&
        data.results.albummatches &&
        data.results.albummatches.album
      ) {
        const albumResults = data.results.albummatches.album;

        // Process and map the album data
        const processedAlbums: Album[] = albumResults.map((album: any) => {
          // Create an object with all available image sizes
          const allImages = {
            small: '',
            medium: '',
            large: '',
            extralarge: '',
          };

          if (album.image && album.image.length > 0) {
            // Map all available images by size
            album.image.forEach((img: any) => {
              if (img.size && img['#text']) {
                // Store the original URL
                allImages[img.size as keyof typeof allImages] = img['#text'];
              }
            });
          }

          // Get the largest available image for the main display
          const originalImageUrl =
            allImages.extralarge ||
            allImages.large ||
            allImages.medium ||
            allImages.small;

          return {
            name: album.name,
            artist: album.artist,
            // Use the proxy URL for the main image
            imageUrl: formatImageUrl(originalImageUrl),
            mbid: album.mbid,
            // Store all proxied image URLs
            allImages: {
              small: formatImageUrl(allImages.small),
              medium: formatImageUrl(allImages.medium),
              large: formatImageUrl(allImages.large),
              extralarge: formatImageUrl(allImages.extralarge),
            },
          };
        });

        // Filter out albums without any images
        const albumsWithImages = processedAlbums.filter(
          (album) => album.imageUrl && album.imageUrl !== formatImageUrl(''),
        );

        setAlbums(albumsWithImages);
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

  // Handle selecting an album
  const handleAlbumSelect = (album: Album) => {
    onSelectAlbum(album.imageUrl, {
      name: album.name,
      artist: album.artist,
    });
  };

  // Handle keyboard input for search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Search Albums with Last.fm</h2>

      <div className="mb-4 flex">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for albums..."
          className="flex-1 rounded-l border border-gray-300 p-2"
        />
        <button
          onClick={handleSearch}
          className="rounded-r bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading || !searchTerm.trim()}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}

      {albums.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md mb-2 font-medium">Results:</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {albums.map((album, index) => (
              <div
                key={`${album.name}-${album.artist}-${index}`}
                className="cursor-pointer overflow-hidden rounded border border-gray-200 transition-all hover:shadow-md"
                onClick={() => handleAlbumSelect(album)}
              >
                <div className="relative h-40 bg-gray-100">
                  <img
                    src={album.imageUrl}
                    alt={`${album.name} by ${album.artist}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Try fallback images if the main one fails
                      const target = e.target as HTMLImageElement;
                      // Try medium size if extralarge/large fails
                      if (
                        target.src === album.imageUrl &&
                        album.allImages.medium
                      ) {
                        target.src = album.allImages.medium;
                      }
                      // Try small size if medium fails
                      else if (
                        target.src === album.allImages.medium &&
                        album.allImages.small
                      ) {
                        target.src = album.allImages.small;
                      }
                      // Use a data URI placeholder if all else fails
                      else {
                        target.src =
                          'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22174%22%20height%3D%22174%22%20viewBox%3D%220%200%20174%20174%22%3E%3Crect%20fill%3D%22%23eee%22%20width%3D%22174%22%20height%3D%22174%22%2F%3E%3Ctext%20fill%3D%22%23999%22%20font-family%3D%22Arial%2CVerdana%2CSans-serif%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20x%3D%2287%22%20y%3D%2287%22%20dominant-baseline%3D%22middle%22%3EAlbum%3C%2Ftext%3E%3C%2Fsvg%3E';
                      }
                    }}
                  />
                </div>
                <div className="p-2">
                  <p className="truncate text-sm font-medium">{album.name}</p>
                  <p className="truncate text-xs text-gray-600">
                    {album.artist}
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

      <div className="mt-4 text-xs text-gray-500">
        <p>Powered by Last.fm API</p>
      </div>
    </div>
  );
};

export default LastFmSearch;
