export const streamToBase64 = (stream: NodeJS.ReadableStream): Promise<string> => {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));

    stream.on('error', err => reject(err));

    stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
  });
};
