import { Env, CONFIG } from './config';
import { getAllSites, saveSite, deleteSite } from './services/siteService';
import { getAllRoutes, saveRoute, deleteRoute } from './services/routeService';
import { getAllUsers, saveUser, deleteUser } from './services/userService';
import { getTransactions } from './services/transactionService';

// Helper for JSON Response with CORS
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    },
  });
}

// Compute SHA-256 hash string
async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper to get expected token hash
async function getExpectedAuthToken(env: Env): Promise<string> {
  const configuredPass = env.admin_password || env.ADMIN_PASSWORD;
  if (configuredPass) {
    return await sha256(configuredPass);
  }
  return env.ADMIN_PASSCODE_HASH || CONFIG.DEFAULT_PASSCODE_HASH;
}

// Check Passcode Auth
async function handleAuth(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json<{ passcode?: string }>();
    const passcode = body.passcode ?? '';
    if (!passcode) {
      return jsonResponse({ status: 'error', message: 'กรุณาระบุรหัสผ่าน' }, 400);
    }

    const configuredPass = env.admin_password || env.ADMIN_PASSWORD;
    const hashed = await sha256(passcode);
    const expectedHash = await getExpectedAuthToken(env);

    // Compare with configured admin_password variable
    const isValid = configuredPass ? passcode === configuredPass : hashed === expectedHash;

    if (isValid) {
      return jsonResponse({
        status: 'success',
        token: expectedHash,
      });
    } else {
      return jsonResponse({ status: 'error', message: 'รหัสผ่านแอดมินไม่ถูกต้อง' }, 401);
    }
  } catch {
    return jsonResponse({ status: 'error', message: 'รูปแบบข้อมูลไม่ถูกต้อง' }, 400);
  }
}

// Middleware: Validate X-Admin-Token
async function requireAuth(request: Request, env: Env): Promise<Response | null> {
  const token = request.headers.get('X-Admin-Token');
  const expectedHash = await getExpectedAuthToken(env);

  if (!token || token !== expectedHash) {
    return jsonResponse({ status: 'error', message: 'Unauthorized / รหัสผ่านหมดอายุหรือยังไม่ได้เข้าสู่ระบบ' }, 401);
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // Log request (per Spec v3 Section 0.6)
    console.log(`[${new Date().toISOString()}] ${method} ${path}`);

    // 1. Handle CORS Preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        },
      });
    }

    // 2. Handle Static Assets (Frontend)
    if (!path.startsWith('/api/')) {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response('Trip1Day Admin Service Running. Frontend assets are located in ./public', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // 3. API Routes Handling
    try {
      // 3.1 Auth Endpoint (Public)
      if (path === '/api/auth' && method === 'POST') {
        return await handleAuth(request, env);
      }

      // 3.2 Require Auth for all other /api/* endpoints
      const authError = await requireAuth(request, env);
      if (authError) return authError;

      const db = env.IMG_DB || env.DB!;

      // 3.3 Sites Endpoints (/api/sites)
      if (path === '/api/sites') {
        if (method === 'GET') {
          const data = await getAllSites(db);
          return jsonResponse({ status: 'success', data });
        }
        if (method === 'POST') {
          const payload = await request.json<any>();
          const siteId = await saveSite(db, payload);
          return jsonResponse({ status: 'success', data: { Site_ID: siteId } });
        }
      }

      if (path.startsWith('/api/sites/')) {
        const siteId = decodeURIComponent(path.slice('/api/sites/'.length));
        if (method === 'PUT') {
          const payload = await request.json<any>();
          payload.isEdit = true;
          payload.Site_ID = siteId;
          await saveSite(db, payload);
          return jsonResponse({ status: 'success', data: { Site_ID: siteId } });
        }
        if (method === 'DELETE') {
          await deleteSite(db, siteId);
          return jsonResponse({ status: 'success', message: 'ลบ Site สำเร็จ' });
        }
      }

      // 3.4 Routes Endpoints (/api/routes)
      if (path === '/api/routes') {
        if (method === 'GET') {
          const data = await getAllRoutes(db);
          return jsonResponse({ status: 'success', data });
        }
        if (method === 'POST') {
          const payload = await request.json<any>();
          const routeId = await saveRoute(db, payload);
          return jsonResponse({ status: 'success', data: { Route_ID: routeId } });
        }
      }

      if (path.startsWith('/api/routes/')) {
        const routeId = decodeURIComponent(path.slice('/api/routes/'.length));
        if (method === 'PUT') {
          const payload = await request.json<any>();
          payload.Route_ID = routeId;
          await saveRoute(db, payload);
          return jsonResponse({ status: 'success', data: { Route_ID: routeId } });
        }
        if (method === 'DELETE') {
          await deleteRoute(db, routeId);
          return jsonResponse({ status: 'success', message: 'ลบเส้นทางสำเร็จ' });
        }
      }

      // 3.5 Users Profile Endpoints (/api/users)
      if (path === '/api/users') {
        if (method === 'GET') {
          const data = await getAllUsers(db);
          return jsonResponse({ status: 'success', data });
        }
        if (method === 'POST') {
          const payload = await request.json<any>();
          payload.isEdit = false;
          const lineUid = await saveUser(db, payload);
          return jsonResponse({ status: 'success', data: { Line_uid: lineUid } });
        }
      }

      if (path.startsWith('/api/users/')) {
        const lineUid = decodeURIComponent(path.slice('/api/users/'.length));
        if (method === 'PUT') {
          const payload = await request.json<any>();
          payload.isEdit = true;
          payload.Line_uid = lineUid;
          await saveUser(db, payload);
          return jsonResponse({ status: 'success', data: { Line_uid: lineUid } });
        }
        if (method === 'DELETE') {
          await deleteUser(db, lineUid);
          return jsonResponse({ status: 'success', message: 'ลบข้อมูลผู้ใช้งานสำเร็จ' });
        }
      }

      // 3.6 Transactions Endpoint (/api/transactions)
      if (path === '/api/transactions' && method === 'GET') {
        const filters = {
          startCreatedAt: url.searchParams.get('startCreatedAt') || undefined,
          endCreatedAt: url.searchParams.get('endCreatedAt') || undefined,
          startReqDate: url.searchParams.get('startReqDate') || undefined,
          endReqDate: url.searchParams.get('endReqDate') || undefined,
          startApprove: url.searchParams.get('startApprove') || undefined,
          endApprove: url.searchParams.get('endApprove') || undefined,
          reqName: url.searchParams.get('reqName') || undefined,
          plateNo: url.searchParams.get('plateNo') || undefined,
          approver: url.searchParams.get('approver') || undefined,
          siteId: url.searchParams.get('siteId') || undefined,
          status: url.searchParams.get('status') || undefined,
        };

        const data = await getTransactions(db, filters);
        return jsonResponse({ status: 'success', data });
      }

      return jsonResponse({ status: 'error', message: 'Endpoint Not Found' }, 404);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      return jsonResponse({ status: 'error', message }, 400);
    }
  },
};
