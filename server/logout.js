// Frontend logout function
function logout() {
    localStorage.removeItem('token');  // Remove the JWT token from storage
    alert('Logged out successfully');
}


