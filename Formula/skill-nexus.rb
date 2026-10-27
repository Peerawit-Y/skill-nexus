class SkillNexus < Formula
  desc "Centralized skill management and auto-discovery for AI agents"
  homepage "https://github.com/Peerawit-Y/skill-nexus"
  url "https://github.com/Peerawit-Y/skill-nexus/archive/refs/tags/v1.1.0.tar.gz"
  version "1.1.0"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install"
    system "npm", "run", "build"
    
    libexec.install Dir["*"]
    (bin/"skill-nexus").write <<~EOS
      #!/usr/bin/env bash
      exec "#{Formula["node"].opt_bin}/node" "#{libexec}/dist/cli.js" "$@"
    EOS

    bin.install_symlink bin/"skill-nexus" => "sn"
  end

  test do
    assert_match "skill-nexus", shell_output("#{bin}/skill-nexus --version")
  end
end
