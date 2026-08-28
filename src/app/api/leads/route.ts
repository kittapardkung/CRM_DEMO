import { NextRequest, NextResponse } from 'next/server';
import { Lead } from '@/lib/data/types';

/**
 * Lead intake stub (master prompt §21 / §25). No CRM is connected yet —
 * per the brief, submissions land on a success screen only for now — so
 * this just validates, assigns an id, and logs. Swapping in a real CRM
 * later means changing this one handler, not any form component.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Partial<Lead> | null;

  if (!body || !body.customerName || !body.phoneNumber) {
    return NextResponse.json({ ok: false, error: 'ต้องระบุชื่อและเบอร์โทรศัพท์' }, { status: 400 });
  }

  const lead: Lead = {
    leadId: 'LEAD-' + Date.now().toString(36).toUpperCase(),
    createdAt: new Date().toISOString(),
    leadSource: body.leadSource || 'website',
    pageUrl: body.pageUrl || '/',
    note: body.note,
    customerName: body.customerName,
    phoneNumber: body.phoneNumber,
    interestedModel: body.interestedModel || '',
    variant: body.variant,
    preferredColor: body.preferredColor,
    purchaseType: body.purchaseType,
    vehiclePrice: body.vehiclePrice,
    downPayment: body.downPayment,
    loanTerm: body.loanTerm,
    monthlyPayment: body.monthlyPayment,
    selectedAccessories: body.selectedAccessories,
    accessoriesTotal: body.accessoriesTotal,
    utmSource: body.utmSource,
    utmMedium: body.utmMedium,
    utmCampaign: body.utmCampaign,
    utmContent: body.utmContent,
    utmTerm: body.utmTerm,
  };

  // TODO: forward `lead` to the dealer's CRM once an endpoint is confirmed.
  console.log('[lead:test_drive]', lead);

  return NextResponse.json({ ok: true, leadId: lead.leadId });
}
