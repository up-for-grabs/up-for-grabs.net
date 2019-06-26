workflow "Daily Work" {
  on = "schedule(0 18 * * *)"
  resolves = ["Cleanup archived projects"]
}

action "Cleanup archived projects" {
  uses = "./.github/actions/cleanup-archived-projects"
  secrets = ["GITHUB_TOKEN"]
}
