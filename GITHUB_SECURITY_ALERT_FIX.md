# 🔒 GitHub Security Alert - Exposed Secrets Fix

## Summary
GitHub detected **API keys exposed in your git commit history**. While your current code correctly uses environment variables, old commits contain hardcoded keys that need to be **revoked immediately**.

## ⚠️ Critical Actions Required

### 1. Rotate All Exposed API Keys IMMEDIATELY ✨

#### Google API Keys
**Multiple Google API Keys were exposed** in commit history

**Steps to Rotate:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Credentials** → **API Keys**
3. Delete all exposed/old API keys
4. Create new API keys
5. Update your `.env` files with NEW keys

#### SendGrid API Key
**SendGrid API Key was exposed** in commit history

**Steps to Rotate:**
1. Go to [SendGrid Settings](https://app.sendgrid.com/settings/api_keys)
2. Review all API keys and identify the exposed one
3. Delete the exposed key
4. Create a new API key
5. Update `.env` with NEW key

#### MongoDB Connection String
**Exposed in `.env.example`:**
- Contains `username:password@cluster.mongodb.net` format

**Steps to Rotate:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Database Access** → Reset password for your user
3. Update connection string with new password in `.env`

---

### 2. Current Code Status ✅

**Good News:** Your current code is properly configured:

- ✅ **Backend** (`ai.services.js`): Uses `process.env.GOOGLE_API_KEY`
- ✅ **Frontend** (`Test.jsx`, `MyBatch.jsx`): Uses `import.meta.env.VITE_GOOGLE_API_KEY`
- ✅ **Config Files**: `.env.example` has placeholder values
- ✅ **.gitignore**: Properly configured to ignore `.env` files

---

### 3. Fix Git History (Git Filter)

The exposed keys are in your commit history. To remove them:

#### Option A: Using BFG Repo-Cleaner (RECOMMENDED)
```powershell
# 1. Install BFG
scoop install bfg

# 2. Clone a mirror of the repo
git clone --mirror https://github.com/yourusername/yourrepo.git

# 3. Remove the exposed key strings
bfg --replace-text secrets.txt yourusername-yourrepo.git

# 4. Push the cleaned history
cd yourusername-yourrepo.git
git push

# 5. Clone fresh copy
git clone https://github.com/yourusername/yourrepo.git
```

#### Option B: Using git-filter-branch (COMPLEX - NOT RECOMMENDED)
```powershell
# Only if BFG doesn't work
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch Backend/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

---

### 4. Verify Fixes on GitHub

1. ✅ Go to your repository settings
2. ✅ Click **Security** → **Secret scanning**
3. ✅ All alerts should be resolved
4. ✅ Verify no new secrets are detected

---

## 📋 Environment Variables Setup

### Backend (`.env` - Create this file locally)
```env
# Don't commit this file
NODE_ENV=development
PORT=1000
MONGO_URI=mongodb://localhost:27017/Intellearn
JWT_SECRET=your-secret-key

# Replace with YOUR NEW keys after rotation
GOOGLE_API_KEY=your-new-google-api-key
SENDGRID_API_KEY=your-new-sendgrid-key
SENDGRID_FROM_EMAIL=your-email@gmail.com
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env` - Create this file locally)
```env
VITE_API_URL=http://localhost:1000
VITE_GOOGLE_API_KEY=your-new-google-api-key
```

---

## 🔒 Best Practices (Going Forward)

1. **NEVER** hardcode API keys in source code
2. **ALWAYS** use environment variables
3. **ALWAYS** add `.env` to `.gitignore`
4. Use `.env.example` as a template for developers
5. Keep `.env` files in your local system only
6. Use GitHub Secrets for CI/CD pipelines
7. Rotate API keys regularly (every 3-6 months)
8. Monitor GitHub Secret Scanning alerts

---

## ✅ Verification Checklist

- [ ] Rotated Google API Key
- [ ] Rotated SendGrid API Key
- [ ] Reset MongoDB password
- [ ] Updated local `.env` files with new keys
- [ ] Cleaned git history using BFG or git-filter-branch
- [ ] Pushed changes to remote
- [ ] Verified GitHub alerts are resolved
- [ ] All tests still pass with new keys
- [ ] Backend server can send emails
- [ ] Frontend can access Google API

---

## 📞 Support

If you have issues:
1. Check GitHub Actions logs for any CI/CD failures
2. Test locally with new API keys before pushing
3. Verify all services (Google, SendGrid, MongoDB) are configured correctly
4. Check network access/firewall rules if services aren't connecting

---

**Last Updated:** February 10, 2026
