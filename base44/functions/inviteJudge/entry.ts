import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const MAX_JUDGES = 5;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').toString().trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return Response.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    const judges = await base44.asServiceRole.entities.User.filter({ role: 'judge' });
    const count = (judges || []).length;
    if (count >= MAX_JUDGES) {
      return Response.json(
        { error: `Maximum of ${MAX_JUDGES} judges reached.`, count },
        { status: 409 }
      );
    }

    await base44.users.inviteUser(email, 'judge');
    return Response.json({ ok: true, email, judges: count + 1, max: MAX_JUDGES });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}