import { useState, useEffect, useRef } from 'react';

// Types for our color extraction functionality
interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface ExtractedColorPalette {
  colors: string[];
  loading: boolean;
  error: string | null;
}

// Convert RGB to hex string
const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

// Convert hex to RGB
const hexToRgb = (hex: string): RGBColor | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Calculate color luminance (for sorting and finding dominant colors)
const calculateLuminance = (r: number, g: number, b: number): number => {
  // Using relative luminance formula
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Sort colors by luminance
const sortColorsByLuminance = (colors: string[]): string[] => {
  return [...colors].sort((a, b) => {
    const rgbA = hexToRgb(a);
    const rgbB = hexToRgb(b);

    if (!rgbA || !rgbB) return 0;

    const luminanceA = calculateLuminance(rgbA.r, rgbA.g, rgbA.b);
    const luminanceB = calculateLuminance(rgbB.r, rgbB.g, rgbB.b);

    return luminanceB - luminanceA; // Sort from brightest to darkest
  });
};

// Extract dominant colors using the Canvas API
export const useFastImagePalette = (
  imageUrl: string,
  colorCount: number = 5,
): ExtractedColorPalette => {
  const [result, setResult] = useState<ExtractedColorPalette>({
    colors: [],
    loading: true,
    error: null,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setResult({
        colors: [],
        loading: false,
        error: 'No image URL provided',
      });
      return;
    }

    // Create canvas element if it doesn't exist
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setResult({
        colors: [],
        loading: false,
        error: 'Canvas 2D context not supported',
      });
      return;
    }

    setResult((prev) => ({ ...prev, loading: true, error: null }));

    const img = new Image();

    // We're not using crossOrigin here because we're working directly with canvas
    // This is why this approach can bypass CORS issues

    img.onload = () => {
      try {
        // Set a small canvas size for faster processing
        canvas.width = 50;
        canvas.height = 50;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Map of colors as hex strings and their frequency
        const colorMap: Record<string, number> = {};

        // Process every pixel (r,g,b,a) values
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Quantize the colors a bit to reduce the number of unique colors
          const quantizedR = Math.round(r / 8) * 8;
          const quantizedG = Math.round(g / 8) * 8;
          const quantizedB = Math.round(b / 8) * 8;

          const hex = rgbToHex(quantizedR, quantizedG, quantizedB);

          // Count color occurrences
          colorMap[hex] = (colorMap[hex] || 0) + 1;
        }

        // Convert to array and sort by frequency
        const sortedColors = Object.entries(colorMap)
          .sort((a, b) => b[1] - a[1])
          .map((entry) => entry[0])
          .slice(0, colorCount);

        // Sort by luminance for better gradient appearance
        const orderedColors = sortColorsByLuminance(sortedColors);

        setResult({
          colors: orderedColors,
          loading: false,
          error: null,
        });
      } catch (err) {
        setResult({
          colors: [],
          loading: false,
          error:
            'Error extracting colors: ' +
            (err instanceof Error ? err.message : String(err)),
        });
      }
    };

    img.onerror = () => {
      setResult({
        colors: [],
        loading: false,
        error: 'Failed to load image',
      });
    };

    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, colorCount]);

  return result;
};

// Component to display a color palette from an image
export const FastImageColorExtractor = ({
  imageUrl,
  colorCount = 5,
  onColorsExtracted,
  children,
}: {
  imageUrl: string;
  colorCount?: number;
  onColorsExtracted?: (colors: string[]) => void;
  children?: React.ReactNode;
}) => {
  const { colors, loading, error } = useFastImagePalette(imageUrl, colorCount);

  // Call the callback when colors are extracted
  useEffect(() => {
    if (colors.length > 0 && onColorsExtracted) {
      onColorsExtracted(colors);
    }
  }, [colors, onColorsExtracted]);

  return (
    <div>
      {children}

      {loading ? (
        <p className="mt-2 text-sm text-gray-500">Extracting colors...</p>
      ) : null}

      {error ? (
        <p className="mt-2 text-sm text-red-500">Error: {error}</p>
      ) : null}

      {colors.length > 0 && (
        <div className="mt-2">
          <div className="flex">
            {colors.map((color, index) => (
              <div
                key={index}
                className="h-4 flex-1"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
