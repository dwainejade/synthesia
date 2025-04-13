# Album Cover Color Extractor

This project is a tool to extract dominant colors from album cover images, similar to the color extraction feature in iOS Music.

## Features
- Extract dominant colors from album cover images.
- Generate a color palette for use in UI designs.
- Support for multiple image formats (JPEG, PNG, etc.).

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/album-art-color-extractor.git
    cd album-art-color-extractor
    ```
2. Install dependencies:
    ```bash
    npm install
    ```

## Usage
1. Place your album cover images in the `images/` directory.
2. Run the extractor:
    ```bash
    npm start
    ```
3. View the extracted color palette in the output.

## Technologies
- **Node.js**: Backend processing.
- **Sharp**: Image processing library.
- **Color Thief**: Dominant color extraction.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the [MIT License](LICENSE).