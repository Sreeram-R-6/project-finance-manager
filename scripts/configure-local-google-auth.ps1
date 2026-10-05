param(
  [Parameter(Mandatory = $true)]
  [string] $ClientJsonPath
)

$ErrorActionPreference = 'Stop'
$workspace = Split-Path $PSScriptRoot -Parent
$runtimeConfig = Join-Path $workspace '.local-runtime/supabase/config.toml'

if (-not (Test-Path -LiteralPath $runtimeConfig)) {
  throw 'Start the local Supabase runtime first so its ignored configuration exists.'
}

$client = (Get-Content -LiteralPath $ClientJsonPath -Raw | ConvertFrom-Json).web
if (-not $client -or -not $client.client_id -or -not $client.client_secret) {
  throw 'The Google download must contain a Web OAuth client ID and secret.'
}

$config = Get-Content -LiteralPath $runtimeConfig -Raw
$provider = "[auth.external.google]`nenabled = true`nclient_id = `"$($client.client_id)`"`nsecret = `"$($client.client_secret)`""
$pattern = '(?ms)^\[auth\.external\.google\]\r?\n.*?(?=^\[|\z)'
if (-not [regex]::IsMatch($config, $pattern)) {
  throw 'Google provider section was not found in the local Supabase configuration.'
}
$updated = [regex]::Replace($config, $pattern, $provider + "`n")
[System.IO.File]::WriteAllText($runtimeConfig, $updated)
Write-Output 'Local Google provider configured in ignored runtime settings. Restart Supabase to apply it.'
