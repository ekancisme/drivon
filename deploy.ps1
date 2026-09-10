param (
    [Parameter(Mandatory=$false)]
    [string]$AppName = "drivon-app",

    [Parameter(Mandatory=$false)]
    [string]$Domain = "youngltc.id.vn",

    [Parameter(Mandatory=$false)]
    [int]$ContainerPort = 80,

    [string]$VpsHost = "root@36.50.54.246",
    [string]$Dockerfile = "Dockerfile",
    [string]$EnvFile = ""
)

$ErrorActionPreference = "Stop"

$AppNameLower = $AppName.ToLower()
$ImageName = "${AppNameLower}:latest"
$TarFile = "${AppNameLower}_source.tar.gz"
$RemoteSourceDir = "/tmp/${AppNameLower}_build"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "BAT DAU DEPLOY DRIVON LEN VPS ($VpsHost)" -ForegroundColor Cyan
Write-Host "App: $AppName | Domain: $Domain | Port: $ContainerPort" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Kiem tra Dockerfile
if (-not (Test-Path $Dockerfile)) {
    Write-Host "[ERROR] Khong tim thay file $Dockerfile trong thu muc hien tai!" -ForegroundColor Red
    exit 1
}

# 2. Dong goi ma nguon bang tar
Write-Host "[1/4] Dang dong goi ma nguon..." -ForegroundColor Yellow
if (Test-Path $TarFile) { 
    Remove-Item $TarFile -Force 
}

tar.exe -czf $TarFile --exclude="frontend/node_modules" --exclude="backend/target" --exclude="dist" --exclude=".git" --exclude="*.tar.gz" --exclude="*.zip" --exclude=".agents" --exclude=".claude" --exclude=".codex" --exclude="graft" .

if (-not (Test-Path $TarFile)) {
    Write-Host "[ERROR] Loi khi tao file $TarFile!" -ForegroundColor Red
    exit 1
}

$fileSize = (Get-Item $TarFile).Length
$fileSizeMB = [math]::Round($fileSize / 1MB, 2)
Write-Host "   Da dong goi $TarFile ($fileSizeMB MB) thanh cong!" -ForegroundColor Green

# 3. Chuyen ma nguon sang VPS
Write-Host "[2/4] Dang chuyen ma nguon sang VPS..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no -o BatchMode=yes $VpsHost "rm -rf $RemoteSourceDir && mkdir -p $RemoteSourceDir"
scp -o StrictHostKeyChecking=no -o BatchMode=yes $TarFile "${VpsHost}:$RemoteSourceDir/source.tar.gz"
if (Test-Path $TarFile) { 
    Remove-Item $TarFile -Force 
}

# 4. Xu ly file .env neu co
$RemoteEnvFlag = ""
if ($EnvFile -and (Test-Path $EnvFile)) {
    Write-Host "   Dang dong bo file $EnvFile sang VPS..." -ForegroundColor Yellow
    $RemoteEnvPath = "/root/data/apps/$AppName/.env"
    ssh -o StrictHostKeyChecking=no -o BatchMode=yes $VpsHost "mkdir -p /root/data/apps/$AppName"
    scp -o StrictHostKeyChecking=no -o BatchMode=yes $EnvFile "${VpsHost}:$RemoteEnvPath"
    $RemoteEnvFlag = "--env-file $RemoteEnvPath"
}

# 5. Build Docker Image tren VPS
Write-Host "[3/4] Dang build Docker Image tren VPS..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no -o BatchMode=yes $VpsHost "cd $RemoteSourceDir && tar -xzf source.tar.gz && rm -f source.tar.gz && docker build -t $ImageName -f $Dockerfile . && rm -rf $RemoteSourceDir"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Loi build Docker tren VPS!" -ForegroundColor Red
    exit 1
}

# 6. Chay Container va Cap nhat Caddyfile
Write-Host "[4/4] Khoi dong Container va Cap nhat Caddy..." -ForegroundColor Yellow
$RunCommands = @"
docker stop ${AppName} 2>/dev/null || true
docker rm ${AppName} 2>/dev/null || true
docker run -d --name ${AppName} --restart always --network web-net ${RemoteEnvFlag} ${ImageName}

if ! grep -q "${Domain}" /root/caddy/Caddyfile; then
  printf "\n${Domain} {\n    reverse_proxy ${AppName}:${ContainerPort}\n}\n" >> /root/caddy/Caddyfile
fi

docker exec -w /etc/caddy caddy caddy reload
"@

ssh -o StrictHostKeyChecking=no -o BatchMode=yes $VpsHost $RunCommands

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "DEPLOY DRIVON THANH CONG RUC RO!" -ForegroundColor Green
Write-Host "Website: https://$Domain" -ForegroundColor Green
Write-Host "API: https://$Domain/api/test" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
