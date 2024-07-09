# frozen_string_literal: true

module MyPluginModule
    module MetadataParser
      require 'mini_magick'
      require 'json'
      require 'nokogiri'
  
      def self.extract_metadata(upload)
        metadata = {}
        image_path = upload.url
  
        begin
          image = MiniMagick::Image.open(image_path)
  
          if image.type == 'PNG'
            metadata = extract_png_metadata(image)
          elsif image.type == 'JPEG'
            metadata = extract_jpeg_metadata(image)
          end
        rescue => e
          Rails.logger.error("Failed to extract metadata: #{e.message}")
        end
  
        metadata
      end
  
      def self.extract_png_metadata(image)
        metadata = {}
        image.data.each do |key, value|
          metadata[key] = value.is_a?(String) ? value : value.to_s
        end
  
        if metadata['parameters']
          metadata['tool'] = 'Stable Diffusion'
          metadata['params'] = parse_parameters(metadata['parameters'])
        end
  
        metadata
      end
  
      def self.extract_jpeg_metadata(image)
        metadata = {}
        exif = image.exif
        comment = exif['Exif']['UserComment']
  
        if comment
          raw_data = comment.is_a?(String) ? comment : comment.pack('C*')
          begin
            data_json = JSON.parse(raw_data)
            metadata.merge!(data_json)
            metadata['tool'] = 'Stable Diffusion'
          rescue JSON::ParserError
            Rails.logger.warn("Failed to parse JSON metadata from JPEG comment")
          end
        end
  
        metadata
      end
  
      def self.parse_parameters(parameters)
        begin
          params = JSON.parse(parameters)
          return params
        rescue JSON::ParserError
          return parameters
        end
      end
    end
  end
  