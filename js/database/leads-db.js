/**
 * POWERZONE : GYM & SPORTS STORE
 * Leads Database Module (Supabase PostgreSQL Leads Table CRUD)
 */

(function() {
  const db = window.PowerZoneDB;
  if (!db) {
    console.error('PowerZoneDB not initialized before leads-db.js');
    return;
  }

  /**
   * 5. CREATE LEAD: Inserts an inquiry/pass into the 'leads' table
   * @param {Object} leadData 
   * @returns {Promise<Object>}
   */
  db.createLead = async function(leadData) {
    try {
      const leadId = leadData.id || ('PZ-LEAD-' + Math.floor(10000 + Math.random() * 90000));
      const name = (leadData.name || leadData.fullName || leadData.full_name || 'VIP Member').trim();
      const phone = (leadData.phone || leadData.mobile || '9876543210').trim().replace(/\D/g, '');
      const preferredSlot = (leadData.preferred_slot || leadData.preferredSlot || leadData.timeSlot || leadData.branch || leadData.date || 'Morning (06:00 AM)').trim();
      const goal = (leadData.goal || leadData.training_goal || 'General Fitness & Stamina').trim();

      const payload = {
        id: leadId,
        name: name,
        phone: phone,
        preferred_slot: preferredSlot,
        goal: goal
      };

      const client = this.getClient();
      let result;

      if (client) {
        const { data, error } = await client
          .from('leads')
          .insert([payload])
          .select();

        if (error) throw error;
        result = data && data[0] ? data[0] : payload;
      } else {
        const data = await this.restRequest('leads', {
          method: 'POST',
          body: payload
        });
        result = Array.isArray(data) && data[0] ? data[0] : payload;
      }

      console.log('✅ Supabase: Lead created successfully:', result.id);
      return result;
    } catch (err) {
      console.error('❌ Supabase createLead failed:', err);
      return leadData;
    }
  };

  /**
   * FETCH ALL LEADS: Retrieves all inquiries from 'leads' ordered by created_at DESC
   * @returns {Promise<Array>}
   */
  db.fetchAllLeads = async function() {
    try {
      const client = this.getClient();
      let records = [];

      if (client) {
        const { data, error } = await client
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        records = data || [];
      } else {
        records = await this.restRequest('leads?order=created_at.desc') || [];
      }

      return records;
    } catch (err) {
      console.error('❌ Supabase fetchAllLeads failed:', err);
      return [];
    }
  };
})();
