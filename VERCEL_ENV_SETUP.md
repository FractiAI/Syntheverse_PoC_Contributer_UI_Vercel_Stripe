# Vercel Environment Variables Setup

## 🔐 Required Environment Variable for AI Instructor

The Interactive AI Onboarding Instructor requires the `GROQ_API_KEY` environment variable to be set in Vercel.

---

## 📋 Step-by-Step Instructions

### **1. Get Your Groq API Key**

If you don't have a Groq API key yet:

1. Go to: https://console.groq.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Click "Create API Key"
5. Copy the key (starts with `gsk_...`)

---

### **2. Add Environment Variable to Vercel**

#### **Option A: Via Vercel Dashboard**

1. Go to: https://vercel.com/your-team/your-project
2. Click on **"Settings"** tab
3. Click on **"Environment Variables"** in left sidebar
4. Click **"Add New"** button
5. Enter:
   - **Name**: `GROQ_API_KEY`
   - **Value**: `gsk_your_actual_key_here`
   - **Environment**: Select **Production**, **Preview**, and **Development** (all three)
6. Click **"Save"**

#### **Option B: Via Vercel CLI**

```bash
vercel env add GROQ_API_KEY
# Paste your key when prompted
# Select: Production, Preview, Development (all)
```

---

### **3. Redeploy**

After adding the environment variable:

**Option A: Trigger New Deployment**
- Push any commit to GitHub (triggers auto-deploy)
- OR click "Redeploy" in Vercel dashboard

**Option B: Force Redeploy**
```bash
vercel --prod
```

---

## ✅ Verify It Works

1. Wait for deployment to complete (2-3 minutes)
2. Go to: `https://your-app.vercel.app/onboarding`
3. Select any Wings track
4. Click "Ask Instructor" button
5. Type a question like: "What's the hydrogen holographic constant?"
6. You should get an AI response within 3-5 seconds

---

## 🔍 Troubleshooting

### **Build fails with "GROQ_API_KEY is missing"**

**Cause**: Environment variable not set in Vercel  
**Solution**: Follow Step 2 above to add it

### **API returns "AI Instructor temporarily unavailable"**

**Cause**: API key not available at runtime  
**Solution**: 
1. Check Vercel dashboard → Settings → Environment Variables
2. Ensure `GROQ_API_KEY` is set for Production environment
3. Redeploy the app

### **"Invalid API key" error**

**Cause**: Wrong key or key expired  
**Solution**:
1. Get a fresh key from https://console.groq.com/
2. Update the environment variable in Vercel
3. Redeploy

---

## 🔒 Security Notes

- ✅ **Never** commit API keys to GitHub
- ✅ **Always** use environment variables for secrets
- ✅ The API route runs **server-side only** (Next.js API route)
- ✅ API key is **never exposed to browser**
- ✅ Rate limiting handled by Groq API automatically

---

## 💰 Groq API Pricing

Groq offers generous free tier:
- **Free tier**: 30 requests/minute, 14,400 requests/day
- **Pricing**: Very affordable for production use
- **Model**: llama-3.3-70b-versatile (fast, high-quality)

For Syntheverse Academy usage:
- **Estimated usage**: ~100-500 requests/day (typical training usage)
- **Cost**: Should remain within free tier for most deployments

---

## 🎓 What the AI Instructor Does

The AI Instructor provides:
- Real-time Q&A on module content
- Context-aware responses (knows current module, track, content)
- Scientific explanations with HHF-AI framework
- Encouraging guidance and practical examples
- Cross-module connections

**Without this key**: The AI Instructor button will show, but clicking it will show "temporarily unavailable" message.

---

## 📞 Need Help?

If you're still having issues:
1. Check Vercel deployment logs for specific errors
2. Verify the key works by testing at https://console.groq.com/playground
3. Ensure all environment variables are set for the correct environments

---

**Last Updated**: January 10, 2026  
**Feature**: Interactive AI Onboarding Instructor  
**Required For**: `/api/onboarding-ai` route

