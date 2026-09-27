/**
 * POWERZONE : GYM & SPORTS STORE
 * Members Database Module (Supabase PostgreSQL Member Profiles Table CRUD)
 */

(function() {
  const db = window.PowerZoneDB;
  if (!db) {
    console.error('PowerZoneDB not initialized before members-db.js');
    return;
  }

  /**
   * 6. SYNC MEMBER PROFILE: Inserts/updates user profiles in 'member_profiles'
   * @param {Object} profileData 
   * @returns {Promise<Object>}
   */
  db.syncMemberProfile = async function(profileData) {
    try {
      const memberId = profileData.id || ('PZ-MEM-' + Math.floor(10000 + Math.random() * 90000));
      const fullName = (profileData.full_name || profileData.fullName || profileData.name || 'Member').trim();
      const phone = (profileData.phone || profileData.mobile || '9876543210').trim().replace(/\D/g, '');
      const email = profileData.email ? profileData.email.trim().toLowerCase() : null;
      const diet = profileData.diet_preference || profileData.dietPreference || 'Both / Flexible';
      const goal = profileData.training_goal || profileData.goal || 'General Fitness';
      const city = profileData.city || 'Shirdi';

      const payload = {
        id: memberId,
        full_name: fullName,
        phone: phone,
        email: email,
        diet_preference: diet,
        training_goal: goal,
        city: city
      };

      const client = this.getClient();
      let result;

      if (client) {
        const { data, error } = await client
          .from('member_profiles')
          .upsert([payload], { onConflict: 'id' })
          .select();

        if (error) throw error;
        result = data && data[0] ? data[0] : payload;
      } else {
        const data = await this.restRequest('member_profiles', {
          method: 'POST',
          prefer: 'resolution=merge-duplicates,return=representation',
          body: payload
        });
        result = Array.isArray(data) && data[0] ? data[0] : payload;
      }

      console.log('✅ Supabase: Member profile synced:', result.id);
      return result;
    } catch (err) {
      console.error('❌ Supabase syncMemberProfile failed:', err);
      return profileData;
    }
  };
})();
