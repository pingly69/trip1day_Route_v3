/**
 * ApiClient - REST API client wrapper replacing google.script.run
 */
const ApiClient = {
  _token: () => sessionStorage.getItem('admin_token') || '',

  async _handle(res) {
    let json;
    try {
      json = await res.json();
    } catch {
      throw new Error(`การเชื่อมต่อขัดข้อง (HTTP ${res.status})`);
    }

    if (json && json.status === 'success') {
      return json;
    } else {
      const msg = (json && json.message) || `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (HTTP ${res.status})`;
      throw new Error(msg);
    }
  },

  async get(path) {
    const res = await fetch(path, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Admin-Token': this._token(),
      },
    });
    return this._handle(res);
  },

  async post(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Admin-Token': this._token(),
      },
      body: JSON.stringify(body),
    });
    return this._handle(res);
  },

  async put(path, body) {
    const res = await fetch(path, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Admin-Token': this._token(),
      },
      body: JSON.stringify(body),
    });
    return this._handle(res);
  },

  async del(path) {
    const res = await fetch(path, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'X-Admin-Token': this._token(),
      },
    });
    return this._handle(res);
  },

  // Backward-compatible method mapper for OLD_UI method names
  async call(funcName, payload) {
    switch (funcName) {
      case 'api_verifyPasscode':
        return this.post('/api/auth', { passcode: payload });
      case 'api_getMasterSites':
        return this.get('/api/sites');
      case 'api_saveMasterSite':
        return payload.isEdit
          ? this.put(`/api/sites/${encodeURIComponent(payload.Site_ID)}`, payload)
          : this.post('/api/sites', payload);
      case 'api_deleteMasterSite':
        return this.del(`/api/sites/${encodeURIComponent(payload)}`);
      case 'api_getMasterRoutes':
        return this.get('/api/routes');
      case 'api_saveMasterRoute':
        return payload.Route_ID
          ? this.put(`/api/routes/${encodeURIComponent(payload.Route_ID)}`, payload)
          : this.post('/api/routes', payload);
      case 'api_deleteMasterRoute':
        return this.del(`/api/routes/${encodeURIComponent(payload)}`);
      case 'api_getUsers':
        return this.get('/api/users');
      case 'api_saveUser':
        return payload.isEdit
          ? this.put(`/api/users/${encodeURIComponent(payload.Line_uid)}`, payload)
          : this.post('/api/users', payload);
      case 'api_deleteUser':
        return this.del(`/api/users/${encodeURIComponent(payload)}`);
      case 'api_getDashboardTransactions': {
        const p = new URLSearchParams();
        if (payload) {
          if (payload.startDate_CreatedAt) p.set('startCreatedAt', payload.startDate_CreatedAt);
          if (payload.endDate_CreatedAt) p.set('endCreatedAt', payload.endDate_CreatedAt);
          if (payload.startDate_ReqDate) p.set('startReqDate', payload.startDate_ReqDate);
          if (payload.endDate_ReqDate) p.set('endReqDate', payload.endDate_ReqDate);
          if (payload.startDate_Approve) p.set('startApprove', payload.startDate_Approve);
          if (payload.endDate_Approve) p.set('endApprove', payload.endDate_Approve);
          if (payload.reqName) p.set('reqName', payload.reqName);
          if (payload.plateNo) p.set('plateNo', payload.plateNo);
          if (payload.siteId) p.set('siteId', payload.siteId);
          if (payload.status) p.set('status', payload.status);
        }
        return this.get(`/api/transactions?${p.toString()}`);
      }
      default:
        throw new Error(`Unsupported API function call: ${funcName}`);
    }
  },
};
