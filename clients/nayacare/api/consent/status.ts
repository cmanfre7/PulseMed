/**
 * NAY-9: Consent Status API
 * GET /api/consent/status?email=user@example.com
 *
 * Checks if a user needs to accept consent based on:
 * 1. First-time user (no consent record)
 * 2. TOS/Privacy Policy version has been updated since last acceptance
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Current legal document versions - bump these when docs are updated
export const LEGAL_VERSIONS = {
  TOS_VERSION: '1.0.0',
  PRIVACY_POLICY_VERSION: '1.0.0',
  CONSENT_VERSION: '1.0.0' // Composite version
};

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  if (!HUBSPOT_ACCESS_TOKEN) {
    console.error('HUBSPOT_ACCESS_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
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
        properties: [
          'consent_accepted',
          'consent_accepted_date',
          'consent_version_accepted',
          'tos_version_accepted',
          'privacy_policy_version_accepted'
        ],
        limit: 1
      })
    });

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      console.error('HubSpot search error:', error);
      return res.status(500).json({ error: 'Failed to check consent status' });
    }

    const searchData = await searchResponse.json();

    // If contact doesn't exist, they need consent (first-time user)
    if (!searchData.results || searchData.results.length === 0) {
      return res.status(200).json({
        needsConsent: true,
        reason: 'first_time_user',
        currentVersions: LEGAL_VERSIONS
      });
    }

    const contact = searchData.results[0];
    const properties = contact.properties;

    // If no consent record, they need to accept
    if (!properties.consent_accepted || properties.consent_accepted !== 'true') {
      return res.status(200).json({
        needsConsent: true,
        reason: 'no_consent_record',
        currentVersions: LEGAL_VERSIONS
      });
    }

    // Check if versions match current versions
    const acceptedConsentVersion = properties.consent_version_accepted;
    const acceptedTosVersion = properties.tos_version_accepted;
    const acceptedPrivacyVersion = properties.privacy_policy_version_accepted;

    const versionsMatch =
      acceptedConsentVersion === LEGAL_VERSIONS.CONSENT_VERSION &&
      acceptedTosVersion === LEGAL_VERSIONS.TOS_VERSION &&
      acceptedPrivacyVersion === LEGAL_VERSIONS.PRIVACY_POLICY_VERSION;

    if (!versionsMatch) {
      return res.status(200).json({
        needsConsent: true,
        reason: 'version_mismatch',
        currentVersions: LEGAL_VERSIONS,
        acceptedVersions: {
          consentVersion: acceptedConsentVersion || 'none',
          tosVersion: acceptedTosVersion || 'none',
          privacyPolicyVersion: acceptedPrivacyVersion || 'none'
        }
      });
    }

    // User has accepted current version - no consent needed
    return res.status(200).json({
      needsConsent: false,
      reason: 'current_version_accepted',
      currentVersions: LEGAL_VERSIONS,
      acceptedDate: properties.consent_accepted_date || null
    });

  } catch (error: any) {
    console.error('Error checking consent status:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
