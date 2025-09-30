import { checkGeminiOperationStatus } from '../generate-video/vertex';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const operationData: string | undefined = body?.operationData;
    const operationName: string | undefined = body?.operationName;

    if (!operationData && !operationName) {
      return Response.json(
        { error: 'operationData or operationName is required' },
        { status: 400 }
      );
    }

    // Use operationName if provided, otherwise use operationData
    return checkGeminiOperationStatus(operationName || operationData!);
  } catch (error) {
    console.error('Error checking video status:', error);
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
