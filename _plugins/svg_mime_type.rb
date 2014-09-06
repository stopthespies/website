#
# SVG mimetype polyfill for Jekyll.
#
# From http://stackoverflow.com/a/13687032/821334
#

require 'webrick'

include WEBrick
WEBrick::HTTPUtils::DefaultMimeTypes.store 'svg', 'image/svg+xml'
