# Get the directory that this configuration file exists in
dir = File.dirname(__FILE__)

# Load the sencha-touch framework automatically.
load File.join(dir, '..', '..', '..', '..', 'common', 'js', 'touch-2.2.1', 'resources', 'themes')

# Compass configurations
sass_path    = dir
css_path     = File.join(dir, "..", "css")
environment  = :production
output_style = :compressed
sass_options = {:cache => false}
