async function runTests() {
  const baseUrl = 'http://localhost:3000';
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
    }
  }

  console.log('--- TEST 1: Check Public Navigation for Admin links ---');
  const homeHtml = await (await fetch(`${baseUrl}/`)).text();
  assert(!homeHtml.includes('Admin Dashboard ⚡'), 'Footer does not contain Admin Dashboard ⚡ link');
  assert(!homeHtml.includes('href="/admin"'), 'Homepage HTML does not contain public links to /admin');
  assert(!homeHtml.includes('Shop Collections'), 'Footer does not contain Shop Collections column');
  assert(!homeHtml.includes('Customer Support'), 'Footer does not contain Customer Support column');
  assert(!homeHtml.includes('Join VIP Glow Club'), 'Footer does not contain Join VIP Glow Club column');
  assert(homeHtml.includes('EXTRA WHITENING &amp; GLOW') || homeHtml.includes('EXTRA WHITENING & GLOW'), 'Footer contains centered EXTRA WHITENING & GLOW');
  assert(homeHtml.includes('Follow @khushi_skinwhitening_cream_'), 'Footer contains Instagram Follow button');

  console.log('\n--- TEST 2: Unauthenticated Access to /admin and /admin/dashboard ---');
  const adminRes = await fetch(`${baseUrl}/admin`, { redirect: 'manual' });
  assert(adminRes.status === 307 || adminRes.status === 302, `/admin redirects unauthenticated user (status ${adminRes.status})`);
  assert(adminRes.headers.get('location')?.includes('/admin/login'), `/admin redirects to /admin/login (location: ${adminRes.headers.get('location')})`);

  const dashboardRes = await fetch(`${baseUrl}/admin/dashboard`, { redirect: 'manual' });
  assert(dashboardRes.status === 307 || dashboardRes.status === 302, `/admin/dashboard redirects unauthenticated user (status ${dashboardRes.status})`);
  assert(dashboardRes.headers.get('location')?.includes('/admin/login'), `/admin/dashboard redirects to /admin/login`);

  console.log('\n--- TEST 3: Direct Access to /admin/login ---');
  const loginRes = await fetch(`${baseUrl}/admin/login`);
  assert(loginRes.status === 200, `/admin/login returns 200 OK`);
  const loginHtml = await loginRes.text();
  assert(loginHtml.includes('Administrative Portal') || loginHtml.includes('Admin ID'), '/admin/login contains Admin Portal UI');

  console.log('\n--- TEST 4: Protect Admin API Endpoints from Unauthorized Access ---');
  const productPostRes = await fetch(`${baseUrl}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product: { id: 'fake', name: 'Fake' } }),
  });
  assert(productPostRes.status === 401, 'POST /api/products returns 401 Unauthorized without session');

  const categoryPostRes = await fetch(`${baseUrl}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: { id: 'fake', name: 'Fake' } }),
  });
  assert(categoryPostRes.status === 401, 'POST /api/categories returns 401 Unauthorized without session');

  const uploadPostRes = await fetch(`${baseUrl}/api/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: 'test.jpg', data: '123' }),
  });
  assert(uploadPostRes.status === 401, 'POST /api/upload returns 401 Unauthorized without session');

  console.log('\n--- TEST 5: Admin Login with Wrong Credentials ---');
  const wrongLoginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'khushi_admin', password: 'wrong_password_123' }),
  });
  assert(wrongLoginRes.status === 401, 'Wrong password returns 401 status');
  const wrongData = await wrongLoginRes.json();
  assert(wrongData.success === false, 'Wrong login response indicates failure');

  console.log('\n--- TEST 6: Admin Login with Correct Credentials ---');
  const validLoginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'khushi_admin', password: 'CHANGE_THIS_SECURE_PASSWORD' }),
  });
  assert(validLoginRes.status === 200, 'Valid login returns 200 status');
  const cookieHeader = validLoginRes.headers.get('set-cookie');
  assert(cookieHeader && cookieHeader.includes('kg_admin_session'), 'Admin login sets kg_admin_session HTTP-only cookie');

  const sessionCookie = cookieHeader ? cookieHeader.split(';')[0] : '';

  console.log('\n--- TEST 7: Authenticated Access to /api/admin/me & /admin ---');
  const meRes = await fetch(`${baseUrl}/api/admin/me`, {
    headers: { Cookie: sessionCookie },
  });
  assert(meRes.status === 200, 'GET /api/admin/me returns 200 with valid session');
  const meData = await meRes.json();
  assert(meData.admin?.username === 'khushi_admin', 'Admin session payload contains correct username');

  const authedAdminRes = await fetch(`${baseUrl}/admin`, {
    headers: { Cookie: sessionCookie },
    redirect: 'manual',
  });
  assert(authedAdminRes.status === 200, 'Authenticated admin can access /admin directly');

  console.log('\n--- TEST 8: Authenticated Admin Visiting /admin/login redirects to /admin ---');
  const authedLoginVisit = await fetch(`${baseUrl}/admin/login`, {
    headers: { Cookie: sessionCookie },
    redirect: 'manual',
  });
  assert(authedLoginVisit.status === 307 || authedLoginVisit.status === 302, 'Authenticated admin visiting /admin/login is redirected');
  assert(authedLoginVisit.headers.get('location')?.endsWith('/admin'), 'Redirects to /admin');

  console.log('\n--- TEST 9: Admin Logout ---');
  const logoutRes = await fetch(`${baseUrl}/api/admin/logout`, {
    method: 'POST',
    headers: { Cookie: sessionCookie },
  });
  assert(logoutRes.status === 200, 'POST /api/admin/logout returns 200 OK');
  const logoutCookie = logoutRes.headers.get('set-cookie');
  assert(logoutCookie && logoutCookie.includes('Max-Age=0'), 'Logout clears session cookie (Max-Age=0)');

  console.log('\n--- TEST 10: Access After Logout ---');
  const afterLogoutRes = await fetch(`${baseUrl}/admin`, {
    headers: { Cookie: 'kg_admin_session=' },
    redirect: 'manual',
  });
  assert(afterLogoutRes.status === 307 || afterLogoutRes.status === 302, 'Access to /admin after logout redirects to /admin/login');

  console.log(`\n========================================`);
  console.log(`SUMMARY: ${passed} / ${total} TESTS PASSED`);
  console.log(`========================================`);
  if (passed !== total) process.exit(1);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
