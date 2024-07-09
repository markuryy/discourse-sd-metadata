import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: 'discourse-sd-metadata',

  initialize(container) {
    withPluginApi('0.8.7', api => {
      api.addPostTransformCallback((attrs, post) => {
        if (attrs.image_metadata && attrs.image_metadata.length > 0) {
          const metadataDiv = document.createElement('div');
          metadataDiv.className = 'image-metadata';
          
          const metadataContent = attrs.image_metadata.map(meta => {
            return Object.keys(meta).map(key => {
              return `<p><strong>${key}:</strong> ${meta[key]}</p>`;
            }).join('');
          }).join('');
          
          metadataDiv.innerHTML = `<h4>Image Metadata:</h4>${metadataContent}`;
          post.element.appendChild(metadataDiv);
        }
      });
    });
  }
};
