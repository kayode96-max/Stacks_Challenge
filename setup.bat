@echo off
echo ====================================
echo Builder Challenge - Setup Script
echo ====================================
echo.

REM Check if .env files exist in frontend
if not exist "frontend\.env" (
    echo [1/2] Creating frontend .env file...
    copy "frontend\.env.example" "frontend\.env" > nul
    echo     ✓ Created frontend\.env
    echo.
    echo     ⚠️  IMPORTANT: Edit frontend\.env and add your Reown Project ID
    echo     Get it from: https://cloud.reown.com
    echo.
) else (
    echo [1/2] Frontend .env already exists ✓
    echo.
)

REM Check if .env files exist in backend
if not exist "backend\.env" (
    echo [2/2] Creating backend .env file...
    copy "backend\.env.example" "backend\.env" > nul
    echo     ✓ Created backend\.env
    echo.
) else (
    echo [2/2] Backend .env already exists ✓
    echo.
)

echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Edit frontend\.env and add your Reown Project ID
echo 2. Start local blockchain: cd contracts ^&^& npm run node
echo 3. Deploy contracts: cd contracts ^&^& npm run deploy:local
echo 4. Update backend\.env with contract address
echo 5. Run the app: npm run dev
echo.
echo See QUICKSTART.md for detailed instructions
echo.
pause
