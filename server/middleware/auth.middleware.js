/**
 * auth.middleware.js
 *
 * verifyToken — reads the Bearer token from Authorization header,
 * verifies it with JWT_SECRET, and attaches the full decoded payload
 * to req.user: { id, name, email, role, iat, exp }
 *
 * Error responses:
 *   401 NO_TOKEN        — Authorization header absent
 *   401 TOKEN_EXPIRED   — valid signature but past exp
 *   401 TOKEN_INVALID   — bad signature, malformed, or any other JWT error
 *   500 SECRET_MISSING  — JWT_SECRET not configured (should never reach prod)
 */
import jwt from "jsonwebtoken";

const log = (msg) =>
  console.log(`${new Date().toISOString()} [auth.middleware] ${msg}`);

export const verifyToken = (req, res, next) => {
  /* ── Guard: secret must be present ─────────────────────────────────── */
  if (!process.env.JWT_SECRET) {
    console.error("[auth.middleware] ❌ JWT_SECRET is not set — cannot verify tokens");
    return res.status(500).json({
      code:    "SECRET_MISSING",
      message: "Authentication is not configured on this server.",
    });
  }

  /* ── Extract token from "Authorization: Bearer <token>" ────────────── */
  const authHeader = req.headers["authorization"] || req.headers["Authorization"] || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      code:    "NO_TOKEN",
      message: "Authentication required. Please log in.",
    });
  }

  const token = authHeader.slice(7).trim(); // remove "Bearer "
  if (!token) {
    return res.status(401).json({
      code:    "NO_TOKEN",
      message: "Authentication token is empty.",
    });
  }

  /* ── Verify ─────────────────────────────────────────────────────────── */
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach full payload so downstream handlers have name, email, role
    req.user = {
      id:    decoded.id,
      name:  decoded.name  ?? null,
      email: decoded.email ?? null,
      role:  decoded.role  ?? "student",
    };

    log(`✓ Token valid — user ${req.user.id} (${req.user.role})`);
    return next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      log(`Token expired — exp: ${err.expiredAt}`);
      return res.status(401).json({
        code:    "TOKEN_EXPIRED",
        message: "Your session has expired. Please log in again.",
        expiredAt: err.expiredAt,
      });
    }

    // JsonWebTokenError, NotBeforeError, or anything else
    log(`Token invalid — ${err.name}: ${err.message}`);
    return res.status(401).json({
      code:    "TOKEN_INVALID",
      message: "Invalid authentication token. Please log in again.",
    });
  }
};

/**
 * requireRole(...roles)
 *
 * Optional second-layer middleware — use after verifyToken.
 *
 * Usage:
 *   router.delete("/:id", verifyToken, requireRole("admin"), deleteUser);
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ code: "NO_TOKEN", message: "Not authenticated." });
  }
  if (!roles.includes(req.user.role)) {
    log(`Access denied — user ${req.user.id} has role "${req.user.role}", need [${roles.join(", ")}]`);
    return res.status(403).json({
      code:    "FORBIDDEN",
      message: `Access denied. Required role: ${roles.join(" or ")}.`,
    });
  }
  return next();
};

/**
 * Alias for verifyToken (more semantic naming)
 */
export const authenticateToken = verifyToken;

/**
 * Middleware to require admin role
 * Use after authenticateToken/verifyToken
 */
export const requireAdmin = requireRole("admin");
