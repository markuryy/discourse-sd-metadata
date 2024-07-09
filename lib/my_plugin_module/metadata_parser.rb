require 'json'
require 'mini_magick'
require 'exifr/jpeg'

module MyPluginModule
  class MetadataParser
    def self.extract_metadata(upload)
      file_path = Rails.root.join("public", upload.url[1..-1])

      unless File.exist?(file_path)
        return { error: "File not found: #{file_path}" }
      end

      extension = File.extname(file_path).downcase
      metadata = {}

      case extension
      when ".png"
        metadata = extract_png_metadata(file_path)
      when ".jpg", ".jpeg", ".webp"
        metadata = extract_jpeg_metadata(file_path)
      else
        metadata = { error: "Unsupported image format: #{extension}" }
      end

      metadata
    end

    def self.extract_png_metadata(file_path)
      image = MiniMagick::Image.open(file_path)
      if image["parameters"]
        parse_json(image["parameters"])
      elsif image["Software"]&.include?("A1111")
        { tool: "A1111", data: image["Software"] }
      elsif image["Comment"]
        parse_comfyui_metadata(image["Comment"])
      else
        {}
      end
    end

    def self.extract_jpeg_metadata(file_path)
      exif_data = EXIFR::JPEG.new(file_path)
      user_comment = exif_data&.user_comment

      if user_comment
        comment = user_comment[8..-1].force_encoding('UTF-16').encode('UTF-8')
        parse_json(comment)
      elsif exif_data&.software&.include?("A1111")
        { tool: "A1111", data: exif_data.software }
      else
        {}
      end
    end

    def self.parse_comfyui_metadata(comment)
      parse_json(comment)
    end

    def self.parse_json(data)
      JSON.parse(data)
    rescue JSON::ParserError
      { error: "Failed to parse JSON" }
    end
  end
end
