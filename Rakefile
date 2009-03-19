require 'rake'
require 'rake/packagetask'
require 'rake/clean'

CRUCIBLE_PATH = File.expand_path(File.dirname(__FILE__))
CRUCIBLE_SRC = File.join(CRUCIBLE_PATH, 'src')
CRUCIBLE_PKG = File.join(CRUCIBLE_PATH, 'pkg')
CRUCIBLE_VER = '0.2a1'

task :default => [:script]

task :script => ["crucible.js"]

CLEAN.include('crucible.js')
CLOBBER.include('pkg')

file "crucible.js" => FileList.new(File.join(CRUCIBLE_SRC, '**', '*.js')) do |t|
  infile = File.join(CRUCIBLE_SRC, 'Crucible.js')
  outfile = File.join(CRUCIBLE_PATH, 'crucible.js')
  sh %Q{cpp -undef -P -DCRUCIBLE_VERSION=\\"#{CRUCIBLE_VER}\\" "#{infile}" "#{outfile}"}
end

Rake::PackageTask.new('crucible', (ENV['version'] or CRUCIBLE_VER)) do |package|
  package.need_zip = package.need_tar_bz2 = true
  package.package_dir = CRUCIBLE_PKG
  package.package_files.include(
    'assets/**',
    'crucible.js',
    'license.txt',
    'tests/**'
  )
end

Rake::PackageTask.new('crucible-src', (ENV['version'] or CRUCIBLE_VER)) do |package|
  package.need_tar_bz2 = true
  package.package_dir = CRUCIBLE_PKG
  package.package_files.include(
    'assets/**',
    'crucible.js',
    'license.txt',
    'Rakefile',
    'src',
    'tests/**'
  )
end

task :package => [:script]
