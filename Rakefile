require "rubygems"
require "fileutils"

require "bundler/setup"
require "jekyll"


# Change your GitHub reponame
GITHUB_REPONAME = "stopthespies/website"


namespace :site do

  desc "Check build directory..."
  task :init_compile do
    pwd = Dir.pwd

    unless File.exist?("./_site/.git")
      puts "Build directory not configured, initing..."

      FileUtils.rm_rf("./_site");
      system "git clone git@github.com:#{GITHUB_REPONAME}.git _site"
      Dir.chdir("_site/") do
        system "git checkout gh-pages"
      end

      Dir.chdir pwd
    end
  end

  desc "Compile site..."
  task :generate => [:init_compile] do
    Jekyll::Site.new(Jekyll.configuration({
      "source"      => ".",
      "destination" => "_site"
    })).process
  end


  desc "Publish to gh-pages..."
  task :publish => [:generate] do

    Dir.chdir('_site') do
      # pull latest version before committing
      system "git pull origin gh-pages"

      # add all changes and push
      system "git add ."
      message = "Site updated at #{Time.now.utc}"
      system "git commit -m #{message.inspect}"
      # system "git push origin master:refs/heads/gh-pages"
    end
  end

end
