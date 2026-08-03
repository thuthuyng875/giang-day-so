@echo off
echo Đang xóa thư mục .next...
if exist .next (
    rmdir /s /q .next
    echo Đã xóa thư mục .next thành công!
) else (
    echo Thư mục .next không tồn tại.
)
pause
