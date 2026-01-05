# Packages/app/server/src/clients

## Purpose
This module provides functions to create and send image editing requests to the OpenAI API, supporting both single and multiple image inputs, and manages the construction of form data for these requests.

## Boundaries
- **Belongs here:** 
  - Construction of multipart/form-data payloads for image editing requests.
  - Handling of image file inputs and conversion to suitable formats.
  - Interaction with OpenAI's image editing endpoints.
- **Does NOT belong here:** 
  - Core image processing or manipulation logic (handled elsewhere).
  - API key management or authentication (should be configured externally).
  - Business logic related to user workflows or UI interactions.
  - Storage or retrieval of images outside the request payload.

## Invariants
- The `makeImageEditRequest` and `makeImageEditRequestWithMultipleImages` functions must always produce a valid form data payload compatible with OpenAI's API.
- Image files passed to these functions must be valid, readable, and correctly formatted; invalid files should trigger errors.
- When multiple images are provided, their order must be preserved in the form data.
- Null or undefined image inputs are not permitted; all image parameters must be validated before request construction.
- The functions should handle errors gracefully, ensuring form data is not sent if invalid.
- The module must not depend on any stateful or mutable external variables; all data should be passed explicitly.
- Resource management: Files should be properly handled, ensuring no leaks or dangling file handles.

## Patterns
- Use explicit, descriptive naming for form data fields consistent with OpenAI API expectations.
- Validate all image inputs before constructing form data; reject invalid or missing images.
- For multiple images, iterate over the array, appending each with a unique key (e.g., `images[0]`, `images[1]`) if required.
- Handle errors with clear exceptions; do not swallow API or file errors silently.
- Maintain consistent async/await patterns; ensure all file operations are awaited.
- Use `toFile()` for image file conversion, ensuring the output is compatible with form data.
- Follow the existing code style for function signatures, including parameter naming and return types.

## Pitfalls
- Forgetting to validate image files can lead to API errors or malformed requests.
- Not preserving image order in multiple-image requests may cause unexpected edits.
- Churning on the request functions (noted as frequently modified) risks introducing bugs; ensure thorough validation.
- Mismanaging file handles—failing to close or properly handle files—can cause resource leaks.
- Assuming all images are in the same format; conversion issues may arise if images are incompatible.
- Not updating form data keys to match API expectations when API evolves.
- Overlooking error handling in async functions can cause unhandled promise rejections.
- Ignoring the need for consistent naming conventions for form data fields may cause API rejection.

## Dependencies
- **OpenAI:** Use the official OpenAI SDK or API client to send requests; ensure API keys and configurations are correctly set.
- **file:** Handle file input/output operations; validate and process image files reliably.
- **images:** For image manipulation or validation if needed; ensure compatibility with form data.
- **toFile:** Convert image objects or buffers into file streams suitable for form data payloads; handle conversion errors explicitly.

---

**Note:** When modifying this module, ensure compliance with OpenAI API specifications, validate all inputs rigorously, and maintain the integrity of form data construction to prevent request failures.