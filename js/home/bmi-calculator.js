/**
 * POWERZONE : GYM & SPORTS STORE
 * BMI & Maintenance Calorie Calculator (Home Page)
 */

document.addEventListener('DOMContentLoaded', () => {
  bindBmiCalculatorEvents();
});

function bindBmiCalculatorEvents() {
  const form = document.getElementById('bmiCalculatorForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const weight = parseFloat(document.getElementById('bmiWeight').value);
    const height = parseFloat(document.getElementById('bmiHeight').value);
    const age = parseInt(document.getElementById('bmiAge').value) || 25;
    const activity = document.getElementById('bmiActivity').value || 'moderate';

    if (!weight || !height || height <= 0 || weight <= 0) {
      if (window.showToast) window.showToast('Invalid Input', 'Please enter valid height and weight.', 'crimson');
      return;
    }

    const heightM = height / 100;
    const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));

    let category = 'Normal Weight';
    let categoryClass = 'badge-green';
    let program = 'Iron & Alloy Powerlifting';
    let planDesc = 'Focus on progressive overload barbell compounds (Squat, Bench, Deadlift) and functional strength.';
    let fillPercent = 50;

    if (bmi < 18.5) {
      category = 'Underweight';
      categoryClass = 'badge-cyan';
      program = 'Burn & Build Hypertrophy';
      planDesc = 'Hypertrophy resistance training paired with clean caloric surplus to build dense athletic muscle.';
      fillPercent = 25;
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      category = 'Normal / Athletic Range';
      categoryClass = 'badge-green';
      program = 'Iron & Alloy Powerlifting';
      planDesc = 'Optimal body composition. Push for powerlifting PRs and high-octane agility training.';
      fillPercent = 50;
    } else if (bmi >= 25.0 && bmi <= 29.9) {
      category = 'Overweight / Bulking';
      categoryClass = 'badge-gold';
      program = 'Burn & Build Metabolic HIIT';
      planDesc = 'High-energy interval conditioning, SkiErg circuits, and calorie deficits to incinerate stubborn fat.';
      fillPercent = 75;
    } else {
      category = 'High Body Mass Index';
      categoryClass = 'badge-crimson';
      program = 'Velocity 30 & Reset Mobility';
      planDesc = 'Low-impact cardiovascular intervals combined with joint mobility and steam recovery.';
      fillPercent = 90;
    }

    // Calculate BMR & Target Maintenance Calories (Mifflin-St Jeor)
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    let activityMult = 1.4; // moderate
    if (activity === 'sedentary') activityMult = 1.2;
    if (activity === 'athlete') activityMult = 1.75;
    const dailyCalories = Math.round(bmr * activityMult);

    const resultBox = document.getElementById('bmiResultContainer');
    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div class="bmi-result-box">
          <span class="badge ${categoryClass}" style="margin-bottom: 0.5rem;">${category}</span>
          <div class="bmi-score-number">${bmi} <span style="font-size: 1rem; font-weight: 600; color: var(--text-muted);">BMI</span></div>
          
          <div class="bmi-bar-track">
            <div class="bmi-bar-fill" style="width: ${fillPercent}%;"></div>
          </div>

          <div class="bmi-metric-grid">
            <div class="bmi-mini-card">
              <div class="bmi-mini-val">${dailyCalories.toLocaleString('en-IN')} kcal</div>
              <div class="bmi-mini-label">Est. Daily Calorie Target</div>
            </div>
            <div class="bmi-mini-card">
              <div class="bmi-mini-val" style="color: var(--secondary);">${program.split(' ')[0]}</div>
              <div class="bmi-mini-label">Recommended Discipline</div>
            </div>
          </div>

          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; text-align: left; margin-top: 1rem;">
            <h4 style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.25rem;">Program Blueprint: ${program}</h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${planDesc}</p>
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.25rem;">
            <button class="btn btn-primary btn-sm" onclick="window.pzModalMgr.closeModal('bmiCalculatorModal'); window.pzModalMgr.openTrialBooking('${program.split(' ')[0]}');">
              Book Free Trial for ${program.split(' ')[0]}
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.pzModalMgr.closeModal('bmiCalculatorModal');">
              Done
            </button>
          </div>
        </div>
      `;

      if (window.showToast) {
        window.showToast('BMI Calculated', `Score: ${bmi} (${category}) • Calorie Target: ${dailyCalories} kcal`, 'success');
      }
    }
  });
}
