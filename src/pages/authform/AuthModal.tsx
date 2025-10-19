// components/AuthModal.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import type { LoginData, RegisterData } from "../../services/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AuthFormData {
  username: string;
  password?: string;
  password1?: string;
  password2?: string;
  email?: string;
  fullname?: string;
  phone?: string;
  gender?: string;
  role?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
    username: "",
    password: "",
    ...(!isLogin && {
      email: "",
      password1: "",
      password2: "",
      fullname: "",
      phone: "",
      gender: "",
      role: "PATIENT",
    }),
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        if (!formData.password) {
          throw new Error("Password is required");
        }

        const loginData: LoginData = {
          username: formData.username,
          password: formData.password,
        };
        await login(loginData);
      } else {
        // Validate all required fields for registration
        if (
          !formData.email ||
          !formData.password1 ||
          !formData.password2 ||
          !formData.fullname
        ) {
          throw new Error("All fields are required");
        }

        // Ensure passwords match
        if (formData.password1 !== formData.password2) {
          throw new Error("Passwords do not match");
        }

        // Create the exact data structure expected by the backend
        const registerData: RegisterData = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password1: formData.password1,
          password2: formData.password2,
          fullname: formData.fullname.trim(),
          phone: formData.phone?.trim() || "",
          gender: formData.gender?.trim() || "M", // Default to Male if not selected
          role: formData.role?.trim() || "PATIENT",
        };

        console.log("Sending registration data:", registerData);
        await register(registerData);
      }
      onClose();
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    if (isLogin) {
      setFormData((prev) => ({
        username: prev.username,
        email: "",
        password1: "",
        password2: "",
        fullname: "",
        phone: "",
        gender: "",
        role: "PATIENT",
      }));
    } else {
      setFormData((prev) => ({
        username: prev.username,
        password: prev.password1 || "",
      }));
    }
  };

  const getPasswordValue = () => {
    return isLogin ? formData.password || "" : formData.password1 || "";
  };

  const getPasswordFieldName = () => {
    return isLogin ? "password" : "password1";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-bold">
            {isLogin ? "Sign In" : "Create Account"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname || ""}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Role and Gender in a 2-column grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role || "PATIENT"}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PATIENT">Patient</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="NURSE">Nurse</option>
                      <option value="LAB">Lab Scientist</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name={getPasswordFieldName()}
                value={getPasswordValue()}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="password2"
                  value={formData.password2 || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="p-4 border-t bg-gray-50 space-y-3 flex-shrink-0">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm font-medium"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={switchMode}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
