export async function consumeStream(
  stream: AsyncIterable<string>,
  onChunk: (chunk: string, isFirst: boolean) => void
): Promise<string> {
  let result = ''
  let isFirst = true
  
  for await (const chunk of stream) {
    onChunk(chunk, isFirst)
    result += chunk
    isFirst = false
  }
  
  return result
}

