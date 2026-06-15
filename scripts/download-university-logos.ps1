$urls = @(
  @{url='https://upload.wikimedia.org/wikipedia/commons/a/91/Ad%C4%B1yaman_University_logo.svg'; out='public/images/universities/adiyaman-university.svg'},
  @{url='https://upload.wikimedia.org/wikipedia/commons/a/a6/Ankara_Y%C4%B1ld%C4%B1r%C4%B1m_Beyaz%C4%B1t_University_logo.svg'; out='public/images/universities/ankara-yildirim-beyazit-university.svg'},
  @{url='https://upload.wikimedia.org/wikipedia/en/6/63/Mehmet_akif_ersoy_university_logo.png'; out='public/images/universities/burdur-mehmet-akif-ersoy-university.png'},
  @{url='https://upload.wikimedia.org/wikipedia/commons/3/36/K%C4%B1r%C4%B1kkale-%C3%9Cniversitesi-Logo.svg'; out='public/images/universities/kirikkale-university.svg'},
  @{url='https://upload.wikimedia.org/wikipedia/commons/2/29/D%C3%BCzce_University_logo.svg'; out='public/images/universities/duzce-university.svg'},
  @{url='https://upload.wikimedia.org/wikipedia/en/9/96/Zonguldak_B%C3%BClent_Ecevit_University_Logo.png'; out='public/images/universities/zonguldak-bulent-ecevit-university.png'},
  @{url='https://upload.wikimedia.org/wikipedia/tr/3/37/Kastamonu_%C3%9Cniversitesi_logosu.jpg'; out='public/images/universities/kastamonu-university.jpg'},
  @{url='https://upload.wikimedia.org/wikipedia/commons/6/6d/U%C5%9Fak_University_logo.svg'; out='public/images/universities/usak-university.svg'},
  @{url='https://upload.wikimedia.org/wikipedia/tr/0/05/%C4%B0zmir_K%C3%A2tip_%C3%87elebi_%C3%9Cniversitesi_logosu.png'; out='public/images/universities/izmir-katip-celebi-university.png'},
  @{url='https://upload.wikimedia.org/wikipedia/commons/1/15/Mersin_University_logo.svg'; out='public/images/universities/mersin-university.svg'},
  @{url='https://upload.wikimedia.org/wikipedia/d/d7/OM%C3%9C_%C4%B0ngilizce_Logo.png'; out='public/images/universities/ondokuz-mayis-university.png'},
  @{url='https://upload.wikimedia.org/wikipedia/en/b/b8/Anadolu_University_logo.svg'; out='public/images/universities/anadolu-university.svg'}
)

foreach ($item in $urls) {
  $dest = $item.out
  $dir = Split-Path $dest -Parent
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }

  Write-Host "Downloading $($item.url) -> $dest"
  curl.exe -L -A 'Mozilla/5.0' -H 'Referer: https://wikipedia.org' --retry 3 --retry-delay 2 -o $dest $item.url
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED $($item.url)" -ForegroundColor Red
  }
}
