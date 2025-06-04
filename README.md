# Meet Service (Signaling Server)

Một máy chủ signaling chuyên nghiệp phục vụ chức năng họp video trực tuyến (tương tự Google Meet) sử dụng Node.js, Express và WebSocket.

## Tính năng
- Quản lý phòng họp (tạo, tham gia, rời phòng)
- Truyền tín hiệu WebRTC giữa các client (signaling)
- Dễ dàng mở rộng xác thực, quản lý người dùng
- Cấu trúc rõ ràng, dễ triển khai và bảo trì

## Cài đặt

```bash
cd meet-service
npm install
```

## Khởi động máy chủ

```bash
npm start
```

Mặc định server chạy ở cổng `3000`. Có thể thay đổi bằng biến môi trường `PORT`.

## API & Signaling qua WebSocket

- **Kết nối WebSocket:**
  - URL: `ws://<server>:3000`
- **Các loại message:**
  - `join`: Tham gia phòng
    ```json
    { "type": "join", "room": "room-id" }
    ```
  - `signal`: Gửi tín hiệu WebRTC tới các peer khác trong phòng
    ```json
    { "type": "signal", "room": "room-id", "payload": { ... } }
    ```
  - Server sẽ chuyển tiếp tín hiệu tới các client khác trong cùng phòng.

## Tích hợp frontend mẫu

Đã cung cấp file `frontend.html` trong thư mục `meet-service` để bạn có thể thử nghiệm ngay chức năng họp video:

### Cách sử dụng frontend mẫu

1. Đảm bảo đã khởi động server bằng lệnh:
   ```bash
   npm start
   ```
2. Mở file `frontend.html` bằng trình duyệt (Chrome/Edge/Firefox).
3. Nhập tên phòng và nhấn "Join Room" để bắt đầu họp video.
4. Mở thêm tab hoặc máy khác, nhập cùng tên phòng để kết nối nhiều người.

### Tính năng frontend mẫu
- Truyền tải video/audio giữa các client qua WebRTC.
- Kết nối signaling với server qua WebSocket.
- Giao diện đơn giản, dễ mở rộng thêm chat, chia sẻ màn hình, v.v.

Bạn có thể chỉnh sửa hoặc phát triển thêm giao diện này theo nhu cầu thực tế.

## Mở rộng
- Thêm xác thực JWT hoặc OAuth2
- Lưu lịch sử phòng, chat, ghi hình
- Tích hợp chia sẻ màn hình, chat text, quản lý quyền truy cập

---

**Tác giả:** Đội ngũ phát triển Meet Service
