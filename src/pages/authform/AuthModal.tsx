// components/AuthModal.tsx - Updated with image upload
import React, { useEffect, useState } from "react";
import { X, Upload, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import type { LoginData } from "../../services/auth";
import { apiService } from "../../services/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Add these interfaces
interface SocialAuthUrls {
  google: string;
  facebook: string;
  linkedin: string;
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

// Social Login Icons Component
const SocialIcons = () => {
  return (
    <>
      {/* Google Icon */}
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>

      {/* Facebook Icon */}
      <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>

      {/* LinkedIn Icon */}
      <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    </>
  );
};

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
  const [socialUrls, setSocialUrls] = useState<SocialAuthUrls | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSocialAuthUrls();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fetchSocialAuthUrls = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users/social-auth-urls/');
      const data = await response.json();
      setSocialUrls(data);
    } catch (error) {
      console.error('Failed to fetch social auth URLs:', error);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (socialUrls) {
      window.location.href = socialUrls[provider as keyof SocialAuthUrls];
    }
  };

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
          <div className="p-4 space-y-4">
            {/* Social Login Section */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full inline-flex justify-center py-2 px-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                  title="Sign in with Google"
                >
                  <SocialIcons />
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full inline-flex justify-center py-2 px-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                  title="Sign in with Facebook"
                >
                  <SocialIcons />
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('linkedin')}
                  className="w-full inline-flex justify-center py-2 px-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                  title="Sign in with LinkedIn"
                >
                  <SocialIcons />
                </button>
              </div>
              
              {/* Social Login Labels */}
              <div className="grid grid-cols-3 gap-3 text-xs text-gray-500 text-center -mt-1">
                <span>Google</span>
                <span>Facebook</span>
                <span>LinkedIn</span>
              </div>
            </div>

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
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm font-medium transition-colors"
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
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
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