---
description: Implementation plan for user authentication, authorization, and profile management (Phase 1)
---

# 🔐 Paharnama Backend - Authentication Implementation Plan

## 📋 Overview

| Aspect            | Details                          |
| ----------------- | -------------------------------- |
| **Framework**     | NestJS v11                       |
| **Database**      | PostgreSQL with Prisma ORM v7    |
| **Auth Strategy** | JWT with Access + Refresh Tokens |
| **Roles**         | `ADMIN`, `USER`                  |
| **Created**       | 2026-02-01                       |

---

## ✅ Requirements Confirmed

| Feature                            | Status                         |
| ---------------------------------- | ------------------------------ |
| Email Verification on Registration | ✅ Yes                         |
| Password Reset via Email           | ❌ Not in Phase 1              |
| Avatar File Upload                 | ❌ Not needed                  |
| Rate Limiting on Auth Endpoints    | ✅ Yes                         |
| Mountain Routes - Read             | 🌍 Public                      |
| Mountain Routes - Write            | 🔒 Admin Only                  |
| Admin Seeding                      | ✅ Yes (`paharnama@gmail.com`) |

---

## 🏗️ Implementation Steps

### Step 1: Install Required Packages

```bash
# Authentication & JWT
npm install @nestjs/passport passport passport-jwt passport-local @nestjs/jwt

# Security & Validation
npm install bcrypt class-validator class-transformer

# Rate Limiting
npm install @nestjs/throttler

# Email (for verification)
npm install @nestjs-modules/mailer nodemailer handlebars

# Types (dev dependencies)
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt @types/nodemailer
```

### Step 2: Update Prisma Schema

Add the following models to `prisma/schema.prisma`:

```prisma
enum Role {
  ADMIN
  USER
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  role          Role      @default(USER)
  isActive      Boolean   @default(true)
  isVerified    Boolean   @default(false)

  // Profile fields
  firstName     String?
  lastName      String?
  phone         String?

  // Security
  refreshToken  String?
  lastLoginAt   DateTime?

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  emailVerifications EmailVerification[]

  @@map("users")
}

model EmailVerification {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  @@map("email_verifications")
}
```

Then run:

```bash
npx prisma migrate dev --name add_user_auth
```

### Step 3: Environment Variables

Add to `.env`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email Configuration (for verification emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="Paharnama <noreply@paharnama.com>"

# App Configuration
FRONTEND_URL=http://localhost:3000

# Admin Seed
ADMIN_EMAIL=paharnama@gmail.com
ADMIN_PASSWORD=admin123456
```

### Step 4: Create Module Structure

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   └── verify-email.dto.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── local-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   └── decorators/
│       ├── current-user.decorator.ts
│       ├── public.decorator.ts
│       └── roles.decorator.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
├── profile/
│   ├── profile.module.ts
│   ├── profile.controller.ts
│   ├── profile.service.ts
│   └── dto/
│       └── update-profile.dto.ts
├── mail/
│   ├── mail.module.ts
│   ├── mail.service.ts
│   └── templates/
│       └── email-verification.hbs
└── ... (existing modules)
```

### Step 5: Rate Limiting Implementation

Rate limiting will be implemented using `@nestjs/throttler`:

```typescript
// In app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    // ... other modules
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

For auth endpoints specifically:

```typescript
// In auth.controller.ts
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {

  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @Post('login')
  login() { ... }

  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post('register')
  register() { ... }

  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @Post('resend-verification')
  resendVerification() { ... }
}
```

### Step 6: Seed Admin User

Create `prisma/seeds/admin-seed.ts`:

```typescript
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'paharnama@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123456';

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
        isVerified: true,
        firstName: 'Paharnama',
        lastName: 'Admin',
      },
    });

    console.log(`✅ Admin user created: ${email}`);
  } else {
    console.log(`ℹ️ Admin user already exists: ${email}`);
  }
}

