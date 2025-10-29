const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const calculateBtn = document.getElementById('calculateBtn');
const resultDiv = document.getElementById('result');

calculateBtn.addEventListener('click', () => {
  const weight = parseFloat(weightInput.value);
  const heightCm = parseFloat(heightInput.value);

  if (!weight || !heightCm || weight <= 0 || heightCm <= 0) {
    resultDiv.textContent = "Please enter valid weight and height.";
    resultDiv.style.color = "red";
    return;
  }

  const heightM = heightCm / 100;
  const bmi = (weight / (heightM * heightM)).toFixed(1);

  const category = getBMICategory(bmi);

  resultDiv.innerHTML = `
    Your BMI is <strong>${bmi}</strong> — <span style="color:${category.color}">${category.label}</span>
  `;
});

// Helper function: determine BMI category
function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight ", color: "#1E90FF" };
  if (bmi < 24.9) return { label: "Normal ", color: "#28a745" };
  if (bmi < 29.9) return { label: "Overweight ", color: "#ffc107" };
  return { label: "Obese ", color: "#dc3545" };
}
