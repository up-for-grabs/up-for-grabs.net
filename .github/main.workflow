workflow "Every Day" {
  on = "schedule(0 18 * * *)"
  resolves = ["Sweep Projects"]
}

action "Sweep Projects" {
  uses = "./.github/actions/cleanup-archived-projects"
  secrets = ["GITHUB_TOKEN"]
}
