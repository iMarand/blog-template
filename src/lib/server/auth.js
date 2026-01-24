import bcrypt from 'bcryptjs';
import { db, schema } from './db/index.js';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// Verify user credentials (supports both admin and author)
export async function verifyUser(username, password) {
    try {
        const user = db
            .select()
            .from(schema.users)
            .where(eq(schema.users.username, username))
            .get();

        if (!user) {
            return null;
        }

        if (!user.active) {
            return { error: 'Account is disabled' };
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return null;
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            displayName: user.displayName || user.username
        };
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}

// Get user by ID
export function getUserById(id) {
    try {
        const user = db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, id))
            .get();

        if (!user) return null;

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            displayName: user.displayName || user.username,
            active: user.active
        };
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

// Check if user is authenticated from session
export function isAuthenticated(cookies) {
    const session = cookies.get('session');
    if (!session) return null;

    try {
        const parsed = JSON.parse(session);
        // Verify user still exists and is active
        const user = getUserById(parsed.id);
        if (!user || !user.active) return null;
        return user;
    } catch {
        return null;
    }
}

// Create session
export function createSession(user) {
    return JSON.stringify({
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName
    });
}

// Generate password reset token
export async function generatePasswordResetToken(email) {
    const user = db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .get();

    if (!user) return null;

    // Delete any existing tokens for this user
    db.delete(schema.passwordResetTokens)
        .where(eq(schema.passwordResetTokens.userId, user.id))
        .run();

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    db.insert(schema.passwordResetTokens).values({
        userId: user.id,
        token: token,
        expiresAt: expiresAt
    }).run();

    return { token, user };
}

// Validate password reset token
export function validatePasswordResetToken(token) {
    const resetToken = db
        .select()
        .from(schema.passwordResetTokens)
        .where(eq(schema.passwordResetTokens.token, token))
        .get();

    if (!resetToken) return null;

    // Check if expired
    const now = new Date();
    if (new Date(resetToken.expiresAt) < now) {
        // Delete expired token
        db.delete(schema.passwordResetTokens)
            .where(eq(schema.passwordResetTokens.id, resetToken.id))
            .run();
        return null;
    }

    return resetToken;
}

// Reset password with token
export async function resetPassword(token, newPassword) {
    const resetToken = validatePasswordResetToken(token);
    if (!resetToken) return false;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.update(schema.users)
        .set({
            passwordHash: hashedPassword,
            updatedAt: new Date()
        })
        .where(eq(schema.users.id, resetToken.userId))
        .run();

    // Delete the used token
    db.delete(schema.passwordResetTokens)
        .where(eq(schema.passwordResetTokens.id, resetToken.id))
        .run();

    return true;
}

// Generate invite token
export function generateInviteToken(email, createdBy) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600000); // 7 days

    db.insert(schema.inviteTokens).values({
        email: email || null,
        token: token,
        createdBy: createdBy,
        expiresAt: expiresAt
    }).run();

    return token;
}

// Validate invite token
export function validateInviteToken(token) {
    const invite = db
        .select()
        .from(schema.inviteTokens)
        .where(eq(schema.inviteTokens.token, token))
        .get();

    if (!invite) return null;

    // Check if already used
    if (invite.usedAt) return null;

    // Check if expired
    const now = new Date();
    if (new Date(invite.expiresAt) < now) return null;

    return invite;
}

// Register author via invite
export async function registerAuthor(token, username, email, password, displayName) {
    const invite = validateInviteToken(token);
    if (!invite) return { error: 'Invalid or expired invite token' };

    // Check if username already exists
    const existingUser = db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, username))
        .get();

    if (existingUser) return { error: 'Username already taken' };

    // Check if email already exists
    if (email) {
        const existingEmail = db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .get();

        if (existingEmail) return { error: 'Email already in use' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db.insert(schema.users).values({
        username: username,
        email: email || invite.email,
        passwordHash: hashedPassword,
        role: 'author',
        displayName: displayName || username,
        active: true
    }).run();

    // Mark invite as used
    db.update(schema.inviteTokens)
        .set({ usedAt: new Date() })
        .where(eq(schema.inviteTokens.id, invite.id))
        .run();

    return {
        success: true,
        userId: result.lastInsertRowid
    };
}

// Get all authors (for admin)
export function getAllAuthors() {
    return db
        .select()
        .from(schema.users)
        .where(eq(schema.users.role, 'author'))
        .all()
        .map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            displayName: u.displayName,
            active: u.active,
            createdAt: u.createdAt
        }));
}

// Toggle author active status
export function toggleAuthorStatus(authorId) {
    const author = db
        .select()
        .from(schema.users)
        .where(and(eq(schema.users.id, authorId), eq(schema.users.role, 'author')))
        .get();

    if (!author) return false;

    db.update(schema.users)
        .set({ active: !author.active })
        .where(eq(schema.users.id, authorId))
        .run();

    return true;
}

// Update user password
export async function updatePassword(userId, currentPassword, newPassword) {
    const user = db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .get();

    if (!user) return { error: 'User not found' };

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) return { error: 'Current password is incorrect' };

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.update(schema.users)
        .set({
            passwordHash: hashedPassword,
            updatedAt: new Date()
        })
        .where(eq(schema.users.id, userId))
        .run();

    return { success: true };
}
