param(
  [string]$SourceDir = ".",
  [string]$OutputDir = "dist"
)

$ErrorActionPreference = "Stop"

$resolvedSourceDir = (Resolve-Path -LiteralPath $SourceDir).Path
$resolvedOutputDir = if ([System.IO.Path]::IsPathRooted($OutputDir)) {
  [System.IO.Path]::GetFullPath($OutputDir)
} else {
  [System.IO.Path]::GetFullPath((Join-Path $resolvedSourceDir $OutputDir))
}

if (-not $resolvedOutputDir.StartsWith($resolvedSourceDir, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Output directory must stay within the repository workspace."
}

if (Test-Path -LiteralPath $resolvedOutputDir) {
  Remove-Item -LiteralPath $resolvedOutputDir -Recurse -Force
}

$excludedItems = @(
  ".git",
  ".github",
  "dist",
  "gcm-diagnose.log",
  "README.md",
  "scripts"
)

if (-not (Test-Path -LiteralPath (Join-Path $resolvedSourceDir "index.html"))) {
  throw "Expected deploy file 'index.html' was not found."
}

if (-not (Test-Path -LiteralPath (Join-Path $resolvedSourceDir "styles.css"))) {
  throw "Expected deploy file 'styles.css' was not found."
}

if (-not (Test-Path -LiteralPath (Join-Path $resolvedSourceDir "script.js"))) {
  throw "Expected deploy file 'script.js' was not found."
}

$deployItems = Get-ChildItem -LiteralPath $resolvedSourceDir -Force | Where-Object {
  $excludedItems -notcontains $_.Name
}

New-Item -ItemType Directory -Path $resolvedOutputDir | Out-Null

foreach ($item in $deployItems) {
  Copy-Item -LiteralPath $item.FullName -Destination (Join-Path $resolvedOutputDir $item.Name) -Recurse -Force
}

$buildId = if ($env:GITHUB_SHA) {
  $env:GITHUB_SHA.Substring(0, 8)
} else {
  Get-Date -Format "yyyyMMddHHmmss"
}

$indexPath = Join-Path $resolvedOutputDir "index.html"
$indexContent = Get-Content -LiteralPath $indexPath -Raw
$indexContent = $indexContent.Replace('href="styles.css"', "href=`"styles.css?v=$buildId`"")
$indexContent = $indexContent.Replace('src="script.js"', "src=`"script.js?v=$buildId`"")
Set-Content -LiteralPath $indexPath -Value $indexContent -NoNewline

Write-Host "GitHub Pages artifact built at '$resolvedOutputDir' with asset version '$buildId'."
