# Explain-a-thon AMA Micro-App

A complete AMA (Ask Me Anything) micro-application built with Next.js 14, TypeScript, Tailwind CSS, and Prisma with SQLite.

## ✅ Implementation Status

All features have been successfully implemented and tested:

### ✅ Phase 1: Setup (COMPLETED)
- ✅ Next.js 14 project with TypeScript and Tailwind CSS
- ✅ Prisma ORM with SQLite database
- ✅ Database schema (AMAs, questions, answers, votes tables)
- ✅ Token generation system

### ✅ Phase 2: Core Features (COMPLETED)
- ✅ Host interface for AMA creation and management
- ✅ Ask interface with 140-character questions and voting
- ✅ Answer interface with 3-bullet format (Core, Steps, Limits)
- ✅ Digest generation and display

### ✅ Phase 3: API Routes (COMPLETED)
- ✅ All necessary API routes for CRUD operations
- ✅ Vote tracking with IP-based deduplication
- ✅ Spam hiding functionality

### ✅ Additional Features (COMPLETED)
- ✅ Token-based access control (no authentication required)
- ✅ Real-time vote counting
- ✅ Read-only digest view
- ✅ Question hiding/showing for hosts
- ✅ Responsive design with Tailwind CSS

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## 📋 How to Use

### 1. Create an AMA
- Visit the homepage at `http://localhost:3000`
- Fill in the AMA title and optional description
- Click "Create AMA" to generate your session

### 2. Host Controls (5 controls as specified)
The host interface provides exactly 5 controls:
1. **Publish AMA** - Make the AMA live for questions
2. **Hide/Show Questions** - Control question visibility
3. **Copy Ask Link** - Share with audience to collect questions
4. **Copy Answer Link** - Share with answerer to provide responses
5. **Copy Digest Link** - Share read-only summary

### 3. Asking Questions
- Use the Ask link to submit questions (140 character limit)
- Vote on existing questions to prioritize them
- IP-based deduplication prevents multiple votes

### 4. Answering Questions
- Use the Answer link to respond to questions
- Each answer requires 3 parts: Core, Steps, Limits
- Questions are sorted by vote count

### 5. Viewing Digest
- Use the Digest link for a read-only summary
- Shows all answered and unanswered questions
- Includes statistics and session overview

## 🏗️ Architecture

### Database Schema
- **AMA**: Stores session info and tokens
- **Question**: Stores questions with vote tracking
- **Answer**: Stores 3-part answers (Core, Steps, Limits)
- **Vote tracking**: IP addresses stored as JSON in Question.voterIPs

### Token System
- **Host Token**: Full management access
- **Ask Token**: Submit and vote on questions
- **Answer Token**: Provide answers to questions
- **Digest Token**: Read-only access

### Key Constraints Met
- ✅ NO user authentication (link-based access only)
- ✅ 140 character hard limit on questions
- ✅ 3 bullet format for answers (Core, Steps, Limits)
- ✅ 5 controls only for host interface
- ✅ No editing after publish
- ✅ Read-only digest
- ✅ IP-based vote deduplication
- ✅ Spam hiding functionality

## 🧪 Testing

The application has been thoroughly tested:
- ✅ All API endpoints functional
- ✅ Frontend interfaces working
- ✅ Token-based access control
- ✅ Vote deduplication
- ✅ Question submission and answering
- ✅ Digest generation

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ama/
│   │   ├── questions/
│   │   ├── answers/
│   │   └── votes/
│   ├── host/[token]/
│   ├── ask/[token]/
│   ├── answer/[token]/
│   ├── digest/[token]/
│   └── page.tsx
├── lib/
│   ├── prisma.ts
│   ├── tokens.ts
│   └── utils.ts
└── prisma/
    └── schema.prisma
```

## 🎯 Success Metrics

All project requirements have been met:
- ✅ Complete AMA workflow implemented
- ✅ Token-based security without authentication
- ✅ Character limits enforced
- ✅ 3-part answer format
- ✅ Vote deduplication working
- ✅ Spam control available
- ✅ Responsive, accessible UI
- ✅ Ready for deployment

The application is production-ready and can be deployed to any Node.js hosting platform that supports Next.js applications.