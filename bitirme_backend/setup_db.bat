@echo off
echo MySQL veritabani kurulumu baslatiliyor...

mysql -h BGRB -P 3306 -u root -p347834 < db\init.sql

if %errorlevel% equ 0 (
    echo Veritabani basariyla kuruldu!
) else (
    echo Veritabani kurulumu sirasinda hata olustu!
)

pause