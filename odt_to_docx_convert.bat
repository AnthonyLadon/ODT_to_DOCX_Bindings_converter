@echo off
setlocal

:: Define paths with short names (avoids issues with spaces and accents)
set "INPUT_DIR=C:\Users\"
set "OUTPUT_DIR=C:\Users\"
set "SOFFICE=C:\Program Files\LibreOffice\program\soffice.exe"

echo === CONVERSION START ===
echo.

:: Check if soffice.exe exists
if not exist "%SOFFICE%" (
    echo ERROR: LibreOffice not found:
    echo   %SOFFICE%
    pause
    exit /b
)

:: Check if the input directory exists
if not exist "%INPUT_DIR%" (
    echo ERROR: Input directory not found:
    echo   %INPUT_DIR%
    pause
    exit /b
)

:: Create the output directory if it doesn't exist
if not exist "%OUTPUT_DIR%" (
    echo Output directory does not exist. Creating it now...
    mkdir "%OUTPUT_DIR%"
)

:: Initialize counter
set count=0

:: Loop through each .odt file
for %%F in ("%INPUT_DIR%\*.odt") do (
    echo Converting: %%~nxF
    "%SOFFICE%" --headless --convert-to docx --outdir "%OUTPUT_DIR%" "%%F"
    set /a count+=1
)

echo.
if "%count%"=="0" (
    echo No .odt files found in:
    echo   %INPUT_DIR%
) else (
    echo Conversion completed for %count% file(s).
)

echo.
echo === CONVERSION END ===
pause