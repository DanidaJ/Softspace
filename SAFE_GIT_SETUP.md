# 🚀 Safe Git Setup & First Push

Follow these steps **EXACTLY** to safely push your code to GitHub without exposing secrets.

## ✅ Step 1: Verify .gitignore Files

All three .gitignore files are in place:
- ✓ Root `.gitignore`
- ✓ `backend/.gitignore`
- ✓ `frontend/.gitignore`

These will prevent `.env` files from being committed.

## ✅ Step 2: Initialize Git Repository

```bash
cd C:\Users\Danida Jayakody\-01- WORK\Softspace

# Initialize git
git init

# Verify .env files are ignored (should NOT appear in red)
git status
```

**Expected output**: You should NOT see any `.env` files listed. If you do, STOP and check your .gitignore.

## ✅ Step 3: Review Files to be Committed

```bash
# See what will be committed
git status
```

**✅ SAFE to commit:**
- Source code (.py, .tsx, .ts, .js files)
- Configuration files (package.json, requirements.txt, tsconfig.json, etc.)
- .gitignore files
- .env.example files (templates without real keys)
- README.md and documentation

**❌ NEVER commit:**
- `.env` files
- `.env.local` files  
- `.env.production` files
- Any file with real API keys

## ✅ Step 4: Initial Commit

```bash
# Add all safe files
git add .

# Double-check what's staged
git status

# Make initial commit
git commit -m "Initial commit: Softspace mental wellness app"
```

## ✅ Step 5: Connect to GitHub

```bash
# Add your GitHub repository
git remote add origin https://github.com/DanidaJ/Softspace.git

# Verify remote is set
git remote -v
```

## ✅ Step 6: Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

## ✅ Step 7: Verify on GitHub

1. Go to https://github.com/DanidaJ/Softspace
2. **CRITICAL CHECK**: Verify these files are **NOT** visible:
   - ❌ `backend/.env`
   - ❌ `backend/.env.local`
   - ❌ `frontend/.env`
   - ❌ `frontend/.env.local`

3. **SAFE CHECK**: Verify these files **ARE** visible:
   - ✓ `backend/.env.example`
   - ✓ `frontend/.env.example`
   - ✓ `.gitignore` files
   - ✓ README.md

## 🔒 Security Checklist

Before pushing, confirm:

- [ ] All `.env` files are in `.gitignore`
- [ ] No real API keys are in the code
- [ ] `.env.example` files contain only placeholders
- [ ] `git status` shows no `.env` files
- [ ] You've read the files about to be committed

## 🆘 If You Accidentally Committed .env Files

**BEFORE pushing to GitHub:**

```bash
# Remove from staging
git reset HEAD backend/.env
git reset HEAD frontend/.env

# Recommit without them
git commit --amend
```

**AFTER pushing to GitHub:**

If you accidentally pushed secrets:
1. **IMMEDIATELY** rotate all API keys
2. Delete the repository on GitHub
3. Create a new empty repository
4. Follow this guide again from Step 1

## 📝 Regular Workflow (After Initial Setup)

```bash
# Make changes to your code
# ...

# Check what changed
git status

# Add changes (excluding .env files automatically)
git add .

# Commit
git commit -m "Your commit message"

# Push
git push
```

## ✨ Best Practices

1. **Never** use `git add -f` (force add) on .env files
2. **Always** check `git status` before committing
3. **Keep** .env.example updated when adding new variables
4. **Document** required environment variables in README
5. **Rotate** API keys if accidentally exposed

## 🎉 You're Ready!

Once you complete these steps, your code will be safely on GitHub and others can clone it using the README instructions!

Your `.env.local` files stay on your local machine only. ✅
