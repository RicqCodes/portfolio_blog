import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, User, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password);
      navigate("/posts");
    } catch {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.3),transparent_50%)]" />
      </div>

      {/* Floating shapes - hidden on mobile for better performance */}
      <div className="hidden sm:block absolute top-20 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="hidden sm:block absolute top-40 right-20 w-72 h-72 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="hidden sm:block absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-4 sm:p-6 lg:p-4">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Branding - Hidden on mobile, shown on larger screens */}
          <div className="text-white space-y-6 sm:space-y-8 hidden lg:block">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">System Online</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-7xl font-bold leading-tight tracking-tight">
                  Editorial
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                    Console
                  </span>
                </h1>
                <p className="text-xl text-white/70 max-w-md">
                  Powerful content management system for modern creators and publishers
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <span className="text-sm text-white/90">Rich Text Editor</span>
                </div>
                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <span className="text-sm text-white/90">Media Library</span>
                </div>
                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <span className="text-sm text-white/90">Live Preview</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div className="bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-white/20">
              <div className="space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg sm:text-xl">RQ</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg">RICQCODES</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Admin Portal</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Sign in to access your dashboard</p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="username" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600" />
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      {...register("username")}
                      className={`w-full h-11 sm:h-12 px-3 sm:px-4 bg-gray-50 border rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        errors.username ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Enter your username"
                      autoComplete="username"
                      aria-invalid={errors.username ? "true" : "false"}
                      aria-describedby={errors.username ? "username-error" : undefined}
                    />
                    {errors.username && (
                      <p id="username-error" className="text-xs sm:text-sm text-red-600" role="alert">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600" />
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      {...register("password")}
                      className={`w-full h-11 sm:h-12 px-3 sm:px-4 bg-gray-50 border rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        errors.password ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={errors.password ? "true" : "false"}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    {errors.password && (
                      <p id="password-error" className="text-xs sm:text-sm text-red-600" role="alert">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 sm:h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Access Dashboard</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="pt-5 sm:pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    All access attempts are monitored and logged
                  </p>
                </div>
              </div>
            </div>

            {/* Version info */}
            <p className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-white/60 font-medium">
              RICQCODES ADMIN v2.4
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
