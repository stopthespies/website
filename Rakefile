require "rubygems"
require "fileutils"

require "bundler/setup"
require "jekyll"


# Change your GitHub reponame
GITHUB_REPONAME = "stopthespies/website"

DEVELOP_BRANCH_NAME = "master"
BUILD_DIR = '_build'    # clean branch for compiling against
DEPLOY_DIR = '_deploy'  # folder to generate & commit into


namespace :site do

  desc "Check build directory...\n"
  task :init_compile do
    pwd = Dir.pwd

    unless File.exist?("./#{BUILD_DIR}/.git")
      puts "\nBuild directory not configured, initing...\n"

      FileUtils.rm_rf("./#{BUILD_DIR}");
      FileUtils.rm_rf("./#{DEPLOY_DIR}");

      puts "\n...build repo...\n"

      # clean building instance (dev branch)
      FileUtils.mkdir_p("./#{BUILD_DIR}");
      system "git clone git@github.com:#{GITHUB_REPONAME}.git ./#{BUILD_DIR}"

      Dir.chdir("./#{BUILD_DIR}") do
        system "git checkout #{DEVELOP_BRANCH_NAME}"
      end

      Dir.chdir pwd

      puts "\n...deploy repo...\n"

      # deploying instance (gh-pages branch)
      FileUtils.cp_r("./#{BUILD_DIR}", "./#{DEPLOY_DIR}");

      Dir.chdir("./#{DEPLOY_DIR}") do
        system "git checkout gh-pages"
      end

      Dir.chdir pwd
    end

    puts "\nEnsure build environment state...\n"

    Dir.chdir("./#{BUILD_DIR}") do
      # set to latest version before generating
      system "git pull origin #{DEVELOP_BRANCH_NAME}"
      system "git checkout -f #{DEVELOP_BRANCH_NAME}"
      system "bower install"
    end

    Dir.chdir pwd

    puts "\nClean deploy environment...\n"

    Dir.chdir("./#{DEPLOY_DIR}") do
      # pull latest deployed version
      system "git pull origin gh-pages"

      # delete entire working copy so that we can detect deletions
      system "find . -type f -not -path './.git*' | xargs rm"
      system "find . -type d -not -path './.git/*' -not -name '.git' -not -name '.' | xargs rm -Rf"
    end

    Dir.chdir pwd
  end

  desc "\nCompile site...\n"
  task :generate => [:init_compile] do
    pwd = Dir.pwd

    Jekyll::Site.new(Jekyll.configuration({
      "source"      => "./#{BUILD_DIR}",
      "destination" => "./#{DEPLOY_DIR}"
    })).process

    Dir.chdir pwd
  end


  desc "\nPublish to gh-pages...\n"
  task :publish => [:generate] do
    pwd = Dir.pwd

    Dir.chdir("./#{DEPLOY_DIR}") do
      # add all changes and push
      system "git add ."
      system "git ls-files --deleted -z | xargs -0 git rm -f"
      message = "Site updated at #{Time.now.utc}"
      system "git commit -m #{message.inspect}"

      system "git push origin gh-pages"
      # puts "\nBuild completed. Please check the latest commit in _site directory and then push to github."
    end

    Dir.chdir pwd
  end

end
