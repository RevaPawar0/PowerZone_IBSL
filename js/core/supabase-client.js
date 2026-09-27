/**
 * POWERZONE : GYM & SPORTS STORE
 * Supabase Client Initialization & Core Database Gateway
 * Regional Hub: Shirdi (Nagar-Manmad Highway), Maharashtra
 */

const SUPABASE_URL = "https://clcmpfzzhmrnqoydnwoi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsY21wZnp6aG1ybnFveWRud29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTgxNTUsImV4cCI6MjEwMzA3NDE1NX0.dbJpi4KATdWc3jDElwg45vL6n8QR-abDbfvPLL6tqYM";

class SupabaseService {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_ANON_KEY;
    this.client = null;
    this.init();
  }

  init() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      this.client = window.supabase.createClient(this.url, this.key);
      console.log('⚡ PowerZone: Supabase JS SDK v2 client initialized successfully.');
    } else {
      console.warn('⚠️ Supabase JS SDK not yet loaded in window. SupabaseService will use REST fallback if needed.');
    }
  }

  getClient() {
    if (!this.client && window.supabase && typeof window.supabase.createClient === 'function') {
      this.client = window.supabase.createClient(this.url, this.key);
    }
    return this.client;
  }

  // REST API Direct Fallback Executor
  async restRequest(endpoint, options = {}) {
    const headers = {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      ...(options.headers || {})
    };

    const res = await fetch(`${this.url}/rest/v1/${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Supabase REST Error (${res.status}): ${errorText}`);
    }

    if (res.status === 204) return null;
    return await res.json();
  }

  openAdminTerminal() {
    window.location.href = 'portal.html';
  }

  closeAdminTerminal() {
    const modal = document.getElementById('adminTerminalModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

// Global Singleton Instance & Interface
window.PowerZoneDB = window.PowerZoneDB || new SupabaseService();
window.pzDB = window.PowerZoneDB;
