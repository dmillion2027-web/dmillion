# Installation Fix Guide

## Issue
The dependencies had version conflicts, particularly with React 19 which is not yet fully compatible with all Three.js packages.

## Solution

I've updated the `package.json` with stable, compatible versions:
- React 18.3.1 (instead of 19.3.1)
- Compatible Three.js packages
- Stable Vite 5.x
- All dependencies tested together

## Steps to Fix

### 1. Delete existing node_modules and lock file
Open your terminal in the project folder and run:

```bash
rm -rf node_modules package-lock.json
```

Or on Windows:
```cmd
rmdir /s /q node_modules
del package-lock.json
```

### 2. Clear npm cache (optional but recommended)
```bash
npm cache clean --force
```

### 3. Install dependencies
```bash
npm install
```

### 4. Start the development server
```bash
npm run dev
```

## If Still Having Issues

### Option 1: Manual Installation
Try installing packages one by one:

```bash
# Core dependencies
npm install react@18.3.1 react-dom@18.3.1

# Routing
npm install react-router-dom@6.28.0

# 3D and animations
npm install three@0.169.0
npm install @react-three/fiber@8.17.10
npm install @react-three/drei@9.114.3
npm install framer-motion@11.11.17

# Backend and UI
npm install @supabase/supabase-js@2.119.0
npm install lucide-react@0.460.0

# Dev dependencies
npm install -D vite@5.4.11
npm install -D @vitejs/plugin-react@4.3.4
npm install -D tailwindcss@3.4.15
npm install -D autoprefixer@10.4.20
npm install -D postcss@8.4.49
```

### Option 2: Use npm with legacy peer deps
```bash
npm install --legacy-peer-deps
```

### Option 3: Clear everything and reinstall
```bash
# Delete node_modules, package-lock.json
rm -rf node_modules package-lock.json

# Delete npm cache
npm cache clean --force

# Reinstall
npm install
```

## Verify Installation

After installation, check that these work:

```bash
# Should show no errors
npm list react
npm list three
npm list framer-motion

# Start dev server
npm run dev
```

## Common Errors and Fixes

### Error: "Cannot find module 'three'"
```bash
npm install three@0.169.0
```

### Error: "framer-motion" version issues
```bash
npm install framer-motion@11.11.17
```

### Error: Vite build errors
```bash
npm install -D vite@5.4.11 --force
```

### Port 5173 already in use
```bash
# Kill the process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

## Expected Result

After successful installation, you should see:
```
✓ Dependencies installed successfully
✓ Dev server running at http://localhost:5173
```

## Additional Notes

- If you're using Node.js v20+, some packages may show warnings. These are usually safe to ignore.
- The project uses React 18 for maximum compatibility with the ecosystem.
- All Three.js packages are version-matched to prevent conflicts.

## Need More Help?

1. Check your Node.js version: `node --version` (should be v18+)
2. Check your npm version: `npm --version` (should be v9+)
3. Make sure you're in the correct directory: `cd Dmillions`
4. Try running as administrator (Windows) or with sudo (Mac/Linux) if you get permission errors

## Quick Start After Fix

Once installed successfully:

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173

# In another terminal, you can:
npm run build  # Build for production
npm run preview  # Preview production build
```
