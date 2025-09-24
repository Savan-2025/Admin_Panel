// src/config/apiConfig.js

export const API_BASE_URL =
// process.env.REACT_APP_API_BASE_URL || "http://192.168.1.25:5002/api/v1";
 //process.env.REACT_APP_API_BASE_URL || "https://realestate.volvrit.org/api/v1";
 process.env.REACT_APP_API_BASE_URL || "https://api.saajra.com/api/v1";

export const API_BASE_URL_Image =
 //process.env.REACT_APP_API_BASE_URL || "http://192.168.1.25:5002";
//process.env.REACT_APP_API_BASE_URL || "https://realestate.volvrit.org";
 process.env.REACT_APP_API_BASE_URL || "https://api.saajra.com/api/v1";


const API_ENDPOINTS = {
  // ------------------ AUTH ------------------ //
  LOGIN: `${API_BASE_URL}/auth/login`,
  CLIENT_LOGIN: `${API_BASE_URL}/auth/client-login`,
  REGISTER: `${API_BASE_URL}/auth/register`,

  // ------------------ USERS ------------------ //
  USERS: `${API_BASE_URL}/users`,
  ALLUSERS: `${API_BASE_URL}/users`,

  // ------------------ COMPANIES & PROJECTS ------------------ //
  COMPANIES: `${API_BASE_URL}/companies`,
  PROJECTS_BY_COMPANY: (companyId) =>
    `${API_BASE_URL}/projects/company/${companyId}`,
  PROJECT: (projectId) => `${API_BASE_URL}/projects/${projectId}`,
  PROJECTS: `${API_BASE_URL}/projects`,

  // ------------------ PROPERTIES ------------------ //
  CREATE_PROPERTY: (companyId) =>
    `${API_BASE_URL}/properties/company/${companyId}`, // ✅ Now tied to company instead of project
  PROPERTIES_BY_COMPANY: (companyId) =>
    `${API_BASE_URL}/properties/company/${companyId}`,
  PROPERTIES_BY_PROJECT: (projectId) =>
    `${API_BASE_URL}/properties/project/${projectId}`, // still available if project filter is used
  PROPERTY: (propertyId) => `${API_BASE_URL}/properties/${propertyId}`,
  ALL_PROPERTIES: `${API_BASE_URL}/properties/all`,

  // ------------------ SALESPERSONS ------------------ //
  // ✅ Get salespersons by company (and optional project)
  SALESPERSONS_BY_COMPANY: (companyId) =>
    `${API_BASE_URL}/auth/salespersons?companyId=${companyId}`,
  SALESPERSONS_BY_COMPANY_PROJECT: (companyId, projectId) =>
    `${API_BASE_URL}/auth/salespersons?companyId=${companyId}&projectId=${projectId}`,

  // ------------------ PAYMENTS ------------------ //
  PAYMENTS: `${API_BASE_URL}/payment-ledger`,

  // ------------------ INVENTORY & STOCK ------------------ //
  ITEMS: `${API_BASE_URL}/items`,
  STOCKS: `${API_BASE_URL}/stocks`,
  STOCK_BY_ITEM: (itemId) => `${API_BASE_URL}/stocks/item/${itemId}`,

  // ------------------ LEADS ------------------ //
  LEADS: `${API_BASE_URL}/leads`,
  LEADS_STATS: `${API_BASE_URL}/leads/stats`,
  LEADS_BULK_UPLOAD: `${API_BASE_URL}/leads/bulk-upload`,
  LEADS_SYNC_META: `${API_BASE_URL}/leads/sync/meta`,
  LEADS_SYNC_GOOGLE: `${API_BASE_URL}/leads/sync/google`,
  LEADS_ALL_COMPANY: `${API_BASE_URL}/leads/all-company`,

  // ------------------ LEDGER ------------------ //
  LEDGER: `${API_BASE_URL}/payment-ledger`,
  LEDGER_ANALYTICS: `${API_BASE_URL}/ledger/analytics`,
  LEDGER_ANALYTICS_LEAD: (leadId) => `${API_BASE_URL}/ledger/analytics/${leadId}`,



  // ------------------ TRANSACTIONS ------------------ //
  TRANSACTIONS: `${API_BASE_URL}/transactions`,

  // ------------------ SITES ------------------ //
  SITES: `${API_BASE_URL}/sites`,
  SITES_ANALYTICS: `${API_BASE_URL}/sites/analytics`,
  SITES_ANALYTICS_SITE: `${API_BASE_URL}/sites/analytics/{siteId}`,
  // ------------------ ITEMS ------------------ //
  ITEMS: `${API_BASE_URL}/items`,

  // ------------------ SUBADMINS ------------------ //
  SUBADMINS: `${API_BASE_URL}/subadmins`,
  SUBADMIN: (id) => `${API_BASE_URL}/subadmins/${id}`,
  SUBADMIN_PERMISSIONS: (id) => `${API_BASE_URL}/subadmins/${id}/permissions`,

  // ------------------ PERMISSIONS ------------------ //
  USER_PERMISSIONS: `${API_BASE_URL}/permissions/me`,
  // ------------------ UPDATE PASSWORD ------------------ //
  UPDATE_PASSWORD: `${API_BASE_URL}/auth/update-password`,
  // ------------------ CONTACT ------------------ //
  CONTACT: `${API_BASE_URL}/contact`,
  // ------------------ PUNCH ------------------ //
  PUNCH: `${API_BASE_URL}/punch`,
  TotalSiteVisits: `${API_BASE_URL}/punch/total-site-visits`,


  
 
};


export default API_ENDPOINTS;
