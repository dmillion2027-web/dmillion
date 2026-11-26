$source = "c:\Users\user\Documents\dmillion\Dmillions\dist"
$destination = "c:\Users\user\Documents\dmillion\Dmillions\dist.zip"

# Remove old zip if exists
if (Test-Path $destination) {
    Remove-Item $destination -Force
}

# Compress
Compress-Archive -Path $source -DestinationPath $destination -Force
Write-Host "Created: $destination"
Write-Host "Size: $(Get-Item $destination | Select-Object -ExpandProperty Length) bytes"