seedAdmin()
  .catch((e) => {
    console.error('Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "scripts": {
    "seed:admin": "ts-node prisma/seeds/admin-seed.ts"
  }
}
```

---

## 🔌 API Endpoints Summary

### Authentication (`/auth`)

| Method | Endpoint                    | Description               | Rate Limit | Access        |
| ------ | --------------------------- | ------------------------- | ---------- | ------------- |
| `POST` | `/auth/register`            | Register new user         | 5/min      | Public        |
| `POST` | `/auth/login`               | Login with email/password | 3/min      | Public        |
| `POST` | `/auth/verify-email`        | Verify email with token   | 10/min     | Public        |
| `POST` | `/auth/resend-verification` | Resend verification email | 3/min      | Public        |
| `POST` | `/auth/refresh`             | Get new access token      | 10/min     | Public        |
| `POST` | `/auth/logout`              | Invalidate refresh token  | Default    | Authenticated |
| `POST` | `/auth/change-password`     | Change password           | 3/min      | Authenticated |

### Profile (`/profile`)

| Method   | Endpoint   | Description              | Access        |
| -------- | ---------- | ------------------------ | ------------- |
| `GET`    | `/profile` | Get current user profile | Authenticated |
| `PATCH`  | `/profile` | Update profile           | Authenticated |
| `DELETE` | `/profile` | Deactivate account       | Authenticated |

### User Management (`/users`) - Admin Only

| Method   | Endpoint     | Description                | Access |
| -------- | ------------ | -------------------------- | ------ |
| `GET`    | `/users`     | List all users (paginated) | Admin  |
| `GET`    | `/users/:id` | Get user by ID             | Admin  |
| `POST`   | `/users`     | Create new user            | Admin  |
| `PATCH`  | `/users/:id` | Update user                | Admin  |
| `DELETE` | `/users/:id` | Delete user                | Admin  |

### Mountains (`/mountains`) - Updated Access

| Method   | Endpoint         | Description          | Access |
| -------- | ---------------- | -------------------- | ------ |
| `GET`    | `/mountains`     | List all mountains   | Public |
| `GET`    | `/mountains/:id` | Get mountain details | Public |
| `POST`   | `/mountains`     | Create mountain      | Admin  |
| `PATCH`  | `/mountains/:id` | Update mountain      | Admin  |
| `DELETE` | `/mountains/:id` | Delete mountain      | Admin  |

---

## 🔐 Security Features

| Feature                | Implementation                            |
| ---------------------- | ----------------------------------------- |
| **Password Hashing**   | bcrypt with 10 salt rounds                |
| **Access Token**       | JWT, 15 min expiry                        |
| **Refresh Token**      | JWT, 7 days expiry, stored in DB          |
| **Token Rotation**     | New refresh token on each refresh         |
| **Rate Limiting**      | Throttler on auth endpoints               |
| **Email Verification** | UUID token with 24h expiry                |
| **Input Validation**   | class-validator on all DTOs               |
| **Role Guards**        | Custom RolesGuard with @Roles() decorator |

---

## 📧 Email Templates

### Email Verification Template

```handlebars
<!-- templates/email-verification.hbs -->

<html>
  <head>
    <style>
      .container {
        max-width: 600px;
        margin: 0 auto;
        font-family: Arial;
      }
      .button {
        background: #4f46e5;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
      }
    </style>
  </head>
  <body>
    <div class='container'>
      <h1>Welcome to Paharnama! 🏔️</h1>
      <p>Hi {{firstName}},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <p><a href='{{verificationUrl}}' class='button'>Verify Email</a></p>
      <p>Or copy this link: {{verificationUrl}}</p>
      <p>This link expires in 24 hours.</p>
      <p>Best regards,<br />The Paharnama Team</p>
    </div>
  </body>
</html>
```

---

## 📊 Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Login Response

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "USER",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": true
    }
  },
  "message": "Login successful"
}
```

---

## 🚀 Implementation Order

// turbo-all

1. **Install packages** - Run npm install command
2. **Update Prisma schema** - Add User and EmailVerification models
3. **Run migration** - Apply database changes
4. **Create mail module** - Email service and templates
5. **Create auth module** - Core authentication logic
6. **Create users module** - Admin user management
7. **Create profile module** - User profile management
8. **Update mountains module** - Add role-based guards
9. **Update app.module** - Global guards and throttler
10. **Seed admin user** - Create initial admin account
11. **Test all endpoints** - Verify functionality

---

## 📝 Notes

- All passwords must be at least 8 characters
- Email verification links expire in 24 hours
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Admin email: `paharnama@gmail.com`
- Rate limits reset based on IP address
