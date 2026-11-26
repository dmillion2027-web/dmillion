# cPanel SFTP Upload Script
$host_ip = "102.203.116.18"
$port = 1624
$username = "uwmsfjqn"
$password = "OrW4l073k#.lPZ"
$localZip = "c:\Users\user\Documents\dmillion\Dmillions\dist.zip"
$remoteDir = "/public_html"

Write-Host "Uploading dist.zip to cPanel..."
Write-Host "Host: $host_ip"
Write-Host "Port: $port"
Write-Host "User: $username"
Write-Host "Remote Dir: $remoteDir"

# Using plink for SFTP if available, or showing manual instructions
$plink = Get-Command plink -ErrorAction SilentlyContinue

if ($plink) {
    Write-Host "plink found, would upload here..."
} else {
    Write-Host "`nManual Upload Instructions:"
    Write-Host "1. Use FileZilla or WinSCP"
    Write-Host "2. Connect to: $host_ip`:$port"
    Write-Host "3. Username: $username"
    Write-Host "4. Password: $password"
    Write-Host "5. Protocol: SFTP"
    Write-Host "6. Upload $localZip to $remoteDir"
    Write-Host "7. Extract dist.zip in cPanel file manager"
    Write-Host "8. Delete dist.zip"
}
