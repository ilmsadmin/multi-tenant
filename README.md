# Multi-Tenant System

Hệ thống đa người thuê (Multi-tenant) được xây dựng trên NestJS, PostgreSQL, MongoDB và Redis.

## Cấu trúc hệ thống

Hệ thống sử dụng mô hình Schema-per-Tenant trong PostgreSQL, kết hợp với MongoDB cho dữ liệu phi cấu trúc và Redis cho caching.

### Thành phần cơ sở hạ tầng:

- **PostgreSQL**: Lưu trữ dữ liệu có cấu trúc, sử dụng schema riêng cho mỗi tenant
- **MongoDB**: Lưu trữ dữ liệu phi cấu trúc như logs, configuration, v.v
- **Redis**: Cache và quản lý phiên làm việc

## Thiết lập môi trường phát triển

### Yêu cầu:

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/) (thường được cài cùng Docker Desktop)

### Các bước thiết lập:

1. Clone repository:
```
git clone <repository_url>
cd multi-tenant
```

2. Chạy script thiết lập môi trường:
```
./setup-environment.ps1
```

3. Kiểm tra các dịch vụ đã chạy:
```
docker compose ps
```

## Thông tin kết nối:

### PostgreSQL:
- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: postgres
- **Database**: system_db

### MongoDB:
- **URI**: mongodb://mongo:mongo@localhost:27017/admin
- **Database**: multitenant

### Redis:
- **Host**: localhost
- **Port**: 6379
- **Password**: redispassword

## Quản lý dịch vụ:

- **Khởi động tất cả dịch vụ**: `docker compose up -d`
- **Dừng tất cả dịch vụ**: `docker compose down`
- **Xem logs**: `docker compose logs -f [service_name]`
- **Khởi động lại một dịch vụ**: `docker compose restart [service_name]`

## Tài liệu tham khảo:

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Documentation](https://docs.docker.com/)
