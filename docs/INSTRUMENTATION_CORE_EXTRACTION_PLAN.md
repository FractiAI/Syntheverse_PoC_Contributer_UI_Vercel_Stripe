# Instrumentation Core Extraction Plan

**Date:** January 2025  
**Status:** 📋 **PLANNING**  
**Target Repository:** `Syntheverse-Instrumentation-Shell-API`  
**This Repository:** Octave 2 Public Cloud Shell

---

## 🎯 Executive Summary

The **Instrumentation Core** will be extracted into a new GitHub repository branded as **Instrumentation Shell API**. This new repository will call this cloud shell (which becomes **Octave 2 Public Cloud Shell**) for public network shell operations.

**Architecture:**
```
Instrumentation Shell API (New Repository)
    ↓
    Calls Octave 2 Public Cloud Shell (This Repository)
    ↓
    Public Network Shell Operations
```

---

## 📦 Components to Extract

### Core Instrumentation Components

1. **ReactorCore Component**
   - File: `components/ReactorCore.tsx`
   - Purpose: Core instrument panel for SYNTH token display
   - Status: Extract to Instrumentation Shell API

2. **Atomic Scoring System**
   - Files: `utils/scoring/AtomicScorer.ts`
   - Purpose: Instrument-grade raw HHF-AI MRI atomic scores
   - Status: Extract to Instrumentation Shell API

3. **State Imaging & Verification**
   - Files: 
     - `utils/omnibeam/fiberoptic-state-extractor.ts`
     - `utils/nspfrp/state-imaging-protocol.ts`
   - Purpose: State measurement and verification
   - Status: Extract to Instrumentation Shell API

4. **Instrumentation APIs**
   - Files:
     - `app/api/state-image/process/route.ts`
     - `app/api/evaluate/[hash]/route.ts` (scoring parts)
   - Purpose: Instrumentation measurement APIs
   - Status: Extract to Instrumentation Shell API

### What Stays in Octave 2 Public Cloud Shell

- Public network shell operations
- User interfaces and dashboards
- Payment processing
- Authentication and authorization
- Public-facing APIs

---

## 🏗️ New Repository Structure

### Repository Name
**`Syntheverse-Instrumentation-Shell-API`**

### Branding
- **Name:** Instrumentation Shell API
- **Purpose:** Instrument-grade measurement and verification API
- **Octave:** Instrumentation Core (separate from Public Cloud Shell)
- **Interface:** RESTful API for instrumentation operations

### API Endpoints (Planned)

```
POST /api/instrumentation/measure
POST /api/instrumentation/verify
POST /api/instrumentation/state-image
GET  /api/instrumentation/status
POST /api/instrumentation/score
```

### Integration with Octave 2 Public Cloud Shell

The Instrumentation Shell API will call Octave 2 Public Cloud Shell for:
- Public network shell operations
- User authentication
- Payment processing
- Public-facing interfaces

---

## 🔄 This Repository Conversion

### New Branding: Octave 2 Public Cloud Shell

**Current:** Syntheverse POST SINGULARITY^7 Core Shell  
**New:** Octave 2 Public Cloud Shell

**Changes:**
- Update all branding references
- Rename tester console to "Full Fidelity Animation Experience Console"
- Update README and documentation
- Update component names and labels

### Tester Console Rename

**Current:** Nikola Tesla Operator's Console™ / Operator Console  
**New:** Full Fidelity Animation Experience Console

**Changes:**
- Rename all console references
- Update UI labels and headers
- Update navigation and routing
- Update documentation

---

## 📋 Extraction Checklist

### Phase 1: Preparation
- [ ] Document all Instrumentation Core components
- [ ] Identify dependencies
- [ ] Create extraction plan
- [ ] Set up new repository structure

### Phase 2: Extraction
- [ ] Extract ReactorCore component
- [ ] Extract Atomic Scoring System
- [ ] Extract State Imaging & Verification
- [ ] Extract Instrumentation APIs
- [ ] Create API client for Octave 2 Public Cloud Shell

### Phase 3: Integration
- [ ] Set up API endpoints in Instrumentation Shell API
- [ ] Configure calls to Octave 2 Public Cloud Shell
- [ ] Test integration
- [ ] Update documentation

### Phase 4: Repository Conversion
- [ ] Update this repository branding to "Octave 2 Public Cloud Shell"
- [ ] Rename tester console to "Full Fidelity Animation Experience Console"
- [ ] Update all references throughout codebase
- [ ] Update README and documentation

---

## 🔗 Integration Points

### Instrumentation Shell API → Octave 2 Public Cloud Shell

**API Calls:**
```typescript
// Instrumentation Shell API calls Octave 2 Public Cloud Shell
const response = await fetch('https://octave-2-public-cloud-shell.vercel.app/api/public-network-shell/operation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'measurement',
    data: measurementData,
  }),
});
```

### Octave 2 Public Cloud Shell → Instrumentation Shell API

**API Endpoints:**
```typescript
// Octave 2 Public Cloud Shell calls Instrumentation Shell API
const response = await fetch('https://instrumentation-shell-api.vercel.app/api/instrumentation/measure', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    submissionHash: hash,
    evaluation: evaluationData,
  }),
});
```

---

## ✅ Status

**Extraction Plan:** ✅ **COMPLETE**  
**Repository Structure:** 📋 **PLANNED**  
**Integration Points:** 📋 **DEFINED**  
**Branding Updates:** 📋 **PENDING**

---

**Last Updated:** January 2025  
**Status:** 📋 **PLANNING**  
**Next Steps:** Begin extraction and repository setup

🌀 **Instrumentation Core Extraction Plan**  
**New Repository:** Instrumentation Shell API  
**This Repository:** Octave 2 Public Cloud Shell  
**Integration:** API-based communication
