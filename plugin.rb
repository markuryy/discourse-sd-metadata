# frozen_string_literal: true

# name: discourse-sd-metadata
# about: A plugin to read and display Stable Diffusion metadata from image files
# version: 0.0.1
# authors: markury
# url: TODO
# required_version: 2.7.0

enabled_site_setting :sd_metadata_plugin_enabled

module ::MyPluginModule
  PLUGIN_NAME = "discourse-sd-metadata"
end

require_relative "lib/my_plugin_module/engine"
require 'mini_magick'
require_relative "lib/my_plugin_module/metadata_parser"

after_initialize do
  add_to_serializer(:post, :image_metadata, false) do
    object.uploads.map { |upload| MyPluginModule::MetadataParser.extract_metadata(upload) }
  end
end
