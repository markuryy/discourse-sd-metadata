import { withPluginApi } from 'discourse/lib/plugin-api';
import { extract, parse } from '../lib/sd-metadata-extractor';

function getOriginalUrl(optimizedUrl) {
  // Remove the _2_[dimensions] part and change 'optimized' to 'original'
  return optimizedUrl.replace(/\/optimized\//, '/original/')
                     .replace(/_\d+x\d+(\.\w+)$/, '$1');
}

export default {
  name: 'discourse-sd-metadata',

  initialize() {
    withPluginApi('0.8.7', api => {
      api.decorateCooked($elem => {
        console.log('SD Metadata: decorateCooked called');
        $elem.find('img:not(.emoji)').each((index, img) => {
          console.log('SD Metadata: Processing image:', img.src);
          const $img = $(img);
          if ($img.closest('.d-editor-preview').length) {
            console.log('SD Metadata: Skipping preview image');
            return;
          }

          const $metadataButton = $('<button>', {
            class: 'btn btn-primary sd-metadata-button',
            text: 'View SD Metadata',
            css: {
              marginTop: '10px',
              display: 'block'
            },
            click: async (e) => {
              e.preventDefault();
              
              console.log('SD Metadata: Button clicked for image:', img.src);
              
              const originalUrl = getOriginalUrl(img.src);
              console.log('SD Metadata: Attempting to use original URL:', originalUrl);

              try {
                let parameters, isParameters;

                // Try with original URL first
                try {
                  [parameters, isParameters] = await extract(originalUrl);
                  console.log('SD Metadata: Extraction result from original URL:', { parameters, isParameters });
                } catch (error) {
                  console.log('SD Metadata: Failed to extract from original URL, falling back to optimized URL');
                  [parameters, isParameters] = await extract(img.src);
                  console.log('SD Metadata: Extraction result from optimized URL:', { parameters, isParameters });
                }

                if (isParameters && parameters) {
                  console.log('SD Metadata: Parsing parameters');
                  const metadata = parse(parameters);
                  console.log('SD Metadata: Parsed metadata:', metadata);
                  
                  const metadataText = JSON.stringify(metadata, null, 2);
                  
                  // ... (rest of the modal creation code remains the same)
                  
                } else {
                  console.log('SD Metadata: No valid parameters found');
                  alert('No Stable Diffusion metadata found in this image.');
                }
              } catch (error) {
                console.error('SD Metadata: Error extracting metadata:', error);
                alert('Error extracting metadata. Please try again.');
              }
            }
          });

          console.log('SD Metadata: Adding button after image');
          $img.after($metadataButton);
        });
      }, { id: 'sd-metadata' });
    });
  }
};