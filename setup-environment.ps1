# Thiết lập môi trường phát triển cho dự án Multi-tenant

# Kiểm tra và cài đặt Docker nếu chưa có
function Check-Docker {
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "Docker không được tìm thấy. Vui lòng cài đặt Docker và Docker Compose trước khi tiếp tục." -ForegroundColor Red
        Write-Host "Tải Docker Desktop tại: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Docker đã được cài đặt!" -ForegroundColor Green
}

# Kiểm tra Docker Compose
function Check-DockerCompose {
    try {
        $composeVersion = docker compose version
        Write-Host "Docker Compose đã được cài đặt!" -ForegroundColor Green
    } catch {
        Write-Host "Docker Compose không được tìm thấy. Vui lòng cài đặt Docker Compose trước khi tiếp tục." -ForegroundColor Red
        exit 1
    }
}

# Thiết lập môi trường phát triển
function Setup-DevEnvironment {
    Write-Host "Đang thiết lập môi trường phát triển..." -ForegroundColor Cyan
    
    # Đảm bảo file initialization script có quyền thực thi (khi chạy trên Linux/WSL)
    if ($IsLinux -or $IsMacOS) {
        chmod +x ./postgres/init/01-init-db.sh
    }
    
    # Chạy Docker Compose để khởi động các dịch vụ
    docker compose up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Khởi động các dịch vụ thất bại. Vui lòng kiểm tra lỗi và thử lại." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Tất cả các dịch vụ đã được khởi động thành công!" -ForegroundColor Green
    Write-Host "  - PostgreSQL: localhost:5432" -ForegroundColor Yellow
    Write-Host "  - MongoDB: localhost:27017" -ForegroundColor Yellow
    Write-Host "  - Redis: localhost:6379" -ForegroundColor Yellow
}

# Kiểm tra tình trạng các dịch vụ
function Check-Services {
    Write-Host "Kiểm tra tình trạng các dịch vụ..." -ForegroundColor Cyan
    
    docker compose ps
}

# Chương trình chính
Write-Host "====== THIẾT LẬP CƠ SỞ HẠ TẦNG MULTI-TENANT ======" -ForegroundColor Cyan
Write-Host

# Kiểm tra các công cụ cần thiết
Check-Docker
Check-DockerCompose

# Thiết lập môi trường
Setup-DevEnvironment

# Kiểm tra tình trạng dịch vụ
Check-Services

Write-Host
Write-Host "Cơ sở hạ tầng đã được thiết lập thành công!" -ForegroundColor Green
Write-Host "Chạy 'docker compose ps' để kiểm tra trạng thái các dịch vụ." -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Cyan
