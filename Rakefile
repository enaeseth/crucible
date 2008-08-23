require 'rake'
require 'rake/packagetask'
require 'rake/clean'

CRUCIBLE_PATH = File.expand_path(File.dirname(__FILE__))
CRUCIBLE_SRC = File.join(CRUCIBLE_PATH, 'src')
CRUCIBLE_BUILD = File.join(CRUCIBLE_PATH, 'build')
CRUCIBLE_PKG = File.join(CRUCIBLE_PATH, 'pkg')
CRUCIBLE_VER = '0.1.1'

task :default => [:script]

task :script => ["build/crucible.js"]

CLEAN.include('build/crucible.js')
CLOBBER.include('build')

file "build/crucible.js" => FileList.new(File.join(CRUCIBLE_SRC, '**', '*.js')) do |t|
  FileUtils::mkdir CRUCIBLE_BUILD if !File.directory?(CRUCIBLE_BUILD)
  infile = File.join(CRUCIBLE_SRC, 'Crucible.js')
  outfile = File.join(CRUCIBLE_BUILD, 'crucible.js')
  sh %Q{cpp -undef -P -DCRUCIBLE_VERSION=\\"#{CRUCIBLE_VER}\\" "#{infile}" "#{outfile}"}
end

Rake::PackageTask.new('crucible', (ENV['version'] or CRUCIBLE_VER)) do |package|
  package.need_zip = package.need_tar_bz2 = true
  package.package_dir = CRUCIBLE_PKG
  package.package_files.include(
    'assets/**',
    'build/crucible.js',
    'license.txt',
    'tests/**'
  )
end

Rake::PackageTask.new('crucible-src', (ENV['version'] or CRUCIBLE_VER)) do |package|
  package.need_tar_bz2 = true
  package.package_dir = CRUCIBLE_PKG
  package.package_files.include(
    'assets/**',
    'build/crucible.js',
    'license.txt',
    'Rakefile',
    'src',
    'tests/**'
    #'tools/**'
  )
end

task :package => [:script]
