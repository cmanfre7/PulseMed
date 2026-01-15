/**
 * NAY-9: Consent Acceptance API
 * POST /api/consent/accept
 * Body: { email, tosVersion, privacyPolicyVersion, consentVersion }
 *
 * Records consent acceptance in HubSpot contact record for HIPAA compliance
 * Stores: acceptance timestamp, IP address (if available), version accepted
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, tosVersion, privacyPolicyVersion, consentVersion } = req.body;

  // Validation
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!tosVersion || !privacyPolicyVersion || !consentVersion) {
    return res.status(400).json({
      error: 'All version fields are required (tosVersion, privacyPolicyVersion, consentVersion)'
    });
  }

  if (!HUBSPOT_ACCESS_TOKEN) {
    console.error('HUBSPOT_ACCESS_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Get client IP for audit logging (HIPAA compliance)
    const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const consentAcceptedDate = new Date().toISOString();

    // Search for contact by email
    const searchUrl = `https://api.hubapi.com/crm/v3/objects/contacts/search`;
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email.toLowerCase()
          }]
        }],
        properties: ['email'],
        limit: 1
      })
    });

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      console.error('HubSpot search error:', error);
      return res.status(500).json({ error: 'Failed to find contact' });
    }

    const searchData = await searchResponse.json();
    let contactId: string;

    // If contact doesn't exist, create it
    if (!searchData.results || searchData.results.length === 0) {
      console.log(`Creating new contact for ${email}`);

      const createUrl = 'https://api.hubapi.com/crm/v3/objects/contacts';
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            email: email.toLowerCase(),
            consent_accepted: 'true',
            consent_accepted_date: consentAcceptedDate,
            consent_version_accepted: consentVersion,
            tos_version_accepted: tosVersion,
            privacy_policy_version_accepted: privacyPolicyVersion
          }
        })
      });

      if (!createResponse.ok) {
        const error = await createResponse.text();
        console.error('HubSpot contact creation error:', error);
        return res.status(500).json({ error: 'Failed to create contact' });
      }

      const createData = await createResponse.json();
      contactId = createData.id;
      console.log(`✅ Created new contact ${contactId} with consent acceptance`);

    } else {
      // Update existing contact
      contactId = searchData.results[0].id;
      console.log(`Updating consent for existing contact ${contactId}`);

      const updateUrl = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            consent_accepted: 'true',
            consent_accepted_date: consentAcceptedDate,
            consent_version_accepted: consentVersion,
            tos_version_accepted: tosVersion,
            privacy_policy_version_accepted: privacyPolicyVersion
          }
        })
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.text();
        console.error('HubSpot contact update error:', error);
        return res.status(500).json({ error: 'Failed to update consent' });
      }

      console.log(`✅ Updated consent for contact ${contactId}`);
    }

    // Add audit log note to contact timeline (HIPAA compliance)
    try {
      const noteUrl = 'https://api.hubapi.com/crm/v3/objects/notes';
      const noteResponse = await fetch(noteUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            hs_timestamp: consentAcceptedDate,
            hs_note_body: `Consent Accepted (HIPAA Audit Log)\n\n` +
              `Timestamp: ${consentAcceptedDate}\n` +
              `TOS Version: ${tosVersion}\n` +
              `Privacy Policy Version: ${privacyPolicyVersion}\n` +
              `Consent Version: ${consentVersion}\n` +
              `IP Address: ${clientIp}\n` +
              `User Agent: ${req.headers['user-agent'] || 'unknown'}`
          },
          associations: [{
            to: { id: contactId },
            types: [{
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 202 // Note to Contact association
            }]
          }]
        })
      });

      if (noteResponse.ok) {
        console.log(`✅ Added audit log note to contact timeline`);
      } else {
        console.warn('⚠️  Failed to add audit log note (non-critical)');
      }
    } catch (noteError) {
      console.warn('⚠️  Audit log note failed (non-critical):', noteError);
    }

    return res.status(200).json({
      success: true,
      contactId,
      acceptedDate: consentAcceptedDate,
      versions: {
        tosVersion,
        privacyPolicyVersion,
        consentVersion
      }
    });

  } catch (error: any) {
    console.error('Error recording consent acceptance:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
