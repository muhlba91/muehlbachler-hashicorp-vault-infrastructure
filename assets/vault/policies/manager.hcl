path "secret/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
path "github-*/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
path "kubernetes-*/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
