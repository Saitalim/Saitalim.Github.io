const salesForm = document.getElementById('salesForm');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const ctx = document.getElementById('salesChart').getContext('2d');
const tableBody = document.querySelector('#salesTable tbody');

let salesData = JSON.parse(localStorage.getItem('salesData')) || {};

let chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Сумма продаж',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

function updateChart() {
  chart.data.labels = Object.keys(salesData);
  chart.data.datasets[0].data = Object.values(salesData);
  chart.update();
  updateTable();
}

salesForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const category = categoryInput.value.trim();
  const amount = parseFloat(amountInput.value);
  if (!category || isNaN(amount)) return;
  if (salesData[category]) {
    salesData[category] += amount;
  } else {
    salesData[category] = amount;
  }
  localStorage.setItem('salesData', JSON.stringify(salesData));
  updateChart();
  salesForm.reset();
});

function updateTable() {
  tableBody.innerHTML = '';
  for (const [category, amount] of Object.entries(salesData)) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${category}</td>
      <td>${amount.toFixed(2)}</td>
      <td>
        <button onclick="editEntry('${category}')">✏️</button>
        <button onclick="deleteEntry('${category}')">🗑️</button>
      </td>
    `;
    tableBody.appendChild(row);
  }
}

function deleteEntry(category) {
  if (confirm(`Удалить категорию "${category}"?`)) {
    delete salesData[category];
    localStorage.setItem('salesData', JSON.stringify(salesData));
    updateChart();
  }
}

function editEntry(category) {
  const newAmount = prompt(`Новая сумма для "${category}":`, salesData[category]);
  const parsed = parseFloat(newAmount);
  if (!isNaN(parsed)) {
    salesData[category] = parsed;
    localStorage.setItem('salesData', JSON.stringify(salesData));
    updateChart();
  }
}

document.getElementById('exportBtn').addEventListener('click', function () {
  let csv = 'Категория,Сумма\n';
  for (const [category, amount] of Object.entries(salesData)) {
    csv += `${category},${amount.toFixed(2)}\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sales.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

updateChart();
