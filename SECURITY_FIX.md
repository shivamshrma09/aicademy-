# Security Fix - API Keys Exposure

## ⚠️ CRITICAL: Exposed Secrets Detected

GitHub detected exposed API keys in your repository. This document explains what was fixed and what you need to do.

## 🔧 What Was Fixed

### 1. Backend API Key (ai.services.js)
- **Before:** Hardcoded Google API key
- **After:** Using `process.env.GOOGLE_API_KEY`

### 2. Frontend API Keys
- **Test.jsx:** Now uses `import.meta.env.VITE_GOOGLE_API_KEY`
- **MyBatch.jsx:** Now uses `import.meta.env.VITE_GOOGLE_API_KEY`
- **Library.jsx:** Now uses `import.meta.env.VITE_GOOGLE_API_KEY`

### 3. MongoDB URI
- **Backend/.env.example:** Changed to placeholder values

## 🚨 IMMEDIATE ACTIONS REQUIRED

### 1. Revoke Exposed API Keys
You MUST revoke and regenerate ALL exposed API keys immediately:

#### Google API Key:
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your API key
3. Click "Delete" or "Regenerate"
4. Create a new API key
5. Add restrictions (HTTP referrers for frontend, IP addresses for backend)

#### MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Database Access → Change password
3. Update connection string

### 2. Set Up Environment Variables

#### Backend (.env):
```bash
cd Backend
cp .env.example .env
# Edit .env and add your NEW keys
```

#### Frontend (.env):
```bash
cd Frontend
cp .env.example .env
# Edit .env and add your NEW keys
```

### 3. Update Git History (IMPORTANT!)
The old keys are still in git history. You need to remove them:

```bash
# Install BFG Repo-Cleaner or use git filter-branch
# Option 1: Using BFG (Recommended)
git clone --mirror https://github.com/shivamshrma09/aicademy-.git
java -jar bfg.jar --replace-text passwords.txt aicademy-.git
cd aicademy-.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# Option 2: Contact GitHub Support
# Go to https://support.github.com and request history cleanup
```

## 📋 Best Practices Going Forward

### 1. Never Commit Secrets
- Always use environment variables
- Never hardcode API keys, passwords, or tokens
- Use `.env` files (already in .gitignore)

### 2. Use Different Keys for Different Environments
- Development keys
- Production keys
- Testing keys

### 3. Add API Key Restrictions
- **Google API Keys:** Restrict by HTTP referrer or IP
- **MongoDB:** Use IP whitelist
- **JWT Secrets:** Use strong, random strings

### 4. Regular Security Audits
- Check for exposed secrets monthly
- Rotate keys every 90 days
- Monitor API usage for anomalies

### 5. Use Secret Management Tools
For production, consider:
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Vercel Environment Variables

## 📝 Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://your-frontend-domain.com
GOOGLE_API_KEY=your-new-google-api-key
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:1000
VITE_GOOGLE_API_KEY=your-new-google-api-key
```

## ✅ Verification Checklist

- [ ] Revoked all exposed API keys
- [ ] Generated new API keys
- [ ] Created .env files (Backend and Frontend)
- [ ] Added new keys to .env files
- [ ] Verified .env is in .gitignore
- [ ] Tested application with new keys
- [ ] Removed keys from git history
- [ ] Added API key restrictions
- [ ] Documented key locations securely

## 🔗 Useful Links

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Google API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

## 📞 Need Help?

If you're unsure about any step, please:
1. Stop and don't commit anything
2. Revoke the exposed keys immediately
3. Seek help from a security expert
4. Review GitHub's security documentation

---

**Remember:** Security is not optional. Take these steps seriously to protect your application and users.
