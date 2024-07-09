import { withPluginApi } from 'discourse/lib/plugin-api';
import { extract, parse } from '../lib/sd-metadata-extractor';

export default {
  name: 'discourse-sd-metadata',

  initialize() {
    withPluginApi('0.8.7', api => {
      api.decorateCooked($elem => {
        $elem.find('img:not(.emoji)').each((index, img) => {
          const $img = $(img);
          if ($img.closest('.d-editor-preview').length) return;

          const $metadataButton = $('<button>', {
            class: 'btn btn-primary sd-metadata-button',
            text: 'View SD Metadata',
            css: {
              marginTop: '10px',
              display: 'block'
            },
            click: async (e) => {
              e.preventDefault();
              
              try {
                const [parameters, isParameters] = await extract(img.src);
                if (isParameters) {
                  const metadata = parse(parameters);
                  const metadataText = JSON.stringify(metadata, null, 2);
                  
                  const $modal = $('<div>', {
                    class: 'sd-metadata-modal',
                    css: {
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'white',
                      padding: '20px',
                      borderRadius: '5px',
                      boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                      zIndex: 9999,
                      maxWidth: '80%',
                      maxHeight: '80%',
                      overflow: 'auto'
                    }
                  });

                  const $closeButton = $('<button>', {
                    text: 'Close',
                    css: {
                      marginTop: '10px'
                    },
                    click: () => $modal.remove()
                  });

                  $modal.append($('<pre>').text(metadataText), $closeButton);
                  $('body').append($modal);
                } else {
                  alert('No Stable Diffusion metadata found in this image.');
                }
              } catch (error) {
                console.error('Error extracting metadata:', error);
                alert('Error extracting metadata. Please try again.');
              }
            }
          });

          $img.after($metadataButton);
        });
      }, { id: 'sd-metadata' });
    });
  }
};