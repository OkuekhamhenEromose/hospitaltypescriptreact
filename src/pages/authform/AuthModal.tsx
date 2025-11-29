// components/AuthModal.tsx - Updated with image upload
import React, { useState } from "react";
import { X, Upload, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import type { LoginData } from "../../services/auth";
import { apiService } from "../../services/api"; // Add this import

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
  profile_pix?: File | null;
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
      profile_pix: null,
    }),
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setFormData(prev => ({ ...prev, profile_pix: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append("username", formData.username.trim());
        formDataToSend.append("email", formData.email.trim());
        formDataToSend.append("password1", formData.password1);
        formDataToSend.append("password2", formData.password2);
        formDataToSend.append("fullname", formData.fullname.trim());
        formDataToSend.append("phone", formData.phone?.trim() || "");
        formDataToSend.append("gender", formData.gender?.trim() || "M");
        formDataToSend.append("role", formData.role?.trim() || "PATIENT");
        
        if (formData.profile_pix) {
          formDataToSend.append("profile_pix", formData.profile_pix);
        }

        console.log("Sending registration data with image");

        await apiService.registerWithImage(formDataToSend);
        
        // You'll need to update your API service to handle FormData
        // const response = await fetch("http://localhost:8000/api/users/register/", {
        //   method: "POST",
        //   body: formDataToSend,
        // });

        // if (!response.ok) {
        //   const errorData = await response.json();
        //   throw new Error(errorData.detail || JSON.stringify(errorData));
        // }

        // const data = await response.json();
        
        // Auto-login after registration
        const loginData: LoginData = {
          username: formData.username,
          password: formData.password1 || "",
        };
        await login(loginData);
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
    setPreviewImage(null);
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
        profile_pix: null,
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

            {/* Profile Image Upload - Only for Registration */}
            {!isLogin && (
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                    <Upload className="w-4 h-4" />
                    <span>Upload Profile Image</span>
                  </div>
                </label>
                <p className="text-xs text-gray-500 text-center">
                  JPG, PNG or GIF • Max 5MB
                </p>
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