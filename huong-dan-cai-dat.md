# Hướng dẫn cài đặt Docker Compose và thiết lập cơ sở hạ tầng

Tài liệu này hướng dẫn cách cài đặt Docker Compose và thiết lập cơ sở hạ tầng cho dự án Multi-tenant.

## 1. Cài đặt Docker và Docker Compose

### 1.1. Cài đặt Docker

Docker là nền tảng để phát triển, vận chuyển và chạy các ứng dụng thông qua công nghệ container.

1. Truy cập trang chủ Docker: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Tải xuống Docker Desktop phù hợp với hệ điều hành của bạn (Windows, macOS, Linux)
3. Cài đặt theo hướng dẫn trên màn hình
4. Khởi động Docker Desktop sau khi cài đặt xong
5. Kiểm tra Docker đã được cài đặt thành công bằng lệnh:
   ```powershell
   docker --version
   ```

### 1.2. Kiểm tra Docker Compose

Docker Compose đã được tích hợp sẵn trong Docker Desktop. Bạn có thể kiểm tra bằng lệnh:

```powershell
docker compose version
```

Nếu kết quả hiển thị phiên bản Docker Compose, có nghĩa là bạn đã cài đặt thành công.

## 2. Thiết lập cơ sở hạ tầng

### 2.1. Kiểm tra cấu trúc thư mục

Đảm bảo rằng dự án của bạn có cấu trúc sau:

```
.
├── docker-compose.yml     # File cấu hình Docker Compose
├── Dockerfile             # File cấu hình Docker cho ứng dụng
├── .env.development       # Biến môi trường cho môi trường development
├── .env.production        # Biến môi trường cho môi trường production
├── setup-environment.ps1  # Script thiết lập môi trường
├── postgres/              # Thư mục cấu hình PostgreSQL
│   └── init/              # Script khởi tạo
│       └── 01-init-db.sh  # Script tạo cơ sở dữ liệu
└── redis/                 # Thư mục cấu hình Redis
    └── redis.conf         # File cấu hình Redis
```

### 2.2. Chạy script thiết lập môi trường

Script `setup-environment.ps1` sẽ kiểm tra Docker, Docker Compose và thiết lập môi trường phát triển.

1. Mở PowerShell
2. Điều hướng đến thư mục dự án:
   ```powershell
   cd d:\www\multi-tenant
   ```
3. Chạy script thiết lập môi trường:
   ```powershell
   .\setup-environment.ps1
   ```

Nếu gặp lỗi về quyền thực thi, hãy chạy lệnh sau và thử lại:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup-environment.ps1
```

### 2.3 Hoặc chạy Docker Compose trực tiếp

Nếu bạn gặp vấn đề với script, bạn có thể khởi động các dịch vụ trực tiếp bằng Docker Compose:

```powershell
docker compose up -d
```

## 3. Kiểm tra các dịch vụ

### 3.1. Kiểm tra trạng thái các container

```powershell
docker compose ps
```

Output nên hiển thị ba container đang chạy: `multitenant_postgres`, `multitenant_mongodb` và `multitenant_redis`.

### 3.2. Kiểm tra Redis

```powershell
docker exec -it multitenant_redis redis-cli -a redispassword ping
```

Nếu Redis hoạt động bình thường, bạn sẽ nhận được phản hồi `PONG`.

### 3.3. Kiểm tra PostgreSQL

```powershell
docker exec -it multitenant_postgres psql -U postgres -d system_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
```

Output nên hiển thị các bảng đã được tạo: `tenants`, `packages`, `modules`, `tenant_modules`, `system_users`.

### 3.4. Kiểm tra MongoDB

```powershell
docker exec -it multitenant_mongodb mongosh --username mongo --password mongo --eval "db.runCommand({ping: 1})"
```

Output nên hiển thị `{ ok: 1 }` nếu MongoDB hoạt động bình thường.

## 4. Thông tin kết nối

### 4.1. PostgreSQL

- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: postgres
- **Database**: system_db

### 4.2. MongoDB

- **URI**: mongodb://mongo:mongo@localhost:27017/admin
- **User**: mongo
- **Password**: mongo
- **Database**: multitenant

### 4.3. Redis

- **Host**: localhost
- **Port**: 6379
- **Password**: redispassword

## 5. Các lệnh hữu ích

### 5.1. Quản lý dịch vụ

- Khởi động dịch vụ: `docker compose up -d`
- Dừng dịch vụ: `docker compose down`
- Khởi động lại dịch vụ: `docker compose restart [service_name]`
- Xem logs: `docker compose logs -f [service_name]`

### 5.2. Truy cập vào container

- PostgreSQL: `docker exec -it multitenant_postgres bash`
- MongoDB: `docker exec -it multitenant_mongodb bash`
- Redis: `docker exec -it multitenant_redis sh`

### 5.3. Sao lưu dữ liệu

- PostgreSQL:
  ```powershell
  docker exec -it multitenant_postgres pg_dump -U postgres system_db > backup.sql
  ```

- MongoDB:
  ```powershell
  docker exec -it multitenant_mongodb mongodump --username mongo --password mongo --authenticationDatabase admin --db multitenant --out /tmp/backup
  docker cp multitenant_mongodb:/tmp/backup ./mongodb_backup
  ```

## 6. Lưu ý và xử lý sự cố

- Nếu gặp lỗi kết nối Docker, hãy khởi động lại Docker Desktop.
- Nếu các container không khởi động, kiểm tra logs bằng `docker compose logs`.
- Đảm bảo các cổng 5432, 27017, và 6379 không bị chiếm bởi các dịch vụ khác.
- Đối với Windows, đảm bảo WSL 2 đã được cài đặt nếu bạn sử dụng Docker Desktop với Backend WSL 2.

## 7. Tài liệu tham khảo

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
