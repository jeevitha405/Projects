//   User Registration
if (document.getElementById("registerBtn")) {
    document.getElementById("registerBtn").addEventListener("click", function () {
        const newUsername = document.getElementById("newUsername").value;
        const newPassword = document.getElementById("newPassword").value;

        if (newUsername === "" || newPassword === "") {
            alert("Please enter a valid username and password.");
            return;
        }

        // Save user details to localStorage
        localStorage.setItem("user_" + newUsername, JSON.stringify({ password: newPassword }));
        //alert("Registration successful! Please log in.");
        window.location.href = "login.html";
    });
}

//   User Login
if (document.getElementById("loginBtn")) {
    document.getElementById("loginBtn").addEventListener("click", function () {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const storedUser = JSON.parse(localStorage.getItem("user_" + username));

        if (storedUser && storedUser.password === password) {
            localStorage.setItem("loggedInUser", username); // Set session
            //alert("Login Successful!");
            window.location.href = "index1.html"; // Redirect to To-Do List
        } else {
            alert("Invalid Username or Password!");
        }
    });
}

//   Logout Functionality
if (document.getElementById("logoutBtn")) {
    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("loggedInUser");
        alert("Logged out successfully!");
        window.location.href = "login.html";
    });
}