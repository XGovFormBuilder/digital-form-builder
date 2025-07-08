group "default" {
  targets = ["designer", "runner"]
}

target "designer" {
  context = "."
  dockerfile = "./designer/Dockerfile"
  tags = ["digital-form-builder-designer:latest"]
}

target "runner" {
  context = "."
  dockerfile = "./runner/Dockerfile"
  tags = ["digital-form-builder-runner:latest"]
}

