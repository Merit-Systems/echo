import OpenAI, { toFile } from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function makeImageEditRequest() {
  try {
    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: process.env.ECHO_API_KEY || '',
      baseURL: 'http://localhost:3070',
    });

    // Create a test image file (you can replace this with an actual image path)
    const testImagePath = path.join(
      process.cwd(),
      'src/clients/images-for-client/test-image.png'
    );

    // Check if test image exists, if not create a simple test file
    if (!fs.existsSync(testImagePath)) {
      console.log(
        'Test image not found. Please place a PNG image at:',
        testImagePath
      );
      console.log('For testing purposes, you can use any PNG image file.');
      return;
    }

    // Create file object for OpenAI
    const imageFile = await toFile(
      fs.createReadStream(testImagePath),
      'test-image.png',
      {
        type: 'image/png',
      }
    );

    console.log('Making image edit request...');

    // Make image edit request
    const response = await client.images.edit({
      model: 'gpt-image-1',
      image: imageFile,
      prompt: 'Add a red circle to the center of the image',
    });

    if (response.data?.[0]?.b64_json) {
      console.log('Image edit successful!');
      console.log('Base64 image length:', response.data[0].b64_json.length);

      // Optionally save the result
      const outputPath = path.join(process.cwd(), 'edited-image.png');
      fs.writeFileSync(
        outputPath,
        Buffer.from(response.data[0].b64_json, 'base64')
      );
      console.log('Edited image saved to:', outputPath);
    } else if (response.data?.[0]?.url) {
      console.log('Image edit successful!');
      console.log('Image URL:', response.data[0].url);
    } else {
      console.log('No image data received');
    }
  } catch (error) {
    console.error('Error making image edit request:', error);
  }
}

// Test single image edit
makeImageEditRequest().then(() => {
  console.log('\n');
  console.log('Done with single image edit');
});

// async function makeImageEditRequestWithMultipleImages() {
//   try {
//     // Initialize OpenAI client
//     const client = new OpenAI({
//       apiKey: process.env.ECHO_API_KEY || '',
//       baseURL: 'http://localhost:3070/v1',
//     });

//     // Test with multiple images (adjust paths as needed)
//     const testImagePaths = [
//       path.join(process.cwd(), 'test-image-1.png'),
//       path.join(process.cwd(), 'test-image-2.png'),
//     ];

//     // Check if test images exist
//     const existingPaths = testImagePaths.filter(imagePath =>
//       fs.existsSync(imagePath)
//     );

//     if (existingPaths.length === 0) {
//       console.log('No test images found. Please place PNG images at:');
//       testImagePaths.forEach(p => console.log(' -', p));
//       return;
//     }

//     console.log(
//       `Making image edit request with ${existingPaths.length} images...`
//     );

//     // Create file objects for OpenAI
//     const imageFiles = await Promise.all(
//       existingPaths.map(
//         async (imagePath, index) =>
//           await toFile(
//             fs.createReadStream(imagePath),
//             `test-image-${index}.png`,
//             {
//               type: 'image/png',
//             }
//           )
//       )
//     );

//     // Make image edit request with multiple images
//     const response = await client.images.edit({
//       model: 'gpt-image-1',
//       image: imageFiles,
//       prompt: 'Combine these images and add a blue border',
//     });

//     if (response.data?.[0]?.b64_json) {
//       console.log('Multi-image edit successful!');
//       console.log('Base64 image length:', response.data[0].b64_json.length);

//       // Save the result
//       const outputPath = path.join(process.cwd(), 'multi-edited-image.png');
//       fs.writeFileSync(
//         outputPath,
//         Buffer.from(response.data[0].b64_json, 'base64')
//       );
//       console.log('Multi-edited image saved to:', outputPath);
//     } else if (response.data?.[0]?.url) {
//       console.log('Multi-image edit successful!');
//       console.log('Image URL:', response.data[0].url);
//     } else {
//       console.log('No image data received');
//     }
//   } catch (error) {
//     console.error('Error making multi-image edit request:', error);
//   }
// }

// // Test multiple image edit
// makeImageEditRequestWithMultipleImages().then(() => {
//   console.log('\n');
//   console.log('Done with multiple image edit');
// });
