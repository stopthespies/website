require "rubygems"
require "fileutils"

require "bundler/setup"
require "jekyll"


# Change your GitHub reponame
GITHUB_REPONAME = "stopthespies/website"
DEVELOP_BRANCH_NAME = "master"


namespace :site do

  desc "Check build directory...\n"
  task :init_compile do
    pwd = Dir.pwd

    unless File.exist?("./_site/_build/.git")
      puts "\nBuild directory not configured, initing...\n"

      FileUtils.rm_rf("./_site");

      puts "\n...build repo...\n"

      # clean building instance (dev branch)
      FileUtils.mkdir_p("./_site/_build");
      system "git clone git@github.com:#{GITHUB_REPONAME}.git _site/_build"

      Dir.chdir("./_site/_build/") do
        system "git checkout #{DEVELOP_BRANCH_NAME}"
      end

      Dir.chdir pwd

      puts "\n...deploy repo...\n"

      # deploying instance (gh-pages branch)
      FileUtils.cp_r("./_site/_build", "./_site/_deploy");

      Dir.chdir("./_site/_deploy/") do
        system "git checkout gh-pages"
      end

      Dir.chdir pwd
    end

    puts "\nEnsure build environment state...\n"

    Dir.chdir('./_site/_build') do
      # set to latest version before generating
      system "git pull origin #{DEVELOP_BRANCH_NAME}"
      system "git checkout -f #{DEVELOP_BRANCH_NAME}"
      system "bower install"
    end

    Dir.chdir pwd

    puts "\nClean deploy environment...\n"

    Dir.chdir("./_site/_deploy") do
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
    Dir.chdir("./_site/_build") do
      Jekyll::Site.new(Jekyll.configuration({
        "source"      => ".",
        "destination" => "../_deploy"
      })).process
    end

    Dir.chdir pwd
  end


  desc "\nPublish to gh-pages...\n"
  task :publish => [:generate] do

    Dir.chdir('./_site/_deploy') do
      # add all changes and push
      system "git add ."
      system "git ls-files --deleted -z | xargs -0 git rm -f"
      message = "Site updated at #{Time.now.utc}"
      system "git commit -m #{message.inspect}"

      system "git push origin gh-pages"
      # puts "\nBuild completed. Please check the latest commit in _site directory and then push to github."
    end
  end

end
