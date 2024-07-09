async function extract(file) {
    const response = await fetch(file);
    const arrayBuffer = await response.arrayBuffer();
    const view = new DataView(arrayBuffer);
  
    let parameters = '';
    const app1Marker = 0xFFE1;
    const exifHeader = 0x45786966; // "Exif" in ASCII
  
    for (let offset = 0; offset < view.byteLength - 1; offset++) {
      if (view.getUint16(offset) === app1Marker) {
        const exifHeaderValue = view.getUint32(offset + 4);
        if (exifHeaderValue === exifHeader) {
          const userCommentOffset = offset + 10; // Approximate offset, may need adjustment
          const userCommentLength = view.getUint16(userCommentOffset);
          const userCommentData = new Uint8Array(arrayBuffer, userCommentOffset + 2, userCommentLength);
          
          const encoding = getStringWithUTF8(userCommentData.slice(0, 8));
          if (encoding === 'UNICODE\x00') {
            parameters = getStringWithUTF16(userCommentData.slice(8));
            break;
          }
        }
      }
    }
  
    if (!parameters) {
      // If no UserComment found, look for 'parameters' in metadata
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(arrayBuffer);
      const match = text.match(/parameters\x00([^\x00]+)/);
      if (match) {
        parameters = match[1];
      }
    }
  
    return [parameters, parameters.includes('Steps: ')];
  }
  
  function parse(parameters) {
    const metadata = {};
    if (!parameters) return metadata;
  
    const metaLines = parameters.split('\n').filter(line => line.trim() !== '');
  
    let detailsLineIndex = metaLines.findIndex(line => line.startsWith('Steps: '));
    let detailsLine = metaLines[detailsLineIndex] || '';
    if (detailsLineIndex > -1) metaLines.splice(detailsLineIndex, 1);
  
    detailsLine.split(', ').forEach(str => {
      const [_k, _v] = str.split(': ');
      if (!_k) return;
      metadata[_k.trim()] = _v;
    });
  
    const [prompt, ...negativePrompt] = metaLines.join('\n').split('Negative prompt:').map(x => x.trim());
    metadata.prompt = prompt;
    metadata.negativePrompt = negativePrompt.join(' ').trim();
  
    if (metadata.Size) {
      const [width, height] = metadata.Size.split('x');
      metadata.width = parseInt(width, 10);
      metadata.height = parseInt(height, 10);
    }
  
    return metadata;
  }
  
  function getStringWithUTF8(numbers) {
    return String.fromCharCode.apply(null, numbers);
  }
  
  function getStringWithUTF16(numbers) {
    let str = '';
    for (let i = 0; i < numbers.length; i += 2) {
      const unicode = (numbers[i] << 8) | numbers[i + 1];
      str += String.fromCharCode(unicode);
    }
    return str;
  }
  
  export { extract, parse };