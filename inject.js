(() => {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    const originalXHRSend = XMLHttpRequest.prototype.send;
  
    XMLHttpRequest.prototype.open = function(method, url) {
      this._url = url;
      return originalXHROpen.apply(this, arguments);
    };
  
    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
      if (!this._headers) this._headers = {};
      this._headers[header.toLowerCase()] = value;
      return originalXHRSetRequestHeader.apply(this, arguments);
    };
  
    XMLHttpRequest.prototype.send = function(body) {
      if (
        this._url &&
        this._url.includes('grade-sheet-web?id=')
      ) {
        console.log('[Intercepted] Blocking original grade-sheet request:', this._url);
  
        const urlObj = new URL(this._url, window.location.origin);
        const id = urlObj.searchParams.get('id');
  
        const authHeader = this._headers && this._headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          console.warn('No bearer token found in intercepted request, allowing original request.');
          return originalXHRSend.apply(this, arguments);
        }
        const token = authHeader;
  
        const fetchHeaders = new Headers({
          'Authorization': token,
          'Accept': 'application/json, text/plain, */*',
          'X-Realm': this._headers['x-realm'] || 'bracu',
        });
  
        fetch(this._url, {
          method: 'GET',
          headers: fetchHeaders,
          credentials: 'include',
        })
          .then(res => {
            if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
            return res.blob();
          })
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            window.location.href = blobUrl; // load PDF in current tab
            console.log(`[Success] Opened grade-sheet PDF with id=${id} in current tab.`);
          })
          .catch(err => {
            console.error('[Error] Fetching grade-sheet PDF:', err);
          });
  
        return; // block original request
      }
  
      return originalXHRSend.apply(this, arguments);
    };
  
    console.log('Interceptor for grade-sheet PDF requests is active.');

  })();
  