function validateLogin() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  if (!email || !pass) {
    alert("Please fill in all fields!");
    return false;
  }
  return true;
}

function validateRegister() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  if (!name || !email || !pass || !confirm) {
    alert("All fields are required!");
    return false;
  }

  if (pass !== confirm) {
    alert("Passwords do not match!");
    return false;
  }

  return true;
}
