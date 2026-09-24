// Real, derived stats computed from actual /api/experiences rows — no mock/fabricated numbers.

const DAY_MS = 24 * 60 * 60 * 1000;

export function statusCounts(experiences) {
  const counts = { total: experiences.length, approved: 0, pending: 0, needsAttention: 0 };
  for (const exp of experiences) {
    if (exp.status === 'Approved') counts.approved += 1;
    else if (exp.status === 'Pending Verification') counts.pending += 1;
    else counts.needsAttention += 1; // Rejected / Changes Requested
  }
  return counts;
}

// Average time (in days) between submission and the last status update, for
// entries that have actually been reviewed. Uses created_at/updated_at, the
// only timestamps the API returns - there's no separate "reviewed at" field.
export function avgReviewDays(experiences) {
  const reviewed = experiences.filter((e) => e.status !== 'Pending Verification' && e.updated_at && e.created_at);
  if (reviewed.length === 0) return null;

  const totalDays = reviewed.reduce((sum, e) => {
    const days = (new Date(e.updated_at) - new Date(e.created_at)) / DAY_MS;
    return sum + Math.max(days, 0);
  }, 0);

  return totalDays / reviewed.length;
}

// Submission volume for each of the last `months` calendar months (oldest first).
export function monthlyTrend(experiences, months = 6) {
  const now = new Date();
  const buckets = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), value: 0 });
  }

  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const exp of experiences) {
    if (!exp.created_at) continue;
    const d = new Date(exp.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (byKey.has(key)) byKey.get(key).value += 1;
  }

  return buckets;
}

export function groupByStudent(experiences) {
  const byStudent = new Map();

  for (const exp of experiences) {
    const key = exp.student_id;
    if (!byStudent.has(key)) {
      byStudent.set(key, {
        id: key,
        name: exp.student_name,
        email: exp.student_email,
        total: 0,
        approved: 0,
        pending: 0,
        other: 0,
      });
    }
    const record = byStudent.get(key);
    record.total += 1;
    if (exp.status === 'Approved') record.approved += 1;
    else if (exp.status === 'Pending Verification') record.pending += 1;
    else record.other += 1;
  }

  return Array.from(byStudent.values())
    .map((s) => ({ ...s, readiness: s.total > 0 ? Math.round((s.approved / s.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);
}

export function relativeDays(dateString) {
  if (!dateString) return '';
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / DAY_MS);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}
