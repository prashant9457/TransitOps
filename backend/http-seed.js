const users = [
  { name: 'Admin', email: 'admin@transitops.com', password: 'Password123!', role: 'ADMIN' },
  { name: 'Fleet Manager', email: 'fleet@transitops.com', password: 'Password123!', role: 'FLEET_MANAGER' },
  { name: 'Driver', email: 'driver@transitops.com', password: 'Password123!', role: 'DRIVER' },
  { name: 'Safety Officer', email: 'safety@transitops.com', password: 'Password123!', role: 'SAFETY_OFFICER' },
  { name: 'Financial Analyst', email: 'finance@transitops.com', password: 'Password123!', role: 'FINANCIAL_ANALYST' },
];

async function seed() {
  for (const user of users) {
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`Successfully registered: ${user.email}`);
      } else {
        console.log(`Failed to register ${user.email}: ${data.message || JSON.stringify(data)}`);
      }
    } catch (e) {
      console.log(`Error registering ${user.email}: ${e.message}`);
    }
  }
}

seed();
