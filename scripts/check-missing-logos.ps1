$urls = @(
  @{slug='adiyaman-university'; url='https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Ad%C4%B1yaman_University_logo.svg/250px-Ad%C4%B1yaman_University_logo.svg.png'},
  @{slug='usak-university'; url='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/U%C5%9Fak_University_logo.svg/250px-U%C5%9Fak_University_logo.svg.png'},
  @{slug='izmir-katip-celebi-university'; url='https://upload.wikimedia.org/wikipedia/tr/thumb/0/05/%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png/250px-%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png'},
  @{slug='mersin-university'; url='https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Mersin_University_logo.svg/250px-Mersin_University_logo.svg.png'},
  @{slug='ondokuz-mayis-university'; url='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/OM%C3%9C_%C4%B0ngilizce_Logo.png/250px-OM%C3%9C_%C4%B0ngilizce_Logo.png'},
  @{slug='anadolu-university'; url='https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Anadolu_University_logo.svg/250px-Anadolu_University_logo.svg.png'}
)

foreach ($item in $urls) {
  Write-Host "=== $($item.slug) ==="
  try {
    $res = Invoke-WebRequest -Uri $item.url -Headers @{ 'User-Agent' = 'Mozilla/5.0'; Referer='https://wikipedia.org' } -Method Head -UseBasicParsing -TimeoutSec 20
    Write-Host $res.StatusCode $res.Headers.'Content-Type' $res.Headers.'Content-Length'
  } catch {
    Write-Host "ERROR: $($_.Exception.Message)"
  }
}
