# Run after: JEKYLL_ENV=production bundle exec jekyll build
require "nokogiri"
require "yaml"
require "uri"

root = File.expand_path("..", __dir__)
site = File.join(root, "_site")
data = YAML.load_file(File.join(root, "_data/data.yml"))
config = YAML.load_file(File.join(root, "_config.yml"))
baseurl = config.fetch("baseurl", "")
expected_projects = data.fetch("projects").fetch("groups").sum { |g| g.fetch("assignments").size }
def check(condition, message)
  abort "FAIL: #{message}" unless condition
end

templates = Dir.glob(File.join(root, "{_includes,_layouts}", "*.html")) +
  %w[index.html print.html].map { |name| File.join(root, name) }
source_text = templates.map { |path| File.read(path) }.join("\n")
includes = source_text.scan(/\{%\s*include\s+([\w.-]+)\s*%\}/).flatten.uniq
actual_includes = Dir.glob(File.join(root, "_includes", "*.html")).map { |p| File.basename(p) }
check((includes - actual_includes).empty?, "Missing includes: #{includes - actual_includes}")
check((actual_includes - includes).empty?, "Unused includes: #{actual_includes - includes}")
used_data = source_text.scan(/site\.data\.data\.([\w-]+)/).flatten.uniq
check((data.keys - used_data).empty?, "Unused data sections: #{data.keys - used_data}")
check((used_data - data.keys).empty?, "Missing data sections: #{used_data - data.keys}")
style_entry = File.read(File.join(root, "assets/css/main.scss"))
imports = style_entry.scan(/@import\s+"([\w-]+)"/).flatten
styles = Dir.glob(File.join(root, "_sass", "**", "*.scss")).map { |p| File.basename(p, ".scss").delete_prefix("_") }
check(imports.sort == styles.sort, "SCSS files and imports differ")
referenced_assets = []
%w[index.html print.html].each do |page|
  path = File.join(site, page)
  check(File.file?(path), "Build first: missing #{page}")
  doc = Nokogiri::HTML(File.read(path))
  ids = doc.css("[id]").map { |el| el["id"] }
  check(ids.uniq.size == ids.size, "#{page}: duplicate IDs")
  check(doc.css(".project-title").size == expected_projects, "#{page}: project count")
  check(doc.css("#experience").size == 1, "#{page}: experience")
  check(doc.css("#projects").size == 1, "#{page}: projects")
  if page == "print.html"
    check(doc.css("section.section").map { |s| s["id"] } == %w[experience projects], "print section scope")
    check(doc.at_css("#print-pages") && doc.at_css("script[src*='print.js']"), "pagination entry point")
  else
    check(doc.css("h1").size == 1, "profile title")
    check(doc.at_css(".resume-photo"), "profile photo") if data.fetch("profile")["avatar"]
    check(doc.css(".action-button").size == 2, "print/PDF links")
  end
  doc.css("[src], link[href], a[href]").each do |el|
    url = el["src"] || el["href"]
    next unless url.start_with?("/") && !url.start_with?("//")
    pathname = URI.parse(url).path.delete_prefix(baseurl).delete_prefix("/")
    referenced_assets << pathname if pathname.start_with?("assets/")
    file = File.join(site, pathname)
    check([file, file + ".html", File.join(file, "index.html")].any? { |f| File.file?(f) }, "#{page}: missing #{url}")
  end
end
assets = Dir.glob(File.join(root, "assets", "**", "*")).select { |p| File.file?(p) }
assets = assets.map { |p| p.delete_prefix(root + "/").sub(/\.scss$/, ".css") }
check((assets - referenced_assets).empty?, "Unused assets: #{assets - referenced_assets}")
%w[docs README.md scripts vendor assets/plugins].each do |path|
  check(!File.exist?(File.join(site, path)), "Unexpected published path: #{path}")
end
puts "PASS: templates, data sections, SCSS imports, assets, #{expected_projects} projects, print scope and build exclusions"
