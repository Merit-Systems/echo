import { checkGeminiOperationStatus, checkGeminiOperationStatusByName } from '../generate-video/gemini';

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

    if (operationName) {
      return checkGeminiOperationStatusByName(operationName);
    }

    return checkGeminiOperationStatus(operationData as string);
  } catch (error) {
    return Response.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}