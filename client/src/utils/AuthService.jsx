const AuthService = {
  login: async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        window.dispatchEvent(new Event("authChange")); 
        return true;
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChange")); 
  },

  isAuthenticated: () => !!localStorage.getItem("token"),
};

export default AuthService;
