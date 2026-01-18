import { supabase } from './supabase.js';

const form = document.getElementById('submit');
const listDiv = document.getElementById('list-div');
const errorBox = document.getElementById('error-box');
const API_BASE = 'https://fighter-tracker.onrender.com';

const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const authLoginButton = document.getElementById('login-button');
const authSignupButton = document.getElementById('signup-button');
const authLogoutButton = document.getElementById('logout-button');
const authStatusDiv = document.getElementById('auth-status');
const formSection = document.getElementById('forms');
const protectedDiv = document.getElementById('protected');

document.getElementById('auth-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = event.target.email.value.trim();
  const password = event.target.password.value.trim();







  //Signup event listener
  const { error } = await signUp(email, password);
  if (error) {
    showError(error.message || 'Signup failed');
    return;
  }

  // Success feedback
  authStatusDiv.textContent = 'Sign up successful! Check your email to confirm.';
  await updateAuthUI();
});

//User sign up:

async function signUp(email, password){                           //Calls the 'signUp' method from Supabase authentication API to signup a user via email/password
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password
  })

  if (error){
    let errorMessage = "Sign up failed, please try again.";
    showError(errorMessage);
  }

  return { data, error};
}

//User sign in:

async function signIn(email, password){                              //Calls the 'signIn' method from the Supabase auth API.
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })

  if (error) {
    let errorMessage = "Login failed, please try again.";
    showError(errorMessage)
  }
  

  return { data, error};
}

//Update the UI based on logon state:

async function updateAuthUI(){
  console.log('updateAuthUI called');

  try{
     const { data: { session } } = await supabase.auth.getSession();
     console.log('Session:', session);


       if (session) {
    console.log('User is logged in');
    authStatusDiv.textContent = `Logged in as ${session.user.email}`;
    authLogoutButton.style.display = 'inline-block';
    authLoginButton.style.display = 'none';
    authSignupButton.style.display = 'none';

    if (protectedDiv) protectedDiv.style.display = 'block';

    // load protected data only when logged in
    await loadFighters();
  } else {
    console.log('No session found');
    authStatusDiv.textContent = 'Not logged in.';
    authLogoutButton.style.display = 'none';
    authLoginButton.style.display = 'inline-block';
    authSignupButton.style.display = 'inline-block';

    if (protectedDiv) protectedDiv.style.display = 'none';

    // clear sensitive UI
    if (listDiv) listDiv.textContent = '';
    if (errorBox) errorBox.textContent = '';
  }
  } catch(err){
    console.error('getSession threw an error:', err);
  }

  
  

}


//Login event listener:
authLoginButton.addEventListener('click', async () => {
  showError('');
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value.trim();

  const { error } = await signIn(email, password);
  if (error) {
    showError(error.message || 'Login failed');
    return
  }
  await updateAuthUI();
});





//Logout function: 
authLogoutButton.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    showError(error.message || 'Logout failed');
    return;
  }
  await updateAuthUI();
});


//Runs updatAuthUI using the onAuthStateChange method from supabase:
supabase.auth.onAuthStateChange(async () => {
  await updateAuthUI();
});


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

// Handle form submit then POST to server
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

    // Get the current logged in user's session:
  const { data: { session } } = await supabase.auth.getSession();   //Calling the getSession method from supabase API to check if user is logged in and get their info.

  if (!session){
    showError('Must be logged in to add fighter');
    return;
  }


  try {
    const response = await fetch(API_BASE + '/fighters',  { //Makes an HTTP fetch request to API_BASE /fighters, then POST to create a new fighter on the server
  method: 'POST',
  headers: {                                              //Sets the HTTP headers (including the auth token)
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`  // Sends an access token to the backend so it can verify the user is logged in and allowed to perform the action.
  },
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
    showError('Could not reach server.');
    console.error('Network or server error:', error);
  }
});

// Run updateAuthUI when the page loads
window.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded');

    // Check what's in localStorage
  console.log('localStorage keys:', Object.keys(localStorage));
  for (const key of Object.keys(localStorage)) {
    if (key.includes('supabase') || key.includes('sb-')) {
      console.log(`${key}:`, localStorage.getItem(key));
    }
  }


  await updateAuthUI();

});