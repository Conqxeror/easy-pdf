param(
  [string]$profileUrl = 'https://www.instagram.com/adnann_.42/',
  [string]$outDir = 'public/images/sponsors'
)

if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

# Get username to save as file
$username = ($profileUrl.TrimEnd('/') -split '/')[-1]
$outFile = Join-Path $outDir ($username + '.jpg')

# Try to fetch the page and extract the og:image meta tag
try {
  $headers = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  $resp = Invoke-WebRequest -Uri $profileUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
  $html = $resp.Content
} catch {
  Write-Error "Failed to fetch profile page: $_"
  exit 1
}

# Match og:image or profile_pic_url_hd JSON value
$imgUrl = $null
if ($html -match '<meta property="og:image" content="([^"]+)"') {
  $imgUrl = $matches[1]
} elseif ($html -match '"profile_pic_url_hd":"([^"]+)"') {
  $imgUrl = $matches[1] -replace '\\u0026','&' -replace '\\u002F','/'
}

if (-not $imgUrl) {
  Write-Error "Could not find profile image in Instagram HTML. This may be due to automation protection."
  exit 1
}

# Download image
try {
  # Clean up common HTML entities returned by the site
  $imgUrl = $imgUrl -replace '&amp;','&'
  $imgUrl = $imgUrl.Trim()

  Write-Host "Downloading image from: $imgUrl"
  Invoke-WebRequest -Uri $imgUrl -OutFile $outFile -Headers $headers -UseBasicParsing -ErrorAction Stop
  Write-Host "Saved profile image to: $outFile"
} catch {
  Write-Error "Failed to download image: $_"
  exit 1
}
