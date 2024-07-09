import { extract, parse } from 'stable-diffusion-image-metadata';

export default {
  setupComponent(attrs, component) {
    component.set('post', attrs.model);
  },

  actions: {
    async showMetadata() {
      const post = this.get('post');
      const $images = $(`article#post_${post.id} img:not(.emoji)`);
      
      if ($images.length === 0) {
        alert('No images found in this post.');
        return;
      }

      const imageUrl = $images.first().attr('src');

      try {
        const [parameters, isParameters] = await extract(imageUrl);
        if (isParameters) {
          const metadata = parse(parameters);
          const metadataText = JSON.stringify(metadata, null, 2);
          alert(`Metadata: \n${metadataText}`);
        } else {
          alert('No Stable Diffusion metadata found in this image.');
        }
      } catch (error) {
        console.error('Error extracting metadata:', error);
        alert('Error extracting metadata. Please try again.');
      }
    }
  }
};