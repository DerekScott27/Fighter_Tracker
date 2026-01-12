const form = document.getElementById('submit');
const listDiv = document.getElementById('list-div');
const errorBox = document.getElementById('error-box');


// Helper to show errors if errorBox exists
function showError(text) {
  if (errorBox) {
    errorBox.textContent = text;
  } else {
    console.error(text);
  }
}

// Load and display fighters from the server
async function loadFighters() {
  listDiv.textContent = 'Loading...';
  showError('');

  try {
    const response = await fetch(`${API_BASE}/fighters`);

    if (!response.ok) {
      showError('Error loading fighters from server.');
      listDiv.textContent = '';
      return;
    }

    const fighters = await response.json();
    listDiv.textContent = '';

    if (!Array.isArray(fighters) || fighters.length === 0) {
      listDiv.textContent = 'No fighters yet.';
      return;
    }

    fighters.forEach(function (fighter) {
      const item = document.createElement('article');
      item.className = 'fighter-card';

      let attributesText = 'None';
      if (Array.isArray(fighter.attributes) && fighter.attributes.length > 0) {
        attributesText = fighter.attributes.join(', ');
      }

      let createdText = '';
  if (fighter.created_at) {
    createdText = new Date(fighter.created_at).toLocaleString();
  }

  // Build structured content
  item.innerHTML = `
    <header class="fighter-header">
      <h3 class="fighter-name">${fighter.name}</h3>
      <span class="fighter-discipline">${fighter.discipline}</span>
    </header>

    <div class="fighter-body">
      <p class="fighter-record">
        <strong>Record:</strong> ${fighter.record || 'N/A'}
      </p>
      <p class="fighter-attributes">
        <strong>Attributes:</strong> ${attributesText}
      </p>
      <p class="fighter-analysis">
        <strong>Analysis:</strong> ${fighter.analysis || 'No analysis yet.'}
      </p>
    </div>

    <footer class="fighter-footer">
      ${createdText ? `<span class="fighter-created">Created: ${createdText}</span>` : ''}
    </footer>
  `;

  listDiv.appendChild(item);
});

  } catch (error) {
    showError('Could not reach server. Is it running?');
    listDiv.textContent = '';
    console.error('Network error loading fighters:', error);
  }
}

// Handle form submit -> POST to server
form.addEventListener('submit', async function (event) {
  event.preventDefault();
  showError('');

  const name = document.getElementById('name').value.trim();
  const discipline = document.getElementById('discipline').value.trim();
  const record = document.getElementById('record').value.trim();
  const analysis = document.getElementById('analysis').value.trim();

  // collect checked checkboxes named "attributes"
  const checkedBoxes = document.querySelectorAll('input[name="attributes"]:checked');

  const attributes = [];
  checkedBoxes.forEach(function (checkbox) {
    attributes.push(checkbox.value);
  });

  const fighter = {
    name: name,
    discipline: discipline,
    record: record,
    analysis: analysis,
    attributes: attributes
  };

  try {
    const response = await fetch(API_BASE + '/fighters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fighter)
    });

    const data = await response.json();

    if (!response.ok) {
      if (data && data.errors && Array.isArray(data.errors)) {
        showError(data.errors.join(' '));
      } else {
        showError(data.error || 'Error saving fighter');
      }
      return;
    }

    // success: clear form and reload list
    form.reset();
    await loadFighters();

  } catch (error) {
    showError('Could not reach server. Is it running?');
    console.error('Network or server error:', error);
  }
});

// Load fighters when the page loads
window.addEventListener('DOMContentLoaded', loadFighters);