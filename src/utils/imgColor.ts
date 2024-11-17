

export function getDominantColor(imageSrc: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Allow cross-origin image processing if the image is from another domain
        img.src = imageSrc;

        img.onload = function () {
            // Create a canvas
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Unable to get canvas context."));
                return;
            }

            // Set canvas size to the image size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image onto the canvas
            ctx.drawImage(img, 0, 0);

            // Get the pixel data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            // Calculate the dominant color
            const color = calculateDominantColor(imageData);
            resolve(color);
        };

        img.onerror = function () {
            reject(new Error("Error loading image."));
        };
    });
}


function calculateDominantColor(data: Uint8ClampedArray): string {
    const colorCounts: { [key: string]: number } = {};
    let maxCount = 0;
    let dominantColor: string | null = null;

    // Loop through pixel data (RGBA format)
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const color = `${r},${g},${b}`; // Combine RGB values as a string

        // Count occurrences of each color
        colorCounts[color] = (colorCounts[color] || 0) + 1;

        // Update the dominant color
        if (colorCounts[color] > maxCount) {
            maxCount = colorCounts[color];
            dominantColor = color;
        }
    }

    // Return the dominant color in rgb() format
    return dominantColor ? `rgb(${dominantColor})` : "rgb(0,0,0)";
}

