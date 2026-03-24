// IP API for Cloudflare Workers.

const SERVICE_NAME = 'ip.api.airat.top';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow'
};

function getClientIp(request) {
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  return '0.0.0.0';
}

function normalizeValue(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value === 'number' && Number.isNaN(value)) {
    return null;
  }

  return value;
}

function buildResponsePayload(request) {
  const cf = request.cf || {};
  const ip = getClientIp(request);

  return {
    ip,
    network: {
      asn: normalizeValue(cf.asn),
      asOrganization: normalizeValue(cf.asOrganization),
      colo: normalizeValue(cf.colo)
    },
    location: {
      city: normalizeValue(cf.city),
      region: normalizeValue(cf.region),
      regionCode: normalizeValue(cf.regionCode),
      postalCode: normalizeValue(cf.postalCode),
      country: normalizeValue(cf.country),
      continent: normalizeValue(cf.continent),
      latitude: normalizeValue(cf.latitude),
      longitude: normalizeValue(cf.longitude),
      timezone: normalizeValue(cf.timezone)
    },
    connection: {
      httpProtocol: normalizeValue(cf.httpProtocol),
      tlsVersion: normalizeValue(cf.tlsVersion),
      tlsCipher: normalizeValue(cf.tlsCipher),
      clientTcpRtt: normalizeValue(cf.clientTcpRtt)
    },
    request: {
      method: request.method,
      userAgent: normalizeValue(request.headers.get('user-agent')),
      acceptLanguage: normalizeValue(request.headers.get('accept-language'))
    },
    service: SERVICE_NAME,
    generatedAt: new Date().toISOString()
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS
    }
  });
}

function textResponse(text, status = 200) {
  return new Response(text, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...CORS_HEADERS
    }
  });
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toXml(value, key = 'item', indent = '') {
  if (value === null) {
    return `${indent}<${key} />`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${indent}<${key} />`;
    }

    const rows = value
      .map((entry) => toXml(entry, 'item', `${indent}  `))
      .join('\n');

    return `${indent}<${key}>\n${rows}\n${indent}</${key}>`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return `${indent}<${key} />`;
    }

    const rows = entries
      .map(([childKey, childValue]) => toXml(childValue, childKey, `${indent}  `))
      .join('\n');

    return `${indent}<${key}>\n${rows}\n${indent}</${key}>`;
  }

  return `${indent}<${key}>${xmlEscape(value)}</${key}>`;
}

function xmlResponse(data, status = 200) {
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(data, 'response')}`;

  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      ...CORS_HEADERS
    }
  });
}

function yamlEscapeString(value) {
  return String(value).replace(/'/g, "''");
}

function toYaml(value, indent = 0) {
  const prefix = '  '.repeat(indent);

  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }

    return value
      .map((entry) => {
        if (entry === null || typeof entry !== 'object') {
          return `${prefix}- ${toYaml(entry, 0)}`;
        }

        const nested = toYaml(entry, indent + 1);
        return `${prefix}-\n${nested}`;
      })
      .join('\n');
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return '{}';
    }

    return entries
      .map(([key, child]) => {
        if (child === null || typeof child !== 'object') {
          return `${prefix}${key}: ${toYaml(child, 0)}`;
        }

        const nested = toYaml(child, indent + 1);
        return `${prefix}${key}:\n${nested}`;
      })
      .join('\n');
  }

  if (typeof value === 'string') {
    return `'${yamlEscapeString(value)}'`;
  }

  return String(value);
}

function yamlResponse(data, status = 200) {
  const body = toYaml(data);

  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/yaml; charset=utf-8',
      ...CORS_HEADERS
    }
  });
}

function healthPayload() {
  return {
    status: 'ok'
  };
}

function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (!['GET', 'HEAD'].includes(request.method)) {
      return textResponse('Method Not Allowed', 405);
    }

    const url = new URL(request.url);
    const path = normalizePath(url.pathname);

    if (path === '/robots.txt') {
      return textResponse('User-agent: *\nDisallow: /\n');
    }

    if (path === '/health') {
      return jsonResponse(healthPayload());
    }

    if (path === '/text') {
      return textResponse(getClientIp(request));
    }

    const payload = buildResponsePayload(request);

    if (path === '/' || path === '/json') {
      return jsonResponse(payload);
    }

    if (path === '/xml') {
      return xmlResponse(payload);
    }

    if (path === '/yaml') {
      return yamlResponse(payload);
    }

    return textResponse('Not Found', 404);
  }
};
